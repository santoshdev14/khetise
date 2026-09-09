// Central API Client for Kheti Se

// Automatically determine backend API URL
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }
  // In dev / Vite proxy mode, relative path "/" sends requests to Vite proxy (/api -> :5000/api)
  return "";
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Get stored auth token
 */
export function getAuthToken() {
  try {
    return localStorage.getItem("kheti_se_admin_token");
  } catch (e) {
    return null;
  }
}

/**
 * Main API request wrapper
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers
  };

  // If not FormData, default to JSON content type
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      // not JSON
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
