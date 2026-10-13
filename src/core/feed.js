export async function fetchCandles(symbol, interval, count = 5000, endTime) {
  let url = `/api/candles?symbol=${encodeURIComponent(symbol)}&interval=${interval}&count=${count}`;
  if (endTime) {
    const d = new Date(endTime * 1000).toISOString().slice(0, 19).replace("T", " ");
    url += `&end_date=${encodeURIComponent(d)}`;
  }
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