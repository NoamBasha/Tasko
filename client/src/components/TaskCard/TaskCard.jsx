import "./TaskCard.css";
import TrashIcon from "../../icons/TrashIcon/TrashIcon.jsx";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
    updateTaskAsync,
    deleteTaskAsync,
} from "../../features/tasks/tasksSlice.js";

import { useDispatch } from "react-redux";

const TaskCard = ({ task, columnId, initialEditMode, resetNewestTaskId }) => {
    const [editMode, setEditMode] = useState(initialEditMode);
    const [description, setDescription] = useState(task.description);

    const dispatch = useDispatch();

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

    function toggleEditMode() {
        setEditMode((prevEditMode) => !prevEditMode);
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
                    value={description}
                    autoFocus
                    placeholder="Task content"
                    onBlur={() => {
                        toggleEditMode();
                        resetNewestTaskId();
                        if (description !== task.description) {
                            updateTask(
                                task.id,
                                task.title,
                                description,
                                columnId,
                                task.index
                            );
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey) {
                            toggleEditMode();
                            if (description !== task.description) {
                                updateTask(
                                    task.id,
                                    task.title,
                                    description,
                                    columnId,
                                    task.index
                                );
                            }
                        }
                    }}
                    onChange={(e) => {
                        setDescription(e.target.value);
                    }}
                    onFocus={(e) =>
                        e.currentTarget.setSelectionRange(
                            e.currentTarget.value.length,
                            e.currentTarget.value.length
                        )
                    }
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
            onClick={toggleEditMode}
        >
            <p className="task-card-content">{task.description}</p>
            <button
                className="task-card-delete-button"
                onClick={() => {
                    deleteTask(task.id, task.columnId);
                }}
            >
                <TrashIcon />
            </button>
        </div>
    );
};

export default TaskCard;
