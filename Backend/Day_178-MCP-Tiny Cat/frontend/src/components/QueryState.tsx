interface Props {
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  emptyText?: string;
}

// Pulls a readable message out of RTK Query's error shapes
export const errorMessage = (err: unknown): string => {
  if (err && typeof err === "object") {
    const e = err as { status?: unknown; data?: { message?: string }; error?: string };
    if (e.status === "FETCH_ERROR")
      return "Can't reach the backend. Is it running on port 5000?";
    if (e.data?.message) return e.data.message;
    if (e.error) return e.error;
    if (e.status) return `Request failed (${String(e.status)})`;
  }
  return "Something went wrong.";
};

export default function QueryState({ loading, error, empty, emptyText }: Props) {
  if (loading) return <p className="state">Loading…</p>;
  if (error) return <p className="state error">{errorMessage(error)}</p>;
  if (empty) return <p className="state">{emptyText ?? "Nothing here yet."}</p>;
  return null;
}
