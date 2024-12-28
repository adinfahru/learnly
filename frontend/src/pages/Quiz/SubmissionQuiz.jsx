import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuizSubmissions } from "../../services/quizService";
import { getClassDetails } from "../../services/classService";

export default function SubmissionQuiz() {
  const { quizId } = useParams(); // Ambil quizId dari URL
  const [quizData, setQuizData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true); // Reset loading state setiap kali dependensi berubah
      try {
        // Fetch Quiz Submissions
        const quizResponse = await getQuizSubmissions(quizId);
        setQuizData(quizResponse.data);

        // Ambil class_id dari setiap submission untuk disesuaikan
        const allSubmissions = quizResponse.data?.submissions || [];
        
        if (allSubmissions.length === 0) {
          throw new Error("No submissions found.");
        }

        // Misalnya, kita ingin menampilkan submissions berdasarkan kelas pertama yang ada di array
        const classId = allSubmissions[0]?.class_id;
        
        if (!classId) {
          throw new Error("Class ID not found in quiz submissions.");
        }

        // Filter submissions yang sesuai dengan class_id
        const submissionsForClass = allSubmissions.filter(
          (submission) => submission.class_id === classId
        );
        
        // Ambil class details menggunakan class_id
        const classResponse = await getClassDetails(classId);
        setClassData(classResponse.data);

        // Set filtered submissions
        setFilteredSubmissions(submissionsForClass);
        setError(null);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [quizId]); // Tambahkan quizId ke array dependensi untuk menangani perubahan

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Details Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">
          Quiz Submissions: {quizData?.quiz_title}
        </h3>
        <div className="text-gray-600">
          <p>Total Submissions for Class: {filteredSubmissions.length}</p>
          <p>Class: {classData?.name}</p>
          <p>Subject: {classData?.subject}</p>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">
          Student Submissions ({filteredSubmissions.length})
        </h3>

        {filteredSubmissions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {submission.student_name?.[0] || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{submission.student_name}</p>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">
                        Score: {submission.score ?? "N/A"}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Submitted:{" "}
                        {new Date(submission.submission_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() =>
                    window.location.href = `/quiz/${quizId}/result/${submission.id}`
                  }
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No submissions for this class yet.
          </p>
        )}
      </div>
    </div>
  );
}
