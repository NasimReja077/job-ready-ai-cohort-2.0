import { NavLink } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function Navbar() {
  const favCount = useAppSelector((s) => s.favorites.ids.length);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          🐱 Tiny Cats
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end>
            Browse
          </NavLink>
          <NavLink to="/advisor">AI Advisor</NavLink>
          <NavLink to="/favorites">
            Favorites{favCount > 0 && <span className="badge">{favCount}</span>}
          </NavLink>
          <NavLink to="/add" className="btn btn-small">
            + Add cat
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
