import urllib.request
import json

url = "https://ng-cost-default-rtdb.firebaseio.com/diamond_stock_system.json"
try:
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        # Save complete DB state to json file
        with open("extra/database_dump.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print("Database successfully dumped to extra/database_dump.json")
except Exception as e:
    print("Error:", e)
