import TaskBoard from "../../components/TaskBoard/TaskBoard.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import Analytics from "../../components/Analytics/Analytics.jsx";
import "./product.css";

import { useSelector } from "react-redux";
import { selectColumns } from "../../features/columns/columnsSlice.js";
import { selectTasks } from "../../features/tasks/tasksSlice.js";
import { selectCurrentBoardId } from "../../features/boards/boardsSlice.js";
import { selectName } from "../../features/auth/authSlice.js";

const Product = () => {
    const name = useSelector(selectName);
    const tasks = useSelector(selectTasks);
    const columns = useSelector(selectColumns);
    const boardId = useSelector(selectCurrentBoardId);

    return (
        <div className="product-container">
            <Sidebar name={name} />
            <TaskBoard boardId={boardId} columns={columns} tasks={tasks} />
            <Analytics />
        </div>
    );
};

export default Product;
