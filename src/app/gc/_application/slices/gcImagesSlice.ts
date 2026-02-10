import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { GcImageItem } from "../../_domain/types";

const initialState: GcImageItem[] = [];

export const gcImagesSlice = createSlice({
  name: "gcImages",
  initialState,
  reducers: {
    clearImages: (_state) => initialState,
    addFile: (state, action: PayloadAction<GcImageItem>) => {
      if (state.length === 0) state = [action.payload];
      else state.push(action.payload);
      return state;
    },
    removeFile: (state, action: PayloadAction<GcImageItem>) => {
      return state.filter(
        (item) =>
          item.description !== action.payload.description || item.link !== action.payload.link
      );
    }
  }
});

export const { clearImages, addFile, removeFile } = gcImagesSlice.actions;
export default gcImagesSlice.reducer;
