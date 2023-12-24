import { useState } from "react";
import "./NewBoardTab.css";
import { useDispatch } from "react-redux";

const NewBoardTab = ({ setCreateMode, createBoard }) => {
    const [name, setName] = useState("");

    const dispatch = useDispatch();

    const handleCreateBoard = async () => {
        setCreateMode(false);
        if (name.trim().length === 0) return;
        createBoard(name);
    };

    const handleBlur = async () => {
        handleCreateBoard();
    };

    const handleChange = (e) => {
        setName(e.target.value);
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            handleCreateBoard();
        }
    };
    //TODO: remove class name? add its own style ?
    return (
        <div className="board-tab-container">
            <input
                className="board-tab-name-input"
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                value={name}
                autoFocus
            />
        </div>
    );
};

export default NewBoardTab;
