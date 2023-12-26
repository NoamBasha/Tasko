import { clearToken, logoutAsync } from "../../features/auth/authSlice.js";
import "./UserSettings.css";
import UserSettingsIcon from "../../icons/UserSettingsIcon/UserSettingsIcon.jsx";
import { useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { resetUserState } from "../../features/users/usersSlice.js";
import LogoutIcon from "../../icons/LogoutIcon/LogoutIcon.jsx";
import LightModeIcon from "../../icons/LightModeIcon/LightModeIcon.jsx";
import DarkModeIcon from "../../icons/DarkModeIcon/DarkModeIcon.jsx";

const UserSettings = () => {
    const dispatch = useDispatch();
    const [theme, setTheme] = useState(
        window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
    );

    const handleLogout = async () => {
        await dispatch(logoutAsync());
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <div className="user-settings-container">
            <button className="user-settings-button" onClick={toggleTheme}>
                {theme === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
            </button>
            <button className="user-settings-button" onClick={handleLogout}>
                <LogoutIcon />
            </button>
        </div>
    );
};

export default UserSettings;
