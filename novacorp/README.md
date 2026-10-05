# NovaCorp RPA Final Project

Automation for Priya at NovaCorp: read 50 new customers from Excel, onboard only the **South** region into a web portal, catch duplicates without crashing, and log every result.

Flow: **Read Excel > Loop Rows > Check Region > Web Entry > Catch Errors > Log Result**

| Layer | Purpose |
|---|---|
| 1 Data Foundation | Read the Excel file, loop through customers |
| 2 Action | Enter each customer into the web portal |
| 3 Intelligence | Check the region before onboarding |
| 4 Resilience | Catch duplicates and log every result |

## Repository layout
```
data/      customers.xlsx and customers.csv (50 sample rows with edge cases)
python/    novacorp_bot.py - reference bot (Excel in, Status column and log out)
server/    Node.js + Express API with the bot logic and tests
client/    React (Vite) front end
web/       Standalone HTML demo (index.html) and practice portal (portal.html)
docs/      Automation Anywhere build guide
```
The sample data contains edge cases: a region written as `" south "`, a South row with no email, and a duplicate email.

## Run it

**Python reference bot**
```bash
pip install openpyxl
cd python
cp ../data/customers.xlsx .
python novacorp_bot.py customers.xlsx 3     # test with 3 rows first
python novacorp_bot.py customers.xlsx       # all rows
```
Outputs `bot_log.txt` and `customers_result.xlsx`. Expected on the sample data: Done 16, Failed 2, Skipped 32.

**Node.js server and tests**
```bash
cd server
npm install
npm test        # no dependencies needed for tests
npm start       # http://localhost:3000 (serves web/ demo)
```
API: `GET /api/sample`, `POST /api/run` (`{rows, target}`), `POST /api/run-csv?target=South` (CSV body).

**React client**
```bash
cd client
npm install
npm run dev     # http://localhost:5173 (proxies /api to port 3000, keep the server running)
npm run build   # creates client/dist, which the server then serves
```

**Standalone web demo:** open `web/index.html` in a browser (or host with GitHub Pages). It animates the six steps, accepts your own CSV or Excel file, and downloads results. The AI report button only works inside the Claude app.

## Notes
- The Python, Node and web versions are logic prototypes that use a mock portal. The Automation Anywhere `.bot` is built with the Recorder; see `docs/automation-anywhere-guide.md`.
- Extra checks beyond the course checklist: typo-tolerant region matching, email format validation, and a same-name-and-phone duplicate check.

## Push to GitHub
```bash
git init
git add .
git commit -m "NovaCorp RPA final project"
git branch -M main
git remote add origin https://github.com/<your-username>/novacorp-rpa-bot.git
git push -u origin main
```

## Workshop requirements covered
| Cheatsheet requirement | Where |
|---|---|
| Set up Community Edition, Control Room, Bot Agent, TaskBot | `docs/SETUP.md` |
| Conditions, loops, variables, error handling | Region If, row loop, Try/Catch (`docs/automation-anywhere-guide.md`, all prototypes) |
| Data entry, file handling, validations | Web entry, move processed file, required-field and email checks |
| Report generation | `run_report.txt` from Python, Node API (`report`), React and web demo |
| Submission form, open-access video (5-10 min) | `docs/SUBMISSION.md` with a video script |
