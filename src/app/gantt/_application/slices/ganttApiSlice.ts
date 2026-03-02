import { apiSlice } from "@/_shared/_infrastructure/api";
import type {
  GanttItemResponse,
  GanttListResponse,
  CreateGanttItemType,
  UpdateGanttItemType,
  GanttQueryFilters
} from "../../_domain/types";

export const ganttApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /gantt/items - Lista paginada de items
    getGanttItems: builder.query<GanttListResponse, GanttQueryFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        // Backend usa "page" y "pageSize", no "limit"
        if (filters.page !== undefined) params.append("page", filters.page.toString());
        if (filters.limit !== undefined) params.append("pageSize", filters.limit.toString());
        if(filters.demographyId !== undefined) params.append("demographyId",filters.demographyId);
        if(filters.departmentsId !== undefined) params.append("departmentsId",filters.departmentsId);
        // Backend usa "isActive" (true/false string), no "includeInactive"
        if (filters.includeInactive !== undefined) {
          params.append("isActive", filters.includeInactive ? "false" : "true");
        }

        // Otros filtros
        if (filters.assignedToId !== undefined) params.append("assignedToId", filters.assignedToId);
        if (filters.parentId !== undefined) params.append("parentId", filters.parentId);

        const queryString = params.toString();
        return {
          url: `/gantt/items${queryString ? `?${queryString}` : ""}`,
          method: "GET"
        };
      },
      providesTags: [{type:"ganttItems",id:"LIST"}]
    }),

    // GET /gantt/items/:id - Obtener un item específico
    getGanttItem: builder.query<GanttItemResponse, string>({
      query: (id) => ({
        url: `/gantt/items/${id}`,
        method: "GET"
      }),
      providesTags: (_result, _error, id) => [{ type: "ganttItems", id }]
    }),

    // POST /gantt/items - Crear nuevo item (con optimistic update)
    createGanttItem: builder.mutation<GanttItemResponse, CreateGanttItemType>({
      query: (body) => ({
        url: "/gantt/items",
        method: "POST",
        body
      }),

      async onQueryStarted(newItem, { dispatch, queryFulfilled }) {
        // Crear ID temporal para optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticItem = {
          id: tempId,
          ...newItem,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        };

        // OPTIMISTIC UPDATE: Agregar al cache inmediatamente
        const patchResult = dispatch(
          ganttApiSlice.util.updateQueryData(
            'getGanttItems',
            undefined as any, // Actualizar cache sin filtros específicos
            (draft) => {
              draft.items.unshift(optimisticItem as any);
              if (draft.meta) {
                draft.meta.total = (draft.meta.total || 0) + 1;
              }
            }
          )
        );

        try {
          // Esperar confirmación del backend
          const { data: createdItem } = await queryFulfilled;

          // Reemplazar tempId con ID real del servidor
          dispatch(
            ganttApiSlice.util.updateQueryData(
              'getGanttItems',
              undefined as any,
              (draft) => {
                const index = draft.items.findIndex((i) => i.id === tempId);
                if (index !== -1) {
                  draft.items[index] = createdItem.data;
                }
              }
            )
          );

        } catch (error) {
          // ROLLBACK: Remover item temporal si falla
          patchResult.undo();
          console.error('❌ Error creating gantt item:', error);
        }
      },
    }),

    // PUT /gantt/items/:id - Actualizar item completo (con optimistic update)
    updateGanttItem: builder.mutation<GanttItemResponse, { id: string; data: UpdateGanttItemType }>({
      query: ({ id, data }) => ({
        url: `/gantt/items/${id}`,
        method: "PUT",
        body: data
      }),

      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // OPTIMISTIC UPDATE: Actualizar cache inmediatamente
        const patchResult = dispatch(
          ganttApiSlice.util.updateQueryData(
            'getGanttItems',
            undefined as any,
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
          // Esperar confirmación del backend
          const { data: updatedItem } = await queryFulfilled;

          // Actualizar con datos reales del servidor
          dispatch(
            ganttApiSlice.util.updateQueryData(
              'getGanttItems',
              undefined as any,
              (draft) => {
                const index = draft.items.findIndex((i) => i.id === id);
                if (index !== -1) {
                  draft.items[index] = updatedItem.data;
                }
              }
            )
          );

        } catch (error) {
          // ROLLBACK: Revertir cambios si falla
          patchResult.undo();
          console.error('❌ Error updating gantt item:', error);
        }
      },
    }),

    // PUT /gantt/items/:id - Actualizar parcialmente (para drag & drop de fechas con optimistic update)
    patchGanttDates: builder.mutation<GanttItemResponse, { id: string; startDate: string; endDate: string }>({
      query: ({ id, startDate, endDate }) => ({
        url: `/gantt/items/${id}`,
        method: "PUT",
        body: { startDate, endDate }
      }),

      async onQueryStarted({ id, startDate, endDate }, { dispatch, queryFulfilled }) {
        // OPTIMISTIC UPDATE: Actualizar fechas inmediatamente (para drag & drop)
        const patchResult = dispatch(
          ganttApiSlice.util.updateQueryData(
            'getGanttItems',
            undefined as any,
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
          // ROLLBACK: Revertir fechas si falla
          patchResult.undo();
          console.error('❌ Error updating dates:', error);
        }
      },
    }),

    // PUT /gantt/items/:id - Actualizar progreso (con optimistic update)
    patchGanttProgress: builder.mutation<GanttItemResponse, { id: string; progress: number }>({
      query: ({ id, progress }) => ({
        url: `/gantt/items/${id}`,
        method: "PUT",
        body: { progress }
      }),

      async onQueryStarted({ id, progress }, { dispatch, queryFulfilled }) {
        // OPTIMISTIC UPDATE: Actualizar progress inmediatamente (para drag de barra)
        const patchResult = dispatch(
          ganttApiSlice.util.updateQueryData(
            'getGanttItems',
            undefined as any,
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
          // ROLLBACK: Revertir progress si falla
          patchResult.undo();
          console.error('❌ Error updating progress:', error);
        }
      },
    }),

    // DELETE /gantt/items/:id - Soft delete (con optimistic update)
    deleteGanttItem: builder.mutation<{ message: string; id: string }, string>({
      query: (id) => ({
        url: `/gantt/items/${id}`,
        method: "DELETE"
      }),

      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // OPTIMISTIC UPDATE: Remover item inmediatamente
        const patchResult = dispatch(
          ganttApiSlice.util.updateQueryData(
            'getGanttItems',
            undefined as any,
            (draft) => {
              const index = draft.items.findIndex((i) => i.id === id);
              if (index !== -1) {
                draft.items.splice(index, 1);
                if (draft.meta) {
                  draft.meta.total = (draft.meta.total || 0) - 1;
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch (error) {
          // ROLLBACK: Restaurar item si falla
          patchResult.undo();
          console.error('❌ Error deleting gantt item:', error);
        }
      },
    }),

    // POST /gantt/items/:id/complete - Marcar como completado
    completeGanttItem: builder.mutation<GanttItemResponse, string>({
      query: (id) => ({
        url: `/gantt/items/${id}/complete`,
        method: "POST"
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ganttItems", id },
        { type: "ganttItems", id: "LIST" },
        "ganttItems"
      ]
    }),

    // GET /gantt/items/:itemId/dependencies - Obtener dependencias del item
    getGanttItemDependencies: builder.query<{ predecessors: GanttItemResponse[]; successors: GanttItemResponse[] }, string>({
      query: (itemId) => ({
        url: `/gantt/items/${itemId}/dependencies`,
        method: "GET"
      }),
      providesTags: (_result, _error, itemId) => [{ type: "ganttItems", id: itemId }]
    }),

    // GET /gantt/search - Búsqueda avanzada de items
    searchGanttItems: builder.query<GanttListResponse, { query: string; filters?: GanttQueryFilters }>({
      query: ({ query, filters = {} }) => {
        const params = new URLSearchParams();
        params.append("query", query);

        if (filters.page !== undefined) params.append("page", filters.page.toString());
        if (filters.limit !== undefined) params.append("limit", filters.limit.toString());
        if (filters.includeInactive !== undefined) params.append("includeInactive", filters.includeInactive.toString());

        return {
          url: `/gantt/search?${params.toString()}`,
          method: "GET"
        };
      },
      providesTags: [{type:"ganttItems",id:"LIST"}]
    }),

    // ========== DEPENDENCY ENDPOINTS ==========

    // GET /gantt/dependencies - Listar todas las dependencies
    getDependencies: builder.query<any[], { sourceItemId?: string; targetItemId?: string; itemIds?: string[] }>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.sourceItemId) params.append("sourceItemId", filters.sourceItemId);
        if (filters.targetItemId) params.append("targetItemId", filters.targetItemId);
        if (filters.itemIds && filters.itemIds.length > 0) {
          // Enviar como array query params: itemIds[]=id1&itemIds[]=id2
          filters.itemIds.forEach(id => params.append("itemIds[]", id));
        }

        const queryString = params.toString();
        return {
          url: `/gantt/dependencies${queryString ? `?${queryString}` : ""}`,
          method: "GET"
        };
      },
      providesTags: ["ganttItems"]
    }),

    // POST /gantt/dependencies - Crear dependency/link
    createDependency: builder.mutation<any, { sourceItemId: string; targetItemId: string; type?: string; lagDays?: number }>({
      query: (body) => ({
        url: "/gantt/dependencies",
        method: "POST",
        body
      }),
      invalidatesTags: ["ganttItems", { type: "ganttItems", id: "LIST" }]
    }),

    // DELETE /gantt/dependencies/:id - Eliminar dependency
    deleteDependency: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/gantt/dependencies/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["ganttItems", { type: "ganttItems", id: "LIST" }]
    }),

    // GET /gantt/items/:itemId/dependencies - Obtener dependencies de un item
    getItemDependencies: builder.query<{ predecessors: any[]; successors: any[] }, string>({
      query: (itemId) => ({
        url: `/gantt/items/${itemId}/dependencies`,
        method: "GET"
      }),
      providesTags: (_result, _error, itemId) => [{ type: "ganttItems", id: itemId }]
    })
  })
});

// Export hooks
export const {
  useGetGanttItemsQuery,
  useGetGanttItemQuery,
  useCreateGanttItemMutation,
  useUpdateGanttItemMutation,
  usePatchGanttDatesMutation,
  usePatchGanttProgressMutation,
  useDeleteGanttItemMutation,
  useCompleteGanttItemMutation,
  useGetGanttItemDependenciesQuery,
  useSearchGanttItemsQuery,
  useGetDependenciesQuery,
  useCreateDependencyMutation,
  useDeleteDependencyMutation,
  useGetItemDependenciesQuery
} = ganttApiSlice;
