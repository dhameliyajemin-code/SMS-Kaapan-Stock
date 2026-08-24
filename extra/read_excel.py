import openpyxl
import sys

def inspect_excel():
    try:
        wb = openpyxl.load_workbook("Kaapan_Stock_Ledger_Template.xlsx", data_only=False)
        wb_val = openpyxl.load_workbook("Kaapan_Stock_Ledger_Template.xlsx", data_only=True)
    except Exception as e:
        print(f"Error loading workbook: {e}")
        return
        
    out = []
    out.append("Sheets in workbook: " + str(wb.sheetnames))
    
    for name in wb.sheetnames:
        out.append(f"\n--- SHEET: {name} ---")
        ws = wb[name]
        ws_val = wb_val[name]
        
        # We scan up to row 100 and col 100 to capture everything
        for r in range(1, 101):
            row_cells = []
            for c in range(1, 100):
                cell_formula = ws.cell(row=r, column=c)
                cell_val = ws_val.cell(row=r, column=c)
                
                if cell_formula.value is not None:
                    formula_str = str(cell_formula.value)
                    val_str = str(cell_val.value)
                    col_letter = openpyxl.utils.get_column_letter(c)
                    
                    if formula_str.startswith("="):
                        row_cells.append(f"{col_letter}{r}: [Formula] {formula_str} (Value: {val_str})")
                    else:
                        row_cells.append(f"{col_letter}{r}: {formula_str} (Value: {val_str})")
            
            if row_cells:
                out.append(f"Row {r}: " + " | ".join(row_cells))
                
    with open("extra/excel_inspection.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print("Inspection completed successfully. Output written to extra/excel_inspection.txt")

if __name__ == "__main__":
    inspect_excel()
