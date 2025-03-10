import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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
    <>
      {/* Mobile-only CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            .navbar-user-dropdown {
              text-align: center;
              margin: 1rem 0;
            }
            .navbar-dashboard {
              margin-top: 1rem;
            }
          }
        `}
      </style>
      <nav
        className="navbar navbar-expand-lg"
        style={{
          backgroundColor: "#ece5c7", // Cream background
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="container">
          <Link
            className="navbar-brand"
            to="/"
            style={{ color: "#116a7b", fontWeight: "bold", fontSize: "1.5rem" }}
          >
            Finance Tracker
          </Link>
          {/* Modern Hamburger Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavModern"
            aria-controls="navbarNavModern"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ border: "none" }}
          >
            <span
              className="navbar-toggler-icon"
              style={{
                filter:
                  "invert(29%) sepia(83%) saturate(2702%) hue-rotate(167deg) brightness(93%) contrast(90%)",
              }}
            ></span>
          </button>
          {/* Collapsible Content */}
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNavModern"
          >
            {user ? (
              <div className="d-flex flex-column flex-lg-row align-items-lg-center">
                <Link
                  className="btn navbar-dashboard me-lg-3 mb-2 mb-lg-0"
                  to="/dashboard"
                  style={{
                    backgroundColor: "#116a7b", // Deep blue
                    color: "#ece5c7", // Cream text
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  className="btn me-lg-3 mb-2 mb-lg-0"
                  to="/"
                  style={{
                    backgroundColor: "#c2dedc", // Mint
                    color: "#116a7b", // Deep blue text
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                  }}
                >
                  Transactions
                </Link>
                <Link
                  className="btn me-lg-3 mb-2 mb-lg-0"
                  to="/stats"
                  style={{
                    backgroundColor: "#cdc2ae", // Beige
                    color: "#116a7b",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                  }}
                >
                  Stats
                </Link>
                {/* User Dropdown */}
                <div className="dropdown navbar-user-dropdown">
                  <span
                    className="dropdown-toggle"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      color: "#116a7b",
                      fontWeight: "500",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    {user.name}
                  </span>
                  <ul className="dropdown-menu" aria-labelledby="userDropdown">
                    <li>
                      <Link className="dropdown-item" to="/change-password">
                        Change Password
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <Link
                  className="btn mx-2"
                  to="/login"
                  style={{
                    backgroundColor: "#116a7b",
                    color: "#ece5c7",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                  }}
                >
                  Login
                </Link>
                <Link
                  className="btn"
                  to="/register"
                  style={{
                    backgroundColor: "#2ECC71", // Green for sign up
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
