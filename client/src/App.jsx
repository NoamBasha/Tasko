import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Product from "./pages/Product/Product.jsx";
import Login from "./pages/Auth/Login/Login.jsx";
import Register from "./pages/Auth/Register/Register.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RequireAuth from "./components/RequireAuth/RequireAuth.jsx";

//TODO proctected routes for "/"
//TODO change toast theme and overall style
//TODO add border to analytics and sidebar?

function App() {
    return (
        <div className="app-container">
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route element={<RequireAuth />}>
                        <Route path="/" element={<Product />} />
                    </Route>
                    <Route path="*" element={<Login />} />
                </Routes>
            </Router>
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
                progressStyle={{
                    background: "grey",
                }}
            />
        </div>
    );
}

export default App;
