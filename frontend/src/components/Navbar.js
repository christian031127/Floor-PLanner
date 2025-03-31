import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../styles/Navbar.css";
import Login from "./Login";
import Register from "./Register";
import { logoutUser } from "../api/api";

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".user-menu")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const switchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.error) {
        console.error("Logout sikertelen:", response.error);
      } else {
        localStorage.removeItem("user");
        setUser(null);
        setIsLogoutConfirmOpen(false);
        setIsDropdownOpen(false);
        navigate("/");
      }
    } catch (error) {
      console.error("Hiba történt kijelentkezés közben:", error);
    }
  };

  const handlePlanClick = (e) => {
    if (!user) {
      e.preventDefault();
      setIsLoginOpen(true);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">HomeLy</Link>
      </div>

      <div className="nav-center">
        <Link to="/">Home</Link>
        <Link to="/plan" onClick={handlePlanClick}>Plan</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
      </div>

      <div className="nav-right">
        {user ? (
          <div className="user-menu">
            <button
              className="user-button styled-user-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="username">{user.username}</span>
              <FaUserCircle className="user-icon" />
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => setIsLogoutConfirmOpen(true)}>Logout</button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/plans");
                  }}
                >
                  My Plans
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-button" onClick={() => setIsLoginOpen(true)}>
            Login / Sign Up
          </button>
        )}
      </div>

      {isLoginOpen && (
        <Login
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          switchToRegister={switchToRegister}
          setUser={setUser}
          setIsDropdownOpen={setIsDropdownOpen}
        />
      )}

      {isRegisterOpen && (
        <Register
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          switchToLogin={switchToLogin}
          setUser={setUser}
        />
      )}

      {isLogoutConfirmOpen && (
        <div className="modal-overlay show">
          <div className="modal slide-in">
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button onClick={handleLogout}>Yes</button>
              <button onClick={() => setIsLogoutConfirmOpen(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
