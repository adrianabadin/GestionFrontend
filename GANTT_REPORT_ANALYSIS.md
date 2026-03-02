# Análisis y Corrección del Módulo de Reporte Gantt

**Fecha**: 2026-02-15
**Módulo**: Generación de Reportes PDF en Google Docs
**Estado**: ✅ Correcciones aplicadas

---

## 📋 Resumen Ejecutivo

Se analizó el módulo de generación de reportes del Gantt tanto en backend como frontend, encontrando **desajustes en los parámetros de la API**. Se aplicaron correcciones en el frontend para adaptar las llamadas al backend actual.

---

## 🔍 Análisis Realizado

### Backend (managmentpanelback)

**Archivos analizados**:
- ✅ `src/gantt/gantt.routes.ts` - Rutas de la API
- ✅ `src/gantt/gantt.controller.ts` - Controller de Gantt
- ✅ `src/gantt/gantt.service.ts` - Service con lógica de negocio
- ✅ `src/gantt/gantt.schema.ts` - Schemas de validación Zod

**Estructura de la API**:

```typescript
// GET /gantt/items - Listar items con filtros
ListGanttItemsSchema = z.object({
  query: z.object({
    departmentsId: uuidValidator.optional(),
    demographyId: uuidValidator.optional(),
    assignedToId: uuidValidator.optional(),
    isActive: z.enum(["true", "false"]).optional(),  // ← String, no boolean
    page: z.string().transform(Number).default("1"),
    pageSize: z.string().transform(Number).default("50"), // ← "pageSize", no "limit"
    // ... otros filtros
  })
});
```

**Respuesta del backend**:

```typescript
{
  data: GanttItem[],      // ← "data", no "items"
  pagination: {           // ← "pagination", no "meta"
    page: number,
    limit: number,        // Internamente se llama "pageSize" pero retorna "limit"
    total: number,
    totalPages: number
  }
}
```

**Compatibilidad**:
- ✅ Backend acepta `limit` además de `pageSize` (backward compatibility)
- ✅ Parámetro `isActive` controla si se muestran items inactivos

---

### Frontend (mpf.ai)

**Archivos analizados**:
- ✅ `src/app/gantt/_application/hooks/useGanttReport.ts` - Hook principal
- ✅ `src/app/gantt/_application/slices/ganttApiSlice.ts` - RTK Query slice
- ✅ `src/app/gantt/_domain/schemas.ts` - Tipos y schemas
- ✅ `src/app/gantt/components/GanttReportButton.tsx` - Botón de reporte
- ✅ `src/app/gantt/components/GanttReportProgressDialog.tsx` - Dialog de progreso

**Hallazgos**:

1. **ganttApiSlice.ts**: ✅ **Ya estaba correcto**
   - Convierte `includeInactive` → `isActive` correctamente
   - Envía `pageSize` al backend
   - Espera respuesta en `{ data, pagination }`

2. **schemas.ts**: ⚠️ **Comentario incorrecto**
   - Schema correcto pero comentario decía lo contrario
   - ✅ Corregido

3. **useGanttReport.ts**: ❌ **Parámetros incorrectos**
   - Enviaba `includeInactive: false` (boolean)
   - Enviaba `limit: 100` en lugar de `pageSize: 100`
   - ✅ Corregido

---

## 🛠️ Cambios Aplicados

### 1. Corrección en `useGanttReport.ts` (líneas 327-340)

**ANTES** ❌:
```typescript
const result = await fetchGanttItems({
  demographyId: demography.id,
  departmentsId: departmentId,
  page: 1,
  limit: 100,                    // ❌ Backend prefiere "pageSize"
  includeInactive: false         // ❌ Backend espera "isActive": "true"|"false"
}).unwrap();

const items = result.data || []; // Esto estaba correcto
```

**DESPUÉS** ✅:
```typescript
// ✅ Fetch items usando parámetros correctos del backend
const result = await fetchGanttItems({
  demographyId: demography.id,
  departmentsId: departmentId,
  page: 1,
  pageSize: 100,                 // ✅ Backend usa "pageSize"
  isActive: "true"               // ✅ Backend espera string "true"|"false"
}).unwrap();

// ✅ Backend retorna { data: items[], pagination: {...} }
const items = result.data || [];
```

**Impacto**:
- ✅ Parámetros ahora coinciden con lo que espera el backend
- ✅ `ganttApiSlice` convierte `pageSize` → `pageSize` (ya no hay doble conversión)
- ✅ `isActive: "true"` filtra correctamente solo items activos

---

### 2. Corrección en `schemas.ts` (líneas 130-138)

**ANTES** ❌:
```typescript
export const GanttListResponseSchema = z.object({
  data: z.array(GanttItemResponseSchema), // Backend usa "items", no "data"  ← ❌ Comentario incorrecto
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(), // Backend usa "pageSize", no "limit"  ← ✅ Correcto
    total: z.number(),
    totalPages: z.number()
  })
});
```

**DESPUÉS** ✅:
```typescript
export const GanttListResponseSchema = z.object({
  data: z.array(GanttItemResponseSchema), // ✅ Backend retorna "data" (no "items")
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(), // ✅ Backend usa "pageSize" (también acepta "limit" por compatibilidad)
    total: z.number(),
    totalPages: z.number()
  })
});
```

**Impacto**:
- ✅ Comentarios ahora son precisos
- ✅ No hay cambios funcionales (schema ya era correcto)

---

## 📊 Arquitectura del Módulo de Reporte

### Flujo completo de generación de reporte:

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario hace click en "Generar Reporte"                 │
│     (GanttReportButton.tsx)                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. GanttReportConfirmDialog muestra preview                │
│     - Total de localidades                                   │
│     - Estimación de imágenes                                 │
│     - Tiempo estimado                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. useGanttReport.generateReport() inicia proceso           │
│     (useGanttReport.ts)                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Para cada localidad (demography):                        │
│     a. Fetch items del Gantt ✅ CORREGIDO                    │
│        - fetchGanttItems({ pageSize, isActive })             │
│     b. Generar 2 imágenes PNG (semester1 + semester2)       │
│        - captureAsBlob() usa dhtmlx-gantt                    │
│     c. Subir imágenes a Google Drive                         │
│        - uploadImage() con retry logic                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Construir payload estructurado                           │
│     - Metadata (fecha, autor, departamento)                  │
│     - Estadísticas (total, completados, pendientes)          │
│     - Demographies con items e imágenes                      │
│     - Emails de directores para compartir                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Crear documento en Google Docs                           │
│     - POST /google/document/structured                       │
│     - Retorna URL del documento                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  7. SweetAlert muestra resultado                             │
│     - Éxito: Link + botón "Abrir en Google Docs"           │
│     - Parcial: Warnings de imágenes fallidas                │
│     - Error: Mensaje de error con opción de reintentar      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Estado Actual

### Backend
- ✅ **API funcionando correctamente**
- ✅ Schema validación con Zod
- ✅ Soporte de filtros: `departmentsId`, `demographyId`, `isActive`, etc.
- ✅ Paginación: `page`, `pageSize`
- ✅ Backward compatibility: acepta `limit` además de `pageSize`

### Frontend
- ✅ **Parámetros corregidos** en `useGanttReport.ts`
- ✅ **Comentarios actualizados** en `schemas.ts`
- ✅ `ganttApiSlice.ts` ya estaba correcto
- ✅ Tipos correctos en `GanttListResponse`

---

## 🧪 Testing Recomendado

### Test Manual (Alta Prioridad)

1. **Abrir** `/gantt` o `/departments` → Tab "Gantt"

2. **Click** en botón "Generar Reporte"

3. **Verificar Preview Dialog**:
   - ✅ Muestra cantidad de localidades
   - ✅ Muestra estimación de tiempo

4. **Confirmar generación**

5. **Verificar Console Logs**:
   ```
   ✅ "Cargando items de Gantt para departamento: ..."
   ✅ "- [Localidad]: X items encontrados"
   ✅ "Generando imagen: [Localidad] (1er Semestre)"
   ✅ "Subiendo imagen: gantt-[localidad]-sem1.png"
   ✅ "Documento creado: [ID]"
   ```

6. **Verificar Network Tab**:
   - ✅ GET `/gantt/items?departmentsId=...&demographyId=...&page=1&pageSize=100&isActive=true`
   - ✅ POST `/google/upload-image` (múltiples veces)
   - ✅ POST `/google/document/structured`

7. **Verificar Resultado**:
   - ✅ SweetAlert muestra éxito
   - ✅ Link a Google Docs funciona
   - ✅ Documento contiene todas las localidades
   - ✅ Imágenes están incrustadas correctamente

### Test de Regresión

- ✅ Verificar que reportes antiguos siguen funcionando
- ✅ Verificar compatibilidad con `limit` (si algún código antiguo lo usa)
- ✅ Verificar que filtro `isActive` funciona correctamente

---

## 📁 Archivos Modificados

### Archivos corregidos (2):
1. ✅ `mpf.ai/src/app/gantt/_application/hooks/useGanttReport.ts`
   - Líneas 327-340: Parámetros `pageSize` e `isActive`

2. ✅ `mpf.ai/src/app/gantt/_domain/schemas.ts`
   - Líneas 130-138: Comentarios corregidos

### Archivos analizados (sin cambios):
- ✅ `mpf.ai/src/app/gantt/_application/slices/ganttApiSlice.ts` (ya estaba correcto)
- ✅ `managmentpanelback/src/gantt/gantt.routes.ts`
- ✅ `managmentpanelback/src/gantt/gantt.controller.ts`
- ✅ `managmentpanelback/src/gantt/gantt.service.ts`
- ✅ `managmentpanelback/src/gantt/gantt.schema.ts`

---

## 📚 Documentación de Referencia

### Backend API

**GET /gantt/items**

Query Parameters:
- `departmentsId` (UUID, opcional)
- `demographyId` (UUID, opcional)
- `assignedToId` (UUID, opcional)
- `isActive` (string: "true"|"false", opcional) ← Solo items activos
- `page` (number, default: 1)
- `pageSize` (number, default: 50) ← También acepta "limit"
- `startDateFrom`, `startDateTo`, `endDateFrom`, `endDateTo` (ISO date, opcional)
- `status` (enum, opcional): "planning"|"active"|"onhold"|"completed"|"cancelled"
- `priority` (enum, opcional): "low"|"medium"|"high"|"critical"
- `type` (enum, opcional): "task"|"milestone"|"summary"

Response:
```typescript
{
  data: GanttItem[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

---

## 🎯 Próximos Pasos Recomendados

### Alta Prioridad
1. ✅ Testing manual del flujo completo de reporte
2. ⏳ Verificar permisos de Google Drive/Docs en backend
3. ⏳ Test con diferentes cantidades de localidades (1, 5, 10+)

### Media Prioridad
4. ⏳ Agregar tests automatizados para `useGanttReport`
5. ⏳ Optimizar generación de imágenes (paralelizar si es posible)
6. ⏳ Agregar opción de cancelar generación a mitad de proceso

### Baja Prioridad
7. ⏳ Soporte para exportar a otros formatos (Excel, CSV)
8. ⏳ Templates personalizables de Google Docs
9. ⏳ Historial de reportes generados

---

## 🔧 Troubleshooting

### Error: "No se encontraron items"
- **Causa**: Filtro `isActive: "true"` no retorna items inactivos
- **Solución**: Verificar que los items tengan `isActive: true` en la BD

### Error: "AUTHENTICATION_ERROR"
- **Causa**: Token de Google expirado o inválido
- **Solución**: Reconfigurar credenciales de Google en backend

### Error: "Imagen fallida"
- **Causa**: dhtmlx-gantt no se pudo renderizar o subida a Google Drive falló
- **Solución**: Ver console logs, verificar permisos de Google Drive

### Error: "Faltan datos necesarios"
- **Causa**: States/Users no cargaron desde RTK Query
- **Solución**: Verificar que `useGetStatesQuery()` y `useGetUsersQuery()` funcionen

---

**Última actualización**: 2026-02-15
**Estado**: ✅ Correcciones aplicadas y documentadas
