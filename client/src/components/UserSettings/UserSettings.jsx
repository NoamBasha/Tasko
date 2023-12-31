import "./UserSettings.css";
import { logoutAsync } from "../../features/auth/authSlice.js";
import { useDispatch } from "react-redux";
import LogoutIcon from "../../icons/LogoutIcon/LogoutIcon.jsx";
import LightModeIcon from "../../icons/LightModeIcon/LightModeIcon.jsx";
import DarkModeIcon from "../../icons/DarkModeIcon/DarkModeIcon.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const UserSettings = () => {
    const { theme, toggleTheme } = useTheme();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        await dispatch(logoutAsync());
    };

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
