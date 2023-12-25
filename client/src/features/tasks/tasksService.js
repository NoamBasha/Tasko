import api from "../../services/apiService.js";
import { handleApiError } from "../../utils/apiUtils.js";

const TASKS_BASE = "tasks/";

export const createTask = async (boardId, columnId, newTask) => {
    try {
        const response = await api.post(
            TASKS_BASE + `${boardId}/${columnId}`,
            newTask
        );
        return { createdTask: response.data };
    } catch (error) {
        handleApiError(error);
    }
};

export const updateTask = async (boardId, columnId, newTask) => {
    try {
        const response = await api.put(
            TASKS_BASE + `${boardId}/${columnId}/${newTask.id}`,
            newTask
        );
        return { updatedTask: response.data };
    } catch (error) {
        handleApiError(error);
    }
};

export const deleteTask = async (boardId, columnId, taskId) => {
    try {
        await api.delete(TASKS_BASE + `${boardId}/${columnId}/${taskId}`);
    } catch (error) {
        handleApiError(error);
    }
};

export const updateAllTasks = async (boardId, newTasks) => {
    try {
        const response = await api.put(TASKS_BASE + `${boardId}/all`, newTasks);
        return { updatedTasks: response.data };
    } catch (error) {
        handleApiError(error);
    }
};
