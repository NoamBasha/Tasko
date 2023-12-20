import "./TaskCard.css";
import TrashIcon from "../../icons/TrashIcon/TrashIcon.jsx";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TaskCard = ({ task, deleteTask, updateTask }) => {
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(false);

    function toggleEditMode() {
        setEditMode((prevEditMode) => !prevEditMode);
        setMouseIsOver(false);
    }

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
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
                className="task-card-container task-card-container-placeholder"
            ></div>
        );
    }

    if (editMode) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="task-card-container"
            >
                <textarea
                    className="task-card-textarea"
                    value={task.content}
                    autoFocus
                    placeholder="Task content"
                    onBlur={toggleEditMode}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey) toggleEditMode();
                    }}
                    onChange={(e) => updateTask(task.id, e.target.value)}
                />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="task-card-container"
            onMouseEnter={() => {
                setMouseIsOver(true);
            }}
            onMouseLeave={() => {
                setMouseIsOver(false);
            }}
            onClick={toggleEditMode}
        >
            <p className="task-card-content">{task.content}</p>
            {mouseIsOver && (
                <button
                    className="task-card-delete-button"
                    onClick={() => {
                        deleteTask(task.id);
                    }}
                >
                    <TrashIcon />
                </button>
            )}
        </div>
    );
};

export default TaskCard;
