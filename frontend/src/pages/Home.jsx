import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">Welcome to LMS</h1>
      <div className="mt-6">
        <Link
          to="/login"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="ml-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
