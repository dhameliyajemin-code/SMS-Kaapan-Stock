import json
import urllib.request

# 1. FETCH DATABASE STATE FROM FIREBASE
url = "https://ng-cost-default-rtdb.firebaseio.com/diamond_stock_system.json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        state = json.loads(response.read().decode('utf-8'))
    print("Successfully read database state from Firebase.")
except Exception as e:
    print(f"Error fetching state from Firebase: {e}")
    exit(1)

# 2. UPDATE KAPANS AND POLISH CHARTS FOR M-3-20 AND m-2-20
kapans_updated = 0
charts_updated = 0

for k in state.get("kapans", []):
    kapan_no = k.get("kapanNo", "")
    if kapan_no in ["M-3-20", "m-2-20"]:
        # Set Kapan's initial / final values matching Excel row 5 exactly
        k["roughWeight"] = 89.98
        k["carat"] = 29.54  # Polish weight
        k["nang"] = 3664    # Polish pcs (final stage)
        k["makeablePiece"] = 3711
        k["makeableVajan"] = 31.34
        k["fourPNang"] = 3693
        k["fourPCt"] = 40.11
        k["rtCt"] = 39.04
        k["r2pPct"] = 34.83  # Expected Yield %
        k["fourPPct"] = 21.87 # 4P + %
        k["rtPct"] = 97.33   # RT %
        kapans_updated += 1

for pc in state.get("polishCharts", []):
    kapan_no = pc.get("kapanNo", "")
    if kapan_no in ["M-3-20", "m-2-20"]:
        # Update Polish Chart metrics matching Excel Polish Chart layout
        pc["rWeight"] = 89.98
        pc["rSize"] = "14.44"      # Rough Pcs / Rough Wt = 1299 / 89.98
        pc["cardSize"] = "118.41"  # MK Pcs / Exp Wt = 3711 / 31.34
        pc["reqWeightPct"] = 34.83
        pc["fourPPct"] = 21.87
        pc["rtPct"] = 97.33
        pc["multPct"] = 75.67      # Polish Wt / RT Wt = 29.54 / 39.04 = 75.67%
        pc["rToPolishPct"] = 32.83 # Polish Wt / Rough Wt = 29.54 / 89.98 = 32.83%
        pc["varPct"] = 2.00        # Expected Yield - Actual Yield = 34.83 - 32.83
        pc["padtar"] = 14240
        pc["polishCarat"] = 29.54
        pc["polishNang"] = 3664
        pc["weightFormula"] = "89.98 * 2029"
        pc["gNangFormula"] = "3664 * 65"
        
        # Update Sieve sizes (ચારણી %) from Excel sheet rows 10-15
        pc["s65"] = 15      # +6.5
        pc["s4"] = 18       # +4
        pc["s2"] = 13       # +2
        pc["s20"] = 31      # -2 + 0
        pc["s00"] = 20      # -0 + 000
        pc["s000"] = 3      # -000
        pc["s2plus"] = 46   # Sum of +6.5, +4, +2
        pc["s2minus"] = 54  # Sum of -2+0, -0+000, -000
        
        # Reset color/gala ranges to 0% to match template
        pc["g5a7"] = 0
        pc["g8a10b"] = 0
        pc["g1112"] = 0
        pc["gwhnw"] = 0
        pc["gowttlb"] = 0
        pc["gtlblbdb"] = 0
        charts_updated += 1

print(f"Updated {kapans_updated} Kapans and {charts_updated} Polish Charts in state.")

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
        print("Successfully synced recalculated state to Firebase Realtime Database.")
except Exception as e:
    print(f"Error syncing to Firebase: {e}")
