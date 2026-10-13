let chart, series, legendEl, label = "", last = null, digits = 5;

const C = { bg: "#131722", text: "#d1d4dc", grid: "#1e222d", border: "#2a2e39", up: "#26a69a", down: "#ef5350" };

export function initChart(el, legend) {
  legendEl = legend;
  chart = LightweightCharts.createChart(el, {
    layout: {
      background: { type: "solid", color: C.bg },
      textColor: C.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
      fontSize: 12,
    },
    grid: { vertLines: { color: C.grid }, horzLines: { color: C.grid } },
    crosshair: {
      mode: 0,
      vertLine: { color: "#758696", width: 1, style: 3, labelBackgroundColor: "#2a2e39" },
      horzLine: { color: "#758696", width: 1, style: 3, labelBackgroundColor: "#2a2e39" },
    },
    rightPriceScale: { borderColor: C.border, scaleMargins: { top: 0.1, bottom: 0.1 } },
    timeScale: {
      borderColor: C.border,
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 12,
      barSpacing: 8,
      minBarSpacing: 0.3,
    },
    watermark: {
      visible: true,
      text: "",
      fontSize: 56,
      horzAlign: "center",
      vertAlign: "center",
      color: "rgba(209,212,220,0.06)",
    },
  });

  series = chart.addCandlestickSeries({
    upColor: C.up,
    downColor: C.down,
    borderVisible: false,
    wickUpColor: C.up,
    wickDownColor: C.down,
  });

  chart.subscribeCrosshairMove((p) => {
    const bar = p.time ? p.seriesData.get(series) : null;
    renderLegend(bar || last);
  });

  new ResizeObserver(() => chart.applyOptions({ width: el.clientWidth, height: el.clientHeight })).observe(el);
}

function renderLegend(b) {
  if (!b) { legendEl.textContent = label; return; }
  const col = b.close >= b.open ? C.up : C.down;
  const f = (v) => v.toFixed(digits);
  const chg = ((b.close - b.open) / b.open) * 100;
  legendEl.innerHTML =
    `<b>${label}</b> <span style="color:${col}">O ${f(b.open)} H ${f(b.high)} L ${f(b.low)} C ${f(b.close)} (${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%)</span>`;
}

export function setSymbol(symbol, interval) {
  digits = symbol.includes("JPY") ? 3 : symbol.startsWith("XAU") ? 2 : 5;
  series.applyOptions({ priceFormat: { type: "price", precision: digits, minMove: 1 / 10 ** digits } });
  chart.applyOptions({ watermark: { text: symbol } });
  label = `${symbol} · ${interval}`;
}

export function setData(candles, initial = true) {
  series.setData(candles);
  last = candles[candles.length - 1] || null;
  renderLegend(last);
  if (initial && candles.length) {
    const n = candles.length;
    chart.timeScale().setVisibleLogicalRange({ from: Math.max(0, n - 150), to: n + 12 });
  }
}

export function update(c) {
  series.update(c);
  last = c;
  renderLegend(c);
}

export const getRange = () => chart.timeScale().getVisibleLogicalRange();
export const setRange = (r) => chart.timeScale().setVisibleLogicalRange(r);
export const onRange = (cb) => chart.timeScale().subscribeVisibleLogicalRangeChange(cb);