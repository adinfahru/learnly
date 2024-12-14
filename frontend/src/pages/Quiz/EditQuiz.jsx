import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizDetail,
  createSession,
  publishQuiz,
} from "../../services/quizService";
import QuestionEditor from "../../components/quiz/QuestionEditor";
import PublishQuizModal from "../../components/quiz/PublishQuizModal";

const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newSession, setNewSession] = useState({
    name: "",
    duration: 30,
  });

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  const loadQuizData = async () => {
    try {
      const response = await getQuizDetail(quizId);
      setQuiz(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  // Tambahkan fungsi handlePublishQuiz
  const handlePublishQuiz = async (publishData) => {
    try {
      await publishQuiz(quizId, publishData);
      // Refresh quiz data setelah publish
      await loadQuizData();
      setShowPublishModal(false);
      // Optional: Tampilkan notifikasi sukses
      alert("Quiz published successfully!");
    } catch (err) {
      console.error("Error publishing quiz:", err);
      alert(err.response?.data?.message || "Failed to publish quiz");
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();

    try {
      const response = await createSession({
        ...newSession,
        quiz: quizId,
        order: quiz.sessions.length + 1,
      });
      setQuiz({
        ...quiz,
        sessions: [...quiz.sessions, response.data],
      });
      setNewSession({ name: "", duration: 30 });
      alert("Session added successfully!");
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{quiz?.title}</h1>
        <button
          onClick={() => navigate("/quiz/list")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Quizzes
        </button>
      </div>

      {/* Sessions Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sessions</h2>
          <div className="space-y-4">
            {quiz?.sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg cursor-pointer ${
                  activeSession?.id === session.id
                    ? "bg-indigo-50 border-2 border-indigo-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => setActiveSession(session)}
              >
                <h3 className="font-medium">{session.name}</h3>
                <p className="text-sm text-gray-500">
                  Duration: {session.duration} minutes
                </p>
                <p className="text-sm text-gray-500">
                  Questions: {session.questions?.length || 0}
                </p>
              </div>
            ))}

            {/* Add New Session Form */}
            <form onSubmit={handleAddSession} className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Add New Session</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Session Name"
                  value={newSession.name}
                  onChange={(e) =>
                    setNewSession({ ...newSession, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={newSession.duration}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-20 p-2 border rounded"
                    required
                  />
                  <span className="ml-2">minutes</span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Add Session
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Questions Editor */}
        <div className="md:col-span-2">
          {activeSession ? (
            <QuestionEditor
              session={activeSession}
              onQuestionAdded={(newQuestion) => {
                // Update the active session with the new question
                const updatedSession = {
                  ...activeSession,
                  questions: [...(activeSession.questions || []), newQuestion],
                };
                // Update the quiz state with the updated session
                setQuiz((prevQuiz) => ({
                  ...prevQuiz,
                  sessions: prevQuiz.sessions.map((s) =>
                    s.id === activeSession.id ? updatedSession : s
                  ),
                }));

                // Update active session
                setActiveSession(updatedSession);
              }}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a session to manage questions
            </div>
          )}
        </div>
      </div>

      {/* Publish Quiz Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setShowPublishModal(true)}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Publish Quiz
        </button>
      </div>

      {/* Publish Modal Component */}
      <PublishQuizModal
        show={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublishQuiz}
        quiz={quiz}
      />
    </div>
  );
};

export default EditQuiz;
