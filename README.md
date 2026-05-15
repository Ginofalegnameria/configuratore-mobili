# 🪚 Configuratore Falegnameria Pro

Un'applicazione web modulare e reattiva progettata per i professionisti della lavorazione del legno. Permette di calcolare preventivi dettagliati, liste di taglio e anteprime grafiche in tempo reale per diverse tipologie di commesse.

## 📁 Struttura del Progetto

Il codice è organizzato in modo modulare per garantire una facile manutenzione e scalabilità su GitHub:

*   `index.html` - La struttura e l'interfaccia utente dell'applicazione.
*   `css/`
    *   `style.css` - Stili grafici globali, layout a griglia e regole per la stampa dei preventivi.
*   `js/`
    *   `app.js` - Il motore centrale dell'applicazione che gestisce l'inizializzazione, il recupero dei dati e il coordinamento dei moduli.

## 🚀 Funzionalità Principali

*   **Gestione Multi-Commessa:** Supporto integrato per Cabinet/Mobili standard, Telai con sportelli laccati e Paretine a listelli verticali.
*   **Listino Prezzi Dinamico:** Calcolo dei costi basato sulla selezione in tempo reale dei materiali per scocche e ante.
*   **Anteprima SVG:** Generazione immediata del disegno tecnico del manufatto in base alle dimensioni inserite.
*   **Layout pronti per la Stampa:** Stili CSS dedicati per generare una *Stampa Tecnica* (con lista tagli per il laboratorio) o una *Stampa Cliente* (con il solo riepilogo economico).

## 🛠️ Tecniche Utilizzate

*   HTML5 & CSS3 (Grid e Flexbox per layout responsivi)
*   JavaScript Moderno (ES6 modules ed Event Listeners nativi)
*   Grafica Vettoriale SVG per i disegni tecnici

