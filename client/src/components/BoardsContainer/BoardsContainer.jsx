import "./BoardsContainer.css";
import BoardTab from "../BoardTab/BoardTab.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
    createBoardAsync,
    getUserBoardsAsync,
} from "../../features/boards/boardsSlice.js";
import { selectBoards } from "../../features/boards/boardsSlice.js";
import { useEffect } from "react";

const BoardsContainer = () => {
    const boards = useSelector(selectBoards);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getUserBoardsAsync());
    }, []);

    const createBoard = async () => {
        const rand = Math.floor(Math.random() * 10000);
        try {
            //TODO toastify success? or just create the board?
            await dispatch(createBoardAsync({ name: `Board ${rand}` }));
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
                        onClick={createBoard}
                    >
                        {/* // TODO add plus icon */}
                        {/* TODO add plus icon */}+
                    </button>
                </div>
                <hr className="boards-container-divider" />
            </div>
            <div className="boards-container-content">
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
