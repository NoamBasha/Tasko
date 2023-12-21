import "./TaskBoard.css";
import PlusIcon from "../../icons/PlusIcon/PlusIcon.jsx";
import { useMemo, useState, useEffect } from "react";
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

import { useSelector } from "react-redux";
import {
    createColumnAsync,
    deleteColumnAsync,
    updateColumnAsync,
    updateAllColumnsAsync,
    selectColumns,
    updateTwoColumnsAsync,
} from "../../features/columns/columnsSlice.js";
import {
    selectTasks,
    createTaskAsync,
    updateTaskAsync,
    deleteTaskAsync,
    updateAllTasksAsync,
} from "../../features/tasks/tasksSlice.js";
import { selectCurrentBoardId } from "../../features/boards/boardsSlice.js";
import { useDispatch } from "react-redux";

const TaskBoard = () => {
    // TODO change "+ add column" to just a "+" and move it upwards like JIRA?
    const currentBoardId = useSelector(selectCurrentBoardId);

    const originalColumns = useSelector(selectColumns);
    const [columns, setColumns] = useState(originalColumns);

    const columnsIds = useMemo(() => columns.map((col) => col.id), [columns]);

    const originalTasks = useSelector(selectTasks);
    const [tasks, setTasks] = useState(originalTasks);

    useEffect(() => {
        setTasks(originalTasks);
    }, [originalTasks]);

    useEffect(() => {
        setColumns(originalColumns);
    }, [originalColumns]);

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
            title: `Column ${columns.length + 1}`,
            index: `${columns.length}`,
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

    const updateTwoColumns = async (firstNewColumn, secondNewColumn) => {
        await dispatch(
            updateTwoColumnsAsync({ firstNewColumn, secondNewColumn })
        );
    };

    const updateAllColumns = async (newColumns) => {
        await dispatch(updateAllColumnsAsync(newColumns));
    };

    const createTask = async (columnId) => {
        const newTask = {
            title: `Task ${tasks.length + 1}`,
            description: ``,
            columnId: columnId,
            index: tasks.length,
        };
        console.log(newTask);
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

    const updateAllTasks = async (newTasks) => {
        await dispatch(updateAllTasksAsync(newTasks));
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
        const { active, over } = e;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeColumnIndex = columns.findIndex(
            (col) => col.id === activeId
        );
        const overColumnIndex = columns.findIndex((col) => col.id === overId);

        const movedColumns = arrayMove(
            columns.slice(),
            activeColumnIndex,
            overColumnIndex
        );

        const newColumns = movedColumns.map((col, i) => {
            return { ...col, index: movedColumns[i].index };
        });

        setColumns(newColumns);
        updateAllColumns(newColumns);
        updateAllTasks(tasks);
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
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                const updatedTasks = [...tasks];

                updatedTasks[activeIndex] = {
                    ...updatedTasks[activeIndex],
                    columnId: updatedTasks[overIndex].columnId,
                };

                return arrayMove(updatedTasks, activeIndex, overIndex);
            });
        }

        const isOverColumn = over.data.current?.type === "Column";

        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);

                const updatedTasks = [...tasks];

                updatedTasks[activeIndex] = {
                    ...updatedTasks[activeIndex],
                    columnId: overId,
                };

                return updatedTasks;
            });
        }
    };

    if (currentBoardId === null || currentBoardId === undefined) {
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
                        <SortableContext items={columnsIds}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
                                    createTask={createTask}
                                    tasks={tasks.filter(
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
                        <PlusIcon />
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
                                tasks={tasks.filter(
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

// import "./TaskBoard.css";
// import PlusIcon from "../../icons/PlusIcon/PlusIcon.jsx";
// import { useMemo, useState } from "react";
// import ColumnContainer from "../ColumnContainer/ColumnContainer.jsx";
// import {
//     DndContext,
//     DragOverlay,
//     useSensors,
//     useSensor,
//     PointerSensor,
// } from "@dnd-kit/core";
// import { SortableContext, arrayMove } from "@dnd-kit/sortable";
// import { createPortal } from "react-dom";
// import TaskCard from "../TaskCard/TaskCard.jsx";
// import useLocalStorage from "../../hooks/useLocalStorage.js";
// import ScrollableDiv from "../ScrollableDiv/ScrollableDiv.jsx";

// const TaskBoard = () => {
//     // TODO change "+ add column" to just a "+" and move it upwards like JIRA?
//     const [columns, setColumns] = useLocalStorage("columns", []);
//     const columnsIds = useMemo(() => columns.map((col) => col.id), [columns]);

//     const [tasks, setTasks] = useLocalStorage("tasks", []);

//     const [activeColumn, setActiveColumn] = useState(null);
//     const [activeTask, setActiveTask] = useState(null);

//     const sensors = useSensors(
//         useSensor(PointerSensor, {
//             activationConstraint: {
//                 distance: 3,
//             },
//         })
//     );

//     function createColumn() {
//         const newColumn = {
//             id: generateId(),
//             title: `Column ${columns.length + 1}`,
//         };
//         setColumns([...columns, newColumn]);
//     }

//     function updateColumn(id, title) {
//         const newColumns = columns.map((col) => {
//             if (col.id !== id) return col;
//             return { ...col, title };
//         });
//         setColumns(newColumns);
//     }

//     function deleteColumn(columnId) {
//         const newColumns = columns.filter((col) => col.id !== columnId);
//         setColumns(newColumns);

//         const newTasks = tasks.filter((t) => t.columnId !== columnId);
//         setTasks(newTasks);
//     }

//     function createTask(columnId) {
//         const newTask = {
//             id: generateId(),
//             columnId,
//             content: `Task ${tasks.length + 1}`,
//         };

//         setTasks([...tasks, newTask]);
//     }

//     function deleteTask(taskId) {
//         const newTasks = tasks.filter((task) => task.id !== taskId);
//         setTasks(newTasks);
//     }

//     function updateTask(taskId, taskContent) {
//         const newTasks = tasks.map((task) => {
//             if (task.id === taskId) {
//                 return {
//                     ...task,
//                     content: taskContent,
//                 };
//             }
//             return task;
//         });
//         setTasks(newTasks);
//     }

//     function generateId() {
//         return Math.floor(Math.random() * 10001);
//     }

//     function onDragStart(e) {
//         if (e.active.data.current.type === "Column") {
//             setActiveColumn(e.active.data.current.column);
//             return;
//         }

//         if (e.active.data.current.type === "Task") {
//             setActiveTask(e.active.data.current.task);
//         }
//     }

//     function onDragEnd(e) {
//         setActiveColumn(null);
//         setActiveTask(null);
//         const { active, over } = e;
//         if (!over) return;

//         const activeId = active.id;
//         const overId = over.id;

//         if (activeId === overId) return;

//         setColumns((prevColumns) => {
//             const activeColumnIndex = prevColumns.findIndex(
//                 (col) => col.id === activeId
//             );
//             const overColumnIndex = prevColumns.findIndex(
//                 (col) => col.id === overId
//             );

//             return arrayMove(columns, activeColumnIndex, overColumnIndex);
//         });
//     }

//     function onDragOver(e) {
//         const { active, over } = e;
//         if (!over) return;

//         const activeId = active.id;
//         const overId = over.id;

//         if (activeId === overId) return;

//         // Dropping a task over another task

//         const isActiveTask = active.data.current?.type === "Task";
//         const isOverTask = over.data.current?.type === "Task";

//         if (!isActiveTask) return;

//         if (isActiveTask && isOverTask) {
//             setTasks((tasks) => {
//                 const activeIndex = tasks.findIndex((t) => t.id === activeId);
//                 const overIndex = tasks.findIndex((t) => t.id === overId);

//                 tasks[activeIndex].columnId = tasks[overIndex].columnId;

//                 return arrayMove(tasks, activeIndex, overIndex);
//             });
//         }

//         // Dropping a task over a column

//         const isOverColumn = over.data.current?.type === "Column";

//         if (isActiveTask && isOverColumn) {
//             setTasks((tasks) => {
//                 const activeIndex = tasks.findIndex((t) => t.id === activeId);

//                 tasks[activeIndex].columnId = overId;

//                 return arrayMove(tasks, activeIndex, activeIndex);
//             });
//         }
//     }

//     return (
//         <ScrollableDiv className="task-board-container">
//             <DndContext
//                 onDragStart={onDragStart}
//                 onDragEnd={onDragEnd}
//                 onDragOver={onDragOver}
//                 sensors={sensors}
//             >
//                 <div className="task-board-wrapper">
//                     <div className="task-board-columns">
//                         <SortableContext items={columnsIds}>
//                             {columns.map((col) => (
//                                 <ColumnContainer
//                                     key={col.id}
//                                     column={col}
//                                     deleteColumn={deleteColumn}
//                                     updateColumn={updateColumn}
//                                     createTask={createTask}
//                                     tasks={tasks.filter(
//                                         (task) => task.columnId === col.id
//                                     )}
//                                     deleteTask={deleteTask}
//                                     updateTask={updateTask}
//                                 />
//                             ))}
//                         </SortableContext>
//                     </div>
//                     <button
//                         className="task-board-button"
//                         onClick={() => {
//                             createColumn();
//                         }}
//                     >
//                         <PlusIcon />
//                         Add Column
//                     </button>
//                 </div>

//                 {createPortal(
//                     <DragOverlay>
//                         {activeColumn && (
//                             <ColumnContainer
//                                 column={activeColumn}
//                                 deleteColumn={deleteColumn}
//                                 updateColumn={updateColumn}
//                                 createTask={createTask}
//                                 deleteTask={deleteTask}
//                                 updateTask={updateTask}
//                                 tasks={tasks.filter(
//                                     (task) => task.columnId === activeColumn.id
//                                 )}
//                             />
//                         )}
//                         {activeTask && (
//                             <TaskCard
//                                 task={activeTask}
//                                 deleteTask={deleteTask}
//                                 updateTask={updateTask}
//                             />
//                         )}
//                     </DragOverlay>,
//                     document.body
//                 )}
//             </DndContext>
//         </ScrollableDiv>
//     );
// };

// export default TaskBoard;
