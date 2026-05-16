export function calcolaMobile(params) {
  const {
    L, A, P, Z, SP, nD, mappaConfigurazioneVani,
    tariffaOraria, costoBordo, prezzoMateriale, prezziFerramenta
  } = params;

  const altTotaleM = A / 1000;
  const profM = P / 1000;
  const spM = SP / 1000;
  const larghInternaM = (L / 1000) - (2 * spM);
  const altDivisoreM = Math.max(0, (A - Z - (2 * SP)) / 1000);

  const mqFianchi = 2 * (altTotaleM * profM);
  const mqCappello = (L / 1000) * profM;
  const mqFondo = larghInternaM * profM;
  const mqDivisori = nD * (altDivisoreM * profM);
  const mqSchienale = (L / 1000) * altTotaleM;

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
  const mqCassettiLegno = totaliCassetti * 0.25;

  const mqTotaliNum = mqFianchi + mqCappello + mqFondo + mqDivisori + mqSchienale + mqRipiani + mqCassettiLegno;
  const costoMaterialeNum = mqTotaliNum * (prezzoMateriale || 0);

  const metriBordoScocca = (2 * altTotaleM) + (L / 1000) + (nD * altDivisoreM) + larghInternaM;
  const metriBordoRipiani = totaliRipiani * larghVanoM;
  const metriBordoCassetti = totaliCassetti * (larghVanoM * 2);

  const metriBordoNum = metriBordoScocca + metriBordoRipiani + metriBordoCassetti;
  const costoBordaturaNum = metriBordoNum * (costoBordo || 0);

  const ferrRip = (prezziFerramenta?.ripiano || 0);
  const ferrCas = (prezziFerramenta?.cassetto || 0);
  const costoFerramentaTotaleNum = (totaliRipiani * ferrRip) + (totaliCassetti * ferrCas);

  const oreLavoroNum = 4 + (mqTotaliNum * 1.5) + (nD * 0.5) + (totaliRipiani * 0.25) + (totaliCassetti * 1.2);
  const costoManodoperaNum = oreLavoroNum * (tariffaOraria || 0);

  const totaleNum = costoMaterialeNum + costoBordaturaNum + costoFerramentaTotaleNum + costoManodoperaNum;

  const pezzi = buildDistintaPezziMm({ L, A, P, Z, SP, nD, totaliRipiani });

  return {
    mqTotali: mqTotaliNum.toFixed(2),
    metriBordo: metriBordoNum.toFixed(2),
    costoMateriale: costoMaterialeNum.toFixed(2),
    costoBordatura: costoBordaturaNum.toFixed(2),
    costoFerramenta: costoFerramentaTotaleNum.toFixed(2),
    costoManodopera: costoManodoperaNum.toFixed(2),
    oreLavoro: oreLavoroNum.toFixed(1),
    totale: totaleNum,
    pezzi
  };
}

function buildDistintaPezziMm({ L, A, P, Z, SP, nD, totaliRipiani }) {
  const Lint = Math.max(0, L - (2 * SP));
  const Hdiv = Math.max(0, A - Z - (2 * SP));
  const nVani = nD + 1;
  const vanoW = nVani > 0 ? Math.max(0, (Lint - (nD * SP)) / nVani) : Lint;

  const list = [];
  list.push({ tipo: "Pannello", nome: "Fianco", qta: 2, x: A, y: P, sp: SP });
  list.push({ tipo: "Pannello", nome: "Cappello (Top)", qta: 1, x: L, y: P, sp: SP });
  list.push({ tipo: "Pannello", nome: "Fondo (Base)", qta: 1, x: Lint, y: P, sp: SP });

  if (nD > 0) list.push({ tipo: "Pannello", nome: "Divisore", qta: nD, x: Hdiv, y: P, sp: SP });

  list.push({ tipo: "Schiena", nome: "Schienale", qta: 1, x: L, y: A, sp: "-" });

  if (totaliRipiani > 0) list.push({ tipo: "Pannello", nome: "Ripiano", qta: totaliRipiani, x: Math.round(vanoW), y: P, sp: SP });

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
  const spazio = svgL - (2 * svgSP) - (nD * svgSP);
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
