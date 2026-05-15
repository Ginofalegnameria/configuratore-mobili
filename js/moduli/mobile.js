/**
 * MOBILE.JS - Modulo per il calcolo e disegno del Cabinet / Mobile Standard
 */

export function calcolaMobile(params) {
    const { L, A, P, Z, SP, nD, tariffaOraria, costoBordo, prezzoMateriale } = params;

    // Convertiamo le dimensioni da mm a metri per il calcolo commerciale
    const altTotaleM = A / 1000;
    const altFianchiM = A / 1000; // I fianchi ora arrivano a terra (altezza totale)
    const profM = P / 1000;
    const larghInternaM = (L - (2 * SP)) / 1000;
    const spessoreM = SP / 1000;

    // 1. CALCOLO SVILUPPO TAGLI (in metri quadri)
    // Fianchi (Destro e Sinistro): Arrivano a terra
    const mqFianchi = 2 * (altFianchiM * profM);

    // Cappello: Sta sopra, occupa l'intera larghezza L
    const mqCappello = (L / 1000) * profM;

    // Fondo: Sta all'interno tra i fianchi, posizionato sopra lo zoccolo
    const mqFondo = larghInternaM * profM;

    // Divisori Verticali Interni: Vanno dal fondo al cappello
    const altDivisoreM = (A - Z - (2 * SP)) / 1000;
    const mqDivisori = nD * (altDivisoreM * profM);

    // Schienale (calcolato sull'ingombro totale posteriore)
    const mqSchienale = (L / 1000) * altTotaleM;

    // Totale metri quadri di materiale scocca
    const mqTotali = mqFianchi + mqCappello + mqFondo + mqDivisori + mqSchienale;
    const costoMateriale = mqTotali * prezzoMateriale;

    // 2. CALCOLO SVILUPPO BORDI (in metri lineari)
    // Bordiamo i frontali visibili: 2 fianchi, cappello, fondo e i divisori inseriti
    const metriBordo = (2 * altFianchiM) + (L / 1000) + communitiesBordoDivisori(larghInternaM, nD, altDivisoreM);
    function communitiesBordoDivisori(l, n, h) {
        return (n * h) + l; 
    }
    const costoBordatura = metriBordo * costoBordo;

    // 3. CALCOLO MANODOPERA
    const oreLavoro = 4 + (mqTotali * 1.5) + (nD * 0.5); // 4 ore base + 1.5 ore per mq + 30 min per ogni divisore
    const costoManodopera = oreLavoro * tariffaOraria;

    const totaleParziale = costoMateriale + costoBordatura + costoManodopera;

    return {
        mqTotali: mqTotali.toFixed(2),
        metriBordo: metriBordo.toFixed(2),
        costoMateriale: costoMateriale.toFixed(2),
        costoBordatura: costoBordatura.toFixed(2),
        costoManodopera: costoManodopera.toFixed(2),
        oreLavoro: oreLavoro.toFixed(1),
        totale: totaleParziale
    };
}

export function disegnaMobileSvg(svgElement, params) {
    const { L, A, Z, SP, nD } = params;

    const scala = 350 / A;
    const svgL = L * scala;
    const svgA = A * scala;
    const svgZ = Z * scala;
    const svgSP = SP * scala;

    const offsetX = (800 - svgL) / 2;
    const offsetY = (400 - svgA) / 2;

    // Costruiamo la struttura base (Fianchi a terra, cappello passante sopra)
    let nodiSvg = `
        <rect x="0" y="0" width="800" height="400" fill="#fafafa" stroke="#eee" />
        
        <g transform="translate(${offsetX}, ${offsetY})">
            <!-- Ingombro Totale Esterno -->
            <rect x="0" y="0" width="${svgL}" height="${svgA}" fill="none" stroke="#ccc" stroke-dasharray="4" />
            
            <!-- Fianco Sinistro (Arriva a terra, quota y=0 fino a h=svgA) -->
            <rect x="0" y="0" width="${svgSP}" height="${svgA}" fill="#e0cda9" stroke="#8a6d3b" stroke-width="1.5" />
            
            <!-- Fianco Destro (Arriva a terra) -->
            <rect x="${svgL - svgSP}" y="0" width="${svgSP}" height="${svgA}" fill="#e0cda9" stroke="#8a6d3b" stroke-width="1.5" />
            
            <!-- Cappello (Superiore passante sopra i fianchi) -->
            <rect x="0" y="0" width="${svgL}" height="${svgSP}" fill="#d2b48c" stroke="#8a6d3b" stroke-width="1.5" />
            
            <!-- Fondo (Inserito tra i fianchi sopra lo zoccolo) -->
            <rect x="${svgSP}" y="${svgA - svgZ - svgSP}" width="${svgL - (2 * svgSP)}" height="${svgSP}" fill="#d2b48c" stroke="#8a6d3b" stroke-width="1.5" />
            
            <!-- Zoccolo (Arretrato tra i fianchi a terra) -->
            <rect x="${svgSP}" y="${svgA - svgZ}" width="${svgL - (2 * svgSP)}" height="${svgZ}" fill="#7f8c8d" stroke="#34495e" stroke-width="1.5" />
    `;

    // DISEGNO DINAMICO DEI DIVISORI VERTICALI
    if (nD > 0) {
        const spazioInternoDisponibile = svgL - (2 * svgSP) - (nD * svgSP);
        const larghezzaSingoloVano = spazioInternoDisponibile / (nD + 1);
        const coordinataYFondo = svgA - svgZ - svgSP;

        for (let i = 1; i <= nD; i++) {
            // Calcolo della posizione X esatta per ogni divisore intermedio
            const divisoreX = svgSP + (i * larghezzaSingoloVano) + ((i - 1) * svgSP);
            const altezzaDivisore = coordinataYFondo - svgSP;

            nodiSvg += `
                <!-- Divisore Interno ${i} -->
                <rect x="${divisoreX}" y="${svgSP}" width="${svgSP}" height="${altezzaDivisore}" fill="#e6c294" stroke="#8a6d3b" stroke-width="1" />
            `;
        }
    }

    // Aggiungiamo le quote di testo
    nodiSvg += `
            <text x="${svgL / 2}" y="-10" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#007bff">L: ${L} mm</text>
            <text x="${svgL + 15}" y="${svgA / 2}" text-anchor="start" font-family="sans-serif" font-size="12" font-weight="bold" fill="#007bff">A: ${A} mm</text>
        </g>
    `;

    svgElement.innerHTML = nodiSvg;
}
