import "./BoardsContainer.css";
import BoardTab from "../BoardTab/BoardTab.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
    createBoardAsync,
    getBoardAsync,
    getUserBoardsAsync,
    selectCurrentBoardId,
} from "../../features/boards/boardsSlice.js";
import {
    selectBoards,
    selectLocalBoards,
} from "../../features/boards/boardsSlice.js";
import { useEffect, useState } from "react";
import NewBoardTab from "../NewBoardTab/NewBoardTab.jsx";
import { v4 as uuidv4 } from "uuid";
import PlusIcon from "../../icons/PlusIcon/PlusIcon.jsx";

const BoardsContainer = ({ boards }) => {
    const [createMode, setCreateMode] = useState(false);
    const localBoards = useSelector(selectLocalBoards);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getUserBoardsAsync());
    }, []);

    const createBoard = async (name) => {
        const boardId = uuidv4();
        await dispatch(
            createBoardAsync({
                id: boardId,
                name,
                index:
                    localBoards.reduce((maxIndex, obj) => {
                        return obj.index > maxIndex ? obj.index : maxIndex;
                    }, -1) + 1,
            })
        );
        await dispatch(getBoardAsync(boardId));
    };

    return (
        <div className="boards-container-container">
            <div className="boards-container-header">
                <div className="boards-container-wrapper">
                    <p className="boards-container-text">Boards</p>
                    <button
                        className="boards-container-icon"
                        onClick={() => setCreateMode(true)}
                    >
                        <PlusIcon />
                    </button>
                </div>
                <hr className="boards-container-divider" />
            </div>
            <div className="boards-container-content">
                {createMode && (
                    <NewBoardTab
                        setCreateMode={setCreateMode}
                        createBoard={createBoard}
                    />
                )}
                {[...localBoards]
                    .sort((a, b) => b.index - a.index)
                    .map((board) => {
                        return (
                            <BoardTab
                                key={board.id}
                                name={board.name}
                                id={board.id}
                                index={board.index}
                            />
                        );
                    })}
            </div>
            <hr className="boards-container-divider" />
        </div>
    );
};

export default BoardsContainer;
