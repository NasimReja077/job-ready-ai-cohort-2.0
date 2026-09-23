import React, { useEffect, useState } from "react";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://fakestoreapi.com/products");
        const data = await response.json();
        setProducts(data.slice(0, 8));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-rose-500">
              Trending now
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Featured Products</h1>
          </div>
          <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700">
            View all
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-slate-200 shadow-sm"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-56 items-center justify-center bg-slate-50 p-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                      {product.category}
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      ${product.price}
                    </span>
                  </div>

                  <h2 className="line-clamp-2 text-base font-semibold text-slate-800">
                    {product.title}
                  </h2>

                  <p className="line-clamp-3 text-sm text-slate-600">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-amber-500">
                      ★ {product.rating?.rate}
                    </span>
                    <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;