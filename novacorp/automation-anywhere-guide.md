# Building the bot in Automation Anywhere (A360)

The graded bot is built in Automation Anywhere with the Recorder. The code in this repo is a logic prototype and demo.

## Variables
`vFilePath`, `vName`, `vEmail`, `vRegion`, `vStatus`, `vErrorMsg` (all String)

## Flow
1. **Excel Advanced > Open** the customer file (session name `Customers`, tick "contains header").
2. **Loop > Each row in worksheet**. Read Name, Email, Region into variables.
3. **If** `vRegion` equals `South` (trim spaces, ignore case). Else branch: `vStatus = "Skipped"`.
4. **Try**: Browser > Open the portal. Use the Recorder to type `$vName$`, `$vEmail$` and click Save. After Save, check for the "already exists" message and use **Throw** if present. Set `vStatus = "Done"`.
5. **Catch**: `vStatus = "Failed"`, store the error message in `vErrorMsg`. Never leave Catch empty.
6. **Log to file** `Name | Status | ErrorMsg | Timestamp` for every row, after the Try/Catch.
7. After the loop: close the browser and **Close** the Excel session.

## Cheatsheet extras: file handling, validations, report
- **Validations:** before the web entry, check that Name and Email are not empty (If). Do not guess missing values; log them as Failed.
- **File handling:** after the loop, use **Files, Folders > Copy** to move `customers.xlsx` into a `Processed` folder (or rename it with the date).
- **Report generation:** write a summary (Done / Failed / Skipped counts, and the rows needing review) to a report file with **Log to file**, or to a second Excel sheet with **Excel Advanced > Set cell**. Keep counters in Number variables (`vDone`, `vFailed`, `vSkipped`) and add 1 to the right one for every row.

Wrap the stages in named Steps (Read Excel, Process Customer, Write Log).

## Test before the full run
Run 2-3 rows, add a duplicate on purpose, include a row with a missing field and a non-South region, check the log, then run all 50.

## Evaluation checklist
- Reads all customers from the Excel file
- Loops through every row automatically
- Checks the region with an If condition
- Enters details into the web portal
- Catches duplicate entries without crashing
- Writes a clear log of every result
