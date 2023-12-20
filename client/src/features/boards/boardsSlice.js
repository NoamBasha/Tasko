import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserBoards, updateBoard, createBoard } from "./boardsService.js";

export const getUserBoardsAsync = createAsyncThunk(
    "boards/getUserBoardsAsync",
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const { boardsNames } = await getUserBoards(token);
            return { boardsNames };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const createBoardAsync = createAsyncThunk(
    "boards/createBoardAsync",
    async (newBoard, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const { createdBoard } = await createBoard(token, newBoard);
            return { createdBoard };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateBoardAsync = createAsyncThunk(
    "boards/updateBoardAsync",
    async (newBoard, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const name = newBoard.newName;
            const boardId = newBoard.id;
            const { updatedBoard } = await updateBoard(token, {
                name,
                id: boardId,
            });
            return { updatedBoard };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    boards: [],
    status: "idle",
    error: null,
};

const boardsSlice = createSlice({
    name: "boards",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getUserBoardsAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(getUserBoardsAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.boards = action.payload.boardsNames;
            })
            .addCase(getUserBoardsAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            })
            .addCase(createBoardAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(createBoardAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.boards.push(action.payload.createdBoard);
            })
            .addCase(createBoardAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            })
            .addCase(updateBoardAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(updateBoardAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.boards = state.boards.map((board) => {
                    if (board.id === action.payload.updatedBoard.id) {
                        return action.payload.updatedBoard;
                    } else {
                        return board;
                    }
                });
            })
            .addCase(updateBoardAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            });
    },
});

export const {} = boardsSlice.actions;

export const selectBoards = (state) => state.boards.boards;

export default boardsSlice.reducer;
