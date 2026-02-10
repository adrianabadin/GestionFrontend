"use client";
import { useGetKOIsQuery } from '../slices';

export function useKOIs(id?: string) {
  const { data, isLoading, isError } = useGetKOIsQuery(id);

  return {
    kois: data,
    isLoading,
    isError
  };
}
