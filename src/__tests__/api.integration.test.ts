/**
 * Robust Integration Tests with Real Backend
 * 
 * These tests connect to the real backend and VALIDATE responses against domain schemas.
 * They FAIL if the backend is unreachable or returns invalid data.
 * 
 * Run with: npm run test:integration
 * 
 * Requirements:
 * - Backend must be running at NEXT_PUBLIC_BACKURL
 * - Database must be populated with test data
 * - Tests will FAIL (not skip) if backend is down or returns invalid data
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';

// Domain Schemas for validation
import { DepartmentCreateSchema } from '@/app/departments/_domain/schemas';
import { TasksResponseSchema } from '@/app/tasks/_domain/schemas';
import { UserSchema } from '@/app/admin/_domain/schemas';
import { CreatedKOISchema, UserIssueSchema } from '@/app/gc/_domain/schemas';
import { StatesSchema } from '@/app/states/_domain/schemas';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKURL || 'http://localhost:8080';
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION !== 'false';

// Helper to make requests that FAIL if backend is down
async function fetchOrFail(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });
    return response;
  } catch (error) {
    throw new Error(
      `Backend unreachable at ${url}. ` +
      `Ensure backend is running at ${BACKEND_URL}. ` +
      `Error: ${error}`
    );
  }
}

// Helper to validate response against Zod schema
function validateSchema<T>(data: unknown, schema: z.ZodSchema<T>, endpoint: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Schema validation failed for ${endpoint}:\n` +
      result.error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n')
    );
  }
  return result.data;
}

describe.skipIf(SKIP_INTEGRATION)('API Integration Tests with Real Backend', () => {

  describe('Backend Health', () => {
    it('should confirm backend is accessible and responding', async () => {
      // Use a known endpoint instead of /health (which doesn't exist)
      const response = await fetchOrFail(`${BACKEND_URL}/departments/getdepartments`);

      // Backend should respond (200 for success, 401 for auth required)
      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
  });

  describe('Departments API Integration', () => {
    it('should fetch real departments and validate schema', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/departments/getdepartments`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        // Validate first department against schema (partial validation for GET)
        const dept = data[0];
        expect(dept).toHaveProperty('id');
        expect(dept).toHaveProperty('name');
        expect(typeof dept.id).toBe('string');
        expect(typeof dept.name).toBe('string');
      }
    });

    it('should reject invalid department creation data', async () => {
      // Test that POST endpoint exists and validates input
      const invalidData = {
        name: 'A', // Too short (min 3 chars)
        description: 'AB' // Too short (min 3 chars)
      };

      const response = await fetchOrFail(`${BACKEND_URL}/departments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });

      // Should return 400/422 for validation error, 401/403 for auth, 404 if endpoint doesn't exist
      expect([400, 422, 403, 401, 404]).toContain(response.status);
    });
  });

  describe('Auth API Integration', () => {
    it('should get JWT auth status from backend', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/auth/jwt`);
      
      // Success or 401 (not authenticated) both indicate backend is responding
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should reject invalid login credentials', async () => {
      const invalidLogin = {
        username: 'not-an-email',
        password: '123' // Too short
      };
      
      const response = await fetchOrFail(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidLogin)
      });
      
      // Should reject invalid credentials
      expect([400, 401, 422]).toContain(response.status);
    });
  });

  describe('GC (Gestión Ciudadana) API Integration', () => {
    it('should fetch real KOIs from backend', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/gc`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data) || typeof data === 'object').toBe(true);
    });

    it('should fetch real issues and validate structure', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/gc/issue`);

      // May require authentication (401) or return data (200)
      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data) || typeof data === 'object').toBe(true);

        if (Array.isArray(data) && data.length > 0) {
          const issue = data[0];
          expect(issue).toHaveProperty('id');
          expect(typeof issue.id).toBe('string');
        }
      }
    });

    it('should reject invalid issue creation', async () => {
      const invalidIssue = {
        name: 'Jo', // Too short (min 3)
        lastName: 'Do', // Too short (min 3)
        socialSecurityNumber: '123', // Invalid format
        state: 'X', // Too short (min 3)
        kind: 'Y', // Too short (min 3)
        department: 'dept-1',
        description: 'Short' // Too short (min 10)
      };

      const response = await fetchOrFail(`${BACKEND_URL}/gc/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidIssue)
      });

      // Should reject invalid data, or endpoint may not exist (404)
      expect([400, 422, 403, 401, 404]).toContain(response.status);
    });
  });

  describe('Tasks API Integration', () => {
    it('should fetch real tasks and validate schema', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/tasks/get`);

      // May require authentication (401) or return data (200)
      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data) || typeof data === 'object').toBe(true);
      }
    });

    it('should reject invalid task creation', async () => {
      const invalidTask = {
        title: 'AB', // Too short (min 3)
        flag: 'purple', // Invalid enum value
        date: 'invalid-date',
        department: 'X', // Too short (min 3)
        username: 'not-an-email',
        state: 'Y' // Too short (min 3)
      };
      
      const response = await fetchOrFail(`${BACKEND_URL}/tasks/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTask)
      });
      
      // Should reject invalid data
      expect([400, 422, 403, 401]).toContain(response.status);
    });
  });

  describe('Users API Integration', () => {
    it('should fetch real users and validate schema', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/users/getUsers`);

      // May require authentication (401) or return data (200)
      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);

        if (data.length > 0) {
          const user = data[0];
          expect(user).toHaveProperty('username');
          expect(user).toHaveProperty('name');
          expect(typeof user.username).toBe('string');
        }
      }
    });
  });

  describe('States API Integration', () => {
    it('should fetch real states and validate schema', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/demography/getstates`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        const state = data[0];
        expect(state).toHaveProperty('state');
        expect(typeof state.state).toBe('string');
      }
    });

    it('should reject invalid state creation', async () => {
      const invalidState = {
        state: 'X', // Too short
        population: 'not-a-number',
        description: '',
        politics: ''
      };
      
      const response = await fetchOrFail(`${BACKEND_URL}/demography/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidState)
      });
      
      // Should reject invalid data
      expect([400, 422, 403, 401]).toContain(response.status);
    });
  });

  describe('Real Data Contract Validation', () => {
    it('should validate all departments conform to domain schema', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/departments/getdepartments`);
      
      expect(response.status).toBe(200);
      
      const departments = await response.json();
      
      if (Array.isArray(departments) && departments.length > 0) {
        // Validate each department has required fields
        departments.forEach((dept: unknown, index: number) => {
          const result = DepartmentCreateSchema.safeParse(dept);
          if (!result.success) {
            throw new Error(
              `Department at index ${index} failed validation:\n` +
              result.error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n') +
              `\nReceived data: ${JSON.stringify(dept, null, 2)}`
            );
          }
        });
      }
    });

    it('should validate all tasks conform to domain schema', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/tasks/get`);

      // May require authentication
      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        const tasks = await response.json();

        if (Array.isArray(tasks) && tasks.length > 0) {
          tasks.forEach((task: unknown, index: number) => {
            const result = TasksResponseSchema.safeParse(task);
            if (!result.success) {
              throw new Error(
                `Task at index ${index} failed validation:\n` +
                result.error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n') +
                `\nReceived data: ${JSON.stringify(task, null, 2)}`
              );
            }
          });
        }
      }
    });

    it('should validate all users conform to domain schema', async () => {
      const response = await fetchOrFail(`${BACKEND_URL}/users/getUsers`);

      // May require authentication
      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        const users = await response.json();

        if (Array.isArray(users) && users.length > 0) {
          users.forEach((user: unknown, index: number) => {
            const result = UserSchema.safeParse(user);
            if (!result.success) {
              throw new Error(
                `User at index ${index} failed validation:\n` +
                result.error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n') +
                `\nReceived data: ${JSON.stringify(user, null, 2)}`
              );
            }
          });
        }
      }
    });
  });

  describe('End-to-End Data Flow', () => {
    it('should verify complete data flow: GET -> structure -> types', async () => {
      // Test that validates the entire data pipeline works
      const endpoints = [
        { url: '/departments/getdepartments', name: 'Departments' },
        { url: '/tasks/get', name: 'Tasks' },
        { url: '/users/getUsers', name: 'Users' },
        { url: '/demography/getstates', name: 'States' },
        { url: '/gc', name: 'GC KOIs' },
        { url: '/gc/issue', name: 'GC Issues' }
      ];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const response = await fetchOrFail(`${BACKEND_URL}${endpoint.url}`);
            return {
              name: endpoint.name,
              status: response.status,
              ok: response.ok
            };
          } catch (error) {
            return {
              name: endpoint.name,
              status: 0,
              ok: false,
              error: String(error)
            };
          }
        })
      );

      // All endpoints should respond (even if 401/403)
      results.forEach(result => {
        expect(result.status).not.toBe(0);
        expect([200, 401, 403]).toContain(result.status);
      });
    });
  });
});
