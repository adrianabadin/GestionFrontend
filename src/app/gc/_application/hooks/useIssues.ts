"use client";
import { useGetIssuesQuery, useGetIssuesByStateQuery } from '../slices';
import { ISSUE_STATES, type IssueState } from '../../_domain/constants';

export function useIssues(state?: IssueState, department?: string) {
  const query = state
    ? { state, department }
    : { department };

  const { data, isLoading, isError, error } = useGetIssuesQuery(query);

  return {
    issues: data,
    isLoading,
    isError,
    error
  };
}
