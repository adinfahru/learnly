import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ClassworkTab({ classData }) {
  const { userRole } = useAuth();

  return (
    <div className="space-y-6">
      {userRole === 'teacher' && (
        <div className="flex justify-end">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Create Assignment
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-500">No assignments yet</p>
      </div>
    </div>
  );
}