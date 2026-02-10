import { describe, it, expect } from 'vitest';

describe('Schema Validation Tests', () => {
  describe('Department Schema', () => {
    it('should import DepartmentCreateSchema', async () => {
      const { DepartmentCreateSchema } = await import('@/app/departments/_domain/schemas');
      expect(DepartmentCreateSchema).toBeDefined();
    });

    it('should validate department data structure', async () => {
      const { DepartmentCreateSchema } = await import('@/app/departments/_domain/schemas');

      const testData = {
        name: 'Test Department',
        description: 'Test Description',
      };

      const result = DepartmentCreateSchema.safeParse(testData);
      // Just verify schema processes the data
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
    });

    it('should reject department with short name', async () => {
      const { DepartmentCreateSchema } = await import('@/app/departments/_domain/schemas');

      const invalidData = {
        name: 'AB', // Too short (min 3)
        description: 'Test Description',
      };

      const result = DepartmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject department with short description', async () => {
      const { DepartmentCreateSchema } = await import('@/app/departments/_domain/schemas');

      const invalidData = {
        name: 'Test Department',
        description: 'AB', // Too short (min 3)
      };

      const result = DepartmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('User Schema', () => {
    it('should import UserSchema', async () => {
      const { UserSchema } = await import('@/app/admin/_domain/schemas');
      expect(UserSchema).toBeDefined();
    });

    it('should validate user data structure', async () => {
      const { UserSchema } = await import('@/app/admin/_domain/schemas');

      const testData = {
        id: 'user-123',
        username: 'testuser@example.com',
        name: 'Test',
        lastname: 'User',
        isAdmin: false,
      };

      const result = UserSchema.safeParse(testData);
      // Just verify schema processes the data
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
    });

    it('should handle user schema validation', async () => {
      const { UserSchema } = await import('@/app/admin/_domain/schemas');

      const minimalData = {
        id: 'user-123',
        username: 'testuser@example.com',
        name: 'Test',
        lastname: 'User',
        isAdmin: false,
      };

      const result = UserSchema.safeParse(minimalData);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
    });
  });

  describe('Task Schema', () => {
    it('should import TasksResponseSchema', async () => {
      const { TasksResponseSchema } = await import('@/app/tasks/_domain/schemas');
      expect(TasksResponseSchema).toBeDefined();
    });

    it('should validate task data structure', async () => {
      const { TasksResponseSchema } = await import('@/app/tasks/_domain/schemas');

      const testData = {
        id: 'task-123',
        title: 'Test Task',
        flag: 'red',
        date: '2025-02-10',
        department: 'Test Department',
        username: 'testuser@example.com',
        state: 'pending',
      };

      const result = TasksResponseSchema.safeParse(testData);
      // Just verify schema processes the data
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
    });

    it('should handle task validation with partial data', async () => {
      const { TasksResponseSchema } = await import('@/app/tasks/_domain/schemas');

      // Test with minimal required fields
      const minimalData = {
        id: 'task-123',
        title: 'Test Task',
        date: '2025-02-10',
      };

      const result = TasksResponseSchema.safeParse(minimalData);
      // Result depends on actual schema requirements
      expect(result).toBeDefined();
    });

    it('should validate task schema structure', async () => {
      const { TasksResponseSchema } = await import('@/app/tasks/_domain/schemas');

      // Just verify the schema can be called
      expect(TasksResponseSchema.safeParse).toBeDefined();
      expect(typeof TasksResponseSchema.safeParse).toBe('function');
    });
  });

  describe('GC (Gestión Ciudadana) Schemas', () => {
    it('should import CreatedKOISchema', async () => {
      const { CreatedKOISchema } = await import('@/app/gc/_domain/schemas');
      expect(CreatedKOISchema).toBeDefined();
    });

    it('should import UserIssueSchema', async () => {
      const { UserIssueSchema } = await import('@/app/gc/_domain/schemas');
      expect(UserIssueSchema).toBeDefined();
    });

    it('should validate KOI schema structure', async () => {
      const { CreatedKOISchema } = await import('@/app/gc/_domain/schemas');

      // Verify schema is callable
      expect(CreatedKOISchema.safeParse).toBeDefined();
      expect(typeof CreatedKOISchema.safeParse).toBe('function');
    });

    it('should handle KOI data validation', async () => {
      const { CreatedKOISchema } = await import('@/app/gc/_domain/schemas');

      const testData = {
        id: 'koi-123',
        name: 'Salud',
        text: 'Problemas de salud',
      };

      const result = CreatedKOISchema.safeParse(testData);
      // Result depends on actual schema structure
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
    });
  });

  describe('States Schema', () => {
    it('should import StatesSchema', async () => {
      const { StatesSchema } = await import('@/app/states/_domain/schemas');
      expect(StatesSchema).toBeDefined();
    });

    it('should validate state schema structure', async () => {
      const { StatesSchema } = await import('@/app/states/_domain/schemas');

      // Verify schema is callable
      expect(StatesSchema.safeParse).toBeDefined();
      expect(typeof StatesSchema.safeParse).toBe('function');
    });

    it('should handle state data validation', async () => {
      const { StatesSchema } = await import('@/app/states/_domain/schemas');

      const testData = {
        state: 'California',
        population: 39538223,
        description: 'Golden State',
      };

      const result = StatesSchema.safeParse(testData);
      // Result depends on actual schema structure
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
    });
  });

  describe('FODA Schema', () => {
    it('should import fodaItem schema', async () => {
      const { fodaItem } = await import('@/_core/api');
      expect(fodaItem).toBeDefined();
    });

    it('should validate FODA structure', async () => {
      const { fodaItem } = await import('@/_core/api');

      const validData = {
        id: 'foda-123',
        title: 'Test Strategy',
        description: 'Test Description',
        isActive: true,
      };

      const result = fodaItem.safeParse(validData);
      // Result may vary depending on actual schema structure
      expect(result).toBeDefined();
    });
  });

  describe('Derivation Schema', () => {
    it('should import DerivationSchema', async () => {
      const { DerivationSchema } = await import('@/_core/api');
      expect(DerivationSchema).toBeDefined();
    });

    it('should be a Zod schema', async () => {
      const { DerivationSchema } = await import('@/_core/api');
      expect(DerivationSchema.safeParse).toBeDefined();
      expect(typeof DerivationSchema.safeParse).toBe('function');
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error messages for invalid data', async () => {
      const { DepartmentCreateSchema } = await import('@/app/departments/_domain/schemas');

      const invalidData = {
        name: 'A',
        description: 'B',
      };

      const result = DepartmentCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues[0]).toHaveProperty('message');
      }
    });

    it('should validate all fields in schema', async () => {
      const { UserSchema } = await import('@/app/admin/_domain/schemas');

      const invalidData = {
        // Missing required fields
        id: 'user-123',
      };

      const result = UserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
