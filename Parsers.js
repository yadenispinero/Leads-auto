// ==========================================
// PARSERS DE EXTRACCIÓN DE OFERTAS — LEADS FREELANCE
// ==========================================
function extraerOfertas_(remitente, textoPlano, html) {
  let ofertas = [];
  let plataforma = '';
  const remitenteLower = (remitente || '').toLowerCase();

  if (remitenteLower.includes('freelancer.com') || remitenteLower.includes('notifications.freelancer.com')) {
    plataforma = 'Freelancer.com';
    ofertas = parseFreelancerCom_(html, textoPlano);
  } else if (remitenteLower.includes('freelance.de')) {
    plataforma = 'freelance.de';
    ofertas = parseFreelanceDe_(textoPlano);
  } else if (remitenteLower.includes('malt.com') || remitenteLower.includes('malt.fr') || remitenteLower.includes('malt.de') || remitenteLower.includes('malt.es')) {
    plataforma = 'Malt';
    ofertas = parseMalt_(textoPlano, html);
  } else {
    Logger.log(`⚠️ Remitente no reconocido, se omite: ${remitente}`);
    plataforma = 'Otro (' + remitente + ')';
  }

  ofertas.forEach((o) => { o.plataforma = plataforma; });
  return ofertas;
}

// ==========================================
// FREELANCER.COM
// ==========================================
function parseFreelancerCom_(htmlBody, plainBody) {
  const ofertas = [];
  const texto = plainBody || optimizarTextoGenerico(htmlBody);

  // El cuerpo de texto plano de Freelancer.com trae los links como RUTAS RELATIVAS
  // (ej. "/projects/web-design/Titulo.html?..."), no URLs completas — hay que anteponerles
  // el dominio antes de que extraerLinksProyectosFreelancer (que solo reconoce URLs
  // absolutas con http/https) pueda encontrarlas.
  const textoConUrlsAbsolutas = texto.replace(/(^|[\s(])\/projects\//g, '$1https://www.freelancer.com/projects/');

  const links = extraerLinksProyectosFreelancer(textoConUrlsAbsolutas);

  for (let link of links) {
    link = desenvolverUrl(link);
    const urlLimpia = link.split('?')[0];

    // Heurístico: el título suele ser la línea justo antes del link dentro del bloque del correo
    const idx = textoConUrlsAbsolutas.indexOf(link.split('?')[0]);
    let titulo = '';
    if (idx > -1) {
      const bloqueAntes = textoConUrlsAbsolutas.substring(Math.max(0, idx - 400), idx);
      const lineas = bloqueAntes.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      titulo = lineas.length > 0 ? lineas[lineas.length - 1] : '';
    }

    ofertas.push({
      puesto: titulo || 'Oferta Freelancer.com (sin título detectado)',
      empresa: '',
      link: urlLimpia,
      detectedLocation: ''
    });
  }

  return ofertas;
}

// ==========================================
// FREELANCE.DE (correo delgado, sin API — el texto completo se obtiene por scraping en GmailProcessor.gs)
// ==========================================
function parseFreelanceDe_(plainBody) {
  const ofertas = [];
  if (!plainBody) return ofertas;

  // Bloques tipo:
  // --------------------  --------------------
  // Título | Modalidad | Código
  // fecha
  // Ubicación
  //
  // https://www.freelance.de/projekte/...
  const regexBloque = /-{10,}\s*-{10,}\s*\n\s*(.+?)\n\s*(.+?)\n\s*(.+?)\n\s*\n\s*(https?:\/\/www\.freelance\.de\/projekte\/[^\s]+)/gs;
  let match;
  while ((match = regexBloque.exec(plainBody)) !== null) {
    const titulo = match[1].trim();
    const ubicacion = match[3].trim();
    const url = match[4].split('?')[0].trim();

    if (titulo && titulo.length > 3) {
      ofertas.push({
        puesto: titulo,
        empresa: '',
        link: url,
        detectedLocation: ubicacion
      });
    }
  }

  return ofertas;
}

// ==========================================
// MALT — pendiente, sin muestra de correo real todavía
// ==========================================
function parseMalt_(plainBody, htmlBody) {
  // TODO: construir el parser real en cuanto tengamos un .eml de ejemplo de Malt.
  // Por ahora devuelve vacío para no romper el flujo ni inventar una estructura sin verificar.
  Logger.log('ℹ️ parseMalt_ todavía no está implementado — pendiente de correo de ejemplo.');
  return [];
}