/**
 * MOBILE.JS - Modulo avanzato per Cabinet con accessori interni
 */

export function calcolaMobile(params) {
    const { 
        L, A, P, Z, SP, nD, nRipiani, nAste, nCassetti, nAnte,
        tariffaOraria, costoBordo, prezzoMateriale, prezziFerramenta 
    } = params;

    const altTotaleM = A / 1000;
    const profM = P / 1000;
    const larghInternaM = (L - (2 * SP)) / 1000;

    // 1. CALCOLO SCOCCA BASE
    const mqFianchi = 2 * (altTotaleM * profM);
    const mqCappello = (L / 1000) * profM;
    const mqFondo = larghInternaM * profM;
    const altDivisoreM = (A - Z - (2 * SP)) / 1000;
    const mqDivisori = nD * (altDivisoreM * profM);
    const mqSchienale = (L / 1000) * altTotaleM;

    // 2. CALCOLO METRAGGIO RIPIANI E ANTE (Aggiunta materiale)
    // Larghezza indicativa di un vano interno per il calcolo dei ripiani
    const larghVanoM = (larghInternaM - (nD * (SP / 1000))) / (nD + 1);
    const mqRipiani = nRipiani * (larghVanoM * profM);
    
    // Superficie totale delle ante esterne
    const mqAnte = nAnte * ((larghInternaM / (nAnte || 1)) * altDivisoreM);

    const mqTotali = mqFianchi + mqCappello + mqFondo + mqDivisori + mqSchienale + mqRipiani + mqAnte;
    const costoMateriale = mqTotali * prezzoMateriale;

    // 3. SVILUPPO BORDI
    // Bordiamo anche il fronte dei ripiani e il perimetro delle ante
    const metriBordoScocca = (2 * altTotaleM) + (L / 1000) + (nD * altDivisoreM) + larghInternaM;
    const metriBordoRipiani = nRipiani * larghVanoM;
    const metriBordoAnte = nAnte > 0 ? mqAnte * 4 : 0; // Approssimazione perimetro ante
    const metriBordo = metriBordoScocca + metriBordoRipiani + metriBordoAnte;
    const costoBordatura = metriBordo * costoBordo;

    // 4. CALCOLO COSTI FERRAMENTA ED ELEMENTI ACQUISTATI dal listino passato
    const costoRipianiFerramenta = nRipiani * prezziFerramenta.ripiano;
    const costoAsteFerramenta = nAste * prezziFerramenta.asta;
    const costoCassettiFerramenta = nCassetti * prezziFerramenta.cassetto;
    const costoAnteFerramenta = nAnte * prezziFerramenta.cerniereAnat; 
    const costoFerramentaTotale = costoRipianiFerramenta + costoAsteFerramenta + costoCassettiFerramenta + costoAnteFerramenta;

    // 5. MANODOPERA (Aumenta in base alla complessità degli accessori interni)
    const oreLavoro = 4 + (mqTotali * 1.5) + (nD * 0.5) + (nRipiani * 0.2) + (nCassetti * 1.0) + (nAnte * 0.4);
    const costoManodopera = oreLavoro * tariffaOraria;

    const totaleParziale = costoMateriale + costoBordatura + costoFerramentaTotale + costoManodopera;

    return {
        mqTotali: mqTotali.toFixed(2),
        metriBordo: metriBordo.toFixed(2),
        costoMateriale: costoMateriale.toFixed(2),
        costoBordatura: costoBordatura.toFixed(2),
        costoFerramenta: costoFerramentaTotale.toFixed(2),
        costoManodopera: costoManodopera.toFixed(2),
        oreLavoro: oreLavoro.toFixed(1),
        totale: totaleParziale
    };
}

export function disegnaMobileSvg(svgElement, params) {
    const { L, A, Z, SP, nD, nRipiani, nAste, nCassetti, nAnte } = params;

    const scala = 350 / A;
    const svgL = L * scala;
    const svgA = A * scala;
    const svgZ = Z * scala;
    const svgSP = SP * scala;

    const offsetX = (800 - svgL) / 2;
    const offsetY = (400 - svgA) / 2;

    let nodiSvg = `
        <rect x="0" y="0" width="800" height="400" fill="#fafafa" stroke="#eee" />
        <g transform="translate(${offsetX}, ${offsetY})">
            <rect x="0" y="0" width="${svgL}" height="${svgA}" fill="none" stroke="#ccc" stroke-dasharray="4" />
            <rect x="0" y="0" width="${svgSP}" height="${svgA}" fill="#e0cda9" stroke="#8a6d3b" stroke-width="1.5" />
            <rect x="${svgL - svgSP}" y="0" width="${svgSP}" height="${svgA}" fill="#e0cda9" stroke="#8a6d3b" stroke-width="1.5" />
            <rect x="0" y="0" width="${svgL}" height="${svgSP}" fill="#d2b48c" stroke="#8a6d3b" stroke-width="1.5" />
            <rect x="${svgSP}" y="${svgA - svgZ - svgSP}" width="${svgL - (2 * svgSP)}" height="${svgSP}" fill="#d2b48c" stroke="#8a6d3b" stroke-width="1.5" />
            <rect x="${svgSP}" y="${svgA - svgZ}" width="${svgL - (2 * svgSP)}" height="${svgZ}" fill="#7f8c8d" stroke="#34495e" stroke-width="1.5" />
    `;

    const coordinataYFondo = svgA - svgZ - svgSP;
    const altezzaUtile = coordinataYFondo - svgSP;
    const nVani = nD + 1;
    const spazioInternoDisponibile = svgL - (2 * svgSP) - (nD * svgSP);
    const larghezzaSingoloVano = spazioInternoDisponibile / nVani;

    // Disegno Divisori e distribuzione elementi interni
    for (let i = 1; i <= nD; i++) {
        const divisoreX = svgSP + (i * larghezzaSingoloVano) + ((i - 1) * svgSP);
        nodiSvg += `<rect x="${divisoreX}" y="${svgSP}" width="${svgSP}" height="${altezzaUtile}" fill="#e6c294" stroke="#8a6d3b" stroke-width="1" />`;
    }

    // DISEGNO SCHEMATICO RIPRESO NEI VANI (Distribuzione indicativa dei ripiani inseriti)
    if (nRipiani > 0) {
        let ripianiDisegnati = 0;
        for (let v = 0; v < nVani; v++) {
            const vanoX = svgSP + (v * (larghezzaSingoloVano + svgSP));
            const ripianiInQuestoVano = Math.ceil((nRipiani - ripianiDisegnati) / (nVani - v));
            for (let r = 1; r <= ripianiInQuestoVano; r++) {
                const ripianoY = svgSP + (r * (altezzaUtile / (ripianiInQuestoVano + 1)));
                nodiSvg += `<rect x="${vanoX}" y="${ripianoY}" width="${larghezzaSingoloVano}" height="${svgSP * 0.8}" fill="#f3dbb3" stroke="#b19263" stroke-width="0.8" />`;
                ripianiDisegnati++;
            }
        }
    }

    // DISEGNO ASTE APPENDIABITO (Segmenti spessi d'acciaio in alto nei vani)
    if (nAste > 0) {
        let asteDisegnate = 0;
        for (let v = 0; v < nVani && asteDisegnate < nAste; v++) {
            const vanoX = svgSP + (v * (larghezzaSingoloVano + svgSP));
            nodiSvg += `<line x1="${vanoX + 5}" y1="${svgSP + 30}" x2="${vanoX + larghezzaSingoloVano - 5}" y2="${svgSP + 30}" stroke="#95a5a6" stroke-width="5" stroke-linecap="round" />`;
            asteDisegnate++;
        }
    }

    // DISEGNO CASSETTI (Rettangoli sovrapposti sul fondo del mobile)
    if (nCassetti > 0) {
        let cassettiDisegnati = 0;
        for (let v = 0; v < nVani && cassettiDisegnate < nCassetti; v++) {
            const vanoX = svgSP + (v * (larghezzaSingoloVano + svgSP));
            const cassettiInQuestoVano = Math.ceil((nCassetti - cassettiDisegnate) / (nVani - v));
            for (let c = 0; c < cassettiInQuestoVano; c++) {
                const hCassetto = 40;
                const cassettoY = coordinataYFondo - ((c + 1) * hCassetto);
                nodiSvg += `
                    <rect x="${vanoX + 2}" y="${cassettoY}" width="${larghezzaSingoloVano - 4}" height="${hCassetto - 2}" fill="#d2b48c" stroke="#555" stroke-width="1" />
                    <circle cx="${vanoX + (larghezzaSingoloVano / 2)}" cy="${cassettoY + (hCassetto / 2)}" r="3" fill="#333" />
                `;
                cassettiDisegnati++;
            }
        }
    }

    // DISEGNO ANTE (Linee trasparenti sovrapposte per indicare la chiusura se attive)
    if (nAnte > 0) {
        const larghAnta = (svgL - (2 * svgSP)) / nAnte;
        for (let a = 0; a < nAnte; a++) {
            nodiSvg += `<rect x="${svgSP + (a * larghAnta)}" y="${svgSP}" width="${larghAnta}" height="${altezzaUtile}" fill="rgba(52, 152, 219, 0.08)" stroke="rgba(52, 152, 219, 0.5)" stroke-width="1.5" stroke-dasharray="2" />`;
        }
    }

    nodiSvg += `
            <text x="${svgL / 2}" y="-10" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#007bff">L: ${L} mm</text>
            <text x="${svgL + 15}" y="${svgA / 2}" text-anchor="start" font-family="sans-serif" font-size="12" font-weight="bold" fill="#007bff">A: ${A} mm</text>
        </g>
    `;

    svgElement.innerHTML = nodiSvg;
}
