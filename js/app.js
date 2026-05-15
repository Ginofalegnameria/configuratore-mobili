/**
 * APP.JS - Inizializzatore centrale del configuratore
 */

// Stato globale dell'applicazione (Listino prezzi temporaneo di esempio)
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

// Funzione di inizializzazione all'avvio della pagina
document.addEventListener("DOMContentLoaded", () => {
    popolaSelezioniIniziali();
    agganciaEventi();
    cambiaTipoCommessa(); // Mostra la scheda corretta all'avvio
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

// Aggancia i listener di evento agli elementi dell'interfaccia senza usare JS in linea
function agganciaEventi() {
    // Cambio tipologia commessa
    document.getElementById("tipoCommessa").addEventListener("change", cambiaTipoCommessa);

    // Eventi di aggiornamento calcoli su input generali
    ["nomeCliente", "mat", "matAnta", "tariffaOraria", "costoBordo", "costoTrasporto"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", eseguiRicalcoloGlebal);
    });

    // Eventi di aggiornamento sui parametri del Cabinet
    ["L", "A", "P", "Z", "SP"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", eseguiRicalcoloGlebal);
    });
    
    const nD = document.getElementById("nD");
    if (nD) nD.addEventListener("input", gestisciCambioDivisori);

    // Gestione finestre modali e stampe
    document.getElementById("btnListino").addEventListener("click", () => gestisciModalListino(true));
    document.getElementById("btnChiudiModal").addEventListener("click", () => gestisciModalListino(false));
    document.getElementById("btnPrintTech").addEventListener("click", () => stampaConfiguratore("tech"));
    document.getElementById("btnPrintClient").addEventListener("click", () => stampaConfiguratore("client"));
}

// Mostra o nasconde i blocchi di input in base alla commessa selezionata
function cambiaTipoCommessa() {
    const tipo = document.getElementById("tipoCommessa").value;
    
    // Nascondi tutti i blocchi specifici
    document.getElementById("blocco-inputs-mobile").style.display = "none";
    document.getElementById("contVani").style.display = "none";
    document.getElementById("blocco-inputs-telaio").style.display = "none";
    document.getElementById("blocco-inputs-paretina").style.display = "none";

    // Mostra solo quello selezionato
    if (tipo === "mobile") {
        document.getElementById("blocco-inputs-mobile").style.display = "block";
        document.getElementById("contVani").style.display = "block";
    } else if (tipo === "telaio") {
        document.getElementById("blocco-inputs-telaio").style.display = "block";
    } else if (tipo === "paretina") {
        document.getElementById("blocco-inputs-paretina").style.display = "block";
    }
    
    eseguiRicalcoloGlebal();
}

// Gestore temporaneo per il cambio dei divisori del Cabinet
function gestisciCambioDivisori() {
    console.log("Inizializzazione vani dinamici...");
    eseguiRicalcoloGlebal();
}

// Gestore apertura/chiusura modale listino
function gestisciModalListino(apri) {
    document.getElementById("modalListino").style.display = apri ? "flex" : "none";
}

// Funzione di stampa con assegnazione classe al body
function stampaConfiguratore(tipo) {
    document.body.classList.remove("print-tech", "print-client");
    document.body.classList.add(`print-${tipo}`);
    window.print();
}

// Funzione centrale di ricalcolo (verrà espansa con i moduli dedicati)
function eseguiRicalcoloGlebal() {
    const tipo = document.getElementById("tipoCommessa").value;
    const totaleBig = document.getElementById("totale-big");
    
    if (totaleBig) {
        totaleBig.innerText = `Calcolo in corso per ${tipo}...`;
    }
}
