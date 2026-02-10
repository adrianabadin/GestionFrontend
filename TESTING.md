# Testing Strategy - MPF.AI

## Overview

This project uses a **hybrid testing approach** with both **mocked tests** and **integration tests with real backend data**.

### Testing Types

1. **Unit Tests with Mocks** (Default) - Fast, isolated, no backend required
2. **Integration Tests** (Optional) - Tests real backend API calls

---

## Unit Tests with Mocks (MSW)

### What are Mock Service Worker (MSW)?

MSW intercepts HTTP requests and returns mock data without hitting the real backend. This allows tests to:
- ✅ Run fast (no network latency)
- ✅ Run offline (no backend required)
- ✅ Test edge cases (mock error responses)
- ✅ Remain deterministic (same response every time)

### Running Mocked Tests

```bash
# Run all tests (mocked by default)
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Run specific test file
npm test -- src/__tests__/api.mocked.test.ts
```

### Mock Data Available

Located in `src/__tests__/mocks/handlers.ts`:

```typescript
mockDepartments        // 3 departments (Gestión, Prácticas, Crónicos)
mockAuthUser          // Regular user
mockAuthUserAdmin     // Admin user
mockKOIs              // Kind of Issues (Salud, Educación)
mockIssues            // 2 sample issues (pending, working)
mockTasks             // 1 sample task
mockFoda              // FODA structure
mockUsers             // 2 users (admin + regular)
mockStates            // 1 sample state
```

### How MSW Works

1. **Setup** - MSW server is initialized in `src/__tests__/setup.ts`
2. **Intercept** - HTTP requests are intercepted before leaving the browser/test environment
3. **Respond** - Mock handlers in `src/__tests__/mocks/handlers.ts` return mock data
4. **Cleanup** - Handlers reset after each test

### File Structure

```
src/__tests__/
├── setup.ts                      # Vitest + MSW setup
├── mocks/
│   ├── handlers.ts              # MSW request handlers & mock data
│   └── server.ts                # MSW server configuration
├── api.mocked.test.ts           # Tests with mocked data
└── api.integration.test.ts       # Tests with real backend
```

---

## Integration Tests (Real Backend)

### When to Use Integration Tests

Use when you need to verify **actual backend behavior**:
- Test with real database data
- Verify API response structure changes
- Test authentication with real JWT tokens
- Test with actual department hierarchies

### Running Integration Tests

```bash
# Start backend first
# Backend must be running at http://localhost:8080

# Run integration tests
npm run test:integration

# Integration tests are SKIPPED by default
# They only run when backend is available
```

### Backend Requirements

Integration tests require:
- ✅ Backend running at `http://localhost:8080` (from `.env`)
- ✅ Populated database with test data
- ✅ Authentication system working (JWT cookies)

### Example Output

**With Backend Running:**
```
✓ API Integration Tests with Real Backend
  ✓ Backend at http://localhost:8080
    ✓ should verify backend is accessible
  ✓ Departments API Integration
    ✓ should fetch real departments from backend
  ✓ Auth API Integration
    ✓ should get JWT auth status from backend
  ...
```

**Without Backend Running:**
```
[Integration tests skip gracefully with warnings]
✓ Integration test skipped - backend not available
```

---

## Comparison: Mocks vs Real Data

| Feature | Mocked Tests | Integration Tests |
|---------|------------|-------------------|
| **Speed** | ⚡ Fast (~2s) | 🐢 Slower (5-30s) |
| **Backend Required** | ❌ No | ✅ Yes |
| **Network** | ❌ No | ✅ Yes |
| **Deterministic** | ✅ Always same | ⚠️ Can vary |
| **Edge Cases** | ✅ Easy to test | ❌ Hard to mock |
| **Real Data** | ❌ Fake | ✅ Real |
| **CI/CD Friendly** | ✅ Yes | ⚠️ Requires backend |
| **Development** | ✅ Recommended | ⚠️ Optional |

**Recommendation:**
- **Development & CI/CD**: Use mocked tests (default)
- **Pre-release**: Run both mocked + integration tests

---

## Working with Mocks

### Add a New Endpoint Mock

1. **Update `src/__tests__/mocks/handlers.ts`:**

```typescript
// 1. Add mock data
export const mockNewFeature = {
  id: 'feature-1',
  name: 'Feature Name',
  // ... other properties
};

// 2. Add HTTP handler
export const handlers = [
  // ... existing handlers ...

  // NEW HANDLER:
  http.get(`${BACKEND_URL}/newfeature`, () => {
    return HttpResponse.json(mockNewFeature);
  }),
];
```

2. **Create test file:**

```typescript
// src/__tests__/api.newfeature.test.ts
import { describe, it, expect } from 'vitest';
import { mockNewFeature } from './mocks/handlers';

describe('New Feature API with Mocks', () => {
  it('should have valid mock data', () => {
    expect(mockNewFeature).toHaveProperty('id');
    expect(mockNewFeature).toHaveProperty('name');
  });

  it('should have API hook', async () => {
    const api = await import('@/_core/api');
    expect(api.useGetNewFeatureQuery).toBeDefined();
  });
});
```

### Simulate API Errors

You can modify mock handlers to test error scenarios:

```typescript
// In src/__tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const errorHandlers = [
  http.get(`${BACKEND_URL}/departments/getdepartments`, () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),
];

// In tests, override default handlers:
import { server } from './mocks/server';
import { errorHandlers } from './mocks/handlers';

beforeEach(() => {
  server.use(...errorHandlers);
});
```

---

## Test Organization

### Current Test Files

- `src/__tests__/api-imports.test.ts` - Validates API exports ✅
- `src/__tests__/api.mocked.test.ts` - Tests with mock data ✅ NEW
- `src/__tests__/api.integration.test.ts` - Real backend tests ✅ NEW
- `src/__tests__/config-components.test.ts` - Component config ✅
- `src/app/*/\_test/page.test.ts` - Feature-specific tests ✅

### Test File Naming

- `*.test.ts` - Unit/integration tests
- `*.mocked.test.ts` - Tests using MSW mocks
- `*.integration.test.ts` - Tests with real backend

---

## Best Practices

### ✅ Do

- Use mocked tests for development (fast feedback)
- Use integration tests before releasing (verify real API)
- Keep mock data realistic (match real API responses)
- Test both success and error cases
- Add tests when fixing bugs (prevent regression)

### ❌ Don't

- Make real HTTP calls in unit tests (use mocks)
- Mock everything indiscriminately (test behavior, not implementation)
- Ignore integration test failures (they indicate real issues)
- Hard-code URLs (use environment variables)
- Skip type validation (use TypeScript strict mode)

---

## Troubleshooting

### "Test timeouts"
- **Cause**: MSW request not handled
- **Fix**: Add handler to `src/__tests__/mocks/handlers.ts`

### "Backend unreachable"
- **Cause**: Backend not running (integration tests)
- **Fix**: Start backend or skip integration tests (they auto-skip)

### "Mock data doesn't match API"
- **Cause**: Backend API changed
- **Fix**: Update mock in `src/__tests__/mocks/handlers.ts`

### "Tests running against real backend"
- **Cause**: MSW not initialized
- **Fix**: Check `src/__tests__/setup.ts` is in vitest.config.ts

---

## Environment Variables

```bash
# .env
NEXT_PUBLIC_BACKURL="http://localhost:8080"

# vitest.config.ts - setupFiles points to setup.ts
```

### Run Integration Tests Only

```bash
SKIP_INTEGRATION=false npm run test:integration
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
- name: Run unit tests (with mocks)
  run: npm test

- name: Start backend
  run: docker-compose up -d

- name: Run integration tests
  run: npm run test:integration
```

---

## Real World Example

### Testing Department CRUD

**Mocked Test:**
```typescript
import { mockDepartments } from './mocks/handlers';

it('should display all mock departments', () => {
  expect(mockDepartments).toHaveLength(3);
  const names = mockDepartments.map(d => d.name);
  expect(names).toContain('Gestión');
});
```

**Integration Test:**
```typescript
it('should fetch real departments from backend', async () => {
  const response = await fetch(`${BACKEND_URL}/departments/getdepartments`);
  const departments = await response.json();

  // Real data structure
  expect(departments[0]).toHaveProperty('id');
  expect(departments[0]).toHaveProperty('createdAt'); // Real API might have this
});
```

---

## Next Steps

1. Run mocked tests: `npm test`
2. Verify coverage: `npm test -- --coverage`
3. Add more mock handlers as needed
4. When backend is ready, run integration tests: `npm run test:integration`

---

## See Also

- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library](https://testing-library.com/)
- [API Slice Unification Plan](./MEMORY.md#api-slice-unification-with-injectendpoints-feb-9-2025)
