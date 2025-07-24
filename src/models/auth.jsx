import { getBaseUrl } from "./utils";
const API_BASE_URL = getBaseUrl();

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("session_token");

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return await response.json();
};

export const login = async (email, password) => {
  return apiCall("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const signup = async (
  email,
  password,
  name,
  role = "student",
  grade = 0
) => {
  return apiCall("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, role, name, grade }),
  });
};

export const logout = async () => {
  apiCall("/logout", {
    method: "POST",
  })
    .then(() => {
      console.log("Logout successful");
    })
    .catch((error) => {
      console.error("Logout API error:", error);
      // You might want to show a toast notification here
    });

  // Clear localStorage
  localStorage.removeItem("session_token");
  localStorage.removeItem("user_data");
  localStorage.removeItem("user_profile");
};
