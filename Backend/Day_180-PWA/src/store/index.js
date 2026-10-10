import { configureStore } from "@reduxjs/toolkit";
import todos from "./todosSlice";
import ui from "./uiSlice";

export const store = configureStore({ reducer: { todos, ui } });
