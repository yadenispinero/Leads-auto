// ==========================================
// EXTRACCIÓN Y DEDUPLICACIÓN DE ENLACES
// ==========================================
function extraerLinksProyectosFreelancer(textoCompleto) {
  if (!textoCompleto) return [];

  const regex = /https?:\/\/[^\s"'<>\)]+/gi;
  const links = new Set();
  let match;

  while ((match = regex.exec(textoCompleto)) !== null) {
    let url = match[0].replace(/[\)\}>\.,'"]+$/g, '').trim();
    let u = url.toLowerCase();

    const esProyectoValido = u.includes('freelancer.com/projects/') || u.includes('freelancer.com/click') || u.includes('freelancer.com/e/');
    const esPaginaSistema = u.includes('page.php') || u.includes('/terms') || u.includes('/support') || u.includes('/download') || u.includes('subscriptions.php') || u.includes('give?');

    if (esProyectoValido && !esPaginaSistema) {
      links.add(url);
    }
  }
  return Array.from(links);
}

function desenvolverUrl(url) {
  if (!url.includes('/click') && !url.includes('/e/')) return url;
  try {
    const response = UrlFetchApp.fetch(url, { followRedirects: false, muteHttpExceptions: true });
    const locationHeader = response.getHeaders()['Location'] || response.getHeaders()['location'];
    if (locationHeader) {
      let resuelta = locationHeader.replace(/[\)\}>\.,'"]+$/g, '').trim();
      Logger.log(`🔄 URL Redirigida resuelta: ${resuelta}`);
      return resuelta;
    }
  } catch (e) {
    Logger.log(`⚠️ No se pudo resolver redirección de URL: ${e.toString()}`);
  }
  return url;
}

function extraerClaveProyecto(url) {
  if (!url || typeof url !== 'string') return null;
  let urlLimpia = url.split('?')[0].split('#')[0].replace(/[\)\}>\.,'"]+$/g, '').trim();

  const matchId = urlLimpia.match(/(\d{7,11})/);
  if (matchId) return 'id:' + matchId[1];

  let partes = urlLimpia.split('/projects/')[1];
  if (partes) {
    let seo = partes.replace(/^\/|\/$/g, '').toLowerCase();
    if (seo) return 'seo:' + seo;
  }
  return null;
}