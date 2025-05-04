import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, setUser }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"));
    const [showLogin, setShowLogin] = useState(!isLoggedIn);
    const [showRegister, setShowRegister] = useState(false);
    const navigate = useNavigate();

    const handleLoginSuccess = (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        setIsLoggedIn(true);
        setShowLogin(false);
        showRegister(false);
    };

    const handleLoginClose = () => {
        setShowLogin(false);
        navigate("/");
        toast.error("You need to log in to access Plan page.");
    }

    const handleRegisterClose = () => {
        setShowRegister(false);
        navigate("/");
        toast.error("You need to log in to access Plan page.");
    };

    const switchToRegister = () => {
        setShowLogin(false);
        setShowRegister(true);
    };

    const switchToLogin = () => {
        setShowRegister(false);
        setShowLogin(true);
    };

    return (
        <>
            {isLoggedIn ? (
                children
            ) : (
                <>
                    {showLogin && (
                        <Login
                            isOpen={showLogin}
                            onClose={handleLoginClose}
                            switchToRegister={switchToRegister}
                            setUser={handleLoginSuccess}
                            setIsDropdownOpen={() => { }}
                        />
                    )}

                    {showRegister && (
                        <Register
                            isOpen={showRegister}
                            onClose={handleRegisterClose}
                            switchToLogin={switchToLogin}
                            setUser={handleLoginSuccess}
                        />
                    )}

                    <div style={{ padding: "80px", textAlign: "center", color: "#444" }}>
                        Please log in to access this page.
                    </div>
                </>
            )}
        </>
    );
};

export default ProtectedRoute;