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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../models/auth";
import { useSelector } from "react-redux";

export default function Login({ onLogin, isAuthenticated }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { subjects, fetchSubjectsByGrade, fetchSubjectsAdmin } = useSubjectContext();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const reduxIsAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );
  const userRole = useSelector((state) => state.auth.user?.profile?.role);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Call your API endpoint
      const response = await login(email, password);
      console.log("Login response:", response);

      if (response) {
        console.log("Login successful:", response);

        localStorage.setItem("session_token", response.session);
        localStorage.setItem("user_data", JSON.stringify(response.user));
        localStorage.setItem("user_profile", JSON.stringify(response.profile));

        // Fetch subjects by grade (class) after login
        if (response.profile.role === "admin" || response.profile.role === "teacher") {
          await fetchSubjectsAdmin();
        } else {
          await fetchSubjectsByGrade();
        }
        console.log("Subjects fetched after login:", subjects);

        // Update Redux store with user data
        onLogin({
          email: response.user.email,
          name: response.profile?.full_name || response.user.email,
          role: response.profile?.role || "student",
          user: response.user,
          profile: response.profile,
        });

        // Navigation will happen automatically due to isAuthenticated change
        // But we can also navigate explicitly
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reduxIsAuthenticated && userRole) {
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [reduxIsAuthenticated, userRole, navigate]);

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
                LearnMuse
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
                Welcome Back
              </h2>
            </div>
            <p className="transition-colors duration-300 dark:text-gray-300">
              Unlock your potential through learning
            </p>
          </div>

          {/* Main Login Card */}
          <div className="backdrop-blur-lg shadow-2xl rounded-3xl p-6 md:p-8 border transition-colors duration-300 bg-white/80 border-white/20 dark:bg-gray-800/80 dark:border-gray-700/20">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <div className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">
                  {error}
                </div>
              </div>
            )}

            {/* Convert to form for proper submission */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 border-gray-200 bg-gray-50/50 placeholder-gray-500 hover:bg-white/70 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400 dark:hover:bg-gray-700/70"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 border-gray-200 bg-gray-50/50 placeholder-gray-500 hover:bg-white/70 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400 dark:hover:bg-gray-700/70"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                  />
                  <span className="transition-colors duration-300 dark:text-gray-300">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Login Button - Changed to type="submit" */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In to Learn"
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm transition-colors duration-300 dark:text-gray-300">
                New to learning?{" "}
                <a
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                  Create your account
                </a>
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
              © 2025 LearnMuse. Empowering minds, one lesson at a time.
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
