import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../features/auth/authSlice";
import { Outlet, Navigate } from "react-router-dom";

const RequireAuth = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default RequireAuth;
