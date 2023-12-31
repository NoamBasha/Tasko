import "./TaskBoard.css";
import PlusInCircleIcon from "../../icons/PlusInCircleIcon/PlusInCircleIcon.jsx";
import { useMemo, useState, startTransition } from "react";
import ColumnContainer from "../ColumnContainer/ColumnContainer.jsx";
import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "../TaskCard/TaskCard.jsx";
import ScrollableDiv from "../ScrollableDiv/ScrollableDiv.jsx";

import {
    createColumnAsync,
    updateAllColumnsAsync,
    selectLocalColumns,
    setLocalColumns,
} from "../../features/columns/columnsSlice.js";

import {
    createTaskAsync,
    updateAllTasksAsync,
    selectLocalTasks,
    setLocalTasks,
} from "../../features/tasks/tasksSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { closestConrnersAndCenterAndPointer } from "../../utils/dndUtils.js";

const TaskBoard = ({ boardId }) => {
    const localColumns = useSelector(selectLocalColumns);
    const localTasks = useSelector(selectLocalTasks);

    const localColumnsIds = useMemo(
        () => localColumns.map((col) => col.id),
        [localColumns]
    );

    const [tasksUpdateAllPromise, setTasksUpdateAllPromise] = useState(null);
    const [columnsUpdateAllPromise, setColumnsUpdateAllPromise] =
        useState(null);

    const [newestTaskId, setNewestTaskId] = useState(null);
    const [newestColumnId, setNewestColumnId] = useState(null);

    const [activeColumn, setActiveColumn] = useState(null);
    const [activeTask, setActiveTask] = useState(null);

    const dispatch = useDispatch();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    const resetNewestColumnId = () => {
        setNewestColumnId(null);
    };

    const createColumn = async () => {
        const newColumnId = uuidv4();
        const newColumn = {
            boardId: boardId,
            title: `Column ${localColumns.length + 1}`,
            index:
                localColumns.reduce((maxIndex, obj) => {
                    return obj.index > maxIndex ? obj.index : maxIndex;
                }, -1) + 1,
            id: newColumnId,
        };
        setNewestColumnId(newColumnId);
        await dispatch(createColumnAsync(newColumn));
    };

    const updateAllColumns = async (newColumns) => {
        const promise = dispatch(updateAllColumnsAsync(newColumns));
        setColumnsUpdateAllPromise(promise);
    };

    const resetNewestTaskId = () => {
        setNewestTaskId(null);
    };

    const createTask = async (columnId) => {
        const newTaskId = uuidv4();
        const newTask = {
            title: `Task ${localTasks.length + 1}`,
            description: ``,
            columnId: columnId,
            index:
                localTasks.reduce((maxIndex, obj) => {
                    return obj.index > maxIndex ? obj.index : maxIndex;
                }, -1) + 1,
            id: newTaskId,
        };
        setNewestTaskId(newTaskId);
        await dispatch(createTaskAsync({ newTask, columnId }));
    };

    const updateAllTasks = (newTasks) => {
        const promise = dispatch(updateAllTasksAsync(newTasks));
        setTasksUpdateAllPromise(promise);
    };

    const onDragStart = (e) => {
        if (e.active.data.current.type === "Column") {
            setActiveColumn(e.active.data.current.column);
            return;
        }

        if (e.active.data.current.type === "Task") {
            setActiveTask(e.active.data.current.task);
        }
    };

    const onDragEnd = (e) => {
        setActiveColumn(null);
        setActiveTask(null);

        if (tasksUpdateAllPromise !== null) {
            tasksUpdateAllPromise.abort();
            setTasksUpdateAllPromise(null);
        }
        updateAllTasks(localTasks);

        if (columnsUpdateAllPromise !== null) {
            columnsUpdateAllPromise.abort();
            setColumnsUpdateAllPromise(null);
        }

        updateAllColumns(localColumns);
    };

    const onDragOver = (e) => {
        // TODO: Check Preformence
        const { active, over } = e;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        startTransition(() => {
            if (activeId === overId) return;

            const isActiveColumn = active.data.current?.type === "Column";
            const isOverColumn = over.data.current?.type === "Column";

            const isActiveTask = active.data.current?.type === "Task";
            const isOverTask = over.data.current?.type === "Task";

            if (isActiveColumn && isOverColumn) {
                const activeIndex = localColumns.findIndex(
                    (c) => c.id === activeId
                );
                const overIndex = localColumns.findIndex(
                    (c) => c.id === overId
                );

                const updatedMovedLocalColumns = arrayMove(
                    [...localColumns],
                    activeIndex,
                    overIndex
                );

                const updatedMovedLocalColumnsWithIndexes =
                    updatedMovedLocalColumns.map((column, i) => {
                        return { ...column, index: i };
                    });

                dispatch(setLocalColumns(updatedMovedLocalColumnsWithIndexes));
            }

            if (isActiveColumn && isOverTask) {
                const activeIndex = localColumns.findIndex(
                    (c) => c.id === activeId
                );

                const updatedColumns = [...localColumns];

                updatedColumns[activeIndex] = {
                    ...updatedColumns[activeIndex],
                    columnId: overId,
                };

                const updatedColumnsWithIndexes = updatedColumns.map(
                    (column, i) => {
                        return { ...column, index: i };
                    }
                );

                dispatch(setLocalColumns(updatedColumnsWithIndexes));
            }

            if (isActiveTask && isOverTask) {
                const activeIndex = localTasks.findIndex(
                    (t) => t.id === activeId
                );
                const overIndex = localTasks.findIndex((t) => t.id === overId);

                const updatedTasks = [...localTasks];

                updatedTasks[activeIndex] = {
                    ...updatedTasks[activeIndex],
                    columnId: updatedTasks[overIndex].columnId,
                };

                const updatedMovedLocalTasks = arrayMove(
                    updatedTasks,
                    activeIndex,
                    overIndex
                );

                const updatedMovedLocalTasksWithIndexes =
                    updatedMovedLocalTasks.map((task, i) => {
                        return { ...task, index: i };
                    });

                dispatch(setLocalTasks(updatedMovedLocalTasksWithIndexes));
            }

            if (isActiveTask && isOverColumn) {
                const activeIndex = localTasks.findIndex(
                    (t) => t.id === activeId
                );

                const updatedTasks = [...localTasks];

                updatedTasks[activeIndex] = {
                    ...updatedTasks[activeIndex],
                    columnId: overId,
                };

                const updatedTasksWithIndexes = updatedTasks.map((task, i) => {
                    return { ...task, index: i };
                });

                dispatch(setLocalTasks(updatedTasksWithIndexes));
            }
        });
    };

    if (boardId === null || boardId === undefined) {
        return <div className="task-board-container"></div>;
    }

    return (
        <ScrollableDiv className="task-board-container">
            <DndContext
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                sensors={sensors}
                collisionDetection={closestConrnersAndCenterAndPointer}
            >
                <div className="task-board-wrapper">
                    <div className="task-board-columns">
                        <SortableContext items={localColumnsIds}>
                            {[...localColumns]
                                .sort((a, b) => a.index - b.index)
                                .map((col) => (
                                    <ColumnContainer
                                        key={col.id}
                                        column={col}
                                        createTask={createTask}
                                        tasks={localTasks.filter(
                                            (task) => task.columnId === col.id
                                        )}
                                        initialColumnEditMode={
                                            newestColumnId === col.id
                                        }
                                        resetNewestColumnId={
                                            resetNewestColumnId
                                        }
                                        newestTaskId={newestTaskId}
                                        resetNewestTaskId={resetNewestTaskId}
                                    />
                                ))}
                        </SortableContext>
                    </div>
                    <button
                        className="task-board-button"
                        onClick={() => {
                            createColumn();
                        }}
                    >
                        <PlusInCircleIcon />
                        Add Column
                    </button>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <ColumnContainer
                                column={activeColumn}
                                createTask={createTask}
                                tasks={localTasks.filter(
                                    (task) => task.columnId === activeColumn.id
                                )}
                                newestTaskId={newestTaskId}
                                resetNewestTaskId={resetNewestTaskId}
                                resetNewestColumnId={resetNewestColumnId}
                            />
                        )}
                        {activeTask && <TaskCard task={activeTask} />}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </ScrollableDiv>
    );
};

export default TaskBoard;
