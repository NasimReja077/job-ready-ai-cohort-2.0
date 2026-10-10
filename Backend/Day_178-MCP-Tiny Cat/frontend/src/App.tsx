import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CatDetail from "./pages/CatDetail";
import AddCat from "./pages/AddCat";
import Advisor from "./pages/Advisor";
import Favorites from "./pages/Favorites";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cats/:id" element={<CatDetail />} />
          <Route path="/add" element={<AddCat />} />
          <Route path="/advisor" element={<Advisor />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={<p className="state">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
