// ==========================================
// CONSULTA A LA API DE FREELANCER (OAUTH 0.1)
// ==========================================
function obtenerProyectoCompletoDesdeAPI(url) {
  try {
    if (!url || typeof url !== 'string') return null;

    let urlLimpia = url.split('?')[0].split('#')[0].replace(/[\)\}>\.,'"]+$/g, '').trim();

    const matchId = urlLimpia.match(/(\d{7,11})/);
    const projectId = matchId ? matchId[1] : null;

    let seoUrl = null;
    if (!projectId) {
      let partes = urlLimpia.split('/projects/')[1];
      if (partes) {
        seoUrl = partes.replace(/^\/|\/$/g, '');
      }
    }

    let apiUrl = '';
    if (projectId) {
      apiUrl = `https://www.freelancer.com/api/projects/0.1/projects/?projects[]=${projectId}&full_description=true&user_details[basic]=true&user_details[profile_description]=true&user_details[reputation]=true`;
    } else if (seoUrl) {
      apiUrl = `https://www.freelancer.com/api/projects/0.1/projects/?seo_urls[]=${encodeURIComponent(seoUrl)}&full_description=true&user_details[basic]=true&user_details[profile_description]=true&user_details[reputation]=true`;
    } else {
      Logger.log(`⚠️ No se pudo extraer ID ni SEO URL de: ${urlLimpia}`);
      return null;
    }

    const headers = {
      'Accept': 'application/json',
      'freelancer-oauth-v1': FREELANCER_OAUTH_TOKEN.trim(),
      'Authorization': `Bearer ${FREELANCER_OAUTH_TOKEN.trim()}`
    };

    const res = UrlFetchApp.fetch(apiUrl, { muteHttpExceptions: true, headers: headers });
    const codigo = res.getResponseCode();

    if (codigo === 200) {
      const json = JSON.parse(res.getContentText());
      if (json.result && json.result.projects) {
        const pKeys = Object.keys(json.result.projects);
        if (pKeys.length > 0) {
          const project = json.result.projects[pKeys[0]];
          const ownerId = project.owner_id;

          let ubicacion = '';
          if (json.result.users && json.result.users[ownerId]) {
            let u = json.result.users[ownerId];
            ubicacion = extraerUbicacionDeUsuarioJSON(u, json.result.countries);
          }

          let textoCompleto = `TÍTULO DEL PROYECTO: ${project.title}\n`;
          textoCompleto += `DESCRIPCIÓN COMPLETA:\n${project.description}\n`;
          if (project.budget) {
            textoCompleto += `PRESUPUESTO: ${project.budget.minimum || 0} - ${project.budget.maximum || 0} ${project.currency ? project.currency.code : ''}\n`;
          }
          if (ubicacion) textoCompleto += `UBICACIÓN CLIENTE: ${ubicacion}\n`;

          return {
            textoCompleto: textoCompleto,
            ubicacion: ubicacion,
            urlOficial: `https://www.freelancer.com/projects/${project.seo_url || project.id}`
          };
        }
      }
    } else if (codigo === 429) {
      // Señal específica para que quien llama pueda reintentar con backoff, en vez de
      // tratarlo igual que un error genérico.
      Logger.log(`⚠️ Freelancer API: límite de tasa alcanzado (429).`);
      return 'RATE_LIMITED';
    } else {
      Logger.log(`⚠️ Respuesta API Freelancer (${codigo}): ${res.getContentText()}`);
    }
  } catch (e) {
    Logger.log(`⚠️ Error en obtenerProyectoCompletoDesdeAPI: ${e.toString()}`);
  }
  return null;
}