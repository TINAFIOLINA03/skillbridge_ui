import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
});

// Attach JWT token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 (expired / missing token) → auto-logout + redirect to /login
// 403 is intentionally NOT handled here — it means "forbidden for this action"
// (e.g. business rules) and should be shown as an in-page error, not a logout.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
