import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../utils/localStorage";
const PublicRoute = () => {
  return !getToken() ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default PublicRoute;
