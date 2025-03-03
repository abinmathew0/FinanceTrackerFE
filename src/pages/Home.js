import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-center">
      <h1>Welcome to Finance Tracker</h1>
      <p>Manage your income and expenses efficiently.</p>
      <Link to="/transactions" className="btn btn-primary">
        View Transactions
      </Link>
    </div>
  );
};

export default Home;
