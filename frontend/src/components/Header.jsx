import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function Header() {
  return (
    <div>
      {/* Navigasi Header */}
      <nav className="bg-gray-800 p-4">
        <ul className="flex justify-around text-white">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
        </ul>
      </nav>

      {/* Konten Halaman */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
