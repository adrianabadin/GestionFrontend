import { apiSlice } from "@/_shared/_infrastructure/api";
import type { StatesType, DemografyCreateType } from "../../_domain/types";

export const statesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStates: builder.query<StatesType[], undefined>({
      query: () => ({
        url: "/demography/getstates",
        method: "get"
      }),
      providesTags: [{ type: "states" }]
    }),
    createState: builder.mutation<StatesType, DemografyCreateType>({
      query: (data) => ({
        url: "/demography/create",
        method: "post",
        body: data
      }),
      invalidatesTags: [{ type: "states" }]
    })
  })
});

export const {
  useGetStatesQuery,
  useCreateStateMutation
} = statesApiSlice;
