import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "ui",
  initialState: { formOpen: false, editingId: null },
  reducers: {
    openForm: (s, { payload }) => { s.formOpen = true; s.editingId = payload ?? null; },
    closeForm: (s) => { s.formOpen = false; s.editingId = null; },
  },
});

export const { openForm, closeForm } = slice.actions;
export default slice.reducer;
