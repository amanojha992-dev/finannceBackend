import express from "express";
import { getFundamentals } from "../services/googleSheets.service.js";
import { calculatePortfolio } from "../utils/calculations.js";
import { getAllStocks } from "../services/stock.service.js";

const router = express.Router();

/**
 * GET /api/portfolio
 * Builds live portfolio using DB stocks
 */
router.get("/", async (req, res) => {
  try {
    const stocks = await getAllStocks();
    console.log("fetched stocks for portfolio:", stocks);

    if (!stocks || stocks.length === 0) {
      return res.json([]);
    }

    /* ---------- Collect symbols ---------- */
    const symbols = stocks.map((s) => s.symbol);

    /* ---------- Get CMP + PE + EPS ---------- */
    const fundamentals = await getFundamentals(symbols);

    /* ---------- Attach market data ---------- */
    for (const stock of stocks) {
      stock.cmp = fundamentals?.[stock.symbol]?.cmp ?? null;
      stock.pe  = fundamentals?.[stock.symbol]?.pe ?? null;
      stock.eps = fundamentals?.[stock.symbol]?.eps ?? null;
    }

    /* ---------- Calculate portfolio ---------- */
    const result = calculatePortfolio(stocks);

    return res.json(result);
  } catch (error) {
    console.error("Portfolio API error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
