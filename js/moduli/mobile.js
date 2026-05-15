/**
 * MOBILE.JS - Modulo per il calcolo e disegno del Cabinet / Mobile Standard
 */

/**
 * Calcola i costi, i metri quadri di scocca, i metri di bordo e i dettagli dei tagli
 * @param {Object} params - I parametri inseriti dall'utente (L, A, P, Z, SP, tariffaOraria, costoBordo, prezzoMateriale)
 */
export function calcolaMobile(params) {
    const { L, A, P, Z, SP, tariffaOraria, costoBordo, prezzoMateriale } = params;

    // 1. CALCOLO SVILUPPO TAGLI (in metri quadri)
    // Convertiamo le dimensioni da mm a metri per il calcolo commerciale
    
    // Fianchi (Destro e Sinistro): Altezza totale meno lo zoccolo
    const altFianchi = (A - Z) / 1000;
    const profM = P / 1000;
    const mqFianchi = 2 * (altFianchi * profM);

    // Fondo e Cappello: Larghezza totale meno i due spessori dei fianchi
    const larghInterna = (L - (2 * SP)) / 1000;
    const mqOrizzontali = 2 * (larghInterna * profM);

    // Schienale (incassato o applicato sul retro, calcolato sull'ingombro interno)
    const mqSchienale = (L / 1000) * (altFianchi);

    // Totale metri quadri di materiale scocca
    const mqTotali = mqFianchi + mqOrizzontali + mqSchienale;
    const costoMateriale = mqTotali * prezzoMateriale;

    // 2. CALCOLO SVILUPPO BORDI (in metri lineari)
    // Bordiamo i frontali di fianchi, fondo, cappello e l'eventuale perimetro delle ante
    const metriBordo = (2 * altFianchi) + (2 * larghInterna);
    const costoBordatura = metriBordo * costoBordo;

    // 3. CALCOLO MANODOPERA (Stima ore basata sulle dimensioni)
    const oreLavoro = 4 + (mqTotali * 1.5); // 4 ore base + 1.5 ore per mq di materiale
    const costoManodopera = oreLavoro * tariffaOraria;

    // 4. TOTALE COMPLESSIVO SCHEDA
    const totaleParziale = costoMateriale + costoBordatura + costoManodopera;

    return {
        mqTotali: mqTotali.toFixed(2),
        metriBordo: metriBordo.toFixed(2),
        costoMateriale: costoMateriale.toFixed(2),
        costoBordatura: costoBordatura.toFixed(2),
        costoManodopera: costoManodopera.toFixed(2),
        totale: totaleParziale
    };
}

/**
 * Genera il codice visivo del disegno SVG per il Cabinet
 * @param {SVGElement} svgElement - L'elemento SVG della pagina da popolare
 * @param {Object} params - I parametri dimensionali (L, A, Z, SP)
 */
export function disegnaMobileSvg(svgElement, params) {
    const { L, A, Z, SP } = params;

    // Proporzioni per scalare il disegno dentro il box SVG (es. max 350px di altezza)
    const scala = 350 / A;
    const svgL = L * scala;
    const svgA = A * scala;
    const svgZ = Z * scala;
    const svgSP = SP * scala;

    // Centriamo il disegno nell'area disponibile
    const offsetX = (800 - svgL) / 2;
    const offsetY = (400 - svgA) / 2;

    // Costruiamo i rettangoli dell'armadio (Fianchi, Cappello, Fondo, Zoccolo)
    let nodiSvg = `
        <!-- Sfondo dell'anteprima -->
        <rect x="0" y="0" width="800" height="400" fill="#fafafa" stroke="#eee" />
        
        <g transform="translate(${offsetX}, ${offsetY})">
            <!-- Ingombro Totale Esterno (Tratteggio Grigio) -->
            <rect x="0" y="0" width="${svgL}" height="${svgA}" fill="none" stroke="#ccc" stroke-dasharray="4" />
            
            <!-- Fianco Sinistro -->
            <rect x="0" y="0" width="${svgSP}" height="${svgA - svgZ}" fill="#e0cda9" stroke="#8a6d3b" stroke-width="1.5" />
            
            <!-- Fianco Destro -->
            <rect x="${svgL - svgSP}" y="0" width="${svgSP}" height="${svgA - svgZ}" fill="#e0cda9" stroke="#8a6d3b" stroke-width="1.5" />
            
            <!-- Cappello (Superiore) -->
            <rect x="${svgSP}" y="0" width="${svgL - (2 * svgSP)}" height="${svgSP}" fill="#d2b48c" stroke="#8a6d3b" stroke-width="1.5" />
            
            <!-- Fondo (Inferiore, sopra lo zoccolo) -->
            <rect x="${svgSP}" y="${svgA - svgZ - svgSP}" width="${svgL - (2 * svgSP)}" height="${svgSP}" fill="#d2b48c" stroke="#8a6d3b" stroke-width="1.5" />
            
            <!-- Zoccolo -->
            <rect x="${svgSP}" y="${svgA - svgZ}" width="${svgL - (2 * svgSP)}" height="${svgZ}" fill="#7f8c8d" stroke="#34495e" stroke-width="1.5" />

            <!-- Quote Testuali -->
            <text x="${svgL / 2}" y="-10" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#007bff">L: ${L} mm</text>
            <text x="${svgL + 15}" y="${svgA / 2}" text-anchor="start" font-family="sans-serif" font-size="12" font-weight="bold" fill="#007bff">A: ${A} mm</text>
        </g>
    `;

    svgElement.innerHTML = nodiSvg;
}
