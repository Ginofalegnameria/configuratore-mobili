/**
 * APP.JS - Coordinatore centrale con aggiunta dinamica e persistente di materiali e ante
 */

import { calcolaMobile, disegnaMobileSvg } from './moduli/mobile.js';

// Stato dinamico del listino (Struttura dati fissa manipolabile)
let LISTINO = {
    materialiScocca: [
        { id: "nobilitato", nome: "Nobilitato Bianco 19mm", prezzo: 25 },
        { id: "multistrato", nome: "Multistrato Pioppo 19mm", prezzo: 45 },
        { id: "mdf", nome: "MDF Grezzo 19mm", prezzo: 30 }
    ],
    modelliAnta: [
        { id: "liscia", nome: "Anta Liscia Nobilitato", prezzo: 40 },
        { id: "telaio", nome: "Anta a Telaio Laccata", prezzo: 85 }
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

// Sincronizza i menu a tendina principali della pagina con la lista dei materiali presenti
function popolaSelezioniIniziali() {
    const selectMat = document.getElementById("mat");
    const selectMatAnta = document.getElementById("matAnta");
    
    // Salva il valore correntemente selezionato per non azzerarlo durante il rinfresco
    const vecchioMat = selectMat ? selectMat.value : "";
    const vecchiaAnta = selectMatAnta ? selectMatAnta.value : "";

    if (selectMat) {
        selectMat.innerHTML = LISTINO.materialiScocca
            .map(m => `<option value="${m.id}">${m.nome} (€${m.prezzo}/mq)</option>`)
            .join("");
        if (vecchioMat) selectMat.value = vecchioMat;
    }

    if (selectMatAnta) {
        selectMatAnta.innerHTML = LISTINO.modelliAnta
            .map(a => `<option value="${a.id}">${a.nome} (€${a.prezzo}/mq)</option>`)
            .join("");
        if (vecchiaAnta) selectMatAnta.value = vecchiaAnta;
    }
}

function agganciaEventi() {
    document.getElementById("tipoCommessa").addEventListener("change", cambiaTipoCommessa);

    // Listener per ricalcoli immediati
    ["nomeCliente", "mat", "matAnta", "tariffaOraria", "costoBordo", "costoTrasporto"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", eseguiRicalcoloGlobal);
    });

    ["L", "A", "P", "Z", "SP", "nD", "nRipiani", "nAste", "nCassetti", "nAnte"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", eseguiRicalcoloGlobal);
    });

    document.getElementById("btnListino").addEventListener("click", () => gestisciModalListino(true));
    document.getElementById("btnChiudiModal").addEventListener("click", () => gestisciModalListino(false));
    document.getElementById("btnPrintTech").addEventListener("click", () => stampaConfiguratore("tech"));
    document.getElementById("btnPrintClient").addEventListener("click", () => stampaConfiguratore("client"));
}

function cambiaTipoCommessa() {
    const tipo = document.getElementById("tipoCommessa").value;
    document.getElementById("blocco-inputs-mobile").style.display = tipo === "mobile" ? "block" : "none";
    document.getElementById("contVani").style.display = tipo === "mobile" ? "block" : "none";
    document.getElementById("blocco-inputs-telaio").style.display = tipo === "telaio" ? "block" : "none";
    document.getElementById("blocco-inputs-paretina").style.display = tipo === "paretina" ? "block" : "none";
    
    eseguiRicalcoloGlobal();
}

function stampaConfiguratore(tipo) {
    document.body.className = `print-${tipo}`;
    window.print();
}

// COSTRUZIONE E APERTURA MODALE LISTINO
function gestisciModalListino(apri) {
    const modal = document.getElementById("modalListino");
    if (!apri) {
        modal.style.display = "none";
        return;
    }

    renderizzaContenutoModale();
    modal.style.display = "flex";
}

// Disegna dinamicamente le righe della modale leggendo lo stato di LISTINO corrente
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
        <!-- Inserimento rapido scocca -->
        <div style="background:#f8f9fa; padding:8px; border-radius:6px; margin-bottom:15px; display:flex; gap:5px;">
            <input type="text" id="add-mat-nome" placeholder="Nome nuovo materiale scocca" style="flex:1; padding:4px; font-size:12px;">
            <input type="number" id="add-mat-prezzo" placeholder="€/mq" style="width:60px; padding:4px; font-size:12px;">
            <button id="btn-add-scocca" style="background:#007bff; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold;">+ Inserisci</button>
        </div>
        
        <h4 style="margin: 15px 0 10px 0; color:#007bff; font-size:14px;">MODELLI ANTA (€/mq)</h4>
        <div id="lista-ante-edit" style="max-height:150px; overflow-y:auto; margin-bottom:10px; border:1px solid #eee; padding:5px; border-radius:6px;">
            ${LISTINO.modelliAnta.map((a, index) => `
                <div class="list-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:12px;">${a.nome}</span>
                    <input type="number" data-type="anta" data-index="${index}" value="${a.prezzo}" style="width:80px; padding:3px; font-size:12px;">
                </div>
            `).join("")}
        </div>
        <!-- Inserimento rapido anta -->
        <div style="background:#f8f9fa; padding:8px; border-radius:6px; margin-bottom:15px; display:flex; gap:5px;">
            <input type="text" id="add-anta-nome" placeholder="Nome nuovo modello anta" style="flex:1; padding:4px; font-size:12px;">
            <input type="number" id="add-anta-prezzo" placeholder="€/mq" style="width:60px; padding:4px; font-size:12px;">
            <button id="btn-add-sportello" style="background:#007bff; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold;">+ Inserisci</button>
        </div>

        <h4 style="margin: 15px 0 10px 0; color:#007bff; font-size:14px;">FERRAMENTA (€/Cad)</h4>
        <div class="list-item" style="margin-bottom:4px; font-size:12px;"><span>Perni + Lavorazione Ripiano</span><input type="number" id="edit-ferr-ripiano" value="${LISTINO.ferramentaEAccessori.ripiano}" style="width:80px; padding:3px;"></div>
        <div class="list-item" style="margin-bottom:4px; font-size:12px;"><span>Kit Asta Appendiabito metallo</span><input type="number" id="edit-ferr-asta" value="${LISTINO.ferramentaEAccessori.asta}" style="width:80px; padding:3px;"></div>
        <div class="list-item" style="margin-bottom:4px; font-size:12px;"><span>Cassetto Completo + Guide</span><input type="number" id="edit-ferr-cassetto" value="${LISTINO.ferramentaEAccessori.cassetto}" style="width:80px; padding:3px;"></div>
        <div class="list-item" style="margin-bottom:4px; font-size:12px;"><span>Coppia Cerniere Rallentate</span><input type="number" id="edit-ferr-cerniere" value="${LISTINO.ferramentaEAccessori.cerniereAnat}" style="width:80px; padding:3px;"></div>
        
        <button id="btnSalvaListino" class="btn" style="background:#2ecc71; margin-top:15px; width:100%; font-size:13px; padding:8px;">💾 Salva e Applica Modifiche</button>
    `;

    // Riapplica i listener per le funzioni di inserimento
    document.getElementById("btn-add-scocca").addEventListener("click", aggiungiNuovoMaterialeScocca);
    document.getElementById("btn-add-sportello").addEventListener("click", aggiungiNuovoModelloAnta);
    document.getElementById("btnSalvaListino").addEventListener("click", salvaModifichePrezziGenerali);
}

function aggiungiNuovoMaterialeScocca() {
    const nome = document.getElementById("add-mat-nome").value.trim();
    const prezzo = parseFloat(document.getElementById("add-mat-prezzo").value) || 0;

    if (!nome) { alert("Specifica il nome del materiale scocca"); return; }
    const id = "mat_" + Date.now(); // Genera un ID univoco sicuro temporaneo

    // Sincronizza prima i valori numerici modificati a schermo per non perderli
    salvaValoriInputTemporanei();

    // Aggiungi il nuovo elemento in coda all'array
    LISTINO.materialiScocca.push({ id, nome, prezzo });
    
    // Rigenera sia l'interfaccia di sfondo che il corpo della modale aperta
    popolaSelezioniIniziali();
    renderizzaContenutoModale();
    eseguiRicalcoloGlobal();
}

function aggiungiNuovoModelloAnta() {
    const nome = document.getElementById("add-anta-nome").value.trim();
    const prezzo = parseFloat(document.getElementById("add-anta-prezzo").value) || 0;

    if (!nome) { alert("Specifica il nome del modello anta"); return; }
    const id = "anta_" + Date.now();

    salvaValoriInputTemporanei();

    LISTINO.modelliAnta.push({ id, nome, prezzo });
    
    popolaSelezioniIniziali();
    renderizzaContenutoModale();
    eseguiRicalcoloGlobal();
}

// Legge i campi numerici inseriti a schermo nella modale per non perderli quando aggiungi righe
function salvaValoriInputTemporanei() {
    const inputsMateriali = document.querySelectorAll('#contenutoListino input[data-type="materiale"]');
    inputsMateriali.forEach(input => {
        const idx = parseInt(input.getAttribute('data-index'));
        if (LISTINO.materialiScocca[idx]) LISTINO.materialiScocca[idx].prezzo = parseFloat(input.value) || 0;
    });

    const inputsAnte = document.querySelectorAll('#contenutoListino input[data-type="anta"]');
    inputsAnte.forEach(input => {
        const idx = parseInt(input.getAttribute('data-index'));
        if (LISTINO.modelliAnta[idx]) LISTINO.modelliAnta[idx].prezzo = parseFloat(input.value) || 0;
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

// MOTORE CENTRALE DI RICALCOLO COMPLESSIVO
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

    const idMatAnta = document.getElementById("matAnta").value;
    const antaTrovata = LISTINO.modelliAnta.find(a => a.id === idMatAnta);
    const prezzoAnta = antaTrovata ? antaTrovata.prezzo : 0;

    if (tipo === "mobile") {
        const paramsMobile = {
            L: parseFloat(document.getElementById("L").value) || 0,
            A: parseFloat(document.getElementById("A").value) || 0,
            P: parseFloat(document.getElementById("P").value) || 0,
            Z: parseFloat(document.getElementById("Z").value) || 0,
            SP: parseFloat(document.getElementById("SP").value) || 0,
            nD: parseInt(document.getElementById("nD").value) || 0,
            nRipiani: parseInt(document.getElementById("nRipiani").value) || 0,
            nAste: parseInt(document.getElementById("nAste").value) || 0,
            nCassetti: parseInt(document.getElementById("nCassetti").value) || 0,
            nAnte: parseInt(document.getElementById("nAnte").value) || 0,
            tariffaOraria,
            costoBordo,
            prezzoMateriale,
            prezzoAnta,
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
                    <tr><td>Materiali Lavorati (Scocca+Interni)</td><td style="text-align:right">${risultato.mqTotali} mq</td><td style="text-align:right">€ ${risultato.costoMateriale}</td></tr>
                    <tr><td>Bordatura Frontale</td><td style="text-align:right">${risultato.metriBordo} m</td><td style="text-align:right">€ ${risultato.costoBordatura}</td></tr>
                    <tr><td>Ferramenta & Kit Accessori</td><td style="text-align:right">A corpo</td><td style="text-align:right">€ ${risultato.costoFerramenta}</td></tr>
                    <tr><td>Manodopera Laboratorio</td><td style="text-align:right">${risultato.oreLavoro} ore</td><td style="text-align:right">€ ${risultato.costoManodopera}</td></tr>
                    <tr><td>Trasporto e Consegna</td><td style="text-align:right">Fisso</td><td style="text-align:right">€ ${costoTrasporto.toFixed(2)}</td></tr>
                    <tr style="font-weight: bold; background: #2ecc71; color: #2c3e50;">
                        <td style="padding: 10px;">TOTALE PREVENTIVO</td><td></td><td style="text-align:right;">€ ${totaleFinale.toFixed(2)}</td>
                    </tr>
                </tbody>
            `;
        }

        if (svgElement) disegnaMobileSvg(svgElement, paramsMobile);
    } else {
        if (totaleBig) totaleBig.innerText = "Modulo in costruzione...";
        if (tabellaDettagli) tabellaDettagli.innerHTML = "";
    }
}
