import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = process.env.REACT_APP_API_URL;

// Updated expense categories with additional ones
const expenseCategories = [
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
];

const Stats = () => {
  const [transactions, setTransactions] = useState([]);
  const [view, setView] = useState("monthly"); // "monthly" or "yearly"
  // Limits stored as an object: { [category]: { monthly: number, yearly: number } }
  const [limits, setLimits] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Custom month selection
  const [useCustom, setUseCustom] = useState(false);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Load saved limits from localStorage
  useEffect(() => {
    const savedLimits = localStorage.getItem("expenseLimits");
    if (savedLimits) {
      setLimits(JSON.parse(savedLimits));
    }
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTransactions(res.data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };
    fetchTransactions();
  }, []);

  // Filter transactions based on selected view:
  // If using custom selection, filter by selectedMonth & selectedYear.
  // Otherwise, if view is "monthly" use current month and year,
  // or if view is "yearly", filter by current year.
  const filteredTransactions = transactions.filter((txn) => {
    const txnDate = new Date(txn.date);
    if (useCustom) {
      return (
        txnDate.getMonth() === Number(selectedMonth) &&
        txnDate.getFullYear() === Number(selectedYear)
      );
    } else {
      const now = new Date();
      if (view === "monthly") {
        return (
          txnDate.getMonth() === now.getMonth() &&
          txnDate.getFullYear() === now.getFullYear()
        );
      }
      return txnDate.getFullYear() === now.getFullYear();
    }
  });

  // Overall Metrics (includes both income and expense)
  const totalIncome = filteredTransactions
    .filter((txn) => txn.type === "income")
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
  const totalExpense = filteredTransactions
    .filter((txn) => txn.type === "expense")
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
  const netIncome = totalIncome - totalExpense;

  // Compute spending by expense category.
  const spendingByCategory = {};
  filteredTransactions.forEach((txn) => {
    if (txn.type === "expense") {
      spendingByCategory[txn.category] =
        (spendingByCategory[txn.category] || 0) + Number(txn.amount);
    }
  });

  // Historical & Snapshot Metrics Calculations

  // Category Breakdown sorted in descending order
  const categoryBreakdown = Object.keys(spendingByCategory).map((cat) => {
    const amount = spendingByCategory[cat];
    const percentage =
      totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(2) : "0.00";
    return { category: cat, amount, percentage };
  });
  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  const expenseTransactions = filteredTransactions.filter(
    (txn) => txn.type === "expense"
  );
  const expenseCount = expenseTransactions.length;
  const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;
  const variance =
    expenseCount > 0
      ? expenseTransactions
          .map((txn) => Math.pow(Number(txn.amount) - avgExpense, 2))
          .reduce((sum, val) => sum + val, 0) / expenseCount
      : 0;
  const stdDeviation = Math.sqrt(variance);
  const topExpenses = [...expenseTransactions]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  // Ongoing & Dynamic Metrics Calculations (based on current month)
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentMonthExpenseTransactions = transactions.filter((txn) => {
    const d = new Date(txn.date);
    return (
      txn.type === "expense" &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  });
  const runningTotal = currentMonthExpenseTransactions.reduce(
    (sum, txn) => sum + Number(txn.amount),
    0
  );
  const daysElapsed = currentDate.getDate();
  const burnRate = daysElapsed > 0 ? runningTotal / daysElapsed : 0;

  // 7-day Rolling Average
  const datesInMonth = [];
  for (let i = 1; i <= daysElapsed; i++) {
    const date = new Date(currentYear, currentMonth, i).toLocaleDateString();
    datesInMonth.push(date);
  }
  const dailyTotals = datesInMonth.map(
    (date) =>
      currentMonthExpenseTransactions
        .filter((txn) => new Date(txn.date).toLocaleDateString() === date)
        .reduce((sum, txn) => sum + Number(txn.amount), 0) || 0
  );
  const last7Days = dailyTotals.slice(-7);
  const rollingAvg =
    last7Days.length > 0
      ? last7Days.reduce((sum, val) => sum + val, 0) / last7Days.length
      : 0;

  const recurringCategories = ["Rent/Mortgage", "Utilities", "Subscriptions"];
  const recurringExpense = currentMonthExpenseTransactions.reduce(
    (sum, txn) =>
      recurringCategories.includes(txn.category)
        ? sum + Number(txn.amount)
        : sum,
    0
  );
  const nonRecurringExpense = runningTotal - recurringExpense;

  const currentMonthIncome = transactions
    .filter((txn) => {
      const d = new Date(txn.date);
      return (
        txn.type === "income" &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    })
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
  const netCashFlow = currentMonthIncome - runningTotal;
  const savingsRate =
    currentMonthIncome > 0
      ? ((currentMonthIncome - runningTotal) / currentMonthIncome) * 100
      : 0;

  const daysInMonthCalc = new Date(currentYear, currentMonth + 1, 0).getDate();
  const expenseForecast = burnRate * daysInMonthCalc;

  const todayStr = currentDate.toLocaleDateString();
  const todayExpense = currentMonthExpenseTransactions
    .filter((txn) => new Date(txn.date).toLocaleDateString() === todayStr)
    .reduce((sum, txn) => sum + Number(txn.amount), 0);

  // ------------------ Dynamic Alerts & Anomaly Detection ------------------
  const anomalyAlerts = [];
  if (todayExpense > rollingAvg * 2) {
    anomalyAlerts.push("High spending today!");
  }
  if (avgExpense > 0 && stdDeviation > 0.75 * avgExpense) {
    anomalyAlerts.push("High spending variability detected!");
  }
  let overLimitCount = 0;
  expenseCategories.forEach((cat) => {
    const categoryName = cat.value;
    const spending = spendingByCategory[categoryName] || 0;
    const limitVal = (limits[categoryName] && limits[categoryName][view]) || 0;
    let expected = 0;
    if (view === "monthly") {
      const daysInMonthCalc = new Date(
        currentYear,
        currentMonth + 1,
        0
      ).getDate();
      const currentDay = currentDate.getDate();
      expected = (limitVal / daysInMonthCalc) * currentDay;
    } else {
      const currentMonthVal = currentDate.getMonth() + 1;
      expected = (limitVal / 12) * currentMonthVal;
    }
    const status =
      limitVal > 0
        ? spending > limitVal
          ? "Over Limit"
          : spending > expected
          ? "Above Average"
          : "Within Limit"
        : "No Limit Set";
    if (status === "Over Limit") overLimitCount++;
  });
  if (overLimitCount > 2) {
    anomalyAlerts.push("Multiple categories are over limit!");
  }
  if (runningTotal > 0 && recurringExpense > 0.7 * runningTotal) {
    anomalyAlerts.push("Recurring expenses are dominating your spending!");
  }
  if (netCashFlow < 0) {
    anomalyAlerts.push("Negative cash flow detected!");
  }
  const anomalyDisplay =
    anomalyAlerts.length > 0
      ? anomalyAlerts.join(" | ")
      : "No anomalies detected";

  // Function to compute status for a category based on spending, limit, and expected spending.
  const getStatus = (spending, limit, expected) => {
    if (limit > 0) {
      if (spending > limit) return "Over Limit";
      else if (spending > expected) return "Above Average";
      else return "Within Limit";
    }
    return "No Limit Set";
  };

  // Handler for limit input changes.
  const handleLimitChange = (category, value) => {
    setLimits((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [view]: Number(value),
      },
    }));
  };

  // Save limits to localStorage.
  const saveLimits = () => {
    localStorage.setItem("expenseLimits", JSON.stringify(limits));
    setIsEditing(false);
  };

  // Compute total spending and total limits for defined expense categories.
  const totalSpendingByCategory = expenseCategories.reduce(
    (sum, cat) => sum + (spendingByCategory[cat.value] || 0),
    0
  );
  const totalLimitByCategory = expenseCategories.reduce(
    (sum, cat) => sum + ((limits[cat.value] && limits[cat.value][view]) || 0),
    0
  );

  // Generate month options (0 - 11) and a few years (e.g., currentYear-5 to currentYear+1)
  const monthOptions = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];
  const yearOptions = [];
  const startYear = currentYear - 5;
  for (let y = startYear; y <= currentYear + 1; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Transaction Stats</h2>

      {/* Overall Metrics Card */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row">
          <div className="col-md-4">
            <strong>Total Income:</strong> ${totalIncome.toFixed(2)}
          </div>
          <div className="col-md-4">
            <strong>Total Expense:</strong> ${totalExpense.toFixed(2)}
          </div>
          <div className="col-md-4">
            <strong>Net Income:</strong> ${netIncome.toFixed(2)}
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="d-flex justify-content-center mb-4">
        <button
          className={`btn me-2 ${
            view === "monthly" && !useCustom
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => {
            setView("monthly");
            setUseCustom(false);
          }}
        >
          Current Month
        </button>
        <button
          className={`btn me-2 ${
            view === "yearly" && !useCustom
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => {
            setView("yearly");
            setUseCustom(false);
          }}
        >
          Current Year
        </button>
        <button
          className={`btn ${useCustom ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setUseCustom(true)}
        >
          Select Month
        </button>
      </div>

      {/* Custom Month & Year Selection */}
      {useCustom && (
        <div className="d-flex justify-content-center mb-4">
          <select
            className="form-control w-auto me-2"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="form-control w-auto"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Edit/Save Controls for Limits */}
      <div className="d-flex justify-content-end mb-2">
        {!isEditing ? (
          <button
            className="btn btn-outline-secondary"
            onClick={() => setIsEditing(true)}
          >
            Edit Limits
          </button>
        ) : (
          <button className="btn btn-outline-success" onClick={saveLimits}>
            Save Limits
          </button>
        )}
      </div>

      {/* Expense Category Spending & Limits Table */}
      <div className="card p-3 shadow-sm">
        <h4>Spending by Category & Limits</h4>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Category</th>
                <th>Spending</th>
                <th>
                  Limit (
                  {useCustom
                    ? "Custom"
                    : view === "monthly"
                    ? "Monthly"
                    : "Yearly"}
                  )
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenseCategories.map((cat) => {
                const categoryName = cat.value;
                const spending = spendingByCategory[categoryName] || 0;
                const limitVal =
                  (limits[categoryName] && limits[categoryName][view]) || 0;
                const now = new Date();
                let expected = 0;
                if (view === "monthly") {
                  const daysInMonth = new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0
                  ).getDate();
                  const currentDay = useCustom
                    ? selectedMonth === now.getMonth()
                      ? now.getDate()
                      : daysInMonth
                    : now.getDate();
                  expected = (limitVal / daysInMonth) * currentDay;
                } else {
                  const currentMonth = now.getMonth() + 1;
                  expected = (limitVal / 12) * currentMonth;
                }
                const status = getStatus(spending, limitVal, expected);
                return (
                  <tr key={categoryName}>
                    <td>{categoryName}</td>
                    <td>${spending.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        value={
                          (limits[categoryName] &&
                            limits[categoryName][view]) ||
                          ""
                        }
                        placeholder="Set Limit"
                        onChange={(e) =>
                          handleLimitChange(categoryName, e.target.value)
                        }
                        className="form-control"
                        disabled={!isEditing}
                      />
                    </td>
                    <td>
                      {status === "Over Limit" ? (
                        <span className="text-danger">{status}</span>
                      ) : status === "Above Average" ? (
                        <span className="text-warning">{status}</span>
                      ) : status === "Within Limit" ? (
                        <span className="text-success">{status}</span>
                      ) : (
                        status
                      )}
                    </td>
                  </tr>
                );
              })}
              {/* Total row for Spending and Limits */}
              <tr>
                <th>Total</th>
                <th>${totalSpendingByCategory.toFixed(2)}</th>
                <th>${totalLimitByCategory.toFixed(2)}</th>
                <th></th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------ Additional Historical & Snapshot Metrics ------------------ */}
      <div className="mt-5">
        <h3>Historical & Snapshot Metrics</h3>
        <div className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>Total Spending:</strong> ${totalExpense.toFixed(2)}
          </p>
          <p>
            Sum all expenses to understand your overall cash outflow over the
            selected period.
          </p>
        </div>
        <div className="card p-3 mb-3 shadow-sm">
          <h5>Category Breakdown:</h5>
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>${Number(item.amount).toFixed(2)}</td>
                  <td>{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>Average Expense:</strong> ${avgExpense.toFixed(2)}
          </p>
          <p>
            Total spending divided by the number of transactions provides an
            understanding of your typical expense size.
          </p>
          <p>
            <strong>Transaction Frequency:</strong> {expenseCount}
          </p>
        </div>
        <div className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>Variance & Standard Deviation:</strong>{" "}
            {variance.toFixed(2)} & {stdDeviation.toFixed(2)}
          </p>
          <p>
            High variance indicates inconsistent spending, while low variance
            suggests stable expenses.
          </p>
        </div>
        <div className="card p-3 mb-3 shadow-sm">
          <h5>Top Expenses & Outliers:</h5>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {topExpenses.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.date).toLocaleDateString()}</td>
                  <td>{txn.category}</td>
                  <td>${Number(txn.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------ Additional Ongoing & Dynamic Metrics ------------------ */}
      <div className="mt-5">
        <h3>Ongoing & Dynamic Metrics</h3>
        <div className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>Running Total & Burn Rate (Current Month):</strong> $
            {runningTotal.toFixed(2)} | Daily Average: ${burnRate.toFixed(2)}
          </p>
        </div>
        <div className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>7-Day Rolling Average:</strong> ${rollingAvg.toFixed(2)}
          </p>
        </div>
        <div className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>Recurring vs. Non-Recurring Expenses:</strong> Recurring: $
            {recurringExpense.toFixed(2)} | Non-Recurring: $
            {nonRecurringExpense.toFixed(2)}
          </p>
        </div>
        <div className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>Savings Rate & Net Cash Flow (Current Month):</strong>{" "}
            Savings Rate: {savingsRate.toFixed(2)}% | Net Cash Flow: $
            {netCashFlow.toFixed(2)}
          </p>
        </div>
        <div className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>Expense Forecasting:</strong> Projected Monthly Expense: $
            {expenseForecast.toFixed(2)}
          </p>
        </div>
        {/* ------------------ Alerts & Anomaly Detection Section ------------------ */}
        <div className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>Alerts & Anomaly Detection:</strong> {anomalyDisplay}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
