import api from "../../services/apiService.js";

const BOARDS_BASE = "boards/";

export const getUserBoards = async () => {
    try {
        const response = await api.get(BOARDS_BASE);
        return { boardsNames: response.data };
    } catch (error) {
        throw error;
    }
};

export const createBoard = async (newBoard) => {
    try {
        const response = await api.post(BOARDS_BASE, newBoard);
        return { createdBoard: response.data };
    } catch (error) {
        throw error;
    }
};

export const updateBoard = async (newBoard) => {
    try {
        const response = await api.put(`${BOARDS_BASE}${newBoard.id}`, {
            name: newBoard.name,
        });
        return { updatedBoard: response.data };
    } catch (error) {
        throw error;
    }
};

export const deleteBoard = async (boardId) => {
    try {
        await api.delete(`${BOARDS_BASE}${boardId}`);
    } catch (error) {
        throw error;
    }
};

export const getBoard = async (boardId) => {
    try {
        const response = await api.get(`${BOARDS_BASE}${boardId}`);
        return { board: response.data };
    } catch (error) {
        throw error;
    }
};
