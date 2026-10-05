"""
NovaCorp Final Project - reference bot (logic prototype)

Mirrors the 6-step flow from the course slides:
  1 Read Excel -> 2 Loop Rows -> 3 Check Region -> 4 Web Entry -> 5 Catch Errors -> 6 Log Result

Layers: Data Foundation (1-2), Intelligence (3), Action (4), Resilience (5-6).

The "web portal" here is a mock class so you can verify the logic end to end.
In Automation Anywhere, replace MockPortal.add_customer() with the Recorder actions.

Run:  python novacorp_bot.py [customers.xlsx] [max_rows]
      e.g. python novacorp_bot.py customers.xlsx 3     # test with 3 rows first
"""
import sys
from datetime import datetime
from openpyxl import load_workbook

TARGET_REGION = "south"


class DuplicateCustomerError(Exception):
    pass


class MissingFieldError(Exception):
    pass


class MockPortal:
    """Stands in for the web portal. Rejects duplicates by email, like a real portal might."""

    def __init__(self):
        self.customers = {}

    def add_customer(self, name, email, phone):
        if not name or not email:
            raise MissingFieldError("Name and Email are required")
        if email.lower() in self.customers:
            raise DuplicateCustomerError(f"Customer already exists: {email}")
        self.customers[email.lower()] = (name, phone)


def log(fh, line):
    stamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    fh.write(f"{stamp} | {line}\n")
    print(line)


def write_report(counts, failures, total, path="run_report.txt"):
    """Report generation: summary of the run plus the rows a human must review."""
    lines = ["NovaCorp Bot Run Report",
             f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
             f"Rows processed: {total}",
             f"Done: {counts['Done']}  Failed: {counts['Failed']}  Skipped: {counts['Skipped']}",
             "", "Rows needing review:"]
    lines += [f"- ID {i} | {n} | {m}" for i, n, m in failures] or ["None"]
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")


def run(path="customers.xlsx", max_rows=None):
    portal = MockPortal()
    counts = {"Done": 0, "Failed": 0, "Skipped": 0}
    failures = []

    # Step 1: Read Excel (Layer 1)
    wb = load_workbook(path)
    ws = wb["Customers"]
    headers = [c.value for c in ws[1]]
    idx = {h: i for i, h in enumerate(headers)}
    status_col = len(headers) + 1
    ws.cell(row=1, column=status_col, value="Status")

    with open("bot_log.txt", "w", encoding="utf-8") as fh:
        log(fh, "=== Run started ===")
        processed = 0
        # Step 2: Loop rows
        for r in range(2, ws.max_row + 1):
            if max_rows is not None and processed >= max_rows:
                break
            row = [ws.cell(row=r, column=c + 1).value for c in range(len(headers))]
            cid = row[idx["CustomerID"]]
            name = (row[idx["Name"]] or "").strip()
            email = (row[idx["Email"]] or "").strip()
            phone = row[idx["Phone"]]
            region = (row[idx["Region"]] or "").strip().lower()
            processed += 1

            # Step 3: Check region (Layer 3). Trim + ignore case.
            if region != TARGET_REGION:
                status, msg = "Skipped", f"region={region or 'blank'}"
            else:
                # Step 4 + 5: Web entry inside Try/Catch (Layers 2 and 4)
                try:
                    portal.add_customer(name, email, phone)
                    status, msg = "Done", ""
                except (DuplicateCustomerError, MissingFieldError) as e:
                    status, msg = "Failed", str(e)
                except Exception as e:  # never leave Catch empty; log anything unexpected
                    status, msg = "Failed", f"Unexpected: {e}"

            # Step 6: Log result for every row
            counts[status] += 1
            if status == "Failed":
                failures.append((cid, name or "(no name)", msg))
            ws.cell(row=r, column=status_col, value=status)
            log(fh, f"ID {cid} | {name or '(no name)'} | {status} | {msg}")

        log(fh, f"=== Run finished: {counts} ===")

    # Always release the file (course tip: close Excel)
    wb.save("customers_result.xlsx")
    wb.close()
    write_report(counts, failures, processed)
    return counts, portal


if __name__ == "__main__":
    p = sys.argv[1] if len(sys.argv) > 1 else "customers.xlsx"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else None
    run(p, n)
