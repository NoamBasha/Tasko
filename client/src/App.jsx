import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from "react-router-dom";
import Product from "./pages/Product/Product.jsx";
import Login from "./pages/Auth/Login/Login.jsx";
import Register from "./pages/Auth/Register/Register.jsx";
import { ToastContainer } from "react-toastify";
import RequireAuth from "./components/RequireAuth/RequireAuth.jsx";
import { useEffect, useState } from "react";
import {
    refreshAccessToken,
    selectIsAuthenticated,
    selectToken,
} from "./features/auth/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { getUserDataAsync } from "./features/users/usersSlice.js";
import Spinner from "./components/Spinner/Spinner.jsx";
import Cookies from "js-cookie";

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route element={<RequireAuth />}>
                    <Route path="/" element={<Product />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Login />} />
            </Routes>
        </Router>
    );
}

function App() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await dispatch(refreshAccessToken()).unwrap();
                await dispatch(getUserDataAsync(res.newAccessToken));
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };
        getData();
    }, []);

    return (
        <div className="app-container">
            {isLoading ? (
                <div className="app-container-spinner">
                    <Spinner />
                </div>
            ) : (
                <AppRoutes />
            )}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}
export default App;
