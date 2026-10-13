export async function fetchCandles(symbol, interval, count = 300) {
  const url = `/api/candles?symbol=${encodeURIComponent(symbol)}&interval=${interval}&count=${count}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "error" || !data.values) {
    throw new Error(data.message || "Candle request failed");
  }

  return data.values.map((v) => ({
    time: Math.floor(
      Date.parse(v.datetime.replace(" ", "T") + (v.datetime.length > 10 ? "Z" : "T00:00:00Z")) / 1000
    ),
    open: +v.open,
    high: +v.high,
    low: +v.low,
    close: +v.close,
  }));
}