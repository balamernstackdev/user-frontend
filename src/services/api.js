import axios from 'axios';
import TokenService from './token.service';


const api = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    baseURL: 'https://user-backend-api.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for refresh tokens
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = TokenService.getToken();
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

        // Skip 401 interception for login requests to avoid redirect loops or suppressing specific errors
        if (originalRequest.url.includes('/auth/login')) {
            return Promise.reject(error);
        }

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
                    TokenService.updateToken(accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token failed, logout user
                    TokenService.removeUser();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // Other 401 errors (invalid credentials, etc.)
                TokenService.removeUser();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
