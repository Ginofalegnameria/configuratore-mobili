/**
 * APP.JS - Coordinatore centrale con Ripiani, Cassetti e Quote Dinamiche per singolo Vano
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

document.addEventListener("DOMContentLoaded", () => {
    popolaSelezioniIniziali();
    agganciaEventi();
    cambiaTipoCommessa();
});

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
    document.getElementById("tipoCommessa").addEventListener("change", cambiaTipoCommessa);

    ["nomeCliente", "mat", "tariffaOraria", "costoBordo", "costoTrasporto"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", eseguiRicalcoloGlobal);
    });

    ["L", "A", "P", "Z", "SP"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", eseguiRicalcoloGlobal);
    });

    document.getElementById("nD")?.addEventListener("input", gestisciCambioDivisori);

    document.getElementById("btnListino").addEventListener("click", () => gestisciModalListino(true));
    document.getElementById("btnChiudiModal").addEventListener("click", () => gestisciModalListino(false));
    document.getElementById("btnPrintTech").addEventListener("click", () => stampaConfiguratore("tech"));
    document.getElementById("btnPrintClient").addEventListener("click", () => stampaConfiguratore("client"));
}

// CREAZIONE DINAMICA DEI CONTROLLI PER OGNI VANO (LATO)
function gestisciCambioDivisori() {
    const nD = parseInt(document.getElementById("nD").value) || 0;
    const contVani = document.getElementById("contVani");
    const nVani = nD + 1;

    if (!contVani) return;

    let htmlVani = `<h3 style="margin-top:15px; border-bottom: 2px solid #27ae60; color:#27ae60; font-size:1.1em;">CONFIGURAZIONE INTERNA LATI / VANI</h3>`;
    
    for (let i = 1; i <= nVani; i++) {
        htmlVani += `
            <div class="section" style="border-left: 4px solid #27ae60; padding-left:15px; margin-bottom:15px;">
                <h4 style="margin:0 0 10px 0; font-size:13px; color:#2c3e50;">VANO LATO ${i}</h4>
                <div class="input-grid">
                    <div>
                        <label>N. Ripiani Vano ${i}</label>
                        <input type="number" id="ripiani-vano-${i}" class="input-conteggio-elementi" data-vano="${i}" data-tipo="rip" value="0" min="0" style="padding:4px;">
                    </div>
                    <div>
                        <label>N. Cassetti Vano ${i}</label>
                        <input type="number" id="cassetti-vano-${i}" class="input-conteggio-elementi" data-vano="${i}" data-tipo="cas" value="0" min="0" style="padding:4px;">
                    </div>
                </div>
                <!-- Contenitori per le quote specifiche -->
                <div id="quote-rip-vano-${i}" style="margin-top:8px; display:grid; grid-template-columns: 1fr 1fr; gap:5px;"></div>
                <div id="quote-cas-vano-${i}" style="margin-top:8px; display:grid; grid-template-columns: 1fr 1fr; gap:5px;"></div>
            </div>
        `;
    }

    contVani.innerHTML = htmlVani;

    // Aggancio eventi per i cambi quantità elementi interni
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

// Genera i campi delle altezze (quote) per ripiani o cassetti
function generaInputQuoteDinamiche(vanoId, tipo, quantita) {
    const contenitore = document.getElementById(`quote-${tipo}-vano-${vanoId}`);
    if (!contenitore) return;

    let htmlQuote = "";
    const etichetta = tipo === "rip" ? "Quota Rip." : "Quota Cas.";
    const coloreLabel = tipo === "rip" ? "#7f8c8d" : "#e67e22";

    for (let r = 1; r <= quantita; r++) {
        const altezzaTotale = parseFloat(document.getElementById("A").value) || 2000;
        const zoccolo = parseFloat(document.getElementById("Z").value) || 100;
        // Calcolo di posizionamento iniziale indicativo per aiutare l'utente
        const quotaProposta = Math.round(zoccolo + 50 + (((altezzaTotale - zoccolo) / (quantita + 1)) * r));

        htmlQuote += `
            <div>
                <label style="font-size:10px; color:${coloreLabel}; font-weight:bold;">${etichetta} ${r} (mm)</label>
                <input type="number" id="quota-vano-${vanoId}-${tipo}-${r}" class="input-quota-elemento" value="${quotaProposta}" min="0" style="padding:4px; font-size:12px;">
            </div>
        `;
    }
    contenitore.innerHTML = htmlQuote;

    document.querySelectorAll(".input-quota-elemento").forEach(input => {
        input.addEventListener("input", eseguiRicalcoloGlobal);
    });
}

function cambiaTipoCommessa() {
    const tipo = document.getElementById("tipoCommessa").value;
    const isMobile = tipo === "mobile";
    document.getElementById("blocco-inputs-mobile").style.display = isMobile ? "block" : "none";
    document.getElementById("contVani").style.display = isMobile ? "block" : "none";
    document.getElementById("blocco-inputs-telaio").style.display = tipo === "telaio" ? "block" : "none";
    document.getElementById("blocco-inputs-paretina").style.display = tipo === "paretina" ? "block" : "none";
    
    if (isMobile) gestisciCambioDivisori();
    else eseguiRicalcoloGlobal();
}

function stampaConfiguratore(tipo) {
    document.body.className = `print-${tipo}`;
    window.print();
}

function gestisciModalListino(apri) {
    const modal = document.getElementById("modalListino");
    if (!apri) { modal.style.display = "none"; return; }
    renderizzaContenutoModale();
    modal.style.display = "flex";
}

function renderizzaContenutoModale() {
    const contenitore = document.getElementById("contenutoListino");
    if (!contenitore) return;

    contenitore.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color:#007bff; font-size:14px;">MATERIALI SCOCCA (€/mq)</h4>
        <div id="lista-materiali-edit" style="max-height:150px; overflow-y:auto; margin-bottom:10px; border:1px solid #eee; padding:5px; border-radius:6px;">
            ${LISTINO.materialiScocca.map((m, index) => `
                <div class="list-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:12px;">${m.nome}</span>
                    <input type="number" data-type="materiale" data-index="${index}" value="${m.prezzo}" style="width:80px; padding:3px; font-size:12px;">
                </div>
            `).join("")}
        </div>
        <div style="background:#f8f9fa; padding:8px; border-radius:6px; margin-bottom:15px; display:flex; gap:5px;">
            <input type="text" id="add-mat-nome" placeholder="Nome nuovo materiale" style="flex:1; padding:4px; font-size:12px;">
            <input type="number" id="add-mat-prezzo" placeholder="€/mq" style="width:60px; padding:4px; font-size:12px;">
            <button id="btn-add-scocca" style="background:#007bff; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold;">+ Inserisci</button>
        </div>
        
        <h4 style="margin: 15px 0 10px 0; color:#007bff; font-size:14px;">FERRAMENTA (€/Cad)</h4>
        <div class="list-item" style="margin-bottom:4px; font-size:12px;"><span>Perni + Lavorazione Ripiano</span><input type="number" id="edit-ferr-ripiano" value="${LISTINO.ferramentaEAccessori.ripiano}" style="width:80px; padding:3px;"></div>
        <div class="list-item" style="margin-bottom:4px; font-size:12px;"><span>Kit Asta Appendiabito metallo</span><input type="number" id="edit-ferr-asta" value="${LISTINO.ferramentaEAccessori.asta}" style="width:80px; padding:3px;"></div>
        <div class="list-item" style="margin-bottom:4px; font-size:12px;"><span>Cassetto Completo + Guide</span><input type="number" id="edit-ferr-cassetto" value="${LISTINO.ferramentaEAccessori.cassetto}" style="width:80px; padding:3px;"></div>
        <div class="list-item" style="margin-bottom:4px; font-size:12px;"><span>Coppia Cerniere Rallentate</span><input type="number" id="edit-ferr-cerniere" value="${LISTINO.ferramentaEAccessori.cerniereAnat}" style="width:80px; padding:3px;"></div>
        
        <button id="btnSalvaListino" class="btn" style="background:#2ecc71; margin-top:15px; width:100%; font-size:13px; padding:8px;">💾 Salva e Applica Modifiche</button>
    `;

    document.getElementById("btn-add-scocca").addEventListener("click", aggiungiNuovoMaterialeScocca);
    document.getElementById("btnSalvaListino").addEventListener("click", salvaModifichePrezziGenerali);
}

function aggiungiNuovoMaterialeScocca() {
    const nome = document.getElementById("add-mat-nome").value.trim();
    const prezzo = parseFloat(document.getElementById("add-mat-prezzo").value) || 0;
    if (!nome) return;
    const id = "mat_" + Date.now();
    salvaValoriInputTemporanei();
    LISTINO.materialiScocca.push({ id, nome, prezzo });
    popolaSelezioniIniziali();
    renderizzaContenutoModale();
    eseguiRicalcoloGlobal();
}

function salvaValoriInputTemporanei() {
    const inputsMateriali = document.querySelectorAll('#contenutoListino input[data-type="materiale"]');
    inputsMateriali.forEach(input => {
        const idx = parseInt(input.getAttribute('data-index'));
        if (LISTINO.materialiScocca[idx]) LISTINO.materialiScocca[idx].prezzo = parseFloat(input.value) || 0;
    });
}

function salvaModifichePrezziGenerali() {
    salvaValoriInputTemporanei();
    LISTINO.ferramentaEAccessori.ripiano = parseFloat(document.getElementById("edit-ferr-ripiano").value) || 0;
    LISTINO.ferramentaEAccessori.asta = parseFloat(document.getElementById("edit-ferr-asta").value) || 0;
    LISTINO.ferramentaEAccessori.cassetto = parseFloat(document.getElementById("edit-ferr-cassetto").value) || 0;
    LISTINO.ferramentaEAccessori.cerniereAnat = parseFloat(document.getElementById("edit-ferr-cerniere").value) || 0;
    popolaSelezioniIniziali();
    document.getElementById("modalListino").style.display = "none";
    eseguiRicalcoloGlobal();
}

// MOTORE CENTRALE DI RICALCOLO
function eseguiRicalcoloGlobal() {
    const tipo = document.getElementById("tipoCommessa").value;
    const totaleBig = document.getElementById("totale-big");
    const svgElement = document.getElementById("configuratoreSvg");
    const tabellaDettagli = document.getElementById("tabella-dettagli");

    const tariffaOraria = parseFloat(document.getElementById("tariffaOraria").value) || 0;
    const costoBordo = parseFloat(document.getElementById("costoBordo").value) || 0;
    const costoTrasporto = parseFloat(document.getElementById("costoTrasporto").value) || 0;
    
    const idMatScocca = document.getElementById("mat").value;
    const matTrovato = LISTINO.materialiScocca.find(m => m.id === idMatScocca);
    const prezzoMateriale = matTrovato ? matTrovato.prezzo : 0;

    if (tipo === "mobile") {
        const nD = parseInt(document.getElementById("nD").value) || 0;
        const nVani = nD + 1;
        
        // Mappatura completa e distinta di ripiani e cassetti per vano
        const mappaConfigurazioneVani = [];
        
        for (let v = 1; v <= nVani; v++) {
            // Estrazione dati Ripiani del vano
            const qRip = parseInt(document.getElementById(`ripiani-vano-${v}`)?.value) || 0;
            const quoteRipiani = [];
            for (let r = 1; r <= qRip; r++) {
                quoteRipiani.push(parseFloat(document.getElementById(`quota-vano-${v}-rip-${r}`)?.value) || 0);
            }

            // Estrazione dati Cassetti del vano
            const qCas = parseInt(document.getElementById(`cassetti-vano-${v}`)?.value) || 0;
            const quoteCassetti = [];
            for (let c = 1; c <= qCas; r++, c++) {
                quoteCassetti.push(parseFloat(document.getElementById(`quota-vano-${v}-cas-${c}`)?.value) || 0);
            }

            mappaConfigurazioneVani.push({
                vanoIndex: v,
                ripiani: { quantita: qRip, quote: quoteRipiani },
                cassetti: { quantita: qCas, quote: quoteCassetti }
            });
        }

        const paramsMobile = {
            L: parseFloat(document.getElementById("L").value) || 0,
            A: parseFloat(document.getElementById("A").value) || 0,
            P: parseFloat(document.getElementById("P").value) || 0,
            Z: parseFloat(document.getElementById("Z").value) || 0,
            SP: parseFloat(document.getElementById("SP").value) || 0,
            nD,
            mappaConfigurazioneVani,
            tariffaOraria,
            costoBordo,
            prezzoMateriale,
            prezziFerramenta: LISTINO.ferramentaEAccessori
        };

        const risultato = calcolaMobile(paramsMobile);
        const totaleFinale = risultato.totale + costoTrasporto;

        if (totaleBig) totaleBig.innerText = `€ ${totaleFinale.toFixed(2)}`;

        if (tabellaDettagli) {
            tabellaDettagli.innerHTML = `
                <thead>
                    <tr><th>Voce di Costo</th><th style="text-align:right">Quantità</th><th style="text-align:right">Importo</th></tr>
                </thead>
                <tbody>
                    <tr><td>Materiali Struttura ed Elementi</td><td style="text-align:right">${risultato.mqTotali} mq</td><td style="text-align:right">€ ${risultato.costoMateriale}</td></tr>
                    <tr><td>Bordatura Frontale</td><td style="text-align:right">${risultato.metriBordo} m</td><td style="text-align:right">€ ${risultato.costoBordatura}</td></tr>
                    <tr><td>Ferramenta & Guide Cassetto</td><td style="text-align:right">A corpo</td><td style="text-align:right">€ ${risultato.costoFerramenta}</td></tr>
                    <tr><td>Manodopera Laboratorio</td><td style="text-align:right">${risultato.oreLavoro} ore</td><td style="text-align:right">€ ${risultato.costoManodopera}</td></tr>
                    <tr><td>Trasporto e Consegna</td><td style="text-align:right">Fisso</td><td style="text-align:right">€ ${costoTrasporto.toFixed(2)}</td></tr>
                    <tr style="font-weight: bold; background: #2ecc71; color: #2c3e50;">
                        <td style="padding: 10px;">TOTALE PREVENTIVO</td><td></td><td style="text-align:right;">€ ${totaleFinale.toFixed(2)}</td>
                    </tr>
                </tbody>
            `;
        }

        if (svgElement) disegnaMobileSvg(svgElement, paramsMobile);
    }
}
