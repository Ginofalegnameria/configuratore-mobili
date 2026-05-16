/**
 * MOBILE.JS - Calcolo + SVG
 * - Restituisce anche "pezzi" per output Produzione (distinta taglio)
 */

export function calcolaMobile(params) {
  const {
    L, A, P, Z, SP, nD, mappaConfigurazioneVani,
    tariffaOraria, costoBordo, prezzoMateriale, prezziFerramenta
  } = params;

  // ---- MM -> Metri per superfici ----
  const altTotaleM = A / 1000;
  const profM = P / 1000;
  const spM = SP / 1000;

  // larghezza interna (tra i due fianchi)
  const larghInternaM = (L / 1000) - (2 * spM);

  // Altezza utile divisori (tolgo zoccolo e cappello+fondo spessore)
  const altDivisoreM = Math.max(0, (A - Z - (2 * SP)) / 1000);

  // ---- Struttura esterna (mq) ----
  const mqFianchi = 2 * (altTotaleM * profM);
  const mqCappello = (L / 1000) * profM;
  const mqFondo = larghInternaM * profM;
  const mqDivisori = nD * (altDivisoreM * profM);
  const mqSchienale = (L / 1000) * altTotaleM;

  // ---- Conteggio interni per vano ----
  const larghVanoM = (nD + 1) > 0
    ? (larghInternaM - (nD * spM)) / (nD + 1)
    : larghInternaM;

  let totaliRipiani = 0;
  let totaliCassetti = 0;

  if (Array.isArray(mappaConfigurazioneVani)) {
    mappaConfigurazioneVani.forEach(vano => {
      totaliRipiani += (vano?.ripiani?.quantita || 0);
      totaliCassetti += (vano?.cassetti?.quantita || 0);
    });
  }

  const mqRipiani = totaliRipiani * (larghVanoM * profM);

  // Cassetti: qui era una stima “a forfait” in mq. La lasciamo uguale
  // (se vorrai cassetti con misure reali, li modelliamo dopo).
  const mqCassettiLegno = totaliCassetti * 0.25;

  const mqTotaliNum = mqFianchi + mqCappello + mqFondo + mqDivisori + mqSchienale + mqRipiani + mqCassettiLegno;
  const costoMaterialeNum = mqTotaliNum * (prezzoMateriale || 0);

  // ---- Bordatura (metri) ----
  // formula “di stima” come la tua (manteniamo logica)
  const metriBordoScocca =
    (2 * altTotaleM) + (L / 1000) + (nD * altDivisoreM) + larghInternaM;

  const metriBordoRipiani = totaliRipiani * larghVanoM;
  const metriBordoCassetti = totaliCassetti * (larghVanoM * 2);

  const metriBordoNum = metriBordoScocca + metriBordoRipiani + metriBordoCassetti;
  const costoBordaturaNum = metriBordoNum * (costoBordo || 0);

  // ---- Ferramenta ----
  const ferrRip = (prezziFerramenta?.ripiano || 0);
  const ferrCas = (prezziFerramenta?.cassetto || 0);

  const costoFerrRipianiNum = totaliRipiani * ferrRip;
  const costoFerrCassettiNum = totaliCassetti * ferrCas;

  const costoFerramentaTotaleNum = costoFerrRipianiNum + costoFerrCassettiNum;

  // ---- Ore / manodopera ----
  const oreLavoroNum =
    4 +
    (mqTotaliNum * 1.5) +
    (nD * 0.5) +
    (totaliRipiani * 0.25) +
    (totaliCassetti * 1.2);

  const costoManodoperaNum = oreLavoroNum * (tariffaOraria || 0);

  const totaleNum = costoMaterialeNum + costoBordaturaNum + costoFerramentaTotaleNum + costoManodoperaNum;

  // ---- DISTINTA PEZZI (MM) ----
  const pezzi = buildDistintaPezziMm({ L, A, P, Z, SP, nD, totaliRipiani });

  return {
    // stringhe (come prima, utili per UI)
    mqTotali: mqTotaliNum.toFixed(2),
    metriBordo: metriBordoNum.toFixed(2),
    costoMateriale: costoMaterialeNum.toFixed(2),
    costoBordatura: costoBordaturaNum.toFixed(2),
    costoFerramenta: costoFerramentaTotaleNum.toFixed(2),
    costoManodopera: costoManodoperaNum.toFixed(2),
    oreLavoro: oreLavoroNum.toFixed(1),

    // totale NUMERICO (importante!)
    totale: totaleNum,

    // dati produzione
    pezzi
  };
}

function buildDistintaPezziMm({ L, A, P, Z, SP, nD, totaliRipiani }) {
  // Tutto in mm
  const Lint = Math.max(0, L - (2 * SP));            // larghezza interna
  const Hdiv = Math.max(0, A - Z - (2 * SP));        // altezza divisori (utile)
  const nVani = nD + 1;
  const vanoW = nVani > 0 ? Math.max(0, (Lint - (nD * SP)) / nVani) : Lint;

  const list = [];

  // Scocca
  list.push({ tipo: "Pannello", nome: "Fianco", qta: 2, x: A, y: P, sp: SP });
  list.push({ tipo: "Pannello", nome: "Cappello (Top)", qta: 1, x: L, y: P, sp: SP });
  list.push({ tipo: "Pannello", nome: "Fondo (Base)", qta: 1, x: Lint, y: P, sp: SP });

  if (nD > 0) {
    list.push({ tipo: "Pannello", nome: "Divisore", qta: nD, x: Hdiv, y: P, sp: SP });
  }

  // Schiena (qui non sappiamo spessore: metto "-" per indicare variabile)
  list.push({ tipo: "Schiena", nome: "Schienale", qta: 1, x: L, y: A, sp: "-" });

  // Ripiani (stima: tutti uguali alla larghezza vano)
  if (totaliRipiani > 0) {
    list.push({ tipo: "Pannello", nome: "Ripiano", qta: totaliRipiani, x: Math.round(vanoW), y: P, sp: SP });
  }

  // Nota: cassetti non modellati come pezzi reali (al momento sono a forfait)
  return list;
}

export function disegnaMobileSvg(svgElement, params) {
  const { L, A, Z, SP, nD, mappaConfigurazioneVani } = params;

  if (!svgElement) return;

  // Imposto viewBox se non c'è
  svgElement.setAttribute("viewBox", "0 0 800 400");

  // scala basata sull'altezza totale
  const scala = A > 0 ? (350 / A) : 0.15;

  const svgL = L * scala;
  const svgA = A * scala;
  const svgZ = Z * scala;
  const svgSP = SP * scala;

  const offsetX = (800 - svgL) / 2;
  const offsetY = (400 - svgA) / 2;

  let nodiSvg = `
    <rect x="0" y="0" width="800" height="400" fill="#fafafa" stroke="#eee" />
    <g transform="translate(${offsetX}, ${offsetY})">
      <!-- Ingombro -->
      <rect x="0" y="0" width="${svgL}" height="${svgA}" fill="none" stroke="#ccc" stroke-dasharray="4" />

      <!-- Fianchi -->
      <rect x="0" y="0" width="${svgSP}" height="${svgA}" fill="#e0cda9" stroke="#8a6d3b" stroke-width="1.5" />
      <rect x="${svgL - svgSP}" y="0" width="${svgSP}" height="${svgA}" fill="#e0cda9" stroke="#8a6d3b" stroke-width="1.5" />

      <!-- Cappello -->
      <rect x="0" y="0" width="${svgL}" height="${svgSP}" fill="#d2b48c" stroke="#8a6d3b" stroke-width="1.5" />

      <!-- Fondo -->
      <rect x="${svgSP}" y="${svgA - svgZ - svgSP}" width="${svgL - (2 * svgSP)}" height="${svgSP}"
            fill="#d2b48c" stroke="#8a6d3b" stroke-width="1.5" />

      <!-- Zoccolo -->
      <rect x="${svgSP}" y="${svgA - svgZ}" width="${svgL - (2 * svgSP)}" height="${svgZ}"
            fill="#7f8c8d" stroke="#34495e" stroke-width="1.5" />
  `;

  const nVani = nD + 1;
  const spazioInternoDisponibile = svgL - (2 * svgSP) - (nD * svgSP);
  const larghezzaSingoloVano = nVani > 0 ? (spazioInternoDisponibile / nVani) : spazioInternoDisponibile;

  // Divisori verticali
  for (let i = 1; i <= nD; i++) {
    const divisoreX = svgSP + (i * larghezzaSingoloVano) + ((i - 1) * svgSP);
    nodiSvg += `
      <rect x="${divisoreX}" y="${svgSP}" width="${svgSP}" height="${svgA - svgZ - (2 * svgSP)}"
            fill="#e6c294" stroke="#8a6d3b" stroke-width="1" />
    `;
  }

  // Elementi interni (ripiani e marker cassetti)
  if (Array.isArray(mappaConfigurazioneVani)) {
    mappaConfigurazioneVani.forEach((vano, idx) => {
      const vanoX = svgSP + (idx * (larghezzaSingoloVano + svgSP));

      // Ripiani (rettangolino + quota)
      (vano?.ripiani?.quote || []).forEach(quotaMm => {
        const quotaScalata = quotaMm * scala;
        const ripianoY = svgA - quotaScalata;

        if (ripianoY > svgSP && ripianoY < (svgA - svgZ - svgSP)) {
          nodiSvg += `
            <rect x="${vanoX}" y="${ripianoY}" width="${larghezzaSingoloVano}" height="${Math.max(1, svgSP * 0.8)}"
                  fill="#f3dbb3" stroke="#b19263" stroke-width="0.8" />
            <text x="${vanoX + 4}" y="${ripianoY - 3}" font-family="sans-serif" font-size="8" fill="#b19263">
              ${quotaMm}
            </text>
          `;
        }
      });

      // Cassetti (marker linea arancione + quota) — non disegno box completo per non inventare altezze
      (vano?.cassetti?.quote || []).forEach(quotaMm => {
        const quotaScalata = quotaMm * scala;
        const y = svgA - quotaScalata;

        if (y > svgSP && y < (svgA - svgZ - svgSP)) {
          nodiSvg += `
            <line x1="${vanoX}" y1="${y}" x2="${vanoX + larghezzaSingoloVano}" y2="${y}" stroke="#e67e22" stroke-width="1" stroke-dasharray="3" />
            <text x="${vanoX + larghezzaSingoloVano - 18}" y="${y - 3}" font-family="sans-serif" font-size="8" fill="#e67e22">
              C ${quotaMm}
            </text>
          `;
        }
      });
    });
  }

  // Chiudo group
  nodiSvg += `
    </g>
  `;

  svgElement.innerHTML = nodiSvg;
}
