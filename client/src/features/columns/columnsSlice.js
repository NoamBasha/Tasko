import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateColumn, createColumn, deleteColumn } from "./columnsService.js";

export const createColumnAsync = createAsyncThunk(
    "columns/createColumnAsync",
    async (newColumn, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const { createdColumn } = await createColumn(token, newColumn);
            return { createdColumn };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateColumnAsync = createAsyncThunk(
    "columns/updateColumnAsync",
    async (newColumn, thunkAPI) => {
        //TODO change "name" to "title"
        try {
            const token = localStorage.getItem("authToken");
            const name = newColumn.newName;
            const columnId = newColumn.id;
            const { updatedColumn } = await updateColumn(token, {
                name,
                id: columnId,
            });
            return { updatedColumn };
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
            const { deletedId } = await deleteColumn(token, columnId);
            return { deletedId };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    columns: [],
    status: "idle",
    error: null,
};

const columnsSlice = createSlice({
    name: "columns",
    initialState,
    reducers: {
        setColumns: (state, action) => {
            console.log(action.payload);
            state.columns = action.payload;
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
                state.columns = state.columns.sort((a, b) => b.index - a.index);
            })
            .addCase(createColumnAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
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
            });
    },
});

export const { setColumns } = columnsSlice.actions;

export const selectColumns = (state) => state.columns;

export default columnsSlice.reducer;
