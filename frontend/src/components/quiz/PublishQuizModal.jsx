import React, { useState } from "react";
import moment from "moment";

const PublishQuizModal = ({ show, onClose, onPublish, quiz }) => {
  const [publishData, setPublishData] = useState({
    start_date: "",
    end_date: "",
  });

  const handlePublish = () => {
    // Konversi ke ISO string dengan timezone
    const formattedData = {
      start_date: publishData.start_date
        ? moment(publishData.start_date).format("YYYY-MM-DDTHH:mm:ssZ")
        : null,
      end_date: publishData.end_date
        ? moment(publishData.end_date).format("YYYY-MM-DDTHH:mm:ssZ")
        : null,
    };

    onPublish(formattedData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Publish Quiz</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={publishData.start_date}
              onChange={(e) =>
                setPublishData({ ...publishData, start_date: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={publishData.end_date}
              onChange={(e) =>
                setPublishData({ ...publishData, end_date: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">Quiz Summary</h3>
            <p>Total Sessions: {quiz.sessions.length}</p>
            <p>Total Questions: {quiz.total_questions}</p>
            <p>Total Duration: {quiz.total_duration} minutes</p>
          </div>

          {/* ... rest of your component ... */}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Publish Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishQuizModal;
