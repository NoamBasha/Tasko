import axios from "axios";
import {
    refreshAccessToken,
    reset as resetAuthState,
} from "../features/auth/authSlice.js";
import { reset as resetUsersState } from "../features/users/usersSlice.js";
import { reset as resetBoardsState } from "../features/boards/boardsSlice.js";
import { reset as resetColumnsState } from "../features/columns/columnsSlice.js";
import { reset as resetTasksState } from "../features/tasks/tasksSlice.js";

let store;

export const injectStore = (_store) => {
    store = _store;
};

const api = axios.create({
    baseURL: "http://localhost:3000/api/v1/",
    withCredentials: true,
});

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

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
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
                store.dispatch(resetAuthState());
                store.dispatch(resetUsersState());
                store.dispatch(resetBoardsState());
                store.dispatch(resetColumnsState());
                store.dispatch(resetTasksState());
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
