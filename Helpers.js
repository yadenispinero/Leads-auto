// ==========================================
// FUNCIONES AUXILIARES DE LIMPIEZA — LEADS FREELANCE
// ==========================================
// Nota: las funciones de empleo (pareceEnEspanol_, normalizarEmpresa_, esDuplicado_,
// similitudPuesto_, palabrasSignificativas_) se quitaron — eran del buscador de empleo
// y la deduplicación de leads freelance ahora usa extraerClaveProyecto (LinkExtractor.gs).

// ==========================================
// PAUSA "HUMANA" — aleatoria, con ocasional pausa larga, parametrizable
// ==========================================
function pausaHumana_(cfg, etiqueta) {
  const esPausaLarga = Math.random() < cfg.PROBABILIDAD_PAUSA_LARGA;
  const min = esPausaLarga ? cfg.PAUSA_LARGA_MIN_MS : cfg.PAUSA_MIN_MS;
  const max = esPausaLarga ? cfg.PAUSA_LARGA_MAX_MS : cfg.PAUSA_MAX_MS;
  const espera = Math.floor(min + Math.random() * (max - min));
  Logger.log(`      💤 Pausa${esPausaLarga ? ' larga' : ''} (${etiqueta || 'genérica'}): ${espera}ms`);
  Utilities.sleep(espera);
}

function optimizarTextoGenerico(html) {
  if (!html) return '';
  return html.replace(/<style([\s\S]*?)<\/style>/gi, '')
             .replace(/<script([\s\S]*?)<\/script>/gi, '')
             .replace(/<[^>]+>/g, ' ')
             .replace(/\s+/g, ' ')
             .trim();
}

function limpiarHtml_(texto) {
  let t = texto;
  while (t.indexOf('&amp;') !== -1) {
    t = t.replace(/&amp;/g, '&');
  }
  return t
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function extraerUbicacionDeEmail(texto) {
  if (!texto) return '';
  const patrones = [
    /(?:Location|Ubicación|Country|País|Employer location):\s*([^\r\n<]+)/i,
    /(?:Client|Employer)\s+from\s+([^\r\n<,]+(?:\s*,\s*[^\r\n<]+)?)/i,
    /based in\s+([^\r\n<,]+(?:\s*,\s*[^\r\n<]+)?)/i,
    /(?:located in|ubicado en|desde)\s+([^\r\n<,\.]+(?:\s*,\s*[^\r\n<,\.]+)?)/i
  ];

  for (let patron of patrones) {
    const match = texto.match(patron);
    if (match && match[1]) {
      const loc = match[1].trim();
      if (loc.length > 2 && loc.length < 80) return loc;
    }
  }
  return '';
}

function extraerUbicacionDeUsuarioJSON(userObj, countriesObj) {
  try {
    if (!userObj || !userObj.location) return '';
    let city = userObj.location.city || userObj.location.vicinity || '';
    let countryName = '';
    if (userObj.location.country) {
      if (typeof userObj.location.country === 'object') {
        countryName = userObj.location.country.name || '';
      } else if (typeof userObj.location.country === 'string') {
        countryName = userObj.location.country;
      }
    }
    if (!countryName && userObj.location.country && userObj.location.country.code && countriesObj) {
      const codeOriginal = userObj.location.country.code;
      const codeLower = codeOriginal.toLowerCase();
      const codeUpper = codeOriginal.toUpperCase();
      const entry = countriesObj[codeOriginal] || countriesObj[codeLower] || countriesObj[codeUpper];
      if (entry && entry.name) countryName = entry.name;
    }
    if (city || countryName) {
      return `${city}${city && countryName ? ', ' : ''}${countryName}`.trim();
    }
  } catch (e) {}
  return '';
}