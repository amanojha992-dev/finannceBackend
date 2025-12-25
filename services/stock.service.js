import Stock from "../models/stock.js";


export async function addOrUpdateStock({
  symbol,
  purchasePrice,
  qty,
  exchange = "NSE",
  sector
}) {

  if (!symbol || !purchasePrice || !qty) {
    throw new Error("symbol, purchasePrice and qty are required");
  }

  if (purchasePrice <= 0 || qty <= 0) {
    throw new Error("purchasePrice and qty must be greater than 0");
  }

  
  let stock = await Stock.findOne({ symbol, exchange });


  if (!stock) {
    return await Stock.create({
      symbol,
      purchasePrice,
      qty,
      exchange,
      sector
    });
  }

  
  const totalQty = stock.qty + qty;

  const newAvgPrice =
    (stock.purchasePrice * stock.qty +
      purchasePrice * qty) /
    totalQty;

  stock.qty = totalQty;
  stock.purchasePrice = Number(newAvgPrice.toFixed(2));
  stock.sector = sector;

  await stock.save();
  return stock;
}


export async function getAllStocks() {
  return await Stock.find().sort({ createdAt: -1 }).lean();
}


export async function deleteStock(id) {
  return await Stock.findByIdAndDelete(id);
}