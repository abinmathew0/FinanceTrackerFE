import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transactions from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
// Import the ChangePassword component
import ChangePassword from "./pages/ChangePassword";

const isAuthenticated = () => !!localStorage.getItem("token");

const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="flex-grow-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected Routes */}
          <Route
            path="/"
            element={<ProtectedRoute element={<Transactions />} />}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} />}
          />
          <Route
            path="/stats"
            element={<ProtectedRoute element={<Stats />} />}
          />
          <Route
            path="/add-transaction"
            element={<ProtectedRoute element={<AddTransaction />} />}
          />
          <Route
            path="/change-password"
            element={<ProtectedRoute element={<ChangePassword />} />}
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
