import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = process.env.REACT_APP_API_URL;

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
  const [limits, setLimits] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Custom month selection
  const [useCustom, setUseCustom] = useState(false);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Load limits from backend on mount
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await axios.get(`${API_URL}/expense-limits`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLimits(res.data);
      } catch (err) {
        console.error("Error fetching limits:", err);
      }
    };
    fetchLimits();
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

  // Filter transactions based on selected view
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

  // Overall Metrics: Total Income, Total Expense, Net Income
  const totalIncome = filteredTransactions
    .filter((txn) => txn.type === "income")
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
  const totalExpense = filteredTransactions
    .filter((txn) => txn.type === "expense")
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
  const netIncome = totalIncome - totalExpense;

  // Compute spending by expense category
  const spendingByCategory = {};
  filteredTransactions.forEach((txn) => {
    if (txn.type === "expense") {
      spendingByCategory[txn.category] =
        (spendingByCategory[txn.category] || 0) + Number(txn.amount);
    }
  });

  // Calculate percentage breakdown for each category
  const categoryBreakdown = expenseCategories.map((cat) => {
    const spending = spendingByCategory[cat.value] || 0;
    const percentage =
      totalExpense > 0 ? ((spending / totalExpense) * 100).toFixed(2) : "0.00";
    return { category: cat.value, spending, percentage };
  });

  // New: Create a sorted array of categories with spending (nonzero) in descending order
  const categoryPercentageBreakdown = categoryBreakdown
    .filter((item) => Number(item.spending) > 0)
    .sort((a, b) => Number(b.percentage) - Number(a.percentage));

  // New: Compute average monthly spending for each expense category from all transactions (past 4-5 months data)
  const averageMonthlySpendingByCategory = {};
  const monthlyData = {};
  transactions.forEach((txn) => {
    if (txn.type === "expense") {
      const category = txn.category;
      const d = new Date(txn.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthlyData[category]) {
        monthlyData[category] = {};
      }
      if (!monthlyData[category][key]) {
        monthlyData[category][key] = 0;
      }
      monthlyData[category][key] += Number(txn.amount);
    }
  });
  Object.keys(monthlyData).forEach((category) => {
    const months = Object.values(monthlyData[category]);
    if (months.length > 0) {
      const sum = months.reduce((a, b) => a + b, 0);
      averageMonthlySpendingByCategory[category] = sum / months.length;
    } else {
      averageMonthlySpendingByCategory[category] = 0;
    }
  });
  const totalAvgMonthly = expenseCategories.reduce((sum, cat) => {
    return sum + (averageMonthlySpendingByCategory[cat.value] || 0);
  }, 0);


  // Budget vs. Actual: Check which categories are over their set limits
  const categoriesOverLimit = expenseCategories
    .filter((cat) => {
      const spending = spendingByCategory[cat.value] || 0;
      const limitVal = limits[cat.value] && limits[cat.value][view];
      return limitVal && spending > limitVal;
    })
    .map((cat) => cat.value);

  const simpleAlertMessage =
    categoriesOverLimit.length > 0
      ? `Categories over limit: ${categoriesOverLimit.join(", ")}`
      : "All spending within limits.";

  // Recurring vs. One-Time Expenses (assume these categories are recurring)
  const recurringCategories = ["Rent/Mortgage", "Utilities", "Subscriptions"];
  const recurringExpense = filteredTransactions
    .filter(
      (txn) =>
        txn.type === "expense" && recurringCategories.includes(txn.category)
    )
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
  //const nonRecurringExpense = totalExpense - recurringExpense;

  // Cash Flow Analysis & Savings Rate
  const savingsRate =
    totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(2) : "N/A";

  // Transaction Frequency Analysis
  const transactionCount = filteredTransactions.length;

  // Rolling Average (for expenses) for the last 7 days if in monthly view
  let rollingAvg = 0;
  if (view === "monthly") {
    // Get today's date, then calculate expenses for the last 7 days
    const today = new Date();
    const past7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      past7Days.push(d.toLocaleDateString());
    }
    const dailyTotals = past7Days.map((dateStr) => {
      return filteredTransactions
        .filter(
          (txn) =>
            txn.type === "expense" &&
            new Date(txn.date).toLocaleDateString() === dateStr
        )
        .reduce((sum, txn) => sum + Number(txn.amount), 0);
    });
    rollingAvg =
      dailyTotals.length > 0
        ? (dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length).toFixed(
            2
          )
        : 0;
  }

  // Variability & Consistency: Calculate average expense, variance, and standard deviation
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
  const stdDeviation = Math.sqrt(variance).toFixed(2);

  // Forecasting & Trend Projection: Forecast expense for the rest of the month (if monthly view)
  let expenseForecast = 0;
  if (view === "monthly") {
    const today = new Date();
    const currentDay = today.getDate();
    const totalDaysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    // Assume fixed rent is from the "Rent/Mortgage" category.
    const fixedRent = spendingByCategory["Rent/Mortgage"] || 0;

    // Calculate expense excluding rent.
    const expenseWithoutRent = totalExpense - fixedRent;

    // If we're past the first day, compute average for days excluding day 1.
    if (currentDay > 1) {
      const dailyAvgWithoutRent = expenseWithoutRent / (currentDay - 1);
      // Forecast = fixed rent + (average for remaining days * (total days minus 1))
      expenseForecast = (
        fixedRent +
        dailyAvgWithoutRent * (totalDaysInMonth - 1)
      ).toFixed(2);
    } else {
      // On the first day, the only expense might be rent.
      expenseForecast = totalExpense.toFixed(2);
    }
  }

  // Comparative Analysis: Compare total expense to total limits set across categories
  const totalSpendingByCategory = expenseCategories.reduce(
    (sum, cat) => sum + (spendingByCategory[cat.value] || 0),
    0
  );
  const totalLimitByCategory = expenseCategories.reduce(
    (sum, cat) => sum + ((limits[cat.value] && limits[cat.value][view]) || 0),
    0
  );
  const spendingVsLimitPercent =
    totalLimitByCategory > 0
      ? ((totalSpendingByCategory / totalLimitByCategory) * 100).toFixed(2)
      : "N/A";

  // Generate useful feedback messages based on the data
  const feedbackMessages = [];

  // Overall Financial Health
  if (netIncome < 0) {
    feedbackMessages.push(
      "Your net income is negative. Consider reducing expenses or increasing income."
    );
  } else {
    feedbackMessages.push("You have a positive net income. Good job!");
  }

  // Savings Rate
  if (totalIncome > 0 && savingsRate !== "N/A") {
    if (savingsRate < 20) {
      feedbackMessages.push(
        `Your savings rate is low at ${savingsRate}%. Consider ways to save more.`
      );
    } else {
      feedbackMessages.push(`Your savings rate is healthy at ${savingsRate}%.`);
    }
  }

  // Recurring vs. One-Time Expenses
  const recurringPct =
    totalExpense > 0 ? ((recurringExpense / totalExpense) * 100).toFixed(2) : 0;
  feedbackMessages.push(
    `Recurring expenses account for ${recurringPct}% of your total expenses.`
  );

  // Variability & Consistency
  if (avgExpense > 0) {
    if (stdDeviation > avgExpense * 0.75) {
      feedbackMessages.push(
        "There is high variability in your expenses. Consider tracking irregular spending."
      );
    } else {
      feedbackMessages.push("Your expense amounts are relatively consistent.");
    }
  }

  // Forecasting
  if (view === "monthly") {
    feedbackMessages.push(
      `Based on your current spending, your forecasted expense for this month is $${expenseForecast}.`
    );
  }

  // Transaction Frequency
  feedbackMessages.push(
    `You have made ${transactionCount} transactions in the selected period.`
  );

  // Budget vs. Actual (per category)
  if (categoriesOverLimit.length > 0) {
    feedbackMessages.push(
      `Review spending in these categories as they exceeded your set limits: ${categoriesOverLimit.join(
        ", "
      )}.`
    );
  }

  // Rolling Average Feedback (if applicable)
  if (view === "monthly") {
    feedbackMessages.push(
      `Your 7-day rolling average expense is $${rollingAvg}.`
    );
  }

  // Comparative Analysis
  if (totalLimitByCategory !== 0 && spendingVsLimitPercent !== "N/A") {
    feedbackMessages.push(
      `Overall, you are using ${spendingVsLimitPercent}% of your total expense limits.`
    );
  }

  // Handler for limit input changes
  const handleLimitChange = (category, value) => {
    setLimits((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [view]: Number(value),
      },
    }));
  };

  // Save limits to the database
  const saveLimits = async () => {
    try {
      await axios.post(`${API_URL}/expense-limits`, limits, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving limits", err);
    }
  };

  // Generate month and year options for custom selection
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
  const startYear = currentDate.getFullYear() - 5;
  for (let y = startYear; y <= currentDate.getFullYear() + 1; y++) {
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
            <strong>Net Income:</strong>{" "}
            <span className={netIncome < 0 ? "text-danger" : "text-success"}>
              ${netIncome.toFixed(2)}
            </span>
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
      <div className="card p-3 shadow-sm mb-4">
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
                <th>Avg/Month</th>
              </tr>
            </thead>
            <tbody>
              {expenseCategories.map((cat) => {
                const categoryName = cat.value;
                const spending = spendingByCategory[categoryName] || 0;
                const limitVal =
                  (limits[categoryName] && limits[categoryName][view]) || 0;
                let expected = 0;
                if (limitVal > 0) {
                  const now = new Date();
                  if (view === "monthly") {
                    const currentDay = now.getDate();
                    const totalDaysInMonth = new Date(
                      now.getFullYear(),
                      now.getMonth() + 1,
                      0
                    ).getDate();
                    expected = (limitVal / totalDaysInMonth) * currentDay;
                  } else {
                    const currentMonth = now.getMonth() + 1;
                    expected = (limitVal / 12) * currentMonth;
                  }
                }
                const status =
                  limitVal > 0
                    ? spending > limitVal
                      ? "Over Limit"
                      : spending > expected
                      ? "Above Average"
                      : "Within Limit"
                    : "No Limit Set";
                // New: Calculate average monthly spending for this category from all transactions
                const avgMonthly =
                  averageMonthlySpendingByCategory[categoryName] || 0;
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
                        <span>{status}</span>
                      )}
                    </td>
                    <td>${avgMonthly.toFixed(2)}</td>
                  </tr>
                );
              })}
              {/* Total row for Spending and Limits */}
              <tr>
                <th>Total</th>
                <th>${totalSpendingByCategory.toFixed(2)}</th>
                <th>${totalLimitByCategory.toFixed(2)}</th>
                <th></th>
                <th>${totalAvgMonthly.toFixed(2)}</th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-Time Analysis Alert */}
      <div className="card p-3 shadow-sm mb-4">
        <h4>Real-Time Analysis</h4>
        <p>{simpleAlertMessage}</p>
      </div>

      {/* New: Category-wise Spending Percentage Section */}
      <div className="card p-3 shadow-sm mb-4">
        <h4>Category-wise Spending</h4>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Category</th>
                <th>Spending Percentage</th>
              </tr>
            </thead>
            <tbody>
              {categoryPercentageBreakdown.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Feedback Section */}
      <div className="card p-3 shadow-sm mb-3">
        <h4 className="mb-3">Detailed Feedback</h4>
        <ul className="list-group list-group-flush">
          {feedbackMessages.map((msg, idx) => (
            <li key={idx} className="list-group-item">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Stats;
