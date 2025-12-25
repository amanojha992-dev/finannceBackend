export function calculatePortfolio(stocks) {
 
  const totalInvestment = stocks.reduce(
    (sum, stock) => sum + stock.purchasePrice * stock.qty,
    0
  );

  return stocks.map((stock) => {
    const investment = stock.purchasePrice * stock.qty;
    const presentValue = stock.cmp * stock.qty;
    const gainLoss = presentValue - investment;
    const portfolioPercent = (investment / totalInvestment) * 100;

    return {
      ...stock,
      investment,
      presentValue,
      gainLoss,
      portfolioPercent,
    };
  });
}
