import "./TaskBoard.css";
import PlusIcon from "../../icons/PlusIcon/PlusIcon.jsx";
import { useMemo, useState } from "react";
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
import useLocalStorage from "../../hooks/useLocalStorage.js";
import ScrollableDiv from "../ScrollableDiv/ScrollableDiv.jsx";

const TaskBoard = () => {
    const [columns, setColumns] = useLocalStorage("columns", []);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [tasks, setTasks] = useLocalStorage("tasks", []);

    const [activeColumn, setActiveColumn] = useState(null);
    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    function createNewColumn() {
        const newColumn = {
            id: generateId(),
            title: `Column ${columns.length + 1}`,
        };
        setColumns([...columns, newColumn]);
    }

    function updateColumn(id, title) {
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title };
        });
        setColumns(newColumns);
    }

    function deleteColumn(columnId) {
        const newColumns = columns.filter((col) => col.id !== columnId);
        setColumns(newColumns);

        const newTasks = tasks.filter((t) => t.columnId !== columnId);
        setTasks(newTasks);
    }

    function createTask(columnId) {
        const newTask = {
            id: generateId(),
            columnId,
            content: `Task ${tasks.length + 1}`,
        };

        setTasks([...tasks, newTask]);
    }

    function deleteTask(taskId) {
        const newTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(newTasks);
    }

    function updateTask(taskId, taskContent) {
        const newTasks = tasks.map((task) => {
            if (task.id === taskId) {
                return {
                    ...task,
                    content: taskContent,
                };
            }
            return task;
        });
        setTasks(newTasks);
    }

    function generateId() {
        return Math.floor(Math.random() * 10001);
    }

    function onDragStart(e) {
        if (e.active.data.current.type === "Column") {
            setActiveColumn(e.active.data.current.column);
            return;
        }

        if (e.active.data.current.type === "Task") {
            setActiveTask(e.active.data.current.task);
        }
    }

    function onDragEnd(e) {
        setActiveColumn(null);
        setActiveTask(null);
        const { active, over } = e;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        setColumns((prevColumns) => {
            const activeColumnIndex = prevColumns.findIndex(
                (col) => col.id === activeId
            );
            const overColumnIndex = prevColumns.findIndex(
                (col) => col.id === overId
            );

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    }

    function onDragOver(e) {
        const { active, over } = e;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Dropping a task over another task

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                tasks[activeIndex].columnId = tasks[overIndex].columnId;

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        // Dropping a task over a column

        const isOverColumn = over.data.current?.type === "Column";

        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);

                tasks[activeIndex].columnId = overId;

                return arrayMove(tasks, activeIndex, activeIndex);
            });
        }
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
                        <SortableContext items={columnsId}>
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
                            createNewColumn();
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
