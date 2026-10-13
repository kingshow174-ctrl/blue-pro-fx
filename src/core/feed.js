import { CONFIG } from "../config.js";

export async function fetchCandles(symbol, interval, count = CONFIG.CANDLES) {
  const url = new URL("https://api.twelvedata.com/time_series");
  url.search = new URLSearchParams({
    symbol,
    interval,
    outputsize: count,
    order: "ASC",
    timezone: "UTC",
    apikey: CONFIG.TWELVE_DATA_KEY,
  });

  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "error" || !data.values) {
    throw new Error(data.message || "Twelve Data request failed");
  }

  return data.values.map((v) => ({
    time: Math.floor(Date.parse(v.datetime.replace(" ", "T") + (v.datetime.length > 10 ? "Z" : "T00:00:00Z")) / 1000),
    open: +v.open,
    high: +v.high,
    low: +v.low,
    close: +v.close,
  }));
}