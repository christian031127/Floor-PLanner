import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaList, FaSignOutAlt } from "react-icons/fa";
import "../styles/Navbar.css";
import Login from "./Login";
import Register from "./Register";
import { logoutUser } from "../api/api"
import { toast } from "react-toastify";

const Navbar = ({ user, setUser }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  //const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, [setUser]);

  useEffect(() => {
    const reason = localStorage.getItem("logout_reason");
    if (reason === "session_expired") {
      toast.error("Your session expired. Please log in again.", {
        autoClose: false,
        closeOnClick: true,
        draggable: false,
        position: "top-center",
      });

      localStorage.removeItem("logout_reason");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    const handleSessionExpiration = () => {
      const reason = localStorage.getItem("logout_reason");
      const userData = localStorage.getItem("user");

      if (!userData || reason === "session_expired") {
        setUser(null);
        localStorage.removeItem("logout_reason");
      }
    };

    handleSessionExpiration();
    window.addEventListener("focus", handleSessionExpiration);

    return () => {
      window.removeEventListener("focus", handleSessionExpiration);
    };
  }, [setUser]);

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
  }, [setUser]);

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

  // const handlePlanClick = (e) => {
  //   if (!user) {
  //     e.preventDefault();
  //     setIsLoginOpen(true);
  //   }
  // };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">HomeLy</Link>
      </div>

      <div className="nav-center">
        <Link to="/">Home</Link>
        {/* <Link to="/plan" onClick={handlePlanClick}>Plan</Link> */}
        <Link to="/plan">Plan</Link>
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
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/plans");
                  }}
                >
                  <span className="menu-label">My Plans</span>
                  <FaList className="menu-icon-right" />
                </button>
                <button
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="logout-button"
                >
                  <span className="menu-label">Logout</span>
                  <FaSignOutAlt className="menu-icon-right" />
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
