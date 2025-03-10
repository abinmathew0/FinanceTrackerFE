import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select"; // ✅ Import react-select
import { Link } from "react-router-dom";
import Modal from "react-modal"; // ✅ Import Modal for confirmation dialog

const API_URL = process.env.REACT_APP_API_URL;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  // New states for edit feature
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // Updated categories (includes new expense categories)
  const categories = [
    { value: "Salary/Wages", label: "Salary/Wages" },
    { value: "Business Income", label: "Business Income" },
    { value: "Investments & Dividends", label: "Investments & Dividends" },
    { value: "Rental Income", label: "Rental Income" },
    { value: "Capital Gains", label: "Capital Gains" },
    { value: "Pension & Social Security", label: "Pension & Social Security" },
    { value: "Bonuses & Commissions", label: "Bonuses & Commissions" },
    { value: "Side Hustles & Gig Work", label: "Side Hustles & Gig Work" },
    { value: "Rent/Mortgage", label: "Rent/Mortgage" },
    { value: "Utilities", label: "Utilities" },
    { value: "Groceries", label: "Groceries" },
    { value: "Dining Out", label: "Dining Out" },
    { value: "Transportation", label: "Transportation" },
    { value: "Insurance", label: "Insurance" },
    { value: "Loan Payments", label: "Loan Payments" },
    { value: "Entertainment", label: "Entertainment" },
    { value: "Healthcare & Medications", label: "Healthcare & Medications" },
    { value: "Subscriptions", label: "Subscriptions" },
    { value: "Shopping", label: "Shopping" },
    { value: "Travel", label: "Travel" },
    { value: "Gifts", label: "Gifts" },
    { value: "Other", label: "Other" },
  ];

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

    if (filterCategory.length > 0) {
      const selectedCategories = filterCategory.map((cat) => cat.value);
      filtered = filtered.filter((txn) =>
        selectedCategories.includes(txn.category)
      );
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
    setFilterCategory([]);
    setStartDate("");
    setEndDate("");
    setFilteredTransactions(transactions);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (transaction) => {
    setSelectedTransaction(transaction);
    setDeleteModalIsOpen(true);
  };

  // Close Delete Modal
  const closeDeleteModal = () => {
    setSelectedTransaction(null);
    setDeleteModalIsOpen(false);
  };

  // Confirm and Delete Transaction
  const handleDelete = async () => {
    if (!selectedTransaction) return;

    try {
      await axios.delete(`${API_URL}/transactions/${selectedTransaction.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactions(
        transactions.filter((txn) => txn.id !== selectedTransaction.id)
      );
      setFilteredTransactions(
        filteredTransactions.filter((txn) => txn.id !== selectedTransaction.id)
      );
      closeDeleteModal();
    } catch (err) {
      console.error("❌ Error deleting transaction:", err);
    }
  };

  // Open Edit Modal and set transaction to edit
  const openEditModal = (transaction) => {
    setTransactionToEdit(transaction);
    setEditModalIsOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setTransactionToEdit(null);
    setEditModalIsOpen(false);
  };

  // Handle changes in edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setTransactionToEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit edit changes
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!transactionToEdit) return;
    try {
      const updatedTransaction = { ...transactionToEdit };
      await axios.put(
        `${API_URL}/transactions/${transactionToEdit.id}`,
        updatedTransaction,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const updatedTransactions = transactions.map((txn) =>
        txn.id === transactionToEdit.id ? updatedTransaction : txn
      );
      setTransactions(updatedTransactions);
      const updatedFiltered = filteredTransactions.map((txn) =>
        txn.id === transactionToEdit.id ? updatedTransaction : txn
      );
      setFilteredTransactions(updatedFiltered);
      closeEditModal();
    } catch (err) {
      console.error("❌ Error updating transaction:", err);
    }
  };

  return (
    <div className="container">
      <h2 className="mt-5 mb-3 text-center">Transaction History</h2>
      <div className="row mb-3">
        <div className="col-md-3 col-12 mb-2">
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
        <div className="col-md-3 col-12 mb-2">
          <Select
            isMulti
            options={categories}
            value={filterCategory}
            onChange={setFilterCategory}
            placeholder="Select Categories"
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="col-md-3 col-12 mb-2">
          <input
            type="date"
            className="form-control"
            placeholder="Select start date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-3 col-12 mb-2">
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div className="mb-2">
          <button className="btn btn-primary me-2" onClick={handleFilter}>
            Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
        <div className="mb-2">
          <Link className="btn btn-success me-2" to="/dashboard">
            📊 Dashboard
          </Link>
          <Link className="btn btn-success" to="/add-transaction">
            + Add Transaction
          </Link>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Date</th>
              <th>Action</th>
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
                    <div className="d-flex">
                      <button
                        className="btn btn-warning btn-sm me-3"
                        onClick={() => openEditModal(txn)}
                      >
                        <span className="d-inline d-sm-none">✏️</span>
                        <span className="d-none d-sm-inline">✏️ Edit</span>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => openDeleteModal(txn)}
                      >
                        <span className="d-inline d-sm-none">🗑</span>
                        <span className="d-none d-sm-inline">🗑 Delete</span>
                      </button>
                    </div>
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
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        className="modal-dialog modal-dialog-centered"
      >
        <div
          className="modal-content p-3 text-center mx-auto mt-5"
          style={{ maxWidth: "500px", width: "90%" }}
        >
          <h4>Confirm Deletion</h4>
          <p>Are you sure you want to delete this transaction?</p>
          <button className="btn btn-danger me-2 mt-3" onClick={handleDelete}>
            Yes, Delete
          </button>
          <button className="btn btn-secondary mt-3" onClick={closeDeleteModal}>
            Cancel
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        className="modal-dialog modal-dialog-centered"
      >
        <div
          className="modal-content p-3 text-center mx-auto mt-5"
          style={{ maxWidth: "500px", width: "90%" }}
        >
          <h4>Edit Transaction</h4>
          <form onSubmit={handleEditSubmit}>
            <div className="form-group mt-3">
              <label>Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={transactionToEdit ? transactionToEdit.name : ""}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="form-group mt-3">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                className="form-control"
                value={transactionToEdit ? transactionToEdit.amount : ""}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="form-group mt-3">
              <label>Type</label>
              <select
                name="type"
                className="form-control"
                value={transactionToEdit ? transactionToEdit.type : ""}
                onChange={handleEditChange}
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group mt-3">
              <label>Category</label>
              <select
                name="category"
                className="form-control"
                value={transactionToEdit ? transactionToEdit.category : ""}
                onChange={handleEditChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mt-3">
              <label>Date</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={
                  transactionToEdit
                    ? new Date(transactionToEdit.date)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={handleEditChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-success mt-3 me-2">
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary mt-3"
              onClick={closeEditModal}
            >
              Cancel
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
