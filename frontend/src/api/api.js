import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api"; // Django backend URL-je

// Axios példány létrehozása
const api = axios.create({
  baseURL: API_BASE_URL,
});

//JWT--------------------------------------------------------------------------------------------------------------------

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token frissítés automatikusan
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        console.warn("No refresh token found. Logging out...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.setItem("logout_reason", "session_expired");
        return Promise.reject(new Error("No refresh token"));
      }

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/users/refresh-token/`, {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;
        const newRefreshToken = refreshResponse.data.refresh;

        localStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
          console.log("Frissített refresh token:", newRefreshToken);
        }

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn("Refresh token invalid or expired. Logging out...");

        try {
          await axios.post(`${API_BASE_URL}/users/logout/`);
          console.log("Backend logout request sent.");
        } catch (logoutErr) {
          console.error("Backend logout request failed:", logoutErr);
        }

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.setItem("logout_reason", "session_expired");

        window.location.href = "/"

        return Promise.reject(
          refreshError instanceof Error
            ? refreshError
            : new Error("Session expired")
        );
      }
    }

    return Promise.reject(
      error instanceof Error ? error : new Error(error)
    );
  }
);

// JWT hozzáadása az API hívásokhoz
export const getAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});

//USERS--------------------------------------------------------------------------------------------------------------------

export const registerUser = async (userData) => {
  try {
    const response = await api.post(`/users/register/`, userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      return { error: error.response.data.error || "Registration failed" };
    }
    return { error: "Server error. Please try again later." };
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await api.post(`/users/login/`, userData);

    // Tokenek mentése
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);

    return response.data;
  } catch (error) {
    if (error.response) {
      return { error: error.response.data.error || "Login failed" };
    }
    return { error: "Server error. Please try again later." };
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post(`/users/logout/`);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return response.data;
  } catch (error) {
    console.error("Logout failed:", error);
    return { error: "Logout failed. Please try again." };
  }
};

//PLANS--------------------------------------------------------------------------------------------------------------------

export const getPlan = async (id) => {
  const res = await api.get(`/plans/?id=${id}`);
  return res.data;
};

export const getPlans = async () => {
  const res = await api.get('/plans/');
  return res.data;
};

export const createPlan = async (plan) => {
  const res = await api.post('/plans/', plan);
  return res.data;
};

export const deletePlan = async (id) => {
  const res = await api.delete('/plans/', { data: { id } });
  return res.data;
};

export const updatePlan = async (id, payload) => {
  const res = await api.patch('/plans/', { id, ...payload });
  return res.data;
};

export default api;
