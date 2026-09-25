import Link from "next/link";
import React from "react";

const page = async ({ params }) => {
  const { id } = await params;
  const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
    cache: "no-store",
  });
  const product = await res.json();

  if (!product || product?.message === "Not Found") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link href="/layout/products" className="mt-4 inline-block text-sm font-medium text-primary">
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-10">
      <Link href="/layout/products" className="mb-6 inline-block text-sm font-medium text-primary">
        ← Back to products
      </Link>

      <div className="grid gap-8 rounded-3xl border bg-card p-6 shadow-sm md:grid-cols-2 md:p-8">
        <div className="flex items-center justify-center rounded-2xl bg-muted p-6">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-[420px] w-full object-contain"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="mb-3 inline-flex w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {product.category}
          </span>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-700">
              ⭐ {product.rating?.rate ?? 0}
            </span>
            <span>{product.rating?.count ?? 0} reviews</span>
          </div>

          <p className="mt-6 text-3xl font-bold text-foreground">
            ${product.price}
          </p>

          <p className="mt-6 text-base leading-7 text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8 flex gap-3">
            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              Add to cart
            </button>
            <button className="rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium transition hover:bg-muted">
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;