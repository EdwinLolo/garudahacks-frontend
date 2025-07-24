export const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log("Using API base URL:", baseUrl);
  return baseUrl;
};

function BaseURL() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log("Using API base URL:", baseUrl);
  return baseUrl;
}

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("session_token");
  const baseURL = BaseURL();

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${baseURL}${endpoint}`, {
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
