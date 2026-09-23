import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "../state/authReducer.jsx";

export let store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});