import React, { useState } from 'react';

function AutomaticUpdater() {
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [category, setCategory] = useState('');
  const [recurringPayments, setRecurringPayments] = useState([]);

  // Expense categories from Transactions.js
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
    "Other",
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would typically handle the form submission,
    // e.g., send the data to a backend or store it locally.
    const newPayment = {
      itemName,
      amount: parseFloat(amount), // Convert amount to a number
      updateDate,
      category,
    };
    setRecurringPayments([...recurringPayments, newPayment]);

    console.log('Submitted:', newPayment);
    // Clear the form
    setItemName('');
    setAmount('');
    setUpdateDate('');
    setCategory(''); // Clear category as well
  };

  return (
    <div className="automatic-updater-container">
      <h2>Automatic Updater</h2>
      <form onSubmit={handleSubmit}>
         <div>
          <label htmlFor="itemName">Item Name:</label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="itemName">Item Name:</label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="updateDate">Update Date:</label>
          <input
            type="date"
            id="updateDate"
            value={updateDate}
            onChange={(e) => setUpdateDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Recurring Payment</button>
      </form>

      <div className="recurring-payments-list">
        <h3>Added Recurring Payments</h3>
        {recurringPayments.length === 0 ? (
          <p>No recurring payments added yet.</p>
        ) : (
          <ul>
            {recurringPayments.map((payment, index) => (
              <li key={index}>
                <strong>{payment.itemName}</strong> - ${payment.amount.toFixed(2)} - {payment.category} - Update on: {payment.updateDate}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AutomaticUpdater;