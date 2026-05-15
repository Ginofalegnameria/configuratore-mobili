/**
 * MOBILE.JS - Modulo calcolo e disegno Cabinet per singolo vano/lato
 */

export function calcolaMobile(params) {
    const { 
        L, A, P, Z, SP, nD, mappaConfigurazioneVani,
        tariffaOraria, costoBordo, prezzoMateriale, prezziFerramenta 
    } = params;

    const altTotaleM = A / 1000;
    const profM = P / 1000;
    const larghInternaM = (L - (2 * SP)) / 1000;

    // 1. STRUTTURA ESTERNA
    const mqFianchi = 2 * (altTotaleM * profM);
    const mqCappello = (L / 1000) * profM;
    const mqFondo = larghInternaM * profM;
    const altDivisoreM = (A - Z - (2 * SP)) / 1000;
    const mqDivisori = nD * (altDivisoreM * profM);
    const mqSchienale = (L / 1000) * altTotaleM;

    // 2. ELEMENTI INTERNI DAI VANI
    const larghVanoM = (larghInternaM - (nD * (SP / 1000))) / (nD + 1);
    let totaliRipiani = 0;
    let totaliCassetti = 0;

    if (mappaConfigurazioneVani && Array.isArray(mappaConfigurazioneVani)) {
        mappaConfigurazioneVani.forEach(vano => {
            totaliRipiani += vano.ripiani.quantita;
            totaliCassetti += vano.cassetti.quantita;
        });
    }

    const mqRipiani = totaliRipiani * (larghVanoM * profM);
    const mqCassettiLegno = totaliCassetti * 0.22; // stima materiale sponde cassetto

    const mqTotali = mqFianchi + mqCappello + mqFondo + mqDivisori + mqSchienale + mqRipiani + mqCassettiLegno;
    const costoMateriale = mqTotali * prezzoMateriale;

    // 3. SVILUPPO BORDI
    const metriBordoScocca = (2 * altTotaleM) + (L / 1000) + (nD * altDivisoreM) + larghInternaM;
    const metriBordoRipiani = totaliRipiani * larghVanoM;
    const metriBordoCassetti = totaliCassetti * (larghVanoM * 2);
    const metriBordo = metriBordoScocca + metriBordoRipiani + metriBordoCassetti;
    const costoBordatura = metriBordo * costoBordo;

    // 4. FERRAMENTA
    const costoFerrRipiani = totaliRipiani * prezziFerramenta.ripiano;
    const costoFerrCassetti = totaliCassetti * prezziFerramenta.cassetto;
    const costoFerramentaTotale = costoFerrRipiani + costoFerrCassetti;

    // 5. MANODOPERA
    const oreLavoro = 4 + (mqTotali * 1.5) + (nD * 0.5) + (totaliRipiani * 0.2) + (totaliCassetti * 1.0);
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

    for (let i = 1; i <= nD; i++) {
        const divisoreX = svgSP + (i * larghezzaSingoloVano) + ((i - 1) * svgSP);
        nodiSvg += `<rect x="${divisoreX}" y="${svgSP}" width="${svgSP}" height="${svgA - svgZ - (2 * svgSP)}" fill="#e6c294" stroke="#8a6d3b" stroke-width="1" />`;
    }

    // DISEGNO RIPRESO DA MAPPA ALLINEATA
    if (mappaConfigurazioneVani && Array.isArray(mappaConfigurazioneVani)) {
        mappaConfigurazioneVani.forEach((vano, idx) => {
            const vanoX = svgSP + (idx * (larghezzaSingoloVano + svgSP));

            // Ripiani
            if (vano.ripiani && vano.ripiani.quote) {
                vano.ripiani.quote.forEach(quotaMm => {
                    const ripianoY = svgA - (quotaMm * scala);
                    if (ripianoY > svgSP && ripianoY < (svgA - svgZ - svgSP)) {
                        nodiSvg += `
                            <rect x="${vanoX}" y="${ripianoY}" width="${larghezzaSingoloVano}" height="${svgSP * 0.8}" fill="#f3dbb3" stroke="#b19263" stroke-width="0.8" />
                            <text x="${vanoX + 4}" y="${ripianoY - 3}" font-family="sans-serif" font-size="7" fill="#b19263">${quotaMm}</text>
                        `;
                    }
                });
            }

            // Cassetti
            if (vano.cassetti && vano.cassetti.quote) {
                vano.cassetti.quote.forEach(quotaMm => {
                    const altezzaCassettoGrafico = 30 * scala;
                    const cassettoY = svgA - (quotaMm * scala) - altezzaCassettoGrafico;
                    if (cassettoY > svgSP && (cassettoY + altezzaCassettoGrafico) < (svgA - svgZ)) {
                        nodiSvg += `
                            <rect x="${vanoX + 1}" y="${cassettoY}" width="${larghezzaSingoloVano - 2}" height="${altezzaCassettoGrafico}" fill="#d2b48c" stroke="#5d4037" stroke-width="1" rx="2" />
                            <rect x="${vanoX + (larghezzaSingoloVano / 2) - 15}" y="${cassettoY + (altezzaCassettoGrafico / 2) - 2}" width="30" height="4" rx="1" fill="#333" />
                            <text x="${vanoX + 4}" y="${cassettoY + altezzaCassettoGrafico - 4}" font-family="sans-serif" font-size="7" fill="#5d4037" font-weight="bold">${quotaMm}</text>
                        `;
                    }
                });
            }
        });
    }

    nodiSvg += `
            <text x="${svgL / 2}" y="-10" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#007bff">L: ${L} mm</text>
            <text x="${svgL + 15}" y="${svgA / 2}" text-anchor="start" font-family="sans-serif" font-size="12" font-weight="bold" fill="#007bff">A: ${A} mm</text>
        </g>
    `;

    svgElement.innerHTML = nodiSvg;
}
