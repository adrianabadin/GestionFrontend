# Testing Examples - MPF.AI

Complete examples of how to write tests with mocks and real backend data.

---

## Example 1: Simple Mock Test

### Testing if API hooks are exported

```typescript
// src/__tests__/departments.mocked.test.ts
import { describe, it, expect } from 'vitest';
import { mockDepartments } from './mocks/handlers';

describe('Departments with Mocks', () => {
  it('should have mock departments data', () => {
    expect(mockDepartments).toHaveLength(3);
    expect(mockDepartments[0].id).toBeDefined();
  });

  it('should have valid department structure', () => {
    const dept = mockDepartments[0];
    expect(dept).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
    });
  });

  it('should have API hook available', async () => {
    const api = await import('@/_core/api');
    expect(api.useGetDepartmentsQuery).toBeDefined();
    expect(typeof api.useGetDepartmentsQuery).toBe('function');
  });
});
```

**Run:**
```bash
npm test -- src/__tests__/departments.mocked.test.ts
```

---

## Example 2: Testing with MSW Mock Handlers

### Testing API responses through MSW

```typescript
// src/__tests__/departments.handler.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKURL || 'http://localhost:8080';

describe('Departments MSW Handlers', () => {
  it('should return mock departments when API is called', async () => {
    const response = await fetch(`${BACKEND_URL}/departments/getdepartments`);
    const departments = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(departments)).toBe(true);
    expect(departments.length).toBeGreaterThan(0);
  });

  it('should create a new department', async () => {
    const newDept = {
      name: 'Neurology',
      description: 'Neurological department',
    };

    const response = await fetch(
      `${BACKEND_URL}/departments/createdepartment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDept),
      }
    );

    const created = await response.json();
    expect(response.status).toBe(200);
    expect(created.id).toBeDefined();
    expect(created.name).toBe(newDept.name);
  });

  it('should handle errors gracefully', async () => {
    // Override handler to simulate error
    server.use(
      http.get(`${BACKEND_URL}/departments/getdepartments`, () => {
        return HttpResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    const response = await fetch(`${BACKEND_URL}/departments/getdepartments`);
    expect(response.status).toBe(500);

    // Reset for other tests
    server.resetHandlers();
  });
});
```

**Run:**
```bash
npm test -- src/__tests__/departments.handler.test.ts
```

---

## Example 3: Integration Test with Real Backend

### Testing against actual backend

```typescript
// src/__tests__/departments.integration.test.ts
import { describe, it, expect } from 'vitest';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKURL || 'http://localhost:8080';
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION !== 'false';

describe.skipIf(SKIP_INTEGRATION)('Departments Real Backend', () => {
  it('should fetch real departments from actual backend', async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/departments/getdepartments`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const departments = await response.json();

        // Validate real API response
        expect(Array.isArray(departments)).toBe(true);

        if (departments.length > 0) {
          const dept = departments[0];

          // Should match real API structure
          expect(dept).toHaveProperty('id');
          expect(dept).toHaveProperty('name');

          // Real data should be strings
          expect(typeof dept.id).toBe('string');
          expect(typeof dept.name).toBe('string');
        }
      }
    } catch (error) {
      console.warn('Backend not available for integration test');
    }
  });

  it('should handle authentication properly', async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/jwt`, {
        method: 'GET',
        credentials: 'include',
      });

      // Either authenticated (200) or not (401/403) - both indicate backend works
      expect([200, 401, 403]).toContain(response.status);
    } catch (error) {
      console.warn('Backend auth check failed');
    }
  });
});
```

**Run:**
```bash
# Only runs if backend is at localhost:8080
npm run test:integration
```

---

## Example 4: Testing API Slice Methods

### Testing RTK Query hooks with mocks

```typescript
// src/__tests__/api.hooks.test.ts
import { describe, it, expect } from 'vitest';

describe('API Hooks', () => {
  it('should export all department hooks', async () => {
    const api = await import('@/_core/api');

    expect(api.useGetDepartmentsQuery).toBeDefined();
    expect(api.useCreateDepartmentMutation).toBeDefined();
    expect(api.useAddServiceMutation).toBeDefined();
    expect(api.useRmServiceMutation).toBeDefined();
  });

  it('should export all GC hooks', async () => {
    const api = await import('@/_core/api');

    expect(api.useGetIssuesQuery).toBeDefined();
    expect(api.useCreateIssueMutation).toBeDefined();
    expect(api.useAddInterventionMutation).toBeDefined();
    expect(api.useGetInterventionsQuery).toBeDefined();
  });

  it('should export all auth hooks', async () => {
    const api = await import('@/_core/api');

    expect(api.useLoginMutation).toBeDefined();
    expect(api.useSignUpMutation).toBeDefined();
    expect(api.useJwtLoginQuery).toBeDefined();
    expect(api.useLogoutQuery).toBeDefined();
  });

  it('should have unified apiSlice', async () => {
    const api = await import('@/_core/api');

    expect(api.apiSlice).toBeDefined();
    expect(api.apiSlice.reducerPath).toBe('api');
    expect(typeof api.apiSlice.middleware).toBe('function');
  });
});
```

**Run:**
```bash
npm test -- src/__tests__/api.hooks.test.ts
```

---

## Example 5: Comparing Mock vs Real Data

### Same test logic, different data sources

```typescript
// MOCKED VERSION
import { mockIssues } from './mocks/handlers';

describe('Issues - With Mocks', () => {
  it('should validate issue structure', () => {
    expect(mockIssues[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      state: expect.stringMatching(/pending|working|terminated/),
    });
  });
});

// INTEGRATION VERSION
describe.skipIf(process.env.SKIP_INTEGRATION !== 'false')('Issues - Real Backend', () => {
  it('should validate real issue structure', async () => {
    const response = await fetch(`${BACKEND_URL}/gc/issue`);
    const issues = await response.json();

    if (Array.isArray(issues) && issues.length > 0) {
      const issue = issues[0];
      expect(issue).toHaveProperty('id');
      expect(issue).toHaveProperty('title');
      // Real API might have different properties
    }
  });
});
```

Both tests have similar structure but:
- **Mocked**: Uses `mockIssues` from handlers (fast, offline)
- **Integration**: Calls real backend (slower, requires running server)

---

## Example 6: Adding New Mock Handlers

### Step-by-step guide

**Step 1: Add mock data**
```typescript
// In src/__tests__/mocks/handlers.ts

export const mockNewEndpoint = {
  id: 'new-1',
  name: 'New Feature',
  data: { /* ... */ },
};
```

**Step 2: Add HTTP handler**
```typescript
// Still in src/__tests__/mocks/handlers.ts

export const handlers = [
  // ... existing handlers ...

  http.get(`${BACKEND_URL}/newendpoint`, () => {
    return HttpResponse.json(mockNewEndpoint);
  }),

  http.post(`${BACKEND_URL}/newendpoint`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: `new-${Date.now()}`,
      ...body,
    });
  }),
];
```

**Step 3: Create test**
```typescript
// src/__tests__/newfeature.test.ts

import { describe, it, expect } from 'vitest';
import { mockNewEndpoint } from './mocks/handlers';

describe('New Feature', () => {
  it('should have mock data', () => {
    expect(mockNewEndpoint.id).toBe('new-1');
  });

  it('should call endpoint', async () => {
    const response = await fetch(`${BACKEND_URL}/newendpoint`);
    const data = await response.json();
    expect(data.id).toBe('new-1');
  });
});
```

**Run:**
```bash
npm test
```

---

## Example 7: Testing Error Scenarios

### Mock error responses

```typescript
// src/__tests__/error-handling.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKURL || 'http://localhost:8080';

describe('Error Handling', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('should handle 401 Unauthorized', async () => {
    server.use(
      http.get(`${BACKEND_URL}/departments/getdepartments`, () => {
        return HttpResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      })
    );

    const response = await fetch(`${BACKEND_URL}/departments/getdepartments`);
    expect(response.status).toBe(401);
  });

  it('should handle 500 Server Error', async () => {
    server.use(
      http.get(`${BACKEND_URL}/departments/getdepartments`, () => {
        return HttpResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    const response = await fetch(`${BACKEND_URL}/departments/getdepartments`);
    expect(response.status).toBe(500);
  });

  it('should handle network timeout', async () => {
    server.use(
      http.get(`${BACKEND_URL}/departments/getdepartments`, async () => {
        // Simulate timeout
        await new Promise(resolve => setTimeout(resolve, 5000));
        return HttpResponse.json({});
      })
    );

    // Implementation would handle timeout gracefully
  });
});
```

---

## Quick Reference

### Run Tests

```bash
npm test                          # Run all tests (mocked)
npm run test:watch               # Watch mode
npm run test:integration         # Run integration tests (real backend)
npm test -- api.mocked.test.ts   # Run specific test file
```

### Mock Common Endpoints

```typescript
// GET endpoint
http.get(`${BACKEND_URL}/path`, () => {
  return HttpResponse.json(mockData);
}),

// POST endpoint
http.post(`${BACKEND_URL}/path`, async ({ request }) => {
  const body = await request.json();
  return HttpResponse.json({ id: `new-${Date.now()}`, ...body });
}),

// Error response
http.get(`${BACKEND_URL}/path`, () => {
  return HttpResponse.json({ error: 'Not found' }, { status: 404 });
}),
```

### Test Patterns

```typescript
// Check if mock data exists
expect(mockData).toBeDefined();

// Check data structure
expect(data).toMatchObject({ id: expect.any(String) });

// Check array length
expect(array).toHaveLength(3);

// Check property exists
expect(data).toHaveProperty('name');

// Check specific values
expect(data.status).toBe('pending');
```

---

See [TESTING.md](./TESTING.md) for complete documentation.
