import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Check if we're running integration tests
const isIntegrationTest = process.env.SKIP_INTEGRATION === 'false';

// Enable API mocking before all tests (only for unit tests, not integration tests)
beforeAll(() => {
  if (!isIntegrationTest) {
    server.listen({ onUnhandledRequest: 'error' });
  }
});

// Reset any request handlers after each test (only for unit tests)
afterEach(() => {
  if (!isIntegrationTest) {
    server.resetHandlers();
  }
});

// Clean up after all tests (only for unit tests)
afterAll(() => {
  if (!isIntegrationTest) {
    server.close();
  }
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));
