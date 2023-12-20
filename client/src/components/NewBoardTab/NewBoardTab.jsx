import { useState } from "react";
import "./NewBoardTab.css";
import { useDispatch } from "react-redux";

const NewBoardTab = ({ setCreateMode, createBoard }) => {
    const [name, setName] = useState("");

    const dispatch = useDispatch();

    const handleChangeName = async () => {
        if (name.trim().length === 0) return;
        await createBoard(name);
        setCreateMode(false);
    };

    const handleBlur = async () => {
        handleChangeName();
    };

    const handleChange = (e) => {
        setName(e.target.value);
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            handleChangeName();
        }
    };

    //TODO: remove class name? add its own style ?
    return (
        <div>
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
