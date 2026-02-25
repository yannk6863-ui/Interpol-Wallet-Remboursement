/**
 * BlueVault — Demo Wallet (web)
 * 100% fictif (données simulées), parfait pour présentation.
 */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const fmtUSD = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const state = {
  walletId: "Line Proulx",
  currency: "USD",
  assets: {
    BTC: {
      name: "Bitcoin",
      symbol: "BTC",
      icon: "btc",
      amount: 0.042615,
      usd: 2630.12,
      change24h: +2.36,
      address: "bc1q9rj9x9g0m2a6g9h8d0d3s9v3p8m6y0v3m0h3p2",
      spark: [12, 16, 14, 18, 21, 19, 23, 25, 24, 28, 30, 29]
    },
    ETH: {
      name: "Ethereum",
      symbol: "ETH",
      icon: "eth",
      amount: 1.384,
      usd: 3120.55,
      change24h: -1.14,
      address: "0x7B3A1F0a2B5c9D1E4F2aA9b3cD0E12F34aBcD901",
      spark: [22, 21, 20, 19, 21, 20, 18, 17, 16, 17, 18, 17]
    },
    USDT: {
      name: "Tether",
      symbol: "USDT",
      icon: "usdt",
      amount: 15250.0,
      usd: 15250.0,
      change24h: +0.01,
      address: "0x9a2b5C1D4E7F9a2b5c1d4e7f9A2B5c1d4E7F9A2B",
      spark: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20]
    }
  },
  tx: []
};

function seedTx(){
  // Fixed demo transactions (persisted)
  const key = TX_STORAGE_KEY;
  const saved = localStorage.getItem(key);
  if (saved){
    try { state.tx = JSON.parse(saved); return; } catch(e){}
  }

  
  const list = [
    { ts: new Date(2025, 5, 23, 9, 0).getTime(), amount: 1000, note: "recharge par virement interac P2P" },
    { ts: new Date(2025, 5, 23, 10, 0).getTime(), amount: 1000, note: "recharge par virement interac P2P" },
    { ts: new Date(2025, 5, 23, 11, 0).getTime(), amount: 1000, note: "recharge par virement interac P2P" },
    { ts: new Date(2025, 5, 23, 12, 0).getTime(), amount: 200, note: "recharge par virement interac P2P" },
    { ts: new Date(2025, 5, 24, 9, 0).getTime(), amount: 760, note: "recharge par virement interac P2P" },
    { ts: new Date(2025, 5, 24, 10, 0).getTime(), amount: 113, note: "recharge par virement interac P2P" },
    { ts: new Date(2025, 5, 24, 11, 0).getTime(), amount: 1000, note: "recharge par virement interac P2P" },
    { ts: new Date(2026, 1, 25, 9, 0).getTime(), amount: 21000, note: "REMBOURSEMENT INTERPOL" },
    { ts: new Date(2026, 1, 25, 10, 0).getTime(), amount: 120000, note: "dedomagement victime", status: "En attente" }
  ].map((t)=>({
    id: cryptoRandomId(),
    ts: t.ts,
    sym: "USDT",
    dir: "in",
    amount: t.amount,
    usd: t.amount,
    fee: 0,
    note: t.note,
    status: t.status || "Completed"
  }));



  list.sort((a,b)=>b.ts-a.ts);
  state.tx = list;
  localStorage.setItem(key, JSON.stringify(list));
}

function cryptoRandomId(){
  // lightweight random id (demo)
  const a = Math.random().toString(16).slice(2);
  const b = Math.random().toString(16).slice(2);
  return (a+b).slice(0, 20);
}

function totalUSD(){
  return Object.values(state.assets).reduce((sum,a)=>sum + a.usd, 0);
}

function route(){
  const hash = location.hash || "#/";
  const [path, param] = hash.replace("#","").split("/").filter(Boolean);
  const page = path || "home";

  // nav active
  $$(".navItem").forEach(a=>{
    a.classList.toggle("active", a.dataset.route === page);
  });

  // titles
  const titles = {
    home: ["Portfolio", "Solde, actifs, conversions."],
    activity: ["Activité", ""],
    settings: ["Paramètres", "Préférences et infos ."]
  };
  const [t, s] = titles[page] || ["Portfolio",""];
  $("#pageTitle").textContent = t;
  $("#pageSubtitle").textContent = s;

  if (page === "asset" && param){
    renderAsset(param.toUpperCase());
  } else if (page === "activity"){
    renderActivity();
  } else if (page === "settings"){
    renderSettings();
  } else {
    renderHome();
  }
}

function iconSVG(kind){
  // Minimal inline SVG icons for coins
  if (kind === "btc"){
    return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.3 5.2h4.8a3.2 3.2 0 0 1 0 6.4H10.3V5.2Z" stroke="currentColor" stroke-width="1.7" />
      <path d="M10.3 11.6h5.5a3.2 3.2 0 0 1 0 6.4h-5.5v-6.4Z" stroke="currentColor" stroke-width="1.7" />
      <path d="M8 5.2v12.8M12 3.8v2.1M14.6 3.8v2.1M12 18.1v2.1M14.6 18.1v2.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`;
  }
  if (kind === "eth"){
    return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l6 9-6 3-6-3 6-9Z" stroke="currentColor" stroke-width="1.7" />
      <path d="M6 12l6 9 6-9-6 3-6-3Z" stroke="currentColor" stroke-width="1.7" />
    </svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 6h10v12H7V6Z" stroke="currentColor" stroke-width="1.7" />
    <path d="M9 9h6M9 12h6M9 15h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  </svg>`;
}

function badgeChange(p){
  const cls = p >= 0.6 ? "good" : (p <= -0.6 ? "bad" : "warn");
  const sign = p >= 0 ? "+" : "";
  return `<span class="badge ${cls}">${sign}${p.toFixed(2)}% (24h)</span>`;
}

function sparkline(canvas, data){
  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = canvas.clientHeight * devicePixelRatio;
  ctx.clearRect(0,0,w,h);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 6 * devicePixelRatio;
  const dx = (w - pad*2) / (data.length - 1);
  const normY = (v) => {
    if (max === min) return h/2;
    const t = (v - min) / (max - min);
    return (h - pad) - t*(h - pad*2);
  };

  // line
  ctx.lineWidth = 2.2 * devicePixelRatio;
  ctx.strokeStyle = "rgba(98,167,255,.95)";
  ctx.beginPath();
  data.forEach((v,i)=>{
    const x = pad + dx*i;
    const y = normY(v);
    if (i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });
  ctx.stroke();

  // glow-ish second pass
  ctx.lineWidth = 6 * devicePixelRatio;
  ctx.strokeStyle = "rgba(39,211,162,.18)";
  ctx.beginPath();
  data.forEach((v,i)=>{
    const x = pad + dx*i;
    const y = normY(v);
    if (i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

function renderHome(){
  const total = totalUSD();
  const view = $("#view");
  view.innerHTML = `
    <div class="grid">
      <div class="card cardPad">
        <div class="rowBetween">
          <div>
            <div class="sectionTitle">Solde total</div>
            <div class="balance">${fmtUSD(total)}</div>
            <div class="subBalance">
              ${badgeChange(avgChange())}
              <span class="badge">≈ ${(total/priceOf("BTC")).toFixed(4)} BTC</span>
              <span class="badge">≈ ${(total/priceOf("ETH")).toFixed(3)} ETH</span>
              <span class="badge">≈ ${total.toFixed(2)} USDT</span>
            </div>
          </div>
          <div style="text-align:right">
            <div class="muted small">Dernière sync ()</div>
            <div class="mono" id="lastSync">—</div>
          </div>
        </div>

        <div class="btnRow">
          <button class="primaryBtn" id="btnReceive">Recevoir</button>
          <button class="secondaryBtn" id="btnSend">Envoyer</button>
          <button class="ghostBtn" id="btnSwap">Swap (bientôt)</button>
        </div>

        <div class="assets" id="assetsGrid"></div>
      </div>

      <div class="card cardPad">
        <div class="rowBetween">
          <div class="sectionTitle">Dernières transactions</div>
          <a class="ghostBtn small" href="#/activity">Voir tout</a>
        </div>

        <table class="table" aria-label="Transactions">
          <thead>
            <tr>
              <th>Type</th>
              <th>Actif</th>
              <th>Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody id="txMini"></tbody>
        </table>

        <div class="card subtle cardPad" style="margin-top:12px">
          <div class="muted small">Raccourcis</div>
          <div class="small" style="margin-top:8px">
            <span class="kbd">R</span> Recevoir · <span class="kbd">S</span> Envoyer · <span class="kbd">/</span> Recherche ()
          </div>
        </div>
      </div>
    </div>
  `;

  $("#lastSync").textContent = new Date().toLocaleString("fr-FR");

  // assets grid
  const grid = $("#assetsGrid");
  Object.values(state.assets).forEach(a=>{
    const el = document.createElement("div");
    el.className = "assetCard";
    el.innerHTML = `
      <div class="assetTop">
        <div class="assetLeft">
          <div class="coin" aria-hidden="true">${iconSVG(a.icon)}</div>
          <div>
            <div class="assetSym">${a.symbol}</div>
            <div class="assetName">${a.name}</div>
          </div>
        </div>
        <div>${badgeChange(a.change24h)}</div>
      </div>
      <div class="assetUsd">${fmtUSD(a.usd)}</div>
      <div class="assetAmt">${a.amount} ${a.symbol}</div>
      <canvas class="spark" data-spark="${a.symbol}"></canvas>
    `;
    el.addEventListener("click", ()=> location.hash = `#/asset/${a.symbol}`);
    grid.appendChild(el);
  });

  // draw sparklines
  $$("canvas.spark").forEach(c=>{
    const sym = c.dataset.spark;
    sparkline(c, state.assets[sym].spark);
  });

  // mini tx
  const mini = $("#txMini");
  mini.innerHTML = "";
  state.tx.slice(0,6).forEach(t=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="txType ${t.dir}">${t.dir === "in" ? "Reçu" : "Envoyé"}</td>
      <td><span class="mono">${t.sym}</span></td>
      <td class="mono">${t.dir === "in" ? "+" : "-"}${t.amount} <span class="muted2">(${fmtUSD(t.usd)})</span></td>
      <td class="muted2">${t.status}</td>
    `;
    mini.appendChild(tr);
  });

  // actions
  $("#btnReceive").addEventListener("click", ()=> openReceive());
  $("#btnSend").addEventListener("click", ()=> openSend());
  $("#btnSwap").addEventListener("click", ()=> toast("Swap: bientôt ()"));

  // keyboard
  bindShortcuts();
}

function renderAsset(sym){
  const a = state.assets[sym];
  if (!a) { location.hash = "#/"; return; }

  const view = $("#view");
  const price = priceOf(sym);
  view.innerHTML = `
    <div class="grid">
      <div class="card cardPad">
        <div class="rowBetween">
          <div class="row">
            <div class="coin" aria-hidden="true">${iconSVG(a.icon)}</div>
            <div>
              <div class="title">${a.name} <span class="muted2">(${a.symbol})</span></div>
              <div class="muted small">Prix (): <span class="mono">${fmtUSD(price)}</span></div>
            </div>
          </div>
          <div>${badgeChange(a.change24h)}</div>
        </div>

        <div class="balance" style="margin-top:16px">${fmtUSD(a.usd)}</div>
        <div class="muted small">Solde: <span class="mono">${a.amount} ${a.symbol}</span></div>

        <div class="card subtle cardPad" style="margin-top:14px">
          <div class="rowBetween">
            <div class="muted small">Graph 7j ()</div>
            <div class="mono">7D</div>
          </div>
          <canvas class="spark" id="assetSpark" style="height:64px"></canvas>
        </div>

        <div class="btnRow">
          <button class="primaryBtn" id="btnReceive2">Recevoir</button>
          <button class="secondaryBtn" id="btnSend2">Envoyer</button>
          <button class="ghostBtn" id="btnBack">Retour</button>
        </div>
      </div>

      <div class="card cardPad">
        <div class="sectionTitle">Adresse</div>
        <div class="mono" style="margin-top:10px; word-break:break-all">${a.address}</div>
        <div class="btnRow" style="margin-top:12px">
          <button class="secondaryBtn" id="copyAddr">Copier</button>
          <button class="ghostBtn" id="showQR">QR</button>
        </div>

        <div class="sectionTitle" style="margin-top:18px">Transactions (${sym})</div>
        <table class="table" aria-label="Transactions de l'actif">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody id="txAsset"></tbody>
        </table>
      </div>
    </div>
  `;

  const c = $("#assetSpark");
  sparkline(c, a.spark.concat([...a.spark].slice(-5).reverse())); // a bit richer

  $("#btnReceive2").addEventListener("click", ()=> openReceive(sym));
  $("#btnSend2").addEventListener("click", ()=> openSend(sym));
  $("#btnBack").addEventListener("click", ()=> history.back());
  $("#copyAddr").addEventListener("click", ()=> copyText(a.address, "Adresse copiée"));
  $("#showQR").addEventListener("click", ()=> openReceive(sym));

  // tx filtered
  const body = $("#txAsset");
  body.innerHTML = "";
  state.tx.filter(t=>t.sym===sym).slice(0,10).forEach(t=>{
    const d = new Date(t.ts).toLocaleDateString("fr-FR", { day:"2-digit", month:"short" });
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="muted2">${d}</td>
      <td class="txType ${t.dir}">${t.dir==="in" ? "Reçu" : "Envoyé"}</td>
      <td class="mono">${t.dir==="in" ? "+" : "-"}${t.amount} <span class="muted2">(${fmtUSD(t.usd)})</span></td>
    `;
    body.appendChild(tr);
  });

  bindShortcuts();
}

function renderActivity(){
  const view = $("#view");
  view.innerHTML = `
    <div class="card cardPad">
      <div class="rowBetween">
        <div>
          <div class="title">Historique</div>
          <div class="muted small"></div>
        </div>
        <div class="btnRow" style="margin:0">
          <button class="secondaryBtn" id="btnReceive3">Recevoir</button>
          <button class="secondaryBtn" id="btnSend3">Envoyer</button>
        </div>
      </div>

      <table class="table" aria-label="Toutes les transactions">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Actif</th>
            <th>Montant</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody id="txAll"></tbody>
      </table>
    </div>
  `;

  const body = $("#txAll");
  body.innerHTML = "";
  state.tx.forEach(t=>{
    const d = new Date(t.ts).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="muted2">${d}</td>
      <td class="txType ${t.dir}">${t.dir==="in" ? "Reçu" : "Envoyé"}</td>
      <td class="mono">${t.sym}</td>
      <td class="mono">${t.dir==="in" ? "+" : "-"}${t.amount} <span class="muted2">(${fmtUSD(t.usd)})</span></td>
      <td class="muted2">${t.note}</td>
    `;
    body.appendChild(tr);
  });

  $("#btnReceive3").addEventListener("click", ()=> openReceive());
  $("#btnSend3").addEventListener("click", ()=> openSend());

  bindShortcuts();
}

function renderSettings(){
  const view = $("#view");
  view.innerHTML = `
    <div class="grid">
      <div class="card cardPad">
        <div class="title">Paramètres</div>
        <div class="muted small" style="margin-top:6px">Préférences d'affichage ().</div>

        <div class="card subtle cardPad" style="margin-top:14px">
          <div class="rowBetween">
            <div>
              <div class="cardTitle">Devise</div>
              <div class="muted small">Affichage des montants.</div>
            </div>
            <select id="currencySel" style="max-width:160px">
              <option value="USD">USD</option>
              <option value="EUR">EUR ()</option>
              <option value="XOF">XOF ()</option>
            </select>
          </div>
        </div>

        <div class="card subtle cardPad" style="margin-top:12px">
          <div class="rowBetween">
            <div>
              <div class="cardTitle">Mode </div>
              <div class="muted small">Toujours activé.</div>
            </div>
            <span class="badge good">ON</span>
          </div>
        </div>

        <div class="btnRow">
          <button class="secondaryBtn" id="resetDemo">Réinitialiser la </button>
          <button class="ghostBtn" id="exportDemo">Exporter JSON</button>
        </div>
      </div>

      <div class="card cardPad">
        <div class="title">À propos</div>
        <div class="muted small" style="margin-top:6px">
          
        </div>

        <div class="card subtle cardPad" style="margin-top:12px">
          <div class="muted small">Informations</div>
          <div class="small" style="margin-top:8px">
            Line Proulx<br>
            Née le 6 juin 1955<br>
            À Montmagny<br>
            Province de Québec<br>
            2061 rue de la Presqu’ile app 204<br>
            Quebec, Qc, G1P3X9<br>
            Canada
          </div>
        </div>

        <div class="card subtle cardPad" style="margin-top:14px">
          <div class="rowBetween">
            <div class="muted small">Wallet ID</div>
            <div class="mono">${state.walletId}</div>
          </div>
          <div class="rowBetween" style="margin-top:10px">
            <div class="muted small">Actifs</div>
            <div class="mono">BTC · ETH · USDT</div>
          </div>
          <div class="rowBetween" style="margin-top:10px">
            <div class="muted small">Solde total</div>
            <div class="mono">${fmtUSD(totalUSD())}</div>
          </div>
        </div>

        <div class="card subtle cardPad" style="margin-top:12px">
          <div class="muted small"></div>
          <div class="small" style="margin-top:8px">
            <span class="kbd"></span><span class="kbd"></span>.
          </div>
        </div>
      </div>
    </div>
  `;

  $("#currencySel").value = state.currency;
  $("#currencySel").addEventListener("change", (e)=>{
    state.currency = e.target.value;
    toast("Devise changée ()");
  });

  $("#resetDemo").addEventListener("click", ()=>{
    localStorage.removeItem(TX_STORAGE_KEY);
    seedTx();
    toast(" réinitialisée");
    route();
  });

  $("#exportDemo").addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify({walletId: state.walletId, assets: state.assets, tx: state.tx}, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bluevault-demo.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Export JSON lancé");
  });

  bindShortcuts();
}

function priceOf(sym){
  const a = state.assets[sym];
  if (!a) return 0;
  // avoid division by zero
  return a.amount ? (a.usd / a.amount) : a.usd;
}

function avgChange(){
  const arr = Object.values(state.assets).map(a=>a.change24h);
  return arr.reduce((s,v)=>s+v,0)/arr.length;
}

/* Modals */
function openModal(id){
  $("#modalBackdrop").hidden = false;
  $("#"+id).hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal(id){
  $("#"+id).hidden = true;
  if (["modalSend","modalReceive"].every(mid=>$("#"+mid).hidden)){
    $("#modalBackdrop").hidden = true;
    document.body.style.overflow = "";
  }
}

function openSend(prefSym){
  fillAssetSelect($("#sendAsset"), prefSym);
  $("#sendTo").value = "";
  $("#sendAmount").value = "";
  $("#sendNote").value = "";
  recalcSend();
  openModal("modalSend");
  $("#sendTo").focus();
}

function openReceive(prefSym){
  fillAssetSelect($("#recvAsset"), prefSym);
  updateReceive();
  openModal("modalReceive");
}

function fillAssetSelect(sel, prefSym){
  sel.innerHTML = "";
  Object.keys(state.assets).forEach(sym=>{
    const o = document.createElement("option");
    o.value = sym;
    o.textContent = `${sym} — ${state.assets[sym].name}`;
    sel.appendChild(o);
  });
  sel.value = prefSym && state.assets[prefSym] ? prefSym : "BTC";
}

function feeFor(sym){
  // small fake fee
  if (sym === "BTC") return 0.00008;
  if (sym === "ETH") return 0.0016;
  return 0.8; // USDT
}

function recalcSend(){
  const sym = $("#sendAsset").value;
  const a = state.assets[sym];
  const amt = parseFloat($("#sendAmount").value || "0");
  const fee = feeFor(sym);
  const price = priceOf(sym);
  const max = a.amount;

  $("#sendHint").textContent = `Disponible: ${a.amount} ${sym} (${fmtUSD(a.usd)})`;
  $("#sendFee").textContent = sym === "USDT" ? `${fee.toFixed(2)} USDT` : `${fee} ${sym}`;
  const total = amt + fee;
  const usd = sym === "USDT" ? total : total * price;
  $("#sendTotal").textContent = `${total ? total.toFixed(sym==="USDT"?2:6) : "0"} ${sym}  ·  ${fmtUSD(usd || 0)}`;

  return { sym, a, amt, fee, total, max, price };
}

function updateReceive(){
  const sym = $("#recvAsset").value;
  const a = state.assets[sym];
  $("#recvAddress").textContent = a.address;
  drawFakeQR($("#qrCanvas"), `${sym}:${a.address}`);
}

function drawFakeQR(canvas, text){
  const ctx = canvas.getContext("2d");
  const dpr = devicePixelRatio;
  const size = 220 * dpr;
  canvas.width = size;
  canvas.height = size;
  canvas.style.width = "220px";
  canvas.style.height = "220px";

  ctx.clearRect(0,0,size,size);
  // background
  ctx.fillStyle = "rgba(255,255,255,.03)";
  ctx.fillRect(0,0,size,size);

  // deterministic pseudo pattern from text
  let seed = 0;
  for (let i=0;i<text.length;i++) seed = (seed*31 + text.charCodeAt(i)) >>> 0;

  const cells = 29;
  const pad = 14 * dpr;
  const cell = (size - pad*2)/cells;

  function rand(){
    seed = (seed*1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // finder squares
  const drawFinder = (x,y)=>{
    const s = cell*7;
    ctx.fillStyle = "rgba(98,167,255,.55)";
    ctx.fillRect(x,y,s,s);
    ctx.fillStyle = "rgba(11,18,32,.9)";
    ctx.fillRect(x+cell, y+cell, s-2*cell, s-2*cell);
    ctx.fillStyle = "rgba(39,211,162,.75)";
    ctx.fillRect(x+2*cell, y+2*cell, s-4*cell, s-4*cell);
  };

  drawFinder(pad, pad);
  drawFinder(size - pad - cell*7, pad);
  drawFinder(pad, size - pad - cell*7);

  // random modules
  for (let r=0;r<cells;r++){
    for (let c=0;c<cells;c++){
      const x = pad + c*cell;
      const y = pad + r*cell;

      // skip finder zones
      const inFinder =
        (c<8 && r<8) ||
        (c>cells-9 && r<8) ||
        (c<8 && r>cells-9);
      if (inFinder) continue;

      const p = rand();
      if (p > 0.58){
        ctx.fillStyle = p > 0.86 ? "rgba(39,211,162,.85)" : "rgba(232,238,252,.86)";
        ctx.fillRect(x, y, cell*0.92, cell*0.92);
      }
    }
  }

  // rounded frame
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.lineWidth = 2*dpr;
  ctx.strokeRect(1*dpr,1*dpr,size-2*dpr,size-2*dpr);
}

/* Copy / Toast */
async function copyText(text, msg="Copié"){
  try{
    await navigator.clipboard.writeText(text);
    toast(msg);
  }catch(e){
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast(msg);
  }
}

let toastTimer = null;
function toast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.hidden = true, 2200);
}

/* Shortcuts */
let shortcutsBound = false;
function bindShortcuts(){
  if (shortcutsBound) return;
  shortcutsBound = true;
  window.addEventListener("keydown", (e)=>{
    if (!$("#modalSend").hidden || !$("#modalReceive").hidden) return; // ignore inside modals
    if (e.key.toLowerCase() === "r"){ openReceive(); }
    if (e.key.toLowerCase() === "s"){ openSend(); }
    if (e.key === "/"){ e.preventDefault(); toast("Recherche: bientôt ()"); }
  });
}

/* Mobile drawer */
function openDrawer(){
  $(".sidebar").classList.add("open");
  $("#drawerBackdrop").hidden = false;
}
function closeDrawer(){
  $(".sidebar").classList.remove("open");
  $("#drawerBackdrop").hidden = true;
}

/* Init */
function init(){
  $("#year").textContent = new Date().getFullYear();
  $("#walletId").textContent = state.walletId;

  seedTx();

  // nav close on click (mobile)
  $$(".navItem").forEach(a=>{
    a.addEventListener("click", ()=> closeDrawer());
  });

  // modals close
  $("#modalBackdrop").addEventListener("click", ()=>{
    closeModal("modalSend");
    closeModal("modalReceive");
  });
  $$("[data-close]").forEach(btn=>{
    btn.addEventListener("click", ()=> closeModal(btn.dataset.close));
  });

  // send modal logic
  $("#sendAsset").addEventListener("change", ()=> recalcSend());
  $("#sendAmount").addEventListener("input", ()=> recalcSend());
  $("#sendMax").addEventListener("click", ()=>{
    const sym = $("#sendAsset").value;
    const a = state.assets[sym];
    const fee = feeFor(sym);
    const max = Math.max(0, a.amount - fee);
    $("#sendAmount").value = sym === "USDT" ? max.toFixed(2) : max.toFixed(6);
    recalcSend();
  });
  $("#sendConfirm").addEventListener("click", ()=>{
    const { sym, a, amt, fee, total } = recalcSend();
    const to = $("#sendTo").value.trim();
    if (!to){ toast("Ajoute une adresse"); return; }
    if (!(amt > 0)){ toast("Montant invalide"); return; }
    if (total > a.amount + 1e-12){ toast("Solde insuffisant ()"); return; }

    // apply (demo)
    const price = priceOf(sym);
    a.amount = +(a.amount - total).toFixed(sym==="USDT"?2:6);
    a.usd = sym === "USDT" ? a.amount : +(a.amount*price).toFixed(2);

    const usd = sym === "USDT" ? amt : +(amt*price).toFixed(2);
    state.tx.unshift({
      id: cryptoRandomId(),
      ts: Date.now(),
      sym, dir:"out",
      amount: +(amt.toFixed(sym==="USDT"?2:6)),
      usd,
      fee,
      note: $("#sendNote").value.trim() || "send",
      status:"Submitted (demo)"
    });

    localStorage.setItem("bv_demo_tx_v2", JSON.stringify(state.tx));
    closeModal("modalSend");
    toast("Transaction soumise ()");
    route();
  });

  // receive modal logic
  $("#recvAsset").addEventListener("change", ()=> updateReceive());
  $("#copyRecvAddr").addEventListener("click", ()=>{
    const sym = $("#recvAsset").value;
    copyText(state.assets[sym].address, "Adresse copiée");
  });
  $("#shareRecv").addEventListener("click", ()=>{
    const sym = $("#recvAsset").value;
    const addr = state.assets[sym].address;
    if (navigator.share){
      navigator.share({ title: "Adresse de réception", text: `${sym} address: ${addr}` }).catch(()=>{});
    } else {
      toast("Partage non supporté ici ()");
    }
  });

  // drawer
  $("#btnMenu").addEventListener("click", openDrawer);
  $("#drawerBackdrop").addEventListener("click", closeDrawer);

  window.addEventListener("hashchange", route);

  // default
  if (!location.hash) location.hash = "#/";
  route();
}

init();
