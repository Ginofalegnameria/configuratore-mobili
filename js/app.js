/**
 * APP.JS - Coordinatore centrale
 * - Modalità doppia: Cliente / Produzione (schermo)
 * - Stampa doppia: Client / Tech (CSS print-*)
 */

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

// --- MODALITÀ UI (schermo) ---
const VIEW = {
  CLIENTE: "client",
  TECH: "tech"
};

let viewMode = VIEW.CLIENTE;

document.addEventListener("DOMContentLoaded", () => {
  popolaSelezioniIniziali();
  agganciaEventi();

  // Ripristina modalità vista salvata
  const saved = localStorage.getItem("viewMode");
  if (saved === VIEW.TECH || saved === VIEW.CLIENTE) {
    setViewMode(saved);
  } else {
    setViewMode(VIEW.CLIENTE);
  }

  cambiaTipoCommessa();
});

function setViewMode(mode) {
  viewMode = (mode === VIEW.TECH) ? VIEW.TECH : VIEW.CLIENTE;

  // classi modalità (non sovrascrivere body.className!)
  document.body.classList.remove("mode-client", "mode-tech");
  document.body.classList.add(viewMode === VIEW.TECH ? "mode-tech" : "mode-client");

  localStorage.setItem("viewMode", viewMode);

  // aggiorna output in base alla vista
  eseguiRicalcoloGlobal();
}

function popolaSelezioniIniziali() {
  const selectMat = document.getElementById("mat");
  const vecchioMat = selectMat ? selectMat.value : "";
  if (selectMat) {
    selectMat.innerHTML = LISTINO.materialiScocca
      .map(m => `<option value="${m.id}">${m.nome} (€${m.prezzo}/mq)</option>`)
      .join("");
    if (vecchioMat) selectMat.value = vecchioMat;
  }
}

function agganciaEventi() {
  document.getElementById("tipoCommessa")?.addEventListener("change", cambiaTipoCommessa);

  // Toggle modalità a schermo (se esistono i bottoni)
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

  // Stampa: imposta anche la vista coerente
  document.getElementById("btnPrintTech")?.addEventListener("click", () => stampaConfiguratore("tech"));
  document.getElementById("btnPrintClient")?.addEventListener("click", () => stampaConfiguratore("client"));
}

function gestisciCambioDivisori() {
  const nD = parseInt(document.getElementById("nD")?.value) || 0;
  const contVani = document.getElementById("contVani");
  const nVani = nD + 1;

  if (!contVani) return;

  let htmlVani = `<h3 style="margin-top:15px; border-bottom: 2px solid #27ae60; color:#27ae60; font-size:1.1em;">CONFIGURAZIONE INTERNA PER LATO</h3>`;

  for (let i = 1; i <= nVani; i++) {
    htmlVani += `
      <div class="section" style="border-left: 4px solid #27ae60; padding-left:15px; margin-bottom:15px;">
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
        <div id="quote-rip-vano-${i}" style="margin-top:8px; display:grid; grid-template-columns: 1fr 1fr; gap:5px;"></div>
        <div id="quote-cas-vano-${i}" style="margin-top:8px; display:grid; grid-template-columns: 1fr 1fr; gap:5px;"></div>
      </div>
    `;
  }

  contVani.innerHTML = htmlVani;

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

  let htmlQuote = "";
  const etichetta = tipo === "rip" ? "Quota Rip." : "Quota Cas.";
  const coloreLabel = tipo === "rip" ? "#7f8c8d" : "#e67e22";

  for (let r = 1; r <= quantita; r++) {
    const altezzaTotale = parseFloat(document.getElementById("A")?.value) || 2000;
    const zoccolo = parseFloat(document.getElementById("Z")?.value) || 100;
    const quotaProposta = Math.round(zoccolo + 50 + (((altezzaTotale - zoccolo) / (quantita + 1)) * r));

    htmlQuote += `
      <div>
        <label style="font-size:10px; color:${coloreLabel}; font-weight:bold;">${etichetta} ${r} (mm)</label>
        <input type="number" id="quota-vano-${vanoId}-${tipo}-${r}" class="input-quota-elemento" value="${quotaProposta}" min="0" style="padding:4px; font-size:11px;">
      </div>
    `;
  }

  contenitore.innerHTML = htmlQuote;

  document.querySelectorAll(".input-quota-elemento").forEach(input => {
    input.addEventListener("input", eseguiRicalcoloGlobal);
  });
}

function cambiaTipoCommessa() {
  const tipo = document.getElementById("tipoCommessa")?.value;
  const isMobile = tipo === "mobile";

  const bloccoMobile = document.getElementById("blocco-inputs-mobile");
  const contVani = document.getElementById("contVani");
  const bloccoTelaio = document.getElementById("blocco-inputs-telaio");
  const bloccoParetina = document.getElementById("blocco-inputs-paretina");

  if (bloccoMobile) bloccoMobile.style.display = isMobile ? "block" : "none";
  if (contVani) contVani.style.display = isMobile ? "block" : "none";
