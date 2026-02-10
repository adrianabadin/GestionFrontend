export const ISSUE_STATES = {
  PENDING: "pending",
  WORKING: "working",
  TERMINATED: "terminated"
} as const;

export type IssueState = typeof ISSUE_STATES[keyof typeof ISSUE_STATES];
