import api from "../../services/apiService.js";

const USERS_BASE = "users/";

export const register = async (userData) => {
    try {
        await api.post(`${USERS_BASE}/register`, userData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};

export const getUserData = async (accessToken) => {
    try {
        const response = await api.get(`${USERS_BASE}/getMe`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        const user = response.data;
        return { user };
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};
