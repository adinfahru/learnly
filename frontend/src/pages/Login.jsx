import React, { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";  // Import useNavigate

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();  // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login(formData);
      // Store the tokens in localStorage
      localStorage.setItem("accessToken", response.data.tokens.access);
      localStorage.setItem("refreshToken", response.data.tokens.refresh);

      // Set success message
      setMessage({ type: "success", text: "Login successful!" });

      // Immediately navigate to Dashboard page after successful login
      navigate("/dashboard");  // Navigate directly without delay
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "Login failed!" });
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
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
