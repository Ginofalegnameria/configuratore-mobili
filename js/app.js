/**
 * APP.JS - Coordinatore centrale con Gestione Listini dinamici ed elementi interni
 */

import { calcolaMobile, disegnaMobileSvg } from './moduli/mobile.js';

// Stato dinamico del listino (Modificabile dall'utente nella modale)
let LISTINO = {
    materialiScocca: [
        { id: "nobilitato", nome: "Nobilitato Bianco 19mm", prezzo: 25 },
        { id: "multistrato", nome: "Multistrato Pioppo 19mm", prezzo: 45 },
        { id: "mdf", nome: "MDF Grezzo 19mm", prezzo: 30 }
    ],
    ferramentaEAccessori: {
        ripiano: 12.00,       // Costo di supporti + lavorazione a ripiano
        asta: 18.50,          // Costo tubo appendiabito in acciaio cromato flangiato
        cassetto: 45.00,      // Costo guide ammortizzate + sponde cassetto
        cerniereAnat: 15.00   // Costo coppia di cerniere rallentate ad anta
    }
};

document.addEventListener("DOMContentLoaded", () => {
    popolaSelezioniIniziali();
    agganciaEventi();
    cambiaTipoCommessa();
});

function popolaSelezioniIniziali() {
    const selectMat = document.getElementById("mat");
    if (selectMat) {
        selectMat.innerHTML = LISTINO.materialiScocca
            .map(m => `<option value="${m.id}">${m.nome} (€${m.prezzo}/mq)</option>`)
            .join("");
    }
}

function agganciaEventi() {
    document.getElementById("tipoCommessa").addEventListener("change", cambiaTipoCommessa);

    // Eventi di ascolto globali (inclusi i nuovi elementi interni del cabinet)
    ["nomeCliente", "mat", "tariffaOraria", "costoBordo", "costoTrasporto"].forEach(id => {
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

// COSTRUZIONE E GESTIONE INTERATTIVA DELLA FINESTRA MODALE LISTINO
function gestisciModalListino(apri) {
    const modal = document.getElementById("modalListino");
    if (!apri) {
        modal.style.display = "none";
        return;
    }

    // Generiamo l'interfaccia degli input editabili dentro la modale
    const contenitore = document.getElementById("contenutoListino");
    if (contenitore) {
        contenitore.innerHTML = `
            <h4>Materiali Scocca (€/mq)</h4>
            ${LISTINO.materialiScocca.map((m, index) => `
                <div class="list-item" style="margin-bottom:8px;">
                    <span>${m.nome}</span>
                    <input type="number" data-type="materiale" data-index="${index}" value="${m.prezzo}" style="width:100px; padding:4px;">
                </div>
            `).join("")}
            
            <h4 style="margin-top:20px;">Ferramenta & Componenti (€/Cad)</h4>
            <div class="list-item" style="margin-bottom:8px;">
                <span>Lavorazione + Perni Ripiano</span>
                <input type="number" id="edit-ferr-ripiano" value="${LISTINO.ferramentaEAccessori.ripiano}" style="width:100px; padding:4px;">
            </div>
            <div class="list-item" style="margin-bottom:8px;">
                <span>Kit Asta Appendiabito metallo</span>
                <input type="number" id="edit-ferr-asta" value="${LISTINO.ferramentaEAccessori.asta}" style="width:100px; padding:4px;">
            </div>
            <div class="list-item" style="margin-bottom:8px;">
                <span>Cassetto Assemblato + Guide Blum</span>
                <input type="number" id="edit-ferr-cassetto" value="${LISTINO.ferramentaEAccessori.cassetto}" style="width:100px; padding:4px;">
            </div>
            <div class="list-item" style="margin-bottom:8px;">
                <span>Coppia Cerniere Ammortizzate</span>
                <input type="number" id="edit-ferr-cerniere" value="${LISTINO.ferramentaEAccessori.cerniereAnat}" style="width:100px; padding:4px;">
            </div>
            <button id="btnSalvaListino" class="btn" style="background:#2ecc71; margin-top:15px; width:100%">💾 Salva Listino</button>
        `;

        // Agganciamo il pulsante di salvataggio interno alla modale
        document.getElementById("btnSalvaListino").addEventListener("click", salvaNuovoListino);
    }
    modal.style.display = "flex";
}

function salvaNuovoListino() {
    // 1. Salva i prezzi aggiornati dei materiali scocca
    const inputsMateriali = document.querySelectorAll('#contenutoListino input[data-type="materiale"]');
    inputsMateriali.forEach(input => {
        const idx = parseInt(input.getAttribute('data-index'));
        LISTINO.materialiScocca[idx].prezzo = parseFloat(input.value) || 0;
    });

    // 2. Salva la ferramenta interna
    LISTINO.ferramentaEAccessori.ripiano = parseFloat(document.getElementById("edit-ferr-ripiano").value) || 0;
    LISTINO.ferramentaEAccessori.asta = parseFloat(document.getElementById("edit-ferr-asta").value) || 0;
    LISTINO.ferramentaEAccessori.cassetto = parseFloat(document.getElementById("edit-ferr-cassetto").value) || 0;
    LISTINO.ferramentaEAccessori.cerniereAnat = parseFloat(document.getElementById("edit-ferr-cerniere").value) || 0;

    // Rinfresca i selettori grafici, chiudi e ricalcola
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
