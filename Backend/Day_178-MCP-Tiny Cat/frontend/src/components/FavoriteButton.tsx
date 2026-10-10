import { useAppDispatch, useAppSelector } from "../app/hooks";
import { toggleFavorite } from "../features/favorites/favoritesSlice";

interface Props {
  catId: string;
  label?: boolean;
}

export default function FavoriteButton({ catId, label = false }: Props) {
  const dispatch = useAppDispatch();
  const isFav = useAppSelector((s) => s.favorites.ids.includes(catId));

  return (
    <button
      type="button"
      className={`fav-btn ${isFav ? "active" : ""}`}
      aria-pressed={isFav}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.preventDefault(); // don't trigger the card link
        dispatch(toggleFavorite(catId));
      }}
    >
      {isFav ? "♥" : "♡"}
      {label && <span>{isFav ? " Saved" : " Save"}</span>}
    </button>
  );
}
