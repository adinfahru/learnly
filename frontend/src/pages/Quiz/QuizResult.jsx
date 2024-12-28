import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getQuizDetail, getQuizAttemptDetail } from '../../services/quizService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

function Question({ question, userAnswer }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="font-medium">{`Q${question.index + 1}.`}</span>
        <div className="flex-1">
          <p className="font-medium mb-3">{question.text}</p>
          <div className="space-y-2">
            {question.options.map((option) => {
              const isSelected = userAnswer?.selected_option?.id === option.id;
              const isCorrect = option.is_correct;

              return (
                <div
                  key={option.id}
                  className={`p-2 rounded-md flex items-center justify-between
                    ${isSelected && isCorrect ? 'bg-green-100' : ''}
                    ${isSelected && !isCorrect ? 'bg-red-100' : ''}
                    ${!isSelected && isCorrect ? 'bg-blue-50' : ''}
                  `}
                >
                  <span>{option.text}</span>
                  <div className="flex items-center gap-2">
                    {isSelected && isCorrect && (
                      <CheckCircle2 className="text-green-600 w-5 h-5" />
                    )}
                    {isSelected && !isCorrect && (
                      <XCircle className="text-red-600 w-5 h-5" />
                    )}
                    {!isSelected && isCorrect && (
                      <span className="text-blue-600 text-sm">Correct Answer</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizResultView() {
  const { quizId, attemptId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quizId && attemptId) {
      loadResults();
    }
  }, [quizId, attemptId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const [quizResponse, attemptResponse] = await Promise.all([
        getQuizDetail(quizId),
        getQuizAttemptDetail(attemptId),
      ]);
      setQuizData(quizResponse.data);
      setAttemptData(attemptResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load quiz results. Please try again.');
      console.error('Error loading results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading results...</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">
        {error}
        <button
          onClick={loadResults}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  if (!quizData || !quizData.sessions || !attemptData)
    return <div className="p-4">Invalid data structure. Please contact support.</div>;

  const renderResultContent = () => {
    if (!quizData.show_result) {
      return (
        <div className="text-lg font-semibold text-gray-600">
          Results are not yet available.
        </div>
      );
    }

    if (quizData.show_result && quizData.show_answers) {
      return (
        <div className="text-lg font-semibold text-green-600">
          Final Score: {attemptData.score || 0}%
        </div>
      );
    }

    return (
      <div className="text-lg font-semibold text-gray-600">
        Result: Your answers have been submitted successfully.
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{quizData.title}</CardTitle>
          <div className="text-sm text-gray-500">
            <p>
              <strong>Student Name:</strong> {attemptData.student_name || 'N/A'}
            </p>
            <p>
              <strong>Student Email:</strong> {attemptData.student_email || 'N/A'}
            </p>
          </div>
          {renderResultContent()}
        </CardHeader>
        <CardContent>
          {quizData.sessions.map((session) => (
            <div key={session.id} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{session.name}</h3>
              <div className="space-y-6">
                {session.questions.map((question, qIndex) => {
                  const userAnswer = attemptData.session_attempts
                    ?.find((sa) => sa.session.id === session.id)
                    ?.answers?.find((a) => a.question.id === question.id);

                  return (
                    <Question
                      key={question.id}
                      question={{ ...question, index: qIndex }}
                      userAnswer={userAnswer}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
