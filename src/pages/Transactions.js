import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select"; // ✅ Import react-select
import { Link } from "react-router-dom";
import Modal from "react-modal"; // ✅ Import Modal for confirmation dialog

const API_URL = process.env.REACT_APP_API_URL;
const itemsPerPage = 15; // Number of transactions to show per page

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
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

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
      setCurrentPage(1); // Reset pagination on initial load
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
    setCurrentPage(1); // Reset pagination when filters are applied
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterCategory([]);
    setStartDate("");
    setEndDate("");
    setFilteredTransactions(transactions);
    setCurrentPage(1); // Reset pagination when filters are cleared
  };

  // Download filtered transactions as CSV
  const downloadCSV = () => {
    const header = "Name,Amount,Type,Category,Date\n";
    const csvRows = filteredTransactions.map((txn) => {
      // Format date using localeDateString for readability
      const dateStr = new Date(txn.date).toLocaleDateString();
      return `${txn.name},${txn.amount},${txn.type},${txn.category},${dateStr}`;
    });
    const csvString = header + csvRows.join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "transactions.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  // Helper function to format date or return empty string for invalid date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  // Calculate total amount of displayed transactions
  const totalAmount = filteredTransactions.reduce(
    (acc, txn) => acc + Number(txn.amount),
    0
  );

  // Pagination: Only show a subset of filtered transactions
  const paginatedTransactions = filteredTransactions.slice(
    0,
    currentPage * itemsPerPage
  );

  return (
    <div className="container">
      {/* Main Heading */}
      <h2
        className="mt-5 mb-3 text-center"
        style={{ color: "#116a7b", fontWeight: "bold" }}
      >
        Transaction History
      </h2>
      {/* Filter Controls */}
      <div className="row mb-3">
        <div className="col-md-3 col-12 mb-2">
          <select
            className="form-control"
            style={{
              backgroundColor: "#c2dedc",
              color: "#116a7b",
              borderColor: "#116a7b",
            }}
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
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "#c2dedc",
                borderColor: "#116a7b",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "#116a7b",
              }),
            }}
          />
        </div>
        <div className="col-md-3 col-12 mb-2">
          <input
            type="date"
            className="form-control"
            style={{
              backgroundColor: "#c2dedc",
              color: "#116a7b",
              borderColor: "#116a7b",
            }}
            placeholder="Select start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-3 col-12 mb-2">
          <input
            type="date"
            className="form-control"
            style={{
              backgroundColor: "#c2dedc",
              color: "#116a7b",
              borderColor: "#116a7b",
            }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      {/* Action Buttons */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div className="mb-2">
          <button
            className="btn me-2"
            style={{
              backgroundColor: "#116a7b",
              borderColor: "#116a7b",
              color: "#ece5c7",
            }}
            onClick={handleFilter}
          >
            Apply Filters
          </button>
          <button
            className="btn"
            style={{
              backgroundColor: "#cdc2ae",
              borderColor: "#116a7b",
              color: "#116a7b",
            }}
            onClick={clearFilters}
          >
            Clear Filters
          </button>
          {/* Download CSV Button */}
          <button
            className="btn ms-2"
            style={{
              backgroundColor: "#116a7b",
              borderColor: "#116a7b",
              color: "#ece5c7",
            }}
            onClick={downloadCSV}
          >
            Download CSV
          </button>
        </div>
        <div className="mb-2">
          <Link
            className="btn me-2"
            style={{
              backgroundColor: "#116a7b",
              borderColor: "#116a7b",
              color: "#ece5c7",
            }}
            to="/dashboard"
          >
            📊 Dashboard
          </Link>
          <Link
            className="btn"
            style={{
              backgroundColor: "#116a7b",
              borderColor: "#116a7b",
              color: "#ece5c7",
            }}
            to="/add-transaction"
          >
            + Add Transaction
          </Link>
        </div>
      </div>
      {/* Transactions Table */}
      <div className="table-responsive">
        <table className="table mt-3">
          <thead style={{ backgroundColor: "#cdc2ae", color: "#116a7b" }}>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: "#ece5c7", color: "#116a7b" }}>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((txn) => (
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
                        style={{
                          backgroundColor: "#cdc2ae",
                          color: "#116a7b",
                          borderColor: "#116a7b",
                        }}
                        onClick={() => openEditModal(txn)}
                      >
                        <span className="d-inline d-sm-none">✏️</span>
                        <span className="d-none d-sm-inline">✏️ Edit</span>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{
                          backgroundColor: "#E74C3C",
                          borderColor: "#E74C3C",
                          color: "#ece5c7",
                        }}
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
          {filteredTransactions.length > 0 && (
            <tfoot style={{ backgroundColor: "#cdc2ae", color: "#116a7b" }}>
              <tr>
                <td colSpan="1">
                  <strong>Total</strong>
                </td>
                <td colSpan="5">
                  <strong>${totalAmount.toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {/* Show More Button for Pagination */}
      {filteredTransactions.length > paginatedTransactions.length && (
        <div className="text-center my-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Show More
          </button>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        className="modal-dialog modal-dialog-centered"
      >
        <div
          className="modal-content p-3 text-center mx-auto mt-5"
          style={{
            maxWidth: "500px",
            width: "90%",
            backgroundColor: "#ece5c7",
            color: "#116a7b",
          }}
        >
          <h4>Confirm Deletion</h4>
          <p>Are you sure you want to delete this transaction?</p>
          <button
            className="btn btn-danger me-2 mt-3"
            onClick={handleDelete}
            style={{
              backgroundColor: "#E74C3C",
              borderColor: "#E74C3C",
              color: "#ece5c7",
            }}
          >
            Yes, Delete
          </button>
          <button
            className="btn btn-secondary mt-3"
            onClick={closeDeleteModal}
            style={{
              backgroundColor: "#cdc2ae",
              borderColor: "#116a7b",
              color: "#116a7b",
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>
      {/* Edit Transaction Modal */}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        className="modal-dialog modal-dialog-centered"
      >
        <div
          className="modal-content p-3 text-center mx-auto mt-5"
          style={{
            maxWidth: "500px",
            width: "90%",
            backgroundColor: "#ece5c7",
            color: "#116a7b",
          }}
        >
          <h4>Edit Transaction</h4>
          <form onSubmit={handleEditSubmit}>
            <div className="form-group mt-3">
              <label>Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                style={{
                  backgroundColor: "#c2dedc",
                  color: "#116a7b",
                  borderColor: "#116a7b",
                }}
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
                style={{
                  backgroundColor: "#c2dedc",
                  color: "#116a7b",
                  borderColor: "#116a7b",
                }}
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
                style={{
                  backgroundColor: "#c2dedc",
                  color: "#116a7b",
                  borderColor: "#116a7b",
                }}
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
                style={{
                  backgroundColor: "#c2dedc",
                  color: "#116a7b",
                  borderColor: "#116a7b",
                }}
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
                style={{
                  backgroundColor: "#c2dedc",
                  color: "#116a7b",
                  borderColor: "#116a7b",
                }}
                value={
                  transactionToEdit ? formatDate(transactionToEdit.date) : ""
                }
                onChange={handleEditChange}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-success mt-3 me-2"
              style={{
                backgroundColor: "#116a7b",
                borderColor: "#116a7b",
                color: "#ece5c7",
              }}
            >
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary mt-3"
              style={{
                backgroundColor: "#cdc2ae",
                borderColor: "#116a7b",
                color: "#116a7b",
              }}
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
