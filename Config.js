const CONFIG = {
  INDICE_SHEET_ID: '18oS5N9q8OFkqoFMLFbs1kKnoQBKmhMJJZqXcoLS4_uY',
  INDICE_SHEET_TAB: 'Evaluación de Leads',
  EMAIL_DESTINO: 'yadenis@yfokus.de',
  LABEL_OFERTAS: 'Ofertas/A_Procesar',
  LABEL_REVISADOS: 'Ofertas/Procesadas',
  // Dominios reales de las plataformas de freelance (ya no de empleo)
  DOMINIOS_BUSQUEDA: ['freelancer.com', 'freelance.de', 'malt.com'],
  DIAS_ATRAS_PRIMERA_VEZ: 30,
};

// --- CONFIGURACIÓN PARA EL FLUJO DE CANDIDATAS Y DRIVE ---
const ID_HOJA_CANDIDATAS = '1t29fQ2Mk6xB699evx3RwKgSf7A-zQgmz1BBbIqtKhYQ';
const NOMBRE_HOJA_CANDIDATAS = 'Candidatas';

// ID de la carpeta en Google Drive donde se guardarán los textos completos.
// Pega aquí el ID de tu carpeta (créala una vez en Drive y copia el ID de su URL).
const DRIVE_FOLDER_ID = ''; // <-- PENDIENTE: pegar el ID de la carpeta

// Índices de columnas (0-based) en la hoja Candidatas — estructura liviana, sin texto bruto
const CAND_COL_ID = 0;              // A: ID_Candidata
const CAND_COL_URL = 1;             // B: URL
const CAND_COL_TITULO = 2;          // C: Titulo
const CAND_COL_PLATAFORMA = 3;      // D: Plataforma
const CAND_COL_UBICACION = 4;       // E: Ubicacion
const CAND_COL_CLAVE_PROYECTO = 5;  // F: Clave_Proyecto (precalculada)
const CAND_COL_FECHA = 6;           // G: Fecha_Deteccion
const CAND_COL_ESTADO = 7;          // H: Estado
const CAND_COL_PERMALINK = 8;       // I: Permalink_Correo
const CAND_COL_DRIVE_URL = 9;       // J: Drive_URL

// Claves/tokens en Script Properties (Extensiones → Apps Script → ⚙️ → Propiedades del script)
const FREELANCER_OAUTH_TOKEN = PropertiesService.getScriptProperties().getProperty('FREELANCER_OAUTH_TOKEN');

// Límite de scraping ligero para freelance.de (no tiene API oficial) — se resetea cada corrida
const MAX_SCRAPES_FREELANCE_DE_POR_CORRIDA = 5;

// ==========================================
// COMPORTAMIENTO "HUMANO" — pausas aleatorias configurables
// Freelancer.com no publica un límite de tasa documentado, así que en vez de adivinar
// un número fijo, se combina: pausas variables (no robóticas) + reacción real a 429.
// ==========================================
const RATE_LIMIT_CONFIG = {
  API_FREELANCER: {
    PAUSA_MIN_MS: 2000,
    PAUSA_MAX_MS: 5000,
    PROBABILIDAD_PAUSA_LARGA: 0.15,      // 15% de las veces, una pausa más larga (como si alguien se distrajera)
    PAUSA_LARGA_MIN_MS: 8000,
    PAUSA_LARGA_MAX_MS: 15000,
    MAX_REINTENTOS_429: 3,
    PAUSA_BASE_BACKOFF_MS: 5000,         // al recibir 429: 5s, luego 10s, luego 20s...
    BACKOFF_MULTIPLICADOR: 2
  },
  SCRAPING_FREELANCE_DE: {
    PAUSA_MIN_MS: 2500,
    PAUSA_MAX_MS: 6000,
    PROBABILIDAD_PAUSA_LARGA: 0.20,
    PAUSA_LARGA_MIN_MS: 10000,
    PAUSA_LARGA_MAX_MS: 20000
  }
};