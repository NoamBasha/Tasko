import { clearToken, logoutAsync } from "../../features/auth/authSlice.js";
import "./UserSettings.css";
import UserSettingsIcon from "../../icons/UserSettingsIcon/UserSettingsIcon.jsx";
import { useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { resetUserState } from "../../features/users/usersSlice.js";

const UserSettings = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);

    const toggleDropdown = (e) => {
        if (isOpen && !dropdownRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener("click", toggleDropdown);
        return () => window.removeEventListener("click", toggleDropdown);
    }, [dropdownRef, toggleDropdown]);

    const handleLogout = async () => {
        await dispatch(logoutAsync());
        setIsOpen(false);
    };

    const dropdownClassName = isOpen
        ? "user-settings-dropdown-visible"
        : "user-settings-dropdown-hidden";

    return (
        <div className="user-settings-container">
            <button
                className="user-settings-button"
                onClick={() => setIsOpen(true)}
                ref={dropdownRef}
            >
                <UserSettingsIcon />
            </button>
            <div className={dropdownClassName}>
                <a onClick={handleLogout}>Logout</a>
            </div>
        </div>
    );
};

export default UserSettings;
