"use client";
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/_shared/_infrastructure/api";
import { authSlice } from "../auth/_application/slices";
import { gcImagesSlice } from "../../app/gc/_application/slices";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    gcImages: gcImagesSlice.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      immutableCheck: true,
      serializableCheck: false,
      actionCreatorCheck: true,
    }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
