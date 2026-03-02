# PLAN DE IMPLEMENTACIÓN COMPLETO - MÓDULO GANTT MPF.AI

## DOCUMENTO MAESTRO DE ARQUITECTURA E IMPLEMENTACIÓN

**Proyecto**: mpf.ai - Módulo Gantt Híbrido Server/Client
**Versión**: 1.0
**Fecha**: 2026-02-15
**Autor**: Frontend Architect - Claude Code

---

## 1. RESUMEN EJECUTIVO

### 1.1 Decisiones Clave Confirmadas

| Categoría | Decisión | Impacto |
|-----------|----------|---------|
| **Features dhtmlx** | MVP COMPLETO (10 features) | 📈 Alta complejidad, UX premium |
| **Arquitectura** | Híbrido Server/Client | ⚡ Performance + SEO optimizado |
| **Cache Strategy** | Normalizado por ID | 🔄 Optimistic updates eficientes |
| **Permissions** | Admin full, Users scope dept | 🔒 Security layer en queries |
| **Real-time** | Polling 30s | 📡 Balance simplicidad/actualización |
| **Export** | Cliente (dhtmlx nativo) | 🚀 Rápido, sin backend (MVP) |
| **Ubicaciones** | /departments + /worklist | 🎯 2 patrones diferentes |

### 1.2 Métricas del Proyecto

- **Archivos nuevos**: ~22 archivos
- **Archivos modificados**: ~8 archivos
- **Líneas de código estimadas**: ~3,500 líneas
- **Componentes React**: 12 componentes
- **RTK Query endpoints**: 8 endpoints
- **Server Actions**: 3 actions
- **Tests estimados**: ~45 test suites
- **Tiempo total estimado**: **52-68 horas** (6.5-8.5 días)

---

## 2. ARQUITECTURA GENERAL

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: SERVER COMPONENTS (Next.js App Router)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────────────────────┐
    │  /departments/[departmentName]/page.tsx (Server)         │
    │  - getDepartmentByName()                                 │
    │  - getInitialGanttItems({ dept, states })                │
    │  - Next.js Data Cache (revalidate: 60s)                  │
    └─────────────────────────────────────────────────────────┘
                              ↓ props: initialData
    ┌─────────────────────────────────────────────────────────┐
    │  /worklist/page.tsx (Server)                             │
    │  - getAllDepartments()                                   │
    │  - getInitialGanttItemsByDepts()                         │
    │  - Next.js Data Cache (revalidate: 60s)                  │
    └─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: CLIENT COMPONENTS (React + dhtmlx-gantt)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────────────────────┐
    │  GanttModule.tsx (Client)                                │
    │  - useEffect: hydrateRTKCache(initialData)               │
    │  - useGetStatesQuery() → tabs dinámicas                  │
    │  - usePermissions() → admin vs user scope                │
    └─────────────────────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────────────────────┐
    │  GanttChart.tsx (Client)                                 │
    │  - useGetGanttItemsQuery({ filters, polling: 30s })      │
    │  - dhtmlx-gantt instance                                 │
    │  - Event handlers → mutations                            │
    └─────────────────────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────────────────────┐
    │  dhtmlx-gantt Events                                     │
    │  - onAfterTaskDrag → useUpdateGanttDatesMutation()       │
    │  - onAfterTaskAdd → useCreateGanttItemMutation()         │
    │  - onAfterLinkAdd → useCreateDependencyMutation()        │
    │  - onTaskDblClick → openModal(taskId)                    │
    └─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: STATE MANAGEMENT (RTK Query + Normalized Cache)       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────────────────────────────────────┐
    │  ganttApiSlice.ts (RTK Query)                            │
    │  - Cache normalizado: entities + filters                 │
    │  - Optimistic updates con updateQueryData()              │
    │  - Rollback automático (patchResult.undo)                │
    │  - pollingInterval: 30000ms                              │
    └─────────────────────────────────────────────────────────┘

[... resto del documento con las 4 etapas ya planificadas ...]

---

## NOTA CRÍTICA - REVISIÓN NECESARIA

⚠️ **Este plan propone una reimplementación completa cuando la arquitectura client-side ya funciona.**

**Decisión del usuario**: Solo migrar incrementalmente a arquitectura híbrida con optimistic updates, NO reimplementar desde cero.

**Plan de Migración Incremental requerido en su lugar.**
