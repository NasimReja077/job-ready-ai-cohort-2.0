import { configureStore } from "@reduxjs/toolkit";
import { catsApi } from "../features/api/catsApi";
import favoritesReducer, {
  saveFavorites,
} from "../features/favorites/favoritesSlice";

export const store = configureStore({
  reducer: {
    [catsApi.reducerPath]: catsApi.reducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefault) => getDefault().concat(catsApi.middleware),
});

// Persist favorites whenever they change
let previous = store.getState().favorites.ids;
store.subscribe(() => {
  const current = store.getState().favorites.ids;
  if (current !== previous) {
    previous = current;
    saveFavorites(current);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
