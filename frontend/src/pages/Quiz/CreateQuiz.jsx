// src/pages/quiz/Create.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "../../services/quizService";
import { getTeacherClasses } from "../../services/classService";

export default function Create() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    randomize_questions: false,
    show_result: true,
    show_answers: false,
    classes: [],
  });

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getTeacherClasses();
        setClasses(response.data);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes");
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate that at least one class is selected
      if (formData.classes.length === 0) {
        throw new Error("Please select at least one class");
      }

      const response = await createQuiz(formData);
      navigate(`/quiz/${response.data.id}/edit`);
    } catch (err) {
      setError(err.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleClassToggle = (classId) => {
    setFormData((prev) => {
      const classes = prev.classes.includes(classId)
        ? prev.classes.filter((id) => id !== classId)
        : [...prev.classes, classId];
      return { ...prev, classes };
    });
  };

  const handleSelectAllClasses = (e) => {
    setFormData((prev) => ({
      ...prev,
      classes: e.target.checked ? classes.map((c) => c.id) : [],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quiz Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
              />
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Classes
              </label>

              {/* Select All Option */}
              <div className="mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.classes.length === classes.length}
                    onChange={handleSelectAllClasses}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Select All Classes
                  </span>
                </label>
              </div>

              {/* Class List */}
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {classes.map((classItem) => (
                  <label key={classItem.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.classes.includes(classItem.id)}
                      onChange={() => handleClassToggle(classItem.id)}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {classItem.name}
                    </span>
                  </label>
                ))}
              </div>
              {classes.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No classes available
                </p>
              )}
            </div>

            {/* Quiz Settings */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="randomize"
                  checked={formData.randomize_questions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      randomize_questions: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <label
                  htmlFor="randomize"
                  className="ml-2 text-sm text-gray-700"
                >
                  Randomize Questions
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showResult"
                  checked={formData.show_result}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      show_result: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <label
                  htmlFor="showResult"
                  className="ml-2 text-sm text-gray-700"
                >
                  Show Result After Completion
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showAnswers"
                  checked={formData.show_answers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      show_answers: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <label
                  htmlFor="showAnswers"
                  className="ml-2 text-sm text-gray-700"
                >
                  Show Correct Answers After Completion
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/quiz/list")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.classes.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {loading ? "Creating..." : "Continue to Questions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
