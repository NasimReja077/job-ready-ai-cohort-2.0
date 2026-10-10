/**
 * Base fetcher — the single axios instance every API call goes through.
 *
 * Out of the box it talks to a local, offline-first "server" (see mockAdapter.js)
 * that stores todos in localStorage, so the PWA works with no backend.
 *
 * To use a real REST API instead:
 *   1. set VITE_API_URL in .env  (e.g. VITE_API_URL=https://api.example.com)
 *   2. that's it — the mock adapter is skipped automatically.
 */
import axios from "axios";
import { mockAdapter } from "./mockAdapter";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const fetcher = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  ...(import.meta.env.VITE_API_URL ? {} : { adapter: mockAdapter }),
});

// ---- request interceptor: attach auth token if you add login later
fetcher.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskflow:token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- response interceptor: unwrap data + normalise errors
fetcher.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED" ? "Request timed out" : error.message) ||
      "Something went wrong";
    return Promise.reject({ message, status: error.response?.status ?? 0 });
  }
);

/** Tiny helpers so call-sites stay one-liners */
export const get = (url, config) => fetcher.get(url, config);
export const post = (url, body, config) => fetcher.post(url, body, config);
export const patch = (url, body, config) => fetcher.patch(url, body, config);
export const del = (url, config) => fetcher.delete(url, config);
