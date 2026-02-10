import { describe, it, expect } from 'vitest';

describe('Departments Config Page', () => {
  it('should import admin configuration components', async () => {
    const adminConfig = await import('@/app/departments/config/components/AdminConfig');
    const addDept = await import('@/app/departments/config/components/AddDepartment');
    const asignDept = await import('@/app/departments/config/components/AsignDepartment');
    const asignResponsable = await import('@/app/departments/config/components/AsignResponsable');

    expect(adminConfig).toBeDefined();
    expect(addDept).toBeDefined();
    expect(asignDept).toBeDefined();
    expect(asignResponsable).toBeDefined();
  });

  it('should have required API queries available', async () => {
    const api = await import('@/_core/api');

    expect(api.useGetDepartmentsQuery).toBeDefined();
    expect(api.useGetUsersQuery).toBeDefined();
    expect(api.useCreateDepartmentMutation).toBeDefined();
    expect(api.useAddResponsableMutation).toBeDefined();
  });

  it('should import AddKindOfIssue component', async () => {
    const addKOI = await import('@/app/departments/config/components/AddKindOfIssue');
    expect(addKOI).toBeDefined();
  });

  it('should import AddState component', async () => {
    const addState = await import('@/app/departments/config/components/AddState');
    expect(addState).toBeDefined();
  });

  it('should have Material-Tailwind components available', async () => {
    const mt = await import('@material-tailwind/react');
    expect(mt.Dialog).toBeDefined();
    expect(mt.Input).toBeDefined();
    expect(mt.Button).toBeDefined();
  });
});
