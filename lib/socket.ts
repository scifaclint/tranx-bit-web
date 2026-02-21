import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores";

// Strip any path (e.g. /api/v1) from the REST API URL so Socket.IO connects to
// the server root. Socket.IO interprets the path segment as a namespace, and
// anything other than "/" is "Invalid namespace" unless explicitly registered on
// the server.
const _apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SOCKET_URL = (() => {
    try {
        const u = new URL(_apiUrl);
        return u.origin; // e.g. "http://localhost:8080"
    } catch {
        return _apiUrl;
    }
})();

// Create a single socket instance
// autoConnect: false allows us to control exactly when we connect via the Provider
export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"], // Force websocket for better performance and to match axios config
});

// Update the auth token for the handshake whenever it changes in the store
useAuthStore.subscribe((state) => {
    const newToken = state.token;
    if (newToken) {
        socket.auth = {
            token: newToken,
        };
    }
});

// Helper to initialize auth for the very first connection
export const initSocketAuth = () => {
    const token = useAuthStore.getState().token;
    if (token) {
        socket.auth = {
            token: token,
        };
    }
};
