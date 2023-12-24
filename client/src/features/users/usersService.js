import api from "../../services/apiService.js";

const USERS_BASE = "users/";

export const register = async (userData) => {
    try {
        const response = await api.post(`${USERS_BASE}/register`, {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Registration failed");
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
            const errorData = await response.json();
            throw new Error(errorData.message || "Data fetching failed");
        }

        const user = response.data; // Adjust this based on your actual response structure
        return { user };
    } catch (error) {
        throw error;
    }
};
