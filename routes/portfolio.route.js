import express from "express";
import { getCMP } from "../services/yahoo.service.js";
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

    if (!stocks || stocks.length === 0) {
      return res.json([]);
    }

    const symbols = stocks.map((s) => s.symbol);


    const fundamentals = await getFundamentals(symbols);


    await Promise.all(
      stocks.map(async (stock) => {
        stock.cmp = await getCMP(stock.symbol);
        stock.pe = fundamentals?.[stock.symbol]?.pe ?? null;
        stock.eps = fundamentals?.[stock.symbol]?.eps ?? null;
      })
    );

  
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
