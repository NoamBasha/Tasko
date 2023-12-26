import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    updateColumn,
    createColumn,
    deleteColumn,
    updateAllColumns,
} from "./columnsService.js";
import { toast } from "react-toastify";
import { deleteLocalTasksByColumnId } from "../tasks/tasksSlice.js";
import { deleteBoardAsync } from "../boards/boardsSlice.js";

export const createColumnAsync = createAsyncThunk(
    "columns/createColumnAsync",
    async (newColumn, thunkAPI) => {
        try {
            const boardId = thunkAPI.getState().boards.boardId;
            thunkAPI.dispatch(createLocalColumn(newColumn));
            const { createdColumn } = await createColumn(boardId, newColumn);
            return { createdColumn };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateColumnAsync = createAsyncThunk(
    "columns/updateColumnAsync",
    async (newColumn, thunkAPI) => {
        try {
            const boardId = thunkAPI.getState().boards.boardId;
            thunkAPI.dispatch(updateLocalColumn(newColumn));
            const { updatedColumn } = await updateColumn(boardId, newColumn);
            return { updatedColumn };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const abortAxios = (abortController) => {
    abortController.abort();
};

export const updateAllColumnsAsync = createAsyncThunk(
    "columns/updateAllColumnsAsync",
    async (newColumns, thunkAPI) => {
        try {
            const abortAxiosHO = () => abortAxios(abortController);

            const abortController = new AbortController();
            const signal = abortController.signal;

            thunkAPI.signal.addEventListener("abort", abortAxiosHO);

            const boardId = thunkAPI.getState().boards.boardId;
            const { updatedColumns } = await updateAllColumns(
                boardId,
                newColumns,
                signal
            );

            //! putting this in "finally" won't work!
            thunkAPI.signal.removeEventListener("abort", abortAxiosHO);

            return { updatedColumns };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const deleteColumnAsync = createAsyncThunk(
    "columns/deleteColumnAsync",
    async (columnId, thunkAPI) => {
        try {
            const boardId = thunkAPI.getState().boards.boardId;
            thunkAPI.dispatch(deleteLocalColumn(columnId));
            thunkAPI.dispatch(deleteLocalTasksByColumnId(columnId));
            await deleteColumn(boardId, columnId);
            return { deletedId: columnId };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    columns: [],
    localColumns: [],
    status: "idle",
    error: null,
};

const columnsSlice = createSlice({
    name: "columns",
    initialState,
    reducers: {
        setColumns: (state, action) => {
            state.columns = action.payload;
            state.localColumns = action.payload;
        },
        setLocalColumns: (state, action) => {
            state.localColumns = action.payload;
        },
        createLocalColumn: (state, action) => {
            state.localColumns.push(action.payload);
        },
        updateLocalColumn: (state, action) => {
            state.localColumns = state.localColumns.map((column) => {
                if (column.id === action.payload.id) {
                    return action.payload;
                } else {
                    return column;
                }
            });
        },
        deleteLocalColumn: (state, action) => {
            state.localColumns = state.localColumns.filter(
                (column) => column.id !== action.payload
            );
        },
        deleteLocalColumnsByBoardId: (state, action) => {
            state.localColumns = state.localColumns.filter(
                (column) => column.boardId !== action.payload
            );
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createColumnAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(createColumnAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.columns.push(action.payload.createdColumn);
            })
            .addCase(createColumnAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
                state.localColumns = state.columns;
                toast.error(action.payload);
            })
            .addCase(updateColumnAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(updateColumnAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.columns = state.columns.map((column) => {
                    if (column.id === action.payload.updatedColumn.id) {
                        return action.payload.updatedColumn;
                    } else {
                        return column;
                    }
                });
            })
            .addCase(updateColumnAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
                state.localColumns = state.columns;
                toast.error(action.payload);
            })
            .addCase(deleteColumnAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(deleteColumnAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.columns = state.columns.filter(
                    (column) => column.id !== action.payload.deletedId
                );
            })
            .addCase(deleteColumnAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
                state.localColumns = state.columns;
                toast.error(action.payload);
            })
            .addCase(updateAllColumnsAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(updateAllColumnsAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                const updatedColumns = action.payload.updatedColumns;
                state.columns = updatedColumns;
                state.localColumns = updatedColumns;
            })
            .addCase(updateAllColumnsAsync.rejected, (state, action) => {
                state.status = "rejected";
                if (action.error?.message === "Aborted") return;
                state.error = action.payload;
                state.localColumns = state.columns;
                toast.error(action.payload);
            })
            .addCase(deleteBoardAsync.fulfilled, (state, action) => {
                state.columns = state.columns.filter(
                    (column) => column.boardId !== action.payload.deletedId
                );
            })
            .addCase(deleteBoardAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
                state.localColumns = state.columns;
                toast.error(action.payload);
            });
    },
});

export const {
    setColumns,
    setLocalColumns,
    createLocalColumn,
    updateLocalColumn,
    deleteLocalColumn,
    deleteLocalColumnsByBoardId,
} = columnsSlice.actions;

export const selectColumns = (state) => state.columns.columns;
export const selectLocalColumns = (state) => state.columns.localColumns;

export default columnsSlice.reducer;
