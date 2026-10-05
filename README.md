# NovaCorp Customer Onboarding Bot

**Live demo:** https://claude.ai/artifact/9yfRaoYN8FeHPjAgU8dCEL

An RPA project built for the *Robotic Process Automation Workshop using Automation Anywhere*. It automates Priya's Monday task at NovaCorp: every week she gets 50 new customers in Excel and types each one into a web portal by hand. That takes 3+ hours and is full of typos.

The bot reads the Excel file, loops through every customer, onboards only the **South** region into the web portal, catches duplicates without crashing, and logs every result.

## Bot flow
**Read Excel > Loop Rows > Check Region > Web Entry > Catch Errors > Log Result**

| Layer | Purpose |
|---|---|
| 1. Data Foundation | Read the Excel file and loop through customers |
| 2. Action Layer | Enter each customer into the web portal |
| 3. Intelligence Layer | Check the region before onboarding |
| 4. Resilience Layer | Catch duplicates and log every result |

## Result on the sample data (50 customers)
- 16 Done
- 2 Failed (a missing email, and a duplicate customer)
- 32 Skipped (not in the South region)

## Features
- Typo-tolerant region matching (for example "Sth" or " south ")
- Email format validation and duplicate detection
- Risk score per row
- Run log and summary report downloads
- Upload your own CSV or Excel file

## Repository structure
```
data/      Sample customers (customers.xlsx, customers.csv)
python/    Reference bot (novacorp_bot.py)
server/    Node.js + Express API, bot logic and tests
client/    React (Vite) front end
web/       Standalone HTML demo and practice portal
docs/      Setup, Automation Anywhere guide, submission checklist
```

## Run it
```bash
# Python bot
pip install openpyxl
cd python && python novacorp_bot.py ../data/customers.xlsx

# Node.js server and tests
cd server && npm install && npm test && npm start
```

## Tech
Automation Anywhere (TaskBot, Recorder, Try/Catch), Python, Node.js, React, HTML/CSS/JavaScript.
