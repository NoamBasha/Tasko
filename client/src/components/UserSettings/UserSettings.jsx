import { clearToken, logoutAsync } from "../../features/auth/authSlice.js";
import "./UserSettings.css";
import UserSettingsIcon from "../../icons/UserSettingsIcon/UserSettingsIcon.jsx";
import { useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { resetUserState } from "../../features/users/usersSlice.js";
import LogoutIcon from "../../icons/LogoutIcon/LogoutIcon.jsx";

const UserSettings = () => {
    const dispatch = useDispatch();

    const handleLogout = async () => {
        await dispatch(logoutAsync());
    };

    return (
        <div className="user-settings-container">
            <button className="user-settings-button" onClick={handleLogout}>
                <LogoutIcon />
            </button>
        </div>
    );
};

export default UserSettings;
