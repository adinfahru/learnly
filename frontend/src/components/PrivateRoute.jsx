import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("accessToken"); // Cek token di localStorage

  if (!isAuthenticated) {
    // Jika tidak ada token, arahkan ke login
    return <Navigate to="/login" />;
  }

  return children; // Jika sudah login, tampilkan halaman yang diinginkan
};

export default PrivateRoute;
