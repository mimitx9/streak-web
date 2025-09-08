'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { quizApi } from '@/lib/api';
import { QuizAttempt, Quiz } from '@/types';
import Button from '@/components/ui/Button';

const ResultsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const attemptId = params.id as string;

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadingResults, setLoadingResults] = useState(true);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [attemptData, quizData] = await Promise.all([
          quizApi.getAttempt(attemptId),
          quizApi.getQuiz(attemptId), // This might need adjustment based on your API
        ]);
        
        setAttempt(attemptData);
        setQuiz(quizData);
      } catch (error) {
        console.error('Failed to fetch results:', error);
        router.push('/dashboard');
      } finally {
        setLoadingResults(false);
      }
    };

    if (user && attemptId) {
      fetchResults();
    }
  }, [user, attemptId, router]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Tốt';
    if (score >= 70) return 'Khá';
    if (score >= 60) return 'Trung bình';
    return 'Cần cải thiện';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  if (loading || loadingResults) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!attempt || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy kết quả
          </h2>
          <Button onClick={() => router.push('/dashboard')}>
            Quay lại Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length;
  const totalQuestions = quiz.questions.length;
  const score = attempt.score || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">
                {quiz.skill.charAt(0).toUpperCase() + quiz.skill.slice(1)} - Part {quiz.part}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
              <div className="text-sm text-gray-600">{getScoreLabel(score)}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">Câu đúng</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-gray-600">Câu sai</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatTime(attempt.timeSpent)}</div>
              <div className="text-sm text-gray-600">Thời gian</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4 mb-6">
          <Button onClick={() => setShowExplanations(!showExplanations)}>
            {showExplanations ? 'Ẩn giải thích' : 'Xem giải thích chi tiết'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Làm bài khác
          </Button>
        </div>

        {/* Question Results */}
        {showExplanations && (
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const userAnswer = attempt.answers.find(a => a.questionId === question.id);
              const isCorrect = userAnswer?.isCorrect;
              
              return (
                <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Câu {index + 1}: {question.questionText}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? '✓ Đúng' : '✗ Sai'}
                    </div>
                  </div>

                  {/* Audio Player (if listening) */}
                  {quiz.skill === 'listening' && question.audioUrl && (
                    <div className="mb-4">
                      <audio controls className="w-full">
                        <source src={question.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* User Answer */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Câu trả lời của bạn:</h4>
                    <div className={`p-3 rounded-md ${
                      isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <span className="text-gray-900">{userAnswer?.answer || 'Chưa trả lời'}</span>
                    </div>
                  </div>

                  {/* Correct Answer */}
                  {!isCorrect && question.correctAnswer && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Đáp án đúng:</h4>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <span className="text-green-800 font-medium">{question.correctAnswer}</span>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Giải thích:</h4>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-gray-700">{question.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;