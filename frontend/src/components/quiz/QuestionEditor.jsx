import React, { useState, useEffect } from "react";
import { createQuestion } from "../../services/quizService";

const QuestionEditor = ({ session, onQuestionAdded }) => {
  const [questions, setQuestions] = useState(session.questions || []);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setQuestions(session.questions || []);
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccessMessage("");

    try {
      const questionData = {
        text: newQuestion.text,
        session: session.id,
        order: questions.length + 1,
        options: newQuestion.options,
      };

      const response = await createQuestion(questionData);

      // Update local questions state
      setQuestions((prevQuestions) => [...prevQuestions, response.data]);

      // Call parent callback
      onQuestionAdded(response.data);

      // Show success message
      setSuccessMessage("Question added successfully!");

      // Reset form
      setNewQuestion({
        text: "",
        session: session.id,
        options: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error creating question:", err);
      setError(err.response?.data?.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Questions for {session.name}
      </h2>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded flex justify-between items-center">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Existing Questions */}
      <div className="mb-6 space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-gray-50 p-4 rounded">
            <p className="font-medium">Question {index + 1}</p>
            <p className="mt-2">{question.text}</p>
            <div className="mt-2 space-y-2">
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`flex items-center ${
                    option.is_correct ? "text-green-600" : ""
                  }`}
                >
                  <span className="w-6">
                    {String.fromCharCode(65 + optIndex)}.
                  </span>
                  <span>{option.text}</span>
                  {option.is_correct && (
                    <span className="ml-2 text-sm">(Correct)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Question Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Question Text
          </label>
          <textarea
            value={newQuestion.text}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, text: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Options</label>
          {newQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span>{String.fromCharCode(65 + index)}.</span>
              <input
                type="text"
                value={option.text}
                onChange={(e) => {
                  const newOptions = [...newQuestion.options];
                  newOptions[index] = { ...option, text: e.target.value };
                  setNewQuestion({ ...newQuestion, options: newOptions });
                }}
                className="flex-1 p-2 border rounded"
                required
              />
              <input
                type="radio"
                name="correct_answer"
                checked={option.is_correct}
                onChange={() => {
                  const newOptions = newQuestion.options.map((opt, i) => ({
                    ...opt,
                    is_correct: i === index,
                  }));
                  setNewQuestion({ ...newQuestion, options: newOptions });
                }}
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? "Adding..." : "Add Question"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionEditor;
