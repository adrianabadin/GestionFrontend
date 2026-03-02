"use server";

import { revalidateTag } from "next/cache";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKURL || "http://localhost:8080";

/**
 * Fetch inicial de gantt items con cache de Next.js
 * Llamado desde Server Components para SSR
 */
export async function getInitialGanttItems(filters?: {
  departmentsId?: string;
  demographyId?: string;
  assignedToId?: string;
  parentId?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const params = new URLSearchParams();

    // Agregar filtros opcionales
    if (filters?.departmentsId) {
      params.append("departmentsId", filters.departmentsId);
    }
    if (filters?.demographyId) {
      params.append("demographyId", filters.demographyId);
    }
    if (filters?.assignedToId) {
      params.append("assignedToId", filters.assignedToId);
    }
    if (filters?.parentId) {
      params.append("parentId", filters.parentId);
    }

    // Paginación (usar pageSize en lugar de limit para backend)
    params.append("page", String(filters?.page || 1));
    params.append("pageSize", String(filters?.limit || 100));

    const url = `${BACKEND_URL}/gantt/items?${params.toString()}`;

    console.log('🔄 [Server Action] Fetching gantt items from:', url);

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
      console.error(`❌ [Server Action] Failed to fetch gantt items: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('✅ [Server Action] Fetched gantt items:', data.meta || 'no meta');

    return data;

  } catch (error) {
    console.error('❌ [Server Action] Error fetching gantt items:', error);
    return null;
  }
}

/**
 * Revalidar cache on-demand
 * Llamar después de mutations importantes para forzar refresh
 */
export async function revalidateGanttCache(
  departmentId?: string,
  demographyId?: string
) {
  console.log('🔄 [Server Action] Revalidating gantt cache');

  revalidateTag("gantt-items");

  if (departmentId) {
    revalidateTag(`gantt-dept-${departmentId}`);
  }
  if (demographyId) {
    revalidateTag(`gantt-demo-${demographyId}`);
  }

  console.log('✅ [Server Action] Cache revalidated');
}

/**
 * Fetch states para tabs dinámicas
 * (Reutilizable en Server Components)
 */
export async function getStates() {
  try {
    const url = `${BACKEND_URL}/states/getStates`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 300, // Cache de 5 minutos (states cambian poco)
        tags: ["states"],
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch states: ${response.statusText}`);
      return null;
    }

    return response.json();

  } catch (error) {
    console.error('❌ Error fetching states:', error);
    return null;
  }
}

/**
 * Fetch departments para worklist
 * (Reutilizable en Server Components)
 */
export async function getAllDepartments() {
  try {
    const url = `${BACKEND_URL}/departments/getdepartments`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 300, // Cache de 5 minutos
        tags: ["departments"],
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch departments: ${response.statusText}`);
      return null;
    }

    return response.json();

  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    return null;
  }
}
