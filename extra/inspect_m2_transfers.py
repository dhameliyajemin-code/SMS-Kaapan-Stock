import json

try:
    with open("extra/database_dump.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        m2_transfers = [t for t in data.get("transfers", []) if t.get("kapanNo") == "m-2-20"]
        print(f"Total transfers for m-2-20: {len(m2_transfers)}")
        for t in m2_transfers:
            print(f"From: {t.get('fromDept')} | To: {t.get('toDept')} | Pcs: {t.get('nang')} | Wt: {t.get('carat')} | Time: {t.get('timestamp')}")
except Exception as e:
    print("Error:", e)
