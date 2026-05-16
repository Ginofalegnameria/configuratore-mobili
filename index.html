export function calcolaMobile(params) {
  const {
    L, A, P, Z, SP, nD, mappaConfigurazioneD * svgSP);    L, A, P, Z, SP, nD, mappaConfigurazioneVani,
  const wVano = nVani > 0 ? (spazio / nVani) : spazio;

  for (let i = 1; i <= nD; i++) {
    const x = svgSP + (i * wVano) + ((i - 1) * svgSP);
    s += `<rect x="${x}" y="${svgSP}" width="${svgSP}" height="${svgA - svgZ - (2 * svgSP)}" fill="#e6c294" stroke="#8a6d3b" stroke-width="1" />`;
  }

  if (Array.isArray(mappaConfigurazioneVani)) {
    mappaConfigurazioneVani.forEach((vano, idx) => {
      const vanoX = svgSP + (idx * (wVano + svgSP));

      (vano?.ripiani?.quote || []).forEach(q => {
        const y = svgA - (q * scala);
        if (y > svgSP && y < (svgA - svgZ - svgSP)) {
          s += `
            <rect x="${vanoX}" y="${y}" width="${wVano}" height="${Math.max(1, svgSP * 0.8)}" fill="#f3dbb3" stroke="#b19263" stroke-width="0.8" />
            <text x="${vanoX + 4}" y="${y - 3}" font-family="sans-serif" font-size="8" fill="#b19263">${q}</text>
          `;
        }
      });

      (vano?.cassetti?.quote || []).forEach(q => {
        const y = svgA - (q * scala);
        if (y > svgSP && y < (svgA - svgZ - svgSP)) {
          s += `
            <line x1="${vanoX}" y1="${y}" x2="${vanoX + wVano}" y2="${y}" stroke="#e67e22" stroke-width="1" stroke-dasharray="3" />
            <text x="${vanoX + wVano - 18}" y="${y - 3}" font-family="sans-serif" font-size="8" fill="#e67e22">C ${q}</text>
          `;
        }
      });
    });
  }

  s += `</g>`;
  svgElement.innerHTML = s;
}
    tariffaOraria, costoBordo, prezzoMateriale, prezziFerramenta,
    tipoAnta, materialeAnta, numeroAnte, giocoAnta
  } = params;

  // ---- MM -> Metri ----
  const altTotaleM = A / 1000;
  const profM = P / 1000;
  const spM = SP / 1000;
  const larghInternaM = (L / 1000) - (2 * spM);
  const altDivisoreM = Math.max(0, (A - Z - (2 * SP)) / 1000);

  // ---- Superfici scocca ----
  const mqFianchi = 2 * (altTotaleM * profM);
  const mqCappello = (L / 1000) * profM;
  const mqFondo = larghInternaM * profM;
  const mqDivisori = nD * (altDivisoreM * profM);
  const mqSchienale = (L / 1000) * altTotaleM;

  // ---- Interni per vano ----
  const larghVanoM = (nD + 1) > 0 ? (larghInternaM - (nD * spM)) / (nD + 1) : larghInternaM;

  let totaliRipiani = 0;
  let totaliCassetti = 0;

  if (Array.isArray(mappaConfigurazioneVani)) {
    mappaConfigurazioneVani.forEach(vano => {
      totaliRipiani += (vano?.ripiani?.quantita || 0);
      totaliCassetti += (vano?.cassetti?.quantita || 0);
    });
  }

  const mqRipiani = totaliRipiani * (larghVanoM * profM);

  // Cassetti: forfait “mq equivalenti”
  const mqCassettiLegno = totaliCassetti * 0.25;

  const mqTotaliNum = mqFianchi + mqCappello + mqFondo + mqDivisori + mqSchienale + mqRipiani + mqCassettiLegno;
  const costoMaterialeNum = mqTotaliNum * (prezzoMateriale || 0);

  // ---- Bordatura (stima) ----
  const metriBordoScocca =
    (2 * altTotaleM) + (L / 1000) + (nD * altDivisoreM) + larghInternaM;

  const metriBordoRipiani = totaliRipiani * larghVanoM;
  const metriBordoCassetti = totaliCassetti * (larghVanoM * 2);

  const metriBordoNum = metriBordoScocca + metriBordoRipiani + metriBordoCassetti;
  const costoBordaturaNum = metriBordoNum * (costoBordo || 0);

  // ---- Ferramenta interni ----
  const ferrRip = (prezziFerramenta?.ripiano || 0);
  const ferrCas = (prezziFerramenta?.cassetto || 0);
  const costoFerramentaInterniNum = (totaliRipiani * ferrRip) + (totaliCassetti * ferrCas);

  // ---- ANTE: materiale + ferramenta + ore extra ----
  const ante = calcolaAnte({
    L, A, Z, SP,
    tipoAnta, materialeAnta, numeroAnte, giocoAnta,
    prezzoMateriale,
    prezziFerramenta,
    tariffaOraria
  });

  // ---- Ore / manodopera ----
  const oreBaseNum =
    4 +
    (mqTotaliNum * 1.5) +
    (nD * 0.5) +
    (totaliRipiani * 0.25) +
    (totaliCassetti * 1.2);

  const oreLavoroNum = oreBaseNum + ante.oreExtra;
  const costoManodoperaNum = oreLavoroNum * (tariffaOraria || 0);

  const totaleNum =
    costoMaterialeNum +
    costoBordaturaNum +
    costoFerramentaInterniNum +
    costoManodoperaNum +
    ante.costoMaterialeAnteNum +
    ante.costoFerramentaAnteNum;

  // ---- Distinta pezzi (MM) ----
  const pezzi = buildDistintaPezziMm({
    L, A, P, Z, SP, nD, totaliRipiani,
    tipoAnta, numeroAnte, giocoAnta
  });

  return {
    mqTotali: mqTotaliNum.toFixed(2),
    metriBordo: metriBordoNum.toFixed(2),
    costoMateriale: costoMaterialeNum.toFixed(2),
    costoBordatura: costoBordaturaNum.toFixed(2),
    costoFerramenta: costoFerramentaInterniNum.toFixed(2),
    costoManodopera: costoManodoperaNum.toFixed(2),
    oreLavoro: oreLavoroNum.toFixed(1),
    totale: totaleNum,
    pezzi,
    ante: {
      mqAnte: ante.mqAnte.toFixed(2),
      costoMaterialeAnte: ante.costoMaterialeAnteNum.toFixed(2),
      costoFerramentaAnte: ante.costoFerramentaAnteNum.toFixed(2)
    }
  };
}

function calcolaAnte({
  L, A, Z, SP,
  tipoAnta, materialeAnta, numeroAnte, giocoAnta,
  prezzoMateriale,
  prezziFerramenta
}) {
  // default
  if (!tipoAnta || tipoAnta === "nessuna" || !numeroAnte || numeroAnte <= 0) {
    return {
      mqAnte: 0,
      costoMaterialeAnteNum: 0,
      costoFerramentaAnteNum: 0,
      oreExtra: 0,
      antaH: 0,
      antaW: 0
    };
  }

  const gioco = Math.max(0, giocoAnta || 0);

  // Altezza anta: sopra zoccolo (scocca) con gioco
  // (approccio semplice e pratico)
  const antaH = Math.max(0, A - Z - gioco);

  // Larghezza anta: mobile diviso numero ante meno giochi laterali
  const antaW = Math.max(0, Math.floor((L - (gioco * (numeroAnte + 1))) / numeroAnte));

  const mqSingola = (antaH / 1000) * (antaW / 1000);
  let mqTot = mqSingola * numeroAnte;

  // prezzo al mq ante
  let prezzoMqAnta = prezzoMateriale || 0;
  if (materialeAnta === "laccato") prezzoMqAnta += 40;
  if (materialeAnta === "legno") prezzoMqAnta += 60;

  // scorrevole: di solito sovrapposizione / extra -> aumentiamo del 10% la superficie “effettiva”
  if (tipoAnta === "scorrevole") {
    mqTot = mqTot * 1.10;
  }

  const costoMaterialeAnteNum = mqTot * prezzoMqAnta;

  // ferramenta ante
  let costoFerramentaAnteNum = 0;
  let oreExtra = 0;

  if (tipoAnta === "battente") {
    // 2 coppie cerniere per anta (4 cerniere) - stima comune
    const prezzoCoppia = prezziFerramenta?.cerniereCoppia || 0;
    costoFerramentaAnteNum = numeroAnte * 2 * prezzoCoppia;
    oreExtra = numeroAnte * 0.30; // montaggio/regolazione
  }

  if (tipoAnta === "scorrevole") {
    const base = prezziFerramenta?.scorrevoleBase || 0;
    const perAnta = prezziFerramenta?.scorrevolePerAnta || 0;
    costoFerramentaAnteNum = base + (numeroAnte * perAnta);
    oreExtra = numeroAnte * 0.50; // binari/allineamento
  }

  return {
    mqAnte: mqTot,
    costoMaterialeAnteNum,
    costoFerramentaAnteNum,
    oreExtra,
    antaH,
    antaW
  };
}

function buildDistintaPezziMm({ L, A, P, Z, SP, nD, totaliRipiani, tipoAnta, numeroAnte, giocoAnta }) {
  const Lint = Math.max(0, L - (2 * SP));
  const Hdiv = Math.max(0, A - Z - (2 * SP));
  const nVani = nD + 1;
  const vanoW = nVani > 0 ? Math.max(0, (Lint - (nD * SP)) / nVani) : Lint;

  const list = [];

  // Scocca
  list.push({ nome: "Fianco", qta: 2, x: A, y: P, sp: SP });
  list.push({ nome: "Cappello (Top)", qta: 1, x: L, y: P, sp: SP });
  list.push({ nome: "Fondo (Base)", qta: 1, x: Lint, y: P, sp: SP });

  if (nD > 0) list.push({ nome: "Divisore", qta: nD, x: Hdiv, y: P, sp: SP });

  // Schiena (sp variabile)
  list.push({ nome: "Schienale", qta: 1, x: L, y: A, sp: "-" });

  // Ripiani (stima uguali)
  if (totaliRipiani > 0) list.push({ nome: "Ripiano", qta: totaliRipiani, x: Math.round(vanoW), y: P, sp: SP });

  // Ante (pezzi)
  if (tipoAnta && tipoAnta !== "nessuna" && numeroAnte > 0) {
    const gioco = Math.max(0, giocoAnta || 0);
    const antaH = Math.max(0, A - Z - gioco);
    const antaW = Math.max(0, Math.floor((L - (gioco * (numeroAnte + 1))) / numeroAnte));
    list.push({ nome: `Anta (${tipoAnta})`, qta: numeroAnte, x: antaH, y: antaW, sp: SP });
  }

  return list;
}

export function disegnaMobileSvg(svgElement, params) {
  const { L, A, Z, SP, nD, mappaConfigurazioneVani } = params;
  if (!svgElement) return;

  svgElement.setAttribute("viewBox", "0 0 800 400");

  const scala = A > 0 ? (350 / A) : 0.15;
  const svgL = L * scala;
  const svgA = A * scala;
  const svgZ = Z * scala;
  const svgSP = SP * scala;

  const offsetX = (800 - svgL) / 2;
  const offsetY = (400 - svgA) / 2;

  let s = `
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
