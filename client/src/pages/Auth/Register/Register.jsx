import "./Register.css";
import { useDispatch, useSelector } from "react-redux";
import {
    registerUserAsync,
    selectUsersStatus,
} from "../../../features/users/usersSlice.js";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../../../components/Spinner/Spinner.jsx";
import { useState } from "react";
import OpenEyeIcon from "../../../icons/OpenEyeIcon/OpenEyeIcon.jsx";
import CloseEyeIcon from "../../../icons/CloseEyeIcon/CloseEyeIcon.jsx";

const registerSchema = yup.object().shape({
    name: yup
        .string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(36, "Name must not exceed 36 characters"),
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

const Register = () => {
    const dispatch = useDispatch();
    const authStatus = useSelector(selectUsersStatus);

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
        resolver: yupResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        const res = await dispatch(registerUserAsync(data));
        if (!res.error) navigate("/login");
    };

    return (
        <div className="register-container">
            <div className="register-wrapper">
                <div className="register-content-wrapper">
                    <div className="register-form-wrapper">
                        <div className="register-title-wrapper">
                            <h1 className="register-title-header">
                                Welcome To <span>Tasko</span>
                            </h1>
                            <p className="register-title-text">
                                Please enter your details below
                            </p>
                        </div>
                        <form
                            className="register-form"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="register-form-content">
                                <div className="register-form-field">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        className="register-input"
                                        id="name"
                                        name="name"
                                        type="text"
                                        {...register("name")}
                                    />
                                    <div className="form-error">
                                        {errors?.name?.message}
                                    </div>
                                </div>
                                <div className="register-form-field">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        className="register-input"
                                        id="email"
                                        name="email"
                                        type="text"
                                        {...register("email")}
                                    />
                                    <div className="form-error">
                                        {errors?.email?.message}
                                    </div>
                                </div>
                                <div className="register-form-field">
                                    <label htmlFor="password">Password</label>
                                    <div className="register-form-password">
                                        <input
                                            className="register-input"
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
                                className="register-button"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? <Spinner /> : "Sign Up"}
                            </button>
                        </form>
                    </div>
                    <p className="register-footer">
                        Already have an account?{" "}
                        <Link
                            to={{
                                pathname: "/login",
                            }}
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
