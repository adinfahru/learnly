import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function Header() {
  return (
    <div>
      {/* Navigasi Header */}
      <nav className="bg-gray-800 p-4">
        <ul className="flex justify-around text-white">
          <li>
            <div className="mt-6 text-end">
              <button
                onClick={() => setShowCreateClassModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
              >
                Create Class
              </button>
            </div>
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
