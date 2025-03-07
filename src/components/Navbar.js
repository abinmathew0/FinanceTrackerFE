import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Required for collapse functionality

const API_URL = process.env.REACT_APP_API_URL;

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Function to fetch the logged-in user details
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial user fetch
    fetchUser();

    // Listen for a custom event to update the user state immediately on login
    window.addEventListener("userLoggedIn", fetchUser);

    return () => {
      window.removeEventListener("userLoggedIn", fetchUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Finance Tracker
        </Link>
        {/* Hamburger Icon */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        {/* Collapsible Content */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          {user ? (
            <div className="d-flex flex-column flex-lg-row align-items-lg-center">
              <Link
                className="btn btn-success me-lg-3 mb-2 mb-lg-0"
                to="/dashboard"
              >
                Dashboard
              </Link>
              <Link className="btn btn-primary me-lg-3 mb-2 mb-lg-0" to="/">
                Transactions
              </Link>
              <Link className="btn btn-info me-lg-3 mb-2 mb-lg-0" to="/stats">
                Stats
              </Link>
              <span className="mb-2 mb-lg-0 me-lg-3">👤 {user.name}</span>
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div>
              <Link className="btn btn-primary mx-2" to="/login">
                Login
              </Link>
              <Link className="btn btn-success" to="/register">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
