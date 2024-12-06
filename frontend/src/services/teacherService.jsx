import apiClient from "./apiClient";

// Get teacher dashboard data
export const getTeacherDashboard = async () => {
  return apiClient.get("teacher/dashboard/");
};

// Get all classes created by teacher
export const getTeacherClasses = async () => {
  return apiClient.get("teacher/classes/");
};

// Create a new class
export const createClass = async (classData) => {
  return apiClient.post("teacher/classes/", classData);
};

// Update class
export const updateClass = async (classId, classData) => {
  return apiClient.put(`teacher/classes/${classId}/`, classData);
};

// Delete class
export const deleteClass = async (classId) => {
  return apiClient.delete(`teacher/classes/${classId}/`);
};

// Get specific class details
export const getClassDetails = async (classId) => {
  return apiClient.get(`teacher/classes/${classId}/`);
};
