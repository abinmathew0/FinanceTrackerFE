import React from "react";

const Footer = () => (
  <footer
    className="text-center p-3"
    style={{
      backgroundColor: "#116a7b", // Deep blue background
      color: "#ece5c7", // Cream text color
    }}
  >
    <p>
      &copy; {new Date().getFullYear()} Finance Tracker. All Rights Reserved.
    </p>
    <p>Made with ♥ by Abin Mathew</p>
  </footer>
);

export default Footer;
