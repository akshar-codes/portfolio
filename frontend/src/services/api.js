import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const is401 = error.response?.status === 401;
    const onLoginPage = window.location.pathname === "/admin/login";

    if (is401 && !onLoginPage) {
      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  },
);

export default api;
