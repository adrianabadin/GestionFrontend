import { apiSlice } from "@/_shared/_infrastructure/api";
import type { FodaResponse, DeleteMember, MemberAddPayload } from "../../_domain/types";

export const fodaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFoda: builder.query<FodaResponse, { state?: string; department?: string }>({
      query: (baseQuery) => {
        const { department, state } = baseQuery;
        let query: Record<string, string> = {};
        if (department !== undefined && department !== null) {
          query = { service: department };
        }
        if (state !== undefined && state !== null) {
          query = { ...query, state };
        }
        return {
          url: `/foda${
            query !== undefined
              ? "?" +
                Object.keys(query)
                  .map((item) => `${item}=${query[item as keyof typeof query]}`)
                  .join("&")
              : ""
          }`,
        };
      },
      providesTags: [{ type: "foda" }]
    }),
    addStrength: builder.mutation<FodaResponse, MemberAddPayload>({
      query: (data) => ({
        url: `/foda/strength${
          data.query !== undefined
            ? "?" +
              Object.keys(data.query)
                .map((key) => {
                  if (data.query[key as keyof typeof data.query] !== undefined)
                    return `${key}=${data.query[key as keyof typeof data.query]}`;
                  else return "";
                })
                .join("&")
            : ""
        }`,
        method: "PUT",
        body: data.body
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    removeStrength: builder.mutation<DeleteMember, string>({
      query: (id) => ({
        url: "/foda/strength/" + id,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    addWeakness: builder.mutation<FodaResponse, MemberAddPayload>({
      query: (data) => ({
        url: `/foda/weakness${
          data.query !== undefined
            ? "?" +
              Object.keys(data.query)
                .map((key) => {
                  if (data.query[key as keyof typeof data.query] !== undefined)
                    return `${key}=${data.query[key as keyof typeof data.query]}`;
                  else return "";
                })
                .join("&")
            : ""
        }`,
        method: "PUT",
        body: data.body
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    removeWeakness: builder.mutation<DeleteMember, string>({
      query: (id) => ({
        url: "/foda/weakness/" + id,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    addOportunity: builder.mutation<FodaResponse, MemberAddPayload>({
      query: (data) => ({
        url: `/foda/oportunity${
          data.query !== undefined
            ? "?" +
              Object.keys(data.query)
                .map((key) => {
                  if (data.query[key as keyof typeof data.query] !== undefined)
                    return `${key}=${data.query[key as keyof typeof data.query]}`;
                  else return "";
                })
                .join("&")
            : ""
        }`,
        method: "PUT",
        body: data.body
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    removeOportunity: builder.mutation<DeleteMember, string>({
      query: (id) => ({
        url: "/foda/oportunity/" + id,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    addMenace: builder.mutation<FodaResponse, MemberAddPayload>({
      query: (data) => ({
        url: `/foda/menace${
          data.query !== undefined
            ? "?" +
              Object.keys(data.query)
                .map((key) => {
                  if (data.query[key as keyof typeof data.query] !== undefined)
                    return `${key}=${data.query[key as keyof typeof data.query]}`;
                  else return "";
                })
                .join("&")
            : ""
        }`,
        method: "PUT",
        body: data.body
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    removeMenace: builder.mutation<DeleteMember, string>({
      query: (id) => ({
        url: "/foda/menace/" + id,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    addStrategySO: builder.mutation<FodaResponse, MemberAddPayload>({
      query: (data) => ({
        url: `/foda/strategySO${
          data.query !== undefined ? "?" + Object.keys(data.query).map((key) => `${key}=${data.query[key as keyof typeof data.query]}`).join("&") : ""
        }`,
        method: "PUT",
        body: data.body
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    removeStrategySO: builder.mutation<DeleteMember, string>({
      query: (id) => ({
        url: "/foda/strategySO/" + id,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    addStrategyWO: builder.mutation<FodaResponse, MemberAddPayload>({
      query: (data) => ({
        url: `/foda/strategyWO${
          data.query !== undefined ? "?" + Object.keys(data.query).map((key) => `${key}=${data.query[key as keyof typeof data.query]}`).join("&") : ""
        }`,
        method: "PUT",
        body: data.body
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    removeStrategyWO: builder.mutation<DeleteMember, string>({
      query: (id) => ({
        url: "/foda/strategyWO/" + id,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    addStrategySM: builder.mutation<FodaResponse, MemberAddPayload>({
      query: (data) => ({
        url: `/foda/strategySM${
          data.query !== undefined ? "?" + Object.keys(data.query).map((key) => `${key}=${data.query[key as keyof typeof data.query]}`).join("&") : ""
        }`,
        method: "PUT",
        body: data.body
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    removeStrategySM: builder.mutation<DeleteMember, string>({
      query: (id) => ({
        url: "/foda/strategySM/" + id,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    addStrategyWM: builder.mutation<FodaResponse, MemberAddPayload>({
      query: (data) => ({
        url: `/foda/strategyWM${
          data.query !== undefined ? "?" + Object.keys(data.query).map((key) => `${key}=${data.query[key as keyof typeof data.query]}`).join("&") : ""
        }`,
        method: "PUT",
        body: data.body
      }),
      invalidatesTags: [{ type: "foda" }]
    }),
    removeStrategyWM: builder.mutation<DeleteMember, string>({
      query: (id) => ({
        url: "/foda/strategyWM/" + id,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "foda" }]
    })
  })
});

export const {
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
  useRemoveStrategyWMMutation
} = fodaApiSlice;
