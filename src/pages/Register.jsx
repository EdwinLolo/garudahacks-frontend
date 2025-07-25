import React, { useState, useEffect } from "react";
import { useSubjectContext } from "../context/SubjectContext";
import {
  BookOpen,
  GraduationCap,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Moon,
  Sun,
  User,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signup } from "../models/auth"; // You'll need to create this function

export default function Register({ onLogin, isAuthenticated }) {
  const navigate = useNavigate();

  const { setSubjects, setMaterials } = useSubjectContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "student",
    grade: 1,
    school_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, name, school_name } = formData;

    if (!email || !password || !confirmPassword || !name || !school_name) {
      setError("All fields are required.");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call your signup API endpoint
      const response = await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.grade,
        formData.school_name
      );

      console.log("Signup response:", response);

      if (response) {
        // Signup successful
        console.log("Signup successful:", response);
        // Redirect to login page after successful registration
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // On mount, sync isDark with current html class
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse bg-blue-200 dark:bg-blue-500/30"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse bg-indigo-200 dark:bg-indigo-500/30"></div>
        <div className="absolute top-1/2 -translate-y-1/2 -left-8 w-48 h-48 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse bg-blue-300 dark:bg-blue-400/30"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 backdrop-blur-lg border-b shadow-sm transition-colors duration-300 bg-white/80 border-white/20 dark:bg-gray-900/80 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GenLearn
              </h1>
            </div>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-colors duration-200 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-yellow-400"
              aria-label="Toggle dark mode">
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl md:text-3xl font-bold transition-colors duration-300 dark:text-white">
                Join Our Community
              </h2>
            </div>
            <p className="transition-colors duration-300 dark:text-gray-300">
              Start your learning journey today
            </p>
          </div>

          {/* Main Register Card */}
          <div className="backdrop-blur-lg shadow-2xl rounded-3xl p-6 md:p-8 border transition-colors duration-300 bg-white/80 border-white/20 dark:bg-gray-800/80 dark:border-gray-700/20">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <div className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">
                  {error}
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Input */}
              <div className="relative">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors duration-300 dark:text-gray-200"
                  htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 text-blue-500 dark:text-blue-300" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 border-gray-200 bg-gray-50/50 placeholder-gray-500 hover:bg-white/70 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400 dark:hover:bg-gray-700/70"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="relative">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors duration-300 dark:text-gray-200"
                  htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 text-blue-500 dark:text-blue-300" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 border-gray-200 bg-gray-50/50 placeholder-gray-500 hover:bg-white/70 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400 dark:hover:bg-gray-700/70"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Grade Input */}
              <div className="relative">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors duration-300 dark:text-gray-200"
                  htmlFor="name">
                  Grade
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 text-blue-500 dark:text-blue-300" />
                  <input
                    id="grade"
                    name="grade"
                    type="text"
                    autoComplete="name"
                    required
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 border-gray-200 bg-gray-50/50 placeholder-gray-500 hover:bg-white/70 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400 dark:hover:bg-gray-700/70"
                    placeholder="Enter your Grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="relative">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors duration-300 dark:text-gray-200"
                  htmlFor="school_name">
                  School Name
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 text-blue-500 dark:text-blue-300" />
                  <select
                    id="school_name"
                    name="school_name"
                    required
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 border-gray-200 bg-gray-50/50 hover:bg-white/70 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:hover:bg-gray-700/70"
                    value={formData.school_name}
                    onChange={handleInputChange}>
                    <option value="SD 1">SD 1</option>
                    <option value="SD 2">SD 2</option>
                    <option value="SD 3">SD 3</option>
                  </select>
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors duration-300 dark:text-gray-200"
                  htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 text-blue-500 dark:text-blue-300" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 border-gray-200 bg-gray-50/50 placeholder-gray-500 hover:bg-white/70 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400 dark:hover:bg-gray-700/70"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <label
                  className="block text-sm font-semibold mb-2 transition-colors duration-300 dark:text-gray-200"
                  htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 text-blue-500 dark:text-blue-300" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 border-gray-200 bg-gray-50/50 placeholder-gray-500 hover:bg-white/70 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400 dark:hover:bg-gray-700/70"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }>
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                />
                <label
                  htmlFor="terms"
                  className="text-sm transition-colors duration-300 dark:text-gray-300">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm transition-colors duration-300 dark:text-gray-300">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 backdrop-blur-lg border-t shadow-sm transition-colors duration-300 bg-white/80 border-white/20 dark:bg-gray-900/80 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-sm transition-colors duration-300 dark:text-gray-400">
              © 2025 GenLearn. Empowering minds, one lesson at a time.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-2">
              <a
                href="#"
                className="text-xs transition-colors hover:text-blue-600 dark:text-gray-500">
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-xs transition-colors hover:text-blue-600 dark:text-gray-500">
                Terms of Service
              </a>
              <a
                href="#"
                className="text-xs transition-colors hover:text-blue-600 dark:text-gray-500">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
