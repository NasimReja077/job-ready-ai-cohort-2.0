import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios'

export const fetchData = createAsyncThunk(
  "/fetch/getData", 
  async () => {
   const res = await axios.get('https://fakestoreapi.com/products')
   return res.data
});

const userSlice = createSlice({
   name: "user",

  initialState: {
    loading: false,
    error: null,
    data: []
  },

  extraReducers: (builder) => {

    builder.addCase(fetchData.pending, (state) =>{
      state.loading = true
    })

    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.loading = false,
      state.data = action.payload
    })

    builder.addCase(fetchData.rejected, (state, action) => {
      state.loading = false,
      state.error = action.error.message
    })
  }
})

export default userSlice.reducer