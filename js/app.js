import { calcolaMobile, disegnaMobileSvg } from './moduli/mobile.js';

let LISTINO = {
  materialiScocca: [
    { id: "nobilitato", nome: "Nobilitato Bianco 19mm", prezzo: 25 },
    { id: "multistrato", nome: "Multistrato Pioppo 19mm", prezzo: 45 },
    { id: "mdf", nome: "MDF Grezzo 19mm", prezzo: 30 }
  ],
  ferramentaEAccessori: {
    ripiano: 12.00,
    asta: 18.50,
    cassetto: 45.00,
    cerniereAnat: 15.00
  }
};

const VIEW = { CLIENTE: "client", TECH: "tech" };
let viewMode = VIEW.CLIENTE;

document.addEventListener("DOMContentLoaded", () => {
  popolaSelezioniIniziali();
  agganciaEventi();

  const saved = localStorage.getItem("viewMode");
  setViewMode(saved === VIEW.TECH ? VIEW.TECH : VIEW.CLIENTE);

  cambiaTipoCommessa();
});

function setViewMode(mode) {
  viewMode = (mode === VIEW.TECH) ? VIEW.TECH : VIEW.CLIENTE;

  document.body.classList.remove("mode-client", "mode-tech");
  document.body.classList.add(viewMode === VIEW.TECH ? "mode-tech" : "mode-client");

  localStorage.setItem("viewMode", viewMode);
  eseguiRicalcoloGlobal();
}

function popolaSelezioniIniziali() {
  const selectMat = document.getElementById("mat");
  if (!selectMat) return;
  const prev = selectMat.value || "";

  selectMat.innerHTML = LISTINO.materialiScocca
    .map(m => `<option value="${m.id}">${m.nome} (€${m.prezzo}/mq)</option>`)
    .join("");

  if (prev) selectMat.value = prev;
}

function agganciaEventi() {
  document.getElementById("tipoCommessa")?.addEventListener("change", cambiaTipoCommessa);

  // ✅ BOTTONI MODALITÀ
  document.getElementById("btnViewClient")?.addEventListener("click", () => setViewMode(VIEW.CLIENTE));
  document.getElementById("btnViewTech")?.addEventListener("click", () => setViewMode(VIEW.TECH));

  ["nomeCliente", "mat", "tariffaOraria", "costoBordo", "costoTrasporto"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", eseguiRicalcoloGlobal);
  });

  ["L", "A", "P", "Z", "SP"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", eseguiRicalcoloGlobal);
  });

  document.getElementById("nD")?.addEventListener("input", gestisciCambioDivisori);

  document.getElementById("btnListino")?.addEventListener("click", () => gestisciModalListino(true));
  document.getElementById("btnChiudiModal")?.addEventListener("click", () => gestisciModalListino(false));

  document.getElementById("btnPrintTech")?.addEventListener("click", () => stampaConfiguratore("tech"));
  document.getElementById("btnPrintClient")?.addEventListener("click", () => stampaConfiguratore("client"));
}

function cambiaTipoCommessa() {
  const tipo = document.getElementById("tipoCommessa")?.value || "mobile";
  const isMobile = tipo === "mobile";

  document.getElementById("blocco-inputs-mobile").style.display = isMobile ? "block" : "none";
  document.getElementById("contVani").style.display = isMobile ? "block" : "none";

  document.getElementById("blocco-inputs-telaio").style.display = (tipo === "telaio") ? "block" : "none";
  document.getElementById("blocco-inputs-paretina").style.display = (tipo === "paretina") ? "block" : "none";

  if (isMobile) gestisciCambioDivisori();
  else eseguiRicalcoloGlobal();
}

function gestisciCambioDivisori() {
  const nD = parseInt(document.getElementById("nD")?.value) || 0;
  const contVani = document.getElementById("contVani");
  if (!contVani) return;

  const nVani = nD + 1;

  let html = `<h3 style="margin-top:15px; border-bottom: 2px solid #27ae60; color:#27ae60; font-size:1.1em;">CONFIGURAZIONE INTERNA PER LATO</h3>`;

  for (let i = 1; i <= nVani; i++) {
    html += `
      <div class="section" style="border-left:4px solid #27ae60; padding-left:15px; margin-bottom:15px;">
        <h4 style="margin:0 0 10px 0; font-size:13px; color:#2c3e50;">VANO LATO ${i}</h4>
        <div class="input-grid">
          <div>
            <label>N. Ripiani Vano ${i}</label>
            <input type="number" id="ripiani-vano-${i}" class="input-conteggio-elementi" data-vano="${i}" data-tipo="rip" value="0" min="0">
          </div>
          <div>
            <label>N. Cassetti Vano ${i}</label>
            <input type="number" id="cassetti-vano-${i}" class="input-conteggio-elementi" data-vano="${i}" data-tipo="cas" value="0" min="0">
          </div>
        </div>
        <div id="quote-rip-vano-${i}" style="margin-top:8px; display:grid; grid-template-columns:1fr 1fr; gap:5px;"></div>
        <div id="quote-cas-vano-${i}" style="margin-top:8px; display:grid; grid-template-columns:1fr 1fr; gap:5px;"></div>
      </div>
    `;
  }

  contVani.innerHTML = html;

  document.querySelectorAll(".input-conteggio-elementi").forEach(input => {
    input.addEventListener("input", (e) => {
      const vanoId = e.target.getAttribute("data-vano");
      const tipo = e.target.getAttribute("data-tipo");
      const quantita = parseInt(e.target.value) || 0;
      generaInputQuoteDinamiche(vanoId, tipo, quantita);
      eseguiRicalcoloGlobal();
    });
  });

  eseguiRicalcoloGlobal();
}

function generaInputQuoteDinamiche(vanoId, tipo, quantita) {
  const contenitore = document.getElementById(`quote-${tipo}-vano-${vanoId}`);
  if (!contenitore) return;

  let html = "";
  const etichetta = tipo === "rip" ? "Quota Rip." : "Quota Cas.";
  const colore = tipo === "rip" ? "#7f8c8d" : "#e67e22";

  for (let r = 1; r <= quantita; r++) {
    const A = parseFloat(document.getElementById("A")?.value) || 2000;
    const Z = parseFloat(document.getElementById("Z")?.value) || 100;
    const quota = Math.round(Z + 50 + (((A - Z) / (quantita + 1)) * r));

    html += `
      <div>
        <label style="font-size:10px; color:${colore}; font-weight:bold;">${etichetta} ${r} (mm)</label>
        <input type="number" id="quota-vano-${vanoId}-${tipo}-${r}" class="input-quota-elemento" value="${quota}" min="0" style="padding:4px; font-size:11px;">
      </div>
    `;
  }

  contenitore.innerHTML = html;
  document.querySelectorAll(".input-quota-elemento").forEach(i => i.addEventListener("input", eseguiRicalcoloGlobal));
}

function stampaConfiguratore(tipo) {
  setViewMode(tipo === "tech" ? VIEW.TECH : VIEW.CLIENTE);

  document.body.classList.remove("print-tech", "print-client");
  document.body.classList.add(`print-${tipo}`);

  const cleanup = () => {
    document.body.classList.remove("print-tech", "print-client");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);

  window.print();
}

function gestisciModalListino(apri) {
  const modal = document.getElementById("modalListino");
  if (!modal) return;

  if (!apri) { modal.style.display = "none"; return; }
  renderizzaContenutoModale();
  modal.style.display = "flex";
}

function renderizzaContenutoModale() {
  const contenitore = document.getElementById("contenutoListino");
  if (!contenitore) return;

  contenitore.innerHTML = `
    <h4 style="margin:0 0 10px 0; color:#007bff; font-size:14px;">MATERIALI SCOCCA (€/mq)</h4>
    <div style="max-height:120px; overflow-y:auto; margin-bottom:10px; border:1px solid #eee; padding:5px; border-radius:6px;">
      ${LISTINO.materialiScocca.map((m, index) => `
        <div class="list-item">
          <span>${m.nome}</span>
          <input type="number" data-type="materiale" data-index="${index}" value="${m.prezzo}" style="width:80px; padding:3px; font-size:12px;">
        </div>
      `).join("")}
    </div>

    <h4 style="margin: 15px 0 10px 0; color:#007bff; font-size:14px;">FERRAMENTA (€/Cad)</h4>
    <div class="list-item"><span>Lavorazione Ripiano</span><input type="number" id="edit-ferr-ripiano" value="${LISTINO.ferramentaEAccessori.ripiano}" style="width:80px; padding:3px;"></div>
    <div class="list-item"><span>Cassetto Completo + Guide</span><input type="number" id="edit-ferr-cassetto" value="${LISTINO.ferramentaEAccessori.cassetto}" style="width:80px; padding:3px;"></div>

    <button id="btnSalvaListino" class="btn" style="background:#2ecc71; margin-top:15px; width:100%; font-size:13px; padding:8px;">💾 Salva e Applica</button>
  `;

  document.getElementById("btnSalvaListino")?.addEventListener("click", salvaModifichePrezziGenerali);
}

function salvaModifichePrezziGenerali() {
  document.querySelectorAll('#contenutoListino input[data-type="materiale"]').forEach(input => {
    const idx = parseInt(input.getAttribute("data-index"));
    if (LISTINO.materialiScocca[idx]) LISTINO.materialiScocca[idx].prezzo = parseFloat(input.value) || 0;
  });

  LISTINO.ferramentaEAccessori.ripiano = parseFloat(document.getElementById("edit-ferr-ripiano")?.value) || 0;
  LISTINO.ferramentaEAccessori.cassetto = parseFloat(document.getElementById("edit-ferr-cassetto")?.value) || 0;

  popolaSelezioniIniziali();
  document.getElementById("modalListino").style.display = "none";
  eseguiRicalcoloGlobal();
}

function renderCliente(tabellaDettagli, totaleFinale, costoTrasporto) {
  tabellaDettagli.innerHTML = `
    <thead>
      <tr><th>Riepilogo</th><th style="text-align:right">Importo</th></tr>
    </thead>
    <tbody>
      <tr><td>Totale lavorazione e materiali</td><td style="text-align:right">€ ${(totaleFinale - costoTrasporto).toFixed(2)}</td></tr>
      <tr><td>Trasporto e consegna</td><td style="text-align:right">€ ${costoTrasporto.toFixed(2)}</td></tr>
      <tr style="font-weight:bold; background:#2ecc71; color:#2c3e50;">
        <td style="padding:10px;">TOTALE PREVENTIVO</td>
        <td style="text-align:right;">€ ${totaleFinale.toFixed(2)}</td>
      </tr>
    </tbody>
  `;
}

function renderProduzione(tabellaDettagli, risultato, totaleFinale, costoTrasporto) {
  tabellaDettagli.innerHTML = `
    <thead>
      <tr><th>Voce di Costo</th><th style="text-align:right">Quantità</th><th style="text-align:right">Importo</th></tr>
    </thead>
    <tbody>
      <tr><td>Materiali</td><td style="text-align:right">${risultato.mqTotali} mq</td><td style="text-align:right">€ ${risultato.costoMateriale}</td></tr>
      <tr><td>Bordatura</td><td style="text-align:right">${risultato.metriBordo} m</td><td style="text-align:right">€ ${risultato.costoBordatura}</td></tr>
      <tr><td>Ferramenta</td><td style="text-align:right">A corpo</td><td style="text-align:right">€ ${risultato.costoFerramenta}</td></tr>
      <tr><td>Manodopera</td><td style="text-align:right">${risultato.oreLavoro} ore</td><td style="text-align:right">€ ${risultato.costoManodopera}</td></tr>
      <tr><td>Trasporto</td><td style="text-align:right">Fisso</td><td style="text-align:right">€ ${costoTrasporto.toFixed(2)}</td></tr>
      <tr style="font-weight:bold; background:#2ecc71; color:#2c3e50;">
        <td style="padding:10px;">TOTALE</td><td></td><td style="text-align:right;">€ ${totaleFinale.toFixed(2)}</td>
      </tr>
    </tbody>
  `;
}

function renderDistintaPezzi(tabellaPezzi, pezzi) {
  if (!tabellaPezzi) return;

  if (!Array.isArray(pezzi) || pezzi.length === 0) {
    tabellaPezzi.innerHTML = `<tr><td style="padding:10px; color:#7f8c8d;">Nessun pezzo disponibile.</td></tr>`;
    return;
  }

  tabellaPezzi.innerHTML = `
    <thead>
      <tr>
        <th>Pezzo</th>
        <th style="text-align:right">Q.tà</th>
        <th style="text-align:right">X (mm)</th>
        <th style="text-align:right">Y (mm)</th>
        <th style="text-align:right">Sp (mm)</th>
      </tr>
    </thead>
    <tbody>
      ${pezzi.map(p => `
        <tr>
          <td>${p.nome}</td>
          <td style="text-align:right">${p.qta}</td>
          <td style="text-align:right">${p.x}</td>
          <td style="text-align:right">${p.y}</td>
          <td style="text-align:right">${p.sp}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function eseguiRicalcoloGlobal() {
  const tipo = document.getElementById("tipoCommessa")?.value || "mobile";

  const totaleBig = document.getElementById("totale-big");
  const svgElement = document.getElementById("configuratoreSvg");
  const tabellaDettagli = document.getElementById("tabella-dettagli");
  const tabellaPezzi = document.getElementById("tabella-pezzi");

  const tariffaOraria = parseFloat(document.getElementById("tariffaOraria")?.value) || 0;
  const costoBordo = parseFloat(document.getElementById("costoBordo")?.value) || 0;
  const costoTrasporto = parseFloat(document.getElementById("costoTrasporto")?.value) || 0;

  const idMat = document.getElementById("mat")?.value;
  const mat = LISTINO.materialiScocca.find(m => m.id === idMat);
  const prezzoMateriale = mat ? mat.prezzo : 0;

  if (tipo !== "mobile") return;

  const nD = parseInt(document.getElementById("nD")?.value) || 0;
  const nVani = nD + 1;
  const mappaConfigurazioneVani = [];

  for (let v = 1; v <= nVani; v++) {
    const qRip = parseInt(document.getElementById(`ripiani-vano-${v}`)?.value) || 0;
    const quoteRipiani = [];
    for (let r = 1; r <= qRip; r++) quoteRipiani.push(parseFloat(document.getElementById(`quota-vano-${v}-rip-${r}`)?.value) || 0);

    const qCas = parseInt(document.getElementById(`cassetti-vano-${v}`)?.value) || 0;
    const quoteCassetti = [];
    for (let c = 1; c <= qCas; c++) quoteCassetti.push(parseFloat(document.getElementById(`quota-vano-${v}-cas-${c}`)?.value) || 0);

    mappaConfigurazioneVani.push({
      vanoIndex: v,
      ripiani: { quantita: qRip, quote: quoteRipiani },
      cassetti: { quantita: qCas, quote: quoteCassetti }
    });
  }

  const paramsMobile = {
    L: parseFloat(document.getElementById("L")?.value) || 0,
    A: parseFloat(document.getElementById("A")?.value) || 0,
    P: parseFloat(document.getElementById("P")?.value) || 0,
    Z: parseFloat(document.getElementById("Z")?.value) || 0,
    SP: parseFloat(document.getElementById("SP")?.value) || 0,
    nD,
    mappaConfigurazioneVani,
    tariffaOraria,
    costoBordo,
    prezzoMateriale,
    prezziFerramenta: LISTINO.ferramentaEAccessori
  };

  const risultato = calcolaMobile(paramsMobile);
  const totaleFinale = (risultato?.totale || 0) + costoTrasporto;

  if (totaleBig) totaleBig.innerText = `€ ${totaleFinale.toFixed(2)}`;

  if (tabellaDettagli) {
    if (viewMode === VIEW.TECH) renderProduzione(tabellaDettagli, risultato, totaleFinale, costoTrasporto);
    else renderCliente(tabellaDettagli, totaleFinale, costoTrasporto);
  }

  renderDistintaPezzi(tabellaPezzi, risultato?.pezzi);

  if (svgElement) disegnaMobileSvg(svgElement, paramsMobile);
}
