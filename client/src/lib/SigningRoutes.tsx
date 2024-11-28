import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function SigningRoutes() {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : <Outlet />;
}
