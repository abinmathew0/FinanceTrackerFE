import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Correct for React 18
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root")); // ✅ Correct usage in React 18
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
