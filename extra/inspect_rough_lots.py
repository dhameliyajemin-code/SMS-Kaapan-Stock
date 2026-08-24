import json

try:
    with open("extra/database_dump.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        print(f"Total rough lots: {len(data.get('roughLots', []))}")
        for r in data.get("roughLots", []):
            print(f"ID: {r.get('id')} | Name: {r.get('name')} | Party: {r.get('party')} | Rate: {r.get('rate')}")
except Exception as e:
    print("Error:", e)
