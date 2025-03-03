import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // ✅ Footer is still present
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transactions from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import Dashboard from "./pages/Dashboard"; // ✅ Import Dashboard

const isAuthenticated = () => !!localStorage.getItem("token"); // ✅ Check if token exists

const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {" "}
      {/* ✅ Ensure full-height layout */}
      <Navbar />
      <div className="flex-grow-1">
        {" "}
        {/* ✅ Allows content to expand */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={<ProtectedRoute element={<Transactions />} />}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} />}
          />{" "}
          {/* ✅ Added Dashboard */}
          <Route
            path="/add-transaction"
            element={<ProtectedRoute element={<AddTransaction />} />}
          />
        </Routes>
      </div>
      <Footer /> {/* ✅ Footer is now always visible */}
    </div>
  );
};

export default App;
