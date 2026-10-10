import { useMemo, useState } from "react";
import { useGetCatsQuery } from "../features/api/catsApi";
import CatCard from "../components/CatCard";
import QueryState from "../components/QueryState";

type Tri = "any" | "yes" | "no";

const matchTri = (value: boolean, filter: Tri) =>
  filter === "any" || (filter === "yes") === value;

export default function Home() {
  const { data: cats = [], isLoading, error } = useGetCatsQuery();
  const [q, setQ] = useState("");
  const [kids, setKids] = useState<Tri>("any");
  const [apartment, setApartment] = useState<Tri>("any");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return cats.filter(
      (c) =>
        (!term ||
          c.name.toLowerCase().includes(term) ||
          c.breed.toLowerCase().includes(term)) &&
        matchTri(c.kidsFriendly, kids) &&
        matchTri(c.apartmentFriendly, apartment)
    );
  }, [cats, q, kids, apartment]);

  return (
    <>
      <h1>Browse cats</h1>

      <div className="filters">
        <input
          type="search"
          placeholder="Search by name or breed…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <label>
          Kids friendly
          <select value={kids} onChange={(e) => setKids(e.target.value as Tri)}>
            <option value="any">Any</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label>
          Apartment friendly
          <select
            value={apartment}
            onChange={(e) => setApartment(e.target.value as Tri)}
          >
            <option value="any">Any</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>

      <QueryState
        loading={isLoading}
        error={error}
        empty={!isLoading && !error && filtered.length === 0}
        emptyText={cats.length === 0 ? "No cats yet — add the first one!" : "No cats match your filters."}
      />

      <div className="grid">
        {filtered.map((cat) => (
          <CatCard key={cat._id} cat={cat} />
        ))}
      </div>
    </>
  );
}
