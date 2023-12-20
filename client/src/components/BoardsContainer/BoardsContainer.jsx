import "./BoardsContainer.css";
import BoardTab from "../BoardTab/BoardTab.jsx";
import { useDispatch, useSelector } from "react-redux";

const BoardsContainer = () => {
    return (
        <div className="boards-container-container">
            <div className="boards-container-header">
                <div className="boards-container-wrapper">
                    <p className="boards-container-text">Boards</p>
                    <button
                        className="boards-container-icon"
                        onClick={() => useDispatch()}
                    >
                        {/* // TODO add plus icon */}
                        {/* TODO add plus icon */}+
                    </button>
                </div>
                <hr className="boards-container-divider" />
            </div>
            <div className="boards-container-content">
                <BoardTab title={"Lets Do It"} />
                <BoardTab title={"Lprem Ipsum"} />
                <BoardTab title={"Another Project"} />
                <BoardTab title={"Cool One"} />
                <BoardTab title={"Lets Do It"} />
            </div>
            <hr className="boards-container-divider" />
        </div>
    );
};

export default BoardsContainer;
