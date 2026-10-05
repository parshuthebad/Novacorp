// NovaCorp bot logic: Read -> Loop -> Check Region -> Web Entry (mock) -> Catch Errors -> Log Result
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const REGIONS = ["south", "north", "east", "west"];

function lev(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return m[a.length][b.length];
}

// Typo-tolerant region matching (edit distance <= 2, or prefix such as "south india")
function normRegion(raw, target) {
  const g = String(raw || "").trim().toLowerCase();
  if (!g) return g;
  const list = [...REGIONS, target];
  for (const x of list) if (g.startsWith(x)) return x;
  let best = g, bd = 3;
  for (const x of list) { const d = lev(g, x); if (d < bd) { bd = d; best = x; } }
  return best;
}

function parseCsv(text) {
  const rows = []; let r = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { r.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; r.push(f); f = ""; rows.push(r); r = []; }
    else f += c;
  }
  if (f !== "" || r.length) { r.push(f); rows.push(r); }
  return rows.filter((x) => x.join("").trim() !== "");
}

// Table (header + rows) -> objects. Columns are matched by header name.
function toRows(table) {
  if (table.length < 2) return [];
  const h = table[0].map((x) => String(x).trim().toLowerCase());
  const ix = (names) => names.map((n) => h.indexOf(n)).find((i) => i >= 0) ?? -1;
  const iN = ix(["name", "customer name", "customer"]), iE = ix(["email", "email id", "e-mail"]);
  const iP = ix(["phone", "mobile", "phone number"]), iR = ix(["region", "zone"]), iI = ix(["customerid", "id", "customer id"]);
  if (iN < 0 || iR < 0) throw new Error("Header must include Name and Region columns");
  return table.slice(1).map((r, k) => ({
    id: iI >= 0 && r[iI] ? r[iI] : k + 1,
    name: r[iN] || "", email: iE >= 0 ? r[iE] || "" : "", phone: iP >= 0 ? r[iP] || "" : "", region: r[iR] || "",
  }));
}

function buildReport(counts, results, target) {
  const failed = results.filter((r) => r.status === "Failed");
  return [
    "NovaCorp Bot Run Report", `Generated: ${new Date().toISOString()}`, `Target region: ${target}`,
    `Rows processed: ${results.length}`, `Done: ${counts.Done}  Failed: ${counts.Failed}  Skipped: ${counts.Skipped}`,
    "", "Rows needing review:",
    ...(failed.length ? failed.map((r) => `- ID ${r.id} | ${r.name || "(no name)"} | ${r.message}`) : ["None"]),
  ].join("\n");
}

function runBot(rows, targetRaw = "South") {
  const target = String(targetRaw || "").trim().toLowerCase() || "south";
  const saved = new Map(), seenNP = new Map();
  const counts = { Done: 0, Failed: 0, Skipped: 0 }, results = [], log = [];
  const stamp = () => new Date().toISOString();
  log.push(`${stamp()} | === Run started (${rows.length} rows, target=${target}) ===`);
  for (const r of rows) {
    const name = String(r.name || "").trim(), email = String(r.email || "").trim();
    const region = String(r.region || "").trim().toLowerCase();
    const nr = normRegion(region, target);
    let status, msg = "";
    if (nr !== target) { status = "Skipped"; msg = `region=${region || "blank"}`; }
    else {
      if (nr !== region) msg = `region '${region}' auto-matched to ${target}`;
      try {
        if (!name || !email) throw new Error("Name and Email are required");
        const ek = email.toLowerCase();
        if (saved.has(ek)) throw new Error("Customer already exists");
        if (!EMAIL_RE.test(email)) throw new Error("Invalid email format");
        const nk = `${name}|${r.phone}`.toLowerCase();
        if (seenNP.has(nk) && seenNP.get(nk) !== ek) throw new Error("Possible duplicate (same name and phone, different email)");
        saved.set(ek, { name, phone: r.phone }); seenNP.set(nk, ek); status = "Done";
      } catch (e) { status = "Failed"; msg = e.message; }
    }
    counts[status]++;
    results.push({ ...r, status, message: msg });
    log.push(`${stamp()} | ID ${r.id} | ${name || "(no name)"} | ${status}${msg ? " | " + msg : ""}`);
  }
  log.push(`${stamp()} | === Run finished: ${JSON.stringify(counts)} ===`);
  return { counts, results, log: log.join("\n"), report: buildReport(counts, results, target) };
}

module.exports = { runBot, parseCsv, toRows, normRegion };
