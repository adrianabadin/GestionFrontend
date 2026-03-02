"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/_core/store";
import { ganttApiSlice } from "../_application/slices/ganttApiSlice";
import { GanttModule } from "../components/GanttModule";
import type { GanttListResponse } from "../_domain/types";

interface GanttClientWrapperProps {
  initialData: GanttListResponse | null;
  filters?: {
    departmentsId?: string;
    demographyId?: string;
    assignedToId?: string;
    page?: number;
    limit?: number;
  };
}

/**
 * Client Component que recibe datos del Server Component
 * y los hidrata en el cache de RTK Query
 */
export function GanttClientWrapper({ initialData, filters }: GanttClientWrapperProps) {
  const dispatch = useAppDispatch();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ETAPA 4: CACHE HYDRATION
  // - Server Component fetcha datos con Next.js cache (revalidate: 60s)
  // - Este wrapper hidrata RTK Query cache con esos datos
  // - Resultado: useGetGanttItemsQuery() retorna datos inmediatamente
  //   sin esperar fetch del cliente (isLoading = false desde el inicio)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (initialData) {
      console.log('✅ [GanttClientWrapper] HYDRATION - Starting cache hydration:', {
        items: initialData.items?.length || 0,
        total: initialData.meta?.total,
        filters,
        timestamp: new Date().toISOString(),
      });

      // Upsert data en RTK Query cache
      // IMPORTANTE: Usar los mismos filtros que usará useGetGanttItemsQuery()
      dispatch(
        ganttApiSlice.util.upsertQueryData(
          'getGanttItems',
          filters || {}, // Match con filtros de la query
          initialData
        )
      );

      console.log('✅ [GanttClientWrapper] HYDRATION - Cache populated successfully', {
        cacheKey: 'getGanttItems',
        filters: filters || {},
      });
    } else {
      console.warn('⚠️ [GanttClientWrapper] HYDRATION - No initialData provided, cache not hydrated');
    }
  }, []); // Solo ejecutar en mount inicial

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Renderizar GanttModule
  // - initialData se pasa como fallback por si cache falla
  // - filters se pasan para que GanttModule sepa qué query usar
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <GanttModule
      initialData={initialData?.items}
      filters={filters}
    />
  );
}
