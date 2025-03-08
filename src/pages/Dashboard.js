import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";

ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  // "month" for current month view, "year" for current year view
  const [viewMode, setViewMode] = useState("month");
  // Custom month selection
  const [useCustom, setUseCustom] = useState(false);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Month and Year options for custom selection
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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
    }
  };

  // Filter transactions based on selected view:
  // If using custom selection, filter by selectedMonth & selectedYear.
  // Otherwise, if viewMode is "month" use current month and year,
  // or if viewMode is "year" filter by current year.
  const displayTransactions = useCustom
    ? transactions.filter((txn) => {
        const d = new Date(txn.date);
        return (
          d.getMonth() === Number(selectedMonth) &&
          d.getFullYear() === Number(selectedYear)
        );
      })
    : viewMode === "month"
    ? transactions.filter((txn) => {
        const d = new Date(txn.date);
        return (
          d.getMonth() === currentDate.getMonth() &&
          d.getFullYear() === currentDate.getFullYear()
        );
      })
    : transactions.filter((txn) => {
        const d = new Date(txn.date);
        return d.getFullYear() === currentDate.getFullYear();
      });

  // Compute Overall Metrics (ensure numeric conversion)
  const income = displayTransactions
    .filter((txn) => txn.type === "income")
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
  const expense = displayTransactions
    .filter((txn) => txn.type === "expense")
    .reduce((sum, txn) => sum + Number(txn.amount), 0);

  const incomeExpenseBarData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [income, expense],
        backgroundColor: ["#2ECC71", "#E74C3C"],
      },
    ],
  };

  // Transaction Trends Line Chart
  let lineData = {};
  if (viewMode === "month" && !useCustom) {
    // Group transactions by day for current month view
    const transactionsByDate = displayTransactions.reduce((acc, txn) => {
      const date = new Date(txn.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + Number(txn.amount);
      return acc;
    }, {});
    lineData = {
      labels: Object.keys(transactionsByDate),
      datasets: [
        {
          label: "Total Transactions",
          data: Object.values(transactionsByDate),
          fill: false,
          borderColor: "#155E95",
          tension: 0.1,
        },
      ],
    };
  } else {
    // Group transactions by month for year view or custom selection
    const transactionsByMonthLine = displayTransactions.reduce((acc, txn) => {
      const month = new Date(txn.date).toLocaleString("default", {
        month: "short",
      });
      acc[month] = (acc[month] || 0) + Number(txn.amount);
      return acc;
    }, {});
    lineData = {
      labels: Object.keys(transactionsByMonthLine),
      datasets: [
        {
          label: "Total Transactions",
          data: Object.values(transactionsByMonthLine),
          fill: false,
          borderColor: "#155E95",
          tension: 0.1,
        },
      ],
    };
  }

  // Spending by Category Bar Chart
  const transactionsByCategory = displayTransactions.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + Number(txn.amount);
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(transactionsByCategory),
    datasets: [
      {
        label: "Amount Spent",
        data: Object.values(transactionsByCategory),
        backgroundColor: "#27445D",
      },
    ],
  };

  // Month-wise / Day-wise Overview Bar Chart
  let monthBarData = {};
  if (viewMode === "month" && !useCustom) {
    // Group by day for current month view
    const transactionsByDay = displayTransactions.reduce((acc, txn) => {
      const day = new Date(txn.date).getDate();
      acc[day] = (acc[day] || 0) + Number(txn.amount);
      return acc;
    }, {});
    monthBarData = {
      labels: Object.keys(transactionsByDay).sort((a, b) => a - b),
      datasets: [
        {
          label: "Total Amount by Day",
          data: Object.values(transactionsByDay),
          backgroundColor: "#8E44AD",
        },
      ],
    };
  } else {
    // Group by month (with year) for year view or custom selection
    const transactionsByMonth = displayTransactions.reduce((acc, txn) => {
      const month = new Date(txn.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + Number(txn.amount);
      return acc;
    }, {});
    monthBarData = {
      labels: Object.keys(transactionsByMonth),
      datasets: [
        {
          label: "Total Amount by Month",
          data: Object.values(transactionsByMonth),
          backgroundColor: "#8E44AD",
        },
      ],
    };
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center">Dashboard</h2>

      {/* View Mode Toggle */}
      <div className="d-flex justify-content-center my-4">
        <button
          className={`btn me-2 ${
            viewMode === "month" && !useCustom
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => {
            setViewMode("month");
            setUseCustom(false);
          }}
        >
          Current Month
        </button>
        <button
          className={`btn me-2 ${
            viewMode === "year" && !useCustom
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => {
            setViewMode("year");
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

      <div className="row g-4 mt-3">
        {/* Row 1 */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h4 className="text-center">Income vs Expense</h4>
            <Bar data={incomeExpenseBarData} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h4 className="text-center">
              {viewMode === "month" && !useCustom
                ? "Transaction Trends (Daily)"
                : "Transaction Trends (Monthly)"}
            </h4>
            <Line data={lineData} />
          </div>
        </div>

        {/* Row 2 */}
        <div className="col-md-6 mb-5">
          <div className="card p-3 shadow-sm">
            <h4 className="text-center">Spending by Category</h4>
            <Bar data={barData} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h4 className="text-center">
              {viewMode === "month" && !useCustom
                ? "Overview (Daily)"
                : "Overview (Monthly)"}
            </h4>
            <Bar data={monthBarData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
