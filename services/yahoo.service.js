import YahooFinance from "yahoo-finance2";
import { getCachedCMP, setCachedCMP } from "../cache/cmp.cache.js";


const yahooFinance = new YahooFinance();


export async function getCMP(symbol) {
  const yahooSymbol = `${symbol}.NS`;


  const cachedPrice = getCachedCMP(yahooSymbol);
  if (cachedPrice !== null) {
    return cachedPrice;
  }


  const quote = await yahooFinance.quote(yahooSymbol);

  const price =
    typeof quote?.regularMarketPrice === "number"
      ? quote.regularMarketPrice
      : null;

  if (price !== null) {
    setCachedCMP(yahooSymbol, price);
  }

  return price;
}
