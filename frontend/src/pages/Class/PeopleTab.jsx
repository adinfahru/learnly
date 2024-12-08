import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { removeStudent, leaveClass } from "../../services/classService";
// import { leaveClass } from '../../services/studentService';

export default function PeopleTab({ classData }) {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pastikan classData dan propertinya ada
  if (!classData || !classData.teacher) {
    return <div>Loading class data...</div>;
  }

  const handleRemoveStudent = async (studentId, studentName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${studentName} from this class?`
      )
    ) {
      return;
    }

    // Reset state sebelum memulai operasi
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await removeStudent(classData.id, studentId);
      setSuccessMessage(
        response.data.message || "Student removed successfully"
      );
      // Refresh class data
      onUpdateClass(); // Pastikan fungsi ini ada untuk memperbarui data class
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove student");
      setSuccessMessage(null); // Pastikan pesan sukses direset jika terjadi error
    } finally {
      setLoading(false);
    }
  };

  const onUpdateClass = async () => {
    try {
      const updatedClass = await getClassDetails(classData.id); // Pastikan fungsi ini ada
      setClassData(updatedClass.data);
    } catch (err) {
      console.error("Failed to refresh class data:", err);
    }
  };
  

  const handleLeaveClass = async () => {
    if (!window.confirm("Are you sure you want to leave this class?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await leaveClass(classData.id);
      // Redirect to student dashboard after leaving
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave class");
    } finally {
      setLoading(false);
    }
  };

  const [successMessage, setSuccessMessage] = useState(null);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {!error && successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}

      {/* Teacher Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Teacher</h3>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold">
              {classData.teacher.first_name[0]}
            </span>
          </div>
          <div>
            <p className="font-semibold">{classData.teacher.full_name}</p>
            <p className="text-sm text-gray-500">{classData.teacher.email}</p>
          </div>
        </div>
      </div>

      {/* Students Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            Students ({classData.students?.length || 0})
          </h3>
          {userRole === "student" && (
            <button
              onClick={handleLeaveClass}
              disabled={loading}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              {loading ? "Processing..." : "Leave Class"}
            </button>
          )}
        </div>

        {classData.students?.length > 0 ? (
          <div className="space-y-4">
            {classData.students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {student.first_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{student.full_name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                {userRole === "teacher" && (
                  <button
                    className="text-red-600 hover:text-red-800 text-sm"
                    onClick={() =>
                      handleRemoveStudent(student.id, student.full_name)
                    }
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Remove"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No students enrolled in this class yet.
          </p>
        )}
      </div>
    </div>
  );
}
