const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { runBot, parseCsv, toRows, normRegion } = require("./botLogic");

const rows = toRows(parseCsv(fs.readFileSync(path.join(__dirname, "..", "data", "customers.csv"), "utf8")));
assert.strictEqual(rows.length, 50);
const { counts, results } = runBot(rows, "South");
assert.deepStrictEqual(counts, { Done: 16, Failed: 2, Skipped: 32 });
assert.strictEqual(results.find((r) => r.id == 5).status, "Done");   // " south " is trimmed
assert.match(results.find((r) => r.id == 12).message, /required/);   // missing email, not guessed
assert.match(results.find((r) => r.id == 30).message, /already exists/); // duplicate
assert.strictEqual(normRegion("Sth", "south"), "south");
assert.strictEqual(normRegion("South India", "south"), "south");
assert.strictEqual(normRegion("north", "south"), "north");
const rep = runBot(rows, "South").report;
assert.match(rep, /Failed: 2/);
assert.match(rep, /ID 30/);
console.log("All tests passed:", counts);
