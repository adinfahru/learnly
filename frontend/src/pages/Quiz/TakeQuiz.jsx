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

  const [attempts, setAttempts] = useState({});

  const saveProgress = () => {
    localStorage.setItem(
      `quiz_${quizId}_progress`,
      JSON.stringify({
        answers,
        currentQuestionIndex,
        session_id: currentSession?.id,
        attemptId,
        timeLeft,
      })
    );
  };

  const loadProgress = (quizData) => {
    const saved = localStorage.getItem(`quiz_${quizId}_progress`);
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setAnswers(progress.answers || {});
        setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
        setAttemptId(progress.attemptId);
        const session = quizData.sessions.find(
          (s) => s.id === progress.session_id
        );
        if (session) {
          setCurrentSession(session);
          setTimeLeft(progress.timeLeft);
        }
      } catch (err) {
        console.error("Error loading progress:", err);
      }
    }
  };

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await getQuizDetail(quizId);
      setQuiz(response.data);

      if (response.data.sessions?.length > 0) {
        setCurrentSession(response.data.sessions[0]);
      }

      const attemptResponse = await startQuizAttempt(quizId);
      setAttemptId(attemptResponse.data.id);
      setAttempts({ [quizId]: attemptResponse.data });

      loadProgress(response.data);
    } catch (err) {
      console.error("Error loading quiz:", err);
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (questionId, optionId) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const newAnswers = { ...answers, [questionId]: optionId };
      setAnswers(newAnswers);

      await submitAnswer(attemptId, {
        questionId,
        optionId,
        session_id: currentSession.id,
      });
      saveProgress();
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSessionComplete = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const result = await completeSession(attemptId, currentSession.id);

      if (result.data.is_quiz_completed) {
        navigate(`/student/quiz/${quizId}/result`);
      } else {
        const currentIndex = quiz.sessions.findIndex(
          (s) => s.id === currentSession.id
        );
        const nextSession = quiz.sessions[currentIndex + 1];

        if (nextSession) {
          setCurrentSession(nextSession);
          setCurrentQuestionIndex(0);
          setTimeLeft(nextSession.duration * 60);
          setAnswers({});
        }
      }
    } catch (error) {
      console.error("Error completing session:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz?.show_result && attempts[quizId]?.completed_at) {
      navigate(`/student/quiz/${quizId}/result/${attemptId}`);
    } else if (!quiz?.show_result && attempts[quizId]?.completed_at) {
      navigate("/student/dashboard");
    }
  }, [quiz, attemptId, quizId, navigate, attempts]);

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
      saveProgress();
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !quiz || !currentSession) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error || "Unable to load quiz"}</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = currentSession.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow p-4">
        <p className="text-lg font-semibold">
          Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </p>
      </div>

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
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed"
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
