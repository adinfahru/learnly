import apiClient from "./apiClient";

export const getUser = async () => apiClient.get("/user/");
export const login = async (data) => apiClient.post("/login/", data);
export const register = async (data) => apiClient.post("/register/", data);
export const logout = async (refreshToken) =>
  apiClient.post("/logout/", { refresh: refreshToken });
