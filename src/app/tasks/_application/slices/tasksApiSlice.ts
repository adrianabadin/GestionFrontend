import { apiSlice } from "@/_shared/_infrastructure/api";
import type { TasksResponseType, TaskFilterType, TaskType, CloseTaskType } from "../../_domain/types";

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TasksResponseType[], TaskFilterType>({
      query: (query) => {
        return {
          url: `/tasks/get${
            query !== undefined
              ? "?" +
                Object.keys(query)
                  .map((item) => `${item}=${query[item as keyof typeof query]}`)
                  .join("&")
              : ""
          }`,
          method: "get"
        };
      },
      providesTags: [{ type: "tasks" }]
    }),
    createTask: builder.mutation<TasksResponseType, Omit<TaskType, "time">>({
      query: (body) => ({
        url: "/tasks/create",
        method: "post",
        body: body
      }),
      invalidatesTags: [{ type: "tasks" }]
    }),
    deleteTask: builder.mutation<TasksResponseType, string>({
      query: (id) => ({
        url: "/tasks/delete?id=" + id,
        method: "delete"
      }),
      invalidatesTags: [{ type: "tasks" }]
    }),
    updateTask: builder.mutation<TasksResponseType, Omit<TaskType, "time"> & { id: string }>({
      query: (data) => ({
        url: "/tasks/update",
        method: "put",
        body: data
      }),
      invalidatesTags: [{ type: "tasks" }]
    }),
    closeTask: builder.mutation<{ id: string }, CloseTaskType>({
      query: (data) => ({
        url: "/tasks/close",
        method: "put",
        body: data
      }),
      invalidatesTags: [{ type: "tasks" }]
    }),
    createDocument: builder.mutation<{ id: string }, { title: string; text: string; user: string }>({
      query: (data) => ({
        url: "/google/createDocument",
        method: "post",
        body: data
      })
    })
  })
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useCloseTaskMutation,
  useCreateDocumentMutation
} = tasksApiSlice;
