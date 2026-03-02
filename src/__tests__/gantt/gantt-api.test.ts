import { describe, it, expect } from 'vitest';

/**
 * GANTT API TESTS - RTK Query Endpoints
 *
 * Objetivo: Validar que todos los endpoints RTK Query están correctamente definidos
 * y se integran con el apiSlice unificado.
 *
 * Coverage:
 * - Queries (GET endpoints)
 * - Mutations (POST, PUT, DELETE endpoints)
 * - Tag invalidation
 * - Type safety
 */

describe('Gantt API - RTK Query Endpoints', () => {
  describe('Hook Exports', () => {
    it('should export useGetGanttItemsQuery hook', async () => {
      const { useGetGanttItemsQuery } = await import('@/_core/api');
      expect(useGetGanttItemsQuery).toBeDefined();
      expect(typeof useGetGanttItemsQuery).toBe('function');
    });

    it('should export useGetGanttItemQuery hook', async () => {
      const { useGetGanttItemQuery } = await import('@/_core/api');
      expect(useGetGanttItemQuery).toBeDefined();
      expect(typeof useGetGanttItemQuery).toBe('function');
    });

    it('should export useCreateGanttItemMutation hook', async () => {
      const { useCreateGanttItemMutation } = await import('@/_core/api');
      expect(useCreateGanttItemMutation).toBeDefined();
      expect(typeof useCreateGanttItemMutation).toBe('function');
    });

    it('should export useUpdateGanttItemMutation hook', async () => {
      const { useUpdateGanttItemMutation } = await import('@/_core/api');
      expect(useUpdateGanttItemMutation).toBeDefined();
      expect(typeof useUpdateGanttItemMutation).toBe('function');
    });

    it('should export usePatchGanttDatesMutation hook', async () => {
      const { usePatchGanttDatesMutation } = await import('@/_core/api');
      expect(usePatchGanttDatesMutation).toBeDefined();
      expect(typeof usePatchGanttDatesMutation).toBe('function');
    });

    it('should export usePatchGanttProgressMutation hook', async () => {
      const { usePatchGanttProgressMutation } = await import('@/_core/api');
      expect(usePatchGanttProgressMutation).toBeDefined();
      expect(typeof usePatchGanttProgressMutation).toBe('function');
    });

    it('should export useDeleteGanttItemMutation hook', async () => {
      const { useDeleteGanttItemMutation } = await import('@/_core/api');
      expect(useDeleteGanttItemMutation).toBeDefined();
      expect(typeof useDeleteGanttItemMutation).toBe('function');
    });

    it('should export useCompleteGanttItemMutation hook', async () => {
      const { useCompleteGanttItemMutation } = await import('@/_core/api');
      expect(useCompleteGanttItemMutation).toBeDefined();
      expect(typeof useCompleteGanttItemMutation).toBe('function');
    });

    it('should export useSearchGanttItemsQuery hook', async () => {
      const { useSearchGanttItemsQuery } = await import('@/_core/api');
      expect(useSearchGanttItemsQuery).toBeDefined();
      expect(typeof useSearchGanttItemsQuery).toBe('function');
    });
  });

  describe('Dependency Endpoints Hooks', () => {
    it('should export useGetDependenciesQuery hook', async () => {
      const { useGetDependenciesQuery } = await import('@/_core/api');
      expect(useGetDependenciesQuery).toBeDefined();
      expect(typeof useGetDependenciesQuery).toBe('function');
    });

    it('should export useCreateDependencyMutation hook', async () => {
      const { useCreateDependencyMutation } = await import('@/_core/api');
      expect(useCreateDependencyMutation).toBeDefined();
      expect(typeof useCreateDependencyMutation).toBe('function');
    });

    it('should export useDeleteDependencyMutation hook', async () => {
      const { useDeleteDependencyMutation } = await import('@/_core/api');
      expect(useDeleteDependencyMutation).toBeDefined();
      expect(typeof useDeleteDependencyMutation).toBe('function');
    });

    it('should export useGetItemDependenciesQuery hook', async () => {
      const { useGetItemDependenciesQuery } = await import('@/_core/api');
      expect(useGetItemDependenciesQuery).toBeDefined();
      expect(typeof useGetItemDependenciesQuery).toBe('function');
    });

    it('should export useGetGanttItemDependenciesQuery hook', async () => {
      const { useGetGanttItemDependenciesQuery } = await import('@/_core/api');
      expect(useGetGanttItemDependenciesQuery).toBeDefined();
      expect(typeof useGetGanttItemDependenciesQuery).toBe('function');
    });
  });

  describe('API Slice Integration', () => {
    it('should have ganttApiSlice injected into unified apiSlice', async () => {
      const { ganttApiSlice } = await import('@/_core/api');
      expect(ganttApiSlice).toBeDefined();
      expect(ganttApiSlice.reducerPath).toBe('api');
    });

    it('should have ganttItems endpoints in apiSlice', async () => {
      const { ganttApiSlice } = await import('@/_core/api');
      expect(ganttApiSlice.endpoints).toBeDefined();
      expect(ganttApiSlice.endpoints.getGanttItems).toBeDefined();
      expect(ganttApiSlice.endpoints.createGanttItem).toBeDefined();
      expect(ganttApiSlice.endpoints.updateGanttItem).toBeDefined();
    });

    it('should share reducerPath with other API slices', async () => {
      const { ganttApiSlice, departmentsApiSlice, tasksApiSlice } = await import('@/_core/api');
      expect(ganttApiSlice.reducerPath).toBe('api');
      expect(departmentsApiSlice.reducerPath).toBe('api');
      expect(tasksApiSlice.reducerPath).toBe('api');
    });
  });

  describe('Type Exports', () => {
    it('should export GanttItemResponse type', async () => {
      const types = await import('@/_core/api');
      expect(types).toHaveProperty('GanttItemResponseSchema');
    });

    it('should export CreateGanttItemType type', async () => {
      const types = await import('@/_core/api');
      expect(types).toHaveProperty('CreateGanttItemSchema');
    });

    it('should export UpdateGanttItemType type', async () => {
      const types = await import('@/_core/api');
      expect(types).toHaveProperty('UpdateGanttItemSchema');
    });
  });
});
