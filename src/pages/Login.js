import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, credentials);
      localStorage.setItem("token", res.data.token);
      // Dispatch custom event to update Navbar immediately
      window.dispatchEvent(new Event("userLoggedIn"));
      setLoading(false);
      navigate("/"); // Redirect to home after login
    } catch (err) {
      console.error("Login failed", err);
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div
        className="card shadow-sm mb-5 mx-auto"
        style={{
          maxWidth: "500px",
          borderRadius: "10px",
          backgroundColor: "#ece5c7", // Cream background
          padding: "1.5rem",
          marginTop: "3rem",
        }}
      >
        <h2
          className="text-center mb-4"
          style={{ color: "#116a7b", fontWeight: "bold" }}
        >
          Welcome to Finance Tracker
        </h2>
        <p className="text-center mb-4" style={{ color: "#116a7b" }}>
          Login to continue.
        </p>
        {error && <p className="alert alert-danger text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            className="form-control my-2"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            style={{
              borderRadius: "5px",
              border: "1px solid #116a7b",
            }}
          />
          <input
            className="form-control my-2"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={{
              borderRadius: "5px",
              border: "1px solid #116a7b",
            }}
          />
          <button
            className="btn w-100 mt-3"
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#116a7b", // Deep blue
              color: "#ece5c7", // Cream text
              border: "none",
              padding: "0.75rem",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p className="text-center mt-3" style={{ color: "#116a7b" }}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
