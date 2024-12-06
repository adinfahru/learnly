import apiClient from "./apiClient";

// Get student dashboard data
export const getStudentDashboard = async () => {
  return apiClient.get("student/dashboard/");
};

// Get all enrolled classes
export const getEnrolledClasses = async () => {
  return apiClient.get("student/enrolled-classes/");
};

// Join a class using class code
export const joinClass = async (classCode) => {
  return apiClient.post("student/join-class/", { code: classCode });
};

// Leave a class
export const leaveClass = async (classId) => {
  return apiClient.post("student/leave-class/", { class_id: classId });
};
