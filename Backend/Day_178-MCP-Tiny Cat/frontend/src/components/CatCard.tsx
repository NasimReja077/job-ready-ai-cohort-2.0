import { Link } from "react-router-dom";
import type { Cat } from "../types/cat";
import FavoriteButton from "./FavoriteButton";

export const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#efe9e1'/><text x='50%' y='50%' font-size='72' text-anchor='middle' dominant-baseline='middle'>🐱</text></svg>`
  );

export default function CatCard({ cat }: { cat: Cat }) {
  return (
    <Link to={`/cats/${cat._id}`} className="card">
      <div className="card-img">
        <img
          src={cat.image || FALLBACK_IMG}
          alt={cat.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />
        <FavoriteButton catId={cat._id} />
      </div>
      <div className="card-body">
        <h3>{cat.name}</h3>
        <p className="muted">{cat.breed}</p>
        <div className="tags">
          <span className="tag">⚡ {cat.energyLevel}</span>
          {cat.kidsFriendly && <span className="tag good">Kids OK</span>}
          {cat.apartmentFriendly && <span className="tag good">Apartment OK</span>}
        </div>
      </div>
    </Link>
  );
}
