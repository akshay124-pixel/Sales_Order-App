import axios from "axios";
import { toast } from "react-toastify";

// Configure a base URL if desired; components often use absolute URLs already
const BASE_URL = process.env.REACT_APP_URL;
if (BASE_URL) {
  axios.defaults.baseURL = BASE_URL;
}

// Attach token on every request if present
axios.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // ignore storage errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isLoggingOut = false;

function forceLogout(message = "Session expired. Please log in again.") {
  if (isLoggingOut) return;
  isLoggingOut = true;
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
  } catch (_) { }

  // Show toast before redirecting (optional, but good UX)
  toast.error(message);

  // Redirect to login without leaving history entry
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  } else {
    // Already on login — allow new login attempts
    isLoggingOut = false;
  }
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isNetwork = !!error?.code && error.code === "ERR_NETWORK";

    // 1. Session Expired -> Redirect
    // 401: Unauthorized (Token expired/invalid)
    if (status === 401) {
      forceLogout("Session expired. Please log in again.");
      return Promise.reject(error);
    }

    // 2. Other Errors -> Show Toast, Do NOT Redirect
    let displayMessage = "";

    if (isNetwork) {
      displayMessage = "Connection lost. Please check your internet.";
    } else if (status === 413) {
      displayMessage = "File too large. Please upload a smaller file (max 10MB).";
    } else if (status === 403) {
      displayMessage = "You do not have permission to perform this action.";
    } else if (status >= 500) {
      displayMessage = "Something went wrong on the server. Please try again.";
    } else if (status === 400) {
    }

    if (displayMessage) {
      toast.error(displayMessage);
    }

    // Return logic: Always reject so component catches it
    return Promise.reject(error);
  }
);

export { };
