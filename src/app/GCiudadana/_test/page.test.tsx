import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/utils';
import IssueForm from '../components/IssueForm';
import { mockAuthUser } from '@/__tests__/mocks/handlers';

describe('GCiudadana (Gestión Ciudadana) Page', () => {
  it('should render IssueForm with authorized user', async () => {
    // Render with authorized user (mockAuthUser has departments)
    renderWithProviders(<IssueForm auth={mockAuthUser as any} />, {
      preloadedState: {
        auth: mockAuthUser
      }
    });

    // Expect the form title - use findByText to wait for loading to finish
    expect(await screen.findByText(/Gestion Ciudadana/i)).toBeInTheDocument();
    expect(screen.getByText(/Region Sanitaria X/i)).toBeInTheDocument();

    // Expect inputs
    expect(screen.getByPlaceholderText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/DNI/i)).toBeInTheDocument();
  });

  it('should show unauthorized message for user without departments/admin', async () => {
    const unauthorizedUser = {
      ...mockAuthUser,
      isAdmin: false,
      Departments: []
    };

    renderWithProviders(<IssueForm auth={unauthorizedUser as any} />, {
      preloadedState: {
        auth: unauthorizedUser
      }
    });

    expect(screen.getByText(/Debes ingresar para ver esta pagina/i)).toBeInTheDocument();
  });
});
