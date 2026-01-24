import axios from "axios";
import { useAuthStore } from "@/stores";
import { extractErrorMessage } from "../utils";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // ⭐ IMPORTANT: Send cookies (refresh token)
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

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

// Add a request interceptor to include the token for all requests
api.interceptors.request.use(
  (config) => {
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
      const error = new Error(
        response.data.error || response.data.message || "Request failed",
      );
      (error as any).response = response;
      return Promise.reject(error);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
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
            withCredentials: true, // Send refresh token cookie
          },
        );

        if (response.data.status && response.data.token) {
          const newAccessToken = response.data.token;

          // Update token in Zustand
          useAuthStore.getState().setToken(newAccessToken);

          // Update Authorization header
          api.defaults.headers.common["Authorization"] =
            `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError, null);

        const currentPath = window.location.pathname;
        if (currentPath !== "/auth") {
          sessionStorage.setItem("returnUrl", currentPath);
        }

        useAuthStore.getState().clearAuth();
        window.location.href = "/auth";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const message = extractErrorMessage(error);
    if (!axios.isCancel(error)) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
