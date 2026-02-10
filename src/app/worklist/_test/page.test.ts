import { describe, it, expect } from 'vitest';

describe('Worklist Page', () => {
  it('should import tasks API', async () => {
    const api = await import('@/_core/api');

    expect(api.useGetTasksQuery).toBeDefined();
    expect(api.tasksApiSlice).toBeDefined();
  });

  it('should import redux hooks', async () => {
    const store = await import('@/_core/store');

    expect(store.useAppSelector).toBeDefined();
    expect(store.useAppDispatch).toBeDefined();
  });

  it('should have Material-Tailwind components', async () => {
    const mt = await import('@material-tailwind/react');

    expect(mt.Card).toBeDefined();
    expect(mt.Button).toBeDefined();
    expect(mt.Spinner).toBeDefined();
  });

  it('should have useRouter for navigation', async () => {
    const nextNav = await import('next/navigation');
    expect(nextNav.useRouter).toBeDefined();
  });
});
