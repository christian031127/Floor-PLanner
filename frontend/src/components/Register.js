import React, { useState, useEffect } from "react";
import "../styles/Login.css";
import { registerUser } from "../api/api";

const Register = ({ isOpen, onClose, switchToLogin }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [isClosing, setIsClosing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Megakadályozza az oldal frissítését
    setError(null);
    setSuccess(null);

    try {
      const response = await registerUser(formData);

      if (response.error) {
        setError(response.error); // Hibát mutatunk
      } else {
        setSuccess("Registration successful!");
        setTimeout(() => {
          handleClose();
          switchToLogin(); // Átirányítás a login modalra
        }, 1500);
      }
    } catch (error) {
      setError("Server error. Please try again later!");
    }
  };

  return (
    <div className={`login-modal-overlay ${isOpen ? "open" : ""} ${isClosing ? "fade-out" : ""}`}>
      <div className={`card ${showModal ? "slide-down" : ""} ${isClosing ? "fade-out" : ""}`}>
        <button className="close-button" onClick={handleClose}>✖</button>
        <h2 className="login">Register</h2>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit}>
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
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })} 
              required 
            />
            <span>Email</span>
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

          <button type="submit" className="enter">Sign Up</button>
        </form>

        <p>Already have an account? <button className="switch-button" onClick={switchToLogin}>Login</button></p>
      </div>
    </div>
  );
};

export default Register;
