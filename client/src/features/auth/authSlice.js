import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, register } from "./authService.js";

export const loginUserAsync = createAsyncThunk(
    "auth/loginUserAsync",
    async (userData, { rejectWithValue }) => {
        try {
            const { token, user } = await login(userData);
            localStorage.setItem("authToken", token);
            return { user };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const registerUserAsync = createAsyncThunk(
    "auth/registerUserAsync",
    async (userData, { rejectWithValue }) => {
        try {
            await register(userData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    user: null,
    status: "idle",
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logoutUser: (state) => {
            state.user = null;
            state.status = "idle";
            state.error = null;
            localStorage.removeItem("authToken");
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
                state.user = action.payload.user;
            })
            .addCase(loginUserAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            })
            .addCase(registerUserAsync.pending, (state) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(registerUserAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                // state.user = action.payload.user;
            })
            .addCase(registerUserAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            });
    },
});

export const { logoutUser } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) =>
    !!state.auth.user || !!localStorage.getItem("authToken");
export const selectAuthToken = (state) =>
    state.auth.user?.token || localStorage.getItem("authToken");

export default authSlice.reducer;
