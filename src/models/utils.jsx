export function getBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log("Using API base URL:", baseUrl);
  return baseUrl;
}
