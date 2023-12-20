import { logoutUser } from "../../features/auth/authSlice.js";
import "./UserSettings.css";
import UserSettingsIcon from "../../icons/UserSettingsIcon/UserSettingsIcon.jsx";
import { useDispatch } from "react-redux";

const UserSettings = () => {
    const dispatch = useDispatch();

    return (
        <div className="user-settings-container">
            <button className="user-settings-button">
                <UserSettingsIcon />
            </button>
            <div class="user-settings-dropdown-content">
                <a onClick={() => dispatch(logoutUser())}>Logout</a>
            </div>
        </div>
    );
};

export default UserSettings;
