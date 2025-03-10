import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const AddTransaction = () => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "expense",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  const incomeCategories = [
    "Salary/Wages",
    "Business Income",
    "Investments & Dividends",
    "Rental Income",
    "Capital Gains",
    "Pension & Social Security",
    "Bonuses & Commissions",
    "Side Hustles & Gig Work",
  ];

  const expenseCategories = [
    "Rent/Mortgage",
    "Utilities",
    "Groceries",
    "Dining Out",
    "Transportation",
    "Insurance",
    "Loan Payments",
    "Entertainment",
    "Healthcare & Medications",
    "Subscriptions",
    "Shopping",
    "Travel",
    "Gifts",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/transactions`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      window.location.href = "/";
    } catch (err) {
      console.error("Error adding transaction", err);
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div
        className="card shadow-sm mx-auto"
        style={{
          maxWidth: "600px",
          borderRadius: "10px",
          backgroundColor: "#ece5c7", // Cream background
          padding: "2rem",
        }}
      >
        <h2
          className="text-center mb-4"
          style={{ color: "#116a7b", fontWeight: "bold" }}
        >
          Add Transaction
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control my-2"
            type="text"
            name="name"
            placeholder="Transaction Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              borderRadius: "5px",
              border: "1px solid #116a7b",
            }}
          />

          <input
            className="form-control my-2"
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
            style={{
              borderRadius: "5px",
              border: "1px solid #116a7b",
            }}
          />

          <select
            className="form-control my-2"
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={{
              borderRadius: "5px",
              border: "1px solid #116a7b",
            }}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            className="form-control my-2"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              borderRadius: "5px",
              border: "1px solid #116a7b",
            }}
          >
            <option value="">Select Category</option>
            {(formData.type === "income"
              ? incomeCategories
              : expenseCategories
            ).map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>

          <button
            className="btn w-100 mt-3"
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
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>{" "}
                Adding...
              </>
            ) : (
              "Add Transaction"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
