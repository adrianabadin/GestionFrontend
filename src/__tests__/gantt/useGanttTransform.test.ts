import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGanttTransform } from '@/app/gantt/_application/hooks/useGanttTransform';
import type { GanttItemResponse } from '@/_core/api';

/**
 * UNIT TESTS: useGanttTransform Hook
 *
 * Objetivo: Validar la transformación de datos del backend al formato dhtmlx-gantt
 *
 * Coverage:
 * - Transformación de items vacíos
 * - Transformación de items con datos completos
 * - Cálculo correcto de duración
 * - Conversión de progress (0-100 → 0-1)
 * - Transformación de dependencies/links
 * - Manejo de campos opcionales (parentId, assignedTo, color)
 * - Mapeo de tipos de dependencies (endToStart, startToStart, etc.)
 */

describe('useGanttTransform Hook', () => {
  describe('Empty State Handling', () => {
    it('should return empty arrays when no items provided', () => {
      const { result } = renderHook(() => useGanttTransform(undefined, undefined));

      expect(result.current).toEqual({
        data: [],
        links: []
      });
    });

    it('should return empty arrays when items array is empty', () => {
      const { result } = renderHook(() => useGanttTransform([], []));

      expect(result.current).toEqual({
        data: [],
        links: []
      });
    });
  });

  describe('Item Transformation', () => {
    it('should transform single item correctly', () => {
      const mockItem: GanttItemResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        description: 'Test description',
        type: 'task',
        progress: 50, // Backend usa 0-100
        priority: 'medium',
        status: 'active',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-10T00:00:00.000Z',
        isActive: true,
        sortOrder: 0,
        createdById: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const { result } = renderHook(() => useGanttTransform([mockItem], []));

      expect(result.current.data).toHaveLength(1);

      const transformedItem = result.current.data[0];
      expect(transformedItem.id).toBe(mockItem.id);
      expect(transformedItem.text).toBe(mockItem.title);
      expect(transformedItem.progress).toBe(0.5); // 50% → 0.5 (dhtmlx usa 0-1)
      expect(transformedItem.type).toBe('task');
      expect(transformedItem.start_date).toBeInstanceOf(Date);
      expect(transformedItem.end_date).toBeInstanceOf(Date);
      expect(transformedItem.duration).toBe(9); // 10 días de diferencia
    });

    it('should calculate duration correctly for same-day tasks', () => {
      const mockItem: GanttItemResponse = {
        id: '123',
        title: 'Same Day Task',
        type: 'task',
        progress: 0,
        priority: 'medium',
        status: 'active',
        startDate: '2024-01-01T08:00:00.000Z',
        endDate: '2024-01-01T17:00:00.000Z',
        isActive: true,
        sortOrder: 0,
        createdById: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const { result } = renderHook(() => useGanttTransform([mockItem], []));

      // Mismo día debería resultar en duration: 1 (mínimo)
      expect(result.current.data[0].duration).toBe(1);
    });

    it('should handle items with parent relationship', () => {
      const parentItem: GanttItemResponse = {
        id: 'parent-123',
        title: 'Parent Task',
        type: 'summary',
        progress: 25,
        priority: 'high',
        status: 'active',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T00:00:00.000Z',
        isActive: true,
        sortOrder: 0,
        createdById: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const childItem: GanttItemResponse = {
        id: 'child-456',
        title: 'Child Task',
        type: 'task',
        progress: 100,
        priority: 'medium',
        status: 'completed',
        startDate: '2024-01-05T00:00:00.000Z',
        endDate: '2024-01-10T00:00:00.000Z',
        parentId: 'parent-123', // Relación padre-hijo
        isActive: true,
        sortOrder: 1,
        createdById: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const { result } = renderHook(() =>
        useGanttTransform([parentItem, childItem], [])
      );

      expect(result.current.data).toHaveLength(2);

      const parent = result.current.data.find(item => item.id === 'parent-123');
      const child = result.current.data.find(item => item.id === 'child-456');

      expect(parent?.parent).toBeUndefined(); // Parent no tiene padre
      expect(child?.parent).toBe('parent-123'); // Child apunta al parent
    });

    it('should handle items with assigned user', () => {
      const mockItem: GanttItemResponse = {
        id: '123',
        title: 'Assigned Task',
        type: 'task',
        progress: 0,
        priority: 'medium',
        status: 'active',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-10T00:00:00.000Z',
        assignedToId: 'user-456',
        AssignedTo: {
          id: 'user-456',
          username: 'jdoe',
          name: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          isAdmin: false,
          departments: []
        },
        isActive: true,
        sortOrder: 0,
        createdById: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const { result } = renderHook(() => useGanttTransform([mockItem], []));

      expect(result.current.data[0].assignedTo).toBe('John Doe');
      expect(result.current.data[0].assignedToId).toBe('user-456');
    });

    it('should handle items without assigned user', () => {
      const mockItem: GanttItemResponse = {
        id: '123',
        title: 'Unassigned Task',
        type: 'task',
        progress: 0,
        priority: 'medium',
        status: 'active',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-10T00:00:00.000Z',
        isActive: true,
        sortOrder: 0,
        createdById: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const { result } = renderHook(() => useGanttTransform([mockItem], []));

      expect(result.current.data[0].assignedTo).toBe('Sin asignar');
      expect(result.current.data[0].assignedToId).toBeUndefined();
    });

    it('should apply custom color if provided', () => {
      const mockItem: GanttItemResponse = {
        id: '123',
        title: 'Custom Color Task',
        type: 'task',
        progress: 0,
        priority: 'high',
        status: 'active',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-10T00:00:00.000Z',
        color: '#FF5733', // Color personalizado
        isActive: true,
        sortOrder: 0,
        createdById: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const { result } = renderHook(() => useGanttTransform([mockItem], []));

      expect(result.current.data[0].color).toBe('#FF5733');
    });
  });

  describe('Dependencies/Links Transformation', () => {
    it('should transform dependencies correctly', () => {
      const mockItems: GanttItemResponse[] = [
        {
          id: 'task-1',
          title: 'First Task',
          type: 'task',
          progress: 100,
          priority: 'medium',
          status: 'completed',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-05T00:00:00.000Z',
          isActive: true,
          sortOrder: 0,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'task-2',
          title: 'Second Task',
          type: 'task',
          progress: 0,
          priority: 'medium',
          status: 'active',
          startDate: '2024-01-06T00:00:00.000Z',
          endDate: '2024-01-10T00:00:00.000Z',
          isActive: true,
          sortOrder: 1,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      const mockDependencies = [
        {
          id: 'dep-1',
          sourceItemId: 'task-1',
          targetItemId: 'task-2',
          type: 'endToStart'
        }
      ];

      const { result } = renderHook(() =>
        useGanttTransform(mockItems, mockDependencies)
      );

      expect(result.current.links).toHaveLength(1);

      const link = result.current.links[0];
      expect(link.id).toBe('dep-1');
      expect(link.source).toBe('task-1');
      expect(link.target).toBe('task-2');
      expect(link.type).toBe('0'); // endToStart → "0" (dhtmlx format)
    });

    it('should map all dependency types correctly', () => {
      const mockItems: GanttItemResponse[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          type: 'task',
          progress: 0,
          priority: 'medium',
          status: 'active',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-05T00:00:00.000Z',
          isActive: true,
          sortOrder: 0,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'task-2',
          title: 'Task 2',
          type: 'task',
          progress: 0,
          priority: 'medium',
          status: 'active',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-05T00:00:00.000Z',
          isActive: true,
          sortOrder: 1,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      const mockDependencies = [
        { id: 'dep-1', sourceItemId: 'task-1', targetItemId: 'task-2', type: 'endToStart' },
        { id: 'dep-2', sourceItemId: 'task-1', targetItemId: 'task-2', type: 'startToStart' },
        { id: 'dep-3', sourceItemId: 'task-1', targetItemId: 'task-2', type: 'endToEnd' },
        { id: 'dep-4', sourceItemId: 'task-1', targetItemId: 'task-2', type: 'startToEnd' }
      ];

      const { result } = renderHook(() =>
        useGanttTransform(mockItems, mockDependencies)
      );

      expect(result.current.links).toHaveLength(4);

      // Verificar mapeo correcto
      expect(result.current.links[0].type).toBe('0'); // endToStart
      expect(result.current.links[1].type).toBe('1'); // startToStart
      expect(result.current.links[2].type).toBe('2'); // endToEnd
      expect(result.current.links[3].type).toBe('3'); // startToEnd
    });

    it('should default to endToStart for unknown dependency types', () => {
      const mockItems: GanttItemResponse[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          type: 'task',
          progress: 0,
          priority: 'medium',
          status: 'active',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-05T00:00:00.000Z',
          isActive: true,
          sortOrder: 0,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      const mockDependencies = [
        { id: 'dep-1', sourceItemId: 'task-1', targetItemId: 'task-1', type: 'unknownType' as any }
      ];

      const { result } = renderHook(() =>
        useGanttTransform(mockItems, mockDependencies)
      );

      expect(result.current.links[0].type).toBe('0'); // Default: endToStart
    });
  });

  describe('Memoization', () => {
    it('should memoize result when items and dependencies do not change', () => {
      const mockItems: GanttItemResponse[] = [
        {
          id: '123',
          title: 'Test Task',
          type: 'task',
          progress: 0,
          priority: 'medium',
          status: 'active',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-10T00:00:00.000Z',
          isActive: true,
          sortOrder: 0,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      const { result, rerender } = renderHook(
        ({ items, deps }) => useGanttTransform(items, deps),
        { initialProps: { items: mockItems, deps: [] } }
      );

      const firstResult = result.current;

      // Re-render con las mismas props
      rerender({ items: mockItems, deps: [] });

      // Debería retornar la misma referencia (memoized)
      expect(result.current).toBe(firstResult);
    });

    it('should recompute when items change', () => {
      const mockItems1: GanttItemResponse[] = [
        {
          id: '123',
          title: 'Test Task 1',
          type: 'task',
          progress: 0,
          priority: 'medium',
          status: 'active',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-10T00:00:00.000Z',
          isActive: true,
          sortOrder: 0,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      const mockItems2: GanttItemResponse[] = [
        {
          id: '456',
          title: 'Test Task 2',
          type: 'task',
          progress: 50,
          priority: 'high',
          status: 'active',
          startDate: '2024-01-05T00:00:00.000Z',
          endDate: '2024-01-15T00:00:00.000Z',
          isActive: true,
          sortOrder: 0,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      const { result, rerender } = renderHook(
        ({ items, deps }) => useGanttTransform(items, deps),
        { initialProps: { items: mockItems1, deps: [] } }
      );

      const firstResult = result.current;

      // Re-render con items diferentes
      rerender({ items: mockItems2, deps: [] });

      // Debería retornar una nueva referencia (recomputado)
      expect(result.current).not.toBe(firstResult);
      expect(result.current.data[0].id).toBe('456');
    });
  });

  describe('Edge Cases', () => {
    it('should handle items without dates gracefully', () => {
      const mockItem: GanttItemResponse = {
        id: '123',
        title: 'No Dates Task',
        type: 'task',
        progress: 0,
        priority: 'medium',
        status: 'planning',
        // startDate y endDate omitidos
        isActive: true,
        sortOrder: 0,
        createdById: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      const { result } = renderHook(() => useGanttTransform([mockItem], []));

      // Debería usar new Date() como fallback
      expect(result.current.data[0].start_date).toBeInstanceOf(Date);
      expect(result.current.data[0].end_date).toBeInstanceOf(Date);
      expect(result.current.data[0].duration).toBeGreaterThanOrEqual(1);
    });

    it('should handle progress edge values correctly', () => {
      const mockItems: GanttItemResponse[] = [
        {
          id: '1',
          title: 'Zero Progress',
          type: 'task',
          progress: 0, // Mínimo
          priority: 'medium',
          status: 'active',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-10T00:00:00.000Z',
          isActive: true,
          sortOrder: 0,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '2',
          title: 'Full Progress',
          type: 'task',
          progress: 100, // Máximo
          priority: 'medium',
          status: 'completed',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-10T00:00:00.000Z',
          isActive: true,
          sortOrder: 1,
          createdById: 'user-123',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      const { result } = renderHook(() => useGanttTransform(mockItems, []));

      expect(result.current.data[0].progress).toBe(0); // 0% → 0
      expect(result.current.data[1].progress).toBe(1); // 100% → 1
    });
  });
});
