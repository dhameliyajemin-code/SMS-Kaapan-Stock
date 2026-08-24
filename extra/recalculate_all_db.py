import json
import urllib.request

url = "https://ng-cost-default-rtdb.firebaseio.com/diamond_stock_system.json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        state = json.loads(response.read().decode('utf-8'))
    print("Successfully read database state from Firebase.")
except Exception as e:
    print(f"Error fetching state from Firebase: {e}")
    exit(1)

kapans = state.get("kapans", [])
transfers = state.get("transfers", [])
rough_lots = state.get("roughLots", [])
polish_charts = state.get("polishCharts", [])
master_majuri_rate = state.get("majuriRate", 65)

updated_count = 0

for k in kapans:
    kapan_no = k.get("kapanNo")
    
    # 1. Fetch Rough Lot properties
    rough_id = k.get("roughId")
    rough = next((r for r in rough_lots if r.get("id") == rough_id), {})
    rough_rate = rough.get("rate", k.get("roughRate", 2730))
    
    # 2. Get initial rough dimensions
    rough_pcs = k.get("nang", 0)
    # If completed, the original rough pieces is the first Galaxy In Pcs transfer
    k_transfers = [t for t in transfers if t.get("kapanNo") == kapan_no]
    k_transfers.sort(key=lambda x: x.get("timestamp", ""))
    
    galaxy_in_transfer = next((t for t in k_transfers if t.get("fromDept") == "Galaxy" or t.get("toDept") == "Galaxy"), None)
    if galaxy_in_transfer:
        rough_pcs = galaxy_in_transfer.get("prevNang", galaxy_in_transfer.get("nang", rough_pcs))
    else:
        # If no transfers, use Kapan's initial state
        pass
        
    rough_weight = k.get("roughWeight", k.get("carat", 0))
    if rough_weight == 0:
        continue

    # 3. Find matching Polish Chart
    pc = next((p for p in polish_charts if p.get("kapanNo") == kapan_no), None)
    if pc:
        # Update Sieve sum validation check
        pc["s2plus"] = (pc.get("s65", 0) or 0) + (pc.get("s4", 0) or 0) + (pc.get("s2", 0) or 0)
        pc["s2minus"] = (pc.get("s20", 0) or 0) + (pc.get("s00", 0) or 0) + (pc.get("s000", 0) or 0)
        
        # Calculate achieved yield
        polish_carat = parseFloat = pc.get("polishCarat", 0)
        achieved_pct = (polish_carat / rough_weight * 100) if rough_weight > 0 else 0
        pc["rToPolishPct"] = round(achieved_pct, 2)
        
        # તૈયાર ગુણાકાર % = Polish Weight / RT Weight (Excel B16)
        rt_ct = k.get("rtCt", 0)
        if rt_ct > 0:
            pc["multPct"] = round((polish_carat / rt_ct * 100), 2)
        else:
            pc["multPct"] = round(achieved_pct, 2)
            
        # Yield Variation = Expected % - Actual % (Excel U5 / B18)
        req_pct = pc.get("reqWeightPct", 0)
        pc["varPct"] = round(req_pct - achieved_pct, 2)
        
        # રફ સાઇઝ = Rough Pcs / Rough Weight (Excel G5)
        pc["rSize"] = f"{(rough_pcs / rough_weight):.2f}"
        
        # Recalculate Padtar with double rounding
        rough_amt = rough_weight * rough_rate
        majuri = pc.get("polishNang", 0) * master_majuri_rate
        total_expense = rough_amt + majuri
        total_expense_rounded = round(total_expense / 100) * 100
        
        if polish_carat > 0:
            pc["padtar"] = round((total_expense_rounded / polish_carat) / 10) * 10
        else:
            pc["padtar"] = 0
            
        updated_count += 1
        print(f"Recalculated Polish Chart for Kapan {kapan_no}: rSize={pc['rSize']}, multPct={pc['multPct']}, varPct={pc['varPct']}, padtar={pc['padtar']}")

print(f"Total charts updated: {updated_count}")

# 4. WRITE UPDATED STATE BACK TO FIREBASE
data_bytes = json.dumps(state).encode('utf-8')
req_put = urllib.request.Request(
    url, 
    data=data_bytes, 
    headers={'Content-Type': 'application/json'},
    method='PUT'
)
try:
    with urllib.request.urlopen(req_put) as response:
        print("Successfully synced recalculated state for ALL Polish Charts to Firebase Realtime Database.")
except Exception as e:
    print(f"Error syncing to Firebase: {e}")
