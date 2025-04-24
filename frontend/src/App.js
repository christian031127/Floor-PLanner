import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./components/Login";
import MyPlans from "./pages/MyPlans";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/plans" element={<MyPlans />} />
      </Routes>

      <ToastContainer
        position="top-center"
      />
    </Router>
  );
}

export default App;
