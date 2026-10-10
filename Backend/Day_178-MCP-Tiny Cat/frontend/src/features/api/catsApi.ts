import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, Cat, CatInput, Preferences } from "../../types/cat";

const unwrap = <T,>(res: ApiResponse<T>) => res.data;

export const catsApi = createApi({
  reducerPath: "catsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Cats"],
  endpoints: (build) => ({
    getCats: build.query<Cat[], void>({
      query: () => "/cats",
      transformResponse: unwrap<Cat[]>,
      providesTags: ["Cats"],
    }),

    getCat: build.query<Cat, string>({
      query: (id) => `/cats/${id}`,
      transformResponse: unwrap<Cat>,
      providesTags: ["Cats"],
    }),

    createCat: build.mutation<Cat, CatInput>({
      query: (body) => ({ url: "/cats/create", method: "POST", body }),
      transformResponse: unwrap<Cat>,
      invalidatesTags: ["Cats"],
    }),

    // Cats in MongoDB that exactly match the two preferences
    getMatches: build.mutation<Cat[], Preferences>({
      query: (body) => ({ url: "/cats/recommend", method: "POST", body }),
      transformResponse: unwrap<Cat[]>,
    }),

    // Gemini-written breed advice (markdown)
    getAiAdvice: build.mutation<string, Preferences>({
      query: (body) => ({
        url: "/aiRecommend/recommendByAi",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<string>) => res.data,
    }),
  }),
});

export const {
  useGetCatsQuery,
  useGetCatQuery,
  useCreateCatMutation,
  useGetMatchesMutation,
  useGetAiAdviceMutation,
} = catsApi;
