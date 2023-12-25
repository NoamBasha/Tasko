import api from "../../services/apiService.js";

const COLUMNS_BASE = "columns/";

export const createColumn = async (boardId, newColumn) => {
    try {
        const response = await api.post(`${COLUMNS_BASE}${boardId}`, newColumn);
        return { createdColumn: response.data };
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};

export const updateColumn = async (boardId, newColumn) => {
    try {
        const response = await api.put(
            `${COLUMNS_BASE}${boardId}/${newColumn.id}`,
            newColumn
        );
        return { updatedColumn: response.data };
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};

export const deleteColumn = async (boardId, columnId) => {
    try {
        const response = await api.delete(
            `${COLUMNS_BASE}${boardId}/${columnId}`
        );
        return { deletedId: response.data.id };
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};

export const updateAllColumns = async (boardId, newColumns) => {
    try {
        const response = await api.put(
            `${COLUMNS_BASE}${boardId}/all`,
            newColumns
        );
        return { updatedColumns: response.data };
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};
