import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getUserBoards,
    getBoard,
    updateBoard,
    createBoard,
    deleteBoard,
} from "./boardsService.js";
import {
    setColumns,
    deleteLocalColumnsByBoardId,
} from "../columns/columnsSlice.js";
import {
    deleteLocalTasksByColumnId,
    deleteTasksByColumnId,
} from "../tasks/tasksSlice.js";
import { toast } from "react-toastify";

import { setTasks } from "../tasks/tasksSlice.js";

export const getUserBoardsAsync = createAsyncThunk(
    "boards/getUserBoardsAsync",
    async (_, thunkAPI) => {
        try {
            const { boardsNames } = await getUserBoards();
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
            thunkAPI.dispatch(createLocalBoard(newBoard));
            const { createdBoard } = await createBoard(newBoard);
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
            const name = newBoard.newName;
            const boardId = newBoard.id;
            thunkAPI.dispatch(updateLocalBoard(newBoard));
            const { updatedBoard } = await updateBoard({
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
            const localColumns = thunkAPI.getState().columns.localColumns;
            const currentBoardId = thunkAPI.getState().boards.boardId;
            //TODO: this is optimistic - so? roll back to the currentBoardId if failed?
            if (boardId.localeCompare(currentBoardId) === 0) {
                thunkAPI.dispatch(resetCurrentBoardId());
            }

            localColumns.forEach((column) => {
                if (column.boardId.localeCompare(boardId) === 0) {
                    thunkAPI.dispatch(deleteLocalTasksByColumnId(column.id));
                }
            });

            thunkAPI.dispatch(deleteLocalColumnsByBoardId(boardId));

            thunkAPI.dispatch(deleteLocalBoard(boardId));

            await deleteBoard(boardId);

            const columns = thunkAPI.getState().columns.columns;

            columns.forEach((column) => {
                if (column.boardId.localeCompare(boardId) === 0) {
                    thunkAPI.dispatch(deleteTasksByColumnId(column.id));
                }
            });
            return { deletedId: boardId };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const getBoardAsync = createAsyncThunk(
    "boards/getBoardAsync",
    async (boardId, thunkAPI) => {
        try {
            const { board } = await getBoard(boardId);

            thunkAPI.dispatch(setColumns(board.columns));
            const boardTasks = [];
            board.columns.forEach((column) => {
                boardTasks.push(...column.tasks);
            });
            thunkAPI.dispatch(setTasks(boardTasks));

            return { board };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    boards: [],
    localBoards: [],
    boardId: null,
    status: "idle",
    error: null,
};

const boardsSlice = createSlice({
    name: "boards",
    initialState,
    reducers: {
        createLocalBoard: (state, action) => {
            state.localBoards.push(action.payload);
        },
        updateLocalBoard: (state, action) => {
            state.localBoards = state.localBoards.map((board) => {
                if (board.id === action.payload.id) {
                    return action.payload;
                } else {
                    return board;
                }
            });
        },
        deleteLocalBoard: (state, action) => {
            state.localBoards = state.localBoards.filter(
                (board) => board.id !== action.payload
            );
        },
        resetCurrentBoardId: (state, action) => {
            state.boardId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserBoardsAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(getUserBoardsAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.boards = action.payload.boardsNames;
                state.localBoards = action.payload.boardsNames;
            })
            .addCase(getUserBoardsAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
                toast.error(action.payload);
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
                state.localBoards = state.boards;
                toast.error(action.payload);
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
                state.localBoards = state.boards;
                toast.error(action.payload);
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
                state.localBoards = state.boards;
                toast.error(action.payload);
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
                toast.error(action.payload);
            });
    },
});

export const {
    setBoards,
    setLocalBoards,
    createLocalBoard,
    updateLocalBoard,
    deleteLocalBoard,
    resetCurrentBoardId,
} = boardsSlice.actions;

export const selectBoards = (state) => state.boards.boards;
export const selectLocalBoards = (state) => state.boards.localBoards;
export const selectCurrentBoardId = (state) => state.boards.boardId;

export default boardsSlice.reducer;
