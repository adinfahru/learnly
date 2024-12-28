import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getClassQuizzes, getQuizAttempts } from "../../services/quizService";

export default function ClassworkTab({ classData }) {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [classData.id]);

  const loadData = async () => {
    try {
      const [quizzesResponse, attemptsResponse] = await Promise.all([
        getClassQuizzes(classData.id),
        userRole === "student" ? getQuizAttempts() : null,
      ]);

      setQuizzes(quizzesResponse.data);

      if (attemptsResponse) {
        const attemptsMap = attemptsResponse.data.reduce((acc, attempt) => {
          acc[attempt.quiz] = attempt;
          return acc;
        }, {});
        setAttempts(attemptsMap);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderQuizButton = (quiz) => {
    const attempt = attempts[quiz.id];
    const isCompleted = attempt?.completed_at;

    if (userRole === "teacher") {
      return (
        <div className="space-y-2">
          <button
            onClick={() => navigate(`/quiz/${quiz.id}/submissions`)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submissions
          </button>
          <button
            onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
            className="mt-2 text-indigo-600 hover:text-indigo-800"
          >
            Edit Quiz
          </button>
        </div>
      );
    }

    if (!quiz.is_published) {
      return (
        <button disabled className="mt-2 bg-gray-400 text-white px-4 py-2 rounded">
          Not Available
        </button>
      );
    }

    if (isCompleted) {
      return (
        <div className="space-y-2 text-center">
          {quiz.show_result ? (
            <div className="text-lg font-semibold text-green-600">
              Score: {attempt.score}%
            </div>
          ) : (
            <div className="text-sm font-medium text-gray-500 py-2">
              You have completed this quiz.
            </div>
          )}
          {quiz.show_answers && (
            <button
              onClick={() => navigate(`/quiz/${quiz.id}/result/${attempt.id}`)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Show Answers
            </button>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={() => navigate(`/quiz/${quiz.id}/take`)}
        className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Take Quiz
      </button>
    );
  };

  if (loading) return <div>Loading quizzes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {userRole === "teacher" && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate("/quiz/create")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create New Quiz
          </button>
          <button
            onClick={() => navigate(`/quiz/list?classId=${classData.id}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Manage Quizzes
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quizzes</h3>

          {quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{quiz.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {quiz.description}
                      </p>
                      <div className="mt-2 space-x-4 text-sm">
                        <span>Questions: {quiz.total_questions}</span>
                        <span>Duration: {quiz.total_duration} minutes</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {quiz.start_date && (
                        <p className="text-sm text-gray-500">
                          Start: {new Date(quiz.start_date).toLocaleDateString()}
                        </p>
                      )}
                      {quiz.end_date && (
                        <p className="text-sm text-gray-500">
                          End: {new Date(quiz.end_date).toLocaleDateString()}
                        </p>
                      )}
                      {renderQuizButton(quiz)}
                    </div>
                  </div>
                  {userRole === "teacher" && (
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          quiz.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {quiz.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No quizzes available at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
