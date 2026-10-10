import { useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import {
  useGetAiAdviceMutation,
  useGetMatchesMutation,
} from "../features/api/catsApi";
import CatCard from "../components/CatCard";
import { errorMessage } from "../components/QueryState";

export default function Advisor() {
  const [kidsFriendly, setKids] = useState(true);
  const [apartmentFriendly, setApartment] = useState(true);

  const [getAdvice, advice] = useGetAiAdviceMutation();
  const [getMatches, matches] = useGetMatchesMutation();

  const busy = advice.isLoading || matches.isLoading;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const prefs = { kidsFriendly, apartmentFriendly };
    // Fire both: DB matches are instant, the Gemini write-up takes a few seconds
    getMatches(prefs);
    getAdvice(prefs);
  };

  const asked = !advice.isUninitialized || !matches.isUninitialized;

  return (
    <>
      <h1>AI Cat Advisor</h1>
      <p className="muted">
        Tell us about your home. We'll show matching cats from your collection
        and ask Gemini for a breed breakdown.
      </p>

      <form className="advisor-form" onSubmit={onSubmit}>
        <label className="check">
          <input
            type="checkbox"
            checked={kidsFriendly}
            onChange={(e) => setKids(e.target.checked)}
          />
          I have kids at home
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={apartmentFriendly}
            onChange={(e) => setApartment(e.target.checked)}
          />
          I live in an apartment
        </label>
        <button className="btn" disabled={busy}>
          {busy ? "Thinking…" : "Get recommendations"}
        </button>
      </form>

      {asked && (
        <>
          <h2>Matches in your collection</h2>
          {matches.isLoading && <p className="state">Searching…</p>}
          {matches.error && (
            <p className="state error">{errorMessage(matches.error)}</p>
          )}
          {matches.data?.length === 0 && (
            <p className="state">No saved cats match those preferences.</p>
          )}
          <div className="grid">
            {matches.data?.map((cat) => (
              <CatCard key={cat._id} cat={cat} />
            ))}
          </div>

          <h2>Gemini's breed advice</h2>
          {advice.isLoading && (
            <p className="state">Asking Gemini… this can take a few seconds.</p>
          )}
          {advice.error && (
            <p className="state error">{errorMessage(advice.error)}</p>
          )}
          {advice.data && (
            <div className="markdown">
              <ReactMarkdown>{advice.data}</ReactMarkdown>
            </div>
          )}
        </>
      )}
    </>
  );
}
