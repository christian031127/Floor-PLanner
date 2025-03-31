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
    if (error.response?.status === 401) {
      console.log("Access token expired. Attempting refresh...");
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token available");

        const refreshResponse = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;
        localStorage.setItem("access_token", newAccessToken);

        // Az eredeti kérés megismétlése az új tokennel
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        console.log("Refresh token expired. Logging out...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login"; // Kijelentkeztetés és átirányítás
      }
    }
    return Promise.reject(new Error(error));
  }
);

// JWT hozzáadása az API hívásokhoz
export const getAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});

// Védett adatok lekérése MongoDB-ből (JWT token szükséges)
export const fetchProtectedData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/data/`, getAuthHeaders());
    return response.data;
  } catch (error) {
    return { error: "Unauthorized or token expired" };
  }
};

//USERS--------------------------------------------------------------------------------------------------------------------

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data; // Sikeres válasz
  } catch (error) {
    if (error.response) {
      return { error: error.response.data.error || "Registration failed" };
    } else {
      return { error: "Server error. Please try again later." };
    }
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // JWT tokenek mentése a localStorage-be
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);

    return response.data; // Sikeres bejelentkezés esetén visszakapott adat
  } catch (error) {
    if (error.response) {
      return { error: error.response?.data?.error || "Login failed" };
    } else {
      return { error: "Server error. Please try again later." };
    }
  }
};

export const logoutUser = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/logout/`, {}, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    return response.data;
  } catch (error) {
    console.error("Logout failed:", error);
    return { error: "Logout failed. Please try again." };
  }
};

//PLANS--------------------------------------------------------------------------------------------------------------------

export const getPlans = async () => {
  const res = await api.get('/plans/');
  return res.data;
};

export const createPlan = async (name) => {
  const res = await api.post('/plans/', { name });
  return res.data;
};

export const deletePlan = async (id) => {
  const res = await api.delete('/plans/', { data: { id } });
  return res.data;
};

export const updatePlan = async (id, name) => {
  const res = await api.patch('/plans/', { id, name });
  return res.data;
};

export default api;
