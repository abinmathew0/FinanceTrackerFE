import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "https://myproj-backend-appabc12346.azurewebsites.net/api";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactions(res.data);
      setFilteredTransactions(res.data);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
    }
  };

  const handleFilter = () => {
    let filtered = transactions;

    if (filterType) {
      filtered = filtered.filter((txn) => txn.type === filterType);
    }

    if (filterCategory) {
      filtered = filtered.filter((txn) => txn.category === filterCategory);
    }

    if (startDate) {
      filtered = filtered.filter(
        (txn) => new Date(txn.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (txn) => new Date(txn.date) <= new Date(endDate)
      );
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterCategory("");
    setStartDate("");
    setEndDate("");
    setFilteredTransactions(transactions);
  };

  // ✅ Delete Transaction Function
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactions(transactions.filter((txn) => txn.id !== id));
      setFilteredTransactions(
        filteredTransactions.filter((txn) => txn.id !== id)
      );
    } catch (err) {
      console.error("❌ Error deleting transaction:", err);
    }
  };

  return (
    <div className="container">
      <h2 className="mt-5 mb-3 text-center">Transaction History</h2>

      {/* 🔹 Filters */}
      <div className="row mb-3">
        <div className="col-md-3">
          <select
            className="form-control"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-control"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Salary">Salary</option>
            <option value="Business Profits">Business Profits</option>
            <option value="Groceries">Groceries</option>
            <option value="Transportation">Transportation</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Travel">Travel</option>
          </select>
        </div>

        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* 🔹 Buttons Row - Filters (Left) | Add Transaction & Dashboard (Right) */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* ✅ Filter & Clear Buttons */}
        <div>
          <button className="btn btn-primary me-2" onClick={handleFilter}>
            Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {/* ✅ Add Transaction & Dashboard Buttons */}
        <div>
          <Link to="/dashboard" className="btn btn-success me-2">
            📊 Dashboard
          </Link>
          <Link to="/add-transaction" className="btn btn-success">
            + Add Transaction
          </Link>
        </div>
      </div>

      {/* 🔹 Transactions Table */}
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Category</th>
            <th>Date</th>
            <th>Action</th> {/* ✅ Added Column for Delete Button */}
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.name}</td>
                <td>${txn.amount}</td>
                <td>{txn.type}</td>
                <td>{txn.category}</td>
                <td>{new Date(txn.date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(txn.id)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
