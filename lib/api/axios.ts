import axios from "axios";
import { useAuthStore } from "@/stores";
import { extractErrorMessage } from "../utils";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // ⭐ NEW: This matches the "lock" we added to the backend
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true, // ⭐ IMPORTANT: Send cookies (refresh token)
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];
// ⭐ NEW: Flag to prevent multiple logout triggers and block API stress
let isLoggingOut = false;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Helper to handle forced logout exactly once
const handleForcedLogout = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  useAuthStore.getState().clearAuth();

  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    if (currentPath !== "/auth") {
      sessionStorage.setItem("returnUrl", currentPath);
      // Use replace for immediate redirection
      window.location.replace("/auth");
      toast.error("Your session has expired. Please sign in again to continue.");
    }
  }
};

// Add a request interceptor to include the token for all requests
api.interceptors.request.use(
  (config) => {
    // ⭐ NEW: If we are already logging out, block all new requests immediately to save backend stress
    if (isLoggingOut) {
      return Promise.reject(new Error("Session expired, logging out..."));
    }

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check if the request data is FormData and adjust Content-Type accordingly
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.status === false) {
      // Prefer 'message' over 'error' if both are present
      const errorMsg =
        response.data.message || response.data.error || "Request failed";
      const error = new Error(errorMsg);
      (error as any).response = response;
      return Promise.reject(error);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ⭐ NEW: If we are already logging out, just kill everything
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    // If error is 401
    if (error.response?.status === 401) {
      // If we've already tried to refresh and it still failed with 401
      if (originalRequest._retry) {
        handleForcedLogout();
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            },
          },
        );

        if (response.data.status && response.data.token) {
          const newAccessToken = response.data.token;
          useAuthStore.getState().setToken(newAccessToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleForcedLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const message = extractErrorMessage(error);
    if (!axios.isCancel(error) && !isLoggingOut) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
