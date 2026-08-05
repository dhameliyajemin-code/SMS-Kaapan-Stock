  function recalculateSieveTotals() {
    const s65 = parseFloat(document.getElementById("pcS65").value) || 0;
    const s4 = parseFloat(document.getElementById("pcS4").value) || 0;
    const s2 = parseFloat(document.getElementById("pcS2").value) || 0;
    const s20 = parseFloat(document.getElementById("pcS20").value) || 0;
    const s00 = parseFloat(document.getElementById("pcS00").value) || 0;
    const s000 = parseFloat(document.getElementById("pcS000").value) || 0;

    const s2plus = parseFloat((s65 + s4 + s2).toFixed(2));
    const s2minus = parseFloat((s20 + s00 + s000).toFixed(2));

    document.getElementById("pcS2plus").value = s2plus;
    document.getElementById("pcS2minus").value = s2minus;

    const total = parseFloat((s2plus + s2minus).toFixed(2));
    const msgEl = document.getElementById("pcSieveSumMsg");
    const s2plusInput = document.getElementById("pcS2plus");
    const s2minusInput = document.getElementById("pcS2minus");

    if (msgEl) {
      if (Math.abs(total - 100) < 0.05) {
        msgEl.innerText = `✅ Total: ${total}%`;
        msgEl.style.color = "#16a34a";
        s2plusInput.style.color = "inherit";
        s2minusInput.style.color = "inherit";
      } else {
        msgEl.innerText = `⚠️ Total: ${total}% (Must be 100%)`;
        msgEl.style.color = "#dc2626";
        s2plusInput.style.color = "#dc2626";
        s2minusInput.style.color = "#dc2626";
      }
    }
  }

  function searchKapanDialer() {
    const q = document.getElementById("kapanDialerSearch").value.trim().toLowerCase();
    const resultBox = document.getElementById("kapanDialerResult");
    if (!resultBox) return;

    if (!q) {
      alert("❌ કૃપા કરીને કાપણ નંબર લખો!");
      return;
    }

    const k = (state.kapans || []).find(x => x.kapanNo.toLowerCase() === q || x.kapanNo.toLowerCase().includes(q));
    if (!k) {
      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div style="background:#fee2e2; border:1px solid #fca5a5; padding:15px; border-radius:8px; color:#991b1b; font-weight:700; text-align:left;">
          ❌ કાપણ '${q}' સિસ્ટમમાં મળ્યું નથી! (Kapan not found)
        </div>
      `;
      return;
    }

    const rough = (state.roughLots || []).find(r => r.id === k.roughId);
    const chart = (state.polishCharts || []).find(pc => pc.kapanNo.toLowerCase() === k.kapanNo.toLowerCase());

    resultBox.style.display = "block";

    // Scenario A: Completed / OK KAPAN
    if (k.currentDept === "OK KAPAN (ઓકે કાપણ)" || k.status === "Completed") {
      let chartHtml = "";
      if (chart) {
        chartHtml = `
          <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-success" style="font-weight:700;" onclick="viewChartDetailsPopup('${k.kapanNo}')">📄 ચાર્ટ જુઓ (View Chart)</button>
            <button class="btn btn-purple" style="font-weight:700;" onclick="editPolishChartFromDialer('${k.id}')">✏️ ચાર્ટ એડિટ કરો (Edit Chart)</button>
            <button class="btn btn-outline" style="font-weight:700; color:#10b981; border-color:#10b981;" onclick="downloadPolishChartFromDialer('${chart.id}', '${chart.kapanNo}')">🖼️ ઈમેજ ડાઉનલોડ (Download PNG)</button>
          </div>
        `;
      } else {
        chartHtml = `
          <div style="margin-top:10px; background:#fffbeb; border:1px solid #fef3c7; color:#b45309; padding:10px; border-radius:6px; font-weight:600;">
            ⚠️ કાપણ પૂર્ણ થયેલ છે પરંતુ પોલિશ ચાર્ટ હજુ સુધી બનાવવામાં આવ્યો નથી.
          </div>
          <div style="margin-top:10px;">
            <button class="btn btn-purple" style="font-weight:700;" onclick="goToApproveChart('${k.id}')">➕ પોલિશ ચાર્ટ બનાવો (Create Chart)</button>
          </div>
        `;
      }

      resultBox.innerHTML = `
        <div style="background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:8px; padding:15px; text-align: left;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #bbf7d0; padding-bottom:8px; margin-bottom:10px;">
            <span style="font-size:17px; font-weight:800; color:#166534;">🟢 કાપણ ઓકે છે (Kapan Completed)</span>
            <span style="background:#166534; color:#fff; font-size:11px; padding:3px 8px; border-radius:20px; font-weight:700;">OK KAPAN</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13.5px; font-weight:600;">
            <div>કાપણ નંબર: <span style="color:#166534; font-weight:700;">${k.kapanNo}</span></div>
            <div>રફ સ્ત્રોત: <span style="color:#475569;">${rough ? rough.name : '-'}</span></div>
            <div>આખરી વજન: <span style="color:#166534; font-weight:700;">${Number(k.carat).toFixed(2)} Cts</span></div>
            <div>આખરી નંગ: <span style="color:#166534; font-weight:700;">${k.nang} Pcs</span></div>
          </div>
          ${chartHtml}
        </div>
      `;
    }
    // Scenario B: In progress
    else {
      const makeableSizeVal = k.makeableSize || (k.makeablePiece ? k.makeableVajan / k.makeablePiece : 0);
      const expectedCt = k.poCt || (k.roughWeight ? k.roughWeight * (k.r2pPct || 14.95) / 100 : k.carat * 0.1495);

      resultBox.innerHTML = `
        <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:10px; padding:18px; text-align: left; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #e2e8f0; padding-bottom:10px; margin-bottom:14px;">
            <span style="font-size:17px; font-weight:800; color:var(--primary);">⚙️ ચાલુ પ્રક્રિયામાં છે (Kapan In Progress)</span>
            <span style="background:#e0f2fe; color:#0369a1; font-size:11px; padding:4px 10px; border-radius:20px; font-weight:700; border:1px solid #bae6fd;">${k.currentDept}</span>
          </div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; font-size:13.5px;">
            <div><span style="color:#64748b; font-weight:600;">કાપણ નંબર:</span> <b style="color:#1e293b; font-size:14.5px;">${k.kapanNo}</b></div>
            <div><span style="color:#64748b; font-weight:600;">હાલનો વિભાગ:</span> <b style="color:#0369a1;">${k.currentDept}</b></div>
            <div><span style="color:#64748b; font-weight:600;">ચાલુ વજન:</span> <b style="color:#1e293b;">${Number(k.carat).toFixed(2)} Cts</b></div>
            <div><span style="color:#64748b; font-weight:600;">ચાલુ નંગ:</span> <b style="color:#1e293b;">${k.nang} Pcs</b></div>
            <div><span style="color:#64748b; font-weight:600;">રફ સ્ત્રોત:</span> <b style="color:#475569;">${rough ? rough.name : '-'}</b></div>
            <div><span style="color:#64748b; font-weight:600;">લોટ સંખ્યા (Lots):</span> <b style="color:#475569;">${k.lots || '1'}</b></div>
          </div>

          <!-- Galaxy Makeable Stats -->
          <div style="margin-top:15px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:10px;">
            <div style="font-weight:700; color:#1e40af; font-size:12.5px; border-bottom:1px solid #bfdbfe; padding-bottom:4px; margin-bottom:6px;">🌌 Galaxy Makeable Stats (ગેલેક્સી પ્લેનિંગ વિગતો):</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:12px; font-weight:600; color:#1e3a8a;">
              <div>Makeable વજન: <span>${k.makeableVajan ? Number(k.makeableVajan).toFixed(2) + ' Cts' : '-'}</span></div>
              <div>Makeable નંગ: <span>${k.makeablePiece ? k.makeablePiece + ' Pcs' : '-'}</span></div>
              <div>Makeable સાઈઝ: <span>${makeableSizeVal ? makeableSizeVal.toFixed(4) : '-'}</span></div>
              <div>Rough to Polish %: <span>${k.r2pPct ? Number(k.r2pPct).toFixed(2) + '%' : '-'}</span></div>
              <div>Expected Polish (PO.CT): <span style="font-weight:700; color:#111827;">${expectedCt ? expectedCt.toFixed(2) + ' Cts' : '-'}</span></div>
            </div>
          </div>

          <!-- 4P & RT Cushion Stats -->
          <div style="margin-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:10px; font-size:12px; font-weight:600; color:#166534;">
              <div style="font-weight:700; border-bottom:1px solid #bbf7d0; padding-bottom:3px; margin-bottom:5px;">⚡ 4P Cushion Stats:</div>
              <div>4P વજન: <span>${k.fourPCt ? Number(k.fourPCt).toFixed(2) + ' Cts' : '-'}</span></div>
              <div>4P નંગ: <span>${k.fourPNang ? k.fourPNang + ' Pcs' : '-'}</span></div>
              <div>Cushion %: <span style="font-weight:700; color:#166534;">${k.fourPPct ? Number(k.fourPPct).toFixed(2) + '%' : '-'}</span></div>
            </div>
            <div style="background:#fdf2f8; border:1px solid #fbcfe8; border-radius:6px; padding:10px; font-size:12px; font-weight:600; color:#9d174d;">
              <div style="font-weight:700; border-bottom:1px solid #fbcfe8; padding-bottom:3px; margin-bottom:5px;">💎 RT Cushion Stats:</div>
              <div>RT વજન: <span>${k.rtCt ? Number(k.rtCt).toFixed(2) + ' Cts' : '-'}</span></div>
              <div>RT નંગ: <span>${k.rtNang ? k.rtNang + ' Pcs' : '-'}</span></div>
              <div>Cushion %: <span style="font-weight:700; color:#9d174d;">${k.rtPct ? Number(k.rtPct).toFixed(2) + '%' : '-'}</span></div>
            </div>
          </div>
        </div>
      `;
    }
  }

  function resetKapanDialer() {
    const input = document.getElementById("kapanDialerSearch");
    if (input) input.value = "";
    const resultBox = document.getElementById("kapanDialerResult");
    if (resultBox) {
      resultBox.innerHTML = "";
      resultBox.style.display = "none";
    }
  }

  function editPolishChartFromDialer(kapanId) {
    const k = (state.kapans || []).find(x => x.id === kapanId);
    if (!k) return;
    
    const selectEl = document.getElementById("pcMergedSelect");
    if (selectEl) {
      let opt = Array.from(selectEl.options).find(o => o.value === k.id);
      if (!opt) {
        const newOpt = document.createElement("option");
        newOpt.value = k.id;
        newOpt.innerText = `[⚠️ મંજૂરી બાકી] ${k.kapanNo} (${k.carat} Cts)`;
        selectEl.appendChild(newOpt);
        selectEl.value = k.id;
      } else {
        selectEl.value = opt.value;
      }
      loadPolishChartForm();
      
      const formEl = document.getElementById("polishChartFormCard");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  function downloadPolishChartFromDialer(chartId, kapanNo) {
    const listCard = document.getElementById(`pcCard_${chartId}`);
    if (listCard) {
      exportChartAsImage(`pcCard_${chartId}`, kapanNo);
    } else {
      viewChartDetailsPopup(kapanNo);
      setTimeout(() => {
        exportChartAsImage(`pcCardModal_${chartId}`, kapanNo);
        closeChartViewModal();
      }, 500);
    }
  }

  function goToApproveChart(kapanId) {
    const k = (state.kapans || []).find(x => x.id === kapanId);
    if (!k) return;
    
    // Switch to Polish Chart view page
    switchPage('polish_chart');
    
    const selectEl = document.getElementById("pcMergedSelect");
    if (selectEl) {
      let opt = Array.from(selectEl.options).find(o => o.value === k.id);
      if (!opt) {
        const newOpt = document.createElement("option");
        newOpt.value = k.id;
        newOpt.innerText = `[⚠️ મંજૂરી બાકી] ${k.kapanNo} (${k.carat} Cts)`;
        selectEl.appendChild(newOpt);
        selectEl.value = k.id;
      } else {
        selectEl.value = opt.value;
      }
      loadPolishChartForm();
      
      const formEl = document.getElementById("polishChartFormCard");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  window.onerror = function(message, source, lineno, colno, error) {
    alert("JavaScript Error:\n" + message + "\nLine: " + lineno + "\nSource: " + source);
    return false;
  };
  const safeStorage = {
    getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn("Storage item read failed:", e);
        return this._data[key] || null;
      }
    },
    setItem(key, val) {
      try {
        localStorage.setItem(key, val);
      } catch (e) {
        console.warn("Storage item write failed:", e);
        this._data[key] = String(val);
      }
    },
    removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn("Storage item remove failed:", e);
        delete this._data[key];
      }
    },
    _data: {}
  };

  let DEPTS = [
    "Galaxy",
    "AP OK",
    "4P",
    "4P OK RT BAAKI",
    "RT",
    "RT OK KHATA BAAKI",
    "KHATA",
    "OK KAPAN (ઓકે કાપણ)"
  ];

  let state = {
    auth: {
      adminPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", // "123"
      stockPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", // "123"
      editPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"  // "123"
    },
    majuriRate: 65,
    roughLots: [],
    kapans: [],
    transfers: [],
    repairs: [],
    audits: [],
    polishCharts: [],
    transferRules: [
      { from: "Galaxy", to: "AP OK", customHeader: "Rough to Polish %", isCompulsory: true },
      { from: "4P", to: "RT", customHeader: "4P Output Carats", isCompulsory: true }
    ],
    depts: [],
    deptConfigs: {}
  };

  let currentUser = null;
  let currentRole = "Stock";
  let activeTagFilter = "";
  let selectedBatchIds = new Set();

  window.onload = function() {
    loadState();
    checkInitialData();

    // Check for remembered credentials
    const remRole = safeStorage.getItem("remembered_role");
    const remPass = safeStorage.getItem("remembered_password");
    if (remRole && remPass) {
      const roleEl = document.getElementById("loginRole");
      const passEl = document.getElementById("loginPass");
      const remEl = document.getElementById("rememberMe");
      if (roleEl) roleEl.value = remRole;
      if (passEl) passEl.value = remPass;
      if (remEl) remEl.checked = true;
    }

    // Show login page, hide app interface on load (login system active)
    const loginPage = document.getElementById("loginPage");
    const appInterface = document.getElementById("appInterface");
    if (loginPage) loginPage.style.display = "flex";
    if (appInterface) appInterface.style.display = "none";
  };

  const DEFAULT_DEPT_CONFIGS = {
    "Galaxy": { receivesFrom: [], sendsTo: ["AP OK"], customHeader: "", isCompulsory: false, ratePerPiece: 5, fieldsConfig: { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: false, compulsory: false } } },
    "AP OK": { receivesFrom: ["Galaxy"], sendsTo: ["4P"], customHeader: "", isCompulsory: false, ratePerPiece: 5, fieldsConfig: { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: false, compulsory: false } } },
    "4P": { receivesFrom: ["AP OK"], sendsTo: ["4P OK RT BAAKI"], customHeader: "", isCompulsory: false, ratePerPiece: 8, fieldsConfig: { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: true, compulsory: true } } },
    "4P OK RT BAAKI": { receivesFrom: ["4P"], sendsTo: ["RT"], customHeader: "", isCompulsory: false, ratePerPiece: 5, fieldsConfig: { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: true, compulsory: true } } },
    "RT": { receivesFrom: ["4P OK RT BAAKI"], sendsTo: ["RT OK KHATA BAAKI"], customHeader: "", isCompulsory: false, ratePerPiece: 6, fieldsConfig: { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: true, compulsory: true } } },
    "RT OK KHATA BAAKI": { receivesFrom: ["RT"], sendsTo: ["KHATA"], customHeader: "", isCompulsory: false, ratePerPiece: 5, fieldsConfig: { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: true, compulsory: true } } },
    "KHATA": { receivesFrom: ["RT OK KHATA BAAKI"], sendsTo: ["OK KAPAN (ઓકે કાપણ)"], customHeader: "", isCompulsory: false, ratePerPiece: 7, fieldsConfig: { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: true, compulsory: true } } },
    "OK KAPAN (ઓકે કાપણ)": { receivesFrom: ["KHATA"], sendsTo: [], customHeader: "", isCompulsory: false, ratePerPiece: 10, fieldsConfig: { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: true, compulsory: true } } }
  };

  // Native SHA-256 Hashing helper
  // Pure JS SHA-256 implementation (Works in secure and unsecure contexts like file:///)
  async function sha256(str) {
    if (window.crypto && crypto.subtle) {
      try {
        const msgUint8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        return hashHex;
      } catch (e) {
        console.warn("Subtle crypto failed, falling back to pure JS sha256Sync:", e);
      }
    }
    return sha256Sync(str);
  }

  function sha256Sync(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;

    var result = '';

    var words = [];
    var asciiLength = ascii[lengthProperty];
    var hash = [];
    var k = [];
    
    var primeCounter = 0;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) {
      ascii += '\x00';
    }
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << ((3 - i) % 4 * 8);
    }
    words[words[lengthProperty]] = ((asciiLength * 8) / maxWord) | 0;
    words[words[lengthProperty]] = (asciiLength * 8) | 0;
    
    for (i = 0; i < words[lengthProperty]; i += 16) {
      var w = words.slice(i, i + 16);
      var oldHash = hash.slice(0);
      
      var a = hash[0], b = hash[1], c = hash[2], d = hash[3],
          e = hash[4], f = hash[5], g = hash[6], h = hash[7];
          
      for (j = 0; j < 64; j++) {
        if (j < 16) {
          w[j] = w[j] || 0;
        } else {
          var s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
          var s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
          w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
        }
        
        var S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        var ch = (e & f) ^ (~e & g);
        var temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
        
        var S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (S0 + maj) | 0;
        
        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }
      
      hash[0] = (hash[0] + a) | 0;
      hash[1] = (hash[1] + b) | 0;
      hash[2] = (hash[2] + c) | 0;
      hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0;
      hash[5] = (hash[5] + f) | 0;
      hash[6] = (hash[6] + g) | 0;
      hash[7] = (hash[7] + h) | 0;
    }
    
    for (i = 0; i < 8; i++) {
      var hex = (hash[i] >>> 0).toString(16);
      result += '0'.repeat(8 - hex.length) + hex;
    }
    return result;
  }

  function ensureAuthHashesSync(authObj) {
    if (!authObj) authObj = {};
    const defaultHash = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
    
    if (!authObj.adminPassHash) {
      if (authObj.adminPass) {
        authObj.adminPassHash = sha256Sync(authObj.adminPass.trim());
      } else {
        authObj.adminPassHash = defaultHash;
      }
    }
    if (!authObj.stockPassHash) {
      if (authObj.stockPass) {
        authObj.stockPassHash = sha256Sync(authObj.stockPass.trim());
      } else {
        authObj.stockPassHash = defaultHash;
      }
    }
    if (!authObj.editPassHash) {
      if (authObj.editPassword) {
        authObj.editPassHash = sha256Sync(authObj.editPassword.trim());
      } else if (authObj.editPass) {
        authObj.editPassHash = sha256Sync(authObj.editPass.trim());
      } else {
        authObj.editPassHash = defaultHash;
      }
    }
    return authObj;
  }

  let dbRef = null;
  function initFirebase() {
    const config = state.firebaseConfig;
    if (config && config.apiKey && config.dbUrl && config.projectId) {
      try {
        const firebaseConfig = {
          apiKey: config.apiKey,
          databaseURL: config.dbUrl,
          projectId: config.projectId
        };
        if (!window.firebase) {
          console.warn("Firebase SDK not loaded yet.");
          return;
        }
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        dbRef = firebase.database().ref("diamond_stock_system");
        
        // One-time overwrite to wipe old remote Firebase database entries and start clean
        if (!state.firebaseWiped) {
          dbRef.set(state).then(() => {
            state.firebaseWiped = true;
            saveState();
            console.log("Firebase wiped clean and initialized with fresh schema.");
          }).catch(err => {
            console.warn("Firebase initial wipe failed (rules might prevent write):", err);
          });
        } else {
          // Listen for updates and download from Firebase
          dbRef.once("value").then((snapshot) => {
            const val = snapshot.val();
            if (val) {
              state = val;
              state.auth = ensureAuthHashesSync(state.auth);
              if (!state.kapans) state.kapans = [];
              if (!state.roughLots) state.roughLots = [];
              if (!state.transfers) state.transfers = [];
              if (!state.repairs) state.repairs = [];
              if (!state.audits) state.audits = [];
              if (!state.polishCharts) state.polishCharts = [];
              if (!state.deptConfigs) state.deptConfigs = {};
              saveState();
              renderAll();
            }
          }).catch(err => {
            console.warn("Firebase initial read failed:", err);
          });
        }

        // Listen for live changes with error handler
        dbRef.on("value", (snapshot) => {
          const val = snapshot.val();
          if (val && JSON.stringify(val) !== JSON.stringify(state)) {
            state = val;
            state.auth = ensureAuthHashesSync(state.auth);
            if (!state.kapans) state.kapans = [];
            if (!state.roughLots) state.roughLots = [];
            if (!state.transfers) state.transfers = [];
            if (!state.repairs) state.repairs = [];
            if (!state.audits) state.audits = [];
            if (!state.polishCharts) state.polishCharts = [];
            if (!state.deptConfigs) state.deptConfigs = {};
            saveState();
            renderAll();
          }
        }, (error) => {
          console.warn("Firebase live update listener cancelled (check rules):", error);
        });
      } catch (e) {
        console.error("Firebase init failed:", e);
      }
    }
  }

  function syncToFirebase() {
    if (dbRef) {
      dbRef.set(state).catch(e => console.error("Firebase sync error:", e));
    }
  }

  function loadState() {
    const saved = safeStorage.getItem("diamond_stock_state_v7");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved) || {};
        let authObj = parsed.auth || {};
        if (!authObj.adminPassHash) {
          authObj.adminPassHash = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
        }
        if (!authObj.stockPassHash) {
          authObj.stockPassHash = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
        }
        if (!authObj.editPassHash) {
          authObj.editPassHash = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
        }
        state = {
          auth: authObj,
          majuriRate: parsed.majuriRate !== undefined ? parsed.majuriRate : 65,
          roughLots: parsed.roughLots || [],
          kapans: parsed.kapans || [],
          transfers: parsed.transfers || [],
          repairs: parsed.repairs || [],
          audits: parsed.audits || [],
          polishCharts: parsed.polishCharts || [],
          prunedMockData_v6: parsed.prunedMockData_v6 || false,
          transferRules: parsed.transferRules || [
            { from: "Galaxy", to: "4P", customHeader: "GLX Top Size", isCompulsory: true },
            { from: "4P", to: "RT", customHeader: "4P Output Carats", isCompulsory: true }
          ],
          depts: parsed.depts || [],
          deptConfigs: parsed.deptConfigs || {},
          autoLogoutHours: parsed.autoLogoutHours !== undefined ? parsed.autoLogoutHours : 11,
          firebaseConfig: parsed.firebaseConfig || { apiKey: "AIzaSyDvu7pJMXatKNHFAuJMtsh_zpmb8Jr0BCM", dbUrl: "https://ng-cost-default-rtdb.firebaseio.com", projectId: "ng-cost" }
        };

        if (state.depts && state.depts.length > 0) {
          DEPTS = state.depts
            .map(d => {
              if (d === "GALAXY-DP") return "Galaxy";
              if (d === "RT OK RA BAAKI") return "RT OK KHATA BAAKI";
              if (d === "POLISH (MUM-STOCK)" || d === "POLISH (SHOWCASE-STOCK)") return "OK KAPAN (ઓકે કાપણ)";
              return d;
            })
            .filter(d => d !== "RA" && d !== "LOTING" && d !== "Sales Stock");
          state.depts = [...DEPTS];

          // Also clean/map existing kapans' current departments
          if (state.kapans && Array.isArray(state.kapans)) {
            state.kapans.forEach(k => {
              if (k.currentDept === "GALAXY-DP") k.currentDept = "Galaxy";
              if (k.currentDept === "RT OK RA BAAKI") k.currentDept = "RT OK KHATA BAAKI";
              if (k.currentDept === "RA") k.currentDept = "KHATA";
              if (k.currentDept === "POLISH (MUM-STOCK)" || k.currentDept === "POLISH (SHOWCASE-STOCK)") k.currentDept = "OK KAPAN (ઓકે કાપણ)";
            });
          }
        } else {
          state.depts = [...DEPTS];
        }
        if (!state.deptConfigs || Object.keys(state.deptConfigs).length === 0) {
          state.deptConfigs = JSON.parse(JSON.stringify(DEFAULT_DEPT_CONFIGS));
        }

        // Clean up 4P customHeader default config
        if (state.deptConfigs && state.deptConfigs["4P"]) {
          state.deptConfigs["4P"].customHeader = "";
          state.deptConfigs["4P"].isCompulsory = false;
        }

        // Ensure password hashes are present
        state.auth = ensureAuthHashesSync(state.auth);

        // Save migrated state back
        safeStorage.setItem("diamond_stock_state_v7", JSON.stringify(state));
        initFirebase();
      } catch(e) { 
        console.error("Load error", e); 
      }
    } else {
      state.depts = [...DEPTS];
      state.deptConfigs = JSON.parse(JSON.stringify(DEFAULT_DEPT_CONFIGS));
      state.autoLogoutHours = 11;
      state.firebaseConfig = { apiKey: "AIzaSyDvu7pJMXatKNHFAuJMtsh_zpmb8Jr0BCM", dbUrl: "https://ng-cost-default-rtdb.firebaseio.com", projectId: "ng-cost" };
      state.firebaseWiped = false;
    }
    initFirebase();
  }

  function saveState() {
    if (!state.deptConfigs) state.deptConfigs = {};
    state.depts = [...DEPTS];
    DEPTS.forEach(d => {
      if (!state.deptConfigs[d]) {
        state.deptConfigs[d] = { receivesFrom: [], sendsTo: [], customHeader: "", isCompulsory: false, ratePerPiece: 5 };
      }
    });
    safeStorage.setItem("diamond_stock_state_v7", JSON.stringify(state));
    syncToFirebase();
  }

  function checkInitialData() {
    // Run cleanup of old mock data EXACTLY ONCE to protect future live entries
    if (!state.prunedMockData_v6 || (state.kapans && state.kapans.length < 5)) {
      state.roughLots = [
        { id: "R_AL65", name: "try 000", party: "Anilbhai", carats: 97.88, rate: 2770, finalRoughAmt: 271128, vigat: "AL 65 Rough", date: "2026-06-11T12:00:00Z" },
        { id: "R_LOT101", name: "lot 101", party: "Kiritbhai", carats: 500.00, rate: 2500, finalRoughAmt: 1250000, vigat: "Lot 101 Raw", date: "2026-07-20T10:00:00Z" }
      ];

      state.kapans = [
        { 
          id: "K_M1_124", kapanNo: "M-1-124", roughId: "R_AL65", carat: 25.34, nang: 4664, roughWeight: 97.88, roughNang: 1819,
          currentDept: "OK KAPAN (ઓકે કાપણ)", tag: "Regular", status: "Completed", vigat: "ઓકે કાપણ", 
          vehicleTracking: "", createdDate: "2026-06-04T12:00:00Z", lastMovedDate: "2026-06-11T07:12:00Z",
          makeablePiece: 4636, makeableVajan: 27.86, fourPNang: 4605, fourPCt: 36.49, rtNang: 4605,
          rtCt: 35.00, rtPct: 95.92, fourPPct: 23.65, r2pPct: 28.47
        },
        { 
          id: "K_M1_125", kapanNo: "M-1-125", roughId: "R_AL65", carat: 13.50, nang: 2400, roughWeight: 50.00, roughNang: 2400,
          currentDept: "OK KAPAN (ઓકે કાપણ)", tag: "Urgent", status: "Completed", vigat: "ડેમો કાપણ ૨", 
          vehicleTracking: "", createdDate: "2026-06-10T09:00:00Z", lastMovedDate: "2026-06-18T14:30:00Z",
          makeablePiece: 2400, makeableVajan: 15.00, fourPNang: 2380, fourPCt: 19.50, rtNang: 2380,
          rtCt: 18.20, rtPct: 93.33, fourPPct: 23.08, r2pPct: 27.00
        },
        { 
          id: "K_M1_126", kapanNo: "M-1-126", roughId: "R_LOT101", carat: 20.00, nang: 3500, roughWeight: 75.00, roughNang: 3500,
          currentDept: "OK KAPAN (ઓકે કાપણ)", tag: "Regular", status: "Completed", vigat: "ડેમો કાપણ ૩", 
          vehicleTracking: "", createdDate: "2026-07-21T08:00:00Z", lastMovedDate: "2026-07-29T10:15:00Z",
          makeablePiece: 3450, makeableVajan: 22.00, fourPNang: 3400, fourPCt: 28.00, rtNang: 3400,
          rtCt: 26.50, rtPct: 94.64, fourPPct: 21.43, r2pPct: 26.67
        },
        { 
          id: "K_M1_127", kapanNo: "M-1-127", roughId: "R_LOT101", carat: 60.00, nang: 1100, roughWeight: 60.00, roughNang: 1100,
          currentDept: "Galaxy", tag: "Regular", status: "Chalu", vigat: "ગેલેક્ષી પ્રોસેસ ચાલુ", 
          vehicleTracking: "", createdDate: "2026-07-22T10:00:00Z", lastMovedDate: "2026-07-22T10:00:00Z"
        },
        { 
          id: "K_M1_128", kapanNo: "M-1-128", roughId: "R_LOT101", carat: 40.00, nang: 800, roughWeight: 40.00, roughNang: 800,
          currentDept: "AP OK", tag: "Sample", status: "Chalu", vigat: "એસોસોર્ટમેન્ટ પ્લાનિંગ ઓકે", 
          vehicleTracking: "", createdDate: "2026-07-23T11:00:00Z", lastMovedDate: "2026-07-24T12:00:00Z"
        },
        { 
          id: "K_M1_129", kapanNo: "M-1-129", roughId: "R_LOT101", carat: 80.00, nang: 1500, roughWeight: 80.00, roughNang: 1500,
          currentDept: "4P", tag: "Regular", status: "Chalu", vigat: "4P લેસર ચાલુ", 
          vehicleTracking: "", createdDate: "2026-07-24T09:00:00Z", lastMovedDate: "2026-07-26T15:00:00Z",
          makeablePiece: 1480, makeableVajan: 25.00
        },
        { 
          id: "K_M1_130", kapanNo: "M-1-130", roughId: "R_AL65", carat: 55.00, nang: 950, roughWeight: 55.00, roughNang: 950,
          currentDept: "RT", tag: "Urgent", status: "Chalu", vigat: "RT ગર્ડલ બ્રુટિંગ", 
          vehicleTracking: "", createdDate: "2026-07-25T14:00:00Z", lastMovedDate: "2026-07-28T09:30:00Z",
          makeablePiece: 940, makeableVajan: 16.50, fourPNang: 935, fourPCt: 22.10, fourPPct: 25.34
        },
        { 
          id: "K_M1_131", kapanNo: "M-1-131", roughId: "R_LOT101", carat: 45.00, nang: 820, roughWeight: 45.00, roughNang: 820,
          currentDept: "KHATA", tag: "Regular", status: "Chalu", vigat: "ખાતા વિભાગમાં તળિયું/પહેલ કામ ચાલુ", 
          vehicleTracking: "", createdDate: "2026-07-26T10:30:00Z", lastMovedDate: "2026-07-30T11:00:00Z",
          makeablePiece: 810, makeableVajan: 13.80, fourPNang: 805, fourPCt: 18.20, fourPPct: 24.18,
          rtNang: 805, rtCt: 17.50, rtPct: 96.15
        },
        { 
          id: "K_M1_132", kapanNo: "M-1-132", roughId: "R_AL65", carat: 29.00, nang: 3470, roughWeight: 90.00, roughNang: 1700,
          currentDept: "OK KAPAN (ઓકે કાપણ)", tag: "Regular", status: "Completed", vigat: "try 000", 
          vehicleTracking: "", createdDate: "2026-07-27T08:00:00Z", lastMovedDate: "2026-07-27T15:00:00Z",
          makeablePiece: 3500, makeableVajan: 31.50, fourPNang: 3490, fourPCt: 39.50, rtNang: 3490,
          rtCt: 38.50, rtPct: 97.47, fourPPct: 20.25, r2pPct: 35.00, roughRate: 2029
        },
        { 
          id: "K_M1_133", kapanNo: "M-1-133", roughId: "R_LOT101", carat: 70.00, nang: 1300, roughWeight: 70.00, roughNang: 1300,
          currentDept: "4P", tag: "Sample", status: "Chalu", vigat: "4P લેસર કટિંગ ચાલુ", 
          vehicleTracking: "", createdDate: "2026-07-28T16:00:00Z", lastMovedDate: "2026-07-29T10:00:00Z",
          makeablePiece: 1290, makeableVajan: 21.00
        }
      ];

      state.polishCharts = [
        {
          id: "PC_M1_124", kapanNo: "M-1-124", roughName: "try 000", date: "2026-06-11", status: "Approved",
          assort: "A-1", reAssort: "RA-1", micron: "M-1", shading: "S-1",
          tableAssort: "OK", tableGlx: "OK", table4P: "79.5%", tableRT: "43.4%",
          tableReAssort: "OK", tableKhata: "OK", tableJama: "જમા", tableVigat: "",
          rWeight: 97.88, rSize: "18.5839", cardSize: 126.20,
          reqWeightPct: 28.47, fourPPct: 23.65, rtPct: 95.92,
          multPct: 25.89, rToPolishPct: 25.89, varPct: -2.58,
          weightFormula: "-2.53 * 2770", gNangFormula: "4664 * 65",
          polishNang: 4664, polishCarat: 25.34, padtar: 22663,
          s65: 33.0, s4: 34.0, s2: 12.0, s20: 14.0, s00: 2.0, s000: 5.0, s2plus: 79.0, s2minus: 21.0,
          g5a7: 0, g8a10b: 0, g1112: 0, gwhnw: 0, gowttlb: 0, gtlblbdb: 0, vigat: ""
        },
        {
          id: "PC_M1_125", kapanNo: "M-1-125", roughName: "try 000", date: "2026-06-18", status: "Approved",
          assort: "A-2", reAssort: "RA-1", micron: "M-2", shading: "S-2",
          tableAssort: "OK", tableGlx: "OK", table4P: "80.0%", tableRT: "42.0%",
          tableReAssort: "OK", tableKhata: "OK", tableJama: "જમા", tableVigat: "",
          rWeight: 50.00, rSize: "20.0000", cardSize: 65.00,
          reqWeightPct: 27.00, fourPPct: 23.08, rtPct: 93.33,
          multPct: 27.00, rToPolishPct: 27.00, varPct: 0.00,
          weightFormula: "0.00 * 2770", gNangFormula: "2400 * 65",
          polishNang: 2400, polishCarat: 13.50, padtar: 21852,
          s65: 30.0, s4: 35.0, s2: 15.0, s20: 10.0, s00: 5.0, s000: 5.0, s2plus: 80.0, s2minus: 20.0,
          g5a7: 0, g8a10b: 0, g1112: 0, gwhnw: 0, gowttlb: 0, gtlblbdb: 0, vigat: ""
        },
        {
          id: "PC_M1_126", kapanNo: "M-1-126", roughName: "lot 101", date: "2026-07-29", status: "Approved",
          assort: "A-1", reAssort: "RA-2", micron: "M-1", shading: "S-1",
          tableAssort: "OK", tableGlx: "OK", table4P: "78.0%", tableRT: "45.0%",
          tableReAssort: "OK", tableKhata: "OK", tableJama: "જમા", tableVigat: "",
          rWeight: 75.00, rSize: "21.5000", cardSize: 98.00,
          reqWeightPct: 26.67, fourPPct: 21.43, rtPct: 94.64,
          multPct: 26.67, rToPolishPct: 26.67, varPct: 0.00,
          weightFormula: "0.00 * 2500", gNangFormula: "3500 * 65",
          polishNang: 3500, polishCarat: 20.00, padtar: 20750,
          s65: 35.0, s4: 30.0, s2: 15.0, s20: 10.0, s00: 5.0, s000: 5.0, s2plus: 80.0, s2minus: 20.0,
          g5a7: 0, g8a10b: 0, g1112: 0, gwhnw: 0, gowttlb: 0, gtlblbdb: 0, vigat: ""
        },
        {
          id: "PC_M1_132", kapanNo: "M-1-132", roughName: "try 000", date: "2026-07-27", status: "Approved",
          assort: "A-1", reAssort: "RA-1", micron: "M-1", shading: "S-1",
          tableAssort: "OK", tableGlx: "OK", table4P: "79.5%", tableRT: "43.4%",
          tableReAssort: "OK", tableKhata: "OK", tableJama: "જમા", tableVigat: "",
          rWeight: 90.00, rSize: "18.8889", cardSize: 111.11,
          reqWeightPct: 35.00, fourPPct: 20.25, rtPct: 97.47,
          multPct: 35.00, rToPolishPct: 32.22, varPct: -2.78,
          weightFormula: "2.50 * 2029", gNangFormula: "3470 * 65",
          polishNang: 3470, polishCarat: 29.00, padtar: 14080,
          s65: 33.0, s4: 34.0, s2: 12.0, s20: 14.0, s00: 2.0, s000: 5.0, s2plus: 79.0, s2minus: 21.0,
          g5a7: 0, g8a10b: 0, g1112: 0, gwhnw: 0, gowttlb: 0, gtlblbdb: 0, vigat: ""
        }
      ];

      state.transfers = [
        { id: "TR_M1_124_1", kapanNo: "M-1-124", fromDept: "Galaxy", toDept: "AP OK", prevCarat: 97.88, prevNang: 1819, carat: 97.88, nang: 1819, vigat: "Galaxy completed", timestamp: "2026-06-06T00:00:00Z" },
        { id: "TR_M1_124_2", kapanNo: "M-1-124", fromDept: "AP OK", toDept: "4P", prevCarat: 97.88, prevNang: 1819, carat: 97.88, nang: 1819, vigat: "Assortment planning done", timestamp: "2026-06-06T12:00:00Z" },
        { id: "TR_M1_124_3", kapanNo: "M-1-124", fromDept: "4P", toDept: "RT", prevCarat: 97.88, prevNang: 1819, carat: 36.49, nang: 4605, vigat: "4P laser done", timestamp: "2026-06-08T12:00:00Z" },
        { id: "TR_M1_124_4", kapanNo: "M-1-124", fromDept: "RT", toDept: "KHATA", prevCarat: 36.49, prevNang: 4605, carat: 35.00, nang: 4605, vigat: "Girdle & table prepped", timestamp: "2026-06-09T12:00:00Z" },
        { id: "TR_M1_124_5", kapanNo: "M-1-124", fromDept: "KHATA", toDept: "OK KAPAN (ઓકે કાપણ)", prevCarat: 35.00, prevNang: 4605, carat: 25.34, nang: 4664, vigat: "Polished and completed", timestamp: "2026-06-11T07:12:00Z" },

        { id: "TR_M1_125_1", kapanNo: "M-1-125", fromDept: "Galaxy", toDept: "AP OK", prevCarat: 50.00, prevNang: 2400, carat: 50.00, nang: 2400, vigat: "Galaxy ok", timestamp: "2026-06-11T10:00:00Z" },
        { id: "TR_M1_125_2", kapanNo: "M-1-125", fromDept: "AP OK", toDept: "4P", prevCarat: 50.00, prevNang: 2400, carat: 50.00, nang: 2400, vigat: "AP ok", timestamp: "2026-06-12T11:00:00Z" },
        { id: "TR_M1_125_3", kapanNo: "M-1-125", fromDept: "4P", toDept: "RT", prevCarat: 50.00, prevNang: 2400, carat: 19.50, nang: 2380, vigat: "4p ok", timestamp: "2026-06-14T15:00:00Z" },
        { id: "TR_M1_125_4", kapanNo: "M-1-125", fromDept: "RT", toDept: "KHATA", prevCarat: 19.50, prevNang: 2380, carat: 18.20, nang: 2380, vigat: "rt ok", timestamp: "2026-06-16T12:00:00Z" },
        { id: "TR_M1_125_5", kapanNo: "M-1-125", fromDept: "KHATA", toDept: "OK KAPAN (ઓકે કાપણ)", prevCarat: 18.20, prevNang: 2380, carat: 13.50, nang: 2400, vigat: "Completed", timestamp: "2026-06-18T14:30:00Z" },

        { id: "TR_M1_126_1", kapanNo: "M-1-126", fromDept: "Galaxy", toDept: "AP OK", prevCarat: 75.00, prevNang: 3500, carat: 75.00, nang: 3500, vigat: "Galaxy ok", timestamp: "2026-07-22T10:00:00Z" },
        { id: "TR_M1_126_2", kapanNo: "M-1-126", fromDept: "AP OK", toDept: "4P", prevCarat: 75.00, prevNang: 3500, carat: 75.00, nang: 3500, vigat: "AP ok", timestamp: "2026-07-23T11:00:00Z" },
        { id: "TR_M1_126_3", kapanNo: "M-1-126", fromDept: "4P", toDept: "RT", prevCarat: 75.00, prevNang: 3500, carat: 28.00, nang: 3400, vigat: "4p ok", timestamp: "2026-07-25T12:00:00Z" },
        { id: "TR_M1_126_4", kapanNo: "M-1-126", fromDept: "RT", toDept: "KHATA", prevCarat: 28.00, prevNang: 3400, carat: 26.50, nang: 3400, vigat: "rt ok", timestamp: "2026-07-27T10:00:00Z" },
        { id: "TR_M1_126_5", kapanNo: "M-1-126", fromDept: "KHATA", toDept: "OK KAPAN (ઓકે કાપણ)", prevCarat: 26.50, prevNang: 3400, carat: 20.00, nang: 3500, vigat: "Completed", timestamp: "2026-07-29T10:15:00Z" },

        { id: "TR_M1_132_1", kapanNo: "M-1-132", fromDept: "Galaxy", toDept: "AP OK", prevCarat: 90.00, prevNang: 1700, carat: 89.90, nang: 3500, vigat: "[Rough to Polish %: 35] Galaxy to AP OK", timestamp: "2026-07-27T09:00:00Z" },
        { id: "TR_M1_132_2", kapanNo: "M-1-132", fromDept: "AP OK", toDept: "4P", prevCarat: 89.90, prevNang: 3500, carat: 89.00, nang: 3495, vigat: "[Lots: 70] AP OK to 4P", timestamp: "2026-07-27T10:00:00Z" },
        { id: "TR_M1_132_3", kapanNo: "M-1-132", fromDept: "4P", toDept: "4P OK RT BAAKI", prevCarat: 89.00, prevNang: 3495, carat: 39.50, nang: 3490, vigat: "[Lots: 70] 4P to 4P OK RT BAAKI", timestamp: "2026-07-27T11:00:00Z" },
        { id: "TR_M1_132_4", kapanNo: "M-1-132", fromDept: "4P OK RT BAAKI", toDept: "RT", prevCarat: 39.50, prevNang: 3490, carat: 39.50, nang: 3490, vigat: "RT Transfer", timestamp: "2026-07-27T12:00:00Z" },
        { id: "TR_M1_132_5", kapanNo: "M-1-132", fromDept: "RT", toDept: "RT OK KHATA BAAKI", prevCarat: 39.50, prevNang: 3490, carat: 38.50, nang: 3489, vigat: "RT OK Transfer", timestamp: "2026-07-27T13:00:00Z" },
        { id: "TR_M1_132_6", kapanNo: "M-1-132", fromDept: "RT OK KHATA BAAKI", toDept: "KHATA", prevCarat: 38.50, prevNang: 3489, carat: 38.50, nang: 3489, vigat: "KHATA Transfer", timestamp: "2026-07-27T14:00:00Z" },
        { id: "TR_M1_132_7", kapanNo: "M-1-132", fromDept: "KHATA", toDept: "OK KAPAN (ઓકે કાપણ)", prevCarat: 38.50, prevNang: 3489, carat: 29.00, nang: 3470, vigat: "OK KAPAN Transfer", timestamp: "2026-07-27T15:00:00Z" }
      ];

      state.repairs = [];
      state.prunedMockData_v6 = true;
    }

    if (state.roughLots.length === 0) {
      state.roughLots = [
        { id: "R_AL65", name: "try 000", party: "Anilbhai", carats: 97.88, rate: 2770, finalRoughAmt: 271128, vigat: "AL 65 Rough", date: "2026-06-11T12:00:00Z" },
        { id: "R_LOT101", name: "lot 101", party: "Kiritbhai", carats: 500.00, rate: 2500, finalRoughAmt: 1250000, vigat: "Lot 101 Raw", date: "2026-07-20T10:00:00Z" }
      ];
    }
    if (state.kapans.length === 0) {
      // (This fallback is safe, already handled by prunedMockData_v4 check)
    }
    if (state.polishCharts.length === 0) {
      // (This fallback is safe, already handled by prunedMockData_v4 check)
    }
    if (!state.offlineBackupConfig) {
      state.offlineBackupConfig = {
        intervalDays: 1,
        lastBackupTime: new Date().toISOString(),
        folderSelected: false,
        folderName: ""
      };
    }
    saveState();
  }

  function calculateKraftSize(k) {
    const t = state.transfers.find(x => x.kapanNo === k.kapanNo && x.fromDept.toLowerCase().includes("galaxy"));
    if (t) {
      return t.carat > 0 ? (t.nang / t.carat) : 0;
    }
    return k.roughWeight > 0 ? (k.nang / k.roughWeight) : (k.carat > 0 ? k.nang / k.carat : 0);
  }

  function ensureDraftPolishChart(k) {
    let chart = (state.polishCharts || []).find(pc => pc && pc.kapanNo === k.kapanNo);
    if (!chart) {
      const rough = (state.roughLots || []).find(r => r.id === k.roughId);
      const roughRate = k.roughRate !== undefined ? k.roughRate : (rough ? (rough.rate || 2730) : 2730);
      const roughWeight = k.roughWeight || k.carat;
      const masterMajRate = state.majuriRate !== undefined ? state.majuriRate : 65;
      
      const defaultPolishNang = k.rtNang || k.fourPNang || k.makeablePiece || k.nang;
      const defaultPolishCarat = k.rtCt || k.fourPCt || k.makeableVajan || k.carat;
      const defaultAchievedPct = roughWeight > 0 ? (defaultPolishCarat / roughWeight * 100) : 0;
      const dDays = getDeptDaysForPolishChart(k.kapanNo);

      const roughAmt = roughWeight * roughRate;
      const majuri = defaultPolishNang * masterMajRate;
      const totalExpense = roughAmt + majuri;
      const totalExpenseRounded = Math.round(totalExpense / 100) * 100;
      
      const initialPadtar = defaultPolishCarat > 0 ? Math.round(Math.round(totalExpenseRounded / defaultPolishCarat) / 10) * 10 : 0;

      chart = {
        id: "PC" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        kapanNo: k.kapanNo,
        roughName: rough ? rough.name : "",
        date: new Date().toISOString().split("T")[0],
        status: "Draft",
        assort: "",
        reAssort: "",
        micron: "",
        shading: "",
        
        // Assortment table values
        tableAssort: dDays.assort,
        tableGlx: dDays.galaxy,
        table4P: dDays.fourP,
        tableRT: dDays.rt,
        tableReAssort: dDays.reAssort,
        tableKhata: dDays.khata,
        tableJama: dDays.total,
        tableVigat: "",
        tableRaOut: "",
        tablePoHead: "",
        tableRepairPct: "",

        rWeight: roughWeight,
        rSize: (defaultPolishNang / roughWeight).toFixed(2),
        cardSize: calculateKraftSize(k).toFixed(2),
        reqWeightPct: k.r2pPct || 0,
        fourPPct: k.fourPPct || 0,
        rtPct: k.rtPct || 0,
        multPct: parseFloat(defaultAchievedPct.toFixed(2)),
        rToPolishPct: parseFloat(defaultAchievedPct.toFixed(2)),
        varPct: parseFloat((defaultAchievedPct - (k.r2pPct || 0)).toFixed(2)),
        weightFormula: roughWeight.toFixed(2) + " * " + Math.round(roughRate),
        gNangFormula: Math.round(defaultPolishNang * masterMajRate).toString(),

        // Planning inputs
        salePct: 0,
        flatPct: 0,
        manualPct: 0,
        glxPct: 0,
        outPct: 0,
        roughBhav: roughRate,

        // Sieve sizes
        s65: 0, s4: 0, s2: 0, s20: 0, s00: 0, s000: 0, s2plus: 0, s2minus: 0,

        // Gala ranges
        g5a7: 0,
        g8a10b: 0,
        g1112: 0,
        gwhnw: 0,
        gowttlb: 0,
        gtlblbdb: 0,

        polishNang: defaultPolishNang,
        polishCarat: defaultPolishCarat,
        padtar: initialPadtar,
        vigat: k.vigat || "ઓટો-જનરેટેડ ડ્રાફ્ટ ચાર્ટ"
      };
      state.polishCharts.push(chart);
    }
    return chart;
  }

  function isMatchSearch(kapanNo, query) {
    if (!query) return true;
    const cleanNo = kapanNo.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const cleanQuery = query.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    return cleanNo.includes(cleanQuery) || kapanNo.toLowerCase().includes(query.toLowerCase());
  }

  function isOverdue(lastMovedDateStr) {
    if (!lastMovedDateStr) return false;
    const diffDays = (new Date() - new Date(lastMovedDateStr)) / (1000 * 60 * 60 * 24);
    return diffDays >= 3;
  }

  function showToast(msg, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById("loginRole").value;
    const p = document.getElementById("loginPass").value.trim();
    const errorEl = document.getElementById("loginError");

    // Ensure we have hashes initialized in state.auth
    state.auth = ensureAuthHashesSync(state.auth);

    const inputHash = sha256Sync(p);

    // Accept saved password hash OR universal fallback "123"
    let isValid = false;
    if (role === "Admin") {
      if (inputHash === state.auth.adminPassHash || p === "123") {
        isValid = true;
      }
    } else if (role === "Stock") {
      if (inputHash === state.auth.stockPassHash || p === "123") {
        isValid = true;
      }
    }

    if (isValid) {
      const rememberMe = document.getElementById("rememberMe").checked;
      if (rememberMe) {
        safeStorage.setItem("remembered_role", role);
        safeStorage.setItem("remembered_password", p);
      } else {
        safeStorage.removeItem("remembered_role");
        safeStorage.removeItem("remembered_password");
      }

      currentUser = role === "Admin" ? "Admin" : "Stock Dep";
      currentRole = role;
      document.getElementById("displayUser").innerText = currentUser;
      document.getElementById("roleBadge").innerText = role === "Admin" ? "👑 ADMIN" : "📦 STOCK DEP";
      document.getElementById("loginPage").style.display = "none";
      document.getElementById("appInterface").style.display = "block";
      errorEl.style.display = "none";
      buildNavigation();
      renderAll();
      showToast(`સ્વાગત છે, ${currentUser}!`);
    } else {
      errorEl.innerText = "⚠️ ખોટો પાસવર્ડ! (Password: 123)";
      errorEl.style.display = "block";
    }
  }

  function logout() {
    currentUser = null;
    document.getElementById("appInterface").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";
    const banner = document.getElementById("backupReminderBanner");
    if (banner) banner.style.display = "none";
  }

  function togglePass(id) {
    const input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
  }

  function applyViewMode(mode) {
    const badge = document.getElementById("viewModeBadge");
    if (mode === "mobile") {
      document.body.classList.add("mobile-view");
      badge.innerText = "MOBILE";
    } else {
      document.body.classList.remove("mobile-view");
      badge.innerText = "DESKTOP";
    }
  }

  function toggleCollapsible(id, headerEl) {
    const el = document.getElementById(id);
    if (!el) return;
    const isHidden = el.style.display === "none";
    el.style.display = isHidden ? "block" : "none";
    const chev = headerEl.querySelector(".chevron-symbol");
    if (chev) {
      chev.innerText = isHidden ? "▼" : "▶";
    }
  }

  function buildNavigation() {
    const nav = document.getElementById("mainNav");
    if (currentRole === "Admin") {
      nav.innerHTML = `
        <button class="nav-btn active" onclick="switchPage('admin_dash', event)">📊 Dashboard</button>
        <button class="nav-btn" onclick="switchPage('admin_entry', event)">💎 રફ ખરીદી & સીરીઝ કાપણ</button>
        <button class="nav-btn" onclick="switchPage('admin_sample', event)">🟡 સેમ્પલ ટ્રેકિંગ ડેશબોર્ડ</button>
        <button class="nav-btn" onclick="switchPage('reports', event)">📈 રિપોર્ટ્સ (Reports)</button>
        <button class="nav-btn" onclick="switchPage('audit', event)">📜 સુધારા & ડીલીટ લોગ</button>
        <button class="nav-btn" onclick="switchPage('admin', event)">⚙️ એડમિન માસ્ટર્સ (Settings)</button>
      `;
      switchPage('admin_dash');
    } else {
      nav.innerHTML = `
        <button class="nav-btn active" onclick="switchPage('dash', event)">📊 Dashboard</button>
        <button class="nav-btn" onclick="switchPage('workable_report', event)">📊 Live Stock</button>
        <button class="nav-btn" onclick="switchPage('ledger', event)">📋 કાપણ ડિટેઇલ લેજર</button>
        <button class="nav-btn" onclick="switchPage('polish_chart', event)">📄 પોલિશ ચાર્ટ</button>
        <button class="nav-btn" onclick="switchPage('rep', event)">🔧 રીપેરિંગ</button>
        <button class="nav-btn" onclick="switchPage('reports', event)">📈 રિપોર્ટ્સ (Reports)</button>
        <button class="nav-btn" onclick="switchPage('audit', event)">📜 લોગ્સ</button>
        <button class="nav-btn" onclick="switchPage('stock_masters', event)">⚙️ માસ્ટર્સ (Masters)</button>
      `;
      switchPage('dash');
    }
  }

  function switchPage(pageId, evt) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("show"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    
    const pageEl = document.getElementById(`pg_${pageId}`);
    if (pageEl) pageEl.classList.add("show");

    if (evt && evt.currentTarget) {
      evt.currentTarget.classList.add("active");
    } else {
      const btn = Array.from(document.querySelectorAll(".nav-btn")).find(b => {
        const onc = b.getAttribute("onclick") || "";
        return onc.includes(`'${pageId}'`) || onc.includes(`"${pageId}"`);
      });
      if (btn) btn.classList.add("active");
    }
    renderAll();
  }

  function renderRoughDropdowns() {
    const adSel = document.getElementById("adKRough");
    if (adSel) {
      adSel.innerHTML = (state.roughLots || []).map(r => `<option value="${r.id}">${r.name} (${r.party} - ${r.carats} Cts)</option>`).join("");
    }
  }

  function renderDeptDropdowns() {
    const dFilter = document.getElementById("dashDeptFilter");
    const trFrom = document.getElementById("trFromDept");
    const rpDept = document.getElementById("rpDept");
    const ruleFrom = document.getElementById("ruleFromDept");
    const ruleTo = document.getElementById("ruleToDept");

    if (dFilter) dFilter.innerHTML = `<option value="">— બધા વિભાગ (All Depts) —</option>` + DEPTS.map(d => `<option value="${d}">${d}</option>`).join("");
    if (trFrom) trFrom.innerHTML = DEPTS.filter(d => d !== "Sales Stock").map(d => `<option value="${d}">${d}</option>`).join("");
    if (rpDept) rpDept.innerHTML = DEPTS.map(d => `<option value="${d}">${d}</option>`).join("");
    if (ruleFrom) ruleFrom.innerHTML = DEPTS.map(d => `<option value="${d}">${d}</option>`).join("");
    if (ruleTo) ruleTo.innerHTML = DEPTS.map(d => `<option value="${d}">${d}</option>`).join("");
  }

  function renderAll() {
    renderRoughDropdowns();
    renderDeptDropdowns();

    if (currentRole === "Admin") {
      renderAdminDashboard();
      renderSampleDashboard();
      renderLocalBackupControls("adminLocalBackupArea");
    } else {
      renderStickerGrid();
      renderDashboardTable();
      renderLedgerTable();
      renderPolishChartFormKapan();
      renderPolishChartsList();
      renderWorkableReportTable();
      renderRepairTable();
      renderGhatLogs();
      renderDeptMasterTable();
      renderLocalBackupControls("stockLocalBackupArea");
    }
    renderAuditTable();
    populateAdminSettings();
    checkBackupReminder();
    renderReportsPage();
  }

  // ================= ADMIN DASHBOARD =================
  function renderAdminDashboard() {
    const query = (document.getElementById("adminSearchInput") || {}).value || "";
    const totalRoughCts = state.roughLots.reduce((s, r) => s + Number(r.carats), 0).toFixed(2);
    
    // Filter kapans currently in pipeline (not completed)
    const pipelineKapans = (state.kapans || []).filter(k => k.currentDept !== "OK KAPAN (ઓકે કાપણ)");
    const pipelineNung = pipelineKapans.reduce((s, k) => s + Number(k.nang || 0), 0);
    const pipelineCarats = pipelineKapans.reduce((s, k) => s + Number(k.carat || 0), 0);

    // Filter kapans that are completed and have an Approved Polish Chart
    const approvedKapans = (state.kapans || []).filter(k => {
      const isCompleted = k.currentDept === "OK KAPAN (ઓકે કાપણ)";
      const chart = (state.polishCharts || []).find(pc => pc.kapanNo === k.kapanNo && pc.status === "Approved");
      return isCompleted && chart;
    });
    const approvedNung = approvedKapans.reduce((s, k) => s + Number(k.nang || 0), 0);
    const approvedCarats = approvedKapans.reduce((s, k) => s + Number(k.carat || 0), 0);

    const aiBox = document.getElementById("aiInsightBox");
    aiBox.innerHTML = `
      • કુલ રફ વજન: <b>${totalRoughCts} Cts</b> | ચાલુ નંગ (Pipeline): <b>${pipelineNung} Pcs</b> (${pipelineCarats.toFixed(2)} Cts) | મંજૂર કાપણ નંગ (Approved Polish): <b>${approvedNung} Pcs</b> (${approvedCarats.toFixed(2)} Cts)<br>
      • <b>AI નિરીક્ષણ</b>: સૌથી વધુ નંગ ફ્લો <b>GALAXY-DP & 4P</b> વિભાગમાં એક્ટિવ છે.
    `;

    const grid = document.getElementById("adminStickerGrid");
    grid.innerHTML = DEPTS.map(dept => {
      const deptsKapans = (state.kapans || []).filter(k => k.currentDept === dept);
      const totalNung = deptsKapans.reduce((sum, k) => sum + Number(k.nang || 0), 0);

      return `
        <div class="sticker-card" style="cursor:default; padding: 8px 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; min-height: 65px;">
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${dept}</div>
          <div style="display: flex; justify-content: center; gap: 12px; align-items: center; font-size: 12px; font-weight: 600; color: #475569;">
            <span title="કાપણ સંખ્યા">📦 <b>${deptsKapans.length}</b></span>
            <span style="color: #cbd5e1;">|</span>
            <span title="કુલ નંગ">💎 <b>${totalNung}</b></span>
          </div>
        </div>
      `;
    }).join("");

    renderAdminSummaryTable();

    let grandPurchased = 0;
    let grandManufactured = 0;
    let grandPolish = 0;
    let grandPipeline = 0;
    let grandExpected = 0;

    const tbody = document.getElementById("adminRoughTableBody");
    const tfoot = document.getElementById("adminRoughTableFooter");
    const cardsContainer = document.getElementById("roughSummaryCards");

    const filteredRoughs = state.roughLots.filter(r => {
      if (!query) return true;
      const linked = (state.kapans || []).filter(k => k.roughId === r.id);
      const matchesKapan = linked.some(k => isMatchSearch(k.kapanNo, query));
      return r.name.toLowerCase().includes(query.toLowerCase()) || r.party.toLowerCase().includes(query.toLowerCase()) || matchesKapan;
    });

    state.roughLots.forEach(r => {
      const purchased = Number(r.carats || 0);
      const linked = (state.kapans || []).filter(k => k.roughId === r.id);
      const manufactured = linked.reduce((sum, k) => sum + Number(k.carat || 0), 0);
      
      const polish = linked
        .filter(k => k.currentDept === "OK KAPAN (ઓકે કાપણ)")
        .reduce((sum, k) => sum + Number(k.carat || 0), 0);
      
      const pipeline = linked
        .filter(k => k.currentDept !== "OK KAPAN (ઓકે કાપણ)")
        .reduce((sum, k) => sum + Number(k.carat || 0), 0);
      
      const expected = pipeline * 0.43;

      grandPurchased += purchased;
      grandManufactured += manufactured;
      grandPolish += polish;
      grandPipeline += pipeline;
      grandExpected += expected;
    });

    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div class="sticker-card" style="cursor:default; background:#f0fdf4; border-top: 3px solid #22c55e;">
          <div style="font-size:12px; font-weight:700; color:#166534;">કુલ રફ ખરીદી (Total Purchased)</div>
          <div style="font-size:20px; font-weight:800; color:#14532d; margin-top:5px;">${grandPurchased.toFixed(2)} Cts</div>
        </div>
        <div class="sticker-card" style="cursor:default; background:#eff6ff; border-top: 3px solid #3b82f6;">
          <div style="font-size:12px; font-weight:700; color:#1e40af;">કુલ બનાવેલ કાપણ (Total Manufactured)</div>
          <div style="font-size:20px; font-weight:800; color:#1e3a8a; margin-top:5px;">${grandManufactured.toFixed(2)} Cts</div>
        </div>
        <div class="sticker-card" style="cursor:default; background:#faf5ff; border-top: 3px solid #a855f7;">
          <div style="font-size:12px; font-weight:700; color:#6b21a8;">કુલ પ્રાપ્ત પોલિશ (Total Received Polish)</div>
          <div style="font-size:20px; font-weight:800; color:#581c87; margin-top:5px;">${grandPolish.toFixed(2)} Cts</div>
        </div>
        <div class="sticker-card" style="cursor:default; background:#fef3c7; border-top: 3px solid #f59e0b;">
          <div style="font-size:12px; font-weight:700; color:#92400e;">કુલ ચાલુ પાઇપલાઇન (Total Pipeline)</div>
          <div style="font-size:20px; font-weight:800; color:#78350f; margin-top:5px;">${grandPipeline.toFixed(2)} Cts</div>
        </div>
        <div class="sticker-card" style="cursor:default; background:#fdf2f8; border-top: 3px solid #ec4899;">
          <div style="font-size:12px; font-weight:700; color:#9d174d;">કુલ અપેક્ષિત પોલિશ (Total Expected Polish)</div>
          <div style="font-size:20px; font-weight:800; color:#831843; margin-top:5px;">${grandExpected.toFixed(2)} Cts</div>
        </div>
      `;
    }

    if (tbody) {
      if (filteredRoughs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding:15px; color:#64748b;">કોઈ રફ રેકોર્ડ મળ્યો નથી.</td></tr>`;
      } else {
        tbody.innerHTML = filteredRoughs.map(r => {
          const purchased = Number(r.carats || 0);
          const linked = (state.kapans || []).filter(k => k.roughId === r.id);
          const manufactured = linked.reduce((sum, k) => sum + Number(k.carat || 0), 0);
          const polish = linked
            .filter(k => k.currentDept === "OK KAPAN (ઓકે કાપણ)")
            .reduce((sum, k) => sum + Number(k.carat || 0), 0);
          const pipeline = linked
            .filter(k => k.currentDept !== "OK KAPAN (ઓકે કાપણ)")
            .reduce((sum, k) => sum + Number(k.carat || 0), 0);
          const expected = pipeline * 0.43;

          const detailsHtml = (r.finalRoughAmt || r.sale1Pct || r.sale2Pct || r.flatPct || r.manualPct || r.galaxyPct || r.outPct) ? `
            <details style="font-size: 11px; color: #475569; margin-top: 4px; cursor: pointer; text-align: left;">
              <summary style="color: var(--accent); font-weight: 600; outline: none;">📑 નિયોજન વિગતો (Planning)</summary>
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px; margin-top: 4px; line-height: 1.4;">
                ${r.finalRoughAmt ? `💰 <b>આખરી રકમ:</b> ₹${r.finalRoughAmt.toLocaleString()}<br>` : ''}
                ${r.sale1Pct ? `📊 <b>સેલ 1:</b> ${r.sale1Pct}% @ ₹${r.sale1Rate}/Ct<br>` : ''}
                ${r.sale2Pct ? `📊 <b>સેલ 2:</b> ${r.sale2Pct}% @ ₹${r.sale2Rate}/Ct<br>` : ''}
                ${r.flatPct ? `📉 <b>ફ્લેટ:</b> ${r.flatPct}% @ ₹${r.flatRate}/Ct<br>` : ''}
                ${r.manualPct ? `⚙️ <b>મેન્યુઅલ:</b> ${r.manualPct}%<br>` : ''}
                ${r.galaxyPct ? `🌌 <b>ગેલેક્સી:</b> ${r.galaxyPct}%<br>` : ''}
                ${r.outPct ? `📤 <b>આઉટ:</b> ${r.outPct}% @ ₹${r.outRate}/Ct<br>` : ''}
              </div>
            </details>
          ` : '';

          return `
            <tr>
              <td>
                <b>${r.name}</b> <span style="font-size:11px; color:#64748b; font-weight:normal;">(${r.party})</span>
                ${detailsHtml}
              </td>
              <td>${purchased.toFixed(2)} Cts</td>
              <td>${manufactured.toFixed(2)} Cts</td>
              <td style="color:#6b21a8; font-weight:700;">${polish.toFixed(2)} Cts</td>
              <td style="color:#b45309; font-weight:700;">${pipeline.toFixed(2)} Cts</td>
              <td style="color:#be185d; font-weight:700;">${expected.toFixed(2)} Cts</td>
            </tr>
          `;
        }).join("");
      }
    }

    if (tfoot) {
      tfoot.innerHTML = `
        <tr>
          <td>કુલ (Totals)</td>
          <td>${grandPurchased.toFixed(2)} Cts</td>
          <td>${grandManufactured.toFixed(2)} Cts</td>
          <td style="color:#6b21a8;">${grandPolish.toFixed(2)} Cts</td>
          <td style="color:#b45309;">${grandPipeline.toFixed(2)} Cts</td>
          <td style="color:#be185d;">${grandExpected.toFixed(2)} Cts</td>
        </tr>
      `;
    }
  }

  function renderAdminSummaryTable() {
    const tbody = document.getElementById("adminSummaryTableBody");
    if (!tbody) return;

    let grandNung = 0;
    let grandCarat = 0.0;
    let grandKapan = 0;

    let html = DEPTS.map((dept, index) => {
      const deptsKapans = (state.kapans || []).filter(k => k.currentDept === dept);
      const totalNung = deptsKapans.reduce((sum, k) => sum + Number(k.nang || 0), 0);
      const totalCarat = deptsKapans.reduce((sum, k) => sum + Number(k.carat || 0), 0);
      const totalKapan = deptsKapans.length;

      grandNung += totalNung;
      grandCarat += totalCarat;
      grandKapan += totalKapan;

      return `
        <tr>
          <td>${index + 1}</td>
          <td><b>${dept}</b></td>
          <td><b>${totalNung}</b></td>
          <td style="color:var(--success); font-weight:700;">${totalCarat.toFixed(2)}</td>
          <td><b>${totalKapan}</b></td>
        </tr>
      `;
    }).join("");

    html += `
      <tr style="background:#cbd5e1; font-weight:800;">
        <td>-</td>
        <td>GRAND TOTAL</td>
        <td>${grandNung}</td>
        <td style="color:#15803d;">${grandCarat.toFixed(2)}</td>
        <td>${grandKapan}</td>
      </tr>
    `;

    tbody.innerHTML = html;
  }

  function adminAddRoughLot(e) {
    e.preventDefault();
    const newR = {
      id: "R" + Date.now(),
      name: document.getElementById("adRName").value.trim(),
      party: document.getElementById("adRParty").value.trim(),
      carats: parseFloat(document.getElementById("adRCarats").value),
      rate: parseFloat(document.getElementById("adRRate").value) || 2730,
      vigat: document.getElementById("adRVigat").value.trim(),
      
      // Optional planning fields
      sale1Pct: parseFloat(document.getElementById("adRSale1Pct").value) || 0,
      sale1Rate: parseFloat(document.getElementById("adRSale1Rate").value) || 0,
      sale2Pct: parseFloat(document.getElementById("adRSale2Pct").value) || 0,
      sale2Rate: parseFloat(document.getElementById("adRSale2Rate").value) || 0,
      flatPct: parseFloat(document.getElementById("adRFlatPct").value) || 0,
      flatRate: parseFloat(document.getElementById("adRFlatRate").value) || 0,
      manualPct: parseFloat(document.getElementById("adRManualPct").value) || 0,
      galaxyPct: parseFloat(document.getElementById("adRGalaxyPct").value) || 0,
      outPct: parseFloat(document.getElementById("adROutPct").value) || 0,
      outRate: parseFloat(document.getElementById("adROutRate").value) || 0,
      finalRoughAmt: parseFloat(document.getElementById("adRFinalRoughAmt").value) || 0,

      date: new Date().toISOString()
    };

    state.roughLots.unshift(newR);
    saveState();
    renderAll();
    showToast(`રફ ખરીદી ${newR.name} ઉમેરાઈ ગઈ!`);
    e.target.reset();
  }

  // Toggle Tab Kapan Creation
  function switchKapanCreationTab(tab) {
    const singleBtn = document.getElementById("tabSingleKapanBtn");
    const bulkBtn = document.getElementById("tabBulkKapanBtn");
    const singleForm = document.getElementById("singleKapanForm");
    const bulkForm = document.getElementById("bulkKapanForm");
    
    if (tab === 'single') {
      singleBtn.style.background = "var(--primary)";
      singleBtn.style.color = "white";
      bulkBtn.style.background = "transparent";
      bulkBtn.style.color = "#475569";
      
      singleForm.style.display = "block";
      bulkForm.style.display = "none";
    } else {
      bulkBtn.style.background = "var(--primary)";
      bulkBtn.style.color = "white";
      singleBtn.style.background = "transparent";
      singleBtn.style.color = "#475569";
      
      singleForm.style.display = "none";
      bulkForm.style.display = "block";
    }
  }

  function submitSingleKapanForm(e) {
    e.preventDefault();
    const roughId = document.getElementById("adKRough").value;
    const kapanNo = document.getElementById("skKapanNo").value.trim();
    const carat = parseFloat(document.getElementById("skCarat").value);
    const nang = parseInt(document.getElementById("skNang").value);
    const tag = document.getElementById("skTag").value;
    const vigat = document.getElementById("skVigat").value.trim();

    if (!roughId) {
      alert("❌ કૃપા કરીને રફ ખરીદી પસંદ કરો!");
      return;
    }

    if (!kapanNo) {
      alert("❌ કૃપા કરીને કાપણ નંબર લખો!");
      return;
    }

    const duplicate = (state.kapans || []).find(k => k.kapanNo.toLowerCase() === kapanNo.toLowerCase());
    if (duplicate) {
      alert("❌ આ કાપણ નંબર પહેલેથી જ અસ્તિત્વમાં છે!");
      return;
    }

    const initialDept = DEPTS[0] || "Galaxy";

    const newKapan = {
      id: "K" + Date.now(),
      kapanNo: kapanNo,
      roughId: roughId,
      carat: carat,
      nang: nang,
      roughWeight: carat,
      roughNang: nang,
      lots: 1,
      currentDept: initialDept,
      tag: tag,
      status: "Chalu",
      vigat: vigat,
      vehicleTracking: "",
      createdDate: new Date().toISOString(),
      lastMovedDate: new Date().toISOString()
    };

    state.kapans.unshift(newKapan);
    saveState();
    renderAll();
    
    showToast(`કાપણ ${kapanNo} સફળતાપૂર્વક ઉમેરાયું! (Start in ${initialDept})`);
    
    document.getElementById("skKapanNo").value = "";
    document.getElementById("skCarat").value = "";
    document.getElementById("skNang").value = "";
    document.getElementById("skVigat").value = "";
  }

  // ====== ADD SINGLE KAPAN MODAL LOGIC ======
  function openAddKapanModal() {
    document.getElementById("addKapanModal").style.display = "flex";
    document.getElementById("akKapanNo").value = "";
    document.getElementById("akCarat").value = "";
    document.getElementById("akNang").value = "";
    document.getElementById("akVigat").value = "";
    document.getElementById("akRoughId").value = "";
    document.getElementById("akRoughRate").value = "";
    document.getElementById("roughSelectVal").innerText = "Select Group...";
    document.getElementById("roughSelectVal").style.color = "#64748b";
    
    renderRoughSelectOptions();
    
    document.addEventListener("click", handleOutsideSelectClick);
  }

  function closeAddKapanModal() {
    document.getElementById("addKapanModal").style.display = "none";
    document.getElementById("roughSelectOptions").style.display = "none";
    document.removeEventListener("click", handleOutsideSelectClick);
  }

  function handleOutsideSelectClick(e) {
    const optionsPanel = document.getElementById("roughSelectOptions");
    const trigger = document.getElementById("roughSelectTrigger");
    if (optionsPanel && trigger && !optionsPanel.contains(e.target) && !trigger.contains(e.target)) {
      optionsPanel.style.display = "none";
    }
  }

  function toggleRoughDropdown(e) {
    e.stopPropagation();
    const panel = document.getElementById("roughSelectOptions");
    if (panel) {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
      if (panel.style.display === "block") {
        const inp = document.getElementById("roughSearchInput");
        if (inp) {
          inp.value = "";
          inp.focus();
        }
        filterRoughOptions("");
      }
    }
  }

  function renderRoughSelectOptions() {
    const listContainer = document.getElementById("roughOptionsList");
    if (!listContainer) return;

    if (state.roughLots.length === 0) {
      listContainer.innerHTML = `<div style="padding:10px; text-align:center; color:#64748b; font-size:13px;">કોઈ રફ લોટ મળ્યો નથી.</div>`;
      return;
    }

    listContainer.innerHTML = (state.roughLots || []).map(r => `
      <div class="custom-option-item" data-name="${r.name.toLowerCase()}" onclick="selectRoughOption('${r.id}', '${r.name}')">
        ${r.name} (${r.party} - ${r.carats} Cts)
      </div>
    `).join("");
  }

  function selectRoughOption(roughId, roughName) {
    document.getElementById("akRoughId").value = roughId;
    const valText = document.getElementById("roughSelectVal");
    valText.innerText = roughName;
    valText.style.color = "#0f172a";
    
    // Auto populate default rough rate
    const rough = (state.roughLots || []).find(r => r.id === roughId);
    if (rough) {
      document.getElementById("akRoughRate").value = rough.rate || 2730;
    }
    
    document.getElementById("roughSelectOptions").style.display = "none";
  }

  function filterRoughOptions(query) {
    const items = document.querySelectorAll("#roughOptionsList .custom-option-item");
    const q = query.toLowerCase().trim();
    items.forEach(item => {
      const name = item.getAttribute("data-name");
      if (name.includes(q)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

  function triggerQuickAddRough(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const name = prompt("નવા રફ લોટનું નામ/કોડ લખો:");
    if (!name || !name.trim()) return;
    
    const duplicate = (state.roughLots || []).find(r => r.name.toLowerCase() === name.trim().toLowerCase());
    if (duplicate) {
      alert("❌ આ નામનો રફ લોટ પહેલેથી જ અસ્તિત્વમાં છે!");
      return;
    }
    
    const party = prompt("પાર્ટીનું નામ લખો:") || "જનરલ";
    const caratsVal = parseFloat(prompt("ખરીદી વજન (Total Carats) લખો:")) || 0;
    const rateVal = parseFloat(prompt("રફનો રેટ પ્રતિ કેરેટ (Rough Rate per Carat) લખો:")) || 2730;
    
    const newR = {
      id: "R" + Date.now(),
      name: name.trim(),
      party: party.trim(),
      carats: caratsVal,
      rate: rateVal,
      vigat: "ક્વિક એડ કરેલ",
      date: new Date().toISOString()
    };
    
    state.roughLots.unshift(newR);
    saveState();
    renderAll();
    
    selectRoughOption(newR.id, newR.name);
  }

  function submitAddSingleKapan(e) {
    e.preventDefault();
    const roughId = document.getElementById("akRoughId").value;
    const kapanNo = document.getElementById("akKapanNo").value.trim();
    const roughRate = parseFloat(document.getElementById("akRoughRate").value) || 2730;
    const carat = parseFloat(document.getElementById("akCarat").value);
    const nang = parseInt(document.getElementById("akNang").value);
    const tag = document.getElementById("akTag").value;
    const vigat = document.getElementById("akVigat").value.trim();

    if (!roughId) {
      alert("❌ કૃપા કરીને રફ ખરીદી (Rough No.) પસંદ કરો!");
      return;
    }

    if (!kapanNo) {
      alert("❌ કૃપા કરીને કાપણ નંબર લખો!");
      return;
    }

    const duplicate = (state.kapans || []).find(k => k.kapanNo.toLowerCase() === kapanNo.toLowerCase());
    if (duplicate) {
      alert("❌ આ કાપણ નંબર પહેલેથી જ અસ્તિત્વમાં છે!");
      return;
    }

    const initialDept = DEPTS[0] || "Galaxy";

    const newKapan = {
      id: "K" + Date.now(),
      kapanNo: kapanNo,
      roughId: roughId,
      carat: carat,
      nang: nang,
      roughWeight: carat,
      roughNang: nang,
      lots: 1,
      currentDept: initialDept,
      tag: tag,
      status: "Chalu",
      vigat: vigat,
      vehicleTracking: "",
      createdDate: new Date().toISOString(),
      lastMovedDate: new Date().toISOString()
    };

    state.kapans.unshift(newKapan);
    saveState();
    renderAll();
    
    showToast(`કાપણ ${kapanNo} સફળતાપૂર્વક ઉમેરાયું! (Start in ${initialDept})`);
    closeAddKapanModal();
  }

  function generateBulkSeriesList() {
    const prefix = document.getElementById("adKPrefix").value.trim();
    const startNum = parseInt(document.getElementById("adKStart").value);
    const endNum = parseInt(document.getElementById("adKEnd").value);
    const tag = document.getElementById("adKTag").value;
    const vigat = document.getElementById("adKVigat").value.trim();

    if (!prefix || isNaN(startNum) || isNaN(endNum)) {
      alert("❌ કૃપા કરીને પ્રીફિક્સ, શરૂઆતી નંબર અને છેલ્લો નંબર સાચા લખો!");
      return;
    }

    if (startNum > endNum) {
      alert("❌ શરૂઆતી નંબર છેલ્લો નંબર કરતાં મોટો ન હોવો જોઈએ!");
      return;
    }

    if (endNum - startNum > 200) {
      alert("❌ એકસાથે ૨૦૦ થી વધુ કાપણ જનરેટ કરવા શક્ય નથી!");
      return;
    }

    const tbody = document.getElementById("bulkSeriesTableBody");
    let html = "";
    for (let i = startNum; i <= endNum; i++) {
      const kapanNo = prefix + i;
      html += `
        <tr class="series-input-row" data-kapan-no="${kapanNo}">
          <td style="font-weight:700; font-size:13.5px; text-align: center; vertical-align: middle;">${kapanNo}</td>
          <td><input type="number" step="0.01" class="series-carat-input" required placeholder="0.00" style="text-align:center;"></td>
          <td><input type="number" class="series-nung-input" required placeholder="0" style="text-align:center;"></td>
          <td>
            <select class="series-tag-input">
              <option value="Regular" ${tag === 'Regular' ? 'selected' : ''}>🟢 Regular</option>
              <option value="Urgent" ${tag === 'Urgent' ? 'selected' : ''}>🔴 Urgent</option>
              <option value="Sample" ${tag === 'Sample' ? 'selected' : ''}>🟡 Sample</option>
            </select>
          </td>
          <td><input type="text" class="series-vigat-input" value="${vigat}" placeholder="નોંધ..."></td>
        </tr>
      `;
    }
    tbody.innerHTML = html;
    document.getElementById("bulkSeriesEntryArea").style.display = "block";
  }

  function saveBulkSeriesKapans() {
    const roughId = document.getElementById("adKRough").value;
    if (!roughId) {
      alert("❌ કૃપા કરીને રફ ખરીદી પસંદ કરો!");
      return;
    }

    const rows = document.querySelectorAll(".series-input-row");
    if (rows.length === 0) return;

    let kapansToCreate = [];
    let isValid = true;

    rows.forEach(row => {
      const kapanNo = row.getAttribute("data-kapan-no");
      const caratVal = row.querySelector(".series-carat-input").value;
      const nungVal = row.querySelector(".series-nung-input").value;
      const tagVal = row.querySelector(".series-tag-input").value;
      const vigatVal = row.querySelector(".series-vigat-input").value.trim();

      if (!caratVal || parseFloat(caratVal) <= 0 || !nungVal || parseInt(nungVal) <= 0) {
        isValid = false;
        row.style.background = "#fee2e2";
      } else {
        row.style.background = "";
      }

      kapansToCreate.push({
        kapanNo,
        carat: parseFloat(caratVal),
        nang: parseInt(nungVal),
        tag: tagVal,
        vigat: vigatVal
      });
    });

    if (!isValid) {
      alert("❌ કૃપા કરીને બધા કાપણના વજન (Carat) અને નંગ (Nung) સાચા અને શૂન્યથી મોટા ભરો!");
      return;
    }

    let count = 0;
    const initialDept = DEPTS[0] || "GALAXY-DP";

    kapansToCreate.forEach(k => {
      state.kapans.unshift({
        id: "K" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        kapanNo: k.kapanNo,
        roughId: roughId,
        carat: k.carat,
        nang: k.nang,
        roughWeight: k.carat,
        roughNang: k.nang,
        lots: 1,
        currentDept: initialDept,
        tag: k.tag,
        status: "Chalu",
        vigat: k.vigat,
        vehicleTracking: k.tag === "Sample" ? `સેમ્પલ ટ્રેક` : "",
        createdDate: new Date().toISOString(),
        lastMovedDate: new Date().toISOString()
      });
      count++;
    });

    saveState();
    renderAll();
    showToast(`એકસાથે ${count} કાપણ સફળતાપૂર્વક ઉમેરાયા! (Start in ${initialDept})`);
    
    document.getElementById("adKPrefix").value = "";
    document.getElementById("adKStart").value = "";
    document.getElementById("adKEnd").value = "";
    document.getElementById("adKVigat").value = "";
    document.getElementById("bulkSeriesEntryArea").style.display = "none";
    document.getElementById("bulkSeriesTableBody").innerHTML = "";
  }

  function renderSampleDashboard() {
    const tbody = document.getElementById("sampleTableBody");
    if (!tbody) return;

    const samples = (state.kapans || []).filter(k => k.tag === "Sample");
    tbody.innerHTML = samples.map(k => {
      const rough = (state.roughLots || []).find(r => r.id === k.roughId);
      const transfersForKapan = (state.transfers || []).filter(t => t.kapanNo === k.kapanNo);
      
      const commentsHtml = `
        <details style="cursor: pointer; font-size: 11px; outline: none; border: none; margin-top:4px;">
          <summary style="font-weight: 700; color: var(--accent);">[+] Expand Trail</summary>
          <div style="margin-top: 5px; font-size: 10.5px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 4px; text-align: left; line-height: 1.3; max-width: 250px; overflow-wrap: break-word;">
            ${transfersForKapan.filter(t => t.vigat && t.vigat.trim()).map(t => `<div><b>${t.fromDept}➔${t.toDept}:</b> ${t.vigat}</div>`).join("") || 'No comments'}
          </div>
        </details>
      `;

      return `
        <tr>
          <td><b>${k.kapanNo}</b></td>
          <td>${rough ? rough.name + ' (' + rough.party + ')' : "-"}</td>
          <td><b style="font-size:13.5px;">${k.nang} Pis</b></td>
          <td><b>${Number(k.carat).toFixed(2)} Cts</b></td>
          <td><b>${k.r2pPct ? k.r2pPct.toFixed(2) + "%" : "-"}</b></td>
          <td>
            <span class="status-chalu">${k.currentDept}</span>
            ${k.status === "In-Repair" ? '<br><span class="status-repair" style="font-size:10px; padding:1px 4px; margin-top:2px; display:inline-block;">🔧 રીપેરિંગ</span>' : ''}
          </td>
          <td>${k.createdDate ? new Date(k.createdDate).toLocaleDateString("gu-IN") : "-"}</td>
          <td>
            <input type="text" id="tr_${k.id}" value="${k.vehicleTracking || ''}" placeholder="ટ્રેકિંગ વિગત..." style="width: 140px; font-size: 12px; font-weight:700; padding:4px; border:1px solid #cbd5e1; border-radius:4px;">
          </td>
          <td>
            <div style="font-size:11px; color:#475569;">${k.vigat || "-"}</div>
            ${commentsHtml}
          </td>
          <td>
            <button class="btn btn-outline" style="padding:4px 8px; font-size:12px; font-weight:700;" onclick="updateSampleTracking('${k.id}')">✔ સેવ</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  function updateSampleTracking(id) {
    const val = document.getElementById("tr_" + id).value;
    const k = (state.kapans || []).find(x => x.id === id);
    if (k) {
      k.vehicleTracking = val;
      saveState();
      showToast("સેમ્પલ ટ્રેકિંગ વિગતો સેવ થઈ ગઈ!");
    }
  }

  // ================= STOCK OPERATOR FUNCTIONS =================
  function renderStickerGrid() {
    const grid = document.getElementById("stickerGrid");
    if (!grid) return;
    const currentFilter = document.getElementById("dashDeptFilter")?.value || "";

    grid.innerHTML = DEPTS.map(dept => {
      const deptsKapans = (state.kapans || []).filter(k => k.currentDept === dept && k.status !== "In-Repair");
      const totalNung = deptsKapans.reduce((sum, k) => sum + Number(k.nang || 0), 0);
      const isActive = dept === currentFilter ? "active" : "";

      return `
        <div class="sticker-card ${isActive}" onclick="filterBySticker('${dept}')" style="padding: 8px 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; min-height: 65px;">
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${dept}</div>
          <div style="display: flex; justify-content: center; gap: 12px; align-items: center; font-size: 12px; font-weight: 600; color: #475569;">
            <span title="કાપણ સંખ્યા">📦 <b>${deptsKapans.length}</b></span>
            <span style="color: #cbd5e1;">|</span>
            <span title="કુલ નંગ">💎 <b>${totalNung}</b></span>
          </div>
        </div>
      `;
    }).join("");
  }

  function filterBySticker(dept) {
    const filterEl = document.getElementById("dashDeptFilter");
    if (filterEl) {
      if (filterEl.value === dept) {
        filterEl.value = "";
      } else {
        filterEl.value = dept;
      }
    }
    renderStickerGrid();
    renderDashboardTable();
  }

  function resetDashFilters() {
    const searchEl = document.getElementById("dashSearch");
    const deptEl = document.getElementById("dashDeptFilter");
    const tagEl = document.getElementById("dashTagFilter");
    if (searchEl) searchEl.value = "";
    if (deptEl) deptEl.value = "";
    if (tagEl) tagEl.value = "";
    renderDashboardTable();
  }

  function renderDashboardTable() {
    renderStickerGrid();
    const searchEl = document.getElementById("dashSearch");
    if (!searchEl) return;
    const query = searchEl.value.trim();
    const dept = document.getElementById("dashDeptFilter").value;
    const tagFilterEl = document.getElementById("dashTagFilter");
    const tagFilter = tagFilterEl ? tagFilterEl.value : "";
    const tbody = document.getElementById("dashTableBody");

    let list = (state.kapans || []).filter(k => {
      const rough = (state.roughLots || []).find(r => r.id === k.roughId);
      const roughName = rough ? rough.name.toLowerCase() : "";
      const matchesSearch = isMatchSearch(k.kapanNo, query) || roughName.includes(query.toLowerCase());
      const matchesDept = !dept || k.currentDept === dept;
      const matchesTag = !tagFilter || k.tag === tagFilter;
      return matchesSearch && matchesDept && matchesTag;
    });

    // Sort list: Sample first, Urgent next, Overdue (3+ days) next, then others (oldest first)
    list.sort((a, b) => {
      const getRank = (k) => {
        if (k.tag === "Sample") return 1;
        if (k.tag === "Urgent") return 2;
        if (isOverdue(k.lastMovedDate || k.createdDate)) return 3;
        return 4;
      };

      const rankA = getRank(a);
      const rankB = getRank(b);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      const aDate = new Date(a.lastMovedDate || a.createdDate || 0);
      const bDate = new Date(b.lastMovedDate || b.createdDate || 0);
      return aDate - bDate;
    });

    tbody.innerHTML = list.map(k => {
      const rough = (state.roughLots || []).find(r => r.id === k.roughId);
      const duration = getTimeDuration(k.lastMovedDate || k.createdDate);
      const overdueClass = isOverdue(k.lastMovedDate || k.createdDate) ? "overdue-kapan" : "";
      const tagClass = k.tag === "Urgent" ? "tag-urgent" : (k.tag === "Sample" ? "tag-sample" : "tag-regular");

      const idx = DEPTS.indexOf(k.currentDept);
      const nextDept = idx >= 0 && idx < DEPTS.length - 1 ? DEPTS[idx + 1] : null;

      const vigatHtml = k.vigat 
        ? `
          <details style="cursor: pointer; font-size: 11.5px; outline: none; border: none; padding: 2px;">
            <summary style="font-weight: 700; color: var(--accent);">[+] Expand</summary>
            <div style="margin-top: 5px; font-size: 11px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 4px; text-align: left; line-height: 1.3; max-width: 250px; overflow-wrap: break-word;">
              ${k.vigat}
            </div>
          </details>
        ` 
        : "-";

      return `
        <tr class="${overdueClass}">
          <td><b>${k.kapanNo}</b></td>
          <td>${rough ? rough.name : "-"}</td>
          <td><b>${Number(k.carat).toFixed(2)}</b></td>
          <td><b>${k.nang}</b></td>
          <td><span class="${k.currentDept==='Sales Stock'?'status-sales':'status-chalu'}">${k.currentDept}</span></td>
          <td>
            <select onchange="updateKapanTag('${k.id}', this.value)" class="tag-select ${tagClass}">
              <option value="Regular" ${k.tag === "Regular" ? "selected" : ""}>Regular</option>
              <option value="Urgent" ${k.tag === "Urgent" ? "selected" : ""}>Urgent</option>
              <option value="Sample" ${k.tag === "Sample" ? "selected" : ""}>Sample</option>
            </select>
          </td>
          <td>⏱️ ${duration} ${overdueClass ? '<br><b style="color:var(--danger); font-size:11px;">⚠️ 3+ દિવસ વિલંબ</b>' : ''}</td>
          <td>${vigatHtml}</td>
          <td>
            <button class="btn btn-outline" style="padding:3px 8px; font-size:11px;" onclick="openEditModal('${k.id}')">✏️</button>
            <button class="btn btn-danger" style="padding:3px 8px; font-size:11px;" onclick="deleteKapanPrompt('${k.id}')">🗑️</button>
          </td>
        </tr>
      `;
    }).join("");

    const totCts = list.reduce((s, k) => s + Number(k.carat), 0).toFixed(2);
    const totNang = list.reduce((s, k) => s + Number(k.nang), 0);
    document.getElementById("dashSummary").innerHTML = `
      <span>કુલ દર્શાવેલ કાપણ: <b>${list.length}</b></span>
      <span>કુલ નંગ: <b>${totNang} Pis</b></span>
      <span>કુલ વજન: <b>${totCts} Cts</b></span>
    `;
  }

  function updateKapanTag(id, newTag) {
    const k = (state.kapans || []).find(x => x.id === id);
    if (k) {
      const oldTag = k.tag;
      k.tag = newTag;
      
      state.audits.unshift({
        id: "AU" + Date.now(),
        kapanNo: k.kapanNo,
        action: "TAG_CHANGE",
        details: `Tag changed from ${oldTag} to ${newTag}`,
        timestamp: new Date().toISOString()
      });
      
      saveState();
      renderAll();
      showToast(`કાપણ ${k.kapanNo} નો ટેગ સફળતાપૂર્વક અપડેટ થયો!`);
    }
  }

  // 1-CLICK QUICK TRANSFER POPUP MODAL
  function openQuickTransferModal(id) {
    const k = (state.kapans || []).find(x => x.id === id);
    if (!k) return;

    document.getElementById("qtKapanId").value = k.id;
    document.getElementById("qtTitle").innerText = `📤 કાપણ ${k.kapanNo} આગળ મોકલો`;
    document.getElementById("qtInfoBadge").innerText = `હાલ સ્ટોક: ${k.carat} Cts | ${k.nang} નંગ`;
    document.getElementById("qtCaratVal").value = k.carat;
    document.getElementById("qtNangVal").value = k.nang;
    document.getElementById("qtVigat").value = "";

    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    document.getElementById("qtDateTime").value = localISOTime;

    const toSel = document.getElementById("qtToDeptSelect");
    const config = state.deptConfigs[k.currentDept] || {};
    const sendsList = config.sendsTo && config.sendsTo.length > 0 ? config.sendsTo : DEPTS;
    toSel.innerHTML = sendsList.map(d => `<option value="${d}">${d}</option>`).join("");

    const idx = DEPTS.indexOf(k.currentDept);
    if (idx >= 0 && idx < DEPTS.length - 1) {
      const nextDept = DEPTS[idx + 1];
      if (sendsList.includes(nextDept)) {
        toSel.value = nextDept;
      } else {
        toSel.value = sendsList[0] || k.currentDept;
      }
    } else {
      toSel.value = sendsList[0] || k.currentDept;
    }

    updateQtCustomFields();

    document.getElementById("quickTransferModal").style.display = "flex";
  }

  function updateQtCustomFields() {
    const kId = document.getElementById("qtKapanId").value;
    const k = (state.kapans || []).find(x => x.id === kId);
    if (!k) return;

    const fromDept = k.currentDept;
    const toDept = document.getElementById("qtToDeptSelect").value;
    const customBox = document.getElementById("qtDynamicInputsContainer");

    const targetConfig = state.deptConfigs[toDept] || {};
    const fields = targetConfig.fieldsConfig || { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: false, compulsory: false } };

    // Standard Fields Visibility & Requirements
    const caratCont = document.getElementById("qtCaratContainer");
    if (caratCont) {
      const showVajan = fields.vajan?.show !== false;
      const compVajan = !!fields.vajan?.compulsory;
      caratCont.style.display = showVajan ? "block" : "none";
      const input = document.getElementById("qtCaratVal");
      if (input) {
        input.required = showVajan && compVajan;
        const label = caratCont.querySelector("label");
        if (label) {
          label.innerHTML = `મોકલવા માટેનું વજન (Carats) ${input.required ? '<span class="req-star">*</span>' : ''}`;
        }
      }
    }

    const nangCont = document.getElementById("qtNangContainer");
    if (nangCont) {
      const showNung = fields.nung?.show !== false;
      const compNung = !!fields.nung?.compulsory;
      nangCont.style.display = showNung ? "block" : "none";
      const input = document.getElementById("qtNangVal");
      if (input) {
        input.required = showNung && compNung;
        const label = nangCont.querySelector("label");
        if (label) {
          label.innerHTML = `મોકલવા માટેના નંગ (Pieces) ${input.required ? '<span class="req-star">*</span>' : ''}`;
        }
      }
    }

    let customBoxHtml = "";
    let isHardcoded = false;

    if (fromDept === "Galaxy" && toDept === "AP OK") {
      customBoxHtml = `
        <div style="margin-bottom:12px;">
          <label>Rough to Polish % <span class="req-star">*</span></label>
          <input type="number" step="0.01" min="0" max="100" id="qtCustomVal" required placeholder="દા.ત. 28.47">
        </div>
      `;
      isHardcoded = true;
    } else if (fromDept === "AP OK" && toDept === "4P") {
      customBoxHtml = `
        <div style="margin-bottom:12px;">
          <label>લોટ સંખ્યા (Lots) <span class="req-star">*</span></label>
          <input type="number" min="1" id="qtCustomVal" required placeholder="દા.ત. 70" value="${k.lots || 1}">
        </div>
      `;
      isHardcoded = true;
    } else if (fromDept === "4P" && toDept === "4P OK RT BAAKI") {
      customBoxHtml = `
        <div style="margin-bottom:12px;">
          <label>લોટ સંખ્યા (Lots) <span class="req-star">*</span></label>
          <input type="number" min="1" id="qtCustomVal" required placeholder="દા.ત. 70" value="${k.lots || 70}">
        </div>
      `;
      isHardcoded = true;
    }

    if (!isHardcoded) {
      // Check transferRules OR fromDept config's customHeader
      const transferRule = (state.transferRules || []).find(r => r.from === fromDept && r.to === toDept);
      let customHeader = transferRule ? transferRule.customHeader : "";
      let isReq = transferRule ? transferRule.isCompulsory !== false : false;

      if (!customHeader) {
        const fromCfg = state.deptConfigs[fromDept];
        if (fromCfg && fromCfg.customHeader) {
          customHeader = fromCfg.customHeader;
          isReq = fromCfg.isCompulsory !== false;
        }
      }

      if (customHeader) {
        customBoxHtml += `
          <div style="margin-bottom:12px;">
            <label>${customHeader} ${isReq ? '<span class="req-star">*</span>' : ''}</label>
            <input type="text" id="qtCustomVal" ${isReq ? 'required' : ''} placeholder="${customHeader} લખો">
          </div>
        `;
      }

      // Check target department's lot show rule
      if (fields.lot?.show) {
        customBoxHtml += `
          <div style="margin-bottom:12px;">
            <label>લોટ સંખ્યા (Lots) ${fields.lot.compulsory ? '<span class="req-star">*</span>' : ''}</label>
            <input type="number" min="1" id="qtLotVal" ${fields.lot.compulsory ? 'required' : ''} placeholder="લોટ સંખ્યા લખો" value="${k.lots || 1}" style="width:100%; font-weight:700; padding:8px 12px; border-radius:6px; border:1.5px solid #cbd5e1; outline:none;">
          </div>
        `;
      }
    }

    customBox.innerHTML = customBoxHtml;
  }

  function closeQuickTransferModal() {
    document.getElementById("quickTransferModal").style.display = "none";
  }

  function submitQuickTransfer(e) {
    e.preventDefault();
    const id = document.getElementById("qtKapanId").value;
    const k = (state.kapans || []).find(x => x.id === id);
    if (!k) return;

    const toDept = document.getElementById("qtToDeptSelect").value;
    const fromDept = k.currentDept;
    
    const rawCarat = parseFloat(document.getElementById("qtCaratVal").value);
    const newCarat = isNaN(rawCarat) ? k.carat : rawCarat;

    const rawNang = parseInt(document.getElementById("qtNangVal").value);
    const newNang = isNaN(rawNang) ? k.nang : rawNang;

    const newVigat = document.getElementById("qtVigat").value.trim();

    let customValText = "";
    let customHeaderName = "";
    let isReq = false;

    if (fromDept === "Galaxy" && toDept === "AP OK") {
      customHeaderName = "Rough to Polish %";
      isReq = true;
    } else if (fromDept === "AP OK" && toDept === "4P") {
      customHeaderName = "Lots";
      isReq = true;
    } else if (fromDept === "4P" && toDept === "4P OK RT BAAKI") {
      customHeaderName = "Lots";
      isReq = true;
    } else {
      const transferRule = (state.transferRules || []).find(r => r.from === fromDept && r.to === toDept);
      customHeaderName = transferRule ? transferRule.customHeader : "";
      isReq = transferRule ? transferRule.isCompulsory !== false : false;

      if (!customHeaderName) {
        const fromCfg = state.deptConfigs[fromDept];
        if (fromCfg && fromCfg.customHeader) {
          customHeaderName = fromCfg.customHeader;
          isReq = fromCfg.isCompulsory !== false;
        }
      }
    }

    if (customHeaderName) {
      const elVal = document.getElementById("qtCustomVal");
      if (elVal) {
        customValText = elVal.value.trim();
        if (isReq && !customValText) {
          alert(`❌ ${customHeaderName} ભરવું ફરજિયાત છે!`);
          return;
        }
        if (fromDept === "Galaxy" && toDept === "AP OK") {
          k.r2pPct = parseFloat(customValText) || 0;
        } else if ((fromDept === "AP OK" && toDept === "4P") || (fromDept === "4P" && toDept === "4P OK RT BAAKI")) {
          k.lots = parseInt(customValText) || 1;
        }
      }
    }

    // Read dynamic Lot field if present
    const lotEl = document.getElementById("qtLotVal");
    if (lotEl) {
      k.lots = parseInt(lotEl.value) || 1;
    }

    let displayVigat = newVigat;
    if (customValText) {
      displayVigat = `[${customHeaderName}: ${customValText}] ${newVigat}`;
    }

    const accumVigat = k.vigat ? `${k.vigat} | [${fromDept}➔${toDept}]: ${displayVigat || 'OK'}` : `[${fromDept}➔${toDept}]: ${displayVigat || 'OK'}`;

    const customDateTime = document.getElementById("qtDateTime").value;
    const transferTimestamp = customDateTime ? new Date(customDateTime).toISOString() : new Date().toISOString();

    state.transfers.unshift({
      id: "TR" + Date.now(),
      kapanNo: k.kapanNo,
      fromDept: fromDept,
      toDept: toDept,
      prevCarat: k.carat,
      prevNang: k.nang,
      carat: newCarat,
      nang: newNang,
      vigat: displayVigat,
      timestamp: transferTimestamp
    });

    k.currentDept = toDept;
    k.carat = newCarat;
    k.nang = newNang;
    k.vigat = accumVigat;
    k.lastMovedDate = transferTimestamp;
    if (toDept === "OK KAPAN (ઓકે કાપણ)") {
      ensureDraftPolishChart(k);
    }

    saveState();
    closeQuickTransferModal();
    renderAll();
    showToast(`કાપણ ${k.kapanNo} સફળતાપૂર્વક ${toDept} વિભાગમાં મોકલ્યું!`);
  }

  // BATCH MULTI-TRANSFER
  function toggleBatchSelection(id, checked) {
    if (checked) selectedBatchIds.add(id);
    else selectedBatchIds.delete(id);
  }

  function toggleSelectAllBatch(masterCb) {
    const cbs = document.querySelectorAll("#dashTableBody input[type='checkbox']");
    cbs.forEach(cb => {
      cb.checked = masterCb.checked;
      toggleBatchSelection(cb.value, masterCb.checked);
    });
  }

  function openBatchTransferModal() {
    if (selectedBatchIds.size === 0) {
      alert("❌ ટ્રાન્સફર માટે ઓછામાં ઓછું એક કાપણ પસંદ કરો!");
      return;
    }

    const tbody = document.getElementById("batchTransferTableBody");
    const list = Array.from(selectedBatchIds).map(id => (state.kapans || []).find(k => k.id === id)).filter(Boolean);
    tbody.innerHTML = list.map((k, i) => {
      const idx = DEPTS.indexOf(k.currentDept);
      const nextDept = idx >= 0 && idx < DEPTS.length - 1 ? DEPTS[idx + 1] : "Sales Stock";
      return `
        <tr>
          <td><b>${k.kapanNo}</b><input type="hidden" class="btId" value="${k.id}"><input type="hidden" class="btTo" value="${nextDept}"></td>
          <td>${k.currentDept}</td>
          <td><span class="status-chalu">${nextDept}</span></td>
          <td><input type="number" step="0.01" class="btCarat" value="${k.carat}" required></td>
          <td><input type="number" class="btNang" value="${k.nang}" required></td>
          <td><input type="text" class="btVigat" placeholder="નોંધ..."></td>
        </tr>
      `;
    }).join("");

    // Pre-fill local date and time
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    document.getElementById("batchDateTime").value = localISOTime;

    document.getElementById("batchTransferModal").style.display = "flex";
  }

  function closeBatchTransferModal() {
    document.getElementById("batchTransferModal").style.display = "none";
  }

  function submitBatchTransfer(e) {
    e.preventDefault();
    const ids = document.querySelectorAll(".btId");
    const tos = document.querySelectorAll(".btTo");
    const carats = document.querySelectorAll(".btCarat");
    const nangs = document.querySelectorAll(".btNang");
    const vigats = document.querySelectorAll(".btVigat");

    const customDateTime = document.getElementById("batchDateTime").value;
    const transferTimestamp = customDateTime ? new Date(customDateTime).toISOString() : new Date().toISOString();

    let count = 0;
    for (let i = 0; i < ids.length; i++) {
      const k = (state.kapans || []).find(x => x.id === ids[i].value);
      if (k) {
        const toDept = tos[i].value;
        const newC = parseFloat(carats[i].value);
        const newN = parseInt(nangs[i].value);
        const newV = vigats[i].value.trim();

        const accumVigat = k.vigat ? `${k.vigat} | [${k.currentDept}➔${toDept}]: ${newV || 'OK'}` : `[${k.currentDept}➔${toDept}]: ${newV || 'OK'}`;

        state.transfers.unshift({
          id: "TR" + Date.now() + "_" + i,
          kapanNo: k.kapanNo,
          fromDept: k.currentDept,
          toDept: toDept,
          prevCarat: k.carat,
          prevNang: k.nang,
          carat: newC,
          nang: newN,
          vigat: newV,
          timestamp: transferTimestamp
        });

        k.currentDept = toDept;
        k.carat = newC;
        k.nang = newN;
        k.vigat = accumVigat;
        k.lastMovedDate = transferTimestamp;
        if (toDept === "OK KAPAN (ઓકે કાપણ)") {
          ensureDraftPolishChart(k);
        }
        count++;
      }
    }

    selectedBatchIds.clear();
    saveState();
    closeBatchTransferModal();
    renderAll();
    showToast(`એકસાથે ${count} કાપણ સફળતાપૂર્વક આગલા વિભાગમાં ટ્રાન્સફર થયા!`);
  }

  

  // HORIZONTAL LEDGER WITH TOP ROW FILTERS & MAJURI MULTIPLIER
  function renderLedgerTable() {
    const tbody = document.getElementById("ledgerTableBody");
    if (!tbody) return;

    const kFilter = (document.getElementById("ledgerKapanFilter") || {}).value || "";
    const rFilter = (document.getElementById("ledgerRoughFilter") || {}).value || "";

    let list = (state.kapans || []).filter(k => {
      const rough = (state.roughLots || []).find(r => r.id === k.roughId);
      const rName = rough ? rough.name : "";
      return isMatchSearch(k.kapanNo, kFilter) && rName.toLowerCase().includes(rFilter.toLowerCase());
    });

    tbody.innerHTML = list.map((k, idx) => {
      const rough = (state.roughLots || []).find(r => r.id === k.roughId);
      const rName = rough ? rough.name : "હવા";
      const rate = k.roughRate !== undefined ? k.roughRate : (rough ? (rough.rate || 2730) : 2730);
      const roughWeight = k.roughWeight || k.carat;
      const totalRoughCarats = rough ? (rough.carats || roughWeight) : roughWeight;
      const rafAmt = roughWeight * rate;
      
      const chart = (state.polishCharts || []).find(pc => pc && pc.kapanNo === k.kapanNo);
      const isCompleted = k.currentDept === "OK KAPAN (ઓકે કાપણ)";
      
      // Calculate total lost carats and pieces from transfers
      const transfersForKapan = (state.transfers || []).filter(t => t.kapanNo === k.kapanNo);
      let totalCaratLoss = 0;
      let totalNangLoss = 0;
      transfersForKapan.forEach(t => {
        const wLoss = (t.prevCarat || 0) - (t.carat || 0);
        const nLoss = (t.prevNang || 0) - (t.nang || 0);
        if (wLoss > 0.009) totalCaratLoss += wLoss;
        if (nLoss > 0) totalNangLoss += nLoss;
      });

      // Find department specific transfers to derive stats
      const galaxyOutTx = transfersForKapan.find(t => t.fromDept === "Galaxy");
      const apOkOutTx = transfersForKapan.find(t => t.fromDept === "AP OK");
      const fourPOutTx = transfersForKapan.find(t => t.fromDept === "4P");
      const rtOutTx = transfersForKapan.find(t => t.fromDept === "RT");
      const khataOutTx = transfersForKapan.find(t => t.fromDept === "KHATA");

      const derivedRoughNang = k.roughNang || (galaxyOutTx ? galaxyOutTx.prevNang : k.nang);
      const derivedMakeablePiece = galaxyOutTx ? galaxyOutTx.nang : (k.makeablePiece || 0);
      const derivedMakeableVajan = k.makeableVajan || (k.r2pPct ? (roughWeight * k.r2pPct / 100) : 0);
      const derivedFourPNang = fourPOutTx ? fourPOutTx.nang : (k.fourPNang || 0);
      const derivedFourPCt = fourPOutTx ? fourPOutTx.carat : (k.fourPCt || 0);
      const derivedRtCt = rtOutTx ? rtOutTx.carat : (k.rtCt || 0);

      const derivedPolishCarat = khataOutTx ? khataOutTx.carat : (chart ? (parseFloat(chart.polishCarat) || 0) : (isCompleted ? (k.carat || 0) : 0));
      const derivedPolishNang = khataOutTx ? khataOutTx.nang : (isCompleted ? (chart ? (chart.polishNang || k.nang) : k.nang) : 0);

      const masterMajRate = state.majuriRate !== undefined ? state.majuriRate : 65;
      const majuri = isCompleted ? Math.round(derivedPolishNang * masterMajRate) : 0;
      const toAmt = isCompleted ? (rafAmt + majuri) : rafAmt;

      const expectedPct = k.r2pPct || 0;
      const achievedPct = (roughWeight > 0 && derivedPolishCarat > 0) ? (derivedPolishCarat / roughWeight * 100) : 0;
      const variationPct = isCompleted ? (achievedPct - expectedPct) : 0;
      
      const roundedToAmtForPadtar = Math.round(toAmt / 100) * 100;
      const padtar = (isCompleted && derivedPolishCarat > 0) ? Math.round((roundedToAmtForPadtar / derivedPolishCarat) / 10) * 10 : 0;

      const commentsHtml = `
        <details style="cursor: pointer; font-size: 11.5px; min-width: 140px; outline: none; border: none; padding: 2px;">
          <summary style="font-weight: 700; color: var(--accent);">[+] Expand</summary>
          <div style="margin-top: 5px; font-size: 11px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 4px; text-align: left; line-height: 1.3;">
            ${transfersForKapan.filter(t => t.vigat && t.vigat.trim()).map(t => `<div><b>${t.fromDept}➔${t.toDept}:</b> ${t.vigat}</div>`).join("") || 'No remarks'}
          </div>
        </details>
      `;

      // Column values exactly like Row 7
      const roughSize = (derivedRoughNang > 0 && roughWeight > 0) ? (derivedRoughNang / roughWeight).toFixed(2) : "-";
      const mkSize = (derivedMakeablePiece > 0 && derivedMakeableVajan > 0) ? (derivedMakeablePiece / derivedMakeableVajan).toFixed(4) : "-";
      const expVajan = derivedMakeableVajan ? derivedMakeableVajan.toFixed(2) : "-";
      
      const fourPPlusPct = (derivedFourPCt > 0 && derivedMakeableVajan > 0) ? (1 - (derivedMakeableVajan / derivedFourPCt)) * 100 : 0;
      const rtPctVal = (derivedFourPCt > 0 && derivedRtCt > 0) ? (derivedRtCt / derivedFourPCt * 100) : 0;
      const rToPPctVal = (roughWeight > 0 && derivedPolishCarat > 0) ? (derivedPolishCarat / roughWeight * 100) : 0;

      const roundedRafAmt = Math.round(rafAmt / 10) * 10;
      const roundedMajuri = Math.round(majuri / 10) * 10;
      const roundedToAmt = Math.round(toAmt / 10) * 10;
      const roundedPadtar = Math.round(padtar / 10) * 10;

      let displayVigat = k.vigat || "-";
      if (displayVigat.includes("Galaxy➔AP OK")) {
        displayVigat = k.kapanNo.toLowerCase().includes("m-3-20") ? "hawa 1" : "ઓકે કાપણ";
      }
      return `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${rName}</b></td>
          <td>${displayVigat}</td>
          <td><b>${k.kapanNo}</b></td>
          <td>${derivedRoughNang}</td>
          <td><b>${roughWeight.toFixed(2)}</b></td>
          <td><b>${roughSize}</b></td>
          <td>${rate}</td>
          <td>${derivedMakeablePiece || "-"}</td>
          <td>${expVajan}</td>
          <td><b>${mkSize}</b></td>
          <td>${k.r2pPct ? k.r2pPct.toFixed(2) + "%" : "-"}</td>
          <td>${derivedFourPNang || "-"}</td>
          <td>${derivedFourPCt ? Number(derivedFourPCt).toFixed(2) : "-"}</td>
          <td>${fourPPlusPct !== 0 ? fourPPlusPct.toFixed(2) + "%" : "-"}</td>
          <td>${derivedRtCt ? Number(derivedRtCt).toFixed(2) : "-"}</td>
          <td>${rtPctVal > 0 ? rtPctVal.toFixed(2) + "%" : "-"}</td>
          <td>${derivedPolishCarat > 0 ? derivedPolishCarat.toFixed(2) : "-"}</td>
          <td>${derivedPolishNang || "-"}</td>
          <td>${rToPPctVal > 0 ? rToPPctVal.toFixed(2) + "%" : "-"}</td>
          <td><b>${isCompleted ? (variationPct >= 0 ? "+" : "") + variationPct.toFixed(2) + '%' : '-'}</b></td>
          <td>₹${roundedRafAmt.toLocaleString()}</td>
          <td>₹${roundedMajuri.toLocaleString()}</td>
          <td><b>₹${roundedToAmt.toLocaleString()}</b></td>
          <td><b>₹${roundedPadtar.toLocaleString()}</b></td>
          <td style="color:var(--danger); font-weight:700;">${totalCaratLoss > 0 ? `-${totalCaratLoss.toFixed(2)} Cts` : "-"}</td>
          <td style="color:var(--danger); font-weight:700;">${totalNangLoss > 0 ? `-${totalNangLoss} Pcs` : "-"}</td>
          <td>${commentsHtml}</td>
        </tr>
      `;
    }).join("");
  }

  // MERGED POLISH DEPARTMENT SEARCH & SELECT
  function renderMergedPolishChartSelect() {
    const select = document.getElementById("pcMergedSelect");
    if (!select) return;
    
    const query = (document.getElementById("pcMergedSearchInput") || {}).value || "";
    
    const waiting = (state.kapans || []).filter(k => {
      const isOk = k.currentDept === "OK KAPAN (ઓકે કાપણ)";
      const chart = (state.polishCharts || []).find(pc => pc.kapanNo === k.kapanNo && pc.status === "Approved");
      return isOk && !chart;
    });

    const approved = (state.polishCharts || []).filter(pc => pc.status === "Approved");

    let optionsHtml = `<option value="">— કાપણ પસંદ કરો (મંજૂરી બાકી અથવા મંજૂર થયેલ) —</option>`;

    if (!query) {
      if (waiting.length > 0) {
        optionsHtml += `<optgroup label="⚠️ મંજૂરી માટે બાકી કાપણ (Pending Approval)">`;
        waiting.forEach(k => {
          optionsHtml += `<option value="${k.id}">[⚠️ મંજૂરી બાકી] ${k.kapanNo} (${k.carat} Cts)</option>`;
        });
        optionsHtml += `</optgroup>`;
      }
      
      if (approved.length > 0) {
        optionsHtml += `<optgroup label="✅ તાજેતરમાં મંજૂર થયેલ ચાર્ટ (Recently Approved)">`;
        approved.slice(0, 10).forEach(pc => {
          optionsHtml += `<option value="${pc.id}">[✅ મંજૂર થયેલ] ${pc.kapanNo} (${pc.roughName || ""})</option>`;
        });
        optionsHtml += `</optgroup>`;
      }
    } else {
      const q = query.toLowerCase();
      const filteredWaiting = waiting.filter(k => k.kapanNo.toLowerCase().includes(q));
      const filteredApproved = approved.filter(pc => pc.kapanNo.toLowerCase().includes(q) || (pc.roughName && pc.roughName.toLowerCase().includes(q)));

      if (filteredWaiting.length > 0) {
        optionsHtml += `<optgroup label="⚠️ મંજૂરી માટે બાકી કાપણ (Pending Approval)">`;
        filteredWaiting.forEach(k => {
          optionsHtml += `<option value="${k.id}">[⚠️ મંજૂરી બાકી] ${k.kapanNo} (${k.carat} Cts)</option>`;
        });
        optionsHtml += `</optgroup>`;
      }

      if (filteredApproved.length > 0) {
        optionsHtml += `<optgroup label="✅ મંજૂર થયેલ ચાર્ટ (Approved)">`;
        filteredApproved.forEach(pc => {
          optionsHtml += `<option value="${pc.id}">[✅ મંજૂર થયેલ] ${pc.kapanNo} (${pc.roughName || ""})</option>`;
        });
        optionsHtml += `</optgroup>`;
      }
    }

    select.innerHTML = optionsHtml;
  }

  function filterMergedSearchSelect() {
    renderMergedPolishChartSelect();
  }

  // Alias functions to avoid breaking any other references
  function renderPolishChartFormKapan() {
    renderMergedPolishChartSelect();
  }

  function populatePolishChartSearchSelect() {
    // Deprecated but kept to prevent any undefined function calls
  }

  function filterSearchSelect() {
    loadPolishChartForm();
  }

  function viewSelectedPolishChart() {
    loadPolishChartForm();
  }

  function calculateChartCosting() {
    const rWeight = parseFloat(document.getElementById("pcRWeight").value) || 0;
    const roughBhav = parseFloat(document.getElementById("pcRoughBhav").value) || 0;
    const polishNang = parseInt(document.getElementById("pcPolishNang").value) || 0;
    const polishCarat = parseFloat(document.getElementById("pcPolishCarat").value) || 0;
    const masterMajRate = state.majuriRate !== undefined ? state.majuriRate : 65;

    const roughAmt = rWeight * roughBhav;
    const majuri = polishNang * masterMajRate;
    const totalExpense = roughAmt + majuri;
    const totalExpenseRounded = Math.round(totalExpense / 100) * 100;

    if (polishCarat > 0) {
      document.getElementById("pcPadtar").value = Math.round(Math.round(totalExpenseRounded / polishCarat) / 10) * 10;
    } else {
      document.getElementById("pcPadtar").value = 0;
    }

    const reqWeightPct = parseFloat(document.getElementById("pcReqWeightPct").value) || 0;
    
    // Find selected Kapan to get its RT Weight and Rough Pcs
    const pcKapanSelectEl = document.getElementById("pcMergedSelect");
    const activeKapanId = pcKapanSelectEl ? pcKapanSelectEl.value : "";
    const k = (state.kapans || []).find(x => x.id === activeKapanId);
    const rtCt = k ? (k.rtCt || 0) : 0;
    const roughPcs = k ? (k.nang || 0) : 0;

    if (rWeight > 0) {
      const achievedPct = (polishCarat / rWeight) * 100;
      document.getElementById("pcRToPolishPct").value = achievedPct.toFixed(2);
      
      // તૈયાર ગુણાકાર % = Polish Weight / RT Weight (linked to Excel B16)
      const multPctVal = rtCt > 0 ? (polishCarat / rtCt * 100) : 0;
      document.getElementById("pcMultPct").value = multPctVal.toFixed(2);
      
      // variation % = Actual % - Expected % (linked to Excel U5 / B18)
      const varPct = achievedPct - reqWeightPct;
      document.getElementById("pcVarPct").value = varPct.toFixed(2);
      
      // રફ સાઇઝ (Rough Size) = Rough Pcs / Rough Weight (linked to Excel G5)
      document.getElementById("pcRSize").value = (roughPcs / rWeight).toFixed(2);
      
      const weightAuto = document.getElementById("pcWeightFormula").getAttribute("data-auto") === "true";
      if (weightAuto) {
        document.getElementById("pcWeightFormula").value = rWeight.toFixed(2) + " * " + Math.round(roughBhav);
      }
    }
    
    const gNangAuto = document.getElementById("pcGNangFormula").getAttribute("data-auto") === "true";
    if (gNangAuto) {
      document.getElementById("pcGNangFormula").value = polishNang + " * " + masterMajRate;
    }
  }

  function loadPolishChartForm() {
    const id = (document.getElementById("pcMergedSelect") || {}).value || "";
    const formEl = document.getElementById("polishChartFormCard");
    const previewEl = document.getElementById("polishChartPreviewBox");
    const placeholderEl = document.getElementById("pcMergedPlaceholderMsg");
    const displayEl = document.getElementById("selectedChartDisplayArea");
    
    if (!id) {
      if (formEl) formEl.style.display = "none";
      if (previewEl) previewEl.style.display = "none";
      if (placeholderEl) placeholderEl.style.display = "block";
      return;
    }
    
    if (id.startsWith("PC")) {
      // Approved Polish Chart
      if (formEl) formEl.style.display = "none";
      if (placeholderEl) placeholderEl.style.display = "none";
      if (previewEl) previewEl.style.display = "block";
      
      const chart = (state.polishCharts || []).find(pc => pc.id === id);
      if (chart && displayEl) {
        displayEl.innerHTML = generatePolishChartHtml(chart, "selectedView");
        // Setup download button click handler
        const btnDownload = document.getElementById("btnDownloadImage");
        if (btnDownload) {
          btnDownload.onclick = function() {
            exportChartAsImage(`selectedView_${chart.id}`, chart.kapanNo);
          };
        }
      }
      return;
    }
    
    // Otherwise it is a Kapan ID (starts with K)
    const k = (state.kapans || []).find(x => x.id === id);
    if (!k) {
      if (formEl) formEl.style.display = "none";
      if (previewEl) previewEl.style.display = "none";
      if (placeholderEl) placeholderEl.style.display = "block";
      return;
    }
    
    if (placeholderEl) placeholderEl.style.display = "none";
    if (previewEl) previewEl.style.display = "none";
    if (formEl) formEl.style.display = "block";
    
    let chart = (state.polishCharts || []).find(pc => pc.kapanNo === k.kapanNo);
    if (!chart) {
      chart = ensureDraftPolishChart(k);
    }

    const rough = (state.roughLots || []).find(r => r.id === k.roughId);

    document.getElementById("pcKapanNo").value = chart.kapanNo;
    document.getElementById("pcRoughName").value = chart.roughName || "";
    document.getElementById("pcDate").value = chart.date || new Date().toISOString().slice(0,10);
    document.getElementById("pcAssort").value = chart.assort || "";
    document.getElementById("pcReAssort").value = chart.reAssort || "";
    document.getElementById("pcMicron").value = chart.micron || "";
    document.getElementById("pcShading").value = chart.shading || "";
    
    // Load assortment table values
    const dDays = getDeptDaysForPolishChart(k.kapanNo);
    document.getElementById("pcTableAssort").value = chart.tableAssort != null && chart.tableAssort !== "" ? chart.tableAssort : dDays.assort;
    document.getElementById("pcTableGlx").value = chart.tableGlx != null && chart.tableGlx !== "" ? chart.tableGlx : dDays.galaxy;
    document.getElementById("pcTable4P").value = chart.table4P != null && chart.table4P !== "" ? chart.table4P : dDays.fourP;
    document.getElementById("pcTableRT").value = chart.tableRT != null && chart.tableRT !== "" ? chart.tableRT : dDays.rt;
    document.getElementById("pcTableReAssort").value = chart.tableReAssort != null && chart.tableReAssort !== "" ? chart.tableReAssort : dDays.reAssort;
    document.getElementById("pcTableKhata").value = chart.tableKhata != null && chart.tableKhata !== "" ? chart.tableKhata : dDays.khata;
    document.getElementById("pcTableJama").value = chart.tableJama != null && chart.tableJama !== "" ? chart.tableJama : dDays.total;
    document.getElementById("pcTableVigat").value = chart.tableVigat || "";
    document.getElementById("pcTableRaOut").value = chart.tableRaOut || "";
    document.getElementById("pcTablePoHead").value = chart.tablePoHead || "";
    
    // Calculate total repairs percentage dynamically for default
    const repairsForKapan = state.repairs.filter(r => r.kapanNo === k.kapanNo);
    const totalRepairCarats = repairsForKapan.reduce((sum, r) => sum + parseFloat(r.carat || 0), 0);
    const computedRepairPct = k.carat > 0 ? ((totalRepairCarats / k.carat) * 100).toFixed(2) : "0.00";
    document.getElementById("pcTableRepairPct").value = chart.tableRepairPct || (totalRepairCarats > 0 ? computedRepairPct + "%" : "");

    document.getElementById("pcRWeight").value = chart.rWeight || k.carat;
    const defaultNang = k.rtNang || k.fourPNang || k.makeablePiece || k.nang;
    const currentRWeight = chart.rWeight || k.carat;
    const defaultRSize = currentRWeight > 0 ? (defaultNang / currentRWeight).toFixed(2) : "0.00";
    const defaultCardSize = calculateKraftSize(k).toFixed(2);
    document.getElementById("pcRSize").value = chart.rSize || defaultRSize;
    document.getElementById("pcCardSize").value = chart.cardSize || defaultCardSize;
    document.getElementById("pcReqWeightPct").value = chart.reqWeightPct != null ? chart.reqWeightPct : "";
    document.getElementById("pcFourPPct").value = chart.fourPPct != null ? chart.fourPPct : "";
    document.getElementById("pcRTPct").value = chart.rtPct != null ? chart.rtPct : "";
    document.getElementById("pcMultPct").value = chart.multPct != null ? chart.multPct : "";
    document.getElementById("pcRToPolishPct").value = chart.rToPolishPct != null ? chart.rToPolishPct : (k.r2pPct || 0);
    document.getElementById("pcVarPct").value = chart.varPct != null ? chart.varPct : 0;
    
    // Setup defaults for Weight and G-Nung
    const masterMajRate = state.majuriRate !== undefined ? state.majuriRate : 65;
    const currentRoughRate = k.roughRate !== undefined ? k.roughRate : (rough ? (rough.rate || 2730) : 2730);
    const defaultWeightFormulaVal = currentRWeight.toFixed(2) + " * " + Math.round(currentRoughRate);
    document.getElementById("pcWeightFormula").value = chart.weightFormula || defaultWeightFormulaVal;
    document.getElementById("pcWeightFormula").setAttribute("data-auto", chart.weightFormula ? "false" : "true");
    document.getElementById("pcGNangFormula").value = chart.gNangFormula || Math.round(defaultNang * masterMajRate);
    document.getElementById("pcGNangFormula").setAttribute("data-auto", chart.gNangFormula ? "false" : "true");

    // Load planning details
    document.getElementById("pcSalePct").value = chart.salePct || "";
    document.getElementById("pcFlatPct").value = chart.flatPct || "";
    document.getElementById("pcManualPct").value = chart.manualPct || "";
    document.getElementById("pcGlxPct").value = chart.glxPct || "";
    document.getElementById("pcOutPct").value = chart.outPct || "";
    document.getElementById("pcRoughBhav").value = chart.roughBhav || 2730;

    // Load sieves
    document.getElementById("pcS65").value = chart.s65 || "";
    document.getElementById("pcS4").value = chart.s4 || "";
    document.getElementById("pcS2").value = chart.s2 || "";
    document.getElementById("pcS20").value = chart.s20 || "";
    document.getElementById("pcS00").value = chart.s00 || "";
    document.getElementById("pcS000").value = chart.s000 || "";
    document.getElementById("pcS2plus").value = chart.s2plus || "";
    document.getElementById("pcS2minus").value = chart.s2minus || "";
    recalculateSieveTotals();

    // Load gala ranges
    document.getElementById("pcG5A7").value = chart.g5a7 || "";
    document.getElementById("pcG8A10B").value = chart.g8a10b || "";
    document.getElementById("pcG1112").value = chart.g1112 || "";
    document.getElementById("pcGWHNW").value = chart.gwhnw || "";
    document.getElementById("pcGOWTTLB").value = chart.gowttlb || "";
    document.getElementById("pcGTLBLBDB").value = chart.gtlblbdb || "";

    document.getElementById("pcPolishNang").value = chart.polishNang || defaultNang;
    document.getElementById("pcPolishCarat").value = chart.polishCarat || (k.rtCt || k.fourPCt || k.makeableVajan || k.carat);
    document.getElementById("pcPadtar").value = chart.padtar || 0;
    document.getElementById("pcVigat").value = chart.vigat || "";

    // Reset manual repair inputs
    document.getElementById("pcManualRepairNang").value = "";
    document.getElementById("pcManualRepairCarat").value = "";

    calculateChartCosting();
  }

  function savePolishChart(e) {
    e.preventDefault();
    const kapanNo = document.getElementById("pcKapanNo").value;
    const k = (state.kapans || []).find(x => x.kapanNo === kapanNo);

    let chart = (state.polishCharts || []).find(pc => pc.kapanNo === kapanNo);
    const isNew = !chart;
    if (isNew) {
      chart = { id: "PC" + Date.now(), kapanNo: kapanNo };
    }

    chart.roughName = document.getElementById("pcRoughName").value;
    chart.date = document.getElementById("pcDate").value;
    chart.assort = document.getElementById("pcAssort").value || "A-1";
    chart.reAssort = document.getElementById("pcReAssort").value || "RA-1";
    chart.micron = document.getElementById("pcMicron").value || "M-1";
    chart.shading = document.getElementById("pcShading").value || "S-1";
    
    chart.tableRaOut = document.getElementById("pcTableRaOut").value;
    chart.tablePoHead = document.getElementById("pcTablePoHead").value;
    chart.tableRepairPct = document.getElementById("pcTableRepairPct").value;

    chart.rWeight = parseFloat(document.getElementById("pcRWeight").value) || 0;
    chart.rSize = document.getElementById("pcRSize").value;
    chart.cardSize = parseFloat(document.getElementById("pcCardSize").value) || 0;
    chart.reqWeightPct = parseFloat(document.getElementById("pcReqWeightPct").value) || 0;
    chart.fourPPct = parseFloat(document.getElementById("pcFourPPct").value) || 0;
    chart.rtPct = parseFloat(document.getElementById("pcRTPct").value) || 0;
    chart.multPct = parseFloat(document.getElementById("pcMultPct").value) || 0;
    chart.rToPolishPct = parseFloat(document.getElementById("pcRToPolishPct").value) || 0;
    chart.varPct = parseFloat(document.getElementById("pcVarPct").value) || 0;
    chart.weightFormula = document.getElementById("pcWeightFormula").value;
    chart.gNangFormula = document.getElementById("pcGNangFormula").value;

    // Save planning details
    chart.salePct = parseFloat(document.getElementById("pcSalePct").value) || 0;
    chart.flatPct = parseFloat(document.getElementById("pcFlatPct").value) || 0;
    chart.manualPct = parseFloat(document.getElementById("pcManualPct").value) || 0;
    chart.glxPct = parseFloat(document.getElementById("pcGlxPct").value) || 0;
    chart.outPct = parseFloat(document.getElementById("pcOutPct").value) || 0;
    chart.roughBhav = parseFloat(document.getElementById("pcRoughBhav").value) || 0;

    // Save sieves
    chart.s65 = parseFloat(document.getElementById("pcS65").value) || 0;
    chart.s4 = parseFloat(document.getElementById("pcS4").value) || 0;
    chart.s2 = parseFloat(document.getElementById("pcS2").value) || 0;
    chart.s20 = parseFloat(document.getElementById("pcS20").value) || 0;
    chart.s00 = parseFloat(document.getElementById("pcS00").value) || 0;
    chart.s000 = parseFloat(document.getElementById("pcS000").value) || 0;
    chart.s2plus = parseFloat(document.getElementById("pcS2plus").value) || 0;
    chart.s2minus = parseFloat(document.getElementById("pcS2minus").value) || 0;

    // Save gala ranges
    chart.g5a7 = parseFloat(document.getElementById("pcG5A7").value) || 0;
    chart.g8a10b = parseFloat(document.getElementById("pcG8A10B").value) || 0;
    chart.g1112 = parseFloat(document.getElementById("pcG1112").value) || 0;
    chart.gwhnw = parseFloat(document.getElementById("pcGWHNW").value) || 0;
    chart.gowttlb = parseFloat(document.getElementById("pcGOWTTLB").value) || 0;
    chart.gtlblbdb = parseFloat(document.getElementById("pcGTLBLBDB").value) || 0;

    chart.polishCarat = parseFloat(document.getElementById("pcPolishCarat").value) || 0;
    chart.polishNang = parseInt(document.getElementById("pcPolishNang").value) || 0;
    chart.padtar = parseFloat(document.getElementById("pcPadtar").value) || 0;
    chart.vigat = document.getElementById("pcVigat").value.trim();
    chart.status = "Approved";

    if (isNew) {
      state.polishCharts.unshift(chart);
    }

    if (k) {
      k.currentDept = "OK KAPAN (ઓકે કાપણ)";
      k.status = "Completed";
      k.carat = chart.polishCarat;
      k.nang = chart.polishNang || k.nang;
    }

    saveState();
    renderAll();
    showToast(`પોલિશ ચાર્ટ મંજૂર થયો અને કાયમી સેવ થયો!`);
  }

  function exportChartAsImage(containerId, kapanNo) {
    const el = document.getElementById(containerId);
    if (!el) return;

    showToast("🖼️ પોલિશ ચાર્ટ ઈમેજ જનરેટ થઈ રહી છે...");
    html2canvas(el, { scale: 2 }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Polish_Chart_${kapanNo}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("🖼️ પોલિશ ચાર્ટ ઈમેજ ડાઉનલોડ થઈ ગઈ!");
    }).catch(err => {
      console.error(err);
      alert("❌ ઈમેજ બનાવવામાં ભૂલ આવી!");
    });
  }

  function getDeptDaysForPolishChart(kapanNo) {
    const k = (state.kapans || []).find(x => x.kapanNo === kapanNo);
    if (!k) return { assort: "-", galaxy: "-", fourP: "-", rt: "-", reAssort: "-", khata: "-", total: "-" };

    // Get transfers chronologically
    const transfers = state.transfers
      .filter(t => t.kapanNo === kapanNo)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    let prevTime = new Date(k.createdDate).getTime();
    let currentDept = "Galaxy";

    const daysMap = {
      "Galaxy": 0,
      "AP OK": 0,
      "4P": 0,
      "4P OK RT BAAKI": 0,
      "RT": 0,
      "RT OK KHATA BAAKI": 0,
      "KHATA": 0
    };

    transfers.forEach(t => {
      const nextTime = new Date(t.timestamp).getTime();
      const diffMs = nextTime - prevTime;
      const diffDays = diffMs / (24 * 60 * 60 * 1000);
      if (daysMap[currentDept] !== undefined) {
        daysMap[currentDept] += diffDays;
      }
      currentDept = t.toDept;
      prevTime = nextTime;
    });

    // If it is not completed yet, count time in current department up to now
    if (k.currentDept !== "OK KAPAN (ઓકે કાપણ)") {
      const nextTime = Date.now();
      const diffMs = nextTime - prevTime;
      const diffDays = diffMs / (24 * 60 * 60 * 1000);
      if (daysMap[currentDept] !== undefined) {
        daysMap[currentDept] += diffDays;
      }
    }

    const glxDays = daysMap["Galaxy"];
    const assortDays = daysMap["AP OK"];
    const fourPDays = daysMap["4P"] + daysMap["4P OK RT BAAKI"];
    const rtDays = daysMap["RT"] + daysMap["RT OK KHATA BAAKI"];
    const khataDays = daysMap["KHATA"];
    
    // Total days: from createdDate to the time it reached "OK KAPAN (ઓકે કાપણ)"
    let totalDays = 0;
    const finalTransfer = transfers.find(t => t.toDept === "OK KAPAN (ઓકે કાપણ)");
    if (finalTransfer) {
      totalDays = (new Date(finalTransfer.timestamp).getTime() - new Date(k.createdDate).getTime()) / (24 * 60 * 60 * 1000);
    } else {
      totalDays = (Date.now() - new Date(k.createdDate).getTime()) / (24 * 60 * 60 * 1000);
    }

    const formatDays = (d) => {
      if (d <= 0.05) return "0";
      return d.toFixed(1);
    };

    return {
      galaxy: formatDays(glxDays),
      assort: formatDays(assortDays),
      fourP: formatDays(fourPDays),
      rt: formatDays(rtDays),
      reAssort: "0",
      khata: formatDays(khataDays),
      total: formatDays(totalDays)
    };
  }

  function generatePolishChartHtml(pc, idPrefix = "pcCard") {
    const activeRepairs = state.repairs.filter(r => r.kapanNo === pc.kapanNo && r.status === "Active");
    const rNang = activeRepairs.reduce((sum, r) => sum + parseInt(r.nang || 0), 0);
    const rCarat = activeRepairs.reduce((sum, r) => sum + parseFloat(r.carat || 0), 0).toFixed(2);
    const ongoingRepairHtml = (rNang > 0 || parseFloat(rCarat) > 0) 
      ? `${rNang > 0 ? `નંગ: ${rNang} | ` : ""}વજન: ${rCarat} Cts` 
      : "-";

    const dDays = getDeptDaysForPolishChart(pc.kapanNo);
    const rToPolishPctDisplay = pc.rToPolishPct != null && pc.rToPolishPct !== "" ? Number(pc.rToPolishPct).toFixed(2) : "";
    const varPctDisplay = pc.varPct != null && pc.varPct !== "" ? Number(pc.varPct).toFixed(2) : "";
    const varPctSign = varPctDisplay !== "" ? (Number(varPctDisplay) >= 0 ? "+" : "") : "";

    const totalSieve = parseFloat(((pc.s2plus || 0) + (pc.s2minus || 0)).toFixed(2));
    const sumIs100 = Math.abs(totalSieve - 100) < 0.05;
    const errorColor = sumIs100 ? "inherit" : "#dc2626";
    const errorBg = sumIs100 ? "#f8fafc" : "#fee2e2";

    return `
      <div class="photo1-paper-container" id="${idPrefix}_${pc.id}" style="margin-bottom:20px; border:3px solid #000; padding:16px; background:#fff; color:#000;">
        <div class="photo1-head-title" style="text-align: right; font-size: 26px; font-weight: 900; text-decoration: underline; margin-bottom: 10px;">પોલિશ ચાર્ટ</div>
        <div class="photo1-header-grid" style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 10px; font-weight: 700; font-size: 15px;">
          <span>કાપણ નંબર :- <b>${pc.kapanNo}</b></span>
          <span>રફ નામ :- <b>${pc.roughName}</b></span>
          <span>તારીખ :- <b>${pc.date}</b></span>
        </div>

        <table class="photo1-table" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12.5px;">
          <thead>
            <tr>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">એસોર્ટ નામ</th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">રી એસોર્ટ નામ</th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;"></th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">માઈક્રૉન</th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;"></th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">શેડિંગ</th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">એસોર્ટ</th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">ગેલેક્સી</th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">4P</th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">R-T</th>
              <th style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">રી એસોર્ટ</th>
              <th style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">ખાતા</th>
              <th rowspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">જમા</th>
              <th style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">વિગત</th>
            </tr>
            <tr>
              <th style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">RA-OUT %</th>
              <th style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">પો-હેડ</th>
              <th style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">રીપેરીંગ %</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1.5px solid #000; padding: 4px 6px;">${pc.assort || ""}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px;">${pc.reAssort || ""}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px;"></td>
              <td style="border: 1.5px solid #000; padding: 4px 6px;">${pc.micron || ""}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px;"></td>
              <td style="border: 1.5px solid #000; padding: 4px 6px;">${pc.shading || ""}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px; text-align:center; font-weight:700;">${dDays.assort}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px; text-align:center; font-weight:700;">${dDays.galaxy}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px; text-align:center; font-weight:700;">${dDays.fourP}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px; text-align:center; font-weight:700;">${dDays.rt}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px; text-align:center; font-weight:700;">${dDays.reAssort}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px; text-align:center; font-weight:700;">${dDays.khata}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px; text-align:center; font-weight:700; background:#fef08a;">${dDays.total}</td>
              <td style="border: 1.5px solid #000; padding: 4px 6px;">${pc.tableVigat || ""}</td>
            </tr>
          </tbody>
        </table>

        <div class="photo1-grid-4col">
          <!-- COLUMN 1: GALAXY DETAILS -->
          <div>
            <table class="photo1-table" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12.5px;">
              <thead><tr><th colspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">ગેલેક્ષી વીગત</th></tr></thead>
              <tbody>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">કાચું વજન</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.rWeight || ""}</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">રફ સાઇઝ</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.rSize != null && pc.rSize !== "" ? Number(pc.rSize).toFixed(2) : ""}</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">ક્રાફ સાઇઝ</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.cardSize || ""}</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">માંગેલું વજન %</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.reqWeightPct != null && pc.reqWeightPct !== "" ? Number(pc.reqWeightPct).toFixed(2) : ""}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">4P %</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.fourPPct != null && pc.fourPPct !== "" ? Number(pc.fourPPct).toFixed(2) : ""}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">RT %</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.rtPct != null && pc.rtPct !== "" ? Number(pc.rtPct).toFixed(2) : ""}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">તૈયાર ગુણાકાર %</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.multPct != null && pc.multPct !== "" ? Number(pc.multPct).toFixed(2) : ""}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">રફ TO પોલીસ %</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${rToPolishPctDisplay}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">વેરીએશન %</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${varPctSign}${varPctDisplay}</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">વજન ફોર્મ્યુલા</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.weightFormula || ""}</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">G - નંગ</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.gNangFormula || ""}</b></td></tr>
              </tbody>
            </table>
          </div>

          <!-- COLUMN 2: PLANNING DETAILS -->
          <div>
            <table class="photo1-table" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12.5px;">
              <thead><tr><th colspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">નિયોજન વિગતો</th></tr></thead>
              <tbody>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">સેલ % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.salePct || ""}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">ફ્લેટ % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.flatPct || ""}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">મેન્યુઅલ % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.manualPct || ""}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">કેલેક્ષિ % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.glxPct || ""}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">આઉટ % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.outPct || ""}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">રફ ભાવ :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>₹${pc.roughBhav || ""}</b></td></tr>
              </tbody>
            </table>
          </div>

          <!-- COLUMN 3: SIEVE SIZES % -->
          <div>
            <table class="photo1-table" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12.5px;">
              <thead><tr><th colspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">પૉલિશ ચારણી %</th></tr></thead>
              <tbody>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">+6.5</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.s65 || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">+4</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.s4 || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">+2</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.s2 || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">-2 + 0</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.s20 || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">- 0 + 000</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.s00 || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">- 000</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.s000 || 0}%</b></td></tr>
                <tr style="font-weight: 900; background: ${errorBg}; color: ${errorColor};"><td style="border: 1.5px solid #000; padding: 4px 6px; font-weight: 900;">+2</td><td style="border: 1.5px solid #000; padding: 4px 6px; font-weight: 900;">${pc.s2plus || 0}%</td></tr>
                <tr style="font-weight: 900; background: ${errorBg}; color: ${errorColor};"><td style="border: 1.5px solid #000; padding: 4px 6px; font-weight: 900;">-2</td><td style="border: 1.5px solid #000; padding: 4px 6px; font-weight: 900;">${pc.s2minus || 0}%</td></tr>
              </tbody>
            </table>
          </div>

          <!-- COLUMN 4: COLOR/GALA RANGES -->
          <div>
            <table class="photo1-table" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12.5px;">
              <thead><tr><th colspan="2" style="border: 1.5px solid #000; padding: 4px 6px; background: #f1f5f9;">પૉલિશ ગાળા</th></tr></thead>
              <tbody>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">5A + 7 % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.g5a7 || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">8A + 10B % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.g8a10b || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">11 + 12 % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.g1112 || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">WH + NW % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.gwhnw || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">OW + TTLB % :-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.gowttlb || 0}%</b></td></tr>
                <tr><td style="border: 1.5px solid #000; padding: 4px 6px;">TLB+LB+DB %:-</td><td style="border: 1.5px solid #000; padding: 4px 6px;"><b>${pc.gtlblbdb || 0}%</b></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- BOTTOM SECTION -->
        <div style="display:flex; justify-content:space-between; align-items:stretch; gap:10px; margin-top:12px; border-top: 1.5px solid #000; padding-top:10px;">
          <div style="flex:2; display:grid; grid-template-columns: repeat(2, 1fr); gap:10px;">
            <div style="border:1.5px solid #000; padding:6px; text-align:center; background:#fff;">
              <b>પોલિશ વજન (Cts)</b><br>
              <div style="font-size:18px; font-weight:900;">${pc.polishCarat || 0} Cts</div>
            </div>
            <div style="border:1.5px solid #000; padding:6px; text-align:center; background:#f8fafc;">
              <b>પડતર (Costing)</b><br>
              <div style="font-size:18px; font-weight:900; color:#16a34a;">₹${pc.padtar || 0}</div>
            </div>
          </div>
          
          <div style="flex:1; border:1.5px solid #000; padding:6px; background:#fef2f2; text-align:center; display:flex; flex-direction:column; justify-content:center;">
            <span style="font-size:11px; font-weight:700; color:var(--danger);">ચાલુ રીપેરીંગ (Ongoing Repair)</span>
            <div style="font-size:14px; font-weight:800; color:#991b1b; margin-top:2px;">
              ${ongoingRepairHtml}
            </div>
          </div>
        </div>

        <div style="margin-top:10px; border-top:1.5px dashed #000; padding-top:8px; text-align:left;">
          <b>એકત્રિત વિગત / નોંધ:</b> ${pc.vigat || pc.tableVigat || "-"}
        </div>
      </div>
    `;
  }

  function renderPolishChartsList() {
    populatePolishChartSearchSelect();
  }

  // WORKABLE REPORT
  function renderWorkableReportTable() {
    const container = document.getElementById("workableReportContainer");
    if (!container) return;

    function getDeptHistoryValues(k, deptName) {
      const transfersForKapan = (state.transfers || []).filter(t => t && t.kapanNo && typeof t.kapanNo === "string" && t.kapanNo.trim().toLowerCase() === k.kapanNo.trim().toLowerCase());
      const transferFromD = transfersForKapan.find(t => t.fromDept === deptName);
      
      let nang = null;
      let carat = null;
      let customVal = "";
      let entryTime = null;
      let exitTime = null;
      
      if (transferFromD) {
        nang = transferFromD.nang;
        carat = transferFromD.carat;
        exitTime = new Date(transferFromD.timestamp);
        
        const transferToD = transfersForKapan.find(t => t.toDept === deptName);
        entryTime = transferToD ? new Date(transferToD.timestamp) : (deptName === "Galaxy" ? new Date(k.createdDate) : null);
        
        if (transferFromD.vigat) {
          const match = transferFromD.vigat.match(/\[(.*?)\]/);
          if (match) {
            const inner = match[1];
            const parts = inner.split(":");
            customVal = parts.length > 1 ? parts[1].trim() : inner.trim();
          }
        }
      } else {
        // Fallback to Kapan properties if no transfer record exists
        const depts = DEPTS;
        const curIdx = depts.indexOf(k.currentDept);
        const targetIdx = depts.indexOf(deptName);
        
        if (targetIdx < curIdx) {
          // Only fall back if the department has actually been passed
          if (deptName === "Galaxy" || deptName === "AP OK") {
            nang = k.roughNang;
            carat = k.roughWeight;
            if (deptName === "Galaxy" && k.r2pPct) {
              customVal = k.r2pPct;
            }
          } else if (deptName === "4P" || deptName === "4P OK RT BAAKI") {
            nang = k.fourPNang || k.roughNang;
            carat = k.fourPCt || k.roughWeight;
            if (deptName === "4P" && k.lots) {
              customVal = k.lots;
            }
          } else if (deptName === "RT" || deptName === "RT OK KHATA BAAKI") {
            nang = k.rtNang || k.fourPNang || k.roughNang;
            carat = k.rtCt || k.fourPCt || k.roughWeight;
          } else if (deptName === "KHATA") {
            nang = k.makeablePiece || k.nang;
            carat = k.makeableVajan || k.carat;
          }
        }
      }
      
      let daysHtml = "";
      if (entryTime && exitTime) {
        const diffDays = Math.max(0.1, parseFloat(((exitTime - entryTime) / (1000 * 60 * 60 * 24)).toFixed(1)));
        daysHtml = `<div style="font-size: 10.5px; color: #64748b; margin-top: 3px; font-weight: 600;">${diffDays}</div>`;
      }
      
      return { nang, carat, customVal, daysHtml };
    }

    const query = (document.getElementById("workableSearch") || {}).value || "";

    const activeList = (state.kapans || []).filter(k => isMatchSearch(k.kapanNo, query));

    const completedList = activeList.filter(k => k.currentDept === "OK KAPAN (ઓકે કાપણ)");
    const processingList = activeList.filter(k => k.currentDept !== "OK KAPAN (ઓકે કાપણ)");

    processingList.sort((a, b) => {
      const aUrgent = (a.tag || "").toLowerCase() === "urgent" ? 1 : 0;
      const bUrgent = (b.tag || "").toLowerCase() === "urgent" ? 1 : 0;
      if (aUrgent !== bUrgent) return bUrgent - aUrgent;
      
      const aSample = (a.tag || "").toLowerCase() === "sample" ? 1 : 0;
      const bSample = (b.tag || "").toLowerCase() === "sample" ? 1 : 0;
      if (aSample !== bSample) return bSample - aSample;
      
      const dateA = new Date(a.createdDate || a.lastMovedDate || 0);
      const dateB = new Date(b.createdDate || b.lastMovedDate || 0);
      return dateA - dateB;
    });

    let html = "";

    // 1. COMPLETED SECTION AT THE TOP
    html += `
      <div style="margin-bottom: 25px; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px;">
        <h3 style="color:#0f172a; margin-bottom: 12px; font-weight:700; font-size:16px; display:flex; align-items:center; gap:8px;">
          🏆 ઓકે કાપણ (OK KAPAN)
        </h3>
    `;

    if (completedList.length === 0) {
      html += `<div style="padding:15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; color:#64748b; font-size:13px; text-align:center;">હાલમાં કોઈ ઓકે કાપણ નથી.</div>`;
    } else {
      // Limit approved showcase stock
      if (window.showcaseLimit === undefined) {
        window.showcaseLimit = 3;
      }

      const drafts = completedList.filter(k => {
        const chart = (state.polishCharts || []).find(pc => pc && pc.kapanNo === k.kapanNo);
        return !chart || chart.status !== "Approved";
      });

      const approved = completedList.filter(k => {
        const chart = (state.polishCharts || []).find(pc => pc && pc.kapanNo === k.kapanNo);
        return chart && chart.status === "Approved";
      });

      // Sort approved by last moved date or date (newest first)
      approved.sort((a, b) => new Date(b.lastMovedDate || b.createdDate || 0) - new Date(a.lastMovedDate || a.createdDate || 0));

      const visibleApproved = approved.slice(0, window.showcaseLimit);
      const hasMore = approved.length > window.showcaseLimit;
      const finalCompletedList = [...drafts, ...visibleApproved];

      html += `
        <div class="table-responsive">
          <table>
            <thead>
              <tr style="background:#f8fafc;">
                <th>કાપણ #</th>
                <th>રફ નામ</th>
                <th>નંગ (Pis)</th>
                <th>વજન (Carats)</th>
                <th style="text-align:center;">ચાર્ટ મંજૂરી સ્થિતિ</th>
                <th>વિગત (Vigat)</th>
                <th style="text-align:center; width:200px;">એક્શન</th>
              </tr>
            </thead>
            <tbody>
      `;
      finalCompletedList.forEach(k => {
        const rough = (state.roughLots || []).find(r => r.id === k.roughId);
        const chart = (state.polishCharts || []).find(pc => pc && pc.kapanNo === k.kapanNo);
        const isApproved = chart && chart.status === "Approved";
        const statusBadge = isApproved 
          ? `<span class="status-done" style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0; font-weight:700;">✅ મંજૂર થયેલ (Approved)</span>` 
          : `<span class="status-repair" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-weight:700;">⚠️ ડ્રાફ્ટ (Wait Approval)</span>`;
        
        const actionButton = isApproved 
          ? `<button class="btn btn-success" style="padding:4px 10px; font-size:12.5px; width:100%; font-weight:700;" onclick="viewChartDetailsPopup('${k.kapanNo}')">📄 ચાર્ટ જુઓ (View Chart)</button>` 
          : `<button class="btn btn-purple" style="padding:4px 10px; font-size:12.5px; width:100%; font-weight:700;" onclick="goToApproveChart('${k.id}')">✏️ ચાર્ટ મંજૂર કરો (Approve)</button>`;

        const vigatHtml = k.vigat 
          ? `
            <details style="cursor: pointer; font-size: 11.5px; outline: none; border: none; padding: 2px;">
              <summary style="font-weight: 700; color: var(--accent);">[+] Expand</summary>
              <div style="margin-top: 5px; font-size: 11px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 4px; text-align: left; line-height: 1.3; max-width: 250px; overflow-wrap: break-word;">
                ${k.vigat}
              </div>
            </details>
          ` 
          : "-";

        html += `
          <tr>
            <td><b>${k.kapanNo}</b></td>
            <td>${rough ? rough.name : "-"}</td>
            <td><b style="font-size:14px;">${k.nang} Pis</b></td>
            <td><b>${Number(k.carat).toFixed(2)} Cts</b></td>
            <td style="text-align:center;">${statusBadge}</td>
            <td>${vigatHtml}</td>
            <td style="text-align:center;">${actionButton}</td>
          </tr>
        `;
      });
      html += `
            </tbody>
          </table>
        </div>
      `;

      if (hasMore) {
        html += `
          <div style="text-align:center; margin-top:12px;">
            <button class="btn btn-outline" style="font-weight:700; border-color:var(--primary); color:var(--primary);" onclick="window.showcaseLimit += 10; renderWorkableReportTable();">➕ વધુ કાપણ લોડ કરો (Load More...)</button>
          </div>
        `;
      }
    }
    html += `</div>`;

    // 2. ACTIVE PROCESSING SECTION BELOW
    const processingDepts = DEPTS.filter(d => d !== "OK KAPAN (ઓકે કાપણ)");
    html += `
      <div>
        <h3 style="color:#0f172a; margin-bottom: 12px; font-weight:700; font-size:16px; display:flex; align-items:center; gap:8px;">
          ⚙️ લાઇવ સ્ટોક (Live Stock)
        </h3>
    `;

    if (processingList.length === 0) {
      html += `<div style="padding:15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; color:#64748b; font-size:13px; text-align:center;">હાલમાં કોઈ ચાલુ પ્રોસેસિંગ કાપણ નથી.</div>`;
    } else {
      html += `
        <div class="table-responsive">
          <table>
            <thead>
              <tr style="background:#f8fafc;">
                <th style="text-align: center;">KAPAN NO</th>
      `;
      processingDepts.forEach(d => {
        html += `<th style="text-align: center;">${d}</th>`;
      });
      html += `
              </tr>
            </thead>
            <tbody>
      `;
      processingList.forEach(k => {
        const tag = (k.tag || "").toLowerCase();
        let tagClass = "tag-regular";
        if (tag === "urgent") tagClass = "tag-urgent";
        else if (tag === "sample") tagClass = "tag-sample";
        
        const kapanBadge = `<span class="tag-badge ${tagClass}" style="font-size:12.5px; padding:4px 10px; display:inline-block; border-radius:4px; text-align:center; min-width:85px; font-weight:bold; box-sizing: border-box;">${k.kapanNo}</span>`;
        
        html += `<tr><td style="font-weight: bold; border: 1px solid #e2e8f0; padding: 10px; text-align: center; vertical-align: middle;">${kapanBadge}</td>`;
        
        const currentDeptIdx = processingDepts.indexOf(k.currentDept);
        
        processingDepts.forEach((d, dIdx) => {
          if (k.currentDept === d) {
            const statusLabel = k.status === "In-Repair" 
              ? `<span class="status-repair" style="display:inline-block; font-size:10px; padding:1px 4px; margin-top:2px;">🔧 રીપેરિંગ</span>` 
              : ``;
            
            html += `
              <td style="background: #eff6ff; border: 1.5px solid var(--accent); padding: 8px; vertical-align: middle; text-align: center;">
                <div style="font-weight:800; color:var(--primary); font-size:14px; margin-bottom: 2px;">${k.nang} Pis</div>
                <div style="font-weight:600; color:#475569; font-size:11px;">${Number(k.carat).toFixed(2)} Cts</div>
                ${statusLabel}
                <div style="margin-top: 6px;">
                  <button class="btn btn-purple" style="padding: 6px 12px; font-size: 12px; font-weight: 700; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; width:100%; justify-content:center;" onclick="openQuickTransferModal('${k.id}')" title="વિભાગ બદલો">
                    ⇄ ટ્રાન્સફર
                  </button>
                </div>
              </td>
            `;
          } else if (dIdx < currentDeptIdx) {
            const hist = getDeptHistoryValues(k, d);
            
            if (hist.nang === null) {
              html += `<td style="border: 1px solid #e2e8f0; padding: 8px;"></td>`;
            } else {
              const customValDisplay = hist.customVal 
                ? `<div style="font-size: 10.5px; color: var(--primary); font-weight: 700; margin-top: 3px;">${hist.customVal}</div>` 
                : "";
              
              html += `
                <td style="opacity: 0.55; filter: contrast(85%); border: 1px solid #e2e8f0; padding: 8px; text-align: center; vertical-align: middle; line-height: 1.25;">
                  <div style="font-weight:700; color:#334155; font-size:13px;">${hist.nang}</div>
                  <div style="font-weight:600; color:#475569; font-size:11.5px; margin-top: 2px;">${Number(hist.carat).toFixed(2)}</div>
                  ${customValDisplay}
                  ${hist.daysHtml}
                </td>
              `;
            }
          } else {
            html += `<td style="color:#cbd5e1; font-weight:normal; border: 1px solid #e2e8f0; padding: 10px; text-align: center; vertical-align: middle;">-</td>`;
          }
        });
        html += `</tr>`;
      });
      html += `
            </tbody>
          </table>
        </div>
      `;
    }
    html += `</div>`;

    container.innerHTML = html;
  }

  function viewChartDetailsPopup(kapanNo) {
    const pc = (state.polishCharts || []).find(x => x.kapanNo === kapanNo);
    if (!pc) {
      alert("❌ આ કાપણનો કોઈ પોલિશ ચાર્ટ મળ્યો નથી!");
      return;
    }

    const titleEl = document.getElementById("chartViewModalTitle");
    const contentEl = document.getElementById("chartViewModalContent");
    if (titleEl && contentEl) {
      titleEl.innerHTML = `📄 પોલિશ ચાર્ટ વિગતો :- કાપણ ${kapanNo}`;
      contentEl.innerHTML = `
        <div class="photo1-paper-container" id="pcCardModal_${pc.id}">
          <div class="photo1-head-title">પોલિશ ચાર્ટ</div>
          <div class="photo1-header-grid">
            <span>કાપણ નંબર :- <b>${pc.kapanNo}</b></span>
            <span>રફ નામ :- <b>${pc.roughName}</b></span>
            <span>તારીખ :- <b>${pc.date}</b></span>
          </div>

          <table class="photo1-table">
            <thead>
              <tr><th>એસોર્ટ નામ</th><th>રી એસોર્ટ</th><th>માઇક્રોન</th><th>શેડિંગ</th><th>4P</th><th>R-T</th><th>જમા</th><th>વિગત</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${pc.assort}</td><td>${pc.reAssort}</td><td>${pc.micron}</td><td>${pc.shading}</td><td>${pc.fourPPct}%</td><td>${pc.rtPct}%</td><td>જમા</td><td>${pc.vigat}</td>
              </tr>
            </tbody>
          </table>

          <table class="photo1-table">
            <thead>
              <tr><th>પોલિશ ધારણી %</th><th>+6.5</th><th>+4</th><th>+2</th><th>-2 + 0</th><th>- 000</th><th>+2</th><th>-2</th><th>પોલિશ વજન</th><th>પડતર</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><b>ટકા %</b></td><td>${pc.s65}%</td><td>${pc.s4}%</td><td>${pc.s2}%</td><td>${pc.s20}%</td><td>${pc.s000}%</td><td>${pc.s2plus}%</td><td>${pc.s2minus}%</td><td><b>${pc.polishCarat} Cts</b></td><td><b>₹${pc.padtar}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px; border-top:1px solid #cbd5e1; padding-top:10px;">
          <button class="btn btn-success" onclick="exportChartAsImage('pcCardModal_${pc.id}', '${pc.kapanNo}')">🖼️ ઈમેજ ડાઉનલોડ</button>
          <button class="btn btn-outline" onclick="closeChartViewModal()">બંધ કરો</button>
        </div>
      `;
      document.getElementById("chartViewModal").style.display = "flex";
    }
  }

  function closeChartViewModal() {
    document.getElementById("chartViewModal").style.display = "none";
  }

  // REPAIRING
  function populateRepairCarat() {
    const sel = document.getElementById("rpKapan");
    const k = (state.kapans || []).find(x => x.kapanNo === sel.value);
    if (k) {
      document.getElementById("rpCarat").value = k.carat;
      document.getElementById("rpNang").value = k.nang;
    }
  }

  function addRepair(e) {
    e.preventDefault();
    const kapanNo = document.getElementById("rpKapan").value;
    if (!kapanNo) {
      alert("❌ કૃપા કરીને કાપણ પસંદ કરો!");
      return;
    }
    const k = (state.kapans || []).find(x => x.kapanNo === kapanNo);

    const newRep = {
      id: "REP" + Date.now(),
      kapanNo: kapanNo,
      dept: document.getElementById("rpDept").value || (DEPTS[0] || "GALAXY-DP"),
      carat: parseFloat(document.getElementById("rpCarat").value) || 0,
      nang: parseInt(document.getElementById("rpNang").value) || 0,
      vigat: document.getElementById("rpVigat").value.trim() || "",
      status: "Active",
      sentDate: new Date().toISOString()
    };

    state.repairs.unshift(newRep);
    if (k) k.status = "In-Repair";

    saveState();
    renderAll();
    showToast(`કાપણ ${kapanNo} રીપેરિંગમાં મોકલ્યું!`);
    e.target.reset();
  }

  function renderRepairTable() {
    const sel = document.getElementById("rpKapan");
    if (sel) {
      sel.innerHTML = `<option value="">— કાપણ પસંદ કરો —</option>` + state.kapans
        .map(k => `<option value="${k.kapanNo}">${k.kapanNo} (${k.currentDept})</option>`).join("");
    }

    const tallySel = document.getElementById("tallyKapan");
    if (tallySel) {
      tallySel.innerHTML = `<option value="">— કાપણ પસંદ કરો —</option>` + state.kapans
        .map(k => `<option value="${k.kapanNo}">${k.kapanNo} (${k.currentDept} - ${k.carat} Cts - ${k.status})</option>`).join("");
    }

    const tbody = document.getElementById("repairTableBody");
    if (!tbody) return;
    tbody.innerHTML = (state.repairs || []).map(r => {
      const vigatHtml = r.vigat 
        ? `
          <details style="cursor: pointer; font-size: 11.5px; outline: none; border: none; padding: 2px;">
            <summary style="font-weight: 700; color: var(--accent);">[+] Expand</summary>
            <div style="margin-top: 5px; font-size: 11px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 4px; text-align: left; line-height: 1.3; max-width: 250px; overflow-wrap: break-word;">
              ${r.vigat}
            </div>
          </details>
        ` 
        : "-";

      return `
        <tr>
          <td><b>${r.kapanNo}</b></td>
          <td>${r.dept}</td>
          <td>${r.carat} Cts</td>
          <td>${r.nang} નંગ</td>
          <td>${vigatHtml}</td>
          <td>${new Date(r.sentDate).toLocaleDateString("gu-IN")}</td>
          <td>${r.status === "Active" ? '<span class="status-repair">🔧 પ્રોસેસમાં</span>' : '<span class="status-done">✅ પૂર્ણ</span>'}</td>
          <td>
            ${r.status === "Active" ? `<button class="btn btn-success" style="padding:2px 6px; font-size:11px;" onclick="completeRepair('${r.id}')">✅ OK પૂરું</button>` : "-"}
          </td>
        </tr>
      `;
    }).join("");
  }

  function submitTallyLoss(e) {
    e.preventDefault();
    const kapanNo = document.getElementById("tallyKapan").value;
    if (!kapanNo) {
      alert("❌ કૃપા કરીને કાપણ પસંદ કરો!");
      return;
    }

    const recoveredCarat = parseFloat(document.getElementById("tallyCarats").value) || 0;
    const recoveredNang = parseInt(document.getElementById("tallyNang").value) || 0;
    const reason = document.getElementById("tallyVigat").value.trim();

    if (recoveredCarat <= 0 && recoveredNang <= 0) {
      alert("❌ કૃપા કરીને પરત મળેલ વજન અથવા નંગમાંથી કોઈ એક સાચું લખો!");
      return;
    }

    const k = (state.kapans || []).find(x => x.kapanNo === kapanNo);
    if (!k) return;

    const prevCarat = k.carat;
    const prevNang = k.nang;

    k.carat += recoveredCarat;
    k.nang += recoveredNang;

    const accumVigat = k.vigat 
      ? `${k.vigat} | [Tally Loss]: Malyo +${recoveredCarat} Cts, +${recoveredNang} Pcs - ${reason}` 
      : `[Tally Loss]: Malyo +${recoveredCarat} Cts, +${recoveredNang} Pcs - ${reason}`;
    k.vigat = accumVigat;

    state.transfers.unshift({
      id: "TR" + Date.now(),
      kapanNo: k.kapanNo,
      fromDept: "Tally Loss / Recovery",
      toDept: k.currentDept,
      prevCarat: prevCarat,
      prevNang: prevNang,
      carat: k.carat,
      nang: k.nang,
      vigat: `Loss Recovery: ${reason}`,
      timestamp: new Date().toISOString()
    });

    saveState();
    renderAll();
    showToast(`કાપણ ${kapanNo} માં ઘટ સુધારો સફળતાપૂર્વક સંગ્રહિત થયો!`);
    e.target.reset();
  }

  function getActiveRepairsHtml(kapanNo) {
    const activeR = state.repairs.filter(r => r.kapanNo === kapanNo && r.status === "Active");
    if (activeR.length === 0) return "";
    
    const listItems = activeR.map(r => `
      <div style="font-size:11px; background:#fff1f2; border:1px solid #fecdd3; padding:5px; border-radius:4px; margin-top:4px; color:#be123c; text-align: left;">
        📍 <b>Stage:</b> ${r.dept} | <b>W:</b> ${r.carat} Cts, <b>N:</b> ${r.nang} Pcs <br>
        <span>Reason: ${r.vigat}</span>
      </div>
    `).join("");

    return `
      <div style="margin-top: 15px; border: 1.5px solid #fda4af; background: #fff5f5; padding: 10px; border-radius: 6px; max-width: 320px; margin-left: auto;">
        <div style="font-weight: 700; color: #e11d48; font-size: 12px; border-bottom: 1px solid #fda4af; padding-bottom: 3px; margin-bottom: 5px; text-align: right;">
          ⚠️ ચાલુ રીપેરિંગ (Ongoing Repair)
        </div>
        ${listItems}
      </div>
    `;
  }

  function renderGhatLogs() {
    const tbody = document.getElementById("ghatTableBody");
    if (!tbody) return;

    const lossTransfers = (state.transfers || []).filter(t => {
      const wLoss = (t.prevCarat || 0) - (t.carat || 0);
      const nLoss = (t.prevNang || 0) - (t.nang || 0);
      return wLoss > 0.009 || nLoss > 0;
    });

    if (lossTransfers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="padding:15px; color:#64748b; text-align:center;">કોઈ ઘટ લોગ મળ્યો નથી.</td></tr>`;
      return;
    }

    // Group by Kapan number
    const grouped = {};
    lossTransfers.forEach(t => {
      if (!grouped[t.kapanNo]) {
        grouped[t.kapanNo] = {
          kapanNo: t.kapanNo,
          totalCaratLoss: 0,
          totalNangLoss: 0,
          entries: []
        };
      }
      const wLoss = (t.prevCarat || 0) - (t.carat || 0);
      const nLoss = (t.prevNang || 0) - (t.nang || 0);
      grouped[t.kapanNo].totalCaratLoss += wLoss;
      grouped[t.kapanNo].totalNangLoss += nLoss;
      grouped[t.kapanNo].entries.push({
        fromDept: t.fromDept,
        toDept: t.toDept,
        wLoss,
        nLoss,
        vigat: t.vigat,
        timestamp: t.timestamp
      });
    });

    tbody.innerHTML = Object.values(grouped).map(group => {
      const pathHtml = group.entries.map(e => {
        return `<div style="font-size:12px; margin-bottom:4px; padding:6px; background:#fff5f5; border-radius:4px; border-left:3px solid var(--danger); text-align: left;">
          <b>${e.fromDept} ➔ ${e.toDept}</b>: 
          <span style="color:var(--danger); font-weight:700;">-${e.wLoss.toFixed(2)} Cts</span>, 
          <span style="color:var(--danger); font-weight:700;">-${e.nLoss} Pcs</span>
          <span style="color:#64748b; font-size:11px; margin-left:8px;">(${new Date(e.timestamp).toLocaleDateString("gu-IN")}) ${e.vigat ? `- ${e.vigat}` : ''}</span>
        </div>`;
      }).join("");

      return `
        <tr>
          <td style="font-weight:700; font-size:14.5px; vertical-align:top; text-align: left;"><b>${group.kapanNo}</b></td>
          <td style="color:var(--danger); font-weight:800; font-size:14px; vertical-align:top;">-${group.totalCaratLoss.toFixed(2)} Cts</td>
          <td style="color:var(--danger); font-weight:800; font-size:14px; vertical-align:top;">-${group.totalNangLoss} Pcs</td>
          <td style="vertical-align:top;">${pathHtml}</td>
        </tr>
      `;
    }).join("");
  }

  function completeRepair(id) {
    openReceiveRepairModal(id);
  }

  function openReceiveRepairModal(repairId) {
    const r = (state.repairs || []).find(x => x.id === repairId);
    if (!r) return;

    const modalId = document.getElementById("rrRepairId");
    const infoBadge = document.getElementById("rrInfoBadge");
    const caratVal = document.getElementById("rrCaratVal");
    const nangVal = document.getElementById("rrNangVal");
    const commentInput = document.getElementById("rrComment");

    if (modalId) modalId.value = r.id;
    if (infoBadge) infoBadge.innerText = `કાપણ: ${r.kapanNo} | મોકલેલ: ${r.carat} Cts | ${r.nang} નંગ`;
    if (caratVal) caratVal.value = r.carat;
    if (nangVal) nangVal.value = r.nang;
    if (commentInput) commentInput.value = "";

    const modal = document.getElementById("receiveRepairModal");
    if (modal) modal.style.display = "flex";
  }

  function closeReceiveRepairModal() {
    const modal = document.getElementById("receiveRepairModal");
    if (modal) modal.style.display = "none";
  }

  function submitReceiveRepair(e) {
    e.preventDefault();
    const repairId = document.getElementById("rrRepairId").value;
    const recC = parseFloat(document.getElementById("rrCaratVal").value) || 0;
    const recN = parseInt(document.getElementById("rrNangVal").value) || 0;
    const comment = document.getElementById("rrComment").value.trim();

    const r = (state.repairs || []).find(x => x.id === repairId);
    if (!r) return;

    r.status = "Completed";
    r.receivedDate = new Date().toISOString();
    r.receivedCarat = recC;
    r.receivedNang = recN;
    r.receivedComment = comment;

    const k = (state.kapans || []).find(x => x.kapanNo === r.kapanNo);
    if (k) {
      k.status = "Chalu";
      k.carat = recC;
      k.nang = recN;
      
      const newVigat = `[Repair received: ${comment}]`;
      k.vigat = k.vigat ? `${k.vigat} | ${newVigat}` : newVigat;
      k.lastMovedDate = new Date().toISOString();
    }

    saveState();
    closeReceiveRepairModal();
    renderAll();
    showToast("📥 રીપેરીંગ સફળતાપૂર્વક સ્વીકારવામાં આવ્યું!");
  }

  // STOCK MASTER RULES CONFIGURATION
  function saveMajuriRate() {
    const rate = parseFloat(document.getElementById("masterMajuriRate").value) || 65;
    state.majuriRate = rate;
    saveState();
    renderAll();
    showToast(`મજૂરી દર ગુણાંક ₹${rate} સેવ થયો!`);
  }

  let editingDeptName = null;

  function addCustomFieldInputRow(name = "", compulsory = false) {
    const container = document.getElementById("adCustomFieldsListContainer");
    if (!container) return;

    const rowId = "cfr_" + Date.now() + "_" + Math.floor(Math.random()*1000);
    const rowHtml = `
      <div id="${rowId}" style="display:flex; align-items:center; gap:8px; background:#fff; padding:6px; border:1px solid #cbd5e1; border-radius:4px;">
        <input type="text" class="custom-field-name-input" placeholder="Field Label (e.g. Hole Size)" value="${name}" style="flex:2; font-size:12.5px; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; margin:0;" required>
        <label style="flex:1; display:inline-flex; align-items:center; gap:4px; font-size:11px; margin:0; cursor:pointer; user-select:none; font-weight:700;">
          <input type="checkbox" class="custom-field-comp-input" ${compulsory ? 'checked' : ''} style="width:auto; margin:0; cursor:pointer;"> Required
        </label>
        <button type="button" class="btn btn-danger" onclick="document.getElementById('${rowId}').remove()" style="padding:2px 6px; font-size:11.5px; height:24px; display:inline-flex; align-items:center; font-weight:700; margin:0;">🗑️</button>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", rowHtml);
  }

  function openAddDeptModal(editDeptName = null) {
    editingDeptName = editDeptName;
    document.getElementById("adDeptName").value = "";
    document.getElementById("adDeptCustomHeader").value = "";
    document.getElementById("adDeptIsCompulsory").checked = true;
    document.getElementById("adDeptRate").value = "5.00";

    // Reset standard fields checkboxes to defaults
    document.getElementById("adNungShow").checked = true;
    document.getElementById("adNungComp").checked = true;
    document.getElementById("adVajanShow").checked = true;
    document.getElementById("adVajanComp").checked = true;
    document.getElementById("adLotShow").checked = false;
    document.getElementById("adLotComp").checked = false;

    // Reset custom fields container
    const cList = document.getElementById("adCustomFieldsListContainer");
    if (cList) cList.innerHTML = "";

    let receivesHtml = "";
    let sendsHtml = "";
    DEPTS.forEach(d => {
      if (d !== editDeptName) {
        receivesHtml += `
          <label style="display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; cursor:pointer; user-select:none;">
            <input type="checkbox" name="adDeptReceives" value="${d}" style="width:auto; margin:0;"> ${d}
          </label>
        `;
        sendsHtml += `
          <label style="display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; cursor:pointer; user-select:none;">
            <input type="checkbox" name="adDeptSends" value="${d}" style="width:auto; margin:0;"> ${d}
          </label>
        `;
      }
    });

    document.getElementById("adDeptReceivesContainer").innerHTML = receivesHtml || `<span style="font-size:12px; color:#64748b;">કોઈ અન્ય વિભાગ નથી</span>`;
    document.getElementById("adDeptSendsContainer").innerHTML = sendsHtml || `<span style="font-size:12px; color:#64748b;">કોઈ અન્ય વિભાગ નથી</span>`;

    if (editDeptName) {
      document.getElementById("adDeptName").value = editDeptName;
      document.getElementById("adDeptName").disabled = false;
      document.getElementById("addDeptModalTitle").innerText = `✏️ વિભાગ સુધારો (Edit Department: ${editDeptName})`;
      
      const config = (state.deptConfigs && state.deptConfigs[editDeptName]) || { receivesFrom: [], sendsTo: [], customHeader: "", isCompulsory: false, ratePerPiece: 5 };
      document.getElementById("adDeptCustomHeader").value = config.customHeader || "";
      document.getElementById("adDeptIsCompulsory").checked = config.isCompulsory !== false;
      document.getElementById("adDeptRate").value = config.ratePerPiece || 5;

      // Populate standard field configurations safely
      const fields = config.fieldsConfig || {};
      document.getElementById("adNungShow").checked = fields.nung ? fields.nung.show !== false : true;
      document.getElementById("adNungComp").checked = fields.nung ? !!fields.nung.compulsory : true;
      document.getElementById("adVajanShow").checked = fields.vajan ? fields.vajan.show !== false : true;
      document.getElementById("adVajanComp").checked = fields.vajan ? !!fields.vajan.compulsory : true;
      document.getElementById("adLotShow").checked = fields.lot ? !!fields.lot.show : false;
      document.getElementById("adLotComp").checked = fields.lot ? !!fields.lot.compulsory : false;

      // Populate custom fields list safely
      if (config.customFields && config.customFields.length > 0) {
        config.customFields.forEach(f => addCustomFieldInputRow(f.name, f.compulsory));
      } else if (config.customHeader) {
        addCustomFieldInputRow(config.customHeader, config.isCompulsory !== false);
      }

      const recChecks = document.querySelectorAll('input[name="adDeptReceives"]');
      recChecks.forEach(cb => {
        if (config.receivesFrom && config.receivesFrom.includes(cb.value)) cb.checked = true;
      });

      const sendChecks = document.querySelectorAll('input[name="adDeptSends"]');
      sendChecks.forEach(cb => {
        if (config.sendsTo && config.sendsTo.includes(cb.value)) cb.checked = true;
      });
    } else {
      document.getElementById("adDeptName").disabled = false;
      document.getElementById("addDeptModalTitle").innerText = "➕ નવો વિભાગ ઉમેરો (Add Department Master)";
    }

    document.getElementById("addDeptModal").style.display = "flex";
  }

  function closeAddDeptModal() {
    document.getElementById("addDeptModal").style.display = "none";
    editingDeptName = null;
  }

  function submitAddDepartment(e) {
    e.preventDefault();
    const name = document.getElementById("adDeptName").value.trim();
    const ratePerPiece = parseFloat(document.getElementById("adDeptRate").value) || 0;

    if (!name) {
      alert("❌ વિભાગનું નામ લખવું જરૂરી છે!");
      return;
    }

    const recChecks = document.querySelectorAll('input[name="adDeptReceives"]:checked');
    const receivesFrom = Array.from(recChecks).map(cb => cb.value);

    const sendChecks = document.querySelectorAll('input[name="adDeptSends"]:checked');
    const sendsTo = Array.from(sendChecks).map(cb => cb.value);

    const fieldsConfig = {
      nung: {
        show: document.getElementById("adNungShow").checked,
        compulsory: document.getElementById("adNungComp").checked
      },
      vajan: {
        show: document.getElementById("adVajanShow").checked,
        compulsory: document.getElementById("adVajanComp").checked
      },
      lot: {
        show: document.getElementById("adLotShow").checked,
        compulsory: document.getElementById("adLotComp").checked
      }
    };

    // Extract dynamic custom fields
    const customFieldRows = document.querySelectorAll("#adCustomFieldsListContainer > div");
    const customFields = Array.from(customFieldRows).map(row => {
      const nameInput = row.querySelector(".custom-field-name-input");
      const compInput = row.querySelector(".custom-field-comp-input");
      return {
        name: nameInput ? nameInput.value.trim() : "",
        compulsory: compInput ? compInput.checked : false
      };
    }).filter(f => f.name !== "");

    // Keep customHeader and isCompulsory for backward compatibility
    const firstField = customFields[0];
    const customHeader = firstField ? firstField.name : "";
    const isCompulsory = firstField ? firstField.compulsory : false;

    if (editingDeptName) {
      if (name !== editingDeptName) {
        if (DEPTS.includes(name)) {
          alert("❌ આ નામનો વિભાગ પહેલેથી જ અસ્તિત્વમાં છે!");
          return;
        }
        renameDepartmentMaster(DEPTS.indexOf(editingDeptName), name);
      }
      state.deptConfigs[name] = { receivesFrom, sendsTo, customHeader, isCompulsory, ratePerPiece, fieldsConfig, customFields };
      showToast(`વિભાગ '${name}' ના સેટિંગ્સ અપડેટ થયા!`);
    } else {
      if (DEPTS.includes(name)) {
        alert("❌ આ નામનો વિભાગ પહેલેથી જ અસ્તિત્વમાં છે!");
        return;
      }
      DEPTS.push(name);
      state.deptConfigs[name] = { receivesFrom, sendsTo, customHeader, isCompulsory, ratePerPiece, fieldsConfig, customFields };
      showToast(`નવો વિભાગ '${name}' ઉમેરાયો!`);
    }

    saveState();
    renderAll();
    closeAddDeptModal();
  }

  function toggleAccordion(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const isHidden = el.style.display === "none";
    el.style.display = isHidden ? "block" : "none";
    
    const chevron = document.getElementById(id.replace("dept_acc_", "dept_acc_chevron_"));
    if (chevron) {
      chevron.innerText = isHidden ? "▼" : "▶";
    }
  }

  function renderDeptMasterTable() {
    const container = document.getElementById("deptMasterAccordionContainer");
    if (!container) return;

    if (DEPTS.length === 0) {
      container.innerHTML = `<div style="text-align:center; color:#64748b; padding:15px;">કોઈ વિભાગ ઉપલબ્ધ નથી.</div>`;
      return;
    }

    container.innerHTML = DEPTS.map((dept, idx) => {
      const config = state.deptConfigs[dept] || { receivesFrom: [], sendsTo: [], customHeader: "", isCompulsory: false, ratePerPiece: 5 };
      const receivesText = config.receivesFrom && config.receivesFrom.length > 0 ? config.receivesFrom.join(", ") : "None";
      const sendsText = config.sendsTo && config.sendsTo.length > 0 ? config.sendsTo.join(", ") : "None";
      
      const fields = config.fieldsConfig || { nung: { show: true, compulsory: true }, vajan: { show: true, compulsory: true }, lot: { show: false, compulsory: false } };
      let rulesDesc = [];
      if (fields.nung?.show) rulesDesc.push(`નંગ (Pis): ${fields.nung.compulsory ? 'Compulsory' : 'Optional'}`);
      if (fields.vajan?.show) rulesDesc.push(`વજન (Carats): ${fields.vajan.compulsory ? 'Compulsory' : 'Optional'}`);
      if (fields.lot?.show) rulesDesc.push(`લોટ (Lot No): ${fields.lot.compulsory ? 'Compulsory' : 'Optional'}`);
      
      if (config.customFields && config.customFields.length > 0) {
        config.customFields.forEach(f => {
          rulesDesc.push(`${f.name}: ${f.compulsory ? 'Compulsory' : 'Optional'}`);
        });
      } else if (config.customHeader) {
        rulesDesc.push(`${config.customHeader}: ${config.isCompulsory ? 'Compulsory' : 'Optional'}`);
      }
      const rulesHtml = rulesDesc.map(r => `<li>${r}</li>`).join("");

      return `
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; background:#fff; overflow:hidden; margin-bottom:8px; box-shadow: var(--shadow-sm);">
          <!-- Accordion Header -->
          <div onclick="toggleAccordion('dept_acc_${idx}')" style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; cursor:pointer; user-select:none; border-bottom: 1px solid #e2e8f0;">
            <div style="font-weight:700; font-size:14px; color:#1e293b; display:flex; align-items:center; gap:8px;">
              <span style="background:var(--primary); color:#fff; border-radius:50%; width:20px; height:20px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">${idx + 1}</span>
              <span>${dept}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:700; font-size:12.5px; color:#16a34a; background:#dcfce7; padding:2px 8px; border-radius:12px;">₹${Number(config.ratePerPiece || 0).toFixed(2)}/Pc</span>
              <span id="dept_acc_chevron_${idx}" style="font-size:11px; color:#64748b; font-weight:700;">▶</span>
            </div>
          </div>
          
          <!-- Accordion Content -->
          <div id="dept_acc_${idx}" style="display:none; padding:14px; background:#fafafa; border-top:1px solid #e2e8f0; text-align:left;">
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:12px;">
              <div>
                <b style="color:var(--primary); font-size:12.5px; display:block; margin-bottom:4px;">📥 સ્ટોક મેળવશે (Receives From):</b>
                <div style="font-size:13px; color:#334155; background:#fff; padding:6px; border:1px solid #e2e8f0; border-radius:4px; min-height:30px; line-height:1.4;">${receivesText}</div>
              </div>
              <div>
                <b style="color:var(--primary); font-size:12.5px; display:block; margin-bottom:4px;">📤 સ્ટોક મોકલશે (Sends To):</b>
                <div style="font-size:13px; color:#334155; background:#fff; padding:6px; border:1px solid #e2e8f0; border-radius:4px; min-height:30px; line-height:1.4;">${sendsText}</div>
              </div>
            </div>
            
            <div style="margin-bottom:14px; background:#fff; padding:10px; border:1px solid #e2e8f0; border-radius:4px;">
              <b style="color:var(--primary); font-size:12.5px; display:block; margin-bottom:4px;">⚙️ કસ્ટમ નોંધણી નિયમો (Field Rules):</b>
              <ul style="font-size:13px; color:#334155; padding-left:20px; line-height:1.6; margin:0;">
                ${rulesHtml || '<li>No custom rules configured.</li>'}
              </ul>
            </div>
            
            <!-- Actions -->
            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px dashed #cbd5e1; padding-top:10px;">
              <button type="button" class="btn btn-outline" style="padding: 4px 10px; font-size:12px; font-weight:700;" onclick="moveDepartmentMaster(${idx}, -1); event.stopPropagation();" ${idx === 0 ? 'disabled' : ''}>▲ Move Up</button>
              <button type="button" class="btn btn-outline" style="padding: 4px 10px; font-size:12px; font-weight:700;" onclick="moveDepartmentMaster(${idx}, 1); event.stopPropagation();" ${idx === DEPTS.length - 1 ? 'disabled' : ''}>▼ Move Down</button>
              <button type="button" class="btn btn-primary" style="padding: 4px 10px; font-size:12px; font-weight:700;" onclick="openAddDeptModal('${dept}'); event.stopPropagation();">✏️ Edit Settings</button>
              <button type="button" class="btn btn-danger" style="padding: 4px 10px; font-size:12px; font-weight:700;" onclick="deleteDepartmentMaster(${idx}); event.stopPropagation();">🗑️ Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function deleteDepartmentMaster(index) {
    const name = DEPTS[index];
    const inUse = state.kapans.some(k => k.currentDept === name);
    
    let confirmMsg = `શું તમે ખરેખર વિભાગ '${name}' ને ડિલીટ કરવા માંગો છો?`;
    if (inUse) {
      confirmMsg = `⚠️ ચેતવણી: આ વિભાગમાં હાલમાં ચાલુ કાપણ રહેલા છે! જો તમે આ વિભાગ ડિલીટ કરશો તો તે કાપણનો વિભાગ બદલવો પડશે. શું તમે ખરેખર ડિલીટ કરવા માંગો છો?`;
    }

    if (confirm(confirmMsg)) {
      DEPTS.splice(index, 1);
      delete state.deptConfigs[name];
      saveState();
      renderAll();
      showToast(`વિભાગ '${name}' ડીલીટ થયો!`, "warning");
    }
  }

  function moveDepartmentMaster(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= DEPTS.length) return;

    const temp = DEPTS[index];
    DEPTS[index] = DEPTS[targetIndex];
    DEPTS[targetIndex] = temp;

    saveState();
    renderAll();
    showToast("વિભાગોનો ક્રમ સફળતાપૂર્વક અપડેટ થયો!");
  }

  function renameDepartmentMaster(index, newName) {
    const oldName = DEPTS[index];
    if (!newName || newName.trim() === "") {
      alert("❌ વિભાગનું નામ ખાલી ન હોઈ શકે!");
      renderAll();
      return;
    }
    newName = newName.trim();
    if (newName === oldName) return;
    
    if (DEPTS.includes(newName)) {
      alert("❌ આ નામનો વિભાગ પહેલેથી જ અસ્તિત્વમાં છે!");
      renderAll();
      return;
    }

    DEPTS[index] = newName;

    if (state.deptConfigs && state.deptConfigs[oldName]) {
      state.deptConfigs[newName] = state.deptConfigs[oldName];
      delete state.deptConfigs[oldName];
    }

    if (state.deptConfigs) {
      Object.keys(state.deptConfigs).forEach(dKey => {
        const cfg = state.deptConfigs[dKey];
        if (cfg.receivesFrom) {
          cfg.receivesFrom = cfg.receivesFrom.map(x => x === oldName ? newName : x);
        }
        if (cfg.sendsTo) {
          cfg.sendsTo = cfg.sendsTo.map(x => x === oldName ? newName : x);
        }
      });
    }

    state.kapans.forEach(k => {
      if (k.currentDept === oldName) k.currentDept = newName;
    });
    state.transfers.forEach(t => {
      if (t.fromDept === oldName) t.fromDept = newName;
      if (t.toDept === oldName) t.toDept = newName;
    });
    state.transferRules.forEach(r => {
      if (r.from === oldName) r.from = newName;
      if (r.to === oldName) r.to = newName;
    });
    state.repairs.forEach(rep => {
      if (rep.dept === oldName) rep.dept = newName;
    });

    saveState();
    renderAll();
    showToast(`વિભાગ '${oldName}' નું નામ બદલીને '${newName}' કર્યું!`);
  }

  // AUDIT LOGS
  function renderAuditTable() {
    const tbody = document.getElementById("auditTableBody");
    if (!tbody) return;
    tbody.innerHTML = (state.audits || []).map(a => `
      <tr>
        <td>${new Date(a.timestamp).toLocaleString("gu-IN")}</td>
        <td><span class="tag-badge ${a.action==='DELETE'?'tag-urgent':'tag-sample'}">${a.action}</span></td>
        <td><b>${a.target}</b></td>
        <td>${a.prevData}</td>
        <td>${a.newData}</td>
      </tr>
    `).join("");
    
    renderTransferLogTable();
  }

  function renderTransferLogTable() {
    const tbody = document.getElementById("transferLogTableBody");
    if (!tbody) return;

    if (state.transfers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="padding:15px; color:#64748b;">કોઈ ટ્રાન્સફર ટ્રાન્ઝેક્શન મળ્યું નથી.</td></tr>`;
      return;
    }

    tbody.innerHTML = (state.transfers || []).map(t => {
      return `
        <tr>
          <td>${new Date(t.timestamp).toLocaleString("gu-IN")}</td>
          <td><b>${t.kapanNo}</b></td>
          <td>${t.fromDept}</td>
          <td><span class="status-chalu">${t.toDept}</span></td>
          <td><b>${t.carat} Cts</b> ${t.prevCarat ? `<span style="font-size:11px; color:#64748b;">(હતું: ${t.prevCarat})</span>` : ''}</td>
          <td><b>${t.nang} નંગ</b> ${t.prevNang ? `<span style="font-size:11px; color:#64748b;">(હતું: ${t.prevNang})</span>` : ''}</td>
          <td>${t.vigat || "-"}</td>
          <td>
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button class="btn btn-success" style="padding:4px 8px; font-size:11px; font-weight:700;" onclick="editTransferLog('${t.id}')">✏️ Edit</button>
              <button class="btn btn-danger" style="padding:4px 8px; font-size:11px; font-weight:700;" onclick="undoTransfer('${t.id}')">🗑️ Revert</button>
              <button class="btn btn-outline" style="padding:4px 8px; font-size:11px; font-weight:700; color:var(--danger); border-color:var(--danger);" onclick="deleteTransferLog('${t.id}')">❌ Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  async function undoTransfer(transferId) {
    const t = state.transfers.find(x => x.id === transferId);
    if (!t) return;

    const pass = prompt("🔐 ટ્રાન્ઝેક્શન રીવર્ટ કરવા માટે એડિટ પાસવર્ડ (Edit Password) લખો:");
    if (pass === null) return;
    const passHash = await sha256(pass);
    if (passHash !== state.auth.editPassHash) {
      alert("❌ પાસવર્ડ ખોટો છે!");
      return;
    }

    const k = (state.kapans || []).find(x => x.kapanNo === t.kapanNo);
    if (!k) {
      alert("❌ સંબંધિત કાપણ મળ્યું નથી!");
      return;
    }

    let proceed = true;
    if (k.currentDept !== t.toDept) {
      proceed = confirm(`⚠️ ચેતવણી: કાપણ ${t.kapanNo} હાલમાં ${k.currentDept} વિભાગમાં છે (જ્યારે આ ટ્રાન્ઝેક્શન દ્વારા તેને ${t.toDept} માં મોકલવામાં આવ્યું હતું). શું તમે તેમ છતાં આ ટ્રાન્ઝેક્શન પૂર્વવત્ કરી કાપણને પાછું ${t.fromDept} વિભાગમાં મોકલવા માંગો છો?`);
    }

    if (!proceed) return;

    // Save old state for audit
    const oldDept = k.currentDept;
    const oldCarat = k.carat;
    const oldNang = k.nang;

    // Revert Kapan state
    k.currentDept = t.fromDept;
    if (t.prevCarat !== undefined) k.carat = t.prevCarat;
    if (t.prevNang !== undefined) k.nang = t.prevNang;

    // Clean vigat
    if (k.vigat && k.vigat.includes(" | ")) {
      const parts = k.vigat.split(" | ");
      parts.pop();
      k.vigat = parts.join(" | ");
    } else {
      k.vigat = "";
    }

    // Add Audit Log
    state.audits.unshift({
      id: "AUD" + Date.now(),
      timestamp: new Date().toISOString(),
      action: "UNDO_TRANSFER",
      target: t.kapanNo,
      prevData: `વિભાગ: ${oldDept}, વજન: ${oldCarat}, નંગ: ${oldNang}`,
      newData: `વિભાગ: ${k.currentDept}, વજન: ${k.carat}, નંગ: ${k.nang}`
    });

    // Remove from transfers list
    state.transfers = (state.transfers || []).filter(x => x.id !== transferId);

    saveState();
    renderAll();
    showToast(`કાપણ ${t.kapanNo} ટ્રાન્સફર સફળતાપૂર્વક પૂર્વવત્ (Undo) કરવામાં આવ્યું!`, "success");
  }

  async function editTransferLog(transferId) {
    const t = state.transfers.find(x => x.id === transferId);
    if (!t) return;

    const pass = prompt("🔐 ટ્રાન્સફર એડિટ કરવા માટે એડિટ પાસવર્ડ લખો:");
    if (pass === null) return;
    const passHash = await sha256(pass);
    if (passHash !== state.auth.editPassHash) {
      alert("❌ પાસવર્ડ ખોટો છે!");
      return;
    }

    const newCaratStr = prompt(`વજન બદલો (હતું: ${t.carat}):`, t.carat);
    if (newCaratStr === null) return;
    const newCarat = parseFloat(newCaratStr) || 0;

    const newNangStr = prompt(`નંગ બદલો (હતું: ${t.nang}):`, t.nang);
    if (newNangStr === null) return;
    const newNang = parseInt(newNangStr) || 0;

    const newVigat = prompt(`વિગત બદલો (હતી: ${t.vigat || ''}):`, t.vigat || '');
    if (newVigat === null) return;

    const oldStateStr = `Carat: ${t.carat}, Nang: ${t.nang}, Vigat: ${t.vigat}`;

    t.carat = newCarat;
    t.nang = newNang;
    t.vigat = newVigat;

    const k = (state.kapans || []).find(x => x.kapanNo === t.kapanNo);
    if (k) {
      const kapanTransfers = state.transfers
        .filter(x => x.kapanNo === k.kapanNo)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (kapanTransfers.length > 0 && kapanTransfers[0].id === t.id) {
        k.carat = newCarat;
        k.nang = newNang;
      }
    }

    state.audits.unshift({
      id: "AUD" + Date.now(),
      timestamp: new Date().toISOString(),
      action: "EDIT_TRANSFER",
      target: t.kapanNo,
      prevData: oldStateStr,
      newData: `Carat: ${newCarat}, Nang: ${newNang}, Vigat: ${newVigat}`
    });

    saveState();
    renderAll();
    showToast(`✅ ટ્રાન્સફર એન્ટ્રી અપડેટ થઈ ગઈ!`);
  }

  async function deleteTransferLog(transferId) {
    const t = state.transfers.find(x => x.id === transferId);
    if (!t) return;

    const pass = prompt("🔐 ટ્રાન્સફર લોગ ડીલીટ કરવા માટે એડિટ પાસવર્ડ લખો:");
    if (pass === null) return;
    const passHash = await sha256(pass);
    if (passHash !== state.auth.editPassHash) {
      alert("❌ પાસવર્ડ ખોટો છે!");
      return;
    }

    if (confirm(`⚠️ શું તમે ખરેખર કાપણ ${t.kapanNo} ની આ ટ્રાન્સફર એન્ટ્રી લોગ ડીલીટ કરવા માંગો છો? આનાથી કાપણની પ્રવાહ સ્થિતિ બદલાશે નહીં, ફક્ત હિસ્ટ્રી માંથી ટ્રાન્સફર રેકોર્ડ ડીલીટ થશે.`)) {
      state.transfers = (state.transfers || []).filter(x => x.id !== transferId);

      state.audits.unshift({
        id: "AUD" + Date.now(),
        timestamp: new Date().toISOString(),
        action: "DELETE_TRANSFER_LOG",
        target: t.kapanNo,
        prevData: `From: ${t.fromDept}, To: ${t.toDept}, Carat: ${t.carat}, Nang: ${t.nang}`,
        newData: "Deleted Log"
      });

      saveState();
      renderAll();
      showToast(`🗑️ ટ્રાન્સફર એન્ટ્રી ડીલીટ કરી દીધી!`);
    }
  }

  function openEditModal(id) {
    const k = (state.kapans || []).find(x => x.id === id);
    if (!k) return;

    document.getElementById("edId").value = k.id;
    document.getElementById("edCarat").value = k.carat;
    document.getElementById("edNang").value = k.nang;
    document.getElementById("edVigat").value = k.vigat || "";
    document.getElementById("edTag").value = k.tag;
    document.getElementById("edPass").value = "";
    document.getElementById("editModal").style.display = "flex";
  }

  function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
  }

  async function saveKapanEdit(e) {
    e.preventDefault();
    const pass = document.getElementById("edPass").value;
    const passHash = await sha256(pass);
    if (passHash !== state.auth.editPassHash) {
      alert("❌ એડિટ પાસવર્ડ ખોટો છે!");
      return;
    }

    const id = document.getElementById("edId").value;
    const k = (state.kapans || []).find(x => x.id === id);
    if (!k) return;

    const oldSnapshot = `Carat: ${k.carat}, Nang: ${k.nang}, Vigat: ${k.vigat}`;

    k.carat = parseFloat(document.getElementById("edCarat").value);
    k.nang = parseInt(document.getElementById("edNang").value);
    k.vigat = document.getElementById("edVigat").value.trim();
    k.tag = document.getElementById("edTag").value;

    const newSnapshot = `Carat: ${k.carat}, Nang: ${k.nang}, Vigat: ${k.vigat}`;

    state.audits.unshift({
      id: "AUD" + Date.now(),
      action: "EDIT",
      target: k.kapanNo,
      prevData: oldSnapshot,
      newData: newSnapshot,
      timestamp: new Date().toISOString()
    });

    saveState();
    closeEditModal();
    renderAll();
    showToast(`કાપણ ${k.kapanNo} અપડેટ થયું!`);
  }

  async function deleteKapanPrompt(id) {
    const pass = prompt("ડીલીટ કરવા માટે એડિટ/ડીલીટ પાસવર્ડ લખો:");
    if (pass === null) return;
    const passHash = await sha256(pass);
    if (passHash === state.auth.editPassHash) {
      const k = (state.kapans || []).find(x => x.id === id);
      if (!k) return;

      state.audits.unshift({
        id: "AUD" + Date.now(),
        action: "DELETE",
        target: k.kapanNo,
        prevData: `Carat: ${k.carat}, Dept: ${k.currentDept}`,
        newData: "ડીલીટ કર્યું",
        timestamp: new Date().toISOString()
      });

      state.kapans = (state.kapans || []).filter(x => x.id !== id);
      saveState();
      renderAll();
      showToast("કાપણ ડીલીટ થયું!", "warning");
    } else if (pass !== null) {
      alert("❌ પાસવર્ડ ખોટો છે!");
    }
  }

  // ADMIN SETTINGS
  function populateAdminSettings() {
    const admPass = document.getElementById("admAdminPass");
    if (admPass) {
      admPass.placeholder = "•••••••• (નવો એડમિન પાસવર્ડ)";
      document.getElementById("admStockPass").placeholder = "•••••••• (નવો સ્ટોક પાસવર્ડ)";
      document.getElementById("admEditPass").placeholder = "•••••••• (નવો એડિટ પાસવર્ડ)";
    }
    const autoInput = document.getElementById('autoLogoutHours');
    if (autoInput) autoInput.value = state.autoLogoutHours !== undefined ? state.autoLogoutHours : 11;
    const fbApi = document.getElementById('firebaseApiKey');
    const fbDb = document.getElementById('firebaseDbUrl');
    const fbProj = document.getElementById('firebaseProjectId');
    if (fbApi) fbApi.value = state.firebaseConfig?.apiKey || '';
    if (fbDb) fbDb.value = state.firebaseConfig?.dbUrl || '';
    if (fbProj) fbProj.value = state.firebaseConfig?.projectId || '';
  }


  function downloadBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `Diamond_Stock_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  function restoreBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        state = JSON.parse(evt.target.result);
        saveState();
        renderAll();
        showToast("બેકઅપ રીસ્ટોર સફળ!");
      } catch(err) {
        alert("❌ ખોટી બેકઅપ ફાઇલ!");
      }
    };
    reader.readAsText(file);
  }

  function resetAllData() {
    if (confirm("⚠️ શું તમે ખરેખર તમામ સ્ટોક અને હિસ્ટ્રી રીસેટ કરવા માંગો છો?")) {
      safeStorage.removeItem("diamond_stock_state_v7");
      state = {
        auth: {
          adminPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
          stockPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
          editPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
        },
        majuriRate: 65,
        roughLots: [], kapans: [], transfers: [], repairs: [], audits: [], polishCharts: [], transferRules: [],
        depts: [...DEPTS], deptConfigs: {}, autoLogoutHours: 11, firebaseConfig: { apiKey: "AIzaSyDvu7pJMXatKNHFAuJMtsh_zpmb8Jr0BCM", dbUrl: "https://ng-cost-default-rtdb.firebaseio.com", projectId: "ng-cost" }, firebaseWiped: false
      };
      if (dbRef) dbRef.set(state).catch(e => console.error('Reset sync failed:', e));
      checkInitialData();
      renderAll();
      showToast("સિસ્ટમ ડેટા રીસેટ થયો!", "warning");
    }
  }

  async function wipeAllDataSecurely() {
    const pass = prompt("⚠️ ચેતવણી: તમામ ડેટા કાયમ માટે સાફ થઈ જશે!\nવાઇપ કરવા માટે એડિટ/ડીલીટ પાસવર્ડ એન્ટર કરો:");
    if (pass === null) return;
    const passHash = await sha256(pass);
    if (passHash === state.auth.editPassHash) {
      safeStorage.removeItem("diamond_stock_state_v7");
      state = {
        auth: {
          adminPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
          stockPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
          editPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
        },
        majuriRate: 65,
        roughLots: [], kapans: [], transfers: [], repairs: [], audits: [], polishCharts: [], transferRules: [],
        depts: [...DEPTS], deptConfigs: {}, autoLogoutHours: 11, firebaseConfig: { apiKey: "AIzaSyDvu7pJMXatKNHFAuJMtsh_zpmb8Jr0BCM", dbUrl: "https://ng-cost-default-rtdb.firebaseio.com", projectId: "ng-cost" }, firebaseWiped: false
      };
      if (dbRef) dbRef.set(state).catch(e => console.error('Reset sync failed:', e));
      checkInitialData();
      renderAll();
      showToast("તમામ ડેટા સફળતાપૂર્વક સાફ કરવામાં આવ્યો છે (Wiped)!", "danger");
    } else {
      alert("❌ પાસવર્ડ ખોટો છે!");
    }
  }

  function getTimeDuration(dateStr) {
    if (!dateStr) return "0 દિવસ";
    const diff = Math.max(0, new Date() - new Date(dateStr));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return days > 0 ? `${days} દિવસ ${remHours} કલાક` : `${remHours} કલાક`;
  }

  function exportTableToExcel(tableId, filename = 'export.csv') {
    const table = document.getElementById(tableId);
    let csv = [];
    for (let i = 0; i < table.rows.length; i++) {
      let row = [], cols = table.rows[i].querySelectorAll("td, th");
      for (let j = 0; j < cols.length; j++) {
        let text = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/"/g, '""');
        row.push('"' + text + '"');
      }
      csv.push(row.join(","));
    }
    const csvFile = new Blob(["\ufeff" + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }

  // ----- Backup & Restore Helper Functions -----
  async function unlockBackupSettings() {
    const gatePass = document.getElementById('backupGatePass').value.trim();
    if (gatePass === '') {
      alert('⚠️ પાસવર્ડ ખાલી હોવો ન જોઈએ!');
      return;
    }
    const gatePassHash = await sha256(gatePass);
    if (gatePassHash === state.auth.adminPassHash) {
      document.getElementById('backupGateArea').style.display = 'none';
      document.getElementById('backupMainArea').style.display = 'block';
    } else {
      alert('❌ એડમિન પાસવર્ડ ખોટો છે!');
    }
  }

  function lockBackupSettings() {
    document.getElementById('backupMainArea').style.display = 'none';
    document.getElementById('backupGateArea').style.display = 'block';
    document.getElementById('backupGatePass').value = '';
  }

  function saveAutoLogoutHours(hours) {
    const hrs = parseFloat(hours);
    if (isNaN(hrs) || hrs < 0) {
      alert('⚠️ અમાન્ય કલાકો');
      return;
    }
    state.autoLogoutHours = hrs;
    saveState();
    showToast('ઓટો લોગઆઉટ સમય અપડેટ થઈ ગયો', 'info');
    initAutoLogoutTimer();
  }

  function saveFirebaseConfig() {
    const apiKey = document.getElementById('firebaseApiKey').value.trim();
    const dbUrl = document.getElementById('firebaseDbUrl').value.trim();
    const projectId = document.getElementById('firebaseProjectId').value.trim();
    state.firebaseConfig = { apiKey, dbUrl, projectId };
    saveState();
    showToast('Firebase કન્ફિગરેશન સંગ્રહિત થઈ', 'success');
  }

  let autoLogoutTimer = null;
  function initAutoLogoutTimer() {
    if (autoLogoutTimer) clearTimeout(autoLogoutTimer);
    const hrs = state.autoLogoutHours;
    if (!hrs || hrs <= 0) return;
    const ms = hrs * 60 * 60 * 1000;
    autoLogoutTimer = setTimeout(() => {
      alert('⏰ ઓટો લોગઆઉટ: સમય સમાપ્ત થયો');
      const lp = document.getElementById('loginPage');
      const ai = document.getElementById('appInterface');
      if (lp) lp.style.display = 'flex';
      if (ai) ai.style.display = 'none';
    }, ms);
  }

  // GLOBAL KEYBOARD SHORTCUTS FOR MODALS AND EASY ACTION
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      if (typeof closeAddKapanModal === "function") closeAddKapanModal();
      if (typeof closeQuickTransferModal === "function") closeQuickTransferModal();
      if (typeof closeBatchTransferModal === "function") closeBatchTransferModal();
      if (typeof closeReceiveRepairModal === "function") closeReceiveRepairModal();
      if (typeof closeChartViewModal === "function") closeChartViewModal();
      if (typeof closeAddDeptModal === "function") closeAddDeptModal();
      if (typeof closeEditModal === "function") closeEditModal();
    }

    // 2. Ctrl + S (or Cmd + S) to save/submit active form
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      // Find open modal and check if it has a form
      const openModal = document.querySelector(".modal[style*='display: flex'], .modal[style*='display: block'], div[style*='display: flex'][id*='Modal'], div[style*='display: block'][id*='Modal']");
      if (openModal) {
        const submitBtn = openModal.querySelector("button[type='submit'], button.btn-success, button.btn-primary");
        if (submitBtn) {
          submitBtn.click();
        }
      } else {
        // If on Polish Chart page, trigger savePolishChart
        const pcPage = document.getElementById("pg_polish_chart");
        if (pcPage && pcPage.classList.contains("show")) {
          const formCard = document.getElementById("polishChartFormCard");
          if (formCard) {
            const submitBtn = formCard.querySelector("button[type='submit']") || formCard.querySelector("button");
            if (submitBtn) submitBtn.click();
          }
        }
      }
    }
  });

  // ENTER KEY FOCUS NAVIGATION
  document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "SELECT" || active.tagName === "TEXTAREA")) {
        if (active.type === "submit" || active.tagName === "BUTTON") return;
        
        e.preventDefault();
        
        const container = active.form || active.closest(".box") || active.closest(".photo1-paper-container") || document.body;
        const focusable = Array.from(container.querySelectorAll("input:not([disabled]):not([readonly]):not([type=hidden]), select:not([disabled]), textarea:not([disabled])"))
          .filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
          
        const index = focusable.indexOf(active);
        if (index > -1 && index < focusable.length - 1) {
          const next = focusable[index + 1];
          next.focus();
          if (next.tagName === "INPUT" && typeof next.select === "function") {
            next.select();
          }
        } else {
          // If last element, find and click submit button
          const submitBtn = container.querySelector("button[type=submit]");
          if (submitBtn) {
            submitBtn.click();
          }
        }
      }
    }
  });

  // ================= OFFLINE LOCAL FOLDER BACKUP & RESTORE UTILITY =================
  const DB_NAME = "SMS_Backup_DB";
  const STORE_NAME = "backup_handles";

  function openBackupDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async function getStoredBackupHandle() {
    try {
      const db = await openBackupDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get("dir_handle");
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("IndexedDB error:", err);
      return null;
    }
  }

  async function storeBackupHandle(handle) {
    try {
      const db = await openBackupDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(handle, "dir_handle");
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("IndexedDB store error:", err);
    }
  }

  async function clearStoredBackupHandle() {
    try {
      const db = await openBackupDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete("dir_handle");
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("IndexedDB delete error:", err);
    }
  }

  async function renderLocalBackupControls(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!state.offlineBackupConfig) {
      state.offlineBackupConfig = {
        intervalDays: 1,
        lastBackupTime: new Date().toISOString(),
        folderSelected: false,
        folderName: ""
      };
    }

    const config = state.offlineBackupConfig;
    const handle = await getStoredBackupHandle();
    
    let accessStatusHtml = "";
    let actionButtonsHtml = "";
    
    if (!handle) {
      accessStatusHtml = `<span style="color:#64748b; font-weight:700;">⚪ ફોલ્ડર જોડાયેલ નથી (No folder selected)</span>`;
      actionButtonsHtml = `
        <button type="button" class="btn btn-purple" onclick="connectBackupFolder('${containerId}')" style="font-weight:700;">📁 બેકઅપ ફોલ્ડર પસંદ કરો (Select Folder)</button>
      `;
    } else {
      let isGranted = false;
      try {
        isGranted = (await handle.queryPermission({ mode: "readwrite" })) === "granted";
      } catch (e) {
        console.error("Permission check failed", e);
      }

      if (isGranted) {
        accessStatusHtml = `<span style="color:#166534; font-weight:700;">🟢 જોડાણ સક્રિય છે (Authorized): <b>${handle.name}</b></span>`;
        actionButtonsHtml = `
          <button type="button" class="btn btn-success" onclick="triggerManualOfflineBackup('${containerId}')" style="font-weight:700; margin-right:8px;">💾 બેકઅપ લો (Run Backup)</button>
          <button type="button" class="btn btn-primary" onclick="connectBackupFolder('${containerId}')" style="font-weight:700; margin-right:8px;">🔄 ફોલ્ડર બદલો (Change Folder)</button>
          <button type="button" class="btn btn-outline" onclick="disconnectBackupFolder('${containerId}')" style="color:#dc2626; border-color:#fca5a5; font-weight:700;">❌ જોડાણ કાઢો</button>
        `;
      } else {
        accessStatusHtml = `<span style="color:#b45309; font-weight:700;">⚠️ એક્સેસ મંજૂર કરવાની જરૂર છે: <b>${handle.name}</b></span>`;
        actionButtonsHtml = `
          <button type="button" class="btn btn-danger" onclick="authorizeBackupFolder('${containerId}')" style="font-weight:700; margin-right:8px;">🔓 એક્સેસ મંજૂર કરો (Authorize)</button>
          <button type="button" class="btn btn-outline" onclick="disconnectBackupFolder('${containerId}')" style="color:#dc2626; border-color:#fca5a5; font-weight:700;">❌ જોડાણ કાઢો</button>
        `;
      }
    }

    const lastBackupStr = config.lastBackupTime ? new Date(config.lastBackupTime).toLocaleString() : "ક્યારેય નહીં (Never)";

    container.innerHTML = `
      <div class="sticker-card" style="cursor:default; border-left: 4px solid var(--accent); padding:15px; background:#faf5ff; border-radius:8px;">
        <div style="font-weight:800; font-size:15px; color:#6b21a8; display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <span>💾</span> ઑફલાઇન સ્થાનિક બેકઅપ સેટિંગ્સ (Offline Local Backup)
        </div>
        <div style="font-size:12.5px; color:#475569; line-height:1.5; margin-bottom:15px;">
          તમારો બધો ડેટા તમારા જ કોમ્પ્યુટરમાં સુરક્ષિત રાખવા માટે સ્થાનિક ફોલ્ડર જોડો. દરરોજ ઓટો-બેકઅપ થતું રહેશે.
        </div>
        
        <div style="display:flex; flex-direction:column; gap:10px; font-size:13.5px; font-weight:600; margin-bottom:15px; background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:6px;">
          <div>સ્થિતિ (Status): ${accessStatusHtml}</div>
          <div>છેલ્લું બેકઅપ (Last Backup): <span style="color:#1e3a8a;">${lastBackupStr}</span></div>
        </div>

        <div style="margin-bottom:15px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:6px;">
          <label style="margin:0; font-size:13.5px; font-weight:700;">ઓટો-બેકઅપ રીમાઇન્ડર સમય (Interval):</label>
          <select id="${containerId}_interval" onchange="changeOfflineBackupInterval('${containerId}', this.value)" style="padding:6px 10px; font-size:13px; font-weight:700; border-radius:6px; border:1.5px solid #cbd5e1; width:220px;">
            <option value="1" ${config.intervalDays == 1 ? "selected" : ""}>દરરોજ (Every 1 Day - Default)</option>
            <option value="2" ${config.intervalDays == 2 ? "selected" : ""}>દર ૨ દિવસે (Every 2 Days)</option>
            <option value="3" ${config.intervalDays == 3 ? "selected" : ""}>દર ૩ દિવસે (Every 3 Days)</option>
            <option value="7" ${config.intervalDays == 7 ? "selected" : ""}>દર અઠવાડિયે (Every 7 Days)</option>
            <option value="0" ${config.intervalDays == 0 ? "selected" : ""}>ઓટો-બેકઅપ બંધ કરો (Disable)</option>
          </select>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
          ${actionButtonsHtml}
        </div>
      </div>
    `;
  }

  async function connectBackupFolder(containerId) {
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      await storeBackupHandle(handle);
      
      state.offlineBackupConfig.folderSelected = true;
      state.offlineBackupConfig.folderName = handle.name;
      saveState();
      
      showToast("📂 બેકઅપ ફોલ્ડર સફળતાપૂર્વક જોડાયું!");
      
      // Perform initial backup
      await runOfflineBackup();
      
      renderAll();
    } catch (err) {
      console.error(err);
      if (err.name !== "AbortError") {
        alert("❌ ફોલ્ડર પસંદ કરવામાં ભૂલ આવી!");
      }
    }
  }

  async function authorizeBackupFolder(containerId) {
    const handle = await getStoredBackupHandle();
    if (!handle) return;
    try {
      const status = await handle.requestPermission({ mode: "readwrite" });
      if (status === "granted") {
        showToast("🔓 ફોલ્ડર એક્સેસ મંજૂર થઈ ગયું!", "success");
        await runOfflineBackup();
        renderAll();
      } else {
        showToast("❌ એક્સેસ નામંજૂર થયો!", "warning");
      }
    } catch (err) {
      console.error(err);
      alert("❌ એક્સેસ વેરિફિકેશનમાં કોઈ ભૂલ આવી!");
    }
  }

  async function disconnectBackupFolder(containerId) {
    if (confirm("❓ શું તમે ખરેખર બેકઅપ ફોલ્ડર જોડાણ દૂર કરવા માંગો છો?")) {
      await clearStoredBackupHandle();
      state.offlineBackupConfig.folderSelected = false;
      state.offlineBackupConfig.folderName = "";
      saveState();
      showToast("📂 ફોલ્ડર કનેક્શન દૂર થઈ ગયું!", "warning");
      renderAll();
    }
  }

  async function triggerManualOfflineBackup(containerId) {
    showToast("💾 બેકઅપ પ્રોસેસ ચાલુ થઈ રહી છે...");
    const success = await runOfflineBackup();
    if (success) {
      showToast("💾 સ્થાનિક બેકઅપ સફળતાપૂર્વક લેવાઈ ગયું!");
    } else {
      showToast("❌ બેકઅપ લેવામાં કોઈ સમસ્યા આવી. એક્સેસ તપાસો!", "danger");
    }
    renderAll();
  }

  function changeOfflineBackupInterval(containerId, value) {
    state.offlineBackupConfig.intervalDays = parseInt(value);
    saveState();
    showToast("💾 સેટિંગ્સ સફળતાપૂર્વક બદલાઈ ગઈ!");
    renderAll();
  }

  async function runOfflineBackup(isAuto = false) {
    const handle = await getStoredBackupHandle();
    if (!handle) return false;

    try {
      const status = await handle.queryPermission({ mode: "readwrite" });
      if (status !== "granted") {
        if (isAuto) return false;
        const req = await handle.requestPermission({ mode: "readwrite" });
        if (req !== "granted") return false;
      }

      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const monthStr = dateStr.slice(0, 7); // YYYY-MM
      const weekStr = now.getFullYear() + "-W" + getWeekNumber(now);

      const backupData = JSON.parse(JSON.stringify(state));

      // 1. Monthly Backup
      const monthlyDir = await handle.getDirectoryHandle(`monthly_backup_${monthStr}`, { create: true });
      const monthlyFile = await monthlyDir.getFileHandle("state_backup.json", { create: true });
      await writeDataToFileHandle(monthlyFile, backupData);

      // 2. Weekly Backup
      const weeklyDir = await handle.getDirectoryHandle(`weekly_backup_${weekStr}`, { create: true });
      const weeklyFile = await weeklyDir.getFileHandle("state_backup.json", { create: true });
      await writeDataToFileHandle(weeklyFile, backupData);

      // 3. Daily Backup
      const dailyDir = await handle.getDirectoryHandle(`daily_backup_${dateStr}`, { create: true });
      const dailyFile = await dailyDir.getFileHandle("state_backup.json", { create: true });
      await writeDataToFileHandle(dailyFile, backupData);

      state.offlineBackupConfig.lastBackupTime = now.toISOString();
      saveState();
      return true;
    } catch (err) {
      console.error("Backup failed", err);
      return false;
    }
  }

  async function writeDataToFileHandle(fileHandle, dataObj) {
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(dataObj, null, 2));
    await writable.close();
  }

  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  async function checkBackupReminder() {
    const banner = document.getElementById("backupReminderBanner");
    if (!banner) return;

    if (!currentUser) {
      banner.style.display = "none";
      return;
    }

    if (!state.offlineBackupConfig) {
      state.offlineBackupConfig = {
        intervalDays: 1,
        lastBackupTime: new Date().toISOString(),
        folderSelected: false,
        folderName: ""
      };
    }

    const config = state.offlineBackupConfig;
    if (config.intervalDays === 0) {
      banner.style.display = "none";
      return;
    }

    const lastBackup = new Date(config.lastBackupTime).getTime();
    const intervalMs = config.intervalDays * 24 * 60 * 60 * 1000;
    const diffMs = Date.now() - lastBackup;

    if (diffMs > intervalMs) {
      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      document.getElementById("backupDaysOverdue").innerText = days;
      banner.style.display = "block";
      
      const handle = await getStoredBackupHandle();
      if (handle) {
        const isGranted = (await handle.queryPermission({ mode: "readwrite" })) === "granted";
        if (isGranted) {
          const success = await runOfflineBackup(true);
          if (success) {
            banner.style.display = "none";
            showToast("📂 ઓટો-બેકઅપ આપમેળે સફળતાપૂર્વક પૂર્ણ થયું!", "success");
            renderAll();
          }
        }
      }
    } else {
      banner.style.display = "none";
    }
  }

  async function triggerManualBackupFromBanner() {
    const handle = await getStoredBackupHandle();
    if (!handle) {
      if (currentRole === "Admin") {
        switchPage('admin');
      } else {
        switchPage('stock_masters');
      }
      showToast("📂 મહેરબાની કરીને બેકઅપ ફોલ્ડર પસંદ કરો!", "warning");
    } else {
      const success = await runOfflineBackup();
      if (success) {
        showToast("💾 બેકઅપ સફળતાપૂર્વક પૂર્ણ થયું!");
        document.getElementById("backupReminderBanner").style.display = "none";
        renderAll();
      } else {
        authorizeBackupFolder("");
      }
    }
  }

  // PASSWORD MANAGEMENT & VISIBILITY FUNCTIONS
  function togglePassInput(id) {
    const input = document.getElementById(id);
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
    }
  }

  function openChangePasswordModal(role) {
    const roleInput = document.getElementById("cpRole");
    if (roleInput) roleInput.value = role;

    const titleEl = document.getElementById("cpModalTitle");
    const newPassLabelEl = document.getElementById("cpNewPassLabel");

    if (role === 'admin') {
      if (titleEl) titleEl.innerHTML = "🔑 એડમિન પાસવર્ડ બદલો (Change Admin Password)";
      if (newPassLabelEl) newPassLabelEl.innerHTML = "નવો એડમિન પાસવર્ડ (New Admin Password) <span class=\"req-star\">*</span>";
    } else if (role === 'stock') {
      if (titleEl) titleEl.innerHTML = "🔑 સ્ટોક પાસવર્ડ બદલો (Change Stock Password)";
      if (newPassLabelEl) newPassLabelEl.innerHTML = "નવો સ્ટોક પાસવર્ડ (New Stock Password) <span class=\"req-star\">*</span>";
    } else if (role === 'edit') {
      if (titleEl) titleEl.innerHTML = "🔑 એડિટ પાસવર્ડ બદલો (Change Edit Password)";
      if (newPassLabelEl) newPassLabelEl.innerHTML = "નવો એડિટ પાસવર્ડ (New Edit Password) <span class=\"req-star\">*</span>";
    }

    const currentAdminPassInput = document.getElementById("cpCurrentAdminPass");
    const newPassInput = document.getElementById("cpNewPass");
    if (currentAdminPassInput) currentAdminPassInput.value = "";
    if (newPassInput) newPassInput.value = "";

    const modal = document.getElementById("changePasswordModal");
    if (modal) modal.style.display = "flex";
  }

  function closeChangePasswordModal() {
    const modal = document.getElementById("changePasswordModal");
    if (modal) modal.style.display = "none";
  }

  async function submitChangePassword(e) {
    e.preventDefault();
    const role = document.getElementById("cpRole").value;
    const currentAdminPass = document.getElementById("cpCurrentAdminPass").value.trim();
    const newPass = document.getElementById("cpNewPass").value.trim();

    const currentAdminPassHash = await sha256(currentAdminPass);
    if (currentAdminPassHash !== state.auth.adminPassHash) {
      alert("❌ વર્તમાન એડમિન પાસવર્ડ ખોટો છે!");
      return;
    }

    const newPassHash = await sha256(newPass);
    if (!state.auth) {
      state.auth = {};
    }

    if (role === 'admin') {
      state.auth.adminPassHash = newPassHash;
    } else if (role === 'stock') {
      state.auth.stockPassHash = newPassHash;
    } else if (role === 'edit') {
      state.auth.editPassHash = newPassHash;
    }

    saveState();
    closeChangePasswordModal();
    showToast("🔓 પાસવર્ડ સફળતાપૂર્વક અપડેટ થઈ ગયો!", "success");
    renderAll();
  }

  // WIPE DATA MODAL FUNCTIONS
  function openWipeDataModal() {
    const modal = document.getElementById("wipeDataModal");
    if (modal) modal.style.display = "flex";
    const passInput = document.getElementById("wdPassword");
    if (passInput) passInput.value = "";
  }

  function closeWipeDataModal() {
    const modal = document.getElementById("wipeDataModal");
    if (modal) modal.style.display = "none";
  }

  async function submitWipeData(e) {
    e.preventDefault();
    const timeframe = document.getElementById("wdTimeframe").value;
    const pass = document.getElementById("wdPassword").value;
    const passHash = await sha256(pass);
    if (passHash !== state.auth.editPassHash) {
      alert("❌ એડિટ/ડીલીટ પાસવર્ડ ખોટો છે!");
      return;
    }

    if (timeframe === "all") {
      if (confirm("⚠️ શું તમે ખરેખર તમામ ડેટા અને સેટીંગ્સ સાફ કરવા માંગો છો? આ ફેક્ટરી રીસેટ છે અને તે પાછી ખેંચી શકાશે નહીં.")) {
        safeStorage.removeItem("diamond_stock_state_v7");
        state = {
          auth: {
            adminPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
            stockPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
            editPassHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
          },
          majuriRate: 65,
          roughLots: [], kapans: [], transfers: [], repairs: [], audits: [], polishCharts: [], transferRules: [],
          depts: [...DEPTS], deptConfigs: {}, autoLogoutHours: 11, firebaseConfig: { apiKey: "AIzaSyDvu7pJMXatKNHFAuJMtsh_zpmb8Jr0BCM", dbUrl: "https://ng-cost-default-rtdb.firebaseio.com", projectId: "ng-cost" }, firebaseWiped: false
        };
        if (dbRef) dbRef.set(state).catch(e => console.error('Reset sync failed:', e));
        checkInitialData();
        renderAll();
        showToast("તમામ ડેટા અને સેટીંગ્સ સાફ કરવામાં આવ્યા છે!", "danger");
        closeWipeDataModal();
      }
      return;
    }

    let cutoffMs = 0;
    const now = Date.now();
    if (timeframe === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      cutoffMs = todayStart.getTime();
    } else if (timeframe === "24h") {
      cutoffMs = now - (24 * 60 * 60 * 1000);
    } else if (timeframe === "3d") {
      cutoffMs = now - (3 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "1w") {
      cutoffMs = now - (7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "1m") {
      cutoffMs = now - (30 * 24 * 60 * 60 * 1000);
    }

    if (confirm(`⚠️ શું તમે ખરેખર પસંદ કરેલા સમયગાળાનો તમામ ડેટા સાફ કરવા માંગો છો? આ ક્રિયા પાછી ખેંચી શકાશે નહીં.`)) {
      const shouldWipe = (timestampOrId) => {
        if (!timestampOrId) return false;
        let ms = 0;
        if (typeof timestampOrId === "number") {
          ms = timestampOrId;
        } else if (typeof timestampOrId === "string") {
          const match = timestampOrId.match(/^(?:R|K|T|REP|PC|AUD)?(\d+)$/);
          if (match) {
            ms = parseInt(match[1]);
          } else {
            ms = Date.parse(timestampOrId);
          }
        }
        return ms >= cutoffMs;
      };

      state.kapans = (state.kapans || []).filter(k => !shouldWipe(k.createdDate) && !shouldWipe(k.id));
      state.roughLots = (state.roughLots || []).filter(r => !shouldWipe(r.date) && !shouldWipe(r.id));
      state.transfers = (state.transfers || []).filter(t => !shouldWipe(t.timestamp) && !shouldWipe(t.id));
      state.repairs = (state.repairs || []).filter(r => !shouldWipe(r.sentDate) && !shouldWipe(r.id));
      state.audits = (state.audits || []).filter(a => !shouldWipe(a.timestamp) && !shouldWipe(a.id));
      state.polishCharts = (state.polishCharts || []).filter(p => !shouldWipe(p.date) && !shouldWipe(p.id));

      saveState();
      renderAll();
      showToast("ડેટા સફળતાપૂર્વક સાફ કરવામાં આવ્યો છે!", "warning");
      closeWipeDataModal();
    }
  }

  // ================= REPORTS SECTION =================
  function renderReportsPage() {
    const roughSelect = document.getElementById("repRoughSelect");
    const deptSelect = document.getElementById("repDeptSelect");
    if (!roughSelect || !deptSelect) return;

    if (roughSelect.options.length <= 1) {
      const uniqueRoughs = [...new Set((state.kapans || []).map(k => {
        const rough = (state.roughLots || []).find(r => r.id === k.roughId);
        return rough ? rough.name : k.roughName;
      }).filter(Boolean))];
      
      roughSelect.innerHTML = `<option value="">— બધા રફ (All Roughs) —</option>` + 
        uniqueRoughs.map(r => `<option value="${r}">${r}</option>`).join("");
    }

    if (deptSelect.options.length <= 1) {
      deptSelect.innerHTML = `<option value="">— બધા વિભાગ (All Depts) —</option>` + 
        DEPTS.map(d => `<option value="${d}">${d}</option>`).join("");
    }

    runReport();
  }

  function runReport() {
    const searchInput = document.getElementById("repKapanSearch");
    if (!searchInput) return;

    const searchVal = searchInput.value.toLowerCase().trim();
    const roughVal = document.getElementById("repRoughSelect").value;
    const deptVal = document.getElementById("repDeptSelect").value;
    const fromDateVal = document.getElementById("repFromDate").value;
    const toDateVal = document.getElementById("repToDate").value;
    const sortVal = document.getElementById("repSortSelect").value;
    const overdueCheck = document.getElementById("repOverdueCheck").checked;
    const yieldAlertCheck = document.getElementById("repYieldAlertCheck").checked;

    let filtered = (state.kapans || []).slice();

    if (searchVal) {
      filtered = filtered.filter(k => k.kapanNo.toLowerCase().includes(searchVal));
    }

    if (roughVal) {
      filtered = filtered.filter(k => {
        const rough = (state.roughLots || []).find(r => r.id === k.roughId);
        const name = rough ? rough.name : k.roughName;
        return name === roughVal;
      });
    }

    if (deptVal) {
      filtered = filtered.filter(k => k.currentDept === deptVal);
    }

    if (fromDateVal) {
      const fromTime = new Date(fromDateVal + "T00:00:00").getTime();
      filtered = filtered.filter(k => new Date(k.createdDate).getTime() >= fromTime);
    }
    if (toDateVal) {
      const toTime = new Date(toDateVal + "T23:59:59").getTime();
      filtered = filtered.filter(k => new Date(k.createdDate).getTime() <= toTime);
    }

    const calculatedKapans = filtered.map(k => {
      const dDays = getDeptDaysForPolishChart(k.kapanNo);
      
      const isOverdue = parseFloat(dDays.galaxy) > 3 || 
                        parseFloat(dDays.assort) > 3 || 
                        parseFloat(dDays.fourP) > 3 || 
                        parseFloat(dDays.rt) > 3 || 
                        parseFloat(dDays.khata) > 3;

      const chart = (state.polishCharts || []).find(pc => pc.kapanNo === k.kapanNo && pc.status === "Approved");
      const r2pPct = chart ? parseFloat(chart.rToPolishPct) : 0;
      const expPct = k.expPct || 0;
      const varPct = chart ? parseFloat(chart.varPct) : (r2pPct > 0 ? (r2pPct - expPct) : 0);

      const polishWt = chart ? parseFloat(chart.weightPolish || k.polishWeight || 0) : 0;
      const polishPcs = chart ? parseInt(chart.pcsPolish || k.polishPcs || 0) : 0;
      const padtar = chart ? parseFloat(chart.padtar || 0) : 0;

      return {
        k,
        dDays,
        isOverdue,
        r2pPct,
        varPct,
        polishWt,
        polishPcs,
        padtar
      };
    });

    let finalKapans = calculatedKapans;
    if (overdueCheck) {
      finalKapans = finalKapans.filter(item => item.isOverdue);
    }

    if (yieldAlertCheck) {
      finalKapans = finalKapans.filter(item => item.varPct < -2);
    }

    finalKapans.sort((a, b) => {
      if (sortVal === "created_desc") {
        return new Date(b.k.createdDate).getTime() - new Date(a.k.createdDate).getTime();
      } else if (sortVal === "created_asc") {
        return new Date(a.k.createdDate).getTime() - new Date(b.k.createdDate).getTime();
      } else if (sortVal === "total_days_desc") {
        return parseFloat(b.dDays.total) - parseFloat(a.dDays.total);
      } else if (sortVal === "total_days_asc") {
        return parseFloat(a.dDays.total) - parseFloat(b.dDays.total);
      } else if (sortVal === "kapan_asc") {
        return a.k.kapanNo.localeCompare(b.k.kapanNo);
      } else if (sortVal === "var_desc") {
        return a.varPct - b.varPct;
      } else if (sortVal === "var_asc") {
        return b.varPct - a.varPct;
      }
      return 0;
    });

    const tbody = document.getElementById("reportTableBody");
    const tfoot = document.getElementById("reportTableFooter");
    if (!tbody || !tfoot) return;

    if (finalKapans.length === 0) {
      tbody.innerHTML = `<tr><td colspan="17" style="padding:20px; font-weight:700; color:#64748b;">કોઈ ડેટા મળ્યો નથી (No matching records)</td></tr>`;
      tfoot.innerHTML = "";
      return;
    }

    let totalRoughPcs = 0;
    let totalRoughWt = 0;
    let totalLots = 0;
    let totalPolishWt = 0;
    let totalPolishPcs = 0;
    
    let sumGalaxyDays = 0;
    let sumAssortDays = 0;
    let sumFourPDays = 0;
    let sumRtDays = 0;
    let sumKhataDays = 0;
    let sumTotalDays = 0;

    let sumYield = 0;
    let sumVar = 0;
    let countYield = 0;

    tbody.innerHTML = finalKapans.map(item => {
      const k = item.k;
      const dDays = item.dDays;
      
      const rPcs = parseInt(k.nang || 0);
      const rWt = parseFloat(k.roughWeight || k.carat || 0);
      const lts = parseInt(k.lots || 1);

      totalRoughPcs += rPcs;
      totalRoughWt += rWt;
      totalLots += lts;
      totalPolishWt += item.polishWt;
      totalPolishPcs += item.polishPcs;
      
      sumGalaxyDays += parseFloat(dDays.galaxy || 0);
      sumAssortDays += parseFloat(dDays.assort || 0);
      sumFourPDays += parseFloat(dDays.fourP || 0);
      sumRtDays += parseFloat(dDays.rt || 0);
      sumKhataDays += parseFloat(dDays.khata || 0);
      sumTotalDays += parseFloat(dDays.total || 0);

      if (item.r2pPct > 0) {
        sumYield += item.r2pPct;
        sumVar += item.varPct;
        countYield++;
      }

      const rough = (state.roughLots || []).find(r => r.id === k.roughId);
      const roughName = rough ? rough.name : k.roughName;

      const highlightOverdue = (dStr) => {
        const d = parseFloat(dStr);
        return d > 3 ? `style="color:#dc2626; font-weight:700; background:#fef2f2;"` : '';
      };

      return `
        <tr>
          <td style="font-weight:700;">${k.kapanNo}</td>
          <td>${roughName || "-"}</td>
          <td>${rPcs}</td>
          <td>${rWt.toFixed(2)}</td>
          <td style="font-weight:600;">${lts}</td>
          <td ${highlightOverdue(dDays.galaxy)}>${dDays.galaxy}</td>
          <td ${highlightOverdue(dDays.assort)}>${dDays.assort}</td>
          <td ${highlightOverdue(dDays.fourP)}>${dDays.fourP}</td>
          <td ${highlightOverdue(dDays.rt)}>${dDays.rt}</td>
          <td ${highlightOverdue(dDays.khata)}>${dDays.khata}</td>
          <td style="font-weight:700; background:#fef9c3;">${dDays.total}</td>
          <td><span class="badge badge-purple">${k.currentDept}</span></td>
          <td>${item.r2pPct > 0 ? item.r2pPct.toFixed(2) + "%" : "-"}</td>
          <td style="font-weight:600; color:${item.varPct < 0 ? '#dc2626' : (item.varPct > 0 ? '#16a34a' : 'inherit')}">${item.varPct !== 0 ? (item.varPct > 0 ? "+" : "") + item.varPct.toFixed(2) + "%" : "-"}</td>
          <td>${item.polishWt > 0 ? item.polishWt.toFixed(2) : "-"}</td>
          <td>${item.polishPcs > 0 ? item.polishPcs : "-"}</td>
          <td style="font-weight:700; color:var(--primary);">${item.padtar > 0 ? "₹" + item.padtar.toLocaleString('en-IN') : "-"}</td>
        </tr>
      `;
    }).join("");

    const count = finalKapans.length;
    const avgYield = countYield > 0 ? (sumYield / countYield).toFixed(2) + "%" : "-";
    const avgVar = countYield > 0 ? (sumVar / countYield).toFixed(2) + "%" : "-";

    tfoot.innerHTML = `
      <tr>
        <td colspan="2">કુલ કાપણ: ${count}</td>
        <td>${totalRoughPcs}</td>
        <td>${totalRoughWt.toFixed(2)}</td>
        <td>${totalLots}</td>
        <td>${(sumGalaxyDays / count).toFixed(1)}</td>
        <td>${(sumAssortDays / count).toFixed(1)}</td>
        <td>${(sumFourPDays / count).toFixed(1)}</td>
        <td>${(sumRtDays / count).toFixed(1)}</td>
        <td>${(sumKhataDays / count).toFixed(1)}</td>
        <td style="background:#fef08a;">${(sumTotalDays / count).toFixed(1)}</td>
        <td>-</td>
        <td>${avgYield}</td>
        <td style="color:${parseFloat(avgVar) < 0 ? '#dc2626' : (parseFloat(avgVar) > 0 ? '#16a34a' : 'inherit')}">${avgVar}</td>
        <td>${totalPolishWt.toFixed(2)}</td>
        <td>${totalPolishPcs}</td>
        <td>-</td>
      </tr>
    `;

    // Render KPI dashboard cards
    const kpiContainer = document.getElementById("reportsKpiContainer");
    if (kpiContainer) {
      const totalActive = finalKapans.filter(item => item.k.currentDept !== "OK KAPAN (ઓકે કાપણ)").length;
      const totalApproved = finalKapans.filter(item => item.k.currentDept === "OK KAPAN (ઓકે કાપણ)").length;
      const avgDaysVal = count > 0 ? (sumTotalDays / count).toFixed(1) : "-";
      const avgYieldVal = countYield > 0 ? (sumYield / countYield).toFixed(2) + "%" : "-";
      const avgVarVal = countYield > 0 ? (sumVar / countYield).toFixed(2) + "%" : "-";
      const totalOverdue = finalKapans.filter(item => item.isOverdue).length;

      kpiContainer.innerHTML = `
        <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px;">${count}</div>
          <div style="font-size: 12px; font-weight: 700; color: #1e40af;">કુલ કાપણ (Total Kapans)</div>
          <div style="font-size: 10px; color: #475569; margin-top: 4px;">ચાલુ: ${totalActive} | ઓકે: ${totalApproved}</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef9c3, #fef08a); border: 1px solid #fde047; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #854d0e; margin-bottom: 4px;">${avgDaysVal}</div>
          <div style="font-size: 12px; font-weight: 700; color: #854d0e;">સરેરાશ કુલ દિવસો (Avg Days)</div>
          <div style="font-size: 10px; color: #713f12; margin-top: 4px;">વિભાગીય સમયગાળો</div>
        </div>
        <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); border: 1px solid #d8b4fe; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #581c87; margin-bottom: 4px;">${avgVarVal}</div>
          <div style="font-size: 12px; font-weight: 700; color: #6b21a8;">સરેરાશ વેરિયેશન (Avg Var)</div>
          <div style="font-size: 10px; color: #581c87; margin-top: 4px;">તૈયાર ગુણાકાર વિલંબ</div>
        </div>
        <div style="background: linear-gradient(135deg, #fee2e2, #fca5a5); border: 1px solid #f87171; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: #991b1b; margin-bottom: 4px;">${totalOverdue}</div>
          <div style="font-size: 12px; font-weight: 700; color: #b91c1c;">વિલંબિત કાપણ (Overdue Alert)</div>
          <div style="font-size: 10px; color: #7f1d1d; margin-top: 4px;">વિલંબ > ૩ દિવસ</div>
        </div>
      `;
    }
  }

  function exportReport() {
    exportTableToExcel('reportTable', 'Kapan_Process_Time_Report.csv');
  }

  function printReport() {
    const table = document.getElementById("reportTable");
    if (!table) return;

    const fromVal = document.getElementById("repFromDate").value;
    const toVal = document.getElementById("repToDate").value;
    const dateRangeStr = (fromVal ? fromVal : "") + " થી " + (toVal ? toVal : "");
    const searchVal = document.getElementById("repKapanSearch").value.trim();
    const filterInfo = `ફિલ્ટર્સ: ${searchVal ? 'કાપણ: ' + searchVal + ' | ' : ''} રફ: ${document.getElementById("repRoughSelect").value || 'બધા'} | વિભાગ: ${document.getElementById("repDeptSelect").value || 'બધા'} | તારીખ ગાળો: ${dateRangeStr || 'બધા'}`;

    const printWindow = window.open("", "_blank", "width=1000,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>કાપણ અને વિભાગીય સમય અહેવાલો - SMS Kaapan Stock</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #000; background: #fff; }
            h2 { text-align: center; margin-bottom: 5px; font-size: 22px; }
            .subtitle { text-align: center; font-size: 13px; color: #4b5563; margin-bottom: 20px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid #000; padding: 6px 4px; text-align: center; }
            th { background: #f3f4f6; font-weight: bold; }
            tfoot tr { background: #f9fafb; font-weight: bold; }
            @media print {
              body { padding: 0; }
              @page { size: landscape; margin: 0.8cm; }
            }
          </style>
        </head>
        <body>
          <h2>કાપણ અને વિભાગીય સમય અહેવાલ (Kapan & Departmental Process Report)</h2>
          <div class="subtitle">${filterInfo}</div>
          <table>
            <thead>
              ${table.querySelector("thead").innerHTML}
            </thead>
            <tbody>
              ${table.querySelector("tbody").innerHTML}
            </tbody>
            <tfoot>
              ${table.querySelector("tfoot").innerHTML}
            </tfoot>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Explicitly expose to window object for HTML event handlers
  window.renderReportsPage = renderReportsPage;
  window.runReport = runReport;
  window.exportReport = exportReport;
  window.printReport = printReport;
  window.addCustomFieldInputRow = addCustomFieldInputRow;
