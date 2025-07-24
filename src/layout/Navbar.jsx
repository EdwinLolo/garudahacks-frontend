import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Sun, Moon, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { logout } from "../models/auth";

const Navbar = ({ onLogout, isAuthenticated }) => {
  const user = JSON.parse(localStorage.getItem("user_profile") || "{}");

  // console.log("User Profile:", user);
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setProfileOpen((v) => !v);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout API error:", error);
      // You might want to show a toast notification here
    } finally {
      onLogout();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 right-0 z-50 transition-colors">
      <div className="container mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        {/* Left: Logo/Name */}
        <div className="flex items-center min-w-[120px]">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-300">
            EduDash
          </h1>
        </div>
        {/* Center: Routes */}
        <nav className="hidden md:flex gap-6 text-gray-700 dark:text-gray-200 font-medium items-center flex-1 justify-center px-2">
          <Link
            to="/"
            className="hover:text-blue-500 dark:hover:text-blue-400 transition">
            Home
          </Link>
          {/* <Link to="/dashboard" className="hover:text-blue-500 dark:hover:text-blue-400 transition">Dashboard</Link> */}
          <Link
            to="/about"
            className="hover:text-blue-500 dark:hover:text-blue-400 transition">
            About
          </Link>
          <Link
            to="/contact"
            className="hover:text-blue-500 dark:hover:text-blue-400 transition">
            Contact
          </Link>
        </nav>
        {/* Right: Profile Dropdown */}
        <div className="flex items-center gap-2 min-w-[48px] px-1">
          {/* Hamburger for mobile */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-200"
            onClick={toggleMenu}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {/* Profile dropdown for desktop */}
          {isAuthenticated && (
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                aria-label="Profile menu">
                <User className="w-5 h-5" />
                <span className="font-medium">{user.name.split(" ")[0]}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50 p-4">
                  <div className="mb-3">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-yellow-400 transition mb-2">
                    {isDark ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                    <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 pb-4">
          <nav className="flex flex-col gap-3 mt-2 text-gray-700 dark:text-gray-200 font-medium">
            <Link
              to="/"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition">
              Home
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition">
              Dashboard
            </Link>
            <Link
              to="/about"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition">
              About
            </Link>
            <Link
              to="/contact"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition">
              Contact
            </Link>
          </nav>
          {isAuthenticated && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-1">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-yellow-400 transition mb-1">
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
