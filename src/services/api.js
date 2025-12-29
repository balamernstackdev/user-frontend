import axios from 'axios';
import { authService } from './auth.service';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for refresh tokens
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if it's a TOKEN_EXPIRED error
            if (error.response.data?.code === 'TOKEN_EXPIRED') {
                originalRequest._retry = true;

                try {
                    // Try to refresh the token
                    const response = await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    const { accessToken } = response.data.data;

                    // Save new token
                    authService.setToken(accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token failed, logout user
                    authService.logout();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // Other 401 errors (invalid credentials, etc.)
                authService.logout();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
