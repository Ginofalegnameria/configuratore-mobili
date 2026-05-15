/**
 * MOBILE.JS - Calcolo e disegno senza errori di battitura
 */

export function calcolaMobile(params) {
    const { 
        L, A, P, Z, SP, nD, mappaConfigurazioneVani,
        tariffaOraria, costoBordo, prezzoMateriale, prezziFerramenta 
    } = params;

    const altTotaleM = A / 1000;
    const profM = P / 1000;
    const larghInternaM = (L - (2 * SP)) / 1000;

    // Struttura esterna
    const mqFianchi = 2 * (altTotaleM * profM);
    const mqCappello = (L / 1000) * profM;
    const mqFondo = larghInternaM * profM;
    const altDivisoreM = (A - Z - (2 * SP)) / 1000;
    const mqDivisori = nD * (altDivisoreM * profM);
    const mqSchienale = (L / 1000) * altTotaleM;

    // Conteggio interni dai singoli vani
    const larghVanoM = (larghInternaM - (nD * (SP / 1000))) / (nD + 1);
    let totaliRipiani = 0;
    let totaliCassetti = 0;

    if (mappaConfigurazioneVani) {
        mappaConfigurazioneVani.forEach(vano => {
            totaliRipiani += vano.ripiani.quantita;
            totaliCassetti += vano.cassetti.quantita;
        });
    }

    const mqRipiani = totaliRipiani * (larghVanoM * profM);
    const mqCassettiLegno = totaliCassetti * 0.25;

    const mqTotali = mqFianchi + mqCappello + mqFondo + mqDivisori + mqSchienale + mqRipiani + mqCassettiLegno;
    const costoMateriale = mqTotali * prezzoMateriale;

    // Bordi
    const metriBordoScocca = (2 * altTotaleM) + (L / 1000) + (nD * altDivisoreM) + larghInternaM;
    const metriBordoRipiani = totaliRipiani * larghVanoM;
    const metriBordoCassetti = totaliCassetti * (larghVanoM * 2);
    const metriBordo = metriBordoScocca + metriBordoRipiani + metriBordoCassetti;
    const costoBordatura = metriBordo * costoBordo;

    // Ferramenta
    const costoFerrRipiani = totaliRipiani * prezziFerramenta.ripiano;
    const costoFerrCassetti = totaliCassetti * prezziFerramenta.cassetto;
    const costoFerramentaTotale = costoFerrRipiani + costoFerrCassetti;

    // Ore
    const oreLavoro = 4 + (mqTotali * 1.5) + (nD * 0.5) + (totaliRipiani * 0.25) + (totaliCassetti * 1.2);
    const costoManodopera = oreLavoro * tariffaOraria;

    return {
        mqTotali: mqTotali.toFixed(2),
        metriBordo: metriBordo.toFixed(2),
        costoMateriale: costoMateriale.toFixed(2),
        costoBordatura: costoBordatura.toFixed(2),
        costoFerramenta: costoFerramentaTotale.toFixed(2),
        costoManodopera: costoManodopera.toFixed(2),
        oreLavoro: oreLavoro.toFixed(1),
        totale: totaleParziale()
    };
    
    function totaleParziale() {
        return costoMateriale + costoBordatura + costoFerramentaTotale + costoManodopera;
    }
}

export function disegnaMobileSvg(svgElement, params) {
    const { L, A, Z, SP, nD, mappaConfigurazioneVani } = params;

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

    const nVani = nD + 1;
    const spazioInternoDisponibile = svgL - (2 * svgSP) - (nD * svgSP);
    const larghezzaSingoloVano = spazioInternoDisponibile / nVani;

    // Divisori verticali
    for (let i = 1; i <= nD; i++) {
        const divisoreX = svgSP + (i * larghezzaSingoloVano) + ((i - 1) * svgSP);
        nodiSvg += `<rect x="${divisoreX}" y="${svgSP}" width="${svgSP}" height="${svgA - svgZ - (2 * svgSP)}" fill="#e6c294" stroke="#8a6d3b" stroke-width="1" />`;
    }

    // Disegno elementi dai singoli vani
    if (mappaConfigurazioneVani) {
        mappaConfigurazioneVani.forEach((vano, idx) => {
            const vanoX = svgSP + (idx * (larghezzaSingoloVano + svgSP));

            // Disegno ripiani
            vano.ripiani.quote.forEach(quotaMm => {
                const quotaScalata = quotaMm * scala;
                const ripianoY = svgA - quotaScalata;
                if (ripianoY > svgSP && ripianoY < (svgA - svgZ - svgSP)) {
                    nodiSvg += `
                        <rect x="${vanoX}" y="${ripianoY}" width="${larghezzaSingoloVano}" height="${svgSP * 0.8}" fill="#f3dbb3" stroke="#b19263" stroke-width="0.8" />
                        <text x="${vanoX + 4}" y="${ripianoY - 3}" font-family="sans-serif" font-size="8" fill="#b19263">${quotaMm}</text>
                    `;
                
