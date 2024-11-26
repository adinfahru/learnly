import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../components/Header"; 
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import StudentDashboard from "../pages/Student/Dashboard";
import TeacherDashboard from "../pages/Teacher/Dashboard";
import PrivateRoute from "../components/PrivateRoute"; 
import NotFound from "../pages/NotFound";

function AppRouter() {
  return (
    <>
      <Routes>
        {/* Halaman publik */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Halaman dashboard yang hanya bisa diakses jika login */}
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/teacher-dashboard"
          element={
            <PrivateRoute>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        
        {/* Route wildcard untuk halaman 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default AppRouter;
