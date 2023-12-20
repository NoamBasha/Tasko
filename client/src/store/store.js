import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import boardsReducer from "../features/boards/boardsSlice.js";

const store = configureStore({
    reducer: {
        auth: authReducer,
        boards: boardsReducer,
    },
});

export default store;
