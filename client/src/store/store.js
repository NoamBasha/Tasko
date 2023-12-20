import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import boardsReducer from "../features/boards/boardsSlice.js";
import columnsReducer from "../features/columns/columnsSlice.js";

const store = configureStore({
    reducer: {
        auth: authReducer,
        boards: boardsReducer,
        columns: columnsReducer,
    },
});

export default store;
