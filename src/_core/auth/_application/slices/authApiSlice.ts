import { apiSlice } from "@/_shared/_infrastructure/api";
import type { AuthResponseType, LoginType, SignUpType, ChangePasswordType } from "../../_domain/types";
import { AUTH_POLLING_INTERVAL } from "../../_domain/constants";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponseType, LoginType>({
      query: (authData) => ({
        url: `/auth/login`,
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: authData
      }),
      invalidatesTags: [{ type: "auth" }]
    }),
    signUp: builder.mutation<AuthResponseType, SignUpType>({
      query: (signUpData) => ({
        url: "/auth/signup",
        method: "post",
        body: signUpData
      }),
      invalidatesTags: [{ type: "auth" }]
    }),
    logout: builder.query<any, undefined>({
      query: () => ({
        url: "/auth/logout",
        method: "get"
      })
    }),
    jwtLogin: builder.query<AuthResponseType, undefined>({
      query: () => ({
        url: "auth/jwt",
        method: "get"
      })
    }),
    sendToken: builder.query<any, { username: string }>({
      query: (username) => ({
        url: "/users/sendresettoken/" + username.username,
        method: "get"
      })
    }),
    changePassword: builder.mutation<AuthResponseType, ChangePasswordType>({
      query: (body) => ({
        url: "/users/resetpassword",
        method: "post",
        body
      })
    })
  })
});

export const {
  useLoginMutation,
  useSignUpMutation,
  useLogoutQuery,
  useJwtLoginQuery,
  useSendTokenQuery,
  useChangePasswordMutation
} = authApiSlice;
