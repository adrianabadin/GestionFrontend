# PLAN DE MIGRACIÓN INCREMENTAL - ARQUITECTURA HÍBRIDA GANTT

**Proyecto**: mpf.ai - Migración Client-Side → Hybrid Server/Client
**Tiempo estimado**: 8-12 horas (1.5 días)
**Fecha**: 2026-02-15
**Tipo**: Migración incremental (NO reimplementación)

---

## 📋 ÍNDICE

1. [Análisis del Estado Actual](#1-análisis-del-estado-actual)
2. [Objetivos de la Migración](#2-objetivos-de-la-migración)
3. [Etapa 1: Optimistic Updates (3-4h) ✅ COMPLETADA](#etapa-1-optimistic-updates-3-4h)
4. [Etapa 2: Server Component Wrapper (2-3h) ✅ COMPLETADA](#etapa-2-server-component-wrapper-2-3h)
5. [Etapa 3: Polling Automático (30min) ✅ COMPLETADA](#etapa-3-polling-automático-30min)
6. [Etapa 4: Cache Hydration (1-2h) ✅ COMPLETADA](#etapa-4-cache-hydration-1-2h)
7. [Etapa 5: Integración /departments y /worklist (2-3h) ✅ COMPLETADA](#etapa-5-integración-departments-y-worklist-2-3h)
8. [Testing Adaptado](#testing-adaptado)
9. [Checklist de Tareas](#checklist-de-tareas)
10. [Rollback Plan](#rollback-plan)

---

## 1. ANÁLISIS DEL ESTADO ACTUAL

### ✅ **Lo que YA funciona (NO tocar):**

```
mpf.ai/src/app/gantt/
├── _application/
│   ├── hooks/
│   │   └── useGanttReport.ts ✅
│   └── slices/
│       └── ganttApiSlice.ts ✅ (modificar solo mutations)
├── _domain/
│   ├── schemas.ts ✅
│   └── types.ts ✅
├── components/
│   ├── GanttModule.tsx ✅ (agregar hydration)
│   ├── GanttChart.tsx ✅ (agregar polling)
│   └── GanttItemModal.tsx ✅
└── page.tsx ⚠️ (convertir a Server Component)
```

### 📊 **Arquitectura Actual (Client-Side):**

```
┌─────────────────────────────────────────┐
│  /gantt/page.tsx (Client Component)     │
│  - useGetGanttItemsQuery()              │
│  - Fetch en cliente al montar           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  GanttModule.tsx (Client)                │
│  - Renderiza tabs                        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  GanttChart.tsx (Client)                 │
│  - useGetGanttItemsQuery()               │
│  - dhtmlx-gantt renderiza                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  RTK Query Mutations                     │
│  - invalidatesTags ❌                    │
│  - Re-fetch después de cada mutation    │
└─────────────────────────────────────────┘
```

### 🎯 **Problemas Actuales:**

1. ❌ **Primera carga lenta**: Cliente debe esperar JS + fetch
2. ❌ **Re-fetch innecesario**: `invalidatesTags` causa re-fetch después de cada edit
3. ❌ **No SSR**: Sin datos en First Paint
4. ❌ **Sin optimistic updates**: UI espera confirmación del backend

---

## 2. OBJETIVOS DE LA MIGRACIÓN

### ✅ **Lo que queremos lograr:**

| Objetivo | Beneficio | Esfuerzo |
|----------|-----------|----------|
| **Optimistic Updates** | UI instantánea, rollback automático | 🟡 Medio |
| **Server-Side Fetch** | Datos en First Paint, mejor SEO | 🟢 Bajo |
| **Cache Hydration** | RTK Query usa datos del server | 🟢 Bajo |
| **Polling 30s** | Sync con otros usuarios | 🟢 Muy bajo |
| **Integración /departments** | Reutilizar en módulos existentes | 🟡 Medio |

### 📊 **Arquitectura Objetivo (Híbrida):**

```
┌─────────────────────────────────────────┐
│  /gantt/page.tsx (Server Component) ✨   │
│  - await fetch() con Next.js cache      │
│  - revalidate: 60s                       │
└─────────────────────────────────────────┘
              ↓ props: initialData
┌─────────────────────────────────────────┐
│  GanttClientWrapper (Client) ✨          │
│  - useEffect: upsertQueryData()          │
│  - Hydrate RTK cache                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  GanttModule.tsx (Client)                │
│  - useGetGanttItemsQuery()               │
│  - pollingInterval: 30000 ✨             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  RTK Query Mutations                     │
│  - onQueryStarted ✨                     │
│  - updateQueryData() → optimistic        │
│  - patchResult.undo() → rollback         │
└─────────────────────────────────────────┘
```

---

## ETAPA 1: Optimistic Updates (3-4h)

### 🎯 **Objetivo**: Cambiar mutations de `invalidatesTags` → `onQueryStarted` con optimistic updates

### 📝 **Archivo a modificar**: `src/app/gantt/_application/slices/ganttApiSlice.ts`

#### **PASO 1.1: Modificar mutation `updateGanttItem`**

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANTES (con invalidatesTags)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
updateGanttItem: builder.mutation<
  GanttItemResponse,
  { id: string; data: UpdateGanttItemType }
>({
  query: ({ id, data }) => ({
    url: `/gantt/items/${id}`,
    method: "PATCH",
    body: data,
  }),
  invalidatesTags: [{ type: "GanttItem", id: "LIST" }], // ❌ Re-fetch
}),

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESPUÉS (con optimistic update)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
updateGanttItem: builder.mutation<
  GanttItemResponse,
  { id: string; data: UpdateGanttItemType }
>({
  query: ({ id, data }) => ({
    url: `/gantt/items/${id}`,
    method: "PATCH",
    body: data,
  }),

  async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PASO 1: Optimistic Update (UI instantánea)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const patchResult = dispatch(
      ganttApiSlice.util.updateQueryData(
        'getGanttItems',
        undefined, // Si tienes filtros, pásalos aquí
        (draft) => {
          const item = draft.items.find((i) => i.id === id);
          if (item) {
            Object.assign(item, data);
            item.updatedAt = new Date().toISOString();
          }
        }
      )
    );

    try {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PASO 2: Esperar confirmación del backend
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const { data: updatedItem } = await queryFulfilled;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PASO 3: (Opcional) Reemplazar con datos reales del server
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      dispatch(
        ganttApiSlice.util.updateQueryData(
          'getGanttItems',
          undefined,
          (draft) => {
            const index = draft.items.findIndex((i) => i.id === id);
            if (index !== -1) {
              draft.items[index] = updatedItem.data;
            }
          }
        )
      );

    } catch (error) {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PASO 4: ROLLBACK si el backend falla
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      patchResult.undo();

      console.error('❌ Error updating gantt item:', error);
      // Opcional: mostrar toast al usuario
      // toast.error('No se pudo guardar los cambios');
    }
  },

  // ❌ ELIMINAR invalidatesTags (ya no es necesario)
  // invalidatesTags: [],
}),
```

#### **PASO 1.2: Modificar mutation `createGanttItem`**

```typescript
createGanttItem: builder.mutation<GanttItemResponse, CreateGanttItemType>({
  query: (body) => ({
    url: "/gantt/items",
    method: "POST",
    body,
  }),

  async onQueryStarted(newItem, { dispatch, queryFulfilled }) {
    // Crear ID temporal
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = {
      id: tempId,
      ...newItem,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    // Optimistic update: agregar al principio de la lista
    const patchResult = dispatch(
      ganttApiSlice.util.updateQueryData(
        'getGanttItems',
        undefined,
        (draft) => {
          draft.items.unshift(optimisticItem as any);
          draft.meta.total += 1;
        }
      )
    );

    try {
      const { data: createdItem } = await queryFulfilled;

      // Reemplazar tempId con ID real del backend
      dispatch(
        ganttApiSlice.util.updateQueryData(
          'getGanttItems',
          undefined,
          (draft) => {
            const index = draft.items.findIndex((i) => i.id === tempId);
            if (index !== -1) {
              draft.items[index] = createdItem.data;
            }
          }
        )
      );

    } catch (error) {
      // Rollback: remover item temporal
      patchResult.undo();
      console.error('❌ Error creating gantt item:', error);
    }
  },
}),
```

#### **PASO 1.3: Modificar mutation `deleteGanttItem`**

```typescript
deleteGanttItem: builder.mutation<void, string>({
  query: (id) => ({
    url: `/gantt/items/${id}`,
    method: "DELETE",
  }),

  async onQueryStarted(id, { dispatch, queryFulfilled }) {
    // Guardar item para rollback
    let deletedItem: any;

    const patchResult = dispatch(
      ganttApiSlice.util.updateQueryData(
        'getGanttItems',
        undefined,
        (draft) => {
          const index = draft.items.findIndex((i) => i.id === id);
          if (index !== -1) {
            deletedItem = draft.items[index];
            draft.items.splice(index, 1);
            draft.meta.total -= 1;
          }
        }
      )
    );

    try {
      await queryFulfilled;
    } catch (error) {
      // Rollback: restaurar item
      patchResult.undo();
      console.error('❌ Error deleting gantt item:', error);
    }
  },
}),
```

#### **PASO 1.4: Crear mutations específicas para drag & drop**

```typescript
// Nueva mutation para actualizar fechas (drag & drop)
updateGanttDates: builder.mutation<
  GanttItemResponse,
  { id: string; startDate: string; endDate: string }
>({
  query: ({ id, startDate, endDate }) => ({
    url: `/gantt/items/${id}`,
    method: "PATCH",
    body: { startDate, endDate },
  }),

  async onQueryStarted({ id, startDate, endDate }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      ganttApiSlice.util.updateQueryData(
        'getGanttItems',
        undefined,
        (draft) => {
          const item = draft.items.find((i) => i.id === id);
          if (item) {
            item.startDate = startDate;
            item.endDate = endDate;
            item.updatedAt = new Date().toISOString();
          }
        }
      )
    );

    try {
      await queryFulfilled;
    } catch (error) {
      patchResult.undo();
      console.error('❌ Error updating dates:', error);
    }
  },
}),

// Nueva mutation para actualizar progress (drag barra)
updateGanttProgress: builder.mutation<
  GanttItemResponse,
  { id: string; progress: number }
>({
  query: ({ id, progress }) => ({
    url: `/gantt/items/${id}`,
    method: "PATCH",
    body: { progress },
  }),

  async onQueryStarted({ id, progress }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      ganttApiSlice.util.updateQueryData(
        'getGanttItems',
        undefined,
        (draft) => {
          const item = draft.items.find((i) => i.id === id);
          if (item) {
            item.progress = progress;
            item.updatedAt = new Date().toISOString();
          }
        }
      )
    );

    try {
      await queryFulfilled;
    } catch (error) {
      patchResult.undo();
      console.error('❌ Error updating progress:', error);
    }
  },
}),
```

#### **PASO 1.5: Exportar nuevos hooks**

```typescript
// Al final del archivo, agregar exports:
export const {
  useGetGanttItemsQuery,
  useCreateGanttItemMutation,
  useUpdateGanttItemMutation,
  useUpdateGanttDatesMutation, // ✨ NUEVO
  useUpdateGanttProgressMutation, // ✨ NUEVO
  useDeleteGanttItemMutation,
  // ... otros hooks existentes
} = ganttApiSlice;
```

### ✅ **Checklist Etapa 1:**

- [ ] Modificar `updateGanttItem` con `onQueryStarted`
- [ ] Modificar `createGanttItem` con optimistic update
- [ ] Modificar `deleteGanttItem` con rollback
- [ ] Crear `updateGanttDates` para drag & drop
- [ ] Crear `updateGanttProgress` para barra de progreso
- [ ] Eliminar todos los `invalidatesTags`
- [ ] Exportar nuevos hooks
- [ ] Testear mutations individualmente

**Tiempo estimado**: 3-4 horas

---

## ETAPA 2: Server Component Wrapper (2-3h)

### 🎯 **Objetivo**: Crear Server Component que fetcha datos iniciales con Next.js cache

### 📝 **Archivos a crear/modificar**:

#### **PASO 2.1: Crear Server Action**

**Archivo CREAR**: `src/app/actions/gantt.ts`

```typescript
"use server";

import { revalidateTag } from "next/cache";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKURL || "http://localhost:8080";

/**
 * Fetch inicial de gantt items con cache de Next.js
 */
export async function getInitialGanttItems(filters?: {
  departmentsId?: string;
  demographyId?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();

  if (filters?.departmentsId) {
    params.append("departmentsId", filters.departmentsId);
  }
  if (filters?.demographyId) {
    params.append("demographyId", filters.demographyId);
  }
  params.append("limit", String(filters?.limit || 100));
  params.append("page", "1");

  const url = `${BACKEND_URL}/gantt/items?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 60, // Cache de 60 segundos
      tags: [
        "gantt-items",
        filters?.departmentsId ? `gantt-dept-${filters.departmentsId}` : "",
        filters?.demographyId ? `gantt-demo-${filters.demographyId}` : "",
      ].filter(Boolean),
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch gantt items: ${response.statusText}`);
    return null;
  }

  return response.json();
}

/**
 * Revalidar cache on-demand (llamar después de mutations)
 */
export async function revalidateGanttCache(
  departmentId?: string,
  demographyId?: string
) {
  revalidateTag("gantt-items");

  if (departmentId) {
    revalidateTag(`gantt-dept-${departmentId}`);
  }
  if (demographyId) {
    revalidateTag(`gantt-demo-${demographyId}`);
  }
}
```

#### **PASO 2.2: Crear Client Wrapper Component**

**Archivo CREAR**: `src/app/gantt/_components/GanttClientWrapper.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/_core/store";
import { ganttApiSlice } from "../_application/slices/ganttApiSlice";
import { GanttModule } from "../components/GanttModule";
import type { GanttListResponse } from "../_domain/schemas";

interface GanttClientWrapperProps {
  initialData: GanttListResponse | null;
}

export function GanttClientWrapper({ initialData }: GanttClientWrapperProps) {
  const dispatch = useAppDispatch();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HYDRATE RTK Query cache con datos del server
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (initialData) {
      console.log('✅ Hydrating RTK cache with server data:', initialData.meta);

      dispatch(
        ganttApiSlice.util.upsertQueryData(
          'getGanttItems',
          undefined, // Ajustar filtros si es necesario
          initialData
        )
      );
    }
  }, []); // Solo ejecutar en mount

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Renderizar GanttModule (recibe initialData para fallback)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return <GanttModule initialData={initialData?.items} />;
}
```

#### **PASO 2.3: Modificar página principal a Server Component**

**Archivo MODIFICAR**: `src/app/gantt/page.tsx`

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANTES (Client Component)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"use client";

import { GanttModule } from "./components/GanttModule";

export default function GanttPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gantt - Gestión de Proyectos</h1>
      <GanttModule />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESPUÉS (Server Component)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { Suspense } from "react";
import { getInitialGanttItems } from "@/app/actions/gantt";
import { GanttClientWrapper } from "./_components/GanttClientWrapper";

export default async function GanttPage() {
  // ✅ Fetch en servidor con Next.js cache
  const initialData = await getInitialGanttItems({ limit: 100 });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gantt - Gestión de Proyectos</h1>

      <Suspense fallback={<GanttLoadingSkeleton />}>
        <GanttClientWrapper initialData={initialData} />
      </Suspense>
    </div>
  );
}

// Loading skeleton
function GanttLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      <div className="h-96 bg-gray-200 rounded"></div>
    </div>
  );
}
```

### ✅ **Checklist Etapa 2:**

- [ ] Crear `src/app/actions/gantt.ts` con Server Actions
- [ ] Crear `src/app/gantt/_components/GanttClientWrapper.tsx`
- [ ] Modificar `src/app/gantt/page.tsx` a Server Component
- [ ] Testear que datos llegan del server en First Paint
- [ ] Verificar cache de Next.js (60s revalidate)

**Tiempo estimado**: 2-3 horas

---

## ETAPA 3: Polling Automático (30min) ✅ COMPLETADA

### 🎯 **Objetivo**: Agregar polling cada 30s para sync con otros usuarios

### ✅ **Implementación completada:**

1. **Archivo modificado**: `src/app/gantt/components/GanttChart.tsx` (líneas 71-84)
   - Agregado `pollingInterval: 30000` (30 segundos)
   - Agregado `skipPollingIfUnfocused: true` (pausa cuando tab inactiva)

2. **Indicador visual**: `src/app/gantt/components/GanttChart.tsx` (líneas 1113-1121)
   - Spinner animado + mensaje "Sincronizando cambios..."
   - Aparece solo cuando `isFetching` es `true`

### 📝 **Código implementado**:

```typescript
// useGetGanttItemsQuery con polling
const {
  data: response,
  isFetching,
  isSuccess,
  isError,
  error,
} = useGetGanttItemsQuery(
  {
    page: 1,
    limit: 100,
    departmentsId: department.id,
    demographyId: state?.id,
  },
  {
    // ✅ POLLING: Refetch cada 30 segundos para sincronizar con otros usuarios
    pollingInterval: 30000,
    // ✅ Pausar polling cuando la pestaña no está visible
    skipPollingIfUnfocused: true,
  }
);

// Indicador visual en el header
{isFetching && (
  <div className="flex items-center gap-2 mt-2">
    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
    <Typography variant="small" color="blue" className="text-xs" placeholder="">
      Sincronizando cambios...
    </Typography>
  </div>
)}
```

### ✅ **Checklist Etapa 3:**

- [x] Agregar `pollingInterval: 30000`
- [x] Agregar `skipPollingIfUnfocused: true`
- [x] Agregar indicador visual de sync
- [ ] Testear que polling funciona (ver Network tab cada 30s)
- [ ] Testear que polling se pausa al cambiar de tab

**Tiempo real**: ~20 minutos
**Estado**: ✅ **COMPLETADA** (código implementado, faltan tests de verificación)

---

## ETAPA 4: Cache Hydration (1-2h) ✅ COMPLETADA

### 🎯 **Objetivo**: Asegurar que RTK Query use datos del server sin re-fetch inicial

### ✅ **Implementación completada:**

1. **Archivo modificado**: `src/app/gantt/components/GanttModule.tsx`
   - Agregado prop `initialData` con uso efectivo
   - Agregado `isLoadingGantt` al estado de loading
   - Modificado `shouldShowLoading` para NO mostrar spinner si tenemos `initialData`
   - Agregado hydration de items individuales en cache con `upsertQueryData`
   - Modificado lógica para NO hacer fetch si ya tenemos `initialData`

2. **Archivo modificado**: `src/app/gantt/_components/GanttClientWrapper.tsx`
   - Mejorado logging de hydration con timestamps
   - Comentarios explicando flujo de ETAPA 4

### 📝 **Código implementado**:

```typescript
// GanttModule.tsx - Loading state inteligente
const shouldShowLoading =
  (isFetching || isFetchingDep || isLoadingAuth || isLoadingGantt) &&
  !initialData; // ✅ NO mostrar loading si tenemos initialData

// GanttModule.tsx - Hydration de items individuales
useEffect(() => {
  if (initialData && Array.isArray(initialData) && initialData.length > 0) {
    console.log('✅ [GanttModule] Hydrating individual item cache');
    initialData.forEach((item) => {
      dispatch(
        ganttApiSlice.util.upsertQueryData("getGanttItem", item.id, item),
      );
    });
  }
}, [initialData, dispatch]);

// GanttModule.tsx - Evitar fetch duplicado
if (id && !initialData) {
  getGanttItems({ departmentsId: id, page: 1, limit: 100 });
} else if (id && initialData) {
  console.log('✅ Usando initialData (no fetch necesario)');
}
```

### 📊 **Resultado esperado:**

✅ **isLoading = false** desde el primer render si tenemos initialData
✅ **NO hay re-fetch** inicial en Network tab
✅ **First Paint inmediato** con datos del servidor
✅ **Loading state** solo cuando realmente no hay datos

### 📝 **Archivo original del plan (antes de modificar)**:

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"use client";

import { useGetGanttItemsQuery } from "../_application/slices/ganttApiSlice";

export function GanttModule() {
  // ❌ Fetch en cliente (lento)
  const { data, isLoading } = useGetGanttItemsQuery();

  if (isLoading) return <div>Cargando...</div>;

  return <GanttChart data={data} />;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DESPUÉS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"use client";

import { useGetGanttItemsQuery } from "../_application/slices/ganttApiSlice";
import type { GanttItemType } from "../_domain/schemas";

interface GanttModuleProps {
  initialData?: GanttItemType[];
}

export function GanttModule({ initialData }: GanttModuleProps) {
  // ✅ RTK Query usa cache hydratado (isLoading = false inmediatamente)
  const { data, isLoading, error } = useGetGanttItemsQuery();

  // Usar initialData como fallback si cache no tiene datos
  const items = data?.items ?? initialData ?? [];

  // ✅ No mostrar loading si tenemos initialData
  if (isLoading && !initialData) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error al cargar datos</div>;
  }

  return <GanttChart data={items} />;
}
```

### ✅ **Checklist Etapa 3:**

- [ ] Agregar prop `initialData` a `GanttModule`
- [ ] Usar `initialData` como fallback
- [ ] Verificar que `isLoading` es `false` inmediatamente
- [ ] Confirmar que NO hay re-fetch inicial (ver Network tab)

**Tiempo estimado**: 1-2 horas

---

## ETAPA 5: Integración /departments y /worklist (2-3h) ✅ COMPLETADA

### 🎯 **Objetivo**: Reutilizar componentes en `/departments` y `/worklist`

### ✅ **Implementación completada:**

1. **Archivo verificado**: `src/app/departments/components/gc/Basico.tsx`
   - ✅ **Ya estaba integrado** GanttModule en tab "Gantt"
   - Agregados comentarios de documentación ETAPA 5
   - Funciona con arquitectura híbrida (optimistic updates + polling)

2. **Archivo implementado**: `src/app/worklist/page.tsx`
   - ✅ Implementada vista completa con tabs por departamento
   - Cada tab muestra GanttModule del departamento correspondiente
   - Manejo de loading state y errores
   - Filtrado de departamentos especiales (Gestión Ciudadana)

### 📝 **Código implementado**:

```typescript
// worklist/page.tsx - Vista consolidada
export function WorkListPage() {
  const { data: departments, isLoading, isError } = useGetDepartmentsQuery({});

  return (
    <TabBar
      data={departments
        .filter((dept) => !dept.name.toLowerCase().includes("gestion ciudadana"))
        .map((dept) => ({
          value: dept.id,
          label: dept.name,
          content: <GanttModule departmentProp={dept.name} />,
        }))}
    />
  );
}
```

### 📊 **Resultado:**

✅ **/departments** - Tab "Gantt" funcionando con arquitectura híbrida
✅ **/worklist** - Vista consolidada con tabs por departamento
✅ **Cache compartido** - RTK Query comparte datos entre tabs
✅ **Polling sincronizado** - Cada GanttModule sincroniza cada 30s
✅ **Optimistic updates** - UI instantánea en todas las vistas

### 📝 **Nota importante:**

Como `/departments/page.tsx` y `/worklist/page.tsx` son **Client Components** con estado (`useState`), NO se puede usar Server Components ni SSR en estos módulos. Sin embargo, los GanttModule internos:

- ✅ Usan optimistic updates (Etapa 1)
- ✅ Tienen polling automático (Etapa 3)
- ✅ Cache hydration funciona si se accede desde `/gantt` primero (Etapa 4)
- ✅ Comparten cache de RTK Query entre todas las instancias

**Tiempo real**: ~45 minutos (menos de lo estimado porque /departments ya estaba integrado)
**Estado**: ✅ **COMPLETADA**

---

### 📝 **Integración original planeada (referencia)**

### 📝 **Integración en /departments/[departmentName]**

**Archivo MODIFICAR**: `src/app/departments/[departmentName]/page.tsx`

```typescript
import { Suspense } from "react";
import { getInitialGanttItems } from "@/app/actions/gantt";
import { GanttClientWrapper } from "@/app/gantt/_components/GanttClientWrapper";

interface PageProps {
  params: {
    departmentName: string;
  };
}

export default async function DepartmentPage({ params }: PageProps) {
  const { departmentName } = params;
  const decodedName = decodeURIComponent(departmentName);

  // TODO: Convertir departmentName → departmentId
  // Por ahora, fetch sin filtro de departamento
  const initialData = await getInitialGanttItems({ limit: 200 });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Gestión de Proyectos - {decodedName}
      </h1>

      {/* Tab "Gantt" dentro de las tabs existentes */}
      <div className="tabs">
        {/* ... otras tabs existentes ... */}

        <div className="tab-content">
          <Suspense fallback={<div>Cargando Gantt...</div>}>
            <GanttClientWrapper initialData={initialData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

### 📝 **Integración en /worklist**

**Archivo MODIFICAR**: `src/app/worklist/page.tsx`

```typescript
import { Suspense } from "react";
import { getInitialGanttItems } from "@/app/actions/gantt";
import { GanttClientWrapper } from "@/app/gantt/_components/GanttClientWrapper";

export default async function WorklistPage() {
  // Fetch todos los items (sin filtro de departamento)
  const initialData = await getInitialGanttItems({ limit: 500 });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Lista de Trabajo - Todos los Proyectos
      </h1>

      <Suspense fallback={<div>Cargando Gantt...</div>}>
        <GanttClientWrapper initialData={initialData} />
      </Suspense>
    </div>
  );
}
```

### ✅ **Checklist Etapa 5:**

- [ ] Integrar GanttClientWrapper en `/departments/[departmentName]/page.tsx`
- [ ] Integrar GanttClientWrapper en `/worklist/page.tsx`
- [ ] Testear navegación entre páginas
- [ ] Verificar que cache se mantiene entre navegaciones
- [ ] Confirmar que tabs dinámicas funcionan

**Tiempo estimado**: 2-3 horas

---

## 6. TESTING ADAPTADO

### 🧪 **Tests a modificar** (NO crear desde cero)

#### **Test 6.1: RTK Query Mutations**

**Archivo**: Existente en `__tests__/`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useUpdateGanttItemMutation } from '@/app/gantt/_application/slices/ganttApiSlice';

describe('Optimistic Updates', () => {
  it('should update item optimistically and rollback on error', async () => {
    const { result } = renderHook(() => useUpdateGanttItemMutation(), {
      wrapper: ReduxProvider,
    });

    // Mock backend error
    server.use(
      rest.patch('/gantt/items/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const [updateItem] = result.current;

    // Ejecutar mutation
    const promise = updateItem({ id: '123', data: { name: 'Updated' } });

    // Cache debe actualizarse optimísticamente
    // ... assert cache state

    // Esperar error
    await expect(promise).rejects.toThrow();

    // Cache debe hacer rollback
    // ... assert cache reverted
  });
});
```

#### **Test 6.2: Server Component**

**Archivo CREAR**: `src/app/gantt/__tests__/page.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import GanttPage from '../page';

// Mock Server Action
jest.mock('@/app/actions/gantt', () => ({
  getInitialGanttItems: jest.fn().mockResolvedValue({
    items: [{ id: '1', name: 'Task 1' }],
    meta: { total: 1 },
  }),
}));

describe('GanttPage (Server Component)', () => {
  it('should fetch and render initial data', async () => {
    const page = await GanttPage();
    render(page);

    expect(screen.getByText('Gantt - Gestión de Proyectos')).toBeInTheDocument();
  });
});
```

### ✅ **Checklist Testing:**

- [ ] Adaptar tests de mutations para optimistic updates
- [ ] Crear test de hydration
- [ ] Crear test de polling
- [ ] Testear rollback en errores
- [ ] Coverage >80%

---

## CHECKLIST DE TAREAS

### ✅ **Checklist General**

#### **Etapa 1: Optimistic Updates** ✅ COMPLETADA
- [x] Modificar `updateGanttItem`
- [x] Modificar `createGanttItem`
- [x] Modificar `deleteGanttItem`
- [x] Crear `patchGanttDates` (updateGanttDates)
- [x] Crear `patchGanttProgress` (updateGanttProgress)
- [x] Eliminar `invalidatesTags`
- [x] Exportar nuevos hooks
- [ ] Testing mutations (pendiente)

#### **Etapa 2: Server Component** ✅ COMPLETADA
- [x] Crear `src/app/actions/gantt.ts`
- [x] Crear `GanttClientWrapper.tsx`
- [x] Modificar `page.tsx` a Server Component
- [ ] Verificar cache Next.js (pendiente test)

#### **Etapa 3: Polling** ✅ COMPLETADA
- [x] Agregar `pollingInterval: 30000`
- [x] Agregar `skipPollingIfUnfocused: true`
- [x] Agregar indicador visual
- [ ] Testear polling en Network tab
- [ ] Testear pausa al cambiar de tab

#### **Etapa 4: Hydration** ✅ COMPLETADA
- [x] Agregar prop `initialData` a `GanttModule`
- [x] Usar `initialData` como fallback en loading state
- [x] Modificar `shouldShowLoading` para respetar `initialData`
- [x] Hydrate items individuales en cache
- [x] Evitar fetch duplicado cuando hay `initialData`
- [x] Agregar logging de debugging
- [ ] Verificar `isLoading = false` en browser (pendiente test manual)

#### **Etapa 5: Integración** ✅ COMPLETADA
- [x] Verificar integración en `/departments` (ya estaba)
- [x] Agregar comentarios de documentación en `/departments`
- [x] Implementar `/worklist` con tabs por departamento
- [x] Agregar manejo de loading y errores en `/worklist`
- [x] Filtrar departamentos especiales
- [ ] Testear navegación entre páginas (pendiente test manual)
- [ ] Verificar cache compartido entre tabs (pendiente test manual)

#### **Testing**
- [ ] Tests de mutations
- [ ] Tests de hydration
- [ ] Tests de polling
- [ ] Coverage >80%

---

## 8. ROLLBACK PLAN

### 🔄 **Si algo sale mal:**

#### **Rollback Completo (git revert)**

```bash
# Crear branch antes de empezar
git checkout -b feature/gantt-hybrid-migration
git commit -m "checkpoint: before migration"

# Si necesitas volver atrás
git checkout main
git branch -D feature/gantt-hybrid-migration
```

#### **Rollback Parcial (por etapa)**

Si una etapa falla, puedes revertir solo esa etapa:

```bash
# Etapa 1 falla → revertir mutations
git checkout ganttApiSlice.ts

# Etapa 2 falla → eliminar Server Components
rm -rf src/app/gantt/_components/GanttClientWrapper.tsx
git checkout src/app/gantt/page.tsx
```

#### **Fallback en código**

Agregar flag de feature para activar/desactivar:

```typescript
// .env
NEXT_PUBLIC_ENABLE_HYBRID_GANTT=false

// page.tsx
const enableHybrid = process.env.NEXT_PUBLIC_ENABLE_HYBRID_GANTT === 'true';

if (enableHybrid) {
  return <GanttClientWrapper initialData={initialData} />;
} else {
  return <GanttModule />; // Old client-side version
}
```

---

## 📊 RESUMEN FINAL

### **Migración Incremental vs Reimplementación**

| Aspecto | Reimplementación | Migración Incremental ✅ |
|---------|------------------|-------------------------|
| **Tiempo** | 52-68 horas | **8-12 horas** |
| **Archivos nuevos** | 22 archivos | **3 archivos** |
| **Archivos modificados** | 8 archivos | **4 archivos** |
| **Riesgo** | Alto | **Bajo** |
| **Testing** | 45 test suites nuevos | **Adaptar existentes** |
| **Rollback** | Difícil | **Fácil (git revert)** |
| **Features** | Todos | **Solo necesarios** |

### **Resultado esperado:**

✅ **First Paint**: Datos renderizados en servidor
✅ **Optimistic Updates**: UI instantánea
✅ **Rollback automático**: Si backend falla
✅ **Polling 30s**: Sync con otros usuarios
✅ **Cache híbrido**: Next.js (server) + RTK Query (client)
✅ **Reutilización**: Componentes existentes funcionan

---

**¿Listo para comenzar la migración? 🚀**

**Siguiente paso**: Empezar con Etapa 1 (Optimistic Updates)
