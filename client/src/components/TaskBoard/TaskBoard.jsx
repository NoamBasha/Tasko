import "./TaskBoard.css";
import PlusInCircleIcon from "../../icons/PlusInCircleIcon/PlusInCircleIcon.jsx";
import { useMemo, useState, useCallback } from "react";
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
    deleteColumnAsync,
    updateColumnAsync,
    updateAllColumnsAsync,
    selectLocalColumns,
    setLocalColumns,
} from "../../features/columns/columnsSlice.js";

import {
    createTaskAsync,
    updateTaskAsync,
    deleteTaskAsync,
    updateAllTasksAsync,
    selectLocalTasks,
    setLocalTasks,
} from "../../features/tasks/tasksSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

const DEBOUNCE_INTERVAL = 1000;

const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

const TaskBoard = ({ boardId, columns, tasks }) => {
    // TODO change "+ add column" to just a "+" and move it upwards like JIRA?

    const localColumns = useSelector(selectLocalColumns);
    const localTasks = useSelector(selectLocalTasks);

    const localColumnsIds = useMemo(
        () => localColumns.map((col) => col.id),
        [localColumns]
    );

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

    const createColumn = async () => {
        const newColumn = {
            boardId: boardId,
            title: `Column ${localColumns.length + 1}`,
            index: `${localColumns.length}`,
            id: uuidv4(),
        };
        await dispatch(createColumnAsync(newColumn));
    };

    //TODO: use debounce?
    const updateColumn = async (id, newIndex, newTitle) => {
        const newColumn = {
            id,
            index: newIndex,
            title: newTitle,
        };
        await dispatch(updateColumnAsync(newColumn));
    };

    const deleteColumn = async (columnId) => {
        await dispatch(deleteColumnAsync(columnId));
    };

    const updateAllColumns = async () => {
        await dispatch(updateAllColumnsAsync());
    };

    const debouncedUpdateAllColumns = useCallback(
        debounce(updateAllColumns, DEBOUNCE_INTERVAL),
        []
    );

    const createTask = async (columnId) => {
        const newTask = {
            title: `Task ${localTasks.length + 1}`,
            description: ``,
            columnId: columnId,
            index: localTasks.length,
            id: uuidv4(),
        };
        await dispatch(createTaskAsync({ newTask, columnId }));
    };

    //TODO: use debounce?
    const updateTask = async (
        taskId,
        title,
        description,
        columnId,
        newIndex
    ) => {
        const newTask = {
            title,
            description,
            id: taskId,
            columnId: columnId,
            index: newIndex,
        };
        await dispatch(updateTaskAsync({ newTask, columnId }));
    };

    const deleteTask = async (taskId, columnId) => {
        await dispatch(deleteTaskAsync({ taskId, columnId }));
    };

    const updateAllTasks = async () => {
        await dispatch(updateAllTasksAsync());
    };

    const debouncedUpdateAllTasks = useCallback(
        debounce(updateAllTasks, DEBOUNCE_INTERVAL),
        []
    );

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
        // Updating the tasks in the server at the end of a drag operation if they changed in the dragging
        if (JSON.stringify(localTasks) !== JSON.stringify(tasks)) {
            //TODO maybe send only those one who changed?
            debouncedUpdateAllTasks();
        }

        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = e;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeColumnIndex = localColumns.findIndex(
            (col) => col.id === activeId
        );
        const overColumnIndex = localColumns.findIndex(
            (col) => col.id === overId
        );

        const movedColumns = arrayMove(
            localColumns.slice(),
            activeColumnIndex,
            overColumnIndex
        );

        //TODO Seitch movedColumns to newColumns? (also in the if below!)
        // const newColumns = movedColumns.map((col, i) => {
        //     return { ...col, index: movedColumns[i].index };
        // });

        if (JSON.stringify(movedColumns) !== JSON.stringify(columns)) {
            //TODO should this be awaited? bacause of the use of updateAllColumns with localSolumns
            dispatch(setLocalColumns(movedColumns));

            //TODO maybe send only those one who changed?
            debouncedUpdateAllColumns();
        }
    };

    const onDragOver = (e) => {
        const { active, over } = e;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        // Dropping a task over another task
        if (isActiveTask && isOverTask) {
            const activeIndex = localTasks.findIndex((t) => t.id === activeId);
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

            dispatch(setLocalTasks(updatedMovedLocalTasks));
        }

        const isOverColumn = over.data.current?.type === "Column";

        if (isActiveTask && isOverColumn) {
            const activeIndex = localTasks.findIndex((t) => t.id === activeId);

            const updatedTasks = [...localTasks];

            updatedTasks[activeIndex] = {
                ...updatedTasks[activeIndex],
                columnId: overId,
            };

            dispatch(setLocalTasks(updatedTasks));
        }
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
            >
                <div className="task-board-wrapper">
                    <div className="task-board-columns">
                        <SortableContext items={localColumnsIds}>
                            {localColumns.map((col) => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
                                    createTask={createTask}
                                    tasks={localTasks.filter(
                                        (task) => task.columnId === col.id
                                    )}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
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
                                deleteColumn={deleteColumn}
                                updateColumn={updateColumn}
                                createTask={createTask}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                                tasks={localTasks.filter(
                                    (task) => task.columnId === activeColumn.id
                                )}
                            />
                        )}
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                            />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </ScrollableDiv>
    );
};

export default TaskBoard;
