import React, { useState, useEffect } from "react";
import { getUser } from "../../services/authService";
import { getTeacherClasses } from "../../services/classService";
import { useNavigate } from "react-router-dom";
import CreateClassModal from "./CreateClassModal";
import Header from "../../components/Header";

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

  const navigate = useNavigate();

  // Check if token is expired
  const isTokenExpiredFn = (token) => {
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (e) {
      return true;
    }
  };

  // Fetch user data and classes on component mount
  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken && isTokenExpiredFn(accessToken)) {
        setShowSessionExpiredModal(true);
        return;
      }

      try {
        const [userResponse, classesResponse] = await Promise.all([
          getUser(),
          getTeacherClasses(),
        ]);

        setUser(userResponse.data);
        setClasses(classesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          setShowSessionExpiredModal(true);
        } else {
          setError("Failed to load data");
        }
        setLoading(false);
      }
    };

    checkTokenAndFetchData();
  }, []);

  // Handle session expired
  const handleSessionExpired = () => {
    setShowSessionExpiredModal(false);
    localStorage.removeItem("userRole");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    navigate("/login");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Directly remove access and refresh tokens
      localStorage.removeItem("userRole");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Refresh classes list
  const refreshClasses = async () => {
    try {
      const response = await getTeacherClasses();
      setClasses(response.data);
    } catch (error) {
      console.error("Error refreshing classes:", error);
    }
  };

  const handleClassClick = (classId) => {
    navigate(`/class/${classId}`); // Navigasi ke ClassDetail
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-2 shadow text-indigo-800 p-6 flex flex-col text-sm">
        <h2 className="font-bold mb-6 text-sm">Welcome, {user?.full_name}!</h2>
        <ul className="space-y-4 flex-grow">
          {classes.map((classItem) => (
            <li
              key={classItem.id}
              className=" p-2 rounded-md shadow-md hover:bg-indigo-100 cursor-pointer"
              onClick={() => handleClassClick(classItem.id)}
            >
              <h3 className="font-semibold">{classItem.name}</h3>
              <p className="text-xs">Kode: {classItem.code}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* <Header /> */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {/* Session Expired Modal */}
          {showSessionExpiredModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Session Expired</h2>
                <p className="text-gray-600 mb-6">
                  Your session has expired. Please login again to continue.
                </p>
                <button
                  onClick={handleSessionExpired}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
                >
                  Login Again
                </button>
              </div>
            </div>
          )}

          {/* Token Expiration Notification */}
          {isTokenExpired && !showSessionExpiredModal && (
            <div className="bg-yellow-500 text-white p-4 rounded-md mb-4">
              <p>Your session has expired. Please log in again.</p>
            </div>
          )}

          {/* Create Class Button */}
          <div className="mt-6 text-end">
            <button
              onClick={() => setShowCreateClassModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
            >
              Create Class
            </button>
          </div>

          {/* Classes Grid View */}
          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border"
                  onClick={() => handleClassClick(classItem.id)}
                >
                  <h3 className="text-xl font-semibold text-indigo-700">
                    {classItem.name}
                  </h3>
                  <p className="text-gray-600 mt-2">{classItem.subject}</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Class Code:{" "}
                      <span className="font-mono font-bold">
                        {classItem.code}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Students: {classItem.students?.length || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modals */}
          {showCreateClassModal && (
            <CreateClassModal
              onClose={() => setShowCreateClassModal(false)}
              onClassCreated={() => {
                setShowCreateClassModal(false);
                refreshClasses();
              }}
            />
          )}

          {/* ... existing modals ... */}
        </div>
      </div>
    </div>
  );
}
