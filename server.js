import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.get("/api/candles", async (req, res) => {
  try {
    const { symbol = "EUR/USD", interval = "1h", count = "5000", end_date } = req.query;
    const params = {
      symbol,
      interval,
      outputsize: String(Math.min(+count || 5000, 5000)),
      order: "ASC",
      timezone: "UTC",
      apikey: process.env.TWELVE_DATA_KEY,
    };
    if (end_date) params.end_date = end_date;
    const url = new URL("https://api.twelvedata.com/time_series");
    url.search = new URLSearchParams(params);
    const r = await fetch(url);
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

app.use("/styles", express.static(path.join(__dirname, "styles")));
app.use("/src", express.static(path.join(__dirname, "src")));
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "index.html")));

app.listen(process.env.PORT || 3000, () => console.log("Blue Pro FX running"));