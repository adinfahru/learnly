import apiClient from "./apiClient";

// Get teacher dashboard data
export const getTeacherDashboard = async () => {
  return apiClient.get("teacher/dashboard/");
};