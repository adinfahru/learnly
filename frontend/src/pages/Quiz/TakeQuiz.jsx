// src/pages/student/quiz/TakeQuiz.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizDetail,
  startQuizAttempt,
  submitAnswer,
  completeSession,
} from "../../services/quizService";

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (currentSession?.duration) {
      setTimeLeft(currentSession.duration * 60);
    }
  }, [currentSession]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSessionComplete();
    }

    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
      // Save progress to localStorage
      saveProgress();
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await getQuizDetail(quizId);

      console.log("Quiz data:", response.data); // Debug log

      setQuiz(response.data);

      // Set current session immediately after getting quiz data
      if (response.data.sessions && response.data.sessions.length > 0) {
        setCurrentSession(response.data.sessions[0]);
      }

      // Start attempt
      try {
        const attemptResponse = await startQuizAttempt(quizId);
        setAttemptId(attemptResponse.data.id);

        // Load progress after everything is set
        loadProgress(response.data);
      } catch (attemptError) {
        console.error("Error starting attempt:", attemptError);
        setError("Failed to start quiz attempt");
      }
    } catch (err) {
      console.error("Error loading quiz:", err);
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = (quizData) => {
    if (!quizData) return;

    const saved = localStorage.getItem(`quiz_${quizId}_progress`);
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setAnswers(progress.answers || {});
        setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
        setAttemptId(progress.attemptId);

        if (progress.currentSession) {
          const session = quizData.sessions.find(
            (s) => s.id === progress.currentSession
          );
          if (session) {
            setCurrentSession(session);
            setTimeLeft(progress.timeLeft);
          }
        }
      } catch (err) {
        console.error("Error loading progress:", err);
      }
    }
  };

  // Add error handling in render
  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (loading || !quiz || !currentSession) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Loading quiz...</p>
      </div>
    );
  }

  const currentQuestion = currentSession.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="text-center p-4">
        <p>No questions available in this session.</p>
      </div>
    );
  }

  const saveProgress = () => {
    localStorage.setItem(
      `quiz_${quizId}_progress`,
      JSON.stringify({
        answers,
        currentQuestionIndex,
        currentSession: currentSession?.id,
        attemptId,
        timeLeft,
      })
    );
  };

  const handleAnswer = async (questionId, optionId) => {
    const newAnswers = {
      ...answers,
      [questionId]: optionId,
    };
    setAnswers(newAnswers);

    try {
      await submitAnswer(attemptId, {
        question_id: questionId,
        option_id: optionId,
      });
      saveProgress();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSessionComplete = async () => {
    if (!attemptId || !currentSession) {
      // toast.error("Missing required data to complete session");
      return;
    }

    setSubmitting(true);
    try {
      const result = await completeSession(attemptId, currentSession.id);

      // Clear progress for this session from localStorage
      const savedProgress = JSON.parse(
        localStorage.getItem(`quiz_${quizId}_progress`) || "{}"
      );
      delete savedProgress[currentSession.id];
      localStorage.setItem(
        `quiz_${quizId}_progress`,
        JSON.stringify(savedProgress)
      );

      if (result.is_quiz_completed) {
        // If all sessions are completed, redirect to results page
        // toast.success("Quiz completed successfully!");
        navigate(`/student/quiz/${quizId}/result`);
      } else {
        // Move to next session
        const currentIndex = quiz.sessions.findIndex(
          (s) => s.id === currentSession.id
        );
        const nextSession = quiz.sessions[currentIndex + 1];

        if (nextSession) {
          setCurrentSession(nextSession);
          setCurrentQuestionIndex(0);
          setTimeLeft(nextSession.duration * 60);
          setAnswers({}); // Reset answers for new session
          // toast.success("Session completed! Moving to next session.");
        } else {
          // Shouldn't reach here if backend is working correctly
          console.error(
            "No next session found but quiz not marked as completed"
          );
          // toast.error("Error moving to next session");
        }
      }
    } catch (error) {
      console.error("Error completing session:", error);
      // toast.error("Failed to complete session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!quiz || !currentSession) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">Unable to load quiz</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Timer */}
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow p-4">
        <p className="text-lg font-semibold">
          Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </p>
      </div>

      {/* Session Progress */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          Session {currentSession.name} (
          {quiz.sessions.indexOf(currentSession) + 1} of {quiz.sessions.length})
        </h2>
        <p className="text-gray-600">
          Question {currentQuestionIndex + 1} of{" "}
          {currentSession.questions.length}
        </p>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg mb-4">{currentQuestion.text}</p>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className={`block p-4 rounded-lg cursor-pointer ${
                  answers[currentQuestion.id] === option.id
                    ? "bg-indigo-50 border-2 border-indigo-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.id}
                  checked={answers[currentQuestion.id] === option.id}
                  onChange={() => handleAnswer(currentQuestion.id, option.id)}
                  className="mr-2"
                  disabled={submitting}
                />
                {option.text}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentQuestionIndex((i) => i - 1)}
          disabled={currentQuestionIndex === 0 || submitting}
          className="px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentQuestionIndex === currentSession.questions.length - 1 ? (
          <button
            onClick={handleSessionComplete}
            disabled={submitting}
            className={`px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {submitting ? "Completing..." : "Complete Session"}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex((i) => i + 1)}
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
