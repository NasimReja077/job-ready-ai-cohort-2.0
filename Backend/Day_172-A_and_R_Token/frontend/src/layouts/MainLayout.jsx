
import { Outlet } from "react-router";
import Nave from "../component/nave.jsx";
const MainLayout = () => {
  return (
  <div className="min-h-screen bg-slate-100 text-slate-800">
    <Nave />
    <Outlet />
  </div>
  );
};

export default MainLayout;