import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import React from "react";

const page = ()=> {
  return (
    <ProtectedRoute>
    <div className="space-y-10 py-6">
      <section className="overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-secondary/30 p-8 shadow-sm md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              New season
            </span>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Shop smarter.
              <span className="block text-primary">Live better.</span>
            </h1>
            <p className="max-w-lg text-base text-muted-foreground md:text-lg">
              Discover stylish essentials, everyday favorites, and premium pieces curated for your lifestyle.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/layout/products"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Shop now
              </Link>
              <Link
                href="/layout/products"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium transition hover:bg-muted"
              >
                Browse deals
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border bg-card p-1 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
                alt="Smart Picks"
                className="mb-2 h-37 w-full rounded-xl object-cover"
              />
              <p className="text-sm font-medium text-center">Smart Picks</p>
              <p className="text-xs text-muted-foreground text-center">Curated this week</p>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
                alt="Tech Deals"
                className="mb-3 h-28 w-full rounded-xl object-cover"
              />
              <p className="text-sm font-medium">Tech Deals</p>
              <p className="text-xs text-muted-foreground">Up to 30% off</p>
            </div>

            <div className="col-span-2 rounded-2xl border bg-card p-1 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80"
                alt="Fast and secure checkout"
                className="mb-2 h-38 w-full rounded-xl object-cover"
              />
              <p className="text-sm font-medium">Fast & secure checkout</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { title: "Free shipping", text: "On orders over $50" },
          { title: "Easy returns", text: "30-day hassle-free returns" },
          { title: "Support", text: "24/7 customer assistance" },
        ].map((feature) => (
          <div key={feature.title} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-3 h-10 w-10 rounded-full bg-primary/10" />
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
          </div>
        ))}
      </section>
    </div>
    </ProtectedRoute>
  );
}

export default page;