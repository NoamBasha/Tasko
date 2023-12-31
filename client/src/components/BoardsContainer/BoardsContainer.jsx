import "./BoardsContainer.css";
import BoardTab from "../BoardTab/BoardTab.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
    createBoardAsync,
    getBoardAsync,
    getUserBoardsAsync,
    updateAllBoardsAsync,
    setLocalBoards,
} from "../../features/boards/boardsSlice.js";
import { selectLocalBoards } from "../../features/boards/boardsSlice.js";
import { useEffect, useState, useMemo } from "react";
import NewBoardTab from "../NewBoardTab/NewBoardTab.jsx";
import { v4 as uuidv4 } from "uuid";
import PlusIcon from "../../icons/PlusIcon/PlusIcon.jsx";

import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { closestConrnersAndCenterAndPointer } from "../../utils/dndUtils.js";

const BoardsContainer = () => {
    const dispatch = useDispatch();
    const [createMode, setCreateMode] = useState(false);
    const localBoards = useSelector(selectLocalBoards);
    const [boardsUpdateAllPromise, setBoardsUpdateAllPromise] = useState(null);
    const [activeBoard, setActiveBoard] = useState(null);
    const localBoardsIds = useMemo(
        () => localBoards.map((board) => board.id),
        [localBoards]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

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

    const updateAllBoards = async (newBoards) => {
        const promise = dispatch(updateAllBoardsAsync(newBoards));
        setBoardsUpdateAllPromise(promise);
    };

    const onDragStart = (e) => {
        if (e.active.data.current.type === "Board") {
            setActiveBoard(e.active.data.current.board);
        }
    };

    const onDragEnd = (e) => {
        setActiveBoard(null);

        if (boardsUpdateAllPromise !== null) {
            boardsUpdateAllPromise.abort();
            setBoardsUpdateAllPromise(null);
        }

        updateAllBoards(localBoards);
    };

    const onDragOver = (e) => {
        const { active, over } = e;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveBoard = active.data.current?.type === "Board";
        const isOverBoard = over.data.current?.type === "Board";

        if (isActiveBoard && isOverBoard) {
            const activeIndex = localBoards.findIndex(
                (board) => board.id === activeId
            );
            const overIndex = localBoards.findIndex(
                (board) => board.id === overId
            );

            const updatedMovedLocalBoards = arrayMove(
                [...localBoards],
                activeIndex,
                overIndex
            );

            const len = localBoards.length;

            const updatedMovedLocalBoardsWithIndexes =
                updatedMovedLocalBoards.map((board, i) => {
                    return { ...board, index: len - i - 1 };
                });

            dispatch(setLocalBoards(updatedMovedLocalBoardsWithIndexes));
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
                <DndContext
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    sensors={sensors}
                    collisionDetection={closestConrnersAndCenterAndPointer}
                >
                    <SortableContext items={localBoardsIds}>
                        {[...localBoards]
                            .sort((a, b) => b.index - a.index)
                            .map((board) => (
                                <BoardTab
                                    key={board.id}
                                    board={board}
                                    name={board.name}
                                    id={board.id}
                                    index={board.index}
                                />
                            ))}
                    </SortableContext>
                    {createPortal(
                        <DragOverlay>
                            {activeBoard && (
                                <BoardTab
                                    board={activeBoard}
                                    name={activeBoard.name}
                                    id={activeBoard.id}
                                    index={activeBoard.index}
                                />
                            )}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
            <hr className="boards-container-divider" />
        </div>
    );
};

export default BoardsContainer;
