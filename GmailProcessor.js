// ==========================================
// FLUJO PRINCIPAL DE ADQUISICIÓN
// ==========================================
const TIEMPO_MAXIMO_MS = 4.5 * 60 * 1000; // deja margen bajo el límite real de 6 min de Apps Script

function main() {
  const tiempoInicio = Date.now();
  const labelRevisados = getOrCreateLabel_(CONFIG.LABEL_REVISADOS);
  const labelOfertas = GmailApp.getUserLabelByName(CONFIG.LABEL_OFERTAS);

  const sheetCand = SpreadsheetApp.openById(ID_HOJA_CANDIDATAS).getSheetByName(NOMBRE_HOJA_CANDIDATAS);
  const sheetEvaluacion = SpreadsheetApp.openById(CONFIG.INDICE_SHEET_ID).getSheetByName(CONFIG.INDICE_SHEET_TAB);

  // Dedup por CLAVE DE PROYECTO (no por empresa+puesto — eso era del buscador de empleo)
  const clavesExistentes = obtenerClavesExistentes_(sheetCand, sheetEvaluacion);
  Logger.log(`📊 DEBUG: ${clavesExistentes.size} claves de proyecto ya conocidas (Candidatas + Evaluación).`);

  const query = construirQueryBusqueda_();
  const threads = GmailApp.search(query, 0, 50);
  Logger.log(`📧 Hilos encontrados: ${threads.length}`);

  const linksVistosEnEstaCorrida = new Set();
  let scrapesFreelanceDeUsados = 0;

  let totalOfertasExtraidas = 0;
  let totalDuplicadas = 0;
  let totalGuardadas = 0;

  for (const thread of threads) {
    if (Date.now() - tiempoInicio > TIEMPO_MAXIMO_MS) {
      Logger.log('⏸️ Tiempo máximo alcanzado, se detiene esta corrida. Los hilos restantes quedan pendientes para la próxima.');
      break;
    }

    const messages = thread.getMessages();
    messages.forEach((message) => {
      const yaEtiquetado = thread.getLabels().some((l) => l.getName() === CONFIG.LABEL_REVISADOS);
      if (yaEtiquetado) return;

      const remitente = message.getFrom();
      const textoPlano = message.getPlainBody();
      const html = message.getBody();

      Logger.log(`📧 Procesando correo de: ${remitente} | Asunto: ${message.getSubject()}`);

      const ofertas = extraerOfertas_(remitente, textoPlano, html);
      Logger.log(`   -> Ofertas extraídas del parser: ${ofertas.length}`);
      totalOfertasExtraidas += ofertas.length;

      ofertas.forEach((oferta) => {
        Logger.log(`      -> Oferta: ${oferta.puesto} | Plataforma: ${oferta.plataforma} | Link: ${oferta.link}`);

        if (linksVistosEnEstaCorrida.has(oferta.link)) {
          Logger.log(`      ⏭️ Omitida por duplicado interno (mismo link en la corrida).`);
          return;
        }
        linksVistosEnEstaCorrida.add(oferta.link);

        const clave = extraerClaveProyecto(oferta.link);
        if (clave && clavesExistentes.has(clave)) {
          Logger.log(`      ⏭️ Omitida por clave de proyecto ya conocida (${clave}).`);
          totalDuplicadas++;
          return;
        }

        // 1. OBTENER TEXTO COMPLETO — según plataforma
        let textoCompleto = textoPlano;
        let ubicacionDetectada = oferta.detectedLocation || '';

        if (oferta.plataforma === 'Freelancer.com') {
          const datosApi = llamarAPIFreelancerConReintentos_(oferta.link);
          if (datosApi) {
            textoCompleto = datosApi.textoCompleto;
            if (datosApi.ubicacion) ubicacionDetectada = datosApi.ubicacion;
          } else {
            Logger.log(`      ⚠️ API de Freelancer.com no respondió, usando solo texto del correo.`);
          }
        } else if (oferta.plataforma === 'freelance.de') {
          if (scrapesFreelanceDeUsados < MAX_SCRAPES_FREELANCE_DE_POR_CORRIDA) {
            pausaHumana_(RATE_LIMIT_CONFIG.SCRAPING_FREELANCE_DE, 'antes de scrape freelance.de');
            const scrapeado = scrapearPaginaLigero_(oferta.link);
            scrapesFreelanceDeUsados++;
            if (scrapeado === 'CERRADO') {
              Logger.log(`      ⏭️ Proyecto cerrado, se omite por completo: ${oferta.puesto}`);
              return; // sale del forEach de esta oferta, no se guarda nada
            } else if (scrapeado) {
              textoCompleto = scrapeado;
              Logger.log(`      🌐 Scrape ${scrapesFreelanceDeUsados}/${MAX_SCRAPES_FREELANCE_DE_POR_CORRIDA} OK.`);
            } else {
              Logger.log(`      ⚠️ Scrape falló, usando solo texto del correo.`);
            }
          } else {
            Logger.log(`      ⏸️ Límite de scraping de freelance.de alcanzado, usando solo texto del correo.`);
          }
        } else if (oferta.plataforma === 'Malt') {
          Logger.log(`      ℹ️ Malt aún no tiene parser — se guarda solo con el texto del correo, revisar manualmente.`);
        }

        // 2. GUARDAR TEXTO COMPLETO EN GOOGLE DRIVE (nunca en la celda — la hoja se queda liviana)
        let driveUrl = '';
        if (DRIVE_FOLDER_ID && textoCompleto) {
          try {
            const nombreArchivo = 'Oferta_' + (oferta.puesto || 'Sin_Titulo').substring(0, 30) + '_' + Date.now();
            const doc = DriveApp.createFile(nombreArchivo, textoCompleto, MimeType.PLAIN_TEXT);
            doc.moveTo(DriveApp.getFolderById(DRIVE_FOLDER_ID));
            driveUrl = doc.getUrl();
          } catch (e) {
            Logger.log(`      ⚠️ Error guardando en Drive: ${e.toString()}`);
          }
        } else if (!DRIVE_FOLDER_ID) {
          Logger.log(`      ⚠️ DRIVE_FOLDER_ID vacío en Config.gs — el texto completo no se está archivando en Drive.`);
        }

        // 3. ESCRIBIR EN "CANDIDATAS" (liviana — sin texto bruto, solo el link a Drive)
        const proximoNum = sheetCand.getLastRow(); // aprox., suficiente para un ID legible, no es clave de dedup
        const idCandidata = `CAND-${new Date().getFullYear()}-${String(proximoNum).padStart(4, '0')}`;

        sheetCand.appendRow([
          idCandidata,                    // CAND_COL_ID
          oferta.link,                    // CAND_COL_URL
          oferta.puesto,                  // CAND_COL_TITULO
          oferta.plataforma,              // CAND_COL_PLATAFORMA
          ubicacionDetectada,             // CAND_COL_UBICACION
          clave || '',                    // CAND_COL_CLAVE_PROYECTO (precalculada, ya la teníamos)
          new Date(),                     // CAND_COL_FECHA
          'Pendiente',                    // CAND_COL_ESTADO
          thread.getPermalink(),          // CAND_COL_PERMALINK
          driveUrl                        // CAND_COL_DRIVE_URL
        ]);

        totalGuardadas++;
        if (clave) clavesExistentes.add(clave);
        Logger.log(`      ✅ Guardada en Candidatas.`);
      });
    });
    thread.addLabel(labelRevisados);
    if (labelOfertas) thread.removeLabel(labelOfertas);
  }

  Logger.log("===============================");
  Logger.log(`📊 RESUMEN FINAL:`);
  Logger.log(`   Correos procesados: ${threads.length}`);
  Logger.log(`   Ofertas extraídas por parsers: ${totalOfertasExtraidas}`);
  Logger.log(`   Omitidas por clave de proyecto ya conocida: ${totalDuplicadas}`);
  Logger.log(`   Guardadas en Candidatas: ${totalGuardadas}`);
}

// ==========================================
// DEDUP — lee claves de Candidatas Y Evaluación de Leads
// ==========================================
function obtenerClavesExistentes_(sheetCandidatas, sheetEvaluacion) {
  const claves = new Set();

  // Candidatas ya guarda la clave precalculada — se lee directo, sin recomputar.
  if (sheetCandidatas) {
    const lastRow = sheetCandidatas.getLastRow();
    if (lastRow >= 2) {
      const valores = sheetCandidatas.getRange(2, CAND_COL_CLAVE_PROYECTO + 1, lastRow - 1, 1).getValues();
      for (const [val] of valores) {
        if (val) claves.add(String(val));
      }
    }
  }

  // Evaluación de Leads no tiene columna de clave — se calcula desde la URL.
  if (sheetEvaluacion) {
    const lastRow = sheetEvaluacion.getLastRow();
    if (lastRow >= 2) {
      const valores = sheetEvaluacion.getRange(2, 3, lastRow - 1, 1).getValues(); // columna C: URL_Oferta — AJUSTAR si difiere
      for (const [val] of valores) {
        const clave = extraerClaveProyecto(String(val || ''));
        if (clave) claves.add(clave);
      }
    }
  }

  return claves;
}

// ==========================================
// LLAMADA A LA API DE FREELANCER CON PAUSA HUMANA + REINTENTO ANTE 429
// ==========================================
function llamarAPIFreelancerConReintentos_(url) {
  const cfg = RATE_LIMIT_CONFIG.API_FREELANCER;
  let intento = 0;

  while (true) {
    pausaHumana_(cfg, 'antes de llamada API Freelancer');
    const resultado = obtenerProyectoCompletoDesdeAPI(url);

    if (resultado === 'RATE_LIMITED') {
      intento++;
      if (intento > cfg.MAX_REINTENTOS_429) {
        Logger.log(`      ⚠️ Se agotaron los ${cfg.MAX_REINTENTOS_429} reintentos por límite de tasa (429).`);
        return null;
      }
      const esperaBackoff = cfg.PAUSA_BASE_BACKOFF_MS * Math.pow(cfg.BACKOFF_MULTIPLICADOR, intento - 1);
      Logger.log(`      ⏳ 429 recibido — reintento ${intento}/${cfg.MAX_REINTENTOS_429} tras ${esperaBackoff}ms.`);
      Utilities.sleep(esperaBackoff);
      continue;
    }

    return resultado; // null (otro tipo de error) o el objeto real con textoCompleto/ubicacion
  }
}

// ==========================================
// SCRAPING LIGERO GENÉRICO (usado por freelance.de)
// ==========================================
function scrapearPaginaLigero_(url) {
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    if (res.getResponseCode() !== 200) {
      Logger.log(`      ⚠️ Scrape respondió ${res.getResponseCode()} para ${url}`);
      return null;
    }

    let texto = limpiarPaginaScrapeada_(res.getContentText());

    // Detectar proyecto cerrado — no vale la pena guardarlo como candidata activa.
    if (/dieses projekt wurde .*geschlossen|projekt .*abgelaufen|keine bewerbungen mehr möglich/i.test(texto)) {
      Logger.log(`      🚫 Proyecto cerrado/expirado, se omite: ${url}`);
      return 'CERRADO';
    }

    return texto.substring(0, 8000);
  } catch (e) {
    Logger.log(`      ⚠️ Error de scraping: ${e.toString()}`);
    return null;
  }
}

// Limpieza más agresiva que limpiarHtml_ genérico: quita <script>/<style> completos
// (antes se colaba el código de Google Tag Manager) y colapsa el exceso de líneas en blanco.
function limpiarPaginaScrapeada_(html) {
  let t = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n');

  while (t.indexOf('&amp;') !== -1) t = t.replace(/&amp;/g, '&');
  t = t.replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

  // Colapsar 3+ líneas en blanco seguidas a solo 2, y espacios repetidos a uno solo
  t = t.replace(/[ \t]+/g, ' ')
       .replace(/\n{3,}/g, '\n\n')
       .split('\n').map(l => l.trim()).join('\n')
       .replace(/\n{3,}/g, '\n\n');

  return t.trim();
}

// ==========================================
// FUNCIONES AUXILIARES DE GMAIL (sin cambios)
// ==========================================
function getOrCreateLabel_(nombre) {
  let label = GmailApp.getUserLabelByName(nombre);
  if (!label) label = GmailApp.createLabel(nombre);
  return label;
}

function construirQueryBusqueda_() {
  const propsService = PropertiesService.getScriptProperties();
  const primeraVez = !propsService.getProperty('YA_EJECUTADO');
  let query = `label:${CONFIG.LABEL_OFERTAS} -label:${CONFIG.LABEL_REVISADOS}`;
  if (primeraVez) {
    query += ` newer_than:${CONFIG.DIAS_ATRAS_PRIMERA_VEZ}d`;
    propsService.setProperty('YA_EJECUTADO', 'true');
  }
  return query;
}