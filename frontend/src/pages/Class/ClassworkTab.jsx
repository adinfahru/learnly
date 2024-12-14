import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getClassQuizzes } from "../../services/quizService";

export default function ClassworkTab({ classData }) {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, [classData.id]);

  const loadQuizzes = async () => {
    try {
      const response = await getClassQuizzes(classData.id);
      setQuizzes(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load quizzes");
      console.error("Error loading quizzes:", err);
    } finally {
      setLoading(false);
    }
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
                          Start:{" "}
                          {new Date(quiz.start_date).toLocaleDateString()}
                        </p>
                      )}
                      {quiz.end_date && (
                        <p className="text-sm text-gray-500">
                          End: {new Date(quiz.end_date).toLocaleDateString()}
                        </p>
                      )}
                      {userRole === "teacher" ? (
                        <button
                          onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
                          className="mt-2 text-indigo-600 hover:text-indigo-800"
                        >
                          Edit Quiz
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/quiz/${quiz.id}/take`)}
                          className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                          disabled={!quiz.is_published}
                        >
                          {quiz.is_published ? "Take Quiz" : "Not Available"}
                        </button>
                      )}
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
