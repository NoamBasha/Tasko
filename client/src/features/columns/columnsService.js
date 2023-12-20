const COLUMNS_API = "http://localhost:3000/api/v1/columns/";

export const createColumn = async (token, boardId, newColumn) => {
    try {
        const config = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newColumn),
        };
        console.log(token, boardId, newColumn);

        const response = await fetch(COLUMNS_API + `${boardId}`, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const createdColumn = await response.json();
        return { createdColumn };
    } catch (error) {
        throw error;
    }
};

export const updateColumn = async (token, boardId, newColumn) => {
    try {
        const config = {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newColumn),
        };

        const response = await fetch(
            COLUMNS_API + `${boardId}/${newColumn.id}`,
            config
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const updatedColumn = await response.json();
        return { updatedColumn };
    } catch (error) {
        throw error;
    }
};

export const deleteColumn = async (token, boardId, columnId) => {
    try {
        const config = {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: columnId }),
        };

        const response = await fetch(
            COLUMNS_API + `${boardId}/${columnId}`,
            config
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const deletedId = await response.json();
        return { deletedId: deletedId.id };
    } catch (error) {
        throw error;
    }
};
