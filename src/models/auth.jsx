import { apiCall } from "./utils";

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
  role,
  grade,
  school_name
) => {
  return apiCall("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, role, name, grade, school_name }),
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
