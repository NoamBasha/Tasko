import "./ColumnContainer.css";
import TrashIcon from "../../icons/TrashIcon/TrashIcon.jsx";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useMemo } from "react";
import PlusInCircleIcon from "../../icons/PlusInCircleIcon/PlusInCircleIcon.jsx";
import TaskCard from "../TaskCard/TaskCard.jsx";
import { toast } from "react-toastify";

const ColumnContainer = ({
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
    initialColumnEditMode,
    resetNewestColumnId,
    newestTaskId,
    resetNewestTaskId,
}) => {
    const [editMode, setEditMode] = useState(initialColumnEditMode);
    const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

    const [newTitle, setNewTitle] = useState(column.title);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="column-container-container column-container-placeholder"
            />
        );
    }

    const handleUpdateColumn = async () => {
        setEditMode(false);
        if (newTitle === column.title || newTitle.trim() === "") return;
        updateColumn(column.id, column.index, newTitle.trim());
    };

    return (
        <div
            className="column-container-container"
            ref={setNodeRef}
            style={style}
        >
            <div
                className="column-container-header"
                onClick={() => {
                    setEditMode(true);
                }}
                {...attributes}
                {...listeners}
            >
                <div className="column-container-title">
                    <div className="column-container-title-wrapper">
                        <div className="column-container-title-counter">
                            {tasks.length}
                        </div>
                        {!editMode && column.title}
                        {editMode && (
                            <input
                                className="column-container-title-input"
                                autoFocus
                                onBlur={() => {
                                    handleUpdateColumn();
                                    resetNewestColumnId();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key !== "Enter") return;
                                    handleUpdateColumn();
                                }}
                                onChange={(e) => {
                                    setNewTitle(e.target.value);
                                }}
                                value={newTitle}
                            />
                        )}
                    </div>
                    <button
                        className="column-container-delete-button"
                        onClick={() => {
                            deleteColumn(column.id);
                        }}
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
            <div className="column-container-content">
                <SortableContext items={tasksIds}>
                    {tasks
                        .sort((a, b) => a.index - b.index)
                        .map((task) => {
                            return (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                    columnId={column.id}
                                    initialEditMode={task.id === newestTaskId}
                                    resetNewestTaskId={resetNewestTaskId}
                                />
                            );
                        })}
                </SortableContext>
            </div>
            <div className="column-container-footer">
                <button
                    className="column-container-plus-button"
                    onClick={() => {
                        createTask(column.id);
                    }}
                >
                    <PlusInCircleIcon />
                    <p>Add Task</p>
                </button>
            </div>
        </div>
    );
};

export default ColumnContainer;
