import { google } from "googleapis";
import {
  getCachedFundamental,
  setCachedFundamental,
} from "../cache/fundamentals.cache.js";

/* ---------------------------------- */
/* Get Google Sheets Client */
/* ---------------------------------- */
async function getSheetsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: authClient,
  });
}

/* ---------------------------------- */
/* Wait until GOOGLEFINANCE resolves */
/* ---------------------------------- */
async function waitForCalculation(
  sheets,
  count,
  maxWaitMs = 8000,
  intervalMs = 700
) {
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Sheet1!A1:C${count}`, // 👈 UPDATED
    });

    const values = res.data.values;

    if (values && values.length === count) {
      return res;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return null;
}

/* ---------------------------------- */
/* Get CMP + PE + EPS */
/* ---------------------------------- */
export async function getFundamentals(symbols) {
  const result = {};
  const missingSymbols = [];

  /* ---------- Check cache ---------- */
  for (const symbol of symbols) {
    const cached = getCachedFundamental(symbol);
    if (cached) {
      result[symbol] = cached;
    } else {
      missingSymbols.push(symbol);
    }
  }

  if (missingSymbols.length === 0) {
    return result;
  }

  const sheets = await getSheetsClient();

  /* ---------- GOOGLEFINANCE formulas ---------- */
  const values = missingSymbols.map((symbol) => [
    `=GOOGLEFINANCE("NSE:${symbol}","price")`, // CMP
    `=GOOGLEFINANCE("NSE:${symbol}","PE")`,
    `=GOOGLEFINANCE("NSE:${symbol}","EPS")`,
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `Sheet1!A1:C${missingSymbols.length}`, // 👈 UPDATED
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  const res = await waitForCalculation(sheets, missingSymbols.length);
  if (!res) return result;

  /* ---------- Parse result ---------- */
  res.data.values.forEach((row, i) => {
    const symbol = missingSymbols[i];

    const data = {
      cmp: row?.[0] ? Number(row[0]) : null,
      pe: row?.[1] ? Number(row[1]) : null,
      eps: row?.[2] ? Number(row[2]) : null,
    };

    setCachedFundamental(symbol, data);
    result[symbol] = data;
  });

  return result;
}
