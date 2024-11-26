import React, { useState } from "react";
import { register } from "../services/authService";
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

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await register(formData);
      setMessage({ type: "success", text: "Registration successful!" });

      // Redirect to login page after successful registration
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "Registration failed!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="w-[400px] shadow-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Sudah punya akun?{" "}
            <span className="underline text-indigo-700 font-bold">
              <a href="/login">Login</a>
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
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                id="username"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
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
              <Label htmlFor="password1">Password</Label>
              <Input
                type="password"
                id="password1"
                name="password1"
                placeholder="Password"
                value={formData.password1}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password2">Confirm Password</Label>
              <Input
                type="password"
                id="password2"
                name="password2"
                placeholder="Confirm Password"
                value={formData.password2}
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
            {isLoading ? "Registering..." : "Register"}
          </Button>
          <Button variant="outline" className="w-full">
            Need Help?
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
