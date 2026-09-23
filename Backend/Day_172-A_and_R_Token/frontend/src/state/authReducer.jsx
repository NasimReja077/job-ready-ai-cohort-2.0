import { createSlice, isAllOf } from "@reduxjs/toolkit";

export const authSlice = createSlice({
     name: "auth",
     initialState: {
          user: null,
          isLoading: false,
     },
     reducers: {
          addUser: (state, action) => {
               state.user = action.payload;
               state.isLoading = false;
          },
          removeUser: (state) => {
               state.user = null;
               state.isLoading = false;
          },
     },
});


export const { addUser, removeUser } = authSlice.actions;