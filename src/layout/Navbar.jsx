import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";


const Navbar = ({ onLogout, isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 right-0 z-50 transition-colors">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-300">EduDash</h1>
        <nav className="hidden md:flex gap-6 text-gray-700 dark:text-gray-200 font-medium items-center">
          <Link to="/" className="hover:text-blue-500 dark:hover:text-blue-400 transition">Home</Link>
          <Link to="/dashboard" className="hover:text-blue-500 dark:hover:text-blue-400 transition">Dashboard</Link>
          <Link to="/about" className="hover:text-blue-500 dark:hover:text-blue-400 transition">About</Link>
          <Link to="/contact" className="hover:text-blue-500 dark:hover:text-blue-400 transition">Contact</Link>
          <button
            onClick={toggleDarkMode}
            className="ml-2 p-2 rounded-lg transition-colors duration-200 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-yellow-400"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {isAuthenticated && (
            <button
              onClick={onLogout}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition"
            >
              Logout
            </button>
          )}
        </nav>
        <button className="md:hidden text-gray-700 dark:text-gray-200" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pb-4">
          <nav className="flex flex-col gap-3 mt-2 text-gray-700 dark:text-gray-200 font-medium">
            <Link to="/" className="hover:text-blue-500 dark:hover:text-blue-400 transition">Home</Link>
            <Link to="/dashboard" className="hover:text-blue-500 dark:hover:text-blue-400 transition">Dashboard</Link>
            <Link to="/about" className="hover:text-blue-500 dark:hover:text-blue-400 transition">About</Link>
            <Link to="/contact" className="hover:text-blue-500 dark:hover:text-blue-400 transition">Contact</Link>
            <button
              onClick={toggleDarkMode}
              className="mt-2 p-2 rounded-lg transition-colors duration-200 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-yellow-400"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated && (
              <button
                onClick={onLogout}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
