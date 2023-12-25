import axios from "axios";
import { refreshAccessToken, clearTokens } from "../features/auth/authSlice.js";
import { resetUserState } from "../features/users/usersSlice.js";

let store;

export const injectStore = (_store) => {
    store = _store;
};

const api = axios.create({
    baseURL: "http://localhost:3000/api/v1/",
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const accessToken = store.getState().auth.token;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        // Check if the error is due to an expired token
        if (
            error?.response?.data?.message === "Invalid access token" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Trigger token refresh
                await store.dispatch(refreshAccessToken());

                // Retry the original request with the new token
                return api(originalRequest);
            } catch (refreshError) {
                // Handle refresh token failure (e.g., clear tokens and log the user out)
                store.dispatch(clearTokens());
                store.dispatch(resetUserState());
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
