import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassDetails } from "../../services/classService";
import { useAuth } from '../../context/AuthContext';
import PeopleTab from './PeopleTab';
import StreamTab from './StreamTab';
import ClassworkTab from './ClassworkTab';

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stream');

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await getClassDetails(classId);
        setClassData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load class details");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!classData) return <div className="p-8 text-center">Class not found</div>;

  const refreshClassData = async () => {
    try {
      const response = await getClassDetails(classId);
      setClassData(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to refresh class data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Class Header */}
      <div className="bg-indigo-700 text-white px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(`/${userRole}/dashboard`)}
            className="text-indigo-200 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
          <p className="text-indigo-200">{classData.description}</p>
          {userRole === 'teacher' && (
            <p className="text-indigo-200 mt-2">
              Class Code: <span className="font-mono font-bold">{classData.code}</span>
            </p>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-6 py-4 ${
                activeTab === 'stream'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Stream
            </button>
            <button
              onClick={() => setActiveTab('classwork')}
              className={`px-6 py-4 ${
                activeTab === 'classwork'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Classwork
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`px-6 py-4 ${
                activeTab === 'people'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              People
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {activeTab === 'stream' && <StreamTab classData={classData} />}
        {activeTab === 'classwork' && <ClassworkTab classData={classData} />}
        {activeTab === 'people' && <PeopleTab classData={classData} />}
      </div>
    </div>
  );
}