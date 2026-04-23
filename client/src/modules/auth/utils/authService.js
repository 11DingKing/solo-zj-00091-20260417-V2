import apiClient from "../../../utils/apiClient";

const REGISTER_URL = "/auth/users/";
const LOGIN_URL = "/auth/jwt/create/";
const ACTIVATE_URL = "/auth/users/activation/";

const register = async (userData) => {
  const response = await apiClient.post(REGISTER_URL, userData);
  return response.data;
};

const login = async (userData) => {
  const response = await apiClient.post(LOGIN_URL, userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => localStorage.removeItem("user");

const activate = async (userData) => {
  const response = await apiClient.post(ACTIVATE_URL, userData);
  return response.data;
};

const authService = { register, login, logout, activate };

export default authService;
