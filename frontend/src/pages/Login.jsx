import React, { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await login(formData);

      localStorage.setItem("accessToken", response.data.tokens.access);
      localStorage.setItem("refreshToken", response.data.tokens.refresh);
      localStorage.setItem("userRole", response.data.role);

      setMessage({ type: "success", text: "Login successful!" });

      const role = response.data.role;
      if (role === "student") {
        navigate("/student/dashboard");
      } else if (role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "Login failed!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="w-[350px] shadow-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Tidak punya akun?
            <span className="underline text-indigo-700 font-bold">
              <a href="/register"> Daftar</a>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <p
              className={`text-sm mb-4 ${
                message.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {message.text}
            </p>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <Button variant="outline" className="w-full">
            Forgot Password?
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
