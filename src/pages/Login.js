import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/auth/login`, credentials);
      localStorage.setItem("token", res.data.token);
      // Dispatch custom event to update Navbar immediately
      window.dispatchEvent(new Event("userLoggedIn"));
      navigate("/"); // Redirect to home after login
    } catch (err) {
      console.error("Login failed", err);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4" style={{ marginTop: "9rem" }}>
        Welcome to Finance Tracker. Login to continue.
      </h2>
      {error && <p className="alert alert-danger text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="w-50 mx-auto">
        <input
          className="form-control my-2"
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          className="form-control my-2"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary w-100">Login</button>
      </form>

      <p className="text-center mt-3">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
