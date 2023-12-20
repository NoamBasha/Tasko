import TaskBoard from "../../components/TaskBoard/TaskBoard.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import Analytics from "../../components/Analytics/Analytics.jsx";
import "./product.css";

const Product = () => {
    return (
        <div className="product-container">
            <Sidebar />
            <TaskBoard />
            <Analytics />
        </div>
    );
};

export default Product;
