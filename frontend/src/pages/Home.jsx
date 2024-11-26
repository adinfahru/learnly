import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1 font-bold text-indigo-700">
            Learnly
          </div>
          {/* <div className="hidden lg:flex lg:gap-x-12">
            <Link
              to="/features"
              className="text-sm font-semibold text-gray-900"
            >
              Features
            </Link>
            <Link to="/about" className="text-sm font-semibold text-gray-900">
              About
            </Link>
            <Link to="/contact" className="text-sm font-semibold text-gray-900">
              Contact
            </Link>
          </div> */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link to="/login" className="text-sm font-semibold text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-24 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
              Welcome to{" "}
              <span className="font-bold text-indigo-700">Learnly</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Discover a platform that simplifies learning and management.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-y-4 sm:gap-x-6">
              <Link
                to="/login"
                className="rounded-md w-full bg-indigo-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800"
              >
                Get Started
              </Link>
              <Link
                to="/register"
                className="rounded-md w-full bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-200"
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
