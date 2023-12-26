import api from "../../services/apiService.js";
import { handleApiError } from "../../utils/apiUtils.js";

const COLUMNS_BASE = "columns/";

export const createColumn = async (boardId, newColumn) => {
    try {
        const response = await api.post(`${COLUMNS_BASE}${boardId}`, newColumn);
        return { createdColumn: response.data };
    } catch (error) {
        handleApiError(error);
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
        handleApiError(error);
    }
};

export const deleteColumn = async (boardId, columnId) => {
    try {
        await api.delete(`${COLUMNS_BASE}${boardId}/${columnId}`);
    } catch (error) {
        handleApiError(error);
    }
};

export const updateAllColumns = async (boardId, newColumns, signal) => {
    try {
        const response = await api.put(
            `${COLUMNS_BASE}${boardId}/all`,
            newColumns,
            {
                signal: signal,
            }
        );
        return { updatedColumns: response.data };
    } catch (error) {
        handleApiError(error);
    }
};
