import { describe, it, expect } from 'vitest';

describe('API Imports and Exports', () => {
  it('should export all required hooks from @/_core/api', async () => {
    const api = await import('@/_core/api');

    // Check that essential hooks are exported
    expect(api.useLoginMutation).toBeDefined();
    expect(api.useGetDepartmentsQuery).toBeDefined();
    expect(api.useGetUsersQuery).toBeDefined();
    expect(api.useGetIssuesQuery).toBeDefined();
    expect(api.useGetFodaQuery).toBeDefined();
    expect(api.usersApiSlice).toBeDefined();
    expect(api.gcApiSlice).toBeDefined();
    expect(api.departmentsApiSlice).toBeDefined();
  });

  it('should export unified apiSlice from shared infrastructure', async () => {
    const api = await import('@/_core/api');
    expect(api.apiSlice).toBeDefined();
    expect(api.apiSlice.reducerPath).toBe('api');
  });

  it('should have all feature slices sharing unified apiSlice', async () => {
    const api = await import('@/_core/api');

    // All slices should share the same reducerPath since they use injectEndpoints
    expect(api.authApiSlice.reducerPath).toBe('api');
    expect(api.departmentsApiSlice.reducerPath).toBe('api');
    expect(api.gcApiSlice.reducerPath).toBe('api');
    expect(api.tasksApiSlice.reducerPath).toBe('api');
    expect(api.fodaApiSlice.reducerPath).toBe('api');
    expect(api.usersApiSlice.reducerPath).toBe('api');
    expect(api.statesApiSlice.reducerPath).toBe('api');
  });

  it('should export FODA strategy mutations', async () => {
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

  it('should export required schemas', async () => {
    const api = await import('@/_core/api');

    expect(api.DerivationSchema).toBeDefined();
    expect(api.fodaItem).toBeDefined();
  });
});
