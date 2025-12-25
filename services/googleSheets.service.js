import { google } from "googleapis";
import {
  getCachedFundamental,
  setCachedFundamental,
} from "../cache/fundamentals.cache.js";

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

/* 🔁 Poll until GOOGLEFINANCE values are ready */
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
      range: `Sheet1!A1:B${count}`,
    });

    const values = res.data.values;

    if (values && values.length === count) {
      return res;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return null;
}


export async function getFundamentals(symbols) {
  const result = {};
  const missingSymbols = [];

  /* 1️⃣ Check cache PER SYMBOL */
  for (const symbol of symbols) {
    const cached = getCachedFundamental(symbol);
    if (cached) {
      result[symbol] = cached;
    } else {
      missingSymbols.push(symbol);
    }
  }

  /* 2️⃣ All cached → return immediately */
  if (missingSymbols.length === 0) {
    return result;
  }

  /* 3️⃣ Fetch ONLY missing symbols */
  const sheets = await getSheetsClient();

  const values = missingSymbols.map((symbol) => [
    `=GOOGLEFINANCE("NSE:${symbol}","PE")`,
    `=GOOGLEFINANCE("NSE:${symbol}","EPS")`,
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `Sheet1!A1:B${missingSymbols.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  /* 4️⃣ Wait until values are actually calculated */
  const res = await waitForCalculation(sheets, missingSymbols.length);

  /* 5️⃣ Map rows → symbols + cache */
  res.data.values.forEach((row, i) => {
    const symbol = missingSymbols[i];

    const data = {
      pe: row?.[0] ? Number(row[0]) : null,
      eps: row?.[1] ? Number(row[1]) : null,
    };

    setCachedFundamental(symbol, data);
    result[symbol] = data;
  });

  /* 6️⃣ Return merged (cached + fresh) */
  return result;
}
