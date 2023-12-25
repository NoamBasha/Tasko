import api from "../../services/apiService.js";

const AUTH_BASE = "auth/";

export const login = async (userData) => {
    try {
        const response = await api.post(AUTH_BASE, userData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const { accessToken, user } = response.data;
        return { accessToken, user };
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};

export const refresh = async () => {
    try {
        const response = await api.get(`${AUTH_BASE}refresh`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const { accessToken } = response.data;
        return { accessToken };
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};

export const logout = async () => {
    try {
        const response = await api.post(`${AUTH_BASE}logout`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const { message } = response.data;
        return { message };
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};
