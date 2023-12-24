import { useDispatch, useSelector } from "react-redux";
import {
    refreshAccessToken,
    selectIsAuthenticated,
    selectToken,
    selectAuthStatus,
} from "../../features/auth/authSlice";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
    getUserDataAsync,
    selectUsersStatus,
} from "../../features/users/usersSlice";

const RequireAuth = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    console.log(isAuthenticated);

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default RequireAuth;
