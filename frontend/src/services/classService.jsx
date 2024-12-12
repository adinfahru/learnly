// src/services/classService.js
import apiClient from "./apiClient";

// Teacher functions
export const getTeacherClasses = async () => {
  return apiClient.get("classes/");
};

export const createClass = async (classData) => {
  return apiClient.post("classes/", classData);
};

export const updateClass = async (classId, classData) => {
  return apiClient.put(`classes/${classId}/`, classData);
};

export const deleteClass = async (classId) => {
  return apiClient.delete(`classes/${classId}/`);
};

// Common functions
export const getClassDetails = async (classId) => {
  return apiClient.get(`classes/${classId}/`);
};

export const removeStudent = async (classId, studentId) => {
  return apiClient.post(`classes/${classId}/remove_student/`, {
    student_id: studentId
  });
};

export const leaveClass = async (classId) => {
  return apiClient.post(`classes/${classId}/leave_class/`);
};