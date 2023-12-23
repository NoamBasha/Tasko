const USER_API = "http://localhost:3000/api/v1/users/";

export const login = async (userData) => {
    try {
        const response = await fetch(USER_API + "login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Login failed");
        }

        const { token, user } = await response.json();
        return { token, user };
    } catch (error) {
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await fetch(USER_API + "register", {
            method: "POST",
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

export const getUserData = async (token) => {
    try {
        const response = await fetch(USER_API + "getMe", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Data fetching failed");
        }

        const user = await response.json();
        return { user };
    } catch (error) {
        throw error;
    }
};
