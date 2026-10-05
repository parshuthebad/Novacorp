import { useEffect, useState } from "react";

function download(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text]));
  a.download = name;
  a.click();
}

export default function App() {
  const [rows, setRows] = useState([]);
  const [target, setTarget] = useState("South");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/sample").then((r) => r.json()).then(setRows).catch(() => setError("Could not load sample data. Is the server running?"));
  }, []);

  async function run(limit) {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: limit ? rows.slice(0, limit) : rows, target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Run failed");
      setResult(data);
    } catch (e) { setError(e.message); }
    setBusy(false);
  }

  async function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const text = await f.text();
    const res = await fetch(`/api/run-csv?target=${encodeURIComponent(target)}`, { method: "POST", headers: { "Content-Type": "text/csv" }, body: text });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setError(""); setResult(data); setRows(data.results.map(({ status, message, ...r }) => r));
  }

  function exportCsv() {
    const q = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v);
    const lines = ["CustomerID,Name,Email,Phone,Region,Status,Message", ...result.results.map((r) => [r.id, r.name, r.email, r.phone, r.region, r.status, r.message].map(q).join(","))];
    download("customers_result.csv", lines.join("\n"));
  }

  const list = result ? result.results : rows.map((r) => ({ ...r, status: "", message: "" }));
  return (
    <div>
      <h1>NovaCorp Bot</h1>
      <div className="card row">
        <label>Target region <input value={target} onChange={(e) => setTarget(e.target.value)} /></label>
        <button disabled={busy} onClick={() => run(3)}>Run 3 rows</button>
        <button disabled={busy} onClick={() => run(0)}>Run all {rows.length}</button>
        <label className="ghost">Upload CSV <input type="file" accept=".csv" onChange={onFile} /></label>
        {result && <button className="ghost" onClick={exportCsv}>Download results</button>}
        {result && <button className="ghost" onClick={() => download("bot_log.txt", result.log)}>Download log</button>}
        {result && <button className="ghost" onClick={() => download("run_report.txt", result.report)}>Download report</button>}
      </div>
      {error && <p className="err">{error}</p>}
      {result && (
        <div className="counts">
          {["Done", "Failed", "Skipped"].map((k) => (<div key={k}><b className={k}>{result.counts[k]}</b>{k}</div>))}
        </div>
      )}
      <div className="card scroll" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Region</th><th>Status</th><th>Message</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}><td>{r.id}</td><td>{r.name}</td><td>{r.email || "(blank)"}</td><td>{r.region}</td><td className={r.status}>{r.status}</td><td>{r.message}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {result && <div className="card"><pre>{result.log}</pre></div>}
    </div>
  );
}
