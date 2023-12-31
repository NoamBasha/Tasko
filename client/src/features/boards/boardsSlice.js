import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getUserBoards,
    getBoard,
    updateBoard,
    createBoard,
    deleteBoard,
    updateAllBoards,
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
            const index = newBoard.newIndex;
            const boardId = newBoard.id;
            const boardToUpdateTo = {
                name,
                index,
                id: boardId,
            };
            thunkAPI.dispatch(updateLocalBoard(boardToUpdateTo));
            const { updatedBoard } = await updateBoard(boardToUpdateTo);
            return { updatedBoard };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const deleteBoardAsync = createAsyncThunk(
    "boards/deleteBoardAsync",
    async (boardId, thunkAPI) => {
        try {
            const localColumns = thunkAPI.getState().columns.localColumns;
            const currentBoardId = thunkAPI.getState().boards.boardId;

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
            thunkAPI.dispatch(setCurrentBoardId(boardId));
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

export const updateAllBoardsAsync = createAsyncThunk(
    "boards/updateAllBoardsAsync",
    async (newBoards, thunkAPI) => {
        try {
            const abortAxiosHO = () => abortAxios(abortController);

            const abortController = new AbortController();
            const signal = abortController.signal;

            thunkAPI.signal.addEventListener("abort", abortAxiosHO);

            const { updatedBoards } = await updateAllBoards(newBoards, signal);

            thunkAPI.signal.removeEventListener("abort", abortAxiosHO);

            return { updatedBoards };
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
        reset: (state) => {
            return initialState;
        },
        setLocalBoards: (state, action) => {
            state.localBoards = [...action.payload].sort(
                (a, b) => b.index - a.index
            );
        },
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
        setCurrentBoardId: (state, action) => {
            state.boardId = action.payload;
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
            })
            .addCase(getBoardAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
                toast.error(action.payload);
            })

            .addCase(updateAllBoardsAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(updateAllBoardsAsync.fulfilled, (state, action) => {
                function updateBoards(boards, updatedBoards) {
                    const updatedBoardsMap = new Map(
                        updatedBoards.map((board) => [board.id, board])
                    );

                    const updatedResult = boards.map((board) => {
                        const updatedBoard = updatedBoardsMap.get(board.id);
                        return updatedBoard
                            ? { ...board, ...updatedBoard }
                            : board;
                    });

                    updatedBoards.forEach((updatedBoard) => {
                        if (
                            !boards.find(
                                (voard) => voard.id === updatedBoard.id
                            )
                        ) {
                            updatedResult.push(updatedBoard);
                        }
                    });

                    return updatedResult;
                }

                state.status = "fulfilled";
                const updatedBoards = action.payload.updatedBoards;

                state.boards = updateBoards(state.boards, updatedBoards);
            })
            .addCase(updateAllBoardsAsync.rejected, (state, action) => {
                state.status = "rejected";
                if (action.error?.message === "Aborted") return;
                state.error = action.payload;
                state.localBoards = state.boards;
                toast.error(action.payload);
            });
    },
});

export const {
    reset,
    setBoards,
    setLocalBoards,
    createLocalBoard,
    updateLocalBoard,
    deleteLocalBoard,
    resetCurrentBoardId,
    setCurrentBoardId,
} = boardsSlice.actions;

export const selectBoards = (state) => state.boards.boards;
export const selectLocalBoards = (state) => state.boards.localBoards;
export const selectCurrentBoardId = (state) => state.boards.boardId;

export default boardsSlice.reducer;
