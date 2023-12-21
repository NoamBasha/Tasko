const TASKS_API = "http://localhost:3000/api/v1/tasks/";

export const createTask = async (token, boardId, columnId, newTask) => {
    try {
        const config = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        };

        const response = await fetch(
            TASKS_API + `${boardId}/${columnId}`,
            config
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const createdTask = await response.json();

        return { createdTask };
    } catch (error) {
        throw error;
    }
};

export const updateTask = async (token, boardId, columnId, newTask) => {
    try {
        const config = {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        };

        const response = await fetch(
            TASKS_API + `${boardId}/${columnId}/${newTask.id}`,
            config
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const updatedTask = await response.json();

        return { updatedTask };
    } catch (error) {
        throw error;
    }
};

export const deleteTask = async (token, boardId, columnId, taskId) => {
    try {
        const config = {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: taskId }),
        };

        const response = await fetch(
            TASKS_API + `${boardId}/${columnId}/${taskId}`,
            config
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }
    } catch (error) {
        throw error;
    }
};
