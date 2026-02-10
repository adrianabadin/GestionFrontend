import { apiSlice } from "@/_shared/_infrastructure/api";
import type {
  CreatedKOI,
  UserIssue,
  GetIssues,
  Intervention,
  GetIssueWithInterventions,
  Mail,
  DerivationType
} from "../../_domain/types";

// Temporary type - will be replaced when AddKindOfIssue component is refactored
export type AddKOI = {
  name: string;
  text: string;
};

export const gcApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // KOIs (Kind of Issues)
    getKOIs: builder.query<CreatedKOI[] | CreatedKOI, string | undefined>({
      query: (id) => {
        let url: string = "/gc";
        if (id !== undefined) url += "?id=" + id;
        return { url, method: "GET" };
      },
      providesTags: [{ type: "kois" }]
    }),
    addKindOfIssue: builder.mutation<CreatedKOI, AddKOI>({
      query: (body) => ({
        url: "/gc",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "kois" }]
    }),
    deleteKOI: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: "/gc?id=" + id,
        method: "DELETE"
      }),
      invalidatesTags: [{ type: "kois" }]
    }),
    updateKOI: builder.mutation<CreatedKOI, AddKOI & { id: string }>({
      query: (body) => ({
        url: "/gc",
        method: "put",
        body
      }),
      invalidatesTags: [{ type: "kois" }]
    }),

    // Issues
    createIssue: builder.mutation<{ id: string }, UserIssue>({
      query: (body) => ({
        url: "/gc/issue",
        method: "post",
        body
      }),
      invalidatesTags: [{ type: "issues" }]
    }),
    getIssues: builder.query<
      GetIssues[] | GetIssues,
      { id?: string; state?: "pending" | "working" | "terminated"; department?: string }
    >({
      query: (query) => {
        let url: string = "/gc/issue";
        if (query.id !== undefined) url += "?id=" + query.id;
        if (query.state !== undefined) url += (url.includes("?") ? "&" : "?") + "state=" + query.state;
        if (query.department !== undefined) {
          if (query.department !== "LIST") {
            url += (url.includes("?") ? "&" : "?") + "department=" + query.department;
          }
        }
        return { url, method: "get" };
      },
      providesTags: (result, errors, { id }) => {
        if (id !== undefined) {
          return [{ type: "issues", id: id }];
        } else return [{ type: "issues", id: "LIST" }];
      }
    }),
    getIssuesByState: builder.query<GetIssues[] | GetIssues, string>({
      query: (state) => ({
        url: "/gc/issue?state=" + state,
        method: "get"
      }),
      providesTags: [{ type: "issues" }]
    }),
    getIssuesByUser: builder.query<GetIssues[], { username: string; state: "pending" | "working" | "terminated" }>({
      query: (query) => ({
        url: `/gc/issue?username=${query.username}&state=${query.state}`,
        method: "get"
      }),
      providesTags: [{ type: "issues" }]
    }),
    derivateIssue: builder.mutation<GetIssues, DerivationType>({
      query: (body) => ({
        url: "/gc/derivation",
        method: "put",
        body
      }),
      invalidatesTags: (result, error, body) => [{ type: "issues", id: body.issueId }]
    }),
    addPhone: builder.mutation<{ id: string }, { id: string; phone: string }>({
      query: (body) => ({
        url: "/gc/addphone",
        method: "PUT",
        body
      }),
      invalidatesTags: [{ type: "issues" }]
    }),
    addMail: builder.mutation<{ id: string }, { id: string; mail: string }>({
      query: (body) => ({
        url: "/gc/addmail",
        method: "put",
        body
      }),
      invalidatesTags: [{ type: "issues" }]
    }),
    closeIssue: builder.mutation<{ id: string }, Intervention>({
      query: (data) => ({
        url: "/gc/issue",
        method: "delete",
        body: data
      }),
      invalidatesTags: [{ type: "issues" }]
    }),

    // Interventions
    addIntervention: builder.mutation<{ id: string }, Intervention>({
      query: (body) => ({
        url: "/gc/intervention",
        method: "post",
        body
      }),
      invalidatesTags: [{ type: "interventions" }, { type: "issues" }]
    }),
    getInterventions: builder.query<GetIssueWithInterventions, string>({
      query: (id) => ({
        url: `/gc/interventions?id=${id}`,
        method: "get"
      }),
      providesTags: [{ type: "interventions" }, { type: "issues" }]
    }),

    // Google
    sendMail: builder.mutation<any, Mail>({
      query: (body) => ({
        url: "/google/sendmail",
        method: "post",
        body
      })
    }),
    getFiles: builder.query<{ data: string }, string>({
      query: (id) => ({
        url: "/google/file?id=" + id,
        method: "get"
      })
    }),
    uploadImage: builder.mutation<{ id: string }, FormData>({
      query: (body) => ({
        url: "/google/uploadImage/",
        method: "POST",
        body
      })
    }),
    deleteImage: builder.mutation<any, string>({
      query: (id) => ({
        url: "/google/deleteImage?id=" + id,
        method: "DELETE"
      })
    })
  })
});

export const {
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
  useDeleteImageMutation
} = gcApiSlice;
