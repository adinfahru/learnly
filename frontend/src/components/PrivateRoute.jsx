import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { userRole } = useAuth();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("accessToken"); // Cek token di localStorage

  if (!isAuthenticated) {
    // Jika tidak ada token, arahkan ke login
    return <Navigate to="/login" />;
  }

  // Cek akses berdasarkan userRole dan path
  if (userRole === "student" && location.pathname.startsWith("/teacher")) {
    return <Navigate to="/forbidden" />;
  }

  if (userRole === "teacher" && location.pathname.startsWith("/student")) {
    return <Navigate to="/forbidden" />;
  }

  return children; // Jika semua validasi lolos, tampilkan halaman
};

export default PrivateRoute;
