import api from "../../services/apiService.js";

const AUTH_BASE = "auth/";

export const login = async (userData) => {
    try {
        const response = await api.post(AUTH_BASE, userData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status !== 200) {
            throw new Error(response.data.message || "Login failed");
        }

        const { accessToken, user } = response.data;
        return { accessToken, user };
    } catch (error) {
        throw error;
    }
};

export const refresh = async () => {
    try {
        console.log("1");

        const response = await api.get(`${AUTH_BASE}/refresh`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log("1");

        if (response.status !== 200) {
            throw new Error(response.data.message || "Refresh token failed");
        }

        console.log("1");

        const { accessToken } = response.data;
        return { accessToken };
    } catch (error) {
        throw error;
    }
};
