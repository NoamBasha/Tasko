import api from "../../services/apiService.js";

const USERS_BASE = "users/";

export const register = async (userData) => {
    try {
        const response = await api.post(`${USERS_BASE}/register`, userData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status !== 201) {
            throw new Error(response.data.message || "Registration failed");
        }
    } catch (error) {
        throw error;
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

        if (response.status !== 200) {
            throw new Error(response.data.message || "Data fetching failed");
        }

        const user = response.data; // Adjust this based on your actual response structure
        return { user };
    } catch (error) {
        throw error;
    }
};
