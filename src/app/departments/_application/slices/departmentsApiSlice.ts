import { apiSlice } from "@/_shared/_infrastructure/api";
import type { DepartmentResponseType } from "../../_domain/types";

// Temporary type - will be replaced when AddDepartment component is refactored
export type DepartmentAddType = {
  id: string;
  name: string;
  description: string;
};

export const departmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<DepartmentResponseType[], { username?: string } | undefined>({
      query: (query) => ({
        url: `/departments/getdepartments${
          query !== undefined && query !== null && query.username !== undefined
            ? "?username=" + query.username
            : ""
        }`,
        method: "get"
      }),
      providesTags: [{ type: "departments", id: "LIST" }]
    }),
    createDepartment: builder.mutation<DepartmentResponseType, DepartmentAddType>({
      query: (data) => ({
        url: "/departments/createdepartment",
        method: "post",
        body: data
      }),
      invalidatesTags: (result, _error, _data) => {
        if (result !== undefined)
          return [
            { type: "departments", id: result.id },
            { type: "departments", id: "LIST" }
          ];
        else return [{ type: "departments", id: "LIST" }];
      }
    }),
    addService: builder.mutation<any, { data: { name: string[] }; id: string }>({
      query: (data) => ({
        url: "/users/adddepartments/" + data.id,
        method: "put",
        body: { ...data.data }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "departments", id }]
    }),
    rmService: builder.mutation<any, { data: { name: string[] }; id: string }>({
      query: (data) => ({
        url: "/users/rmdepartment/" + data.id,
        method: "put",
        body: { ...data.data }
      }),
      invalidatesTags: [{ type: "departments" }]
    }),
    addResponsable: builder.mutation<any, { data: { name: string[] }; id: string }>({
      query: (data) => ({
        url: "/departments/addResponsableToDepartments/" + data.id,
        method: "put",
        body: { ...data.data }
      }),
      invalidatesTags: [{ type: "departments" }]
    })
  })
});

export const {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useAddServiceMutation,
  useRmServiceMutation,
  useAddResponsableMutation
} = departmentsApiSlice;
