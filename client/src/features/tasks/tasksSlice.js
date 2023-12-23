import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    updateTask,
    createTask,
    deleteTask,
    updateAllTasks,
} from "./tasksService.js";
import { toast } from "react-toastify";

export const createTaskAsync = createAsyncThunk(
    "tasks/createTaskAsync",
    async ({ newTask, columnId }, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            thunkAPI.dispatch(createLocalTask(newTask));
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
    "tasks/updateTaskAsync",
    async ({ newTask, columnId }, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            thunkAPI.dispatch(updateLocalTask(newTask));
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

export const updateAllTasksAsync = createAsyncThunk(
    "tasks/updateAllTasksAsync",
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            const newTasks = thunkAPI.getState().tasks.localTasks;
            const { updatedTasks } = await updateAllTasks(
                token,
                boardId,
                newTasks
            );
            return { updatedTasks };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const deleteTaskAsync = createAsyncThunk(
    "tasks/deleteTaskAsync",
    async ({ taskId, columnId }, thunkAPI) => {
        try {
            const token = localStorage.getItem("authToken");
            const boardId = thunkAPI.getState().boards.boardId;
            thunkAPI.dispatch(deleteLocalTask(taskId));
            await deleteTask(token, boardId, columnId, taskId);
            return { deletedId: taskId };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const initialState = {
    tasks: [],
    localTasks: [],
    status: "idle",
    error: null,
};

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        setTasks: (state, action) => {
            state.tasks = action.payload;
            state.localTasks = action.payload;
        },
        setLocalTasks: (state, action) => {
            state.localTasks = action.payload;
        },
        createLocalTask: (state, action) => {
            state.localTasks.push(action.payload);
        },
        updateLocalTask: (state, action) => {
            state.localTasks = state.localTasks.map((task) => {
                if (task.id === action.payload.id) {
                    return action.payload;
                } else {
                    return task;
                }
            });
        },
        deleteLocalTask: (state, action) => {
            state.localTasks = state.localTasks.filter(
                (task) => task.id !== action.payload
            );
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
                state.localTasks = state.tasks;
                toast.error(action.payload);
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
                state.localTasks = state.tasks;
                toast.error(action.payload);
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
                state.localTasks = state.tasks;
                toast.error(action.payload);
            })
            .addCase(updateAllTasksAsync.pending, (state, action) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(updateAllTasksAsync.fulfilled, (state, action) => {
                state.status = "fulfilled";
                const updatedTasks = action.payload.updatedTasks;
                state.tasks = updatedTasks;
                state.localTasks = updatedTasks;
            })
            .addCase(updateAllTasksAsync.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.payload;
                state.localTasks = state.tasks;
                toast.error(action.payload);
            });
    },
});

export const {
    setTasks,
    setLocalTasks,
    createLocalTask,
    updateLocalTask,
    deleteLocalTask,
} = tasksSlice.actions;

export const selectTasks = (state) => state.tasks.tasks;
export const selectLocalTasks = (state) => state.tasks.localTasks;

export default tasksSlice.reducer;