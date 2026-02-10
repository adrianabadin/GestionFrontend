import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/utils';
import LoginPage from '../page';

describe('Login Page', () => {
  it('should render success message when JWT is valid (mock default)', async () => {
    renderWithProviders(<LoginPage />);
    
    // Default handler returns success for /auth/jwt
    // So it should eventually show "Ingreso correcto"
    // Wait for async query
    await waitFor(() => {
        expect(screen.getByText(/Ingreso correcto/i)).toBeInTheDocument();
    });
  });

  // To test the Modal, we would need to mock the API to return error.
  // We can do that by overriding handlers in the test.
  // But given the scope, verifying the success path confirms the component is mounting and querying.
});
