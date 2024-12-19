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

export const submitAnswer = async (attemptId, answerData) => {
  // Log untuk memastikan data yang dikirim
  console.log('Submitting answer:', {attemptId, answerData});
  return apiClient.post(`attempts/${attemptId}/submit_answer/`, {
    question_id: answerData.questionId,
    option_id: answerData.optionId,
    session_id: answerData.sessionId
  });
};


export const completeSession = async (attemptId, sessionId) => {
  // Log untuk memastikan data yang dikirim
  console.log('Completing session:', {attemptId, sessionId});
  return apiClient.post(`attempts/${attemptId}/complete_session/`, {
    session_id: sessionId
  });
};
