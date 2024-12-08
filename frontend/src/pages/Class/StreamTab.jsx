import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function StreamTab({ classData }) {
  const { userRole } = useAuth();

  return (
    <div className="space-y-6">
      {userRole === 'teacher' && (
        <div className="bg-white rounded-lg shadow p-4">
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Announce something to your class..."
            rows="3"
          />
          <div className="mt-2 flex justify-end">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Post
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-500">No announcements yet</p>
      </div>
    </div>
  );
}