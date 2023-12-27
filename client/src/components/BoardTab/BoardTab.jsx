import React, { useRef } from "react";
import "./BoardTab.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectCurrentBoardId,
    updateBoardAsync,
    deleteBoardAsync,
    getBoardAsync,
    getUserBoardsAsync,
} from "../../features/boards/boardsSlice";
import TrashIcon from "../../icons/TrashIcon/TrashIcon";

const BoardTab = ({ name, id, index }) => {
    const [editMode, setEditMode] = useState(false);
    // const prevName = useRef(name);
    const [newName, setNewName] = useState(name);
    const dispatch = useDispatch();
    const currentBoardId = useSelector(selectCurrentBoardId);
    const boardTabButtonClass =
        currentBoardId === id
            ? "board-tab-button board-tab-button-active"
            : "board-tab-button";

    const handleDoubleClick = () => {
        setEditMode(true);
    };

    const handleChangeName = async () => {
        setEditMode(false);
        if (newName === name || newName.localeCompare(name) === 0) return;
        await dispatch(updateBoardAsync({ id, newName, newIndex: index }));
    };

    const handleBlur = async () => {
        handleChangeName();
    };

    const handleChange = (e) => {
        setNewName(e.target.value);
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            handleChangeName();
        }
    };

    const handleClick = async () => {
        if (id === currentBoardId) return;
        await dispatch(getBoardAsync(id));
    };

    const deleteBoard = async () => {
        await dispatch(deleteBoardAsync(id));
    };

    return (
        <div className="board-tab-container">
            {!editMode && (
                <button
                    className={boardTabButtonClass}
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
                >
                    {newName}
                </button>
            )}
            {editMode && (
                <input
                    className="board-tab-name-input"
                    autoFocus
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                    value={newName}
                />
            )}
            <button className="board-tab-delete-button" onClick={deleteBoard}>
                <TrashIcon />
            </button>
        </div>
    );
};

export default BoardTab;
