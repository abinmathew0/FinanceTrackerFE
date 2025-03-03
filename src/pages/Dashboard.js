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

  // ✅ Prepare data for Income vs Expense Bar Chart
  const income = transactions
    .filter((txn) => txn.type === "income")
    .reduce((sum, txn) => sum + txn.amount, 0);
  const expense = transactions
    .filter((txn) => txn.type === "expense")
    .reduce((sum, txn) => sum + txn.amount, 0);

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

  // ✅ Prepare data for Transaction Trends Line Chart
  const transactionsByDate = transactions.reduce((acc, txn) => {
    const date = new Date(txn.date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + txn.amount;
    return acc;
  }, {});

  const lineData = {
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

  // ✅ Prepare data for Category-wise Bar Chart
  const transactionsByCategory = transactions.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
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

  // ✅ Prepare data for Month-wise Bar Chart
  const transactionsByMonth = transactions.reduce((acc, txn) => {
    const month = new Date(txn.date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + txn.amount;
    return acc;
  }, {});

  const monthBarData = {
    labels: Object.keys(transactionsByMonth),
    datasets: [
      {
        label: "Total Amount by Month",
        data: Object.values(transactionsByMonth),
        backgroundColor: "#8E44AD",
      },
    ],
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Dashboard</h2>
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
            <h4 className="text-center">Transaction Trends</h4>
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
            <h4 className="text-center">Month-wise Overview</h4>
            <Bar data={monthBarData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
