import TaskBoard from "../../components/TaskBoard/TaskBoard.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import Analytics from "../../components/Analytics/Analytics.jsx";
import "./product.css";

import { useSelector } from "react-redux";
import { selectCurrentBoardId } from "../../features/boards/boardsSlice.js";
import { selectName } from "../../features/users/usersSlice.js";

const Product = () => {
    const name = useSelector(selectName);
    const boardId = useSelector(selectCurrentBoardId);

    return (
        <div className="product-container">
            <Sidebar name={name} />
            <TaskBoard boardId={boardId} />
            <Analytics />
        </div>
    );
};

export default Product;
