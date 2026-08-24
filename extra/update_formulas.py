import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

def update_excel_formulas():
    file_path = "Kaapan_Stock_Ledger_Template.xlsx"
    try:
        wb = openpyxl.load_workbook(file_path)
    except PermissionError:
        print("ERROR: Permission Denied. Please make sure the Excel file is CLOSED before running this script.")
        return
    except Exception as e:
        print(f"Error loading workbook: {e}")
        return

    print("Workbook loaded successfully. Starting update...")
    
    font_family = "Segoe UI"
    header_font_white = Font(name=font_family, size=10, bold=True, color="FFFFFF")
    header_font_bold = Font(name=font_family, size=10, bold=True, color="000000")
    data_font = Font(name=font_family, size=10, color="000000")
    data_font_bold = Font(name=font_family, size=10, bold=True, color="000000")
    
    blue_header_fill = PatternFill(start_color="2F5597", end_color="2F5597", fill_type="solid")
    blue_sub_fill = PatternFill(start_color="D9E1F2", end_color="D9E1F2", fill_type="solid")
    
    thin_side = Side(style='thin', color='BFBFBF')
    thin_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
    
    align_center = Alignment(horizontal='center', vertical='center', wrap_text=True)
    align_left = Alignment(horizontal='left', vertical='center')
    align_right = Alignment(horizontal='right', vertical='center')

    # 1. Update Detailed_Ledger
    ws_ledger = wb["Detailed_Ledger"]
    
    # We update formulas for Rows 5 to 100
    for r in range(5, 101):
        # Column G (Rough Size): =IF(F5>0, E5/F5, "")
        ws_ledger.cell(row=r, column=7, value=f'=IF(F{r}>0, E{r}/F{r}, "")').alignment = align_right
        
        # Column K (MK Size): =IF(J5>0, I5/J5, "")
        ws_ledger.cell(row=r, column=11, value=f'=IF(J{r}>0, I{r}/J{r}, "")').alignment = align_right
        
        # Column L (Exp R to P %): =J5/F5
        ws_ledger.cell(row=r, column=12, value=f'=IF(F{r}>0, J{r}/F{r}, "")').alignment = align_right
        ws_ledger.cell(row=r, column=12).number_format = "0.00%"
        
        # Column O (4P + %): =100%-(J5/N5)
        ws_ledger.cell(row=r, column=15, value=f'=IF(AND(N{r}>0, J{r}>0), 1 - (J{r}/N{r}), "")').alignment = align_right
        ws_ledger.cell(row=r, column=15).number_format = "0.00%"
        
        # Column Q (RT %): =P5/N5
        ws_ledger.cell(row=r, column=17, value=f'=IF(N{r}>0, P{r}/N{r}, "")').alignment = align_right
        ws_ledger.cell(row=r, column=17).number_format = "0.00%"
        
        # Column T (R to P % Actual): =R5/F5
        ws_ledger.cell(row=r, column=20, value=f'=IF(F{r}>0, R{r}/F{r}, "")').alignment = align_right
        ws_ledger.cell(row=r, column=20).number_format = "0.00%"
        
        # Column U (Variation %): =L5-T5
        ws_ledger.cell(row=r, column=21, value=f'=IF(AND(L{r}<>"", T{r}<>""), L{r}-T{r}, "")').alignment = align_right
        ws_ledger.cell(row=r, column=21).number_format = "0.00%"
        
        # Column V (Rough Amount): =F5*H5
        ws_ledger.cell(row=r, column=22, value=f'=IF(AND(F{r}>0, H{r}>0), F{r}*H{r}, "")').alignment = align_right
        ws_ledger.cell(row=r, column=22).number_format = "₹#,##0"
        
        # Column W (Mfg Cost): =IF(S5>0, S5*65, 0)
        ws_ledger.cell(row=r, column=23, value=f'=IF(S{r}>0, S{r}*65, 0)').alignment = align_right
        ws_ledger.cell(row=r, column=23).number_format = "₹#,##0"
        
        # Column X (Total Cost): =IF(V5<>"", V5+W5, "")
        ws_ledger.cell(row=r, column=24, value=f'=IF(V{r}<>"", V{r}+W{r}, "")').alignment = align_right
        ws_ledger.cell(row=r, column=24).number_format = "₹#,##0"
        
        # Column Y (Padtar): =IF(R5>0, ROUND(ROUND(X5,-2)/R5,-1), "")
        ws_ledger.cell(row=r, column=25, value=f'=IF(R{r}>0, ROUND(ROUND(X{r},-2)/R{r},-1), "")').alignment = align_right
        ws_ledger.cell(row=r, column=25).number_format = "₹#,##0"
        
        # Column Z (Total Loss Cts): =SUM(AG5, AM5, ...)
        ws_ledger.cell(row=r, column=26, value=f'=SUM(AG{r},AM{r},AS{r},AY{r},BE{r},BK{r},BQ{r},BW{r})').alignment = align_right
        ws_ledger.cell(row=r, column=26).number_format = "0.00"
        
        # Column AA (Total Loss Pcs): =I5-S5 (MK Pcs - Polish Pcs)
        ws_ledger.cell(row=r, column=27, value=f'=IF(AND(I{r}>0, S{r}>0), I{r}-S{r}, "")').alignment = align_right
        ws_ledger.cell(row=r, column=27).number_format = "#,##0"

    print("Detailed_Ledger formulas updated.")

    # 2. Update Polish_Chart
    ws_chart = wb["Polish_Chart"]
    
    # Make sure cell B3 has a valid default Kapan No to link
    ws_chart["B3"] = "M-3-20"
    ws_chart["B3"].alignment = align_center
    ws_chart["B3"].font = data_font_bold
    
    # We use INDEX/MATCH to pull values dynamically based on B3
    match_str = "MATCH($B$3, Detailed_Ledger!$D$5:$D$100, 0)"
    
    # Rough Name D3
    ws_chart["D3"] = f'="રફ નામ :- " & IFERROR(INDEX(Detailed_Ledger!$C$5:$C$100, {match_str}), "")'
    ws_chart["D3"].alignment = align_left
    ws_chart["D3"].font = header_font_bold
    
    # Date G3
    ws_chart["G3"] = f'="તારીખ :- " & TEXT(IFERROR(INDEX(Detailed_Ledger!$P$5:$P$100, {match_str}), P10), "yyyy-mm-dd")'
    ws_chart["G3"].alignment = align_left
    ws_chart["G3"].font = header_font_bold

    # Table values
    ws_chart["B10"] = f'=IFERROR(INDEX(Detailed_Ledger!$F$5:$F$100, {match_str}), "")' # કાચું વજન (Rough Wt)
    ws_chart["B11"] = f'=IFERROR(INDEX(Detailed_Ledger!$G$5:$G$100, {match_str}), "")' # રફ સાઇઝ (Rough Size)
    ws_chart["B13"] = f'=IFERROR(INDEX(Detailed_Ledger!$L$5:$L$100, {match_str}), "")' # માંગેલું વજન % (Req Wt %)
    ws_chart["B14"] = f'=IFERROR(INDEX(Detailed_Ledger!$O$5:$O$100, {match_str}), "")' # 4P %
    ws_chart["B15"] = f'=IFERROR(INDEX(Detailed_Ledger!$Q$5:$Q$100, {match_str}), "")' # RT %
    
    # તૈયાર ગુણાકાર % = Polish Weight / RT OK Weight
    ws_chart["B16"] = f'=IFERROR(INDEX(Detailed_Ledger!$R$5:$R$100, {match_str}) / INDEX(Detailed_Ledger!$P$5:$P$100, {match_str}), "")'
    ws_chart["B16"].number_format = "0.00%"
    
    ws_chart["B17"] = f'=IFERROR(INDEX(Detailed_Ledger!$T$5:$T$100, {match_str}), "")' # રફ TO પોલીસ % (Actual %)
    ws_chart["B18"] = f'=IFERROR(INDEX(Detailed_Ledger!$U$5:$U$100, {match_str}), "")' # વેરીએશન % (Var %)
    
    # વજન ફોર્મ્યુલા = B10 * Rough Rate
    ws_chart["B19"] = f'=IFERROR(B10 * INDEX(Detailed_Ledger!$H$5:$H$100, {match_str}), "")'
    ws_chart["B19"].number_format = "₹#,##0"
    
    # G - નંગ = Polish Pcs
    ws_chart["B20"] = f'=IFERROR(INDEX(Detailed_Ledger!$S$5:$S$100, {match_str}), "")'
    ws_chart["B20"].number_format = "#,##0"

    # Bottom Fields
    # Polish Cts cell (C24)
    ws_chart["C24"] = f'=IFERROR(INDEX(Detailed_Ledger!$R$5:$R$100, {match_str}), "")'
    ws_chart["C24"].number_format = "0.00"
    
    # Polish Pcs cell (A24)
    ws_chart["A24"] = f'=IFERROR(INDEX(Detailed_Ledger!$S$5:$S$100, {match_str}), "")'
    ws_chart["A24"].number_format = "#,##0"
    
    # Padtar cell (E24)
    ws_chart["E24"] = f'=IFERROR(INDEX(Detailed_Ledger!$Y$5:$Y$100, {match_str}), "")'
    ws_chart["E24"].number_format = "₹#,##0"

    # Number Formats for Galaxy Details
    for row_num in [10, 11, 13, 14, 15, 17, 18]:
        ws_chart[f"B{row_num}"].number_format = "0.00%" if row_num in [13, 14, 15, 17, 18] else "0.00"

    print("Polish_Chart dynamic formulas set up.")

    # 3. Process Dates & Days Calculations (Columns O-P)
    # Header
    ws_chart.merge_cells("O9:P9")
    ws_chart["O9"] = "પ્રોસેસ તારીખ વિગત (Process Dates)"
    ws_chart["O9"].font = header_font_white
    ws_chart["O9"].fill = blue_header_fill
    ws_chart["O9"].alignment = align_center
    
    # Date entry fields
    dates_metadata = [
        ("કાપણ શરૂઆત (Kapan Created)", "2026-08-04"),
        ("ગેલેક્ષી પૂર્ણ (Galaxy Out / AP In)", "2026-08-05"),
        ("એસોર્ટમેન્ટ પૂર્ણ (AP OK Out / 4P In)", "2026-08-06"),
        ("4P પૂર્ણ (4P Out / RT In)", "2026-08-07"),
        ("RT પૂર્ણ (RT Out / Khata In)", "2026-08-08"),
        ("ખાતા પૂર્ણ (OK KAPAN / Complete)", "2026-08-10")
    ]
    
    for idx, (label, default_val) in enumerate(dates_metadata, start=10):
        cell_lbl = ws_chart.cell(row=idx, column=15, value=label)
        cell_lbl.font = header_font_bold
        cell_lbl.fill = blue_sub_fill
        cell_lbl.border = thin_border
        
        cell_val = ws_chart.cell(row=idx, column=16, value=default_val)
        cell_val.font = data_font
        cell_val.alignment = align_center
        cell_val.border = thin_border
        cell_val.number_format = "yyyy-mm-dd"
        
    for r in range(9, 16):
        ws_chart.cell(row=r, column=15).border = thin_border
        ws_chart.cell(row=r, column=16).border = thin_border
        
    # Set Days calculations in Row 7
    # G7 (એસોર્ટ): AP OK Days
    ws_chart["G7"] = '=IF(AND(P11>0, P12>0), ROUND(P12-P11, 1), 0)'
    # H7 (ગેલેક્સી): Galaxy Days
    ws_chart["H7"] = '=IF(AND(P10>0, P11>0), ROUND(P11-P10, 1), 0)'
    # I7 (4P): 4P Days
    ws_chart["I7"] = '=IF(AND(P12>0, P13>0), ROUND(P13-P12, 1), 0)'
    # J7 (R-T): RT Days
    ws_chart["J7"] = '=IF(AND(P13>0, P14>0), ROUND(P14-P13, 1), 0)'
    # K7 (રી એસોર્ટ): 0 (Not applicable/not in flow)
    ws_chart["K7"] = 0
    # L7 (ખાતા): Khata Days
    ws_chart["L7"] = '=IF(AND(P14>0, P15>0), ROUND(P15-P14, 1), 0)'
    # M7 (જમા): Total Days
    ws_chart["M7"] = '=IF(AND(P10>0, P15>0), ROUND(P15-P10, 1), 0)'
    
    # Apply styling & number formats to days row
    for col_idx in [7, 8, 9, 10, 11, 12, 13]:
        cell = ws_chart.cell(row=7, column=col_idx)
        cell.font = data_font_bold
        cell.alignment = align_center
        cell.number_format = "0.0"
        cell.border = thin_border
        
    ws_chart.column_dimensions["O"].width = 30
    ws_chart.column_dimensions["P"].width = 18

    # Save workbook
    try:
        wb.save(file_path)
        print(f"Workbook successfully updated and saved to: {file_path}")
    except PermissionError:
        print("ERROR: Permission Denied. Please close 'Kaapan_Stock_Ledger_Template.xlsx' and run again.")

if __name__ == "__main__":
    update_excel_formulas()
