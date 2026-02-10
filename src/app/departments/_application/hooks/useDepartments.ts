"use client";
import { useGetDepartmentsQuery } from '../slices';
import { useAppSelector } from '@/_core/store';

export function useDepartments() {
  const auth = useAppSelector((state) => state.auth);
  const { data, isLoading, isError } = useGetDepartmentsQuery(undefined);

  // Filter departments according to authorization
  const departments = auth.isAdmin
    ? data
    : auth.Departments;

  return {
    departments,
    isLoading,
    isError,
    isAdmin: auth.isAdmin
  };
}
