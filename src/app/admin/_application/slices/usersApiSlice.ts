import { apiSlice } from "@/_shared/_infrastructure/api";
import type { User } from "../../_domain/types";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], { id?: string }>({
      query: ({ id }) => ({
        url: `/users/getUsers${id ? `/${id}` : ""}`,
        method: "get"
      }),
      providesTags: (result, error, { id }) => {
        if (id) {
          return [{ type: "users", id }];
        }
        return [{ type: "users", id: "LIST" }];
      }
    }),
    deleteUser: builder.mutation<User, { id: string }>({
      query: (id) => ({
        url: "/users/delete?id=" + id.id,
        method: "delete"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "users", id }]
    }),
    reviveUser: builder.mutation<User, { id: string }>({
      query: (id) => ({
        url: "users/revive?id=" + id.id,
        method: "put"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "users", id }]
    }),
    setAdmin: builder.mutation<User, string>({
      query: (id) => ({
        url: `/users/setadmin/${id}`,
        method: "put"
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "users", id },
        { type: "users", id: "LIST" }
      ]
    }),
    dropAdmin: builder.mutation<User, string>({
      query: (id) => ({
        url: `/users/dropadmin/${id}`,
        method: "put"
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "users", id },
        { type: "users", id: "LIST" }
      ]
    })
  })
});

export const {
  useGetUsersQuery,
  useDeleteUserMutation,
  useReviveUserMutation,
  useSetAdminMutation,
  useDropAdminMutation
} = usersApiSlice;
