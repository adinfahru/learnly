import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizzes } from "../../services/quizService";

export default function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await getQuizzes();
      setQuizzes(response.data);
    } catch (error) {
      console.error("Error loading quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/teacher/dashboard')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Class
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Quizzes</h1>
        <button
          onClick={() => navigate("/quiz/create")}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Create New Quiz
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              <div className="text-sm text-gray-500">
                <p>Total Questions: {quiz.total_questions}</p>
                <p>Total Duration: {quiz.total_duration} minutes</p>
                <p>Classes: {quiz.classes.length}</p>
              </div>
              <div className="mt-4">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
