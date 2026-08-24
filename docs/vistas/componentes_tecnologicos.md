# Vista de Componentes Tecnológicos - Leads Auto

Descripción detallada de los componentes tecnológicos, integraciones y flujos de datos del sistema.

---

## 📋 Leyenda de Estados y Estilos

### Estados de Componentes

```
🟢 TERMINADO (v1)       → Componente implementado y funcional
🟡 EN DESARROLLO        → Componente iniciado pero no terminado
🔴 PROYECTADO           → Componente diseñado pero no iniciado
```

### Significado de Colores en Gráficos

| Color | Tipo | Significado |
|-------|------|------------|
| 🔵 **Azul** (`#e3f2fd`) | Gmail y APIs de entrada | Punto de entrada del sistema, lectura de datos externos |
| 🟣 **Púrpura** (`#f3e5f5`) | Procesamiento/Claude | Lógica inteligente, transformación, generación de contenido |
| 🟢 **Verde** (`#e8f5e9`) | Almacenamiento | Bases de datos, Google Sheets, persistencia de datos |
| 🟠 **Naranja** (`#fff3e0`) | Integraciones Externas | APIs externas, fuentes de datos terceros |

### Tipos de Líneas en Gráficos

| Línea | Tipo | Significado |
|-------|------|------------|
| `→` **Línea sólida** | Flujo principal directo | Datos fluyen directamente de componente a componente |
| `-.->` **Línea punteada** | Flujo de referencia | Consulta/lectura sin modificar datos (VLOOKUP, references) |
| **Grosor normal** | Proceso estándar | Operación regular del sistema |
| **Grosor triple** | Proceso crítico | Operación importante, trigger, punto de decisión |
| **Línea discontinua** | Conexión condicional | Sucede bajo ciertas condiciones |

### Leyenda de Símbolos en Nodos

| Símbolo | Significado |
|---------|------------|
| 📧 | Gmail, Email, comunicación |
| ⚙️ | Procesamiento, Scripts, automatización |
| 💾 | Almacenamiento, base de datos |
| 🔗 | Conexión externa, API, integración |
| 🟢/🟡/🔴 | Estado: Terminado / En desarrollo / Proyectado |

---

## Arquitectura de Componentes (Por Capas)

```mermaid
graph TB
    subgraph "📧 Capa de Entrada"
        Gmail["📧 Gmail<br/>(Buzón de oportunidades)"]
        GmailAPI["🔵 Gmail API<br/>(Lectura de emails)"]
    end

    subgraph "⚙️ Capa de Procesamiento"
        GAS["⚙️ Google Apps Script<br/>(Cron cada 4 horas)"]
        
        subgraph Claude["🟣 CLAUDE (Inteligencia)"]
            ClaudeSkill["Claude Skill<br/>(Extracción capacidades)"]
            ClaudeAPI["Claude API<br/>(Generación propuestas)"]
        end
    end

    subgraph "💾 Capa de Almacenamiento"
        SheetsInventario["💾 Google Sheets<br/>Inventario_Capacidades"]
        SheetsEvaluacion["💾 Google Sheets<br/>Evaluación Fórmulas"]
        SheetsBacklog["💾 Google Sheets<br/>Backlog Priorizado"]
        Drive["📄 Google Drive<br/>(Propuestas guardadas)"]
    end

    subgraph "🔗 Integraciones Externas"
        Freelancer["🌐 Freelancer.com API<br/>(Enriquecimiento)"]
        LinkedIn["🌐 LinkedIn<br/>(Perfil y certificaciones)"]
    end

    %% Conexiones
    Gmail --> GmailAPI
    GmailAPI --> GAS
    GAS --> Freelancer
    GAS --> SheetsEvaluacion
    
    SheetsInventario -.->|VLOOKUP/INDEX-MATCH| SheetsEvaluacion
    SheetsEvaluacion -.->|Ordenamiento automático| SheetsBacklog
    
    ClaudeSkill --> SheetsInventario
    LinkedIn -.->|Lectura manual| ClaudeSkill
    
    SheetsBacklog --> ClaudeAPI
    ClaudeAPI --> Drive
    Drive --> Gmail
    
    SheetsInventario -.->|Referencia| ClaudeAPI

    classDef entrada fill:#e3f2fd,stroke:#1976d2,color:#0d47a1
    classDef proceso fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c
    classDef almacen fill:#e8f5e9,stroke:#388e3c,color:#1b5e20
    classDef externo fill:#fff3e0,stroke:#e65100,color:#bf360c
    classDef claude fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c,stroke-width:3px

    class Gmail,GmailAPI entrada
    class GAS proceso
    class Claude claude
    class ClaudeSkill,ClaudeAPI proceso
    class SheetsInventario,SheetsEvaluacion,SheetsBacklog,Drive almacen
    class Freelancer,LinkedIn externo
```

---

## Componentes con Estados de Implementación

```mermaid
graph TB
    subgraph "🟢 TERMINADO (v1)"
        T1["📧 Gmail API"]
        T2["💾 Google Sheets<br/>Inventario_Capacidades"]
    end

    subgraph "🟡 EN DESARROLLO"
        D1["⚙️ Google Apps Script<br/>(Cron cada 4 horas)"]
        D2["💾 Google Sheets<br/>Evaluación (Fórmulas)"]
        D3["💾 Google Sheets<br/>Backlog Priorizado"]
        D4["🟣 Claude Skill<br/>(Extracción capacidades)"]
    end

    subgraph "🔴 PROYECTADO"
        P1["🟣 Claude API<br/>(Generación propuestas)"]
        P2["📄 Google Drive<br/>(Almacenamiento propuestas)"]
        P3["🌐 Freelancer.com API<br/>(Enriquecimiento)"]
        P4["📊 Dashboard KPIs"]
    end

    T1 --> D1
    T2 -.-> D2
    D1 --> D2
    D2 --> D3
    D4 --> T2
    D3 --> P1
    P1 --> P2

    classDef terminado fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    classDef desarrollo fill:#fff9c4,stroke:#fbc02d,stroke-width:3px,color:#f57f17
    classDef proyectado fill:#ffccbc,stroke:#d84315,stroke-width:2px,color:#bf360c

    class T1,T2 terminado
    class D1,D2,D3,D4 desarrollo
    class P1,P2,P3,P4 proyectado
```

---

## Arquitectura de Componentes (Por Capas) - Detallado con Iconos

```mermaid
graph TB
    subgraph "📧 CAPA DE ENTRADA"
        Gmail["📧 Gmail<br/>(Buzón de oportunidades)<br/>🟢 TERMINADO"]
        GmailAPI["🔵 Gmail API<br/>(Lectura de emails)<br/>🟢 TERMINADO"]
    end

    subgraph "⚙️ CAPA DE PROCESAMIENTO"
        GAS["⚙️ Google Apps Script<br/>(Cron cada 4 horas)<br/>🟡 EN DESARROLLO"]
        
        subgraph Claude["🟣 CLAUDE (IA/Inteligencia AI)"]
            ClaudeSkill["🟣 Claude Skill<br/>(Extracción capacidades)<br/>🟡 EN DESARROLLO"]
            ClaudeAPI["🟣 Claude API<br/>(Generación propuestas)<br/>🔴 PROYECTADO"]
        end
    end

    subgraph "💾 CAPA DE ALMACENAMIENTO"
        SheetsInventario["💾 Google Sheets<br/>Inventario_Capacidades<br/>🟢 TERMINADO"]
        SheetsEvaluacion["💾 Google Sheets<br/>Evaluación Fórmulas<br/>🟡 EN DESARROLLO"]
        SheetsBacklog["💾 Google Sheets<br/>Backlog Priorizado<br/>🟡 EN DESARROLLO"]
        Drive["📄 Google Drive<br/>(Propuestas guardadas)<br/>🔴 PROYECTADO"]
    end

    subgraph "🔗 INTEGRACIONES EXTERNAS"
        Freelancer["🌐 Freelancer.com API<br/>(Enriquecimiento)<br/>🔴 PROYECTADO"]
        LinkedIn["🌐 LinkedIn<br/>(Perfil y certificaciones)<br/>🟡 EN DESARROLLO"]
    end

    %% Conexiones
    Gmail --> GmailAPI
    GmailAPI --> GAS
    GAS --> Freelancer
    GAS --> SheetsEvaluacion
    
    SheetsInventario -.->|VLOOKUP/INDEX-MATCH| SheetsEvaluacion
    SheetsEvaluacion -.->|Ordenamiento automático| SheetsBacklog
    
    ClaudeSkill --> SheetsInventario
    LinkedIn -.->|Lectura manual| ClaudeSkill
    
    SheetsBacklog --> ClaudeAPI
    ClaudeAPI --> Drive
    Drive --> Gmail
    
    SheetsInventario -.->|Referencia| ClaudeAPI

    classDef entrada fill:#e3f2fd,stroke:#1976d2,color:#0d47a1
    classDef proceso fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c
    classDef almacen fill:#e8f5e9,stroke:#388e3c,color:#1b5e20
    classDef externo fill:#fff3e0,stroke:#e65100,color:#bf360c
    classDef claude fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c,stroke-width:3px

    class Gmail,GmailAPI entrada
    class GAS proceso
    class Claude claude
    class ClaudeSkill,ClaudeAPI proceso
    class SheetsInventario,SheetsEvaluacion,SheetsBacklog,Drive almacen
    class Freelancer,LinkedIn externo
```

---

## Resumen Visual: Integraciones y Flujo Completo

```mermaid
graph LR
    A["🔵 Gmail API<br/>(Lectura)<br/>🟢"] --> B["⚙️ Google Apps Script<br/>(Cron 4h)<br/>🟡"]
    B --> C["💾 Google Sheets<br/>(Evaluación)<br/>🟡"]
    B --> D["🌐 Freelancer.com<br/>(Enriquecimiento)<br/>🔴"]
    C --> E["💾 Backlog<br/>(Ordenado)<br/>🟡"]
    E --> F["🟣 Claude API<br/>(Propuestas)<br/>🔴"]
    F --> G["📄 Google Drive<br/>(Almacenamiento)<br/>🔴"]
    G --> H["🔵 Gmail API<br/>(Envío)<br/>🟢"]
    
    I["💾 Inventario_Capacidades<br/>🟢"] -.-> C
    J["🟣 Claude Skill<br/>(Extracción)<br/>🟡"] --> I
    J -.-> K["🌐 LinkedIn<br/>(Fuente)<br/>🟡"]
    
    style A fill:#e3f2fd,stroke:#1976d2
    style B fill:#f3e5f5,stroke:#7b1fa2
    style C fill:#e8f5e9,stroke:#388e3c
    style D fill:#fff3e0,stroke:#e65100
    style E fill:#e8f5e9,stroke:#388e3c
    style F fill:#f3e5f5,stroke:#7b1fa2
    style G fill:#e8f5e9,stroke:#388e3c
    style H fill:#e3f2fd,stroke:#1976d2
    style I fill:#e8f5e9,stroke:#388e3c
    style J fill:#f3e5f5,stroke:#7b1fa2
    style K fill:#fff3e0,stroke:#e65100
```

### 📌 Leyenda del Gráfico Final

**Bolitas de colores al lado derecho:**
- 🟢 = Componente ya terminado (implementado y funcional)
- 🟡 = Componente en desarrollo (parcialmente implementado)
- 🔴 = Componente proyectado (diseñado pero no iniciado)

**Colores de fondo (nodos):**
- 🔵 Azul = Componentes de Gmail/Email
- 🟣 Púrpura = Componentes de Claude/IA
- 🟢 Verde = Almacenamiento (Sheets, Drive)
- 🟠 Naranja = Integraciones externas (APIs)

**Tipos de líneas:**
- `→` Flujo principal (datos se transforman/procesan)
- `-.->` Flujo de referencia (lectura sin modificación)

---

## Componentes Detallados

### 1. 🔵 Gmail y Gmail API | 🟢 TERMINADO
**Función:** Punto de entrada del sistema, lectura de oportunidades.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🟢 Terminado (v1) |
| **Tipo** | Servicio de email + API |
| **Rol** | Recibir oportunidades, enviar propuestas |
| **Trigger** | Nuevo email en buzón específico |
| **Frecuencia de lectura** | Cada 4 horas (via Google Apps Script Cron) |
| **Datos de entrada** | Email raw (remitente, asunto, cuerpo, adjuntos) |
| **Autenticación** | OAuth 2.0 |

**Campos extraídos:**
```
From: remitente@empresa.com
Subject: Oportunidad de proyecto
Body: Descripción, requirements, presupuesto (opcional)
```

---

### 2. ⚙️ Google Apps Script (Cron - Cada 4 horas) | 🟡 EN DESARROLLO
**Función:** Procesamiento automático de emails en intervalos regulares.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🟡 En desarrollo |
| **Tipo** | Automatización serverless |
| **Rol** | Orquestación de procesamiento, extracción, validación, enriquecimiento |
| **Trigger** | Cron cada 4 horas |
| **Ubicación** | Google Drive (associated script) |
| **Dependencias** | Gmail API, Sheets API, APIs externas |

**Responsabilidades:**
```
1. Leer emails no procesados
2. Extraer: remitente, empresa, descripción, URL, presupuesto
3. Generar hash para detección de duplicados
4. Consultar Google Sheets: ¿Ya procesado?
5. Si es duplicado: marcar y descartar
6. Si es nuevo: normalizar datos
7. Enriquecer desde Freelancer.com API (si necesario)
8. Guardar datos procesados en hoja "Evaluación"
9. Permitir que fórmulas de Sheets hagan el matching y scoring
```

**Pseudocódigo:**
```javascript
function processEmailsCron() {
  // Ejecutado cada 4 horas
  const unprocessedEmails = getUnprocessedEmails();
  
  unprocessedEmails.forEach(email => {
    const extracted = extractData(email);
    const hash = generateHash(extracted);
    
    if (isProcessedBefore(hash)) {
      markAsDuplicate(hash);
      return;
    }
    
    const normalized = normalizeData(extracted);
    const enriched = enrichFromFreelancer(normalized);
    
    saveToEvaluationSheet(enriched);
  });
}
```

---

### 3. 💾 Google Sheets: Inventario_Capacidades | 🟢 TERMINADO
**Función:** Almacenar el inventario actualizado de skills, certifications y proyectos.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🟢 Terminado (v1) |
| **Tipo** | Hoja de cálculo (Google Sheets) |
| **Rol** | Fuente única de verdad para capacidades |
| **Actualización** | Event-driven (via Claude Skill) |
| **Acceso** | VLOOKUP/INDEX-MATCH desde Evaluación |

**Schema:**
```
| Skill | Nivel | Tipo | Proyectos | Certificaciones | LinkedIn URL | Última actualización |
|-------|-------|------|-----------|-----------------|--------------|---------------------|
| Python | Avanzado | Lenguaje | [links] | [certs] | https://... | 2026-08-24 |
| React | Intermedio | Framework | [links] | - | https://... | 2026-08-20 |
| ...
```

**Niveles permitidos:** Básico, Intermedio, Avanzado, Experto

---

### 4. 💾 Google Sheets: Evaluación (Fórmulas) | 🟡 EN DESARROLLO
**Función:** Procesar ofertas con fórmulas, calcular match y scoring automáticamente.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🟡 En desarrollo |
| **Tipo** | Hoja de cálculo con fórmulas (Google Sheets) |
| **Rol** | Evaluación automática, matching y scoring |
| **Actualización** | Automática (datos de Google Apps Script + fórmulas) |
| **Referencia** | Inventario_Capacidades |

**Schema con Fórmulas:**
```
| Fecha | Remitente | Empresa | Descripción | Presupuesto | Skills requeridas | 
| Skills disponibles* | Match %** | Score*** | Prioridad | Estado | Asignado |

*VLOOKUP formula: =VLOOKUP(A2, Inventario_Capacidades!A:Z, 2, FALSE)
**Fórmula de matching: porcentaje de skills disponibles vs requeridas
***Score: algoritmo de priorización (match + presupuesto + complejidad)
```

**Fórmulas Clave:**

**Match Score:**
```
= COUNTIF(SkillsDisponibles, SkillsRequeridas) / LEN(SkillsRequeridas) * 100
```

**Score Final:**
```
= (MatchScore * 0.5) + (NormalizePresupuesto * 0.3) + (Complejidad * 0.2)
```

**Ordenamiento automático:** La hoja se ordena automáticamente por Score descendente.

---

### 5. 💾 Google Sheets: Backlog Priorizado | 🟡 EN DESARROLLO
**Función:** Vista ordenada de oportunidades listas para propuesta.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🟡 En desarrollo |
| **Tipo** | Hoja ordenada (filtrada de Evaluación) |
| **Rol** | Fuente para Sistema 3 (Propuestas) |
| **Actualización** | Automática (basada en Evaluación) |
| **Orden** | Score descendente (mejor match arriba) |

---

### 6. 🟣 Claude Skill (Carga de Capacidades) | 🟡 EN DESARROLLO
**Función:** Extracción inteligente de datos de LinkedIn y proyectos.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🟡 En desarrollo |
| **Tipo** | Claude AI (Mode: Skill) |
| **Rol** | Extracción event-driven de capacidades |
| **Trigger** | Manual o cambios detectados |
| **Entrada** | Perfil LinkedIn, documentos de Drive |
| **Salida** | Datos estructurados para Inventario_Capacidades |

**Proceso:**
```
1. Leer perfil LinkedIn (manualmente o via web scraping)
2. Extraer: skills, nivel, experiencia
3. Leer certificaciones y validaciones
4. Leer proyectos de Google Drive
5. Estructurar en formato estándar
6. Guardar en Inventario_Capacidades
```

---

### 7. 🟣 Claude API (Generación de Propuestas) | 🔴 PROYECTADO
**Función:** Generación automática de propuestas personalizadas.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🔴 Proyectado |
| **Tipo** | Claude API (modelo: claude-opus/sonnet) |
| **Rol** | Generación inteligente de propuestas |
| **Trigger** | Manual (usuario selecciona oportunidad del backlog) |
| **Entrada** | Datos de la oferta + Inventario_Capacidades |
| **Salida** | Propuesta en formato texto/Markdown |

**Entrada típica:**
```json
{
  "oferta": {
    "empresa": "TechCorp",
    "descripcion": "Desarrollar aplicación React",
    "presupuesto": "$5000-$8000",
    "skills_requeridas": ["React", "Node.js", "PostgreSQL"],
    "deadline": "2026-09-30"
  },
  "competencias": {
    "skills_disponibles": ["React", "Node.js", "MongoDB", "Python"],
    "nivel": ["Avanzado", "Avanzado", "Intermedio", "Avanzado"],
    "proyectos_similares": [
      "E-commerce con React y Node.js (2025)",
      "Dashboard con React (2025)"
    ],
    "certificaciones": ["AWS Developer", "React Advanced"]
  },
  "template": "propuesta_estándar_v1"
}
```

**Prompt del sistema:**
```
Eres un especialista en redacción de propuestas técnicas. 
Basándote en la oferta y las competencias disponibles, 
genera una propuesta profesional, personalizada y convincente 
que destaque la alineación entre skills y requisitos.
```

---

### 8. 📄 Google Drive | 🔴 PROYECTADO
**Función:** Almacenamiento de propuestas generadas y documentos.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🔴 Proyectado |
| **Tipo** | Servicio de almacenamiento en la nube |
| **Rol** | Guardar propuestas, proyectos, certificaciones |
| **Estructura** | Carpetas organizadas por año/cliente |

**Estructura recomendada:**
```
Leads-Auto/
├── Propuestas/
│   ├── 2026/
│   │   ├── Cliente-Fecha-Propuesta.pdf
│   │   └── ...
├── Proyectos/
│   ├── Proyecto1-Descripción.md
│   └── ...
└── Certificaciones/
    └── Cert-*.pdf
```

---

### 9. 🌐 Freelancer.com API | 🔴 PROYECTADO
**Función:** Enriquecimiento de datos de ofertas.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🔴 Proyectado |
| **Tipo** | API REST externa |
| **Rol** | Obtener información adicional sobre oportunidades |
| **Ubicación** | Llamada desde Google Apps Script |
| **Autenticación** | API Key |

**Datos obtenidos:**
```
- Presupuesto típico para skill
- Complejidad estimada
- Tendencias de mercado
- Skills adicionales sugeridas
```

---

### 10. 🌐 LinkedIn | 🟡 EN DESARROLLO
**Función:** Fuente de datos para capacidades.

| Propiedad | Descripción |
|-----------|------------|
| **Estado** | 🟡 En desarrollo |
| **Tipo** | Red social profesional |
| **Rol** | Leer perfil, skills, certificaciones |
| **Integración** | Manual o web scraping (si es permitido) |

---

## Flujos de Datos Principales

### Flujo 1: Actualización de Capacidades (Event-driven) | 🟡 EN DESARROLLO
```
LinkedIn/Drive → 🟣 Claude Skill → 💾 Inventario_Capacidades → (referencia en Evaluación)
```

**Frecuencia:** Manual / Cambios detectados

---

### Flujo 2: Procesamiento de Ofertas (Cada 4 horas) | 🟡 EN DESARROLLO
```
📧 Gmail → 🔵 Gmail API → ⚙️ Google Apps Script (Cron)
  ├─ Extraer datos
  ├─ Validar (¿duplicado?)
  ├─ Normalizar
  ├─ Enriquecer (Freelancer.com API)
  └─ Guardar en Evaluación

💾 Evaluación (fórmulas automáticas)
  ├─ Recuperar skills de Inventario_Capacidades
  ├─ Calcular match
  ├─ Calcular score
  └─ Ordenar automáticamente → 💾 Backlog Priorizado
```

**Frecuencia:** Cada 4 horas

---

### Flujo 3: Generación de Propuestas (Manual) | 🔴 PROYECTADO
```
Usuario selecciona en 💾 Backlog Priorizado
  → 🟣 Claude API (input: oferta + Inventario_Capacidades)
  → Generar propuesta
  → Revisar/ajustar (manual)
  → Guardar en 📄 Google Drive
  → Enviar vía 🔵 Gmail API
```

**Frecuencia:** A demanda

---

### Flujo 4: Seguimiento y Resultados | 🔴 PROYECTADO
```
Propuesta enviada → Registrar en 💾 Google Sheets
  → Calcular KPIs (tasa conversión, ingresos, etc)
  → Mostrar en Dashboard
```

**Frecuencia:** Automática

---

## Matriz de Tecnologías

| Componente | Tecnología | Propósito | Frecuencia | Estado |
|-----------|-----------|----------|-----------|--------|
| Entrada de emails | 🔵 Gmail API | Recibir oportunidades | Cron cada 4h | 🟢 Terminado |
| Procesamiento automático | ⚙️ Google Apps Script | Extraer, validar, enriquecer | Cada 4 horas | 🟡 En desarrollo |
| Almacenamiento capacidades | 💾 Google Sheets | Inventario único de skills | Event-driven | 🟢 Terminado |
| Evaluación ofertas | 💾 Google Sheets (fórmulas) | Matching automático | En tiempo real | 🟡 En desarrollo |
| Backlog priorizado | 💾 Google Sheets (ordenado) | Vista de oportunidades | Automático | 🟡 En desarrollo |
| Enriquecimiento datos | 🌐 Freelancer.com API | Datos adicionales | Cada 4 horas | 🔴 Proyectado |
| Extracción capacidades | 🟣 Claude Skill | Lectura inteligente | Event-driven | 🟡 En desarrollo |
| Generación propuestas | 🟣 Claude API | Redacción inteligente | Manual (a demanda) | 🔴 Proyectado |
| Almacenamiento propuestas | 📄 Google Drive | Documentos finales | Manual | 🔴 Proyectado |
| Envío propuestas | 🔵 Gmail API | Comunicación con clientes | Manual | 🟢 Terminado |

---

## Consideraciones de Implementación

### Performance
- **Cron cada 4 horas:** Evita sobrecarga, procesa de forma batch
- **Fórmulas en Sheets:** Más rápidas que API calls para operaciones simples
- **Caché de datos:** Minimizar llamadas a APIs externas
- **Índices:** Usar hash para detección rápida de duplicados

### Seguridad
- **Autenticación:** OAuth 2.0 para Gmail, API Keys seguros
- **Datos sensibles:** No guardar credenciales en scripts
- **Validación:** Sanitizar datos antes de enviar a APIs

### Escalabilidad
- **Sheets:** Actualizar a AppSheet o solución más robusta si crece
- **Cron:** Considerar Cloud Tasks/Pub-Sub para procesos más complejos
- **Caché:** Implementar Redis si volume de datos crece

---

## Resumen: Guía de Lectura de Gráficos

### ¿Cómo leer los diagramas?

1. **Colores de fondo:**
   - 🔵 Azul = Email/APIs de lectura
   - 🟣 Púrpura = Procesamiento e IA
   - 🟢 Verde = Almacenamiento
   - 🟠 Naranja = Integraciones externas

2. **Tipos de líneas:**
   - Línea sólida (`→`) = Flujo principal (transformación de datos)
   - Línea punteada (`-.->`) = Referencia (solo lectura)

3. **Estado del componente:**
   - 🟢 Verde = Completado
   - 🟡 Amarillo = En desarrollo
   - 🔴 Rojo = Proyectado

4. **Grupos de componentes:**
   - Componentes de **Claude** están agrupados bajo la etiqueta **🟣 CLAUDE (IA/Inteligencia AI)**
   - Cada capa tiene un símbolo distintivo (📧 Entrada, ⚙️ Procesamiento, 💾 Almacenamiento, 🔗 Externo)

---

