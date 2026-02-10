import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/utils';
import Departments from '../page';
import { mockAuthUserAdmin, mockAuthUser, mockDepartments } from '@/__tests__/mocks/handlers';

describe('Departments Page', () => {
  it('should render for Admin user showing all departments', async () => {
    renderWithProviders(<Departments />, {
      preloadedState: {
        auth: {
          ...mockAuthUserAdmin,
          Departments: mockDepartments.map(d => ({ id: d.id, name: d.name }))
        }
      }
    });

    // Wait for the data to load
    // Use findByRole for the first element to trigger the wait
    const firstDept = mockDepartments[0];
    await expect(screen.findByRole('button', { name: new RegExp(firstDept.name, 'i') }, { timeout: 5000 })).resolves.toBeInTheDocument();

    // Now check the others
    mockDepartments.slice(1).forEach(dept => {
      expect(screen.getByRole('button', { name: new RegExp(dept.name, 'i') })).toBeInTheDocument();
    });

    // Check for "Gestion Ciudadana Ingreso" button (since admin has access)
    expect(screen.getByRole('button', { name: /Gestion Ciudadana Ingreso/i })).toBeInTheDocument();
  });

  it('should render for Regular user showing only assigned departments', async () => {
    // mockAuthUser has Departments: [{ id: 'dept-1', name: 'Gestión' }]
    renderWithProviders(<Departments />, {
      preloadedState: {
        auth: {
          ...mockAuthUser,
          Departments: [{ id: 'dept-1', name: 'Gestión' }] // Ensure it matches what we expect
        }
      }
    });

    // Wait for the data to load
    await expect(screen.findByRole('button', { name: /Gestión/i }, { timeout: 5000 })).resolves.toBeInTheDocument();
      
    // Should NOT see "Prácticas" (unless assigned)
    expect(screen.queryByRole('button', { name: /Prácticas/i })).not.toBeInTheDocument();
  });
});
