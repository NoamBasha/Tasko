import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, register, getUserData } from "./authService.js";

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

export const getUserDataAsync = createAsyncThunk(
    "auth/getUserDataAsync",
    async (_, { rejectWithValue }) => {
        try {
            console.log("here!!");

            const token = localStorage.getItem("authToken");
            const { user } = await getUserData(token);
            return { user };
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
            })
            .addCase(registerUserAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            })
            .addCase(getUserDataAsync.pending, (state) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(getUserDataAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.user = action.payload.user;
            })
            .addCase(getUserDataAsync.rejected, (state, action) => {
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
    !!localStorage.getItem("authToken");
export const selectAuthToken = (state) => localStorage.getItem("authToken");
export const selectName = (state) => state.auth.user.name;
export const selectStatus = (state) => state.status;

export default authSlice.reducer;
