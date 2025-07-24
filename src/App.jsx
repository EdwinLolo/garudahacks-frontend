
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./store";
import { login, logout } from "./authSlice";
import Navbar from "./layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Footer from "./layout/Footer";
import SubjectDetail from "./pages/SubjectDetail";

function PrivateRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isLoginPage = location.pathname === "/login";

  const handleLogin = (user) => {
    dispatch(login(user));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {!isLoginPage && <Navbar onLogout={handleLogout} isAuthenticated={isAuthenticated} />}
      <main>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} isAuthenticated={isAuthenticated} />} />
          <Route
            path="/"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/subject/:id"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <SubjectDetail />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </>
  );
}

export default App;
