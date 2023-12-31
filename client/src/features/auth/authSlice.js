import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, refresh, logout } from "./authService.js";
import {
    getUserDataAsync,
    reset as resetUsersState,
} from "../users/usersSlice.js";
import { toast } from "react-toastify";
import { reset as resetBoardsState } from "../boards/boardsSlice.js";
import { reset as resetColumnsState } from "../columns/columnsSlice.js";
import { reset as resetTasksState } from "../tasks/tasksSlice.js";

export const loginUserAsync = createAsyncThunk(
    "auth/loginUserAsync",
    async (userData, thunkAPI) => {
        try {
            const { accessToken } = await login(userData);
            await thunkAPI.dispatch(getUserDataAsync(accessToken));
            return { accessToken };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const refreshAccessToken = createAsyncThunk(
    "auth/refreshAccessToken",
    async (_, thunkAPI) => {
        try {
            const { accessToken } = await refresh();
            return { newAccessToken: accessToken };
        } catch (error) {
            thunkAPI.dispatch(reset());
            thunkAPI.dispatch(resetUsersState());
            thunkAPI.dispatch(resetBoardsState());
            thunkAPI.dispatch(resetColumnsState());
            thunkAPI.dispatch(resetTasksState());
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const logoutAsync = createAsyncThunk(
    "auth/logoutAsync",
    async (_, thunkAPI) => {
        try {
            thunkAPI.dispatch(reset());
            thunkAPI.dispatch(resetUsersState());
            thunkAPI.dispatch(resetBoardsState());
            thunkAPI.dispatch(resetColumnsState());
            thunkAPI.dispatch(resetTasksState());
            await logout();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    token: null,
    status: "idle",
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: (state) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUserAsync.pending, (state) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(loginUserAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.token = action.payload.accessToken;
            })
            .addCase(loginUserAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
                toast.error(action.payload);
            })
            .addCase(refreshAccessToken.pending, (state) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.token = action.payload.newAccessToken;
            })
            .addCase(refreshAccessToken.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
                state.token = null;
            });
    },
});

export const { reset } = authSlice.actions;

export const selectToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsAuthenticated = (state) => !!state.auth.token;

export default authSlice.reducer;
