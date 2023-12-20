import "./Login.css";
import { useDispatch, useSelector } from "react-redux";
import {
    loginUserAsync,
    selectAuthStatus,
} from "../../../features/auth/authSlice.js";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../../../components/Spinner/Spinner.jsx";
import { useState } from "react";
import OpenEyeIcon from "../../../icons/OpenEyeIcon/OpenEyeIcon.jsx";
import CloseEyeIcon from "../../../icons/CloseEyeIcon/CloseEyeIcon.jsx";

const loginSchema = yup.object().shape({
    email: yup
        .string()
        .required("Email is required")
        .email("Invalid email format")
        .max(36, "Email must not exceed 36 characters"),
    password: yup
        .string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password must not exceed 20 characters"),
});

const Login = () => {
    const dispatch = useDispatch();
    const authStatus = useSelector(selectAuthStatus);

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const isLoading = authStatus === "pending";

    const handleToggleVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        const res = await dispatch(loginUserAsync(data));
        if (res.error?.message) {
            toast.error(res.payload);
        } else {
            navigate("/");
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-content-wrapper">
                    <div className="login-form-wrapper">
                        <div className="login-title-wrapper">
                            <h1 className="login-title-header">
                                Welcome To <span>Tasko</span>
                            </h1>
                            <p className="login-title-text">
                                Please enter your details below
                            </p>
                        </div>
                        <form
                            className="login-form"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="login-form-content">
                                <div className="login-form-field">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        className="login-input"
                                        id="email"
                                        name="email"
                                        type="text"
                                        {...register("email")}
                                    />
                                    <div className="form-error">
                                        {errors?.email?.message}
                                    </div>
                                </div>
                                <div className="login-form-field">
                                    <label htmlFor="password">Password</label>
                                    <div className="login-form-password">
                                        <input
                                            className="login-input"
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            {...register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleToggleVisibility}
                                        >
                                            {showPassword ? (
                                                <OpenEyeIcon />
                                            ) : (
                                                <CloseEyeIcon />
                                            )}
                                        </button>
                                    </div>
                                    <div className="form-error">
                                        {errors?.password?.message}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="login-button"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? <Spinner /> : "Log In"}
                            </button>
                        </form>
                    </div>
                    <p className="login-footer">
                        Don't have an account?{" "}
                        <Link
                            to={{
                                pathname: "/register",
                            }}
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
