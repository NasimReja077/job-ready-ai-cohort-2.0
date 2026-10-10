import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const err = useRouteError();
  const notFound = isRouteErrorResponse(err) && err.status === 404;
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="glass-strong max-w-md rounded-3xl p-8 text-center">
        <p className="text-gradient font-display text-6xl font-extrabold">{notFound ? "404" : "Oops"}</p>
        <h1 className="mt-3 text-xl font-bold">{notFound ? "We couldn't find that page" : "Something went wrong"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{err?.statusText || err?.message || "Please try again."}</p>
        <Button asChild className="mt-6"><Link to="/">Back to dashboard</Link></Button>
      </div>
    </div>
  );
}
