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

# Reset state database tables to empty lists (0)
state["roughLots"] = []
state["kapans"] = []
state["transfers"] = []
state["repairs"] = []
state["audits"] = []
state["polishCharts"] = []
state["transferRules"] = []
state["prunedMockData_v6"] = True

# Write updated empty state back to Firebase
data_bytes = json.dumps(state).encode('utf-8')
req_put = urllib.request.Request(
    url, 
    data=data_bytes, 
    headers={'Content-Type': 'application/json'},
    method='PUT'
)
try:
    with urllib.request.urlopen(req_put) as response:
        print("Successfully wiped all state data on Firebase (everything set to 0).")
except Exception as e:
    print(f"Error syncing to Firebase: {e}")
    exit(1)
