import { logoutUser } from "../../features/auth/authSlice.js";
import "./UserSettings.css";
import UserSettingsIcon from "../../icons/UserSettingsIcon/UserSettingsIcon.jsx";
import { useDispatch } from "react-redux";
import { useState } from "react";

const UserSettings = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();

    const toggleDropdown = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        setIsOpen(false);
    };

    const dropdownClassName = isOpen
        ? "user-settings-dropdown-visible"
        : "user-settings-dropdown-hidden";

    // TODO Try using onBlur={toggleDropdown}?
    return (
        <div className="user-settings-container">
            <button className="user-settings-button" onClick={toggleDropdown}>
                <UserSettingsIcon />
            </button>
            <div className={dropdownClassName}>
                <a onClick={handleLogout}>Logout</a>
            </div>
        </div>
    );
};

export default UserSettings;
