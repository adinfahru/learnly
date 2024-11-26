import React, { useState, useEffect } from "react";
import { getUser, logout } from "../services/authService";

export default function Dashboard() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        setUsername(response.data.username);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await logout(refreshToken);
      localStorage.clear();
      window.location.href = "/"; // Redirect to Home
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, <strong>{username}</strong>!</p>
      <button
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
