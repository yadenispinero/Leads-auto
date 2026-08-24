# Vista de Componentes Tecnológicos - Leads Auto

Arquitectura simplificada de integraciones y herramientas.

```mermaid
graph TB
    subgraph Externos["🌐 FUENTES EXTERNAS"]
        direction LR
        EXT1["LinkedIn<br/>Perfil"]
        EXT2["Google Drive<br/>Proyectos"]
        EXT3["Plataformas<br/>Certificaciones"]
        EXT4[("Email entrante<br/>Oportunidades")]
        EXT5["Freelancer.com<br/>API"]
    end

    subgraph Google["🔵 GOOGLE WORKSPACE (Core)"]
        direction TB
        
        subgraph Gmail_Layer["Gmail"]
            GMAIL_API["Gmail API"]
            GMAIL_FILTER["Google Scripts<br/>Filtrado duplicados"]
        end
        
        subgraph Sheets_Layer["Google Sheets (Base de datos)"]
            SHEETS_ACTIVOS["📊 Activos y Skills<br/>(Tabla maestra)"]
            SHEETS_OFERTAS_CRUDAS["📋 Ofertas crudas<br/>(Nuevas capturas)"]
            SHEETS_OFERTAS_ENRIQ["📋 Ofertas enriquecidas<br/>(Con datos API)"]
            SHEETS_BACKLOG["📋 Backlog priorizado<br/>(Ordenado por score)"]
            SHEETS_HISTORICO["📊 Histórico<br/>(Resultados y KPIs)"]
        end

        subgraph Drive_Layer["Google Drive"]
            DRIVE_PROPUESTAS["📄 Propuestas<br/>(Borradores y finales)"]
        end

        GMAIL_API -.->|lee| GMAIL_FILTER
        GMAIL_FILTER -->|guarda| SHEETS_OFERTAS_CRUDAS
    end

    subgraph Claude["🟣 CLAUDE (Inteligencia)"]
        direction TB
        CLAUDE_SKILL["Claude Skill<br/>Carga de competencias<br/>(Event-driven)"]
        CLAUDE_API["Claude API<br/>Generación de propuestas<br/>(Tiempo real)"]
    end

    subgraph Externos2["🌐 APIs EXTERNAS"]
        direction LR
        API_FREE["Freelancer.com API"]
        API_OTHER["Otras plataformas<br/>Upwork, etc"]
    end

    subgraph Procesamiento["⚙️ LÓGICA DE PROCESAMIENTO"]
        direction TB
        PROC1["1️⃣ Validar duplicados<br/>(Google Sheets)"]
        PROC2["2️⃣ Normalizar datos<br/>(Google Sheets)"]
        PROC3["3️⃣ Enriquecer con APIs<br/>(APIs externas)"]
        PROC4["4️⃣ Evaluar match<br/>(Claude + Fórmulas)"]
        PROC5["5️⃣ Priorizar<br/>(Google Sheets)"]
        PROC6["6️⃣ Generar propuesta<br/>(Claude API)"]
        PROC7["7️⃣ Enviar<br/>(Gmail API)"]
    end

    %% Conexiones: Externos -> Google
    EXT1 --> CLAUDE_SKILL
    EXT2 --> CLAUDE_SKILL
    EXT3 --> CLAUDE_SKILL
    EXT4 --> GMAIL_API

    %% Conexiones: Claude -> Google Sheets
    CLAUDE_SKILL -->|actualiza| SHEETS_ACTIVOS
    CLAUDE_API -->|lee| SHEETS_ACTIVOS
    CLAUDE_API -->|lee| SHEETS_BACKLOG

    %% Conexiones: Procesamiento
    SHEETS_OFERTAS_CRUDAS --> PROC1
    PROC1 --> PROC2
    PROC2 --> PROC3
    PROC3 -->|enriquece| SHEETS_OFERTAS_ENRIQ
    SHEETS_OFERTAS_ENRIQ --> PROC4
    SHEETS_ACTIVOS -.->|consulta| PROC4
    PROC4 --> PROC5
    PROC5 -->|actualiza| SHEETS_BACKLOG
    SHEETS_BACKLOG --> PROC6
    CLAUDE_API --> PROC6
    PROC6 -->|guarda| DRIVE_PROPUESTAS
    DRIVE_PROPUESTAS --> PROC7
    PROC7 -->|envía| GMAIL_API
    PROC7 -->|registra| SHEETS_HISTORICO

    %% APIs externas
    API_FREE --> PROC3
    API_OTHER --> PROC3

    %% Retroalimentación
    SHEETS_HISTORICO -.->|mejora modelo| CLAUDE_API

    classDef externos fill:#e3f2fd,stroke:#1976d2,color:#0d47a1
    classDef google_core fill:#c8e6c9,stroke:#388e3c,color:#1b5e20
    classDef claude_core fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c
    classDef apis fill:#ffe0b2,stroke:#f57c00,color:#e65100
    classDef proc fill:#fce4ec,stroke:#c2185b,color:#880e4f

    class EXT1,EXT2,EXT3,EXT4,EXT5 externos
    class GMAIL_API,GMAIL_FILTER,SHEETS_ACTIVOS,SHEETS_OFERTAS_CRUDAS,SHEETS_OFERTAS_ENRIQ,SHEETS_BACKLOG,SHEETS_HISTORICO,DRIVE_PROPUESTAS google_core
    class CLAUDE_SKILL,CLAUDE_API claude_core
    class API_FREE,API_OTHER apis
    class PROC1,PROC2,PROC3,PROC4,PROC5,PROC6,PROC7 proc
```

## Stack Tecnológico - Stack Minimizado

### 🟢 **Google Workspace Business** (Núcleo del sistema)

#### Gmail
- **Gmail API**: Lectura de emails con oportunidades
- **Google Scripts**: Filtrado automático, eliminación de duplicados
- **Capacidad**: Procesamiento en tiempo real

**Ejemplo Script:**
```javascript
// Buscar emails no procesados
// Extraer remitente, empresa, descripción
// Calcular hash para detectar duplicados
// Guardar en Google Sheets
```

#### Google Sheets (Base de datos centralizada)
| Tabla | Propósito | Schema |
|-------|-----------|--------|
| **Activos y Skills** | Inventario de competencias | Skill, Nivel, Proyectos, Certificaciones, LinkedIn URL |
| **Ofertas crudas** | Ofertas sin procesar | Fecha, Remitente, Empresa, Descripción, URL, Hash |
| **Ofertas enriquecidas** | Ofertas con datos API | ... + Presupuesto, Skills requeridas, Plataforma |
| **Backlog priorizado** | Ordenadas por relevancia | Oferta, Skills match, Score (0-100), Prioridad, Estado |
| **Histórico** | Seguimiento de resultados | Propuesta, Resultado, Fecha, Ingresos, Métricas |

**Ventajas:**
- ✅ Acceso desde cualquier lugar
- ✅ Colaboración en tiempo real
- ✅ Fórmulas nativas para cálculos
- ✅ Integración nativa con Apps Script
- ✅ Sin costo adicional (incluido en Workspace)

#### Google Drive
- **Almacenamiento**: Propuestas generadas (PDF, Docs, HTML)
- **Versionado**: Historial de cambios automático
- **Integración**: Exportar propuestas para envío por email

#### Google Apps Script
**Automatizaciones:**
- Lectura de Gmail y extracción de datos
- Filtrado de duplicados (consulta Google Sheets)
- Normalización de datos
- Sincronización de Sheets con APIs externas
- Triggers programados

---

### 🟣 **Claude (Pro + API)**

#### Claude Skill (Carga de Competencias)
**Tipo:** Event-driven, ejecutado manualmente o por cambios  
**Función:** Lectura inteligente de LinkedIn, Drive (proyectos), certificaciones

**Proceso:**
1. Lee perfil LinkedIn (HTML/datos)
2. Extrae skills, experiencia, nivel
3. Lee proyectos desde Google Drive
4. Extrae certificaciones desde plataformas
5. Estructura datos en formato normalizado
6. Guarda en Google Sheets (Activos y Skills)

**Costos:** Incluido en Claude Pro (uso mensual limitado)

#### Claude API (Generación de Propuestas)
**Tipo:** On-demand, llamada en tiempo real  
**Función:** Generar propuestas personalizadas

**Entrada:**
```json
{
  "oportunidad": {
    "empresa": "TechCorp",
    "descripción": "Desarrollar API REST",
    "presupuesto": "$5000-$8000",
    "skills_requeridas": ["Python", "FastAPI", "PostgreSQL"]
  },
  "competencias": {
    "skills": ["Python", "FastAPI", "PostgreSQL", "Django"],
    "proyectos_similares": ["Proyecto A", "Proyecto B"],
    "certificaciones": ["AWS Solutions Architect"]
  },
  "template": "propuesta_desarrollo_api_v1"
}
```

**Salida:** Propuesta personalizada (texto + estructura HTML)

**Costos:** Pay-as-you-go (tokens), aproximadamente $0.50-$2 por propuesta

---

### 🌐 **APIs Externas**

#### Freelancer.com API
**Función:** Enriquecer datos de oportunidades  
**Datos obtenidos:**
- Presupuesto exacto
- Skills requeridas (lista de categorías)
- Complejidad del proyecto
- Descripción extendida
- Timeline estimado

**Llamada:** Solo para ofertas nuevas (no procesadas antes)

#### LinkedIn (Lectura manual/semi-automática)
**Función:** Obtener perfil actualizado  
**Datos:** Experiencia, skills, certificaciones, proyectos

**Método:** Lectura manual o script que descarga HTML

#### Plataformas de Certificaciones
**Función:** Validar certificaciones activas  
**Datos:** Nombre, fecha de validación, URL de verificación

---

## Flujo de Datos - Diagrama Simplificado

```
┌─────────────────────────────────────────────────────────┐
│  ENTRADA: Gmail (Oportunidades)                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  FILTRADO: Google Scripts                              │
│  - Extraer datos esenciales                            │
│  - Validar duplicados (Google Sheets)                  │
│  - Normalizar formato                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  GUARDADO: Google Sheets (Ofertas crudas)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ENRIQUECIMIENTO: APIs Externas                        │
│  - Freelancer.com API (solo no procesados)             │
│  - Obtener datos adicionales                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  GUARDADO: Google Sheets (Ofertas enriquecidas)        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  EVALUACIÓN: Claude + Fórmulas Sheets                  │
│  - Consultar Activos y Skills (Google Sheets)          │
│  - Calcular match (Claude)                             │
│  - Priorizar (Score 0-100)                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  BACKLOG: Google Sheets (Ordenado por Score)           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  GENERACIÓN: Claude API                                │
│  - Generar propuesta personalizada                     │
│  - Guardar en Google Drive                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ENVÍO: Gmail API                                      │
│  - Enviar propuesta por email                          │
│  - Registrar en Histórico                              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  SEGUIMIENTO: Google Sheets (Histórico + KPIs)         │
└─────────────────────────────────────────────────────────┘
```

---

## Matriz de Herramientas vs. Funcionalidad

| Función | Herramienta | Alternativa |
|---------|-----------|-----------|
| **Entrada de datos** | Gmail API | Zapier, Make |
| **Filtrado/Deduplicación** | Google Scripts | Node.js, Python |
| **Base de datos** | Google Sheets | Airtable, Supabase |
| **Enriquecimiento de datos** | APIs nativas + Google Scripts | Zapier, Make |
| **Inteligencia (competencias)** | Claude Skill | OpenAI API, Gemini |
| **Inteligencia (propuestas)** | Claude API | OpenAI API, Gemini |
| **Almacenamiento de propuestas** | Google Drive | AWS S3, Dropbox |
| **Envío de emails** | Gmail API | SendGrid, Mailgun |
| **Dashboard/Reportes** | Google Sheets + Charts | Tableau, Metabase |

---

## Estimación de Costos Mensuales

| Servicio | Costo | Notas |
|---------|------|-------|
| Google Workspace Business | $18/mes | Incluye Gmail, Sheets, Drive, Apps Script |
| Claude Pro | $20/mes | Uso limitado (incluido) |
| Claude API (On-demand) | ~$20-50/mes | Depende de volumen de propuestas |
| APIs externas (Freelancer, etc) | $0/mes | Muchas son gratuitas o incluidas |
| **Total** | **~$58-88/mes** | Stack muy eficiente |

---

## Ventajas del Stack Elegido

✅ **Mínimas herramientas**: Solo Google Workspace + Claude  
✅ **Bajo costo**: ~$60-90/mes  
✅ **Sin servidores**: Todo basado en APIs de terceros  
✅ **Escalable**: Fácil aumentar volumen  
✅ **Integración nativa**: Google Sheets ↔ Apps Script  
✅ **Colaboración**: Sheets permite múltiples usuarios  
✅ **Auditoría**: Historial automático en Google Sheets  
✅ **Mantenimiento mínimo**: No hay infraestructura propia  

---

## Próximos Pasos de Implementación

1. **[ ] Sistema 1 - Competencias**
   - Crear Skill de Claude para leer LinkedIn + proyectos
   - Estructurar Google Sheets (Activos y Skills)
   - Configurar trigger para cambios

2. **[ ] Sistema 2 - Captura de Ofertas**
   - Crear Google Script para filtrado en Gmail
   - Schema en Google Sheets (Ofertas crudas)
   - Implementar APIs de plataformas externas

3. **[ ] Sistema 3 - Propuestas**
   - Integrar Claude API para generación
   - Schema en Google Sheets (Backlog)
   - Configurar envío via Gmail API

4. **[ ] Monitoreo y KPIs**
   - Dashboard en Google Sheets
   - Métricas de conversión y ROI
