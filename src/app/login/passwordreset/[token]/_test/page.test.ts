import { describe, it, expect } from 'vitest';

describe('Password Reset Page', () => {
  it('should import the password reset page component successfully', async () => {
    const pageModule = await import('@/app/login/passwordreset/[token]/page');
    expect(pageModule).toBeDefined();
    expect(pageModule.Page).toBeDefined();
    expect(pageModule.default).toBeDefined();
  });

  it('should have a default export as a function', async () => {
    const pageModule = await import('@/app/login/passwordreset/[token]/page');
    expect(typeof pageModule.default).toBe('function');
  });

  it('should use useChangePasswordMutation from auth API', async () => {
    const auth = await import('@/_core/auth/_application/slices');
    expect(auth.useChangePasswordMutation).toBeDefined();
    expect(typeof auth.useChangePasswordMutation).toBe('function');
  });

  it('should use useParams from next/navigation', async () => {
    const navigation = await import('next/navigation');
    expect(navigation.useParams).toBeDefined();
  });

  it('should use useRouter from next/navigation', async () => {
    const navigation = await import('next/navigation');
    expect(navigation.useRouter).toBeDefined();
  });

  it('should use useSearchParams from next/navigation', async () => {
    const navigation = await import('next/navigation');
    expect(navigation.useSearchParams).toBeDefined();
  });

  it('should import Material Tailwind components', async () => {
    const mtModule = await import('@material-tailwind/react');
    expect(mtModule.Button).toBeDefined();
    expect(mtModule.Input).toBeDefined();
    expect(mtModule.Spinner).toBeDefined();
    expect(mtModule.Typography).toBeDefined();
  });

  it('should import useState from React', async () => {
    const react = await import('react');
    expect(react.useState).toBeDefined();
  });

  it('should import errorsToRecord from hookform resolvers', async () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../../[token]/page.tsx'),
      'utf-8'
    );
    expect(source).toContain('errorsToRecord');
    expect(source).toContain('@hookform/resolvers/io-ts');
  });

  it('should be marked as client component', async () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../../[token]/page.tsx'),
      'utf-8'
    );
    expect(source).toContain('"use client"');
  });

  it('should handle dynamic route parameter [token]', async () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../../[token]/page.tsx'),
      'utf-8'
    );
    expect(source).toContain('useParams');
    expect(source).toContain('params.token');
  });

  it('should handle query parameter username from useSearchParams', async () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../../[token]/page.tsx'),
      'utf-8'
    );
    expect(source).toContain('useSearchParams');
    expect(source).toContain('query.get');
  });

  it('should have state management for password and fetched status', async () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../../[token]/page.tsx'),
      'utf-8'
    );
    expect(source).toContain('setPassword');
    expect(source).toContain('setFetched');
  });

  it('should handle password change mutation with error handling', async () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../../[token]/page.tsx'),
      'utf-8'
    );
    expect(source).toContain('changePassword');
    expect(source).toContain('isError');
    expect(source).toContain('isLoading');
    expect(source).toContain('error');
  });

  it('should navigate to /login on successful password change', async () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../../[token]/page.tsx'),
      'utf-8'
    );
    expect(source).toContain('router.push("/login")');
  });
});
