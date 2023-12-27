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

function areTasksEqualIgnoringIndexes(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    const getColumnTasks = (arr) => {
        const columnTasks = new Map();
        arr.forEach((task) => {
            const columnId = task.columnId;
            if (!columnTasks.has(columnId)) {
                columnTasks.set(columnId, []);
            }
            columnTasks.get(columnId).push(task);
        });
        return columnTasks;
    };

    const columnTasks1 = getColumnTasks(arr1);
    const columnTasks2 = getColumnTasks(arr2);

    for (const [columnId, tasks1] of columnTasks1) {
        const tasks2 = columnTasks2.get(columnId);

        if (!tasks2 || tasks1.length !== tasks2.length) {
            return false;
        }

        // Sort tasks by index and compare
        const sortedTasks1 = tasks1.slice().sort((a, b) => a.index - b.index);
        const sortedTasks2 = tasks2.slice().sort((a, b) => a.index - b.index);

        for (let i = 0; i < sortedTasks1.length; i++) {
            const task1 = sortedTasks1[i];
            const task2 = sortedTasks2[i];

            // Compare all fields except for 'index'
            const fieldsToCompare = Object.keys(task1).filter(
                (field) => field !== "index"
            );

            for (const field of fieldsToCompare) {
                if (task1[field] !== task2[field]) {
                    return false;
                }
            }
        }
    }

    return true;
}

// const DEBOUNCE_INTERVAL = 0;

// const debounce = (func, delay) => {
//     let timeoutId;
//     return function (...args) {
//         clearTimeout(timeoutId);
//         timeoutId = setTimeout(() => func.apply(this, args), delay);
//     };
// };

const TaskBoard = ({ boardId, columns, tasks }) => {
    const [tasksUpdateAllPromise, setTasksUpdateAllPromise] = useState(null);
    const [columnsUpdateAllPromise, setColumnsUpdateAllPromise] =
        useState(null);

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

    const updateAllColumns = async (newColumns) => {
        const promise = dispatch(updateAllColumnsAsync(newColumns));
        setColumnsUpdateAllPromise(promise);
    };

    // const debouncedUpdateAllColumns = useCallback(
    //     debounce(
    //         (newColumns) => updateAllColumns(newColumns),
    //         DEBOUNCE_INTERVAL
    //     ),
    //     []
    // );

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

    const updateAllTasks = (newTasks) => {
        const promise = dispatch(updateAllTasksAsync(newTasks));
        setTasksUpdateAllPromise(promise);
    };

    // const debouncedUpdateAllTasks = useCallback(
    //     debounce((newTasks) => updateAllTasks(newTasks), DEBOUNCE_INTERVAL),
    //     []
    // );

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
        //! This won't work because the tasks did not change!
        //! we would like to compare localTasks and PREVOIUS localTasks!
        // const areTasksChanged = !areTasksEqualIgnoringIndexes(
        //     localTasks,
        //     tasks
        // );
        // if (areTasksChanged) {
        //     if (tasksUpdateAllPromise !== null) {
        //         tasksUpdateAllPromise.abort();
        //         setTasksUpdateAllPromise(null);
        //     }
        //     debouncedUpdateAllTasks(localTasks);
        // }

        //! Instead we just to this every time...
        if (tasksUpdateAllPromise !== null) {
            tasksUpdateAllPromise.abort();
            setTasksUpdateAllPromise(null);
        }
        //! Switch to denouce if necessary
        // debouncedUpdateAllTasks(localTasks);
        updateAllTasks(localTasks);

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

        const movedColumnsWithIndexes = movedColumns.map((column, i) => {
            return { ...column, index: i };
        });

        //! same for columns
        // if (JSON.stringify(movedColumnsWithIndexes) !== JSON.stringify(columns)) {
        //     dispatch(setLocalColumns(movedColumnsWithIndexes));
        //     debouncedUpdateAllColumns(movedColumnsWithIndexes);
        // }

        if (columnsUpdateAllPromise !== null) {
            columnsUpdateAllPromise.abort();
            setColumnsUpdateAllPromise(null);
        }

        dispatch(setLocalColumns(movedColumnsWithIndexes));
        //! Switch to denouce if necessary
        // debouncedUpdateAllColumns(movedColumnsWithIndexes);
        updateAllColumns(movedColumnsWithIndexes);
    };

    const onDragOver = (e) => {
        const { active, over } = e;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveColumn = active.data.current?.type === "Column";
        const isOverColumn = over.data.current?.type === "Column";

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (isActiveColumn && isOverColumn) {
            const activeIndex = localColumns.findIndex(
                (c) => c.id === activeId
            );
            const overIndex = localColumns.findIndex((c) => c.id === overId);

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

            const updatedMovedLocalTasksWithIndexes =
                updatedMovedLocalTasks.map((task, i) => {
                    return { ...task, index: i };
                });

            dispatch(setLocalTasks(updatedMovedLocalTasksWithIndexes));
        }

        if (isActiveTask && isOverColumn) {
            const activeIndex = localTasks.findIndex((t) => t.id === activeId);

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
                            {[...localColumns]
                                .sort((a, b) => a.index - b.index)
                                .map((col) => (
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
