import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateTask, createTask, deleteTask } from "./tasksService.js";

export const createTaskAsync = createAsyncThunk(
    "tasks/createTaskAsync",
    async ({ newTask, columnId }, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            const { createdTask } = await createTask(
                token,
                boardId,
                columnId,
                newTask
            );
            return { createdTask };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateTaskAsync = createAsyncThunk(
    "columns/updateTaskAsync",
    async ({ newTask, columnId }, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            const { updatedTask } = await updateTask(
                token,
                boardId,
                columnId,
                newTask
            );
            return { updatedTask };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const deleteTaskAsync = createAsyncThunk(
    "columns/deleteTaskAsync",
    async ({ taskId, columnId }, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            console.log(taskId, columnId);
            await deleteTask(token, boardId, columnId, taskId);
            return { deletedId: taskId };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    tasks: [],
    status: "idle",
    error: null,
};

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createTaskAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(createTaskAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.tasks.push(action.payload.createdTask);
            })
            .addCase(createTaskAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            })
            .addCase(updateTaskAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(updateTaskAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.tasks = state.tasks.map((task) => {
                    if (task.id === action.payload.updatedTask.id) {
                        return action.payload.updatedTask;
                    } else {
                        return task;
                    }
                });
            })
            .addCase(updateTaskAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            })
            .addCase(deleteTaskAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(deleteTaskAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.tasks = state.tasks.filter(
                    (task) => task.id !== action.payload.deletedId
                );
            })
            .addCase(deleteTaskAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
            });
    },
});

export const { setTasks } = tasksSlice.actions;

export const selectTasks = (state) => state.tasks.tasks;

export default tasksSlice.reducer;
