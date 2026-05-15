/**
 * APP.JS - Coordinatore centrale con aggiunta dinamica di materiali e ante nel listino
 */

import { calcolaMobile, disegnaMobileSvg } from './moduli/mobile.js';

// Stato dinamico del listino (Iniziale)
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

// Popola i menu a tendina preservando la selezione utente corrente se possibile
function popolaSelezioniIniziali() {
    const selectMat = document.getElementById("mat");
    const selectMatAnta = document.getElementById("matAnta");
    
    const valoreSelezionatoMat = selectMat ? selectMat.value : "";
    const valoreSelezionatoAnta = selectMatAnta ? selectMatAnta.value : "";

    if (selectMat) {
        selectMat.innerHTML = LISTINO.materialiScocca
            .map(m => `<option value="${m.id}">${m.nome} (€${m.prezzo}/mq)</option>`)
            .join("");
        if (valoreSelezionatoMat && selectMat.querySelector(`option[value="${valoreSelezionatoMat}"]`)) {
            selectMat.value = valoreSelezionatoMat;
        }
    }

    if (selectMatAnta) {
        selectMatAnta.innerHTML = LISTINO.modelliAnta
            .map(a => `<option value="${a.id}">${a.nome} (€${a.prezzo}/mq)</option>`)
            .join("");
        if (valoreSelezionatoAnta && selectMatAnta.querySelector(`option[value="${valoreSelezionatoAnta}"]`)) {
            selectMatAnta.value = valoreSelezionatoAnta;
        }
    }
}

function agganciaEventi() {
    document.getElementById("tipoCommessa").addEventListener("change", cambiaTipoCommessa);

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

// COSTRUZIONE INTERFACCIA MODALE CON AGGIUNTA NUOVI ELEMENTI
function gestisciModalListino(apri) {
    const modal = document.getElementById("modalListino");
    if (!apri) {
        modal.style.display = "none";
        return;
    }

    const contenitore = document.getElementById("contenutoListino");
    if (contenitore) {
        contenitore.innerHTML = `
            <!-- SEZIONE MATERIALI SCOCCA -->
            <h4 style="margin-bottom:10px; color:#007bff;">Materiali Scocca (€/mq)</h4>
            <div id="lista-materiali-edit">
                ${LISTINO.materialiScocca.map((m, index) => `
                    <div class="list-item" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                        <span>${m.nome}</span>
                        <input type="number" data-type="materiale" data-index="${index}" value="${m.prezzo}" style="width:100px; padding:4px;">
                    </div>
                `).join("")}
            </div>
            <!-- Form rapido per inserire un nuovo materiale -->
            <div style="background:#f1f2f6; padding:10px; border-radius:6px; margin-bottom:20px; display:flex; gap:5px;">
                <input type="text" id="nuovo-mat-nome" placeholder="Es. Rovere Impiallacciato" style="flex:1; padding:4px; font-size:12px;">
                <input type="number" id="nuovo-mat-prezzo" placeholder="€/mq" style="width:70px; padding:4px; font-size:12px;">
                <button id="btn-add-materiale" style="background:#007bff; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px;">+ Aggiungi</button>
            </div>
            
            <!-- SEZIONE MODELLI ANTA -->
            <h4 style="margin-bottom:10px; color:#007bff;">Modelli Anta (€/mq)</h4>
            <div id="lista-ante-edit">
                ${LISTINO.modelliAnta.map((a, index) => `
                    <div class="list-item" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                        <span>${a.nome}</span>
                        <input type="number" data-type="anta" data-index="${index}" value="${a.prezzo}" style="width:100px; padding:4px;">
                    </div>
                `).join("")}
            </div>
            <!-- Form rapido per inserire una nuova anta -->
            <div style="background:#f1f2f6; padding:10px; border-radius:6px; margin-bottom:20px; display:flex; gap:5px;">
                <input type="text" id="nuova-anta-nome" placeholder="Es. Anta Fresata Gola" style="flex:1; padding:4px; font-size:12px;">
                <input type="number" id="nuova-anta-prezzo" placeholder="€/mq" style="width:70px; padding:4px; font-size:12px;">
                <button id="btn-add-anta" style="background:#007bff; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px;">+ Aggiungi</button>
            </div>

            <!-- SEZIONE FERRAMENTA -->
            <h4 style="margin-bottom:10px; color:#007bff;">Ferramenta & Componenti (€/Cad)</h4>
            <div class="list-item" style="margin-bottom:8px;"><span>Lavorazione + Perni Ripiano</span><input type="number" id="edit-ferr-ripiano" value="${LISTINO.ferramentaEAccessori.ripiano}" style="width:100px; padding:4px;"></div>
            <div class="list-item" style="margin-bottom:8px;"><span>Kit Asta Appendiabito metallo</span><input type="number" id="edit-ferr-asta" value="${LISTINO.ferramentaEAccessori.asta}" style="width:100px; padding:4px;"></div>
            <div class="list-item" style="margin-bottom:8px;"><span>Cassetto Assemblato + Guide Blum</span><input type="number" id="edit-ferr-cassetto" value="${LISTINO.ferramentaEAccessori.cassetto}" style="width:100px; padding:4px;"></div>
            <div class="list-item" style="margin-bottom:8px;"><span>Coppia Cerniere Ammortizzate</span><input type="number" id="edit-ferr-cerniere" value="${LISTINO.ferramentaEAccessori.cerniereAnat}" style="width:100px; padding:4px;"></div>
            
            <button id="btnSalvaListino" class="btn" style="background:#2ecc71; margin-top:15px; width:100%">💾 Salva Modifiche Prezzi</button>
        `;

        // Associazione eventi ai bottoni di aggiunta immediata
        document.getElementById("btn-add-materiale").addEventListener("click", aggiungiMaterialeAStato);
        document.getElementById("btn-add-anta").addEventListener("click", aggiungiAntaAStato);
        document.getElementById("btnSalvaListino").addEventListener("click", salvaNuovoListino);
    }
    modal.style.display = "flex";
}

// Funzione per inserire al volo un nuovo materiale nello stato
function aggiungiMaterialeAStato() {
    const nome = document.getElementById("nuovo-mat-nome").value.trim();
    const prezzo = parseFloat(document.getElementById("nuovo-mat-prezzo").value) || 0;
    
    if (nome === "") { alert("Inserisci un nome valido per il materiale"); return; }
    
    // Genera un ID basato sul nome, rimuovendo spazi
    const id = nome.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    LISTINO.materialiScocca.push({ id, nome, prezzo });
    popolaSelezioniIniziali();
    gestisciModalListino(true); // Ridibuja la modale per mostrare la nuova riga inserita
    eseguiRicalcoloGlobal();
}

// Funzione per inserire al volo una nuova anta nello stato
function aggiungiAntaAStato() {
    const nome = document.getElementById("nuova-anta-nome").value.trim();
    const prezzo = parseFloat(document.getElementById("nuova-anta-prezzo").value) || 0;
    
    if (nome === "") { alert("Inserisci un nome valido per il modello anta"); return; }
    
    const id = nome.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    LISTINO.modelliAnta.push({ id, nome, prezzo });
    popolaSelezioniIniziali();
    gestisciModalListino(true); 
    eseguiRicalcoloGlobal();
}

function salvaNuovoListino() {
    const inputsMateriali = document.querySelectorAll('#contenutoListino input[data-type="materiale"]');
    inputsMateriali.forEach(input => {
        const idx = parseInt(input.getAttribute('data-index'));
        if(LISTINO.materialiScocca[idx]) LISTINO.materialiScocca[idx].prezzo = parseFloat(input.value) || 0;
    });

    const inputsAnte = document.querySelectorAll('#contenutoListino input[data-type="anta"]');
    inputsAnte.forEach(input => {
        const idx = parseInt(input.getAttribute('data-index'));
        if(LISTINO.modelliAnta[idx]) LISTINO.modelliAnta[idx].prezzo = parseFloat(input.value) || 0;
    });

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

    // Recupero il prezzo al mq del modello anta selezionato
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
            prezzoAnta, // Passato correttamente per il calcolo differenziato
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
