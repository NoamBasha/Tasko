const BOARDS_API = "http://localhost:3000/api/v1/boards/";

export const getUserBoards = async (token) => {
    try {
        const config = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };

        const response = await fetch(BOARDS_API, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }
        const boardsNames = await response.json();
        return { boardsNames };
    } catch (error) {
        throw error;
    }
};

export const createBoard = async (token, newBoard) => {
    try {
        const config = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newBoard),
        };

        const response = await fetch(BOARDS_API, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const createdBoard = await response.json();
        return { createdBoard };
    } catch (error) {
        throw error;
    }
};
