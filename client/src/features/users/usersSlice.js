import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createNewUser, getUserData } from "./usersService.js";
import { toast } from "react-toastify";

export const registerUserAsync = createAsyncThunk(
    "users/registerUserAsync",
    async (userData, { rejectWithValue }) => {
        try {
            await createNewUser(userData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getUserDataAsync = createAsyncThunk(
    "users/getUserDataAsync",
    async (accessToken, thunkAPI) => {
        try {
            const { user } = await getUserData(accessToken);
            return { user };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    user: null,
    status: "idle",
    error: null,
};

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        reset: (state, action) => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
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
                toast.error(action.payload);
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
                toast.error(action.payload);
            });
    },
});

export const { reset } = usersSlice.actions;

export const selectUser = (state) => state.users.user;
export const selectName = (state) => state.users.user?.name;
export const selectUsersStatus = (state) => state.users.status;

export default usersSlice.reducer;
