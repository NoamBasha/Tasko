import api from "../../services/apiService.js";
import { handleApiError } from "../../utils/apiUtils.js";

const AUTH_BASE = "auth/";

export const login = async (userData) => {
    try {
        const response = await api.post(AUTH_BASE, userData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const { accessToken } = response.data;
        return { accessToken };
    } catch (error) {
        handleApiError(error);
    }
};

export const refresh = async () => {
    try {
        const response = await api.get(`${AUTH_BASE}refresh`);
        const { accessToken } = response.data;
        return { accessToken };
    } catch (error) {
        handleApiError(error);
    }
};

export const logout = async () => {
    try {
        await api.post(`${AUTH_BASE}logout`);
    } catch (error) {
        handleApiError(error);
    }
};
