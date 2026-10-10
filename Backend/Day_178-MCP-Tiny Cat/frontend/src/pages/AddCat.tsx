import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCatMutation } from "../features/api/catsApi";
import { errorMessage } from "../components/QueryState";
import type { CatInput } from "../types/cat";

const empty: CatInput = {
  name: "",
  breed: "",
  description: "",
  energyLevel: "medium",
  lifeSpan: 12,
  kidsFriendly: true,
  apartmentFriendly: true,
  image: "",
  color: "",
  size: "",
  violenceLevel: "",
  foodHabits: "",
  tailSize: "medium",
};

export default function AddCat() {
  const [form, setForm] = useState<CatInput>(empty);
  const [createCat, { isLoading, error }] = useCreateCatMutation();
  const navigate = useNavigate();

  const set = <K extends keyof CatInput>(key: K, value: CatInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const cat = await createCat(form).unwrap();
      navigate(`/cats/${cat._id}`);
    } catch {
      /* error is shown from the mutation state */
    }
  };

  return (
    <>
      <h1>Add a cat</h1>
      <form className="form" onSubmit={onSubmit}>
        <label>
          Name *
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label>
          Breed *
          <input required value={form.breed} onChange={(e) => set("breed", e.target.value)} />
        </label>
        <label className="full">
          Description *
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </label>
        <label>
          Energy level *
          <select value={form.energyLevel} onChange={(e) => set("energyLevel", e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          Life span (years)
          <input
            type="number"
            min={1}
            max={40}
            value={form.lifeSpan}
            onChange={(e) => set("lifeSpan", Number(e.target.value))}
          />
        </label>
        <label>
          Size
          <input value={form.size ?? ""} onChange={(e) => set("size", e.target.value)} />
        </label>
        <label>
          Color
          <input value={form.color ?? ""} onChange={(e) => set("color", e.target.value)} />
        </label>
        <label>
          Tail size
          <input value={form.tailSize ?? ""} onChange={(e) => set("tailSize", e.target.value)} />
        </label>
        <label>
          Food habits
          <input value={form.foodHabits ?? ""} onChange={(e) => set("foodHabits", e.target.value)} />
        </label>
        <label>
          Aggression level
          <input
            value={form.violenceLevel ?? ""}
            onChange={(e) => set("violenceLevel", e.target.value)}
          />
        </label>
        <label className="full">
          Image URL
          <input
            type="url"
            placeholder="https://…"
            value={form.image ?? ""}
            onChange={(e) => set("image", e.target.value)}
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={form.kidsFriendly}
            onChange={(e) => set("kidsFriendly", e.target.checked)}
          />
          Kids friendly
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.apartmentFriendly}
            onChange={(e) => set("apartmentFriendly", e.target.checked)}
          />
          Apartment friendly
        </label>

        {error && <p className="state error full">{errorMessage(error)}</p>}

        <div className="full">
          <button className="btn" disabled={isLoading}>
            {isLoading ? "Saving…" : "Create cat"}
          </button>
        </div>
      </form>
    </>
  );
}
