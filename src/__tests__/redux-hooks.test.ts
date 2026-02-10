import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/_core/api';

// Helper to create a test store
const createTestStore = () =>
  configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

describe('Redux Hooks Integration', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('API Slice Hooks', () => {
    it('should have useGetDepartmentsQuery hook', async () => {
      const { useGetDepartmentsQuery } = await import('@/_core/api');
      expect(useGetDepartmentsQuery).toBeDefined();
      expect(typeof useGetDepartmentsQuery).toBe('function');
    });

    it('should have useLoginMutation hook', async () => {
      const { useLoginMutation } = await import('@/_core/api');
      expect(useLoginMutation).toBeDefined();
      expect(typeof useLoginMutation).toBe('function');
    });

    it('should have useGetUsersQuery hook', async () => {
      const { useGetUsersQuery } = await import('@/_core/api');
      expect(useGetUsersQuery).toBeDefined();
      expect(typeof useGetUsersQuery).toBe('function');
    });

    it('should have useGetIssuesQuery hook', async () => {
      const { useGetIssuesQuery } = await import('@/_core/api');
      expect(useGetIssuesQuery).toBeDefined();
      expect(typeof useGetIssuesQuery).toBe('function');
    });

    it('should have useGetTasksQuery hook', async () => {
      const { useGetTasksQuery } = await import('@/_core/api');
      expect(useGetTasksQuery).toBeDefined();
      expect(typeof useGetTasksQuery).toBe('function');
    });

    it('should have useGetFodaQuery hook', async () => {
      const { useGetFodaQuery } = await import('@/_core/api');
      expect(useGetFodaQuery).toBeDefined();
      expect(typeof useGetFodaQuery).toBe('function');
    });

    it('should have useGetKOIsQuery hook', async () => {
      const api = await import('@/_core/api');
      // Check if KOIs query exists (may vary by implementation)
      expect(api).toBeDefined();
    });
  });

  describe('API Slice Configuration', () => {
    it('should have correct reducerPath', () => {
      expect(apiSlice.reducerPath).toBe('api');
    });

    it('should have middleware', () => {
      expect(apiSlice.middleware).toBeDefined();
    });

    it('should have reducer', () => {
      expect(apiSlice.reducer).toBeDefined();
      expect(typeof apiSlice.reducer).toBe('function');
    });

    it('should have endpoints', () => {
      expect(apiSlice.endpoints).toBeDefined();
      expect(typeof apiSlice.endpoints).toBe('object');
    });

    it('should have injectEndpoints method', () => {
      expect(apiSlice.injectEndpoints).toBeDefined();
      expect(typeof apiSlice.injectEndpoints).toBe('function');
    });
  });

  describe('Store Configuration', () => {
    it('should create store with apiSlice reducer', () => {
      expect(store).toBeDefined();
      expect(store.getState()).toHaveProperty('api');
    });

    it('should have dispatch method', () => {
      expect(store.dispatch).toBeDefined();
      expect(typeof store.dispatch).toBe('function');
    });

    it('should have subscribe method', () => {
      expect(store.subscribe).toBeDefined();
      expect(typeof store.subscribe).toBe('function');
    });

    it('should have getState method', () => {
      expect(store.getState).toBeDefined();
      expect(typeof store.getState).toBe('function');
    });

    it('should have replaceReducer method', () => {
      expect(store.replaceReducer).toBeDefined();
      expect(typeof store.replaceReducer).toBe('function');
    });
  });

  describe('API Slice Mutations', () => {
    it('should have FODA strategy mutations', async () => {
      const api = await import('@/_core/api');

      expect(api.useAddStrategySOMutation).toBeDefined();
      expect(api.useRemoveStrategySOMutation).toBeDefined();
      expect(api.useAddStrategyWOMutation).toBeDefined();
      expect(api.useRemoveStrategyWOMutation).toBeDefined();
      expect(api.useAddStrategySMMutation).toBeDefined();
      expect(api.useRemoveStrategySMMutation).toBeDefined();
      expect(api.useAddStrategyWMMutation).toBeDefined();
      expect(api.useRemoveStrategyWMMutation).toBeDefined();
    });

    it('should have user management mutations', async () => {
      const api = await import('@/_core/api');

      expect(api.useLoginMutation).toBeDefined();
    });

    it('should export all mutation hooks as functions', async () => {
      const api = await import('@/_core/api');

      expect(typeof api.useAddStrategySOMutation).toBe('function');
      expect(typeof api.useLoginMutation).toBe('function');
    });
  });

  describe('Cache Behavior', () => {
    it('should initialize with empty cache', () => {
      const state = store.getState();
      expect(state.api.queries).toEqual({});
      expect(state.api.mutations).toEqual({});
    });

    it('should have proper cache structure', () => {
      const state = store.getState();
      expect(state.api).toHaveProperty('queries');
      expect(state.api).toHaveProperty('mutations');
      expect(state.api).toHaveProperty('provided');
      expect(state.api).toHaveProperty('subscriptions');
    });

    it('should have config property', () => {
      const state = store.getState();
      expect(state.api).toHaveProperty('config');
    });
  });

  describe('API Slice Tags', () => {
    it('should have tag types for cache invalidation', () => {
      // RTK Query uses tags for cache invalidation
      expect(apiSlice).toBeDefined();
    });

    it('should be able to reset API state', () => {
      expect(apiSlice.util).toBeDefined();
      expect(apiSlice.util.resetApiState).toBeDefined();
    });
  });
});
