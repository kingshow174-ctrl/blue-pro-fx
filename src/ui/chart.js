let chart, series;

export function initChart(el) {
  chart = LightweightCharts.createChart(el, {
    layout: { background: { color: "#0b1220" }, textColor: "#8fa3c7" },
    grid: { vertLines: { color: "#142039" }, horzLines: { color: "#142039" } },
    timeScale: { timeVisible: true, borderColor: "#1d2b47" },
    rightPriceScale: { borderColor: "#1d2b47" },
  });
  series = chart.addCandlestickSeries({
    upColor: "#22c55e", downColor: "#ef4444",
    borderUpColor: "#22c55e", borderDownColor: "#ef4444",
    wickUpColor: "#22c55e", wickDownColor: "#ef4444",
  });
  new ResizeObserver(() => chart.applyOptions({ width: el.clientWidth, height: el.clientHeight })).observe(el);
  return { chart, series };
}

export function setCandles(candles) {
  series.setData(candles);
  chart.timeScale().fitContent();
}