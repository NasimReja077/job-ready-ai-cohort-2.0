import { Link } from "react-router";

const Nave = () => {
  return (
    <div>
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/home" className="text-xl font-bold tracking-tight text-slate-900">
            ShopCart
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/home" className="transition hover:text-slate-900">
              Home
            </Link>
            <Link to="/home" className="transition hover:text-slate-900">
              Products
            </Link>
            <Link to="/home" className="transition hover:text-slate-900">
              About
            </Link>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Nave;
