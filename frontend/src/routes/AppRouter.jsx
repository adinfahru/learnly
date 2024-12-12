import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import StudentDashboard from "../pages/Student/Dashboard";
import TeacherDashboard from "../pages/Teacher/Dashboard";
import ClassDetail from "../pages/class/ClassDetail";
import PrivateRoute from "../components/PrivateRoute";
import NotFound from "../pages/NotFound";
import Forbidden from "../pages/Forbidden";

const routes = [
  // Rute publik
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // Rute privat
  { path: "/student/dashboard", element: <StudentDashboard />, private: true },
  { path: "/teacher/dashboard", element: <TeacherDashboard />, private: true },
  { path: "/class/:classId", element: <ClassDetail />, private: true },

  // Halaman Forbidden
  { path: "/forbidden", element: <Forbidden /> },

  // Halaman 404
  { path: "*", element: <NotFound /> },
];

function AppRouter() {
  return (
    <Routes>
      {routes.map(({ path, element, private: isPrivate }) => (
        <Route
          key={path}
          path={path}
          element={isPrivate ? <PrivateRoute>{element}</PrivateRoute> : element}
        />
      ))}
    </Routes>
  );
}

export default AppRouter;
