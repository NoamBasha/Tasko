import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, refresh, logout } from "./authService.js";
import Cookies from "js-cookie";
import { getUserDataAsync, resetUserState } from "../users/usersSlice.js";

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
            console.log("1");
            const { accessToken } = await refresh();
            console.log(accessToken);

            return { newAccessToken: accessToken };
        } catch (error) {
            console.log(error);
            thunkAPI.dispatch(clearTokens());
            thunkAPI.dispatch(resetUserState());
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const logoutAsync = createAsyncThunk(
    "auth/logoutAsync",
    async (_, thunkAPI) => {
        try {
            await logout();
            thunkAPI.dispatch(clearTokens());
            thunkAPI.dispatch(resetUserState());
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
        clearTokens: (state) => {
            state.token = null;
            console.log("Before removal:", Cookies.get("jwt"));

            Cookies.remove("jwt", {
                secure: true,
                sameSite: "None",
            });
            console.log("Before removal:", Cookies.get("jwt"));
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
                // TODO toastify error?
            });
    },
});

export const { clearTokens } = authSlice.actions;

export const selectToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsAuthenticated = (state) => !!state.auth.token;

export default authSlice.reducer;
