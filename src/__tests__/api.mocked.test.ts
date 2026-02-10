import { describe, it, expect } from 'vitest';
import { mockDepartments, mockAuthUser, mockIssues, mockTasks, mockUsers, mockKOIs } from './mocks/handlers';

describe('API Tests with Mocked Data', () => {
  describe('Mock Data Structure Validation', () => {
    it('should have valid departments mock data', () => {
      expect(mockDepartments).toHaveLength(3);
      expect(mockDepartments[0]).toHaveProperty('id');
      expect(mockDepartments[0]).toHaveProperty('name');
      expect(mockDepartments[0]).toHaveProperty('description');
    });

    it('should have valid auth user mock data', () => {
      expect(mockAuthUser).toHaveProperty('id');
      expect(mockAuthUser).toHaveProperty('username');
      expect(mockAuthUser).toHaveProperty('name');
      expect(mockAuthUser.isAdmin).toBe(false);
    });

    it('should have valid KOIs (Kind of Issues) mock data', () => {
      expect(mockKOIs).toHaveLength(2);
      expect(mockKOIs[0]).toHaveProperty('id');
      expect(mockKOIs[0]).toHaveProperty('name');
      expect(mockKOIs[0]).toHaveProperty('text');
    });

    it('should have valid issues mock data', () => {
      expect(mockIssues).toHaveLength(2);
      expect(mockIssues[0]).toHaveProperty('id');
      expect(mockIssues[0]).toHaveProperty('title');
      expect(mockIssues[0]).toHaveProperty('state');
      expect(mockIssues[0]).toHaveProperty('department');
    });

    it('should have valid tasks mock data', () => {
      expect(mockTasks).toHaveLength(1);
      expect(mockTasks[0]).toHaveProperty('id');
      expect(mockTasks[0]).toHaveProperty('title');
      expect(mockTasks[0]).toHaveProperty('status');
    });

    it('should have valid users mock data', () => {
      expect(mockUsers).toHaveLength(2);
      expect(mockUsers[0]).toHaveProperty('id');
      expect(mockUsers[0]).toHaveProperty('username');
      expect(mockUsers[0]).toHaveProperty('isAdmin');
    });
  });

  describe('API Endpoint Handlers', () => {
    it('should have auth login handler', async () => {
      const api = await import('@/_core/api');
      expect(api.useLoginMutation).toBeDefined();
    });

    it('should have departments query handler', async () => {
      const api = await import('@/_core/api');
      expect(api.useGetDepartmentsQuery).toBeDefined();
    });

    it('should have GC issues query handler', async () => {
      const api = await import('@/_core/api');
      expect(api.useGetIssuesQuery).toBeDefined();
    });

    it('should have tasks query handler', async () => {
      const api = await import('@/_core/api');
      expect(api.useGetTasksQuery).toBeDefined();
    });

    it('should have users query handler', async () => {
      const api = await import('@/_core/api');
      expect(api.useGetUsersQuery).toBeDefined();
    });
  });

  describe('Redux Integration with Mocked Data', () => {
    it('should have unified apiSlice from mocked server', async () => {
      const api = await import('@/_core/api');
      expect(api.apiSlice).toBeDefined();
      expect(api.apiSlice.reducerPath).toBe('api');
    });

    it('should have authApiSlice injected into unified apiSlice', async () => {
      const api = await import('@/_core/api');
      expect(api.authApiSlice).toBeDefined();
      expect(api.authApiSlice.reducerPath).toBe('api');
    });

    it('should have gcApiSlice injected into unified apiSlice', async () => {
      const api = await import('@/_core/api');
      expect(api.gcApiSlice).toBeDefined();
      expect(api.gcApiSlice.reducerPath).toBe('api');
    });

    it('should have departmentsApiSlice injected into unified apiSlice', async () => {
      const api = await import('@/_core/api');
      expect(api.departmentsApiSlice).toBeDefined();
      expect(api.departmentsApiSlice.reducerPath).toBe('api');
    });
  });

  describe('Mock Data Scenarios', () => {
    it('should have departments with different departments', () => {
      const [gestion, practicas, cronicos] = mockDepartments;
      expect(gestion.name).toBe('Gestión');
      expect(practicas.name).toBe('Prácticas');
      expect(cronicos.name).toBe('Crónicos');
    });

    it('should have issues with different states', () => {
      const pendingIssue = mockIssues.find(i => i.state === 'pending');
      const workingIssue = mockIssues.find(i => i.state === 'working');
      expect(pendingIssue).toBeDefined();
      expect(workingIssue).toBeDefined();
    });

    it('should have admin and non-admin users', () => {
      const adminUser = mockUsers.find(u => u.isAdmin);
      const normalUser = mockUsers.find(u => !u.isAdmin);
      expect(adminUser).toBeDefined();
      expect(normalUser).toBeDefined();
    });

    it('should have different KOI types', () => {
      const healthKOI = mockKOIs.find(k => k.name === 'Salud');
      const educationKOI = mockKOIs.find(k => k.name === 'Educación');
      expect(healthKOI).toBeDefined();
      expect(educationKOI).toBeDefined();
    });
  });
});
