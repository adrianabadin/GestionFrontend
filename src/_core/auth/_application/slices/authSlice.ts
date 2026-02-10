import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponseType } from "../../_domain/types";
import { apiSlice } from "@/_shared/_infrastructure/api";

const initialState: AuthResponseType = {
  lastname: "",
  name: "",
  username: "",
  id: "",
  isAdmin: false,
  DepartmentUsers: [],
  Departments: [],
  responsibleFor: []
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (_state) => initialState
  },
  extraReducers: (builder) => {
    // Handle successful login
    builder.addMatcher(
      apiSlice.endpoints.login.matchFulfilled,
      (state, action) => {
        return action.payload;
      }
    );

    // Handle successful JWT login
    builder.addMatcher(
      apiSlice.endpoints.jwtLogin.matchFulfilled,
      (state, action) => {
        return action.payload;
      }
    );

    // Handle successful sign up
    builder.addMatcher(
      apiSlice.endpoints.signUp.matchFulfilled,
      (state, action) => {
        return action.payload;
      }
    );

    // Handle logout
    builder.addMatcher(
      apiSlice.endpoints.logout.matchFulfilled,
      (state) => {
        return initialState;
      }
    );
  }
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
