import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import boardsReducer from "../features/boards/boardsSlice.js";
import columnsReducer from "../features/columns/columnsSlice.js";
import tasksReducer from "../features/tasks/tasksSlice.js";

const store = configureStore({
    reducer: {
        auth: authReducer,
        boards: boardsReducer,
        columns: columnsReducer,
        tasks: tasksReducer,
    },
});

export default store;
