// src/services/quizService.js
import apiClient from "./apiClient";

// Quiz management
export const getQuizzes = async () => {
  return apiClient.get("quizzes/");
};

export const createQuiz = async (quizData) => {
  return apiClient.post("quizzes/", quizData);
};

export const getQuizDetail = async (quizId) => {
  return apiClient.get(`quizzes/${quizId}/`);
};

export const updateQuiz = async (quizId, quizData) => {
  return apiClient.put(`quizzes/${quizId}/`, quizData);
};

export const publishQuiz = async (quizId, publishData) => {
  return apiClient.post(`quizzes/${quizId}/publish/`, publishData);
};

// Quiz taking
export const startQuizAttempt = async (quizId) => {
  return apiClient.post(`quizzes/${quizId}/start/`);
};

export const submitAnswer = async (attemptId, answerData) => {
  return apiClient.post(`attempts/${attemptId}/submit/`, answerData);
};

export const getClassQuizzes = async (classId) => {
  return apiClient.get(`classes/${classId}/quizzes/`);
};

export const createSession = async (sessionData) => {
  const response = await apiClient.post("sessions/", {
    name: sessionData.name,
    duration: sessionData.duration,
    quiz: sessionData.quiz,
    order: sessionData.order,
  });
  return response;
};

export const updateSession = async (sessionId, sessionData) => {
  return apiClient.put(`sessions/${sessionId}/`, sessionData);
};

export const deleteSession = async (sessionId) => {
  return apiClient.delete(`sessions/${sessionId}/`);
};

export const createQuestion = async (questionData) => {
  return apiClient.post("questions/", questionData);
};

export const getAvailableQuizzes = async () => {
  return apiClient.get("quizzes/available/");
};

export const completeSession = async (attemptId, sessionId) => {
  try {
    const response = await apiClient.post(
      `attempts/${attemptId}/complete-session/`,
      { session_id: sessionId }
    );
    return response.data;
  } catch (error) {
    console.error('Error completing session:', error);
    throw error;
  }
};
