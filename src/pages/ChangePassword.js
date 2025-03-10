import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Password changed successfully. Redirecting...");
      setLoading(false);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div
        className="card shadow-sm mx-auto"
        style={{
          maxWidth: "500px",
          borderRadius: "10px",
          backgroundColor: "#ece5c7", // Cream background
          padding: "2rem",
          marginTop: "7rem",
        }}
      >
        <h2
          className="text-center mb-4"
          style={{ color: "#116a7b", fontWeight: "bold" }}
        >
          Change Password
        </h2>
        {error && <p className="alert alert-danger text-center">{error}</p>}
        {message && (
          <p className="alert alert-success text-center">{message}</p>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="form-control my-2"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            style={{
              borderRadius: "5px",
              border: "1px solid #116a7b",
            }}
          />
          <input
            type="password"
            className="form-control my-2"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{
              borderRadius: "5px",
              border: "1px solid #116a7b",
            }}
          />
          <input
            type="password"
            className="form-control my-2"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
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
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
