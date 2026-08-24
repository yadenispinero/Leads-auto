# Vista de Procesos y Pasos - Leads Auto

Diagrama detallado de los procesos, actividades, decisiones y pasos del sistema.

```mermaid
flowchart TD
    subgraph Entrada["📧 ENTRADA: GMAIL"]
        direction LR
        E1@{ shape: sm-circ, label: "📧 Nuevo email" }
        E1 --> E2("Gmail API")
    end

    subgraph S1["🔵 SISTEMA 1: CARGA DE COMPETENCIAS"]
        direction TB
        P1_0@{ shape: sm-circ, label: "🔄 Cambio en LinkedIn/Proyectos" }
        P1_1("Claude Skill:<br/>Extraer datos")
        P1_2("Procesar perfil LinkedIn")
        P1_3("Extraer certificaciones")
        P1_4("Extraer proyectos")
        P1_5[("📊 Google Sheets<br/>Activos y Skills")]
        P1_6("⚡ Actualizar índice")

        P1_0 --> P1_1
        P1_1 --> P1_2
        P1_1 --> P1_3
        P1_1 --> P1_4
        P1_2 --> P1_5
        P1_3 --> P1_5
        P1_4 --> P1_5
        P1_5 --> P1_6
    end

    subgraph S2["🟢 SISTEMA 2: EVALUACIÓN Y CAPTURA DE OFERTAS"]
        direction TB
        P2_1("📧 Recibir email")
        P2_2@{ shape: delay, label: "⏱ Google Apps Script" }
        P2_3("Extraer datos esenciales<br/>remitente, empresa, descripción")
        P2_4@{ shape: diamond, label: "✓ ¿Ya procesado?" }
        P2_5@{ shape: text, label: "❌ Duplicado descartado" }
        P2_6("Normalizar datos")
        P2_7("Enriquecer desde APIs<br/>Freelancer.com, etc")
        P2_8("Recuperar skills del<br/>Google Sheets")
        P2_9("Calcular match inicial")
        P2_10[("📋 Google Sheets<br/>Backlog priorizado")]

        P2_1 --> P2_2
        P2_2 --> P2_3
        P2_3 --> P2_4
        P2_4 -->|No| P2_6
        P2_4 -->|Sí| P2_5
        P2_6 --> P2_7
        P2_7 --> P2_8
        P2_8 --> P2_9
        P2_9 --> P2_10
    end

    subgraph S3["🟡 SISTEMA 3: ELABORACIÓN DE PROPUESTAS"]
        direction TB
        P3_1[("📋 Backlog priorizado")]
        P3_2("👤 Seleccionar oportunidad")
        P3_3("Claude API:<br/>Generar propuesta")
        P3_4("Revisar y ajustar")
        P3_5[("📄 Google Drive<br/>Propuesta final")]
        P3_6("Enviar por Gmail")
        P3_7@{ shape: framed-circle, label: "📨 Propuesta enviada" }

        P3_1 --> P3_2
        P3_2 --> P3_3
        P3_3 --> P3_4
        P3_4 --> P3_5
        P3_5 --> P3_6
        P3_6 --> P3_7
    end

    subgraph Seguimiento["📊 SEGUIMIENTO Y RESULTADOS"]
        direction TB
        M1[("📊 Google Sheets<br/>Histórico")]
        M2("Métricas de éxito")
        M3[("📈 Dashboard<br/>Google Sheets")]

        M1 --> M2
        M2 --> M3
    end

    %% Flujo principal
    E2 --> P2_1
    P1_0 -.-> P1_1
    P1_5 -.-> P2_8
    P2_10 --> P3_1
    P3_7 --> M1

    classDef gmail fill:#e3f2fd,stroke:#1976d2,color:#0d47a1
    classDef sistema1 fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c
    classDef sistema2 fill:#e8f5e9,stroke:#388e3c,color:#1b5e20
    classDef sistema3 fill:#fce4ec,stroke:#c2185b,color:#880e4f
    classDef seguimiento fill:#fffde7,stroke:#f9a825,color:#f57f17
    classDef manual fill:#ffebee,stroke:#d32f2f,color:#b71c1c

    class Entrada gmail
    class S1 sistema1
    class S2 sistema2
    class S3 sistema3
    class Seguimiento seguimiento
    class P3_2 manual

    style P2_2 stroke-width:3px
    style P1_0 stroke-dasharray:5 5
    style P1_1 stroke-width:2px
    style P3_3 stroke-width:2px
```

## Descripción Detallada de Procesos

### 📧 Entrada: Gmail
**Trigger:** Nuevo email en buzón específico

---

### 🔵 Sistema 1: Carga de Competencias
**Tipo:** Event-driven (solo cuando hay cambios)  
**Frecuencia:** Manual/automático en cambios  
**Responsabilidad:** Mantener inventario actualizado de skills

| Paso | Herramienta | Descripción |
|------|-------------|------------|
| 1.0 | 🔄 Evento | Cambio detectado en LinkedIn/Proyectos/Certificaciones |
| 1.1 | 🟣 Claude Skill | Leer datos de origen (LinkedIn, Drive con proyectos) |
| 1.2 | 🟣 Claude Skill | Extraer y estructurar perfil LinkedIn |
| 1.3 | 🟣 Claude Skill | Extraer certificaciones y validaciones |
| 1.4 | 🟣 Claude Skill | Extraer proyectos y casos de éxito |
| 1.5 | 💾 Google Sheets | Guardar activos, skills y competencias |
| 1.6 | ⚡ Automático | Actualizar índices y referencias cruzadas |

**Output:** Google Sheets con schema:
```
Skill | Nivel | Proyectos | Certificaciones | LinkedIn URL | Última actualización
```

---

### 🟢 Sistema 2: Evaluación y Captura de Ofertas
**Tipo:** Automático  
**Frecuencia:** Tiempo real (cada email)  
**Responsabilidad:** Procesar, enriquecer y evaluar ofertas para priorización

#### 2.1 - Procesamiento en Google Apps Script (Drive)
El Google Apps Script ejecuta **todo el procesamiento de forma integrada y completa** antes de guardar en Google Sheets. Ningún dato intermedio llega a la hoja.

| Paso | Herramienta | Descripción |
|------|-------------|------------|
| 2.1 | 📧 Gmail | Recibir nuevo email con oportunidad |
| 2.2 | 📝 Google Apps Script | Ejecutar script de procesamiento completo |
| 2.3 | ⚡ Automático | Extraer: remitente, empresa, descripción, URL |
| 2.4 | ✓ Validación | Consultar Google Sheets: ¿Hash ya procesado? |
| 2.4a | ❌ Si duplicado | Marcar como duplicado, no procesar |
| 2.4b | ✅ Si nuevo | Continuar al paso 2.5 |
| 2.5 | ⚡ Automático | Normalizar datos extraídos |
| 2.6 | 🌐 API externa | Enriquecer desde Freelancer.com API (solo no procesados antes) |
| 2.6a | ⚡ Automático | Obtener datos adicionales: presupuesto, skills requeridas, complejidad, etc |

**Datos enriquecidos obtenidos:**
```
Fecha | Remitente | Empresa | Descripción | URL | Hash | Estado
+ Presupuesto | Skills requeridas | Complejidad | Plataforma
```

#### 2.2 - Evaluación y Priorización
| Paso | Herramienta | Descripción |
|------|-------------|------------|
| 2.7 | 💾 Google Sheets | Guardar **datos completamente procesados y enriquecidos** (solo cuando están listos) |
| 2.8 | 🟣 Claude | Evaluar match entre oferta y skills disponibles |
| 2.9 | 📊 Fórmula | Calcular score (0-100) |
| 2.10 | 📋 Google Sheets | Guardar en "Backlog priorizado" (ordenado por score) |

**Schema final en Google Sheets:**
```
Oferta | Presupuesto | Skills match | Score | Prioridad | Estado | Asignado
```

---

### 🟡 Sistema 3: Elaboración de Propuestas
**Tipo:** Semi-automático (requiere revisión manual)  
**Frecuencia:** Según disponibilidad  
**Responsabilidad:** Generar propuestas personalizadas

| Paso | Herramienta | Descripción |
|------|-------------|------------|
| 3.1 | 📋 Google Sheets | Obtener siguiente oportunidad del backlog |
| 3.2 | 👤 Manual | Revisar oportunidad y decidir si proceder |
| 3.3 | 🟣 Claude API | Generar propuesta personalizada con contexto |
| 3.4 | 👤 Manual | Revisar, ajustar, validar propuesta |
| 3.5 | 📄 Google Drive | Guardar propuesta (PDF o Docs) |
| 3.6 | 📧 Gmail | Enviar por email al cliente |
| 3.7 | 📋 Google Sheets | Registrar envío (fecha, resultado) |

**Entrada a Claude API:**
```json
{
  "oferta": { "empresa", "descripción", "presupuesto", "skills requeridas" },
  "competencias": { "skills disponibles", "proyectos similares", "certificaciones" },
  "template": "propuesta_estándar_v1"
}
```

---

### 📊 Seguimiento y Resultados
| Paso | Herramienta | Descripción |
|------|-------------|------------|
| M.1 | 📋 Google Sheets | Registrar resultado de propuesta (aceptada/rechazada) |
| M.2 | ⚡ Fórmulas | Calcular: tasa de conversión, tiempo promedio, ingresos |
| M.3 | 📈 Dashboard | Mostrar KPIs en Google Sheets |

---

## Leyenda de Herramientas

| Símbolo | Herramienta | Uso |
|---------|-----------|-----|
| 📧 | Gmail API | Entrada de oportunidades |
| 📝 | Google Apps Script | Procesamiento automático completo (extraer, validar, enriquecer) |
| 🟣 | Claude (Pro/API) | Procesamiento inteligente |
| 💾 | Google Sheets | Almacenamiento principal (solo datos finales) |
| 📄 | Google Drive | Documentos y propuestas |
| 🌐 | APIs externas | Enriquecimiento de datos |
| ⚡ | Fórmulas Sheets | Cálculos y automatización |
| 👤 | Manual | Intervención humana |

---

## Matriz de Responsabilidades

```
Sistema 1 (Competencias)
├── Trigger: Cambios en LinkedIn/Proyectos
├── Responsable: Claude Skill
├── Datos: Google Sheets (Activos y Skills)
└── Frecuencia: Event-driven (manual + monitoreo)

Sistema 2 (Ofertas)
├── Trigger: Nuevo email
├── Responsable: Google Apps Script (procesamiento integrado) + Claude
├── Datos: Google Sheets (Backlog priorizado - datos completamente procesados)
├── Ubicación del enriquecimiento: **Dentro del Google Apps Script del Drive**
└── Frecuencia: Tiempo real

Sistema 3 (Propuestas)
├── Trigger: Revisión manual de backlog
├── Responsable: Claude API + Manual humano
├── Datos: Google Sheets (Estado) + Google Drive (Propuestas)
└── Frecuencia: A demanda
```

---

## Implementación: Tecnologías Clave

### Google Workspace
- **Gmail API**: Leer emails y enviar propuestas
- **Sheets API**: CRUD en tablas (ofertas, backlog) - solo datos finales
- **Drive API**: Guardar propuestas generadas
- **Apps Script**: Procesamiento automático integrado (extracción, validación, enriquecimiento desde APIs)

### Claude
- **Claude Skill**: Carga puntual de competencias (event-driven)
- **Claude API**: Generación de propuestas en tiempo real

### Datos Externos
- **Freelancer.com API**: Enriquecer ofertas dentro del Google Apps Script
- **LinkedIn**: Perfil y certificaciones (lectura manual/automatizada)
- **Google Drive**: Almacenar proyectos y casos de éxito
