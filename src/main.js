import { fetchCandles } from "./core/feed.js";
import { initChart, setSymbol, setData, update, getRange, setRange, onRange } from "./ui/chart.js";

const $ = (id) => document.getElementById(id);
initChart($("chart"), $("legend"));

const state = { symbol: "EUR/USD", interval: "1h", candles: [], loadingMore: false, exhausted: false, retryAt: 0, token: 0 };
const status = (t) => ($("status").textContent = t);
const count = () => `${state.candles.length.toLocaleString()} candles`;

async function load() {
  const my = ++state.token;
  state.exhausted = false;
  state.loadingMore = false;
  state.retryAt = 0;
  status("Loading...");
  try {
    const c = await fetchCandles(state.symbol, state.interval, 5000);
    if (my !== state.token) return;
    state.candles = c;
    setSymbol(state.symbol, state.interval);
    setData(c, true);
    status(count());
  } catch (e) {
    if (my === state.token) status(e.message);
  }
}

async function loadMore() {
  if (state.loadingMore || state.exhausted || !state.candles.length || Date.now() < state.retryAt) return;
  state.loadingMore = true;
  const my = state.token;
  status("Loading older history...");
  try {
    const older = await fetchCandles(state.symbol, state.interval, 5000, state.candles[0].time - 1);
    if (my !== state.token) return;
    const known = new Set(state.candles.map((c) => c.time));
    const fresh = older.filter((c) => !known.has(c.time));
    if (!fresh.length) {
      state.exhausted = true;
      status(`${count()} (start of history)`);
      return;
    }
    const r = getRange();
    state.candles = fresh.concat(state.candles);
    setData(state.candles, false);
    if (r) setRange({ from: r.from + fresh.length, to: r.to + fresh.length });
    status(count());
  } catch (e) {
    if (my !== state.token) return;
    if (/no data/i.test(e.message)) {
      state.exhausted = true;
      status(`${count()} (start of history)`);
    } else {
      state.retryAt = Date.now() + 30000;
      status(e.message);
    }
  } finally {
    if (my === state.token) state.loadingMore = false;
  }
}

onRange((r) => { if (r && r.from < 100) loadMore(); });

$("symbol").addEventListener("change", (e) => { state.symbol = e.target.value; load(); });

document.querySelectorAll("#tfs button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll("#tfs button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    state.interval = b.dataset.i;
    load();
  })
);

setInterval(async () => {
  if (document.hidden || state.loadingMore || !state.candles.length) return;
  try {
    const recent = await fetchCandles(state.symbol, state.interval, 2);
    for (const c of recent) {
      const l = state.candles[state.candles.length - 1];
      if (c.time < l.time) continue;
      if (c.time === l.time) state.candles[state.candles.length - 1] = c;
      else state.candles.push(c);
      update(c);
    }
  } catch (_) {}
}, 180000);

load();