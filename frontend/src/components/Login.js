import React, { useState, useEffect } from "react";
import { loginUser } from "../api/api";
import "../styles/Login.css";

const Login = ({ isOpen, onClose, switchToRegister, setUser, setIsDropdownOpen }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isClosing, setIsClosing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      setTimeout(() => setShowModal(true), 50);
    } else {
      setIsClosing(true);
      setTimeout(() => {
        setShowModal(false);
        setIsClosing(false);
        document.body.classList.remove("modal-open");
      }, 500);
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setShowModal(false);
      setIsClosing(false);
      document.body.classList.remove("modal-open");
    }, 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await loginUser(formData);
      if (response.error) {
        setErrorMessage(response.error);
      } else {
        console.log("Bejelentkezés sikeres!");
        localStorage.setItem("user", JSON.stringify(response.user)); // Elmentjük a bejelentkezett felhasználót
        setUser(response.user); // Frissítjük a state-et
        setIsDropdownOpen(false); // Bezárjuk a dropdown menüt
        handleClose();
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className={`login-modal-overlay ${isOpen ? "open" : ""} ${isClosing ? "fade-out" : ""}`}>
      <div className={`card ${showModal ? "slide-down" : ""} ${isClosing ? "fade-out" : ""}`}>
        <button className="close-button" onClick={handleClose}>✖</button>
        <h2 className="login">Login</h2>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleLogin}>
          <div className="inputBox">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              required
            />
            <span>Username</span>
          </div>

          <div className="inputBox">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              required
            />
            <span>Password</span>
          </div>

          <button type="submit" className="enter">Enter</button>
        </form>

        <p>Don't have an account? <button className="switch-button" onClick={switchToRegister}>Sign Up</button></p>
      </div>
    </div>
  );
};

export default Login;