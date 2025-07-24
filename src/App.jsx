import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./store";
import { login, logout } from "./authSlice";
import Navbar from "./layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Footer from "./layout/Footer";
import SubjectDetail from "./pages/SubjectDetail";
import MaterialDetail from "./pages/MaterialDetail";
import { SubjectProvider } from "./context/SubjectContext";

function PrivateRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppWithSubjectProvider />
      </Router>
    </Provider>
  );
}

function AppWithSubjectProvider() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  // Use user.id or user.email as unique identifier if available
  const userId = isAuthenticated && user ? user.id || user.email : undefined;
  return (
    <SubjectProvider userId={userId}>
      <AppContent />
    </SubjectProvider>
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
      {!isLoginPage && (
        <Navbar onLogout={handleLogout} isAuthenticated={isAuthenticated} />
      )}
      <main>
        <Routes>
          <Route
            path="/login"
            element={
              <Login onLogin={handleLogin} isAuthenticated={isAuthenticated} />
            }
          />
          <Route
            path="/register"
            element={
              <Register
                onLogin={handleLogin}
                isAuthenticated={isAuthenticated}
              />
            }
          />
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
          <Route
            path="/material/:id"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <MaterialDetail />
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
