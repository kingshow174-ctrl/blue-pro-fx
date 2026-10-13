import { fetchCandles } from "./core/feed.js";
import { initChart, setCandles } from "./ui/chart.js";

const $ = (id) => document.getElementById(id);
initChart($("chart"));

async function load() {
  $("status").textContent = "Loading...";
  try {
    const candles = await fetchCandles($("symbol").value, $("interval").value);
    setCandles(candles);
    $("status").textContent = `${candles.length} candles`;
  } catch (e) {
    $("status").textContent = e.message;
  }
}

$("load").addEventListener("click", load);
load();