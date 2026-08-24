import urllib.request
import json

url = "https://ng-cost-default-rtdb.firebaseio.com/diamond_stock_system.json"
try:
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if data:
            print("Successfully connected. Database keys:", list(data.keys()))
            if "kapans" in data:
                print("Number of kapans:", len(data["kapans"]))
                if data["kapans"]:
                    print("Sample Kapan:")
                    k = data["kapans"][0]
                    for key in ["kapanNo", "roughName", "carat", "nang", "currentDept", "createdDate"]:
                        print(f"  {key}: {k.get(key)}")
            if "transfers" in data:
                print("Number of transfers:", len(data["transfers"]))
        else:
            print("Database is empty or returned null.")
except Exception as e:
    print("Connection error:", e)
