import apiClient from "./apiClient";

// Fetch the currently logged-in user data
export const getUser = async () => {
  return apiClient.get("accounts/user/");
};

// Login user with provided credentials
export const login = async (data) => {
  return apiClient.post("accounts/login/", data);
};

// Register a new user
export const register = async (data) => {
  return apiClient.post("accounts/register/", data);
};

// Logout the user by invalidating the refresh token
export const logout = async (refreshToken, accessToken) => {
  // Include the access token in the Authorization header
  return apiClient.post("accounts/logout/", { refresh: refreshToken }, {
    headers: {
      Authorization: `Bearer ${accessToken}`  // Attach the access token for authentication
    }
  });
};  