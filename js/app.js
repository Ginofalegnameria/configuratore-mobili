/**
 * APP.JS - Inizializzatore centrale e coordinatore dei moduli
 */

// IMPORTAZIONE DEI MODULI SPECIFICI
import { calcolaMobile, disegnaMobileSvg } from './moduli/mobile.js';

// Stato globale dell'applicazione (Listino prezzi di riferimento)
const LISTINO_DEFAULT = {
    materialiScocca: [
        { id: "nobilitato", nome: "Nobilitato Bianco 19mm", prezzo: 25 },
        { id: "multistrato", nome: "Multistrato Pioppo 19mm", prezzo: 45 },
        { id: "mdf", nome: "MDF Grezzo 19mm", prezzo: 30 }
    ],
    modelliAnta: [
        { id: "liscia", nome: "Anta Liscia Nobilitato", prezzo: 40 },
        { id: "telaio", nome: "Anta a Telaio Laccata", prezzo: 85 },
        { id: "gola", nome: "Anta con Profilo Gola", prezzo: 60 }
    ]
};

// Inizializzazione all'avvio della pagina
document.addEventListener("DOMContentLoaded", () => {
    popolaSelezioniIniziali();
    agganciaEventi();
    cambiaTipoCommessa(); // Attiva la configurazione di default
});

// Popola i menu a tendina dei materiali con i dati del listino
function popolaSelezioniIniziali() {
    const selectMat = document.getElementById("mat");
    const selectMatAnta = document.getElementById("matAnta");

    if (selectMat) {
        selectMat.innerHTML = LISTINO_DEFAULT.materialiScocca
            .map(m => `<option value="${m.id}">${m.nome} (€${m.prezzo}/mq)</option>`)
            .join("");
    }
    if (selectMatAnta) {
        selectMatAnta.innerHTML = LISTINO_DEFAULT.modelliAnta
            .map(a => `<option value="${a.id}">${a.nome} (€${a.prezzo}/mq)</option>`)
            .join("");
    }
}

// Aggancia i listener di evento agli elementi dell'interfaccia
function agganciaEventi() {
    document.getElementById("tipoCommessa").addEventListener("change", cambiaTipoCommessa);

    // Eventi di aggiornamento immediato su tutti i campi di testo e numeri generali
    ["nomeCliente", "mat", "matAnta", "tariffaOraria", "costoBordo", "costoTrasporto"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", eseguiRicalcoloGlobal);
    });

    // Eventi di aggiornamento sui parametri dimensionali del Cabinet
    ["L", "A", "P", "Z", "SP", "nD"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", eseguiRicalcoloGlobal);
    });

    // Pulsanti di servizio e finestre modali
    document.getElementById("btnListino").addEventListener("click", () => gestisciModalListino(true));
    document.getElementById("btnChiudiModal").addEventListener("click", () => gestisciModalListino(false));
    document.getElementById("btnPrintTech").addEventListener("click", () => stampaConfiguratore("tech"));
    document.getElementById("btnPrintClient").addEventListener("click", () => stampaConfiguratore("client"));
}

// Mostra o nasconde i blocchi di input in base alla commessa selezionata
function cambiaTipoCommessa() {
    const tipo = document.getElementById("tipoCommessa").value;
    
    // Nascondi tutte le schede
    document.getElementById("blocco-inputs-mobile").style.display = "none";
    document.getElementById("contVani").style.display = "none";
    document.getElementById("blocco-inputs-telaio").style.display = "none";
    document.getElementById("blocco-inputs-paretina").style.display = "none";

    // Mostra solo la scheda attiva
    if (tipo === "mobile") {
        document.getElementById("blocco-inputs-mobile").style.display = "block";
        document.getElementById("contVani").style.display = "block";
    } else if (tipo === "telaio") {
        document.getElementById("blocco-inputs-telaio").style.display = "block";
    } else if (tipo === "paretina") {
        document.getElementById("blocco-inputs-paretina").style.display = "block";
    }
    
    eseguiRicalcoloGlobal();
}

// Funzione di stampa con assegnazione classe al body
function stampaConfiguratore(tipo) {
    document.body.classList.remove("print-tech", "print-client");
    document.body.classList.add(`print-${tipo}`);
    window.print();
}

// Apertura/Chiusura modale listino
function gestisciModalListino(apri) {
    document.getElementById("modalListino").style.display = apri ? "flex" : "none";
}

// MOTORE CENTRALE DI RICALCOLO
function eseguiRicalcoloGlobal() {
    const tipo = document.getElementById("tipoCommessa").value;
    const totaleBig = document.getElementById("totale-big");
    const svgElement = document.getElementById("configuratoreSvg");

    // 1. Recupero parametri economici comuni
    const tariffaOraria = parseFloat(document.getElementById("tariffaOraria").value) || 0;
    const costoBordo = parseFloat(document.getElementById("costoBordo").value) || 0;
    const costoTrasporto = parseFloat(document.getElementById("costoTrasporto").value) || 0;
    
    // Recupero il prezzo al mq del materiale scocca selezionato
    const idMatScocca = document.getElementById("mat").value;
    const matTrovato = LISTINO_DEFAULT.materialiScocca.find(m => m.id === idMatScocca);
    const prezzoMateriale = matTrovato ? matTrovato.prezzo : 0;

    // 2. Esecuzione dei calcoli in base al modulo selezionato
    if (tipo === "mobile") {
        const paramsMobile = {
            L: parseFloat(document.getElementById("L").value) || 0,
            A: parseFloat(document.getElementById("A").value) || 0,
            P: parseFloat(document.getElementById("P").value) || 0,
            Z: parseFloat(document.getElementById("Z").value) || 0,
            SP: parseFloat(document.getElementById("SP").value) || 0,
            tariffaOraria,
            costoBordo,
            prezzoMateriale
        };

        // Esegui calcoli metrici e finanziari dal modulo mobile.js
        const risultato = calcolaMobile(paramsMobile);
        
        // Sommiamo il costo fisso di trasporto/trasferta al totale del mobile
        const totaleFinale = risultato.totale + costoTrasporto;

        // Aggiorna l'interfaccia visiva con il prezzo finale
        if (totaleBig) {
            totaleBig.innerText = `€ ${totaleFinale.toFixed(2)}`;
        }

        // Rigenera il disegno tecnico SVG
        if (svgElement) {
            disegnaMobileSvg(svgElement, paramsMobile);
        }
    } else {
        // Avviso temporaneo per i moduli non ancora collegati
        if (totaleBig) {
            totaleBig.innerText = "Modulo in costruzione...";
        }
        if (svgElement) {
            svgElement.innerHTML = `<rect x="0" y="0" width="800" height="400" fill="#f9f9f9" stroke="#eee"/>
            <text x="400" y="200" text-anchor="middle" font-family="sans-serif" fill="#999">Nessun disegno disponibile</text>`;
        }
    }
}
