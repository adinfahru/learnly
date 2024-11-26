import React, { useState, useEffect } from "react";
import { getUser, logout } from "../services/authService";  // Ensure this service is available to get user data
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        setUser(response.data);  // Assuming the user data is returned from the backend
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
        setLoading(false);
      }
    };

    fetchUser();
  }, []);  // Empty dependency array means this effect runs only once when the component mounts

  // Handle logout
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const accessToken = localStorage.getItem("accessToken");
  
      if (refreshToken && accessToken) {
        await logout(refreshToken, accessToken);  // Pass both tokens to the backend
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");  // Redirect to login page after logout
      } else {
        console.error("Tokens not found.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  

  return (
    <div className="dashboard-container">
      <h1>Welcome to the Student Dashboard</h1>

      {loading ? (
        <p>Loading your data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <p>Email: {user.email}</p>
          <p>Username: {user.username}</p>
          <p>Role: {user.role}</p>
          {/* Add any student-specific content here */}
          <p>Additional student content goes here...</p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Logout
      </button>
    </div>
  );
}
