import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    updateColumn,
    createColumn,
    deleteColumn,
    updateTwoColumns,
    updateAllColumns,
} from "./columnsService.js";
import { toast } from "react-toastify";

export const createColumnAsync = createAsyncThunk(
    "columns/createColumnAsync",
    async (newColumn, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            thunkAPI.dispatch(createLocalColumn(newColumn));
            const { createdColumn } = await createColumn(
                token,
                boardId,
                newColumn
            );
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
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            thunkAPI.dispatch(updateLocalColumn(newColumn));
            const { updatedColumn } = await updateColumn(
                token,
                boardId,
                newColumn
            );
            return { updatedColumn };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateAllColumnsAsync = createAsyncThunk(
    "columns/updateAllColumnsAsync",
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            const newColumns = thunkAPI.getState().columns.localColumns;
            const { updatedColumns } = await updateAllColumns(
                token,
                boardId,
                newColumns
            );
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
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            thunkAPI.dispatch(deleteLocalColumn(columnId));
            const { deletedId } = await deleteColumn(token, boardId, columnId);
            return { deletedId };
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
} = columnsSlice.actions;

export const selectColumns = (state) => state.columns.columns;
export const selectLocalColumns = (state) => state.columns.localColumns;

export default columnsSlice.reducer;
