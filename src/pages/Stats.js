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


//Simulation Elements
const [scenarioSavingsRate, setScenarioSavingsRate] = useState(20);
const [simulationYears, setSimulationYears] = useState(10);
const [simulationInterest, setSimulationInterest] = useState(8);

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

  // Sorted array of categories with spending (nonzero) in descending order
  const categoryPercentageBreakdown = categoryBreakdown
    .filter((item) => Number(item.spending) > 0)
    .sort((a, b) => Number(b.percentage) - Number(a.percentage));

  // Compute average monthly spending for each expense category from past data
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

  // Cash Flow Analysis & Savings Rate
  const savingsRate =
    totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(2) : "N/A";

  // Transaction Frequency Analysis
  const transactionCount = filteredTransactions.length;

  // Rolling Average (for expenses) for the last 7 days if in monthly view
  let rollingAvg = 0;
  if (view === "monthly") {
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
    const fixedRent = spendingByCategory["Rent/Mortgage"] || 0;
    const expenseWithoutRent = totalExpense - fixedRent;
    if (currentDay > 1) {
      const dailyAvgWithoutRent = expenseWithoutRent / (currentDay - 1);
      expenseForecast = (
        fixedRent +
        dailyAvgWithoutRent * (totalDaysInMonth - 1)
      ).toFixed(2);
    } else {
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
  if (netIncome < 0) {
    feedbackMessages.push(
      "Your net income is negative. Consider reducing expenses or increasing income."
    );
  } else {
    feedbackMessages.push("You have a positive net income. Good job!");
  }
  if (totalIncome > 0 && savingsRate !== "N/A") {
    if (savingsRate < 20) {
      feedbackMessages.push(
        `Your savings rate is low at ${savingsRate}%. Consider ways to save more.`
      );
    } else {
      feedbackMessages.push(`Your savings rate is healthy at ${savingsRate}%.`);
    }
  }
  const recurringPct =
    totalExpense > 0 ? ((recurringExpense / totalExpense) * 100).toFixed(2) : 0;
  feedbackMessages.push(
    `Recurring expenses account for ${recurringPct}% of your total expenses.`
  );
  if (avgExpense > 0) {
    if (stdDeviation > avgExpense * 0.75) {
      feedbackMessages.push(
        "There is high variability in your expenses. Consider tracking irregular spending."
      );
    } else {
      feedbackMessages.push("Your expense amounts are relatively consistent.");
    }
  }
  if (view === "monthly") {
    feedbackMessages.push(
      `Based on your current spending, your forecasted expense for this month is $${expenseForecast}.`
    );
  }
  feedbackMessages.push(
    `You have made ${transactionCount} transactions in the selected period.`
  );
  if (categoriesOverLimit.length > 0) {
    feedbackMessages.push(
      `Review spending in these categories as they exceeded your set limits: ${categoriesOverLimit.join(
        ", "
      )}.`
    );
  }
  if (view === "monthly") {
    feedbackMessages.push(
      `Your 7-day rolling average expense is $${rollingAvg}.`
    );
  }
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

  // Calculate recommended savings based on a 20% rule
  const recommendedSavings = totalIncome * 0.2;

  return (
    <div className="container mt-4">
      {/* Redesigned Summary Card */}
      <div
        className="card mb-4 shadow-sm"
        style={{ backgroundColor: "#ece5c7", color: "#116a7b" }}
      >
        <div
          className="card-header text-center"
          style={{ backgroundColor: "#116a7b", color: "#ece5c7" }}
        >
          <h3>Financial Overview</h3>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-4 mb-3 mb-md-0">
              <h5>
                <i className="fas fa-arrow-up"></i> Total Income
              </h5>
              <p className="display-6">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <h5>
                <i className="fas fa-arrow-down"></i> Total Expense
              </h5>
              <p className="display-6">${totalExpense.toFixed(2)}</p>
            </div>
            <div className="col-md-4">
              <h5>
                <i className="fas fa-balance-scale"></i> Net Income
              </h5>
              <p
                className={`display-6 ${
                  netIncome < 0 ? "text-danger" : "text-success"
                }`}
              >
                ${netIncome.toFixed(2)}
              </p>
            </div>
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
          style={{
            backgroundColor: view === "monthly" && !useCustom ? "#116a7b" : "",
            borderColor: "#116a7b",
            color: view === "monthly" && !useCustom ? "#ece5c7" : "#116a7b",
          }}
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
          style={{
            backgroundColor: view === "yearly" && !useCustom ? "#116a7b" : "",
            borderColor: "#116a7b",
            color: view === "yearly" && !useCustom ? "#ece5c7" : "#116a7b",
          }}
          onClick={() => {
            setView("yearly");
            setUseCustom(false);
          }}
        >
          Current Year
        </button>
        <button
          className={`btn ${useCustom ? "btn-primary" : "btn-outline-primary"}`}
          style={{
            backgroundColor: useCustom ? "#116a7b" : "",
            borderColor: "#116a7b",
            color: useCustom ? "#ece5c7" : "#116a7b",
          }}
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
            style={{
              backgroundColor: "#c2dedc",
              color: "#116a7b",
              borderColor: "#116a7b",
            }}
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
            style={{
              backgroundColor: "#c2dedc",
              color: "#116a7b",
              borderColor: "#116a7b",
            }}
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
            style={{ borderColor: "#116a7b", color: "#116a7b" }}
            onClick={() => setIsEditing(true)}
          >
            Edit Limits
          </button>
        ) : (
          <button
            className="btn btn-outline-success"
            style={{ borderColor: "#116a7b", color: "#116a7b" }}
            onClick={saveLimits}
          >
            Save Limits
          </button>
        )}
      </div>

      {/* Redesigned Spending by Category & Limits Section */}
      <div
        className="card p-4 shadow-sm mb-4"
        style={{
          backgroundColor: "#c2dedc",
          borderRadius: "10px",
          color: "#116a7b",
        }}
      >
        <h4
          className="mb-4 text-center"
          style={{
            borderBottom: "2px solid #cdc2ae",
            paddingBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          Spending by Category & Limits
        </h4>
        <div className="table-responsive">
          <table
            className="table table-striped table-hover"
            style={{
              color: "#116a7b",
              fontSize: "0.95rem",
              borderCollapse: "separate",
              borderSpacing: "0 0.5rem",
            }}
          >
            <thead style={{ backgroundColor: "#cdc2ae", borderRadius: "5px" }}>
              <tr>
                <th className="p-2">Category</th>
                <th className="p-2">Spending</th>
                <th className="p-2">
                  Limit (
                  {useCustom
                    ? "Custom"
                    : view === "monthly"
                    ? "Monthly"
                    : "Yearly"}
                  )
                </th>
                <th className="p-2">Status</th>
                <th className="p-2">Avg/Month</th>
              </tr>
            </thead>
            <tbody>
              {expenseCategories.map((cat, index) => {
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
                const avgMonthly =
                  averageMonthlySpendingByCategory[categoryName] || 0;
                return (
                  <tr
                    key={categoryName + index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#ece5c7" : "#c2dedc",
                      borderRadius: "5px",
                    }}
                  >
                    <td className="p-2">{categoryName}</td>
                    <td className="p-2">${spending.toFixed(2)}</td>
                    <td className="p-2">
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
                        style={{
                          backgroundColor: "#ece5c7",
                          color: "#116a7b",
                          borderColor: "#116a7b",
                          borderRadius: "4px",
                        }}
                      />
                    </td>
                    <td className="p-2">
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
                    <td className="p-2">${avgMonthly.toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr
                style={{
                  backgroundColor: "#cdc2ae",
                  fontWeight: "bold",
                  borderRadius: "5px",
                }}
              >
                <th className="p-2">Total</th>
                <th className="p-2">${totalSpendingByCategory.toFixed(2)}</th>
                <th className="p-2">${totalLimitByCategory.toFixed(2)}</th>
                <th className="p-2"></th>
                <th className="p-2">${totalAvgMonthly.toFixed(2)}</th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Redesigned Category-wise Spending Section */}
      <div
        className="card p-4 shadow-sm mb-4"
        style={{
          backgroundColor: "#ece5c7",
          borderRadius: "10px",
          color: "#116a7b",
        }}
      >
        <h4
          className="mb-4 text-center"
          style={{
            borderBottom: "2px solid #cdc2ae",
            paddingBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          Category-wise Spending
        </h4>
        <div className="table-responsive">
          <table
            className="table table-striped table-hover"
            style={{
              color: "#116a7b",
              fontSize: "0.95rem",
              borderCollapse: "separate",
              borderSpacing: "0 0.5rem",
            }}
          >
            <thead style={{ backgroundColor: "#cdc2ae", borderRadius: "5px" }}>
              <tr>
                <th className="p-2">Category</th>
                <th className="p-2">Spending Percentage</th>
              </tr>
            </thead>
            <tbody>
              {categoryPercentageBreakdown.map((item, idx) => (
                <tr
                  key={item.category + idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#c2dedc" : "#ece5c7",
                    borderRadius: "5px",
                  }}
                >
                  <td className="p-2">{item.category}</td>
                  <td className="p-2">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-Time Analysis Alert */}
      <div
        className="card p-4 shadow-sm mb-4"
        style={{
          backgroundColor: "#ece5c7",
          color: "#116a7b",
          borderRadius: "10px",
        }}
      >
        <h4
          style={{
            borderBottom: "2px solid #cdc2ae",
            paddingBottom: "0.5rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Real-Time Analysis
        </h4>
        <p className="mt-3 text-center">{simpleAlertMessage}</p>
      </div>

      {/* Redesigned Detailed Feedback Section */}
      <div
        className="card p-4 shadow-sm mb-3"
        style={{
          backgroundColor: "#ece5c7",
          color: "#116a7b",
          borderRadius: "10px",
        }}
      >
        <h4
          className="mb-4 text-center"
          style={{
            borderBottom: "2px solid #cdc2ae",
            paddingBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          Detailed Feedback
        </h4>
        <ul className="list-group list-group-flush">
          {feedbackMessages.map((msg, idx) => (
            <li
              key={idx}
              className="list-group-item"
              style={{
                backgroundColor: "#c2dedc",
                color: "#116a7b",
                marginBottom: "0.5rem",
                borderRadius: "5px",
                padding: "0.75rem",
              }}
            >
              {msg}
            </li>
          ))}
        </ul>
      </div>
      {/* Savings Recommendation Card */}
      <div
        className="card p-4 shadow-sm mb-4"
        style={{
          backgroundColor: "#ece5c7",
          color: "#116a7b",
          borderRadius: "10px",
        }}
      >
        <h4
          className="mb-4 text-center"
          style={{
            borderBottom: "2px solid #cdc2ae",
            paddingBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          Savings Recommendation
        </h4>
        <p className="text-center">
          Rules for managing money such as <strong>80/20</strong>,{" "}
          <strong>70/10/20</strong>, and <strong>50/30/20</strong> all recommend
          investing at least 20% of your income.
        </p>
        <p className="text-center">
          Based on your current total income of{" "}
          <strong>${totalIncome.toFixed(2)}</strong>, you should aim to save at
          least <strong>${recommendedSavings.toFixed(2)}</strong>.
        </p>
      </div>

      {/* Scenario Simulation Card */}
      <div
        className="card p-4 shadow-sm mb-4"
        style={{
          backgroundColor: "#ece5c7",
          color: "#116a7b",
          borderRadius: "10px",
        }}
      >
        <h4
          className="mb-4 text-center"
          style={{
            borderBottom: "2px solid #cdc2ae",
            paddingBottom: "0.5rem",
            fontWeight: "bold",
          }}
        >
          Savings Simulation
        </h4>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Savings Rate (%)</label>
            <input
              type="range"
              className="form-range"
              min="0"
              max="50"
              value={scenarioSavingsRate}
              onChange={(e) => setScenarioSavingsRate(Number(e.target.value))}
            />
            <div>
              <small>{scenarioSavingsRate}%</small>
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label">Years</label>
            <input
              type="range"
              className="form-range"
              min="1"
              max="40"
              value={simulationYears}
              onChange={(e) => setSimulationYears(Number(e.target.value))}
            />
            <div>
              <small>{simulationYears} years</small>
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label">Annual Interest Rate (%)</label>
            <input
              type="range"
              className="form-range"
              min="0"
              max="25"
              value={simulationInterest}
              onChange={(e) => setSimulationInterest(Number(e.target.value))}
            />
            <div>
              <small>{simulationInterest}%</small>
            </div>
          </div>
        </div>
        {(() => {
          // Assuming totalIncome is monthly income, compute yearly saving
          const monthlySaving = totalIncome * (scenarioSavingsRate / 100);
          const annualSaving = monthlySaving * 12;
          const annualInterestRate = simulationInterest / 100;
          const futureValue =
            annualInterestRate > 0
              ? annualSaving *
                ((Math.pow(1 + annualInterestRate, simulationYears) - 1) /
                  annualInterestRate)
              : annualSaving * simulationYears;
          return (
            <>
              <p className="text-center">
                If you invest {scenarioSavingsRate}% of your income, you'll invest{" "}
                <strong>${monthlySaving.toFixed(2)}</strong> per month.
              </p>
              <p className="text-center">
                With an annual interest rate of {simulationInterest}% compounded
                annually, in {simulationYears} years you could accumulate
                approximately <strong>${futureValue.toFixed(2)}</strong>.
              </p>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default Stats;
