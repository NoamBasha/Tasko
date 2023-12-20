import "./BoardsContainer.css";
import BoardTab from "../BoardTab/BoardTab.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
    createBoardAsync,
    getUserBoardsAsync,
} from "../../features/boards/boardsSlice.js";
import { selectBoards } from "../../features/boards/boardsSlice.js";
import { useEffect, useState } from "react";
import NewBoardTab from "../NewBoardTab/NewBoardTab.jsx";

const BoardsContainer = () => {
    const [createMode, setCreateMode] = useState(false);
    const boards = useSelector(selectBoards);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getUserBoardsAsync());
    }, [boards]);

    const createBoard = async (name) => {
        try {
            //TODO toastify success? or just create the board?
            await dispatch(createBoardAsync({ name }));
        } catch (error) {
            //TODO toastify error
            console.error(error);
        }
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
                        {/* // TODO add plus icon */}
                        {/* TODO add plus icon */}+
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
                {boards.map((board) => {
                    return (
                        <BoardTab
                            key={board.id}
                            name={board.name}
                            id={board.id}
                        />
                    );
                })}
            </div>
            <hr className="boards-container-divider" />
        </div>
    );
};

export default BoardsContainer;
