import api from "../../services/apiService.js";
import { handleApiError } from "../../utils/apiUtils.js";

const USERS_BASE = "users/";

export const register = async (userData) => {
    try {
        await api.post(`${USERS_BASE}/register`, userData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        handleApiError(error);
    }
};

export const getUserData = async (accessToken) => {
    try {
        const response = await api.get(`${USERS_BASE}getMe`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const user = response.data;
        return { user };
    } catch (error) {
        console.erro(error);
        handleApiError(error);
    }
};
