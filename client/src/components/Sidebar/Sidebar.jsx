import "./Sidebar.css";
import BoardsContainer from "../BoardsContainer/BoardsContainer.jsx";
import UserSettings from "../UserSettings/UserSettings.jsx";

const Sidebar = () => {
    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <p>Alice Alicia</p>
                <UserSettings />
            </div>
            <BoardsContainer />
            <div className="sidebar-footer">Tasko</div>
        </div>
    );
};

export default Sidebar;
