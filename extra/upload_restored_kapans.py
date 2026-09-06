import json
import urllib.request

url = "https://ng-cost-default-rtdb.firebaseio.com/diamond_stock_system.json"

state = {
  "auth": {
    "adminPassHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "editPassHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "stockPassHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
  },
  "majuriRate": 65,
  "roughLots": [
    {
      "id": "R_KATUKA",
      "name": "KATUKA 7/5",
      "carats": 410.28,
      "rate": 2423,
      "party": "Unknown",
      "vigat": "",
      "date": "2026-08-30T00:00:00Z",
      "finalRoughAmt": 994108.44
    },
    {
      "id": "R_FINCSE",
      "name": "5/9 FINCSE",
      "carats": 100.05,
      "rate": 1049,
      "party": "Unknown",
      "broker": "jatin",
      "vigat": "Broker: jatin",
      "date": "2026-08-30T00:00:00Z",
      "finalRoughAmt": 104952.45
    }
  ],
  "kapans": [
    {
      "id": "K_M2_66",
      "kapanNo": "M-2-66",
      "roughId": "R_FINCSE",
      "carat": 16.79,
      "nang": 193,
      "roughWeight": 16.79,
      "roughNang": 193,
      "currentDept": "Galaxy",
      "tag": "Regular",
      "status": "Chalu",
      "vigat": "5/9 FINCSE",
      "createdDate": "2026-08-30T14:38:35.000Z",
      "lastMovedDate": "2026-08-30T14:38:35.000Z"
    },
    {
      "id": "K_M2_67",
      "kapanNo": "M-2-67",
      "roughId": "R_KATUKA",
      "carat": 38.26,
      "nang": 658,
      "roughWeight": 38.26,
      "roughNang": 658,
      "currentDept": "Galaxy",
      "tag": "Urgent",
      "status": "Chalu",
      "vigat": "KATUKA 7/5",
      "createdDate": "2026-08-30T14:38:35.000Z",
      "lastMovedDate": "2026-08-30T14:38:35.000Z"
    },
    {
      "id": "K_M2_68",
      "kapanNo": "M-2-68",
      "roughId": "R_KATUKA",
      "carat": 38.24,
      "nang": 654,
      "roughWeight": 38.24,
      "roughNang": 654,
      "currentDept": "Galaxy",
      "tag": "Regular",
      "status": "Chalu",
      "vigat": "KATUKA 7/5",
      "createdDate": "2026-08-30T14:38:35.000Z",
      "lastMovedDate": "2026-08-30T14:38:35.000Z"
    },
    {
      "id": "K_M2_69",
      "kapanNo": "M-2-69",
      "roughId": "R_FINCSE",
      "carat": 100.05,
      "nang": 1648,
      "roughWeight": 100.05,
      "roughNang": 1648,
      "currentDept": "Galaxy",
      "tag": "Regular",
      "status": "Chalu",
      "vigat": "5/9 FINCSE",
      "createdDate": "2026-08-30T14:38:35.000Z",
      "lastMovedDate": "2026-08-30T14:38:35.000Z"
    },
    {
      "id": "K_M2_70",
      "kapanNo": "M-2-70",
      "roughId": "R_KATUKA",
      "carat": 99.96,
      "nang": 1626,
      "roughWeight": 99.96,
      "roughNang": 1626,
      "currentDept": "Galaxy",
      "tag": "Regular",
      "status": "Chalu",
      "vigat": "KATUKA 7/5",
      "createdDate": "2026-08-30T14:38:35.000Z",
      "lastMovedDate": "2026-08-30T14:38:35.000Z"
    },
    {
      "id": "K_M2_71",
      "kapanNo": "M-2-71",
      "roughId": "R_KATUKA",
      "carat": 100.03,
      "nang": 1644,
      "roughWeight": 100.03,
      "roughNang": 1644,
      "currentDept": "Galaxy",
      "tag": "Regular",
      "status": "Chalu",
      "vigat": "KATUKA 7/5",
      "createdDate": "2026-08-30T14:38:35.000Z",
      "lastMovedDate": "2026-08-30T14:38:35.000Z"
    }
  ],
  "transfers": [],
  "repairs": [],
  "audits": [],
  "polishCharts": [],
  "transferRules": [
    { "from": "Galaxy", "to": "AP OK", "customHeader": "Rough to Polish %", "isCompulsory": True },
    { "from": "4P", "to": "RT", "customHeader": "4P Output Carats", "isCompulsory": True }
  ],
  "depts": [
    "Galaxy",
    "AP OK",
    "4P",
    "4P OK RT BAAKI",
    "RT",
    "RT OK KHATA BAAKI",
    "KHATA",
    "OK KAPAN (ઓકે કાપણ)"
  ],
  "deptConfigs": {},
  "autoLogoutHours": 11,
  "firebaseConfig": {
    "apiKey": "AIzaSyDvu7pJMXatKNHFAuJMtsh_zpmb8Jr0BCM",
    "dbUrl": "https://ng-cost-default-rtdb.firebaseio.com",
    "projectId": "ng-cost"
  },
  "firebaseWiped": True,
  "prunedMockData_v6": True
}

try:
    data_bytes = json.dumps(state).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    with urllib.request.urlopen(req) as response:
        print("Successfully restored database state on Firebase.")
except Exception as e:
    print(f"Error syncing to Firebase: {e}")
    exit(1)
