import React, { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"


export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();  // Initialize useNavigate

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);  // Reset message before attempting login

    try {
      // Attempt to login with the provided form data
      const response = await login(formData);

      // Store tokens in localStorage (use secure methods in production)
      localStorage.setItem("accessToken", response.data.tokens.access);
      localStorage.setItem("refreshToken", response.data.tokens.refresh);

      // Set success message
      setMessage({ type: "success", text: "Login successful!" });

      // Redirect user based on role (you can adjust roles here)
      const role = response.data.role;
      if (role === "student") {
        navigate("/student-dashboard");
      } else if (role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/dashboard");  // Default dashboard or handle unknown roles
      }
    } catch (error) {
      // Handle login failure with specific error messages
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "Login failed!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {message && (
        <p className={message.type === "success" ? "text-green-500" : "text-red-500"}>
          {message.text}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-4"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 rounded w-full mb-4"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
