import { Link, useParams } from "react-router-dom";
import { useGetCatQuery } from "../features/api/catsApi";
import FavoriteButton from "../components/FavoriteButton";
import QueryState from "../components/QueryState";
import { FALLBACK_IMG } from "../components/CatCard";

export default function CatDetail() {
  const { id = "" } = useParams();
  const { data: cat, isLoading, error } = useGetCatQuery(id, { skip: !id });

  if (isLoading || error || !cat)
    return (
      <>
        <Link to="/" className="back">← Back</Link>
        <QueryState
          loading={isLoading}
          error={error}
          empty={!isLoading && !error && !cat}
          emptyText="Cat not found."
        />
      </>
    );

  const facts: [string, string | number | undefined][] = [
    ["Energy level", cat.energyLevel],
    ["Life span", cat.lifeSpan ? `${cat.lifeSpan} years` : undefined],
    ["Size", cat.size],
    ["Color", cat.color],
    ["Tail", cat.tailSize],
    ["Food habits", cat.foodHabits],
    ["Aggression", cat.violenceLevel],
    ["Kids friendly", cat.kidsFriendly ? "Yes" : "No"],
    ["Apartment friendly", cat.apartmentFriendly ? "Yes" : "No"],
  ];

  return (
    <>
      <Link to="/" className="back">← Back</Link>
      <article className="detail">
        <img
          src={cat.image || FALLBACK_IMG}
          alt={cat.name}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />
        <div>
          <div className="detail-head">
            <div>
              <h1>{cat.name}</h1>
              <p className="muted">{cat.breed}</p>
            </div>
            <FavoriteButton catId={cat._id} label />
          </div>
          <p>{cat.description}</p>
          <dl className="facts">
            {facts
              .filter(([, v]) => v !== undefined && v !== "")
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      </article>
    </>
  );
}
