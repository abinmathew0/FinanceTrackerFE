import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-modal"; // ✅ Import react-modal for success message

const API_URL = process.env.REACT_APP_API_URL;

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      setLoading(false);
      setSuccessModalIsOpen(true);
    } catch (err) {
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setSuccessModalIsOpen(false);
    navigate("/login"); // ✅ Redirect to login page after closing modal
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
          Create an Account
        </h2>
        {error && <p className="alert alert-danger text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control my-2"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
            style={{
              borderRadius: "5px",
              border: "1px solid #116a7b",
            }}
          />
          <input
            type="email"
            className="form-control my-2"
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
            type="password"
            className="form-control my-2"
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
                Signing up...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <p className="text-center mt-3" style={{ color: "#116a7b" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      {/* ✅ Success Modal */}
      <Modal
        isOpen={successModalIsOpen}
        onRequestClose={closeSuccessModal}
        className="modal-dialog modal-dialog-centered"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            maxWidth: "400px",
            margin: "auto",
            borderRadius: "10px",
            padding: "2rem",
            backgroundColor: "#ece5c7", // Cream background
            border: "1px solid #116a7b",
            color: "#116a7b",
          },
        }}
      >
        <div className="modal-content p-4 text-center">
          <h4 className="text-success">🎉 Registration Successful!</h4>
          <p>You have successfully created an account. You can now log in.</p>
          <button
            className="btn btn-primary w-50 mx-auto"
            onClick={closeSuccessModal}
            style={{
              backgroundColor: "#116a7b",
              color: "#ece5c7",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "5px",
            }}
          >
            Go to Login
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Register;
