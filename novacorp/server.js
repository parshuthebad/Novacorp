const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { runBot, parseCsv, toRows } = require("./botLogic");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.text({ type: ["text/csv", "text/plain"], limit: "5mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/sample", (_req, res) => {
  const text = fs.readFileSync(path.join(__dirname, "..", "data", "customers.csv"), "utf8");
  res.json(toRows(parseCsv(text)));
});

app.post("/api/run", (req, res) => {
  const { rows, target } = req.body || {};
  if (!Array.isArray(rows)) return res.status(400).json({ error: "rows must be an array" });
  res.json(runBot(rows, target));
});

app.post("/api/run-csv", (req, res) => {
  if (typeof req.body !== "string" || !req.body.trim()) return res.status(400).json({ error: "Send CSV text as the body" });
  try {
    const rows = toRows(parseCsv(req.body));
    if (!rows.length) return res.status(400).json({ error: "No data rows found" });
    res.json(runBot(rows, req.query.target));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Serve the built React app if present, otherwise the plain web demo.
const dist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(fs.existsSync(dist) ? dist : path.join(__dirname, "..", "web")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NovaCorp bot server on http://localhost:${PORT}`));
