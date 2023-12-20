import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getUserBoards,
    getBoard,
    updateBoard,
    createBoard,
    deleteBoard,
} from "./boardsService.js";
import { setColumns } from "../columns/columnsSlice.js";

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

//TODO when deleteing a board, boardId and maybe columns and tasks too.
export const deleteBoardAsync = createAsyncThunk(
    "boards/deleteBoardAsync",
    async (boardId, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const { deletedId } = await deleteBoard(token, boardId);
            return { deletedId };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const getBoardAsync = createAsyncThunk(
    "boards/getBoardAsync",
    async (boardId, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const { board } = await getBoard(token, boardId);

            //TODO add here setTasks as well
            thunkAPI.dispatch(setColumns(board.columns));

            return { board };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    boards: [],
    boardId: null,
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
                state.boards = action.payload.boardsNames.sort(
                    (a, b) => b.id - a.id
                );
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
                state.boards = state.boards.sort((a, b) => b.id - a.id);
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
            })
            .addCase(deleteBoardAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(deleteBoardAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.boards = state.boards.filter(
                    (board) => board.id !== action.payload.deletedId
                );
            })
            .addCase(deleteBoardAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            })
            .addCase(getBoardAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(getBoardAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.boardId = action.payload.board.id;
                // setColumns(action.payload.board.columns);
            })
            .addCase(getBoardAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            });
    },
});

export const {} = boardsSlice.actions;

export const selectBoards = (state) => state.boards.boards;
export const selectCurrentBoardId = (state) => state.boards.boardId;

export default boardsSlice.reducer;
