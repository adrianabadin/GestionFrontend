import { http, HttpResponse } from 'msw';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKURL || 'http://localhost:8080';

// Mock data
export const mockDepartments = [
  {
    id: 'dept-1',
    name: 'Gestión',
    description: 'Gestión de Departamentos',
  },
  {
    id: 'dept-2',
    name: 'Prácticas',
    description: 'Prácticas Médicas',
  },
  {
    id: 'dept-3',
    name: 'Crónicos',
    description: 'Enfermedades Crónicas',
  },
];

export const mockAuthUser = {
  id: 'user-1',
  username: 'testuser',
  name: 'Test',
  lastname: 'User',
  isAdmin: false,
  DepartmentUsers: [],
  Departments: [
    {
      id: 'dept-1',
      name: 'Gestión',
    }
  ],
  responsibleFor: [],
};

export const mockAuthUserAdmin = {
  ...mockAuthUser,
  isAdmin: true,
};

export const mockKOIs = [
  {
    id: 'koi-1',
    name: 'Salud',
    text: 'Problemas de salud general',
  },
  {
    id: 'koi-2',
    name: 'Educación',
    text: 'Problemas de educación',
  },
];

export const mockIssues = [
  {
    id: 'issue-1',
    title: 'Problema de salud',
    description: 'Descripción del problema',
    state: 'pending',
    department: 'dept-1',
    koiId: 'koi-1',
    createdAt: '2025-02-09T00:00:00Z',
  },
  {
    id: 'issue-2',
    title: 'Problema de educación',
    description: 'Descripción del problema',
    state: 'working',
    department: 'dept-1',
    koiId: 'koi-2',
    createdAt: '2025-02-08T00:00:00Z',
  },
];

export const mockTasks = [
  {
    id: 'task-1',
    title: 'Task 1',
    description: 'Description',
    status: 'pending',
    assignee: 'testuser',
    createdAt: '2025-02-09T00:00:00Z',
  },
];

export const mockFoda = {
  id: 'foda-1',
  state: 'draft',
  department: 'dept-1',
  strengths: [],
  weaknesses: [],
  opportunities: [],
  threats: [],
};

export const mockUsers = [
  {
    id: 'user-1',
    username: 'testuser',
    name: 'Test',
    lastname: 'User',
    isAdmin: false,
    email: 'test@example.com',
  },
  {
    id: 'user-2',
    username: 'adminuser',
    name: 'Admin',
    lastname: 'User',
    isAdmin: true,
    email: 'admin@example.com',
  },
];

export const mockStates = [
  {
    id: 'state-1',
    state: 'State 1',
    population: 1000000,
    description: 'Description',
    politics: 'Politics info',
  },
];

// MSW Handlers
export const handlers = [
  // Auth endpoints
  http.post(`${BACKEND_URL}/auth/login`, () => {
    return HttpResponse.json(mockAuthUser);
  }),

  http.post(`${BACKEND_URL}/auth/signup`, () => {
    return HttpResponse.json(mockAuthUser);
  }),

  http.get(`${BACKEND_URL}/auth/jwt`, () => {
    return HttpResponse.json(mockAuthUser);
  }),

  http.get(`${BACKEND_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Departments endpoints
  http.get(`${BACKEND_URL}/departments/getdepartments`, () => {
    return HttpResponse.json(mockDepartments);
  }),

  http.post(`${BACKEND_URL}/departments/createdepartment`, async ({ request }) => {
    const body = await request.json() as { name: string; description: string };
    return HttpResponse.json({
      id: `dept-${Date.now()}`,
      ...body,
    });
  }),

  // GC (Gestión Ciudadana) endpoints
  http.get(`${BACKEND_URL}/gc`, () => {
    return HttpResponse.json(mockKOIs);
  }),

  http.post(`${BACKEND_URL}/gc`, async ({ request }) => {
    const body = await request.json() as { name: string; text: string };
    return HttpResponse.json({
      id: `koi-${Date.now()}`,
      ...body,
    });
  }),

  http.get(`${BACKEND_URL}/gc/issue`, () => {
    return HttpResponse.json(mockIssues);
  }),

  http.post(`${BACKEND_URL}/gc/issue`, async ({ request }) => {
    const body = await request.json() as object;
    return HttpResponse.json({
      id: `issue-${Date.now()}`,
      ...body,
    });
  }),

  http.get(`${BACKEND_URL}/gc/interventions`, () => {
    return HttpResponse.json({
      id: 'issue-1',
      interventions: [],
    });
  }),

  // Tasks endpoints
  http.get(`${BACKEND_URL}/tasks/get`, () => {
    return HttpResponse.json(mockTasks);
  }),

  http.post(`${BACKEND_URL}/tasks/create`, async ({ request }) => {
    const body = await request.json() as object;
    return HttpResponse.json({
      id: `task-${Date.now()}`,
      ...body,
    });
  }),

  // FODA endpoints
  http.get(`${BACKEND_URL}/foda`, () => {
    return HttpResponse.json(mockFoda);
  }),

  http.put(`${BACKEND_URL}/foda/strength`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockFoda,
      strengths: [body],
    });
  }),

  // Users endpoints
  http.get(`${BACKEND_URL}/users/getUsers`, () => {
    return HttpResponse.json(mockUsers);
  }),

  // States endpoints
  http.get(`${BACKEND_URL}/demography/getstates`, () => {
    return HttpResponse.json(mockStates);
  }),

  http.post(`${BACKEND_URL}/demography/create`, async ({ request }) => {
    const body = await request.json() as object;
    return HttpResponse.json({
      id: `state-${Date.now()}`,
      ...body,
    });
  }),
];
