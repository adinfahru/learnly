import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("accessToken"); // Cek token di localStorage
  const userRole = localStorage.getItem("userRole"); // Cek role di localStorage

  if (!isAuthenticated) {
    // Jika tidak ada token, arahkan ke login
    return <Navigate to="/login" />;
  }

  if (userRole === "student" && location.pathname.startsWith("/teacher")) {
    return <Navigate to="/student/dashboard" />; // Arahkan ke dashboard student
  }

  if (userRole === "teacher" && location.pathname.startsWith("/student")) {
    return <Navigate to="/teacher/dashboard" />; // Arahkan ke dashboard teacher
  }

  return children; // Jika semua validasi lolos, tampilkan halaman
};

export default PrivateRoute;
