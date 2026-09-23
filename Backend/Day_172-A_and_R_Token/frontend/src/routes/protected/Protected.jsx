import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

const Protected = () => {
     const { user, isLoading } = useSelector((store) => store.auth);
     if (isLoading) return <h1>Loading....</h1>;
     if (!user) return <Navigate to={"/"} />;
     return <Outlet />;
};

export default Protected;
