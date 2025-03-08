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
      <h2 className="text-center mb-4" style={{ marginTop: "7rem" }}>
        Create an Account
      </h2>
      {error && <p className="alert alert-danger">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="col-10 col-md-6 col-lg-4 mx-auto"
      >
        <input
          type="text"
          className="form-control my-2"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          className="form-control my-2"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          className="form-control my-2"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button
          className="btn btn-success w-100"
          type="submit"
          disabled={loading}
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

      {/* ✅ Success Modal */}
      <Modal
        isOpen={successModalIsOpen}
        onRequestClose={closeSuccessModal}
        className="modal-dialog"
      >
        <div className="modal-content p-4 text-center w-50 mx-auto">
          <h4 className="text-success">🎉 Registration Successful!</h4>
          <p>You have successfully created an account. You can now log in.</p>
          <button
            className="btn btn-primary w-50 mx-auto"
            onClick={closeSuccessModal}
          >
            Go to Login
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Register;
