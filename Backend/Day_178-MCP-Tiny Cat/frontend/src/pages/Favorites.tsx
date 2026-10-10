import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useGetCatsQuery } from "../features/api/catsApi";
import { clearFavorites } from "../features/favorites/favoritesSlice";
import CatCard from "../components/CatCard";
import QueryState from "../components/QueryState";

export default function Favorites() {
  const dispatch = useAppDispatch();
  const ids = useAppSelector((s) => s.favorites.ids);
  const { data: cats = [], isLoading, error } = useGetCatsQuery();

  // Ids whose cat was deleted from the DB are simply skipped
  const favs = cats.filter((c) => ids.includes(c._id));

  return (
    <>
      <div className="row-between">
        <h1>Favorites</h1>
        {favs.length > 0 && (
          <button className="btn btn-ghost" onClick={() => dispatch(clearFavorites())}>
            Clear all
          </button>
        )}
      </div>

      <QueryState loading={isLoading} error={error} />

      {!isLoading && !error && favs.length === 0 && (
        <p className="state">
          No favorites yet. Tap the ♡ on a cat, or <Link to="/">browse cats</Link>.
        </p>
      )}

      <div className="grid">
        {favs.map((cat) => (
          <CatCard key={cat._id} cat={cat} />
        ))}
      </div>
    </>
  );
}
