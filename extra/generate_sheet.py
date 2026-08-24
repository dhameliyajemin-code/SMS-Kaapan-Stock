import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def create_template():
    wb = openpyxl.Workbook()
    
    # ----------------------------------------------------
    # STYLES DEFINITION
    # ----------------------------------------------------
    font_family = "Segoe UI"
    
    # Fonts
    title_font = Font(name=font_family, size=16, bold=True, color="1B365D")
    section_font = Font(name=font_family, size=12, bold=True, color="1F4E79")
    header_font_bold = Font(name=font_family, size=10, bold=True, color="000000")
    header_font_white = Font(name=font_family, size=10, bold=True, color="FFFFFF")
    data_font = Font(name=font_family, size=10, color="000000")
    data_font_bold = Font(name=font_family, size=10, bold=True, color="000000")
    note_font = Font(name=font_family, size=9, italic=True, color="595959")
    instruction_font = Font(name=font_family, size=10, color="333333")
    
    # Fills
    yellow_header_fill = PatternFill(start_color="FFE699", end_color="FFE699", fill_type="solid")  # Yellow for detailed ledger
    yellow_sub_fill = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")
    blue_header_fill = PatternFill(start_color="2F5597", end_color="2F5597", fill_type="solid")   # Blue for polish chart
    blue_sub_fill = PatternFill(start_color="D9E1F2", end_color="D9E1F2", fill_type="solid")
    accent_green_fill = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid") # For total/calculation highlights
    zebra_fill = PatternFill(start_color="F9FBFD", end_color="F9FBFD", fill_type="solid")
    
    # Borders
    thin_side = Side(style='thin', color='BFBFBF')
    thick_side = Side(style='medium', color='000000')
    double_side = Side(style='double', color='000000')
    
    thin_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
    thick_bottom_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thick_side)
    double_right_border = Border(left=thin_side, right=double_side, top=thin_side, bottom=thin_side)
    header_border = Border(left=thin_side, right=thin_side, top=thick_side, bottom=thick_side)
    
    # Alignments
    align_center = Alignment(horizontal='center', vertical='center', wrap_text=True)
    align_left = Alignment(horizontal='left', vertical='center')
    align_right = Alignment(horizontal='right', vertical='center')
    
    # ----------------------------------------------------
    # SHEET 1: DETAILED LEDGER
    # ----------------------------------------------------
    ws_ledger = wb.active
    ws_ledger.title = "Detailed_Ledger"
    ws_ledger.views.sheetView[0].showGridLines = True
    
    # Title Block
    ws_ledger.merge_cells("A1:AA1")
    ws_ledger["A1"] = "કાપણ વાઇઝ વિભાગીય ડિટેઇલ લેજર (Detailed Horizontal Department Ledger)"
    ws_ledger["A1"].font = title_font
    ws_ledger["A1"].alignment = align_left
    ws_ledger.row_dimensions[1].height = 40
    
    # Department Top Header Row (Row 3)
    # We span columns to group department-specific entries
    depts = [
        ("Galaxy (ગેલેક્ષી)", "AB", "AG"),
        ("AP OK (એસોર્ટમેન્ટ પ્લાનિંગ)", "AH", "AM"),
        ("4P (4P લેસર)", "AN", "AS"),
        ("4P OK RT BAAKI (સ્ટોક)", "AT", "AY"),
        ("RT (ગર્ડલ બ્રુટિંગ)", "AZ", "BE"),
        ("RT OK KHATA BAAKI (સ્ટોક)", "BF", "BK"),
        ("KHATA (તળિયું/પહેલ)", "BL", "BQ"),
        ("OK KAPAN (પોલીશ આખરી)", "BR", "BW")
    ]
    
    # Ledger Main Column Headers (Row 4)
    ledger_cols = [
        "નંબર (No.)", "રફ નં (Rough No.)", "આર્ટીકલ નામ (Article)", "કાપણ નં (Kapan No.)",
        "કાચા પીસ (Rough Pcs)", "કાચું વજન (Rough Weight)", "રફ સાઈઝ (Rough Size)", "રફ રેટ (Rough Rate)",
        "MK પીસ (MK Pcs)", "EXP વજન (Exp Wt)", "MK સાઈઝ (MK Size)", "રફ to પોલીશ % (Exp %)",
        "4P પીસ (4P Pcs)", "4P ok વજન (4P Wt)", "4P + %", "RT ok વજન (RT Wt)", "RT %",
        "પોલીશ વજન (Polish Wt)", "પોલીશ પીસ (Polish Pcs)", "R to P % (Actual)", "વેરિયેશન (Var %)",
        "રફ Amount (Rough Amt)", "મજુરી (Mfg Cost)", "ટોટલ ખર્ચો (Total Cost)", "પડતર (Padtar)",
        "કુલ લોસ વજન (Loss Cts)", "કુલ લોસ નંગ (Loss Pcs)", "વિગત (Remarks)"
    ]
    
    # Write Main Column Headers in Row 4
    for col_idx, col_name in enumerate(ledger_cols, start=1):
        cell = ws_ledger.cell(row=4, column=col_idx)
        cell.value = col_name
        cell.font = header_font_bold
        cell.fill = yellow_header_fill
        cell.alignment = align_center
        cell.border = header_border
        
    # Write Department Group Headers in Row 3 and Sub-headers in Row 4
    for dept_name, start_col, end_col in depts:
        # Merge Top row for Dept title
        ws_ledger.merge_cells(f"{start_col}3:{end_col}3")
        cell_title = ws_ledger[f"{start_col}3"]
        cell_title.value = dept_name
        cell_title.font = header_font_bold
        cell_title.fill = yellow_header_fill
        cell_title.alignment = align_center
        cell_title.border = header_border
        
        # Sub-headers (In Pcs, In Cts, Out Pcs, Out Cts, Loss Pcs, Loss Cts) in Row 4
        sub_headers = ["In Pcs (આવક નંગ)", "In Cts (આવક વજન)", "Out Pcs (જાવક નંગ)", "Out Cts (જાવક વજન)", "Loss Pcs (લોસ નંગ)", "Loss Cts (લોસ વજન)"]
        start_idx = openpyxl.utils.column_index_from_string(start_col)
        for i, sub_h in enumerate(sub_headers):
            cell_sub = ws_ledger.cell(row=4, column=start_idx + i)
            cell_sub.value = sub_h
            cell_sub.font = header_font_bold
            cell_sub.fill = yellow_sub_fill
            cell_sub.alignment = align_center
            cell_sub.border = header_border

    # Format department header cells that are merged
    for dept_name, start_col, end_col in depts:
        start_idx = openpyxl.utils.column_index_from_string(start_col)
        end_idx = openpyxl.utils.column_index_from_string(end_col)
        for c in range(start_idx, end_idx + 1):
            ws_ledger.cell(row=3, column=c).border = header_border
            ws_ledger.cell(row=3, column=c).fill = yellow_header_fill

    # Fill in 2 Rows of Dummy Data (Row 5 and Row 6)
    # Row 5 is populated with dummy values to show calculations
    # Row 6 is left blank with formulas only as requested, for the user to type values
    
    rows_to_add = [
        # row_idx, KapanNo, RoughNo, ArticleName, RoughPcs, RoughWeight, RoughRate, MKPcs, ExpWeight, ExpRtoP, FourPPcs, FourPWt, RTWt, PolishWt, PolishPcs, is_dummy_filled
        (5, "K-101", "R-405", "DUMMY ENTRY", 100, 50.00, 2500, 140, 12.50, 20.00, 135, 11.20, 10.50, 9.80, 130, True),
        (6, "", "", "", None, None, None, None, None, None, None, None, None, None, None, False)
    ]
    
    ws_ledger.row_dimensions[3].height = 25
    ws_ledger.row_dimensions[4].height = 35
    
    for r_idx, kap, rfn, art, r_pcs, r_wt, r_rt, mk_p, exp_w, exp_rp, f_pcs, f_wt, rt_w, p_wt, p_pcs, is_filled in rows_to_add:
        ws_ledger.row_dimensions[r_idx].height = 24
        
        # Write No.
        ws_ledger.cell(row=r_idx, column=1, value=r_idx-4).alignment = align_center
        
        if is_filled:
            ws_ledger.cell(row=r_idx, column=2, value=rfn).alignment = align_center  # Rough No
            ws_ledger.cell(row=r_idx, column=3, value=art).alignment = align_left    # Article
            ws_ledger.cell(row=r_idx, column=4, value=kap).alignment = align_center  # Kapan No
            
            ws_ledger.cell(row=r_idx, column=5, value=r_pcs).alignment = align_right  # Rough Pcs
            ws_ledger.cell(row=r_idx, column=6, value=r_wt).alignment = align_right   # Rough Weight
            ws_ledger.cell(row=r_idx, column=8, value=r_rt).alignment = align_right   # Rough Rate
            
            ws_ledger.cell(row=r_idx, column=9, value=mk_p).alignment = align_right   # MK Pcs
            ws_ledger.cell(row=r_idx, column=10, value=exp_w).alignment = align_right # Exp Weight
            ws_ledger.cell(row=r_idx, column=12, value=exp_rp/100).alignment = align_right # Exp R to P %
            
            ws_ledger.cell(row=r_idx, column=13, value=f_pcs).alignment = align_right # 4P Pcs
            ws_ledger.cell(row=r_idx, column=14, value=f_wt).alignment = align_right  # 4P Wt
            ws_ledger.cell(row=r_idx, column=16, value=rt_w).alignment = align_right  # RT Wt
            
            ws_ledger.cell(row=r_idx, column=18, value=p_wt).alignment = align_right  # Polish Wt
            ws_ledger.cell(row=r_idx, column=19, value=p_pcs).alignment = align_right # Polish Pcs
            
            ws_ledger.cell(row=r_idx, column=28, value="Dummy remark").alignment = align_left
            
            # Dummy entries for Galaxy department
            ws_ledger.cell(row=r_idx, column=28+0, value=100) # In Pcs
            ws_ledger.cell(row=r_idx, column=28+1, value=50.00) # In Cts
            ws_ledger.cell(row=r_idx, column=28+2, value=99) # Out Pcs
            ws_ledger.cell(row=r_idx, column=28+3, value=48.20) # Out Cts
            
            # Dummy entries for AP OK
            ws_ledger.cell(row=r_idx, column=34+0, value=99)
            ws_ledger.cell(row=r_idx, column=34+1, value=48.20)
            ws_ledger.cell(row=r_idx, column=34+2, value=99)
            ws_ledger.cell(row=r_idx, column=34+3, value=48.10)
            
            # Dummy entries for 4P
            ws_ledger.cell(row=r_idx, column=40+0, value=99)
            ws_ledger.cell(row=r_idx, column=40+1, value=48.10)
            ws_ledger.cell(row=r_idx, column=40+2, value=99)
            ws_ledger.cell(row=r_idx, column=40+3, value=48.00)
            
            # Dummy entries for 4P OK RT BAAKI
            ws_ledger.cell(row=r_idx, column=46+0, value=99)
            ws_ledger.cell(row=r_idx, column=46+1, value=48.00)
            ws_ledger.cell(row=r_idx, column=46+2, value=98)
            ws_ledger.cell(row=r_idx, column=46+3, value=47.50)
            
            # Dummy entries for RT
            ws_ledger.cell(row=r_idx, column=52+0, value=98)
            ws_ledger.cell(row=r_idx, column=52+1, value=47.50)
            ws_ledger.cell(row=r_idx, column=52+2, value=98)
            ws_ledger.cell(row=r_idx, column=52+3, value=47.20)
            
            # Dummy entries for RT OK KHATA BAAKI
            ws_ledger.cell(row=r_idx, column=58+0, value=98)
            ws_ledger.cell(row=r_idx, column=58+1, value=47.20)
            ws_ledger.cell(row=r_idx, column=58+2, value=95)
            ws_ledger.cell(row=r_idx, column=58+3, value=45.50)
            
            # Dummy entries for KHATA
            ws_ledger.cell(row=r_idx, column=64+0, value=95)
            ws_ledger.cell(row=r_idx, column=64+1, value=45.50)
            ws_ledger.cell(row=r_idx, column=64+2, value=95)
            ws_ledger.cell(row=r_idx, column=64+3, value=44.20)
            
            # Dummy entries for OK KAPAN
            ws_ledger.cell(row=r_idx, column=70+0, value=95)
            ws_ledger.cell(row=r_idx, column=70+1, value=44.20)
            ws_ledger.cell(row=r_idx, column=70+2, value=95)
            ws_ledger.cell(row=r_idx, column=70+3, value=9.80) # Large drop due to polishing yield
        else:
            # Empty rows with just a placeholder kapan name
            ws_ledger.cell(row=r_idx, column=2, value="[Type Rough Name]").alignment = align_center
            ws_ledger.cell(row=r_idx, column=3, value="[Type Article]").alignment = align_left
            ws_ledger.cell(row=r_idx, column=4, value="K-102").alignment = align_center
            
        # Write FORMULAS in ledger columns
        # Rough Size (Col 7 - G): Pcs / Weight
        ws_ledger.cell(row=r_idx, column=7, value=f"=IF(F{r_idx}>0, E{r_idx}/F{r_idx}, \"\")").alignment = align_right
        # MK Size (Col 11 - K): MK Pcs / Exp Wt
        ws_ledger.cell(row=r_idx, column=11, value=f"=IF(J{r_idx}>0, I{r_idx}/J{r_idx}, \"\")").alignment = align_right
        # 4P + % (Col 15 - O): 100 - (Exp Wt / 4P Wt)*100
        ws_ledger.cell(row=r_idx, column=15, value=f"=IF(AND(N{r_idx}>0, J{r_idx}>0), 100 - (J{r_idx}/N{r_idx})*100, \"\")").alignment = align_right
        # RT % (Col 17 - Q): (RT Wt / 4P Wt)*100
        ws_ledger.cell(row=r_idx, column=17, value=f"=IF(AND(P{r_idx}>0, N{r_idx}>0), P{r_idx}/N{r_idx}*100, \"\")").alignment = align_right
        # R to P % Actual (Col 20 - T): (Polish Wt / Rough Wt)*100
        ws_ledger.cell(row=r_idx, column=20, value=f"=IF(F{r_idx}>0, R{r_idx}/F{r_idx}*100, \"\")").alignment = align_right
        # Variation % (Col 21 - U): Actual % - Exp %
        ws_ledger.cell(row=r_idx, column=21, value=f"=IF(AND(T{r_idx}<>\"\", L{r_idx}<>\"\"), T{r_idx}-L{r_idx}*100, \"\")").alignment = align_right
        # Rough Amount (Col 22 - V): Rough Weight * Rough Rate
        ws_ledger.cell(row=r_idx, column=22, value=f"=IF(F{r_idx}>0, F{r_idx}*H{r_idx}, \"\")").alignment = align_right
        # Mfg Cost (Col 23 - W): Polish Pcs * 65 (default rate)
        ws_ledger.cell(row=r_idx, column=23, value=f"=IF(S{r_idx}>0, S{r_idx}*65, 0)").alignment = align_right
        # Total Cost (Col 24 - X): Rough Amount + Mfg Cost
        ws_ledger.cell(row=r_idx, column=24, value=f"=IF(V{r_idx}<>\"\", V{r_idx}+W{r_idx}, \"\")").alignment = align_right
        # Padtar (Col 25 - Y): Total Cost / Polish Wt (rounded as per app logic: rounded to nearest 100 first, then padtar rounded to nearest 10)
        # We can implement a clean Excel equivalent: =IF(R{r_idx}>0, ROUND(ROUND(X{r_idx},-2)/R{r_idx},-1), "")
        ws_ledger.cell(row=r_idx, column=25, value=f"=IF(R{r_idx}>0, ROUND(ROUND(X{r_idx},-2)/R{r_idx},-1), \"\")").alignment = align_right
        
        # Loss Formulas for department columns
        # Galaxy Loss Pcs (AF): In Pcs - Out Pcs
        ws_ledger.cell(row=r_idx, column=32, value=f"=IF(AB{r_idx}<>\"\", AB{r_idx}-AD{r_idx}, \"\")").alignment = align_right
        # Galaxy Loss Cts (AG): In Cts - Out Cts
        ws_ledger.cell(row=r_idx, column=33, value=f"=IF(AC{r_idx}<>\"\", AC{r_idx}-AE{r_idx}, \"\")").alignment = align_right
        
        # AP OK Loss Pcs (AL):
        ws_ledger.cell(row=r_idx, column=38, value=f"=IF(AH{r_idx}<>\"\", AH{r_idx}-AJ{r_idx}, \"\")").alignment = align_right
        # AP OK Loss Cts (AM):
        ws_ledger.cell(row=r_idx, column=39, value=f"=IF(AI{r_idx}<>\"\", AI{r_idx}-AK{r_idx}, \"\")").alignment = align_right
        
        # 4P Loss Pcs (AR):
        ws_ledger.cell(row=r_idx, column=44, value=f"=IF(AN{r_idx}<>\"\", AN{r_idx}-AP{r_idx}, \"\")").alignment = align_right
        # 4P Loss Cts (AS):
        ws_ledger.cell(row=r_idx, column=45, value=f"=IF(AO{r_idx}<>\"\", AO{r_idx}-AQ{r_idx}, \"\")").alignment = align_right
        
        # 4P RT BAAKI Loss Pcs (AX):
        ws_ledger.cell(row=r_idx, column=50, value=f"=IF(AT{r_idx}<>\"\", AT{r_idx}-AV{r_idx}, \"\")").alignment = align_right
        # 4P RT BAAKI Loss Cts (AY):
        ws_ledger.cell(row=r_idx, column=51, value=f"=IF(AU{r_idx}<>\"\", AU{r_idx}-AW{r_idx}, \"\")").alignment = align_right
        
        # RT Loss Pcs (BD):
        ws_ledger.cell(row=r_idx, column=56, value=f"=IF(AZ{r_idx}<>\"\", AZ{r_idx}-BB{r_idx}, \"\")").alignment = align_right
        # RT Loss Cts (BE):
        ws_ledger.cell(row=r_idx, column=57, value=f"=IF(BA{r_idx}<>\"\", BA{r_idx}-BC{r_idx}, \"\")").alignment = align_right
        
        # RT KHATA BAAKI Loss Pcs (BJ):
        ws_ledger.cell(row=r_idx, column=62, value=f"=IF(BF{r_idx}<>\"\", BF{r_idx}-BH{r_idx}, \"\")").alignment = align_right
        # RT KHATA BAAKI Loss Cts (BK):
        ws_ledger.cell(row=r_idx, column=63, value=f"=IF(BG{r_idx}<>\"\", BG{r_idx}-BI{r_idx}, \"\")").alignment = align_right
        
        # KHATA Loss Pcs (BP):
        ws_ledger.cell(row=r_idx, column=68, value=f"=IF(BL{r_idx}<>\"\", BL{r_idx}-BN{r_idx}, \"\")").alignment = align_right
        # KHATA Loss Cts (BQ):
        ws_ledger.cell(row=r_idx, column=69, value=f"=IF(BM{r_idx}<>\"\", BM{r_idx}-BO{r_idx}, \"\")").alignment = align_right
        
        # OK KAPAN Loss Pcs (BV):
        ws_ledger.cell(row=r_idx, column=74, value=f"=IF(BR{r_idx}<>\"\", BR{r_idx}-BT{r_idx}, \"\")").alignment = align_right
        # OK KAPAN Loss Cts (BW):
        ws_ledger.cell(row=r_idx, column=75, value=f"=IF(BS{r_idx}<>\"\", BS{r_idx}-BU{r_idx}, \"\")").alignment = align_right

        # Total Loss Cts (Col 26 - Z): SUM of all department loss cts
        ws_ledger.cell(row=r_idx, column=26, value=f"=SUM(AG{r_idx},AM{r_idx},AS{r_idx},AY{r_idx},BE{r_idx},BK{r_idx},BQ{r_idx},BW{r_idx})").alignment = align_right
        # Total Loss Pcs (Col 27 - AA): SUM of all department loss pcs
        ws_ledger.cell(row=r_idx, column=27, value=f"=SUM(AF{r_idx},AL{r_idx},AR{r_idx},AX{r_idx},BD{r_idx},BJ{r_idx},BP{r_idx},BV{r_idx})").alignment = align_right

        # Font & Border styling for all cell elements in the row
        for c in range(1, 76):
            cell = ws_ledger.cell(row=r_idx, column=c)
            cell.font = data_font
            cell.border = thin_border
            
            # Apply double right border to separate columns
            if c == 28: # Remarks
                cell.border = Border(left=thin_side, right=double_side, top=thin_side, bottom=thin_side)
            elif c in [33, 39, 45, 51, 57, 63, 69, 75]: # End of each department block
                cell.border = Border(left=thin_side, right=thick_side, top=thin_side, bottom=thin_side)

            # Apply specific number formatting
            if c in [5, 9, 13, 19, 27]: # Integer pieces
                cell.number_format = "#,##0"
            elif c in [6, 10, 14, 16, 18, 26]: # Weights
                cell.number_format = "0.00"
            elif c in [7, 11]: # Average sizes
                cell.number_format = "0.00"
            elif c in [8]: # Rates
                cell.number_format = "₹#,##0"
            elif c in [12, 15, 17, 20, 21]: # Percentages
                cell.number_format = "0.00%"
            elif c in [22, 23, 24, 25]: # Currencies
                cell.number_format = "₹#,##0"
                cell.font = data_font_bold
                
    # ----------------------------------------------------
    # FREEZE PANES & COLUMN WIDTHS FOR LEDGER
    # ----------------------------------------------------
    # Freeze the first 4 columns (No, Rough No, Article Name, Kapan No) and the headers (rows 1-4)
    ws_ledger.freeze_panes = "E5"
    
    # Auto-adjust column widths
    for col in ws_ledger.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            # Avoid using long title block or comments for length check
            if cell.row in [1, 2]:
                continue
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        # Give safety margin
        ws_ledger.column_dimensions[col_letter].width = max(max_len + 4, 12)
        
    # Extra padding for specific columns to look good
    ws_ledger.column_dimensions["A"].width = 6   # No.
    ws_ledger.column_dimensions["B"].width = 12  # Rough No.
    ws_ledger.column_dimensions["C"].width = 18  # Article Name
    ws_ledger.column_dimensions["D"].width = 12  # Kapan No.
    ws_ledger.column_dimensions["AA"].width = 15 # Remarks

    # Add explanatory comment below detailed ledger
    ws_ledger.cell(row=8, column=2, value="💡 વિગતવાર સૂચનાઓ અને નોંધ (Detailed Instructions & Comments):").font = Font(name=font_family, size=11, bold=True, color="1F4E79")
    ws_ledger.cell(row=9, column=2, value="૧. આ લેજરમાં પીળા રંગના હેડરવાળા સેલ એ મુખ્ય સ્ટોક રજિસ્ટર દર્શાવે છે.").font = instruction_font
    ws_ledger.cell(row=10, column=2, value="૨. જમણી બાજુના વિભાગીવાર કોલમમાં દરેક સ્ટેજની આવક, જાવક અને લોસની વિગતો આપેલ છે.").font = instruction_font
    ws_ledger.cell(row=11, column=2, value="૩. [નંગ] અને [વજન] લખવાથી તે વિભાગનો કુલ લોસ અને આખરી લોસ ફોર્મ્યુલા દ્વારા ઓટોમેટિક કેલ્ક્યુલેટ થશે.").font = instruction_font
    ws_ledger.cell(row=12, column=2, value="૪. વેરિયેશન %, રફ Amount, મજુરી (નંગ દીઠ ₹૬૫ લેખે) અને પડતર (Padtar) ની ફોર્મ્યુલા ઓલરેડી સેટ કરેલ છે.").font = instruction_font
    ws_ledger.cell(row=13, column=2, value="૫. રો નંબર ૫ (Dummy Entry) માં સેમ્પલ ડેટા ભરેલ છે, અને રો નંબર ૬ ખાલી છે જેમાં ફોર્મ્યુલા એક્ટિવ છે.").font = instruction_font

    # ----------------------------------------------------
    # SHEET 2: POLISH CHART (BLUE THEME)
    # ----------------------------------------------------
    ws_chart = wb.create_sheet(title="Polish_Chart")
    ws_chart.views.sheetView[0].showGridLines = True
    
    # Title Block
    ws_chart.merge_cells("A1:M1")
    ws_chart["A1"] = "આખરી પોલિશ ચાર્ટ (Final Polish Chart)"
    ws_chart["A1"].font = title_font
    ws_chart["A1"].alignment = align_left
    ws_chart.row_dimensions[1].height = 40
    
    # Kapan Header Box (Rows 3-4)
    # Left border and blue accents
    ws_chart["A3"] = "કાપણ નંબર :-"
    ws_chart["A3"].font = header_font_bold
    ws_chart["B3"] = "K-101 (Dummy)"
    ws_chart["B3"].font = data_font_bold
    ws_chart["B3"].alignment = align_center
    ws_chart["B3"].border = Border(bottom=thin_side)
    
    ws_chart["D3"] = "રફ નામ :-"
    ws_chart["D3"].font = header_font_bold
    ws_chart["E3"] = "R-405 (Dummy)"
    ws_chart["E3"].font = data_font_bold
    ws_chart["E3"].alignment = align_center
    ws_chart["E3"].border = Border(bottom=thin_side)
    
    ws_chart["G3"] = "તારીખ :-"
    ws_chart["G3"].font = header_font_bold
    ws_chart["H3"] = "2026-08-04"
    ws_chart["H3"].font = data_font_bold
    ws_chart["H3"].alignment = align_center
    ws_chart["H3"].border = Border(bottom=thin_side)
    
    ws_chart.row_dimensions[3].height = 25
    
    # ----------------------------------------------------
    # SECTION A: MAIN ASSORTMENT TABLE (Row 5 to 7)
    # ----------------------------------------------------
    # Headers
    # Row 5 (Top half of headers)
    main_headers_r1 = [
        ("એસોર્ટ નામ", 1), ("રી એસોર્ટ નામ", 2), ("માઈક્રૉન", 4), ("શેડિંગ", 6),
        ("એસોર્ટ", 7), ("ગેલેક્સી", 8), ("4P", 9), ("R-T", 10), 
        ("રી એસોર્ટ", 11), ("ખાતા", 12), ("જમા", 13), ("વિગત", 14)
    ]
    # Row 6 (Bottom half of headers for merged fields)
    # RA-OUT %, પો-હેડ, રીપેરીંગ %
    
    ws_chart.row_dimensions[5].height = 20
    ws_chart.row_dimensions[6].height = 20
    
    # Setup the table headers with Blue fill
    for name, c_idx in main_headers_r1:
        if name in ["રી એસોર્ટ", "ખાતા", "વિગત"]:
            ws_chart.cell(row=5, column=c_idx, value=name).font = header_font_white
            ws_chart.cell(row=5, column=c_idx).fill = blue_header_fill
            ws_chart.cell(row=5, column=c_idx).alignment = align_center
            ws_chart.cell(row=5, column=c_idx).border = thin_border
        else:
            ws_chart.merge_cells(start_row=5, start_column=c_idx, end_row=6, end_column=c_idx)
            cell = ws_chart.cell(row=5, column=c_idx, value=name)
            cell.font = header_font_white
            cell.fill = blue_header_fill
            cell.alignment = align_center
            cell.border = thin_border
            
    # Add the second row sub-headers
    ws_chart.cell(row=6, column=11, value="RA-OUT %").font = header_font_white
    ws_chart.cell(row=6, column=11).fill = blue_header_fill
    ws_chart.cell(row=6, column=11).alignment = align_center
    ws_chart.cell(row=6, column=11).border = thin_border
    
    ws_chart.cell(row=6, column=12, value="પો-હેડ").font = header_font_white
    ws_chart.cell(row=6, column=12).fill = blue_header_fill
    ws_chart.cell(row=6, column=12).alignment = align_center
    ws_chart.cell(row=6, column=12).border = thin_border
    
    ws_chart.cell(row=6, column=14, value="રીપેરીંગ %").font = header_font_white
    ws_chart.cell(row=6, column=14).fill = blue_header_fill
    ws_chart.cell(row=6, column=14).alignment = align_center
    ws_chart.cell(row=6, column=14).border = thin_border

    # Format remaining empty merged cells borders
    for r in [5, 6]:
        for col_idx in range(1, 15):
            ws_chart.cell(row=r, column=col_idx).border = thin_border
            if ws_chart.cell(row=r, column=col_idx).fill.fill_type is None:
                ws_chart.cell(row=r, column=col_idx).fill = blue_header_fill

    # Empty editable data row for Assortment details (Row 7)
    ws_chart.row_dimensions[7].height = 30
    for col_idx in range(1, 15):
        cell = ws_chart.cell(row=7, column=col_idx)
        cell.border = thin_border
        cell.font = data_font
        cell.alignment = align_center
        # Placeholder indicator
        if col_idx == 1:
            cell.value = "White 1"
        elif col_idx == 2:
            cell.value = "Re-W1"
        elif col_idx == 4:
            cell.value = "1.2"
        elif col_idx == 6:
            cell.value = "Medium"
        elif col_idx == 7:
            cell.value = "Clean"
        elif col_idx == 13:
            cell.value = "Yes"
            
    # ----------------------------------------------------
    # SECTION B: 4 COLUMN SIDE-BY-SIDE TABLES (Rows 9 to 21)
    # ----------------------------------------------------
    
    # 1. Galaxy Details (Columns A-B)
    ws_chart.merge_cells("A9:B9")
    ws_chart["A9"] = "ગેલેક્ષી વીગત (Galaxy)"
    ws_chart["A9"].font = header_font_white
    ws_chart["A9"].fill = blue_header_fill
    ws_chart["A9"].alignment = align_center
    
    galaxy_labels = [
        ("કાચું વજન (Rough Wt)", 50.00),
        ("રફ સાઇઝ (Rough Size)", "=IF(B10>0, B24/B10, \"\")"),
        ("ક્રાફ સાઇઝ (Craft Size)", 4.80),
        ("માંગેલું વજન % (Req Wt %)", 20.00),
        ("4P %", 22.40),
        ("RT %", 21.00),
        ("તૈયાર ગુણાકાર % (Ready %)", "=B17"),
        ("રફ TO પોલીસ % (Actual %)", "=IF(B10>0, (D24/B10)*100, 0)"),
        ("વેરીએશન % (Variation %)", "=B17-B13"),
        ("વજન ફોર્મ્યુલા", "50.00 * 2500"),
        ("G - નંગ ફોર્મ્યુલા", "130 * 65")
    ]
    
    for idx, (label, val) in enumerate(galaxy_labels, start=10):
        ws_chart.cell(row=idx, column=1, value=label).font = header_font_bold
        ws_chart.cell(row=idx, column=1).fill = blue_sub_fill
        ws_chart.cell(row=idx, column=1).border = thin_border
        
        val_cell = ws_chart.cell(row=idx, column=2, value=val)
        val_cell.font = data_font
        val_cell.border = thin_border
        val_cell.alignment = align_right
        if isinstance(val, float):
            val_cell.number_format = "0.00"
            
    # 2. Planning Details (Columns D-E)
    ws_chart.merge_cells("D9:E9")
    ws_chart["D9"] = "નિયોજન વિગતો (Planning)"
    ws_chart["D9"].font = header_font_white
    ws_chart["D9"].fill = blue_header_fill
    ws_chart["D9"].alignment = align_center
    
    planning_labels = [
        ("સેલ % (Sale %)", 85.00),
        ("ફ્લેટ % (Flat %)", 5.00),
        ("મેન્યુઅલ % (Manual %)", 2.00),
        ("ગેલેક્ષિ % (Galaxy %)", 8.00),
        ("આઉટ % (Out %)", 0.00),
        ("રફ ભાવ (Rough Rate)", 2500)
    ]
    
    for idx, (label, val) in enumerate(planning_labels, start=10):
        ws_chart.cell(row=idx, column=4, value=label).font = header_font_bold
        ws_chart.cell(row=idx, column=4).fill = blue_sub_fill
        ws_chart.cell(row=idx, column=4).border = thin_border
        
        val_cell = ws_chart.cell(row=idx, column=5, value=val)
        val_cell.font = data_font
        val_cell.border = thin_border
        val_cell.alignment = align_right
        if idx in [10, 11, 12, 13, 14]:
            val_cell.number_format = "0.00"
        elif idx == 15:
            val_cell.number_format = "₹#,##0"
            val_cell.font = data_font_bold
            
    # 3. Polish Sieve % (Columns G-H)
    ws_chart.merge_cells("G9:H9")
    ws_chart["G9"] = "પૉલિશ ચારણી % (Sieve)"
    ws_chart["G9"].font = header_font_white
    ws_chart["G9"].fill = blue_header_fill
    ws_chart["G9"].alignment = align_center
    
    sieve_labels = [
        ("+6.5", 15.00),
        ("+4", 45.00),
        ("+2", 30.00),
        ("-2 + 0", 8.00),
        ("- 0 + 000", 2.00),
        ("- 000", 0.00),
        ("+2 Total (કુલ +2)", "=SUM(H10:H12)"),
        ("-2 Total (કુલ -2)", "=SUM(H13:H15)"),
        ("Total Sieve % (કુલ)", "=SUM(H10:H15)")
    ]
    
    for idx, (label, val) in enumerate(sieve_labels, start=10):
        ws_chart.cell(row=idx, column=7, value=label).font = header_font_bold
        ws_chart.cell(row=idx, column=7).fill = blue_sub_fill
        ws_chart.cell(row=idx, column=7).border = thin_border
        
        val_cell = ws_chart.cell(row=idx, column=8, value=val)
        val_cell.font = data_font
        val_cell.border = thin_border
        val_cell.alignment = align_right
        val_cell.number_format = "0.00"
        if idx in [16, 17, 18]:
            val_cell.font = data_font_bold
            
    # 4. Polish Gala % (Columns J-K)
    ws_chart.merge_cells("J9:K9")
    ws_chart["J9"] = "પૉલિશ ગાળા (Gala %)"
    ws_chart["J9"].font = header_font_white
    ws_chart["J9"].fill = blue_header_fill
    ws_chart["J9"].alignment = align_center
    
    gala_labels = [
        ("5A + 7 %", 10.00),
        ("8A + 10B %", 25.00),
        ("11 + 12 %", 40.00),
        ("WH + NW %", 15.00),
        ("OW + TTLB %", 7.00),
        ("TLB+LB+DB %", 3.00),
        ("Total Gala % (કુલ)", "=SUM(K10:K15)")
    ]
    
    for idx, (label, val) in enumerate(gala_labels, start=10):
        ws_chart.cell(row=idx, column=10, value=label).font = header_font_bold
        ws_chart.cell(row=idx, column=10).fill = blue_sub_fill
        ws_chart.cell(row=idx, column=10).border = thin_border
        
        val_cell = ws_chart.cell(row=idx, column=11, value=val)
        val_cell.font = data_font
        val_cell.border = thin_border
        val_cell.alignment = align_right
        val_cell.number_format = "0.00"
        if idx == 16:
            val_cell.font = data_font_bold

    # Ensure borders are correct on merged cells
    for r in range(9, 21):
        for c in [1, 2, 4, 5, 7, 8, 10, 11]:
            ws_chart.cell(row=r, column=c).border = thin_border

    # ----------------------------------------------------
    # SECTION C: BOTTOM POLISH TOTALS (Row 23 to 25)
    # ----------------------------------------------------
    ws_chart.row_dimensions[23].height = 20
    ws_chart.row_dimensions[24].height = 30
    
    ws_chart.merge_cells("A23:B23")
    ws_chart["A23"] = "પોલિશ નંગ (Polish Pcs) *"
    ws_chart["A23"].font = header_font_white
    ws_chart["A23"].fill = blue_header_fill
    ws_chart["A23"].alignment = align_center
    
    ws_chart.merge_cells("C23:D23")
    ws_chart["C23"] = "પોલિશ વજન (Polish Cts) *"
    ws_chart["C23"].font = header_font_white
    ws_chart["C23"].fill = blue_header_fill
    ws_chart["C23"].alignment = align_center
    
    ws_chart.merge_cells("E23:F23")
    ws_chart["E23"] = "આખરી પડતર (Padtar) [Calculated]"
    ws_chart["E23"].font = header_font_white
    ws_chart["E23"].fill = blue_header_fill
    ws_chart["E23"].alignment = align_center
    
    ws_chart.merge_cells("H23:I23")
    ws_chart["H23"] = "રીપેરીંગ નંગ (Repair Pcs)"
    ws_chart["H23"].font = header_font_white
    ws_chart["H23"].fill = blue_header_fill
    ws_chart["H23"].alignment = align_center
    
    ws_chart.merge_cells("J23:K23")
    ws_chart["J23"] = "રીપેરીંગ વજન (Repair Cts)"
    ws_chart["J23"].font = header_font_white
    ws_chart["J23"].fill = blue_header_fill
    ws_chart["J23"].alignment = align_center

    # Apply formatting and cells for row 23
    for c in [1, 2, 3, 4, 5, 6, 8, 9, 10, 11]:
        ws_chart.cell(row=23, column=c).border = thin_border
        ws_chart.cell(row=23, column=c).fill = blue_header_fill

    # Row 24: Values
    # Polish Pcs
    ws_chart.merge_cells("A24:B24")
    ws_chart["A24"] = 130
    ws_chart["A24"].font = Font(name=font_family, size=14, bold=True)
    ws_chart["A24"].alignment = align_center
    ws_chart["A24"].border = thin_border
    
    # Polish Cts
    ws_chart.merge_cells("C24:D24")
    ws_chart["C24"] = 9.80
    ws_chart["C24"].font = Font(name=font_family, size=14, bold=True)
    ws_chart["C24"].alignment = align_center
    ws_chart["C24"].border = thin_border
    ws_chart["C24"].number_format = "0.00"
    
    # Padtar (Cost) Formula:
    # padtar = ROUND(ROUND((Rough Weight * Rough Rate + Polish Pcs * 65), -2)/Polish Cts, -1)
    # B10 = Rough Weight, E15 = Rough Rate, A24 = Polish Pcs, C24 = Polish Cts
    ws_chart.merge_cells("E24:F24")
    ws_chart["E24"] = "=IF(C24>0, ROUND(ROUND((B10*E15 + A24*65), -2)/C24, -1), 0)"
    ws_chart["E24"].font = Font(name=font_family, size=14, bold=True, color="FF0000")
    ws_chart["E24"].alignment = align_center
    ws_chart["E24"].fill = accent_green_fill
    ws_chart["E24"].border = thin_border
    ws_chart["E24"].number_format = "₹#,##0"
    
    # Repair Pcs
    ws_chart.merge_cells("H24:I24")
    ws_chart["H24"] = 2
    ws_chart["H24"].font = data_font_bold
    ws_chart["H24"].alignment = align_center
    ws_chart["H24"].border = thin_border
    
    # Repair Cts
    ws_chart.merge_cells("J24:K24")
    ws_chart["J24"] = 0.15
    ws_chart["J24"].font = data_font_bold
    ws_chart["J24"].alignment = align_center
    ws_chart["J24"].border = thin_border
    ws_chart["J24"].number_format = "0.00"

    for r in [24]:
        for c in [1, 2, 3, 4, 5, 6, 8, 9, 10, 11]:
            ws_chart.cell(row=r, column=c).border = thin_border

    # Remarks / Comments (Row 26-27)
    ws_chart.merge_cells("A26:K26")
    ws_chart["A26"] = "એકત્રિત વિગત / નોંધ (Vigat/Remarks):"
    ws_chart["A26"].font = header_font_bold
    ws_chart["A26"].alignment = align_left
    
    ws_chart.merge_cells("A27:K28")
    ws_chart["A27"] = "પૉલિશિંગ દરમિયાન વિભાગવાર રિકવરી અને ગુણવત્તા નિયંત્રણ સુનિશ્ચિત કરવું."
    ws_chart["A27"].font = data_font
    ws_chart["A27"].alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
    ws_chart["A27"].border = thin_border
    
    for r in [27, 28]:
        for c in range(1, 12):
            ws_chart.cell(row=r, column=c).border = thin_border

    # Add explanatory comment below polish chart
    ws_chart.cell(row=30, column=1, value="💡 પોલિશ ચાર્ટ વિશે સૂચનાઓ (Polish Chart Notes):").font = Font(name=font_family, size=11, bold=True, color="1B365D")
    ws_chart.cell(row=31, column=1, value="૧. આ ચાર્ટ એક કાગળ ચાર્ટ (Paper Chart) ની સમાન લેઆઉટ દર્શાવે છે જેમાં વાદળી રંગના હેડર છે.").font = instruction_font
    ws_chart.cell(row=32, column=1, value="૨. ડાબી બાજુ રફ વજન અને કિંમતો લખવાથી રફ TO પોલીસ % (Actual Yield) અને આખરી પડતર (Padtar) ગણાઈ જશે.").font = instruction_font
    ws_chart.cell(row=33, column=1, value="૩. તૈયાર પૉલિશ ચારણી % (Sieve) અને પૉલિશ ગાળા (Gala) માં પર્સેન્ટેજ નોંધવાથી કુલ સવાલો અને ગુણવત્તાનું પૃથક્કરણ થશે.").font = instruction_font
    ws_chart.cell(row=34, column=1, value="૪. * ચિહ્નિત વિગતો (પોલિશ નંગ અને વજન) ફરજિયાત છે અને પડતર તથા રફ to પોલિશ % શોધવા માટે અત્યંત જરૂરી છે.").font = instruction_font

    # Set column widths for Chart sheet to look perfect
    ws_chart.column_dimensions["A"].width = 24
    ws_chart.column_dimensions["B"].width = 16
    ws_chart.column_dimensions["C"].width = 5
    ws_chart.column_dimensions["D"].width = 24
    ws_chart.column_dimensions["E"].width = 16
    ws_chart.column_dimensions["F"].width = 12
    ws_chart.column_dimensions["G"].width = 24
    ws_chart.column_dimensions["H"].width = 16
    ws_chart.column_dimensions["I"].width = 12
    ws_chart.column_dimensions["J"].width = 24
    ws_chart.column_dimensions["K"].width = 16
    ws_chart.column_dimensions["L"].width = 12
    ws_chart.column_dimensions["M"].width = 12

    # Save to file
    file_path = os.path.join("c:\\Users\\sandi\\Desktop\\Jemin Vinubhai", "Kaapan_Stock_Ledger_Template.xlsx")
    wb.save(file_path)
    print(f"Workbook successfully saved to: {file_path}")

if __name__ == "__main__":
    create_template()
