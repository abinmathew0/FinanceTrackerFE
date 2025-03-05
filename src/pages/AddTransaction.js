import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://myproj-backend-appabc12346.azurewebsites.net/api";

const AddTransaction = () => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "income",
    category: "",
  });

  const incomeCategories = [
    "Salary",
    "Business Profits",
    "Freelancing",
    "Investments",
    "Interest",
    "Rental Income",
    "Dividends",
    "Other Income",
  ];

  const expenseCategories = [
    "Food & Dining",
    "Groceries",
    "Transportation",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Travel",
    "Insurance",
    "Debt Payments",
    "Other Expenses",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/transactions`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      window.location.href = "/";
    } catch (err) {
      console.error("Error adding transaction", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit} className="w-50 mx-auto">
        <input
          className="form-control my-2"
          type="text"
          name="name"
          placeholder="Transaction Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          className="form-control my-2"
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        <select
          className="form-control my-2"
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* 🔹 Show categories dynamically based on type selection */}
        <select
          className="form-control my-2"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
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
          <option value="custom">Other (Enter manually)</option>
        </select>

        {/* 🔹 Show input field for custom category if "Other" is selected */}
        {formData.category === "custom" && (
          <input
            className="form-control my-2"
            type="text"
            name="category"
            placeholder="Enter Custom Category"
            onChange={handleChange}
            required
          />
        )}

        <button className="btn btn-success w-100">Add Transaction</button>
      </form>
    </div>
  );
};

export default AddTransaction;
