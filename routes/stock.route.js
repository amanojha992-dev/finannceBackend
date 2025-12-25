import express from "express";
import {
  addOrUpdateStock,
  getAllStocks,
  deleteStock
} from "../services/stock.service.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const stock = await addOrUpdateStock(req.body);
    res.status(201).json({
      success: true,
      data: stock
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});


router.get("/", async (req, res) => {
  try {
    const stocks = await getAllStocks();
    res.json({
      success: true,
      data: stocks
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stocks"
    });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const deletedStock = await deleteStock(req.params.id);
    if (!deletedStock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }
    res.json({
      success: true,
      data: deletedStock
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete stock"
    });
  }
});

export default router;
