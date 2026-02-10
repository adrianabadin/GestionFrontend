// Export unified apiSlice from shared infrastructure
export { apiSlice } from "@/_shared/_infrastructure/api";

// Re-export from authApiSlice
export {
  authApiSlice,
  useLoginMutation,
  useSignUpMutation,
  useLogoutQuery,
  useJwtLoginQuery,
  useSendTokenQuery,
  useChangePasswordMutation,
} from "@/_core/auth/_application/slices";

// Re-export all from departmentsApiSlice
export {
  departmentsApiSlice,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useAddServiceMutation,
  useRmServiceMutation,
  useAddResponsableMutation,
  type DepartmentAddType,
} from "@/app/departments/_application/slices/departmentsApiSlice";

// Re-export all from gcApiSlice
export {
  gcApiSlice,
  useGetKOIsQuery,
  useAddKindOfIssueMutation,
  useDeleteKOIMutation,
  useUpdateKOIMutation,
  useCreateIssueMutation,
  useGetIssuesQuery,
  useGetIssuesByStateQuery,
  useGetIssuesByUserQuery,
  useDerivateIssueMutation,
  useAddPhoneMutation,
  useAddMailMutation,
  useCloseIssueMutation,
  useAddInterventionMutation,
  useGetInterventionsQuery,
  useSendMailMutation,
  useGetFilesQuery,
  useUploadImageMutation,
  useDeleteImageMutation,
  type AddKOI,
} from "@/app/gc/_application/slices/gcApiSlice";

// Re-export gcImagesSlice
export {
  gcImagesSlice,
  clearImages,
  addFile,
  removeFile,
} from "@/app/gc/_application/slices/gcImagesSlice";

// Re-export from tasksApiSlice
export {
  tasksApiSlice,
  useGetTasksQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useCloseTaskMutation,
  useCreateDocumentMutation,
} from "@/app/tasks/_application/slices/tasksApiSlice";
export type { TaskType, TasksResponseType, CloseTaskType, TaskFilterType } from "@/app/tasks/_domain";

// Re-export from fodaApiSlice
export {
  fodaApiSlice,
  useGetFodaQuery,
  useAddStrengthMutation,
  useRemoveStrengthMutation,
  useAddWeaknessMutation,
  useRemoveWeaknessMutation,
  useAddOportunityMutation,
  useRemoveOportunityMutation,
  useAddMenaceMutation,
  useRemoveMenaceMutation,
  useAddStrategySOMutation,
  useRemoveStrategySOMutation,
  useAddStrategyWOMutation,
  useRemoveStrategyWOMutation,
  useAddStrategySMMutation,
  useRemoveStrategySMMutation,
  useAddStrategyWMMutation,
  useRemoveStrategyWMMutation,
} from "@/app/foda/_application/slices/fodaApiSlice";
export type { FodaResponse, FodaItem, DeleteMember } from "@/app/foda/_domain";
export { FodaItemSchema as FodaItemSchema, FodaItemSchema as fodaItem } from "@/app/foda/_domain/schemas";

// Re-export from usersApiSlice
export {
  usersApiSlice,
  useGetUsersQuery,
  useDeleteUserMutation,
  useReviveUserMutation,
  useSetAdminMutation,
  useDropAdminMutation,
} from "@/app/admin/_application/slices/usersApiSlice";
export type { User } from "@/app/admin/_domain";

// Re-export from statesApiSlice
export {
  statesApiSlice,
  useGetStatesQuery,
  useCreateStateMutation,
} from "@/app/states/_application/slices/statesApiSlice";
export type { StatesType, DemografyCreateType } from "@/app/states/_domain";

// Re-export additional types and schemas for backward compatibility
export { DerivationSchema, DerivationSchema as derivationSchema } from "@/app/gc/_domain/schemas";
export type { DerivationType, GetIssues } from "@/app/gc/_domain/types";
