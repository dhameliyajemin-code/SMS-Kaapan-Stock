import json
import urllib.request
import openpyxl

# 1. READ STATE FROM FIREBASE
url = "https://ng-cost-default-rtdb.firebaseio.com/diamond_stock_system.json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        state = json.loads(response.read().decode('utf-8'))
    print("Successfully read database state from Firebase.")
except Exception as e:
    print(f"Error fetching state from Firebase: {e}")
    exit(1)

# 2. CREATE M-3-20 IN THE DATABASE STATE
# Look for m-2-20 Kapan to copy its details
m2_kapan = next((k for k in state.get("kapans", []) if k.get("kapanNo").lower() == "m-2-20"), None)
if m2_kapan:
    # Check if M-3-20 already exists. If yes, we can remove it first to do a clean overwrite.
    state["kapans"] = [k for k in state.get("kapans", []) if k.get("kapanNo") != "M-3-20"]
    state["transfers"] = [t for t in state.get("transfers", []) if t.get("kapanNo") != "M-3-20"]
    state["polishCharts"] = [pc for pc in state.get("polishCharts", []) if pc.get("kapanNo") != "M-3-20"]
    
    # Create the new M-3-20 Kapan
    m3_kapan = m2_kapan.copy()
    m3_kapan["kapanNo"] = "M-3-20"
    m3_kapan["id"] = "K_M3_20"
    m3_kapan["vigat"] = m2_kapan.get("vigat", "").replace("m-2-20", "M-3-20")
    state["kapans"].append(m3_kapan)
    print("Created Kapan M-3-20 in state.")

    # Copy transfers
    m2_transfers = [t for t in state.get("transfers", []) if t.get("kapanNo").lower() == "m-2-20"]
    for idx, t in enumerate(m2_transfers):
        new_t = t.copy()
        new_t["kapanNo"] = "M-3-20"
        new_t["id"] = f"TR_M3_20_{idx+1}"
        state["transfers"].append(new_t)
    print(f"Copied {len(m2_transfers)} transfers for M-3-20.")

    # Copy polish charts if any
    m2_charts = [pc for pc in state.get("polishCharts", []) if pc.get("kapanNo").lower() == "m-2-20"]
    for idx, pc in enumerate(m2_charts):
        new_pc = pc.copy()
        new_pc["kapanNo"] = "M-3-20"
        new_pc["id"] = f"PC_M3_20_{idx+1}"
        state["polishCharts"].append(new_pc)
    print(f"Copied {len(m2_charts)} polish charts for M-3-20.")
else:
    print("Warning: m-2-20 not found in database to copy from.")

# 3. WRITE UPDATED STATE BACK TO FIREBASE
data_bytes = json.dumps(state).encode('utf-8')
req_put = urllib.request.Request(
    url, 
    data=data_bytes, 
    headers={'Content-Type': 'application/json'},
    method='PUT'
)
try:
    with urllib.request.urlopen(req_put) as response:
        print("Successfully synced updated state (with Kapan M-3-20) to Firebase Realtime Database.")
except Exception as e:
    print(f"Error syncing to Firebase: {e}")

# 4. RESTORE EXCEL DETAILED LEDGER SHEET
wb_path = "Kaapan_Stock_Ledger_Template.xlsx"
try:
    wb = openpyxl.load_workbook(wb_path)
    sheet = wb["Detailed_Ledger"]
except Exception as e:
    print(f"Error opening Excel file: {e}")
    exit(1)

# List of columns to clear in rows 5 to 100
# AB: 28, AH: 34, AN: 40, AT: 46, AZ: 52, BF: 58, BL: 64, BR: 70
DEPT_COLUMNS = [28, 34, 40, 46, 52, 58, 64, 70]
input_cols = [1, 2, 3, 4, 5, 6, 8, 9, 10, 13, 14, 16, 18, 19]
for d_col in DEPT_COLUMNS:
    input_cols.extend([d_col, d_col+1, d_col+2, d_col+3])

print("Restoring row 5 to M-3-20 data and clearing rows 6 to 100...")
# Clear rows 5 to 100 first
for r in range(5, 101):
    for c in input_cols:
        sheet.cell(row=r, column=c).value = None

# Write M-3-20 details to Row 5
sheet.cell(row=5, column=1, value=1)             # A: No.
sheet.cell(row=5, column=2, value="7")           # B: Rough No.
sheet.cell(row=5, column=3, value="hawa 1")      # C: Article Name
sheet.cell(row=5, column=4, value="M-3-20")      # D: Kapan No.
sheet.cell(row=5, column=5, value=1299)          # E: Rough Pcs
sheet.cell(row=5, column=6, value=89.98)         # F: Rough Weight
sheet.cell(row=5, column=8, value=2029)          # H: Rough Rate
sheet.cell(row=5, column=9, value=3711)          # I: MK Pcs
sheet.cell(row=5, column=10, value=31.34)        # J: Exp Wt
sheet.cell(row=5, column=13, value=3693)         # M: 4P Pcs
sheet.cell(row=5, column=14, value=40.11)        # N: 4P Wt
sheet.cell(row=5, column=16, value=39.04)        # P: RT Wt
sheet.cell(row=5, column=18, value=29.54)        # R: Polish Wt
sheet.cell(row=5, column=19, value=3664)         # S: Polish Pcs

# Write department transitions for M-3-20
# Galaxy (Cols 28-31)
sheet.cell(row=5, column=28, value=1299)
sheet.cell(row=5, column=29, value=89.98)
sheet.cell(row=5, column=30, value=3711)
sheet.cell(row=5, column=31, value=89.98)

# AP OK (Cols 34-37)
sheet.cell(row=5, column=34, value=3711)
sheet.cell(row=5, column=35, value=89.95)
sheet.cell(row=5, column=36, value=3705)
sheet.cell(row=5, column=37, value=89.225)

# 4P (Cols 40-43)
sheet.cell(row=5, column=40, value=3705)
sheet.cell(row=5, column=41, value=89.225)
sheet.cell(row=5, column=42, value=3695)
sheet.cell(row=5, column=43, value=40.11)

# 4P OK RT BAAKI (Cols 46-49)
sheet.cell(row=5, column=46, value=3695)
sheet.cell(row=5, column=47, value=40.11)
sheet.cell(row=5, column=48, value=3695)
sheet.cell(row=5, column=49, value=40.11)

# RT (Cols 52-55)
sheet.cell(row=5, column=52, value=3695)
sheet.cell(row=5, column=53, value=40.11)
sheet.cell(row=5, column=54, value=3693)
sheet.cell(row=5, column=55, value=39.038)

# RT OK KHATA BAAKI (Cols 58-61)
sheet.cell(row=5, column=58, value=3693)
sheet.cell(row=5, column=59, value=39.038)
sheet.cell(row=5, column=60, value=3693)
sheet.cell(row=5, column=61, value=39.038)

# KHATA (Cols 64-67)
sheet.cell(row=5, column=64, value=3693)
sheet.cell(row=5, column=65, value=39.038)
sheet.cell(row=5, column=66, value=3664)
sheet.cell(row=5, column=67, value=29.54)

# OK KAPAN (Cols 70-73)
sheet.cell(row=5, column=70, value=3664)
sheet.cell(row=5, column=71, value=29.54)
sheet.cell(row=5, column=72, value=3664)
sheet.cell(row=5, column=73, value=29.54)

# Set Kapan selector B3 on sheet Polish_Chart back to "M-3-20"
try:
    chart_sheet = wb["Polish_Chart"]
    chart_sheet["B3"].value = "M-3-20"
    print("Set Polish_Chart Kapan selector B3 to 'M-3-20'.")
except Exception as e:
    print(f"Error setting Polish_Chart B3: {e}")

try:
    wb.save(wb_path)
    print(f"Successfully reverted Excel workbook and saved to: {wb_path}")
except PermissionError:
    print(f"ERROR: Permission Denied. Please close '{wb_path}' and run again.")
except Exception as e:
    print(f"Error saving workbook: {e}")
