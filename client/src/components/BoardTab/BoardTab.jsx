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
//TODO remove
import { selectColumns } from "../../features/columns/columnsSlice";

const BoardTab = ({ name, id }) => {
    const [editMode, setEditMode] = useState(false);
    const prevName = useRef(name);
    const [newName, setNewName] = useState(name);
    const dispatch = useDispatch();
    const currentBoardId = useSelector(selectCurrentBoardId);

    const handleDoubleClick = () => {
        setEditMode(true);
    };

    const handleChangeName = async () => {
        setEditMode(false);

        if (newName.trim().length === 0) {
            setNewName(prevName.current);
            return;
        }
        if (newName.localeCompare(name) === 0) return;

        const res = await dispatch(updateBoardAsync({ id, newName }));
        if (res.error?.message) {
            //TODO toastify
            console.error(res.payload);
            setNewName(prevName.current);
        } else {
            prevName.current = newName;
        }
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
        console.log(id, currentBoardId);
        if (id === currentBoardId) return;
        //TODO get board from backend, initizlize board (put it in boards?) columns and tasks with the data.
        await dispatch(getBoardAsync(id));
    };

    const deleteBoard = async (id) => {
        const res = await dispatch(deleteBoardAsync(id));
        await dispatch(getUserBoardsAsync());
        // if (res.error?.message) {
        //     //TODO toastify
        //     console.error(res.payload);
        // } else {
        //     prevName.current = newName;
        // }
    };

    const handleDelete = async () => {
        await deleteBoard(id);
    };

    return (
        <div className="board-tab-container">
            {!editMode && (
                <button
                    className="board-tab-button"
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
            <button className="board-tab-delete-button" onClick={handleDelete}>
                <TrashIcon />
            </button>
        </div>
    );
};

export default BoardTab;
