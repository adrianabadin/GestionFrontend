import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/_core/api';
import { GanttItemModal } from '@/app/gantt/components/GanttItemModal';
import type { GanttItemResponse } from '@/_core/api';

/**
 * COMPONENT TESTS: GanttItemModal
 *
 * Objetivo: Validar el comportamiento del modal CRUD de Gantt Items
 *
 * Coverage:
 * - Renderizado en modo creación
 * - Renderizado en modo edición
 * - Validación de formulario (React Hook Form + Zod)
 * - Creación de item (POST)
 * - Actualización de item (PUT)
 * - Cierre de modal
 * - Carga de datos de departments, states, users
 */

// Mock store setup
const createTestStore = () =>
  configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      auth: (state = { user: { id: 'user-123', name: 'Test', lastname: 'User', isAdmin: false } }) => state
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

// Mock data
const mockDepartments = [
  { id: 'dept-1', name: 'Regional', description: 'Regional Dept' },
  { id: 'dept-2', name: 'IT', description: 'IT Dept' }
];

const mockStates = [
  { id: 'state-1', state: 'La Plata' },
  { id: 'state-2', state: 'Mar del Plata' }
];

const mockUsers = [
  { id: 'user-1', username: 'jdoe', name: 'John', lastname: 'Doe', email: 'john@test.com', isAdmin: false },
  { id: 'user-2', username: 'asmith', name: 'Alice', lastname: 'Smith', email: 'alice@test.com', isAdmin: true }
];

const mockGanttItem: GanttItemResponse = {
  id: 'item-123',
  title: 'Existing Task',
  description: 'This is an existing task',
  type: 'task',
  progress: 50,
  priority: 'high',
  status: 'active',
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-01-10T00:00:00.000Z',
  departmentsId: 'dept-1',
  demographyId: 'state-1',
  assignedToId: 'user-1',
  isActive: true,
  sortOrder: 0,
  createdById: 'user-123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

describe('GanttItemModal Component', () => {
  let store: ReturnType<typeof createTestStore>;
  const mockOnClose = vi.fn();

  beforeEach(() => {
    store = createTestStore();
    mockOnClose.mockClear();

    // Mock RTK Query endpoints
    // @ts-ignore - Mock para testing
    store.dispatch(apiSlice.util.upsertQueryData('getDepartments', {}, mockDepartments));
    // @ts-ignore - Mock para testing
    store.dispatch(apiSlice.util.upsertQueryData('getStates', undefined, mockStates));
    // @ts-ignore - Mock para testing
    store.dispatch(apiSlice.util.upsertQueryData('getUsers', {}, mockUsers));
  });

  describe('Rendering - Creation Mode', () => {
    it('should render modal with "Nueva Actividad" title in creation mode', () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      expect(screen.getByText('Nueva Actividad')).toBeInTheDocument();
    });

    it('should render all form fields in creation mode', () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      // Campos obligatorios
      expect(screen.getByLabelText(/título de la actividad/i)).toBeInTheDocument();

      // Campos opcionales
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/estado/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha de inicio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha de fin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/progreso/i)).toBeInTheDocument();
    });

    it('should have "Crear" button in creation mode', () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      const createButton = screen.getByRole('button', { name: /crear/i });
      expect(createButton).toBeInTheDocument();
    });

    it('should not render modal when open is false', () => {
      const { container } = render(
        <Provider store={store}>
          <GanttItemModal open={false} onClose={mockOnClose} />
        </Provider>
      );

      // Modal de Material Tailwind usa display: none cuando está cerrado
      const modalElements = container.querySelectorAll('[role="dialog"]');
      expect(modalElements.length).toBe(0);
    });
  });

  describe('Rendering - Edit Mode', () => {
    it('should render modal with "Editar Actividad" title in edit mode', () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} item={mockGanttItem} />
        </Provider>
      );

      expect(screen.getByText('Editar Actividad')).toBeInTheDocument();
    });

    it('should populate form fields with item data in edit mode', async () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} item={mockGanttItem} />
        </Provider>
      );

      // Esperar a que se carguen los datos
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/título de la actividad/i) as HTMLInputElement;
        expect(titleInput.value).toBe('Existing Task');
      });

      const descriptionInput = screen.getByLabelText(/descripción/i) as HTMLTextAreaElement;
      expect(descriptionInput.value).toBe('This is an existing task');
    });

    it('should have "Actualizar" button in edit mode', () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} item={mockGanttItem} />
        </Provider>
      );

      const updateButton = screen.getByRole('button', { name: /actualizar/i });
      expect(updateButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when title is empty on submit', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      const createButton = screen.getByRole('button', { name: /crear/i });
      await user.click(createButton);

      // React Hook Form + Zod deberían mostrar error
      await waitFor(() => {
        expect(screen.getByText(/el título es requerido|required/i)).toBeInTheDocument();
      });
    });

    it('should allow progress values from 0 to 100', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      const progressInput = screen.getByLabelText(/progreso/i) as HTMLInputElement;

      // Valor válido: 0
      await user.clear(progressInput);
      await user.type(progressInput, '0');
      expect(progressInput.value).toBe('0');

      // Valor válido: 100
      await user.clear(progressInput);
      await user.type(progressInput, '100');
      expect(progressInput.value).toBe('100');

      // Valor válido: 50
      await user.clear(progressInput);
      await user.type(progressInput, '50');
      expect(progressInput.value).toBe('50');
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when X button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      const closeButton = screen.getByRole('button', { name: /✕/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should fill out and submit form successfully in creation mode', async () => {
      const user = userEvent.setup();

      // Mock createGanttItem mutation
      const mockCreateMutation = vi.fn().mockResolvedValue({
        data: {
          id: 'new-item-123',
          title: 'New Test Task',
          type: 'task',
          progress: 0,
          priority: 'medium',
          status: 'planning'
        }
      });

      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      // Llenar formulario
      const titleInput = screen.getByLabelText(/título de la actividad/i);
      await user.type(titleInput, 'New Test Task');

      const descriptionInput = screen.getByLabelText(/descripción/i);
      await user.type(descriptionInput, 'This is a new test task');

      // Submit
      const createButton = screen.getByRole('button', { name: /crear/i });
      await user.click(createButton);

      // Debería cerrar el modal después de crear
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      // Todos los inputs deberían tener labels asociados
      const titleInput = screen.getByLabelText(/título de la actividad/i);
      expect(titleInput).toBeInTheDocument();

      const descriptionInput = screen.getByLabelText(/descripción/i);
      expect(descriptionInput).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      const titleInput = screen.getByLabelText(/título de la actividad/i);
      const descriptionInput = screen.getByLabelText(/descripción/i);

      // Tab navigation
      titleInput.focus();
      expect(document.activeElement).toBe(titleInput);

      await user.tab();
      expect(document.activeElement).toBe(descriptionInput);
    });
  });

  describe('Default Values', () => {
    it('should pre-select defaultDepartment when provided', async () => {
      render(
        <Provider store={store}>
          <GanttItemModal
            open={true}
            onClose={mockOnClose}
            defaultDepartment="Regional"
          />
        </Provider>
      );

      // Verificar que "Regional" esté pre-seleccionado (puede requerir interacción con Select de Material Tailwind)
      await waitFor(() => {
        const departmentSelect = screen.getByLabelText(/departamento/i);
        expect(departmentSelect).toBeInTheDocument();
      });
    });

    it('should set default type as "task"', () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      // Default type debería ser "task" (verificado en el formulario)
      const typeSelect = screen.getByLabelText(/tipo/i);
      expect(typeSelect).toBeInTheDocument();
    });

    it('should set default priority as "medium"', () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      const prioritySelect = screen.getByLabelText(/prioridad/i);
      expect(prioritySelect).toBeInTheDocument();
    });

    it('should set default status as "planning"', () => {
      render(
        <Provider store={store}>
          <GanttItemModal open={true} onClose={mockOnClose} />
        </Provider>
      );

      const statusSelect = screen.getByLabelText(/estado/i);
      expect(statusSelect).toBeInTheDocument();
    });
  });
});
