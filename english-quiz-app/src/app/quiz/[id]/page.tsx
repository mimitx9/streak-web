'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { quizApi } from '@/lib/api';
import { Quiz, QuizAttempt, Answer } from '@/types';
import Button from '@/components/ui/Button';

const QuizPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  const handleSubmitQuiz = useCallback(async () => {
    if (!attempt) return;

    setIsSubmitting(true);
    try {
      // Update final answers
      await quizApi.updateAttempt(attempt.id, answers);
      
      // Submit quiz
      const submittedAttempt = await quizApi.submitAttempt(attempt.id);
      
      router.push(`/results/${submittedAttempt.id}`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [attempt, answers, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const initQuiz = async () => {
      try {
        // Check if user has attempts left
        if (user?.subscriptionType === 'free' && user.freeAttemptsUsed >= user.freeAttemptsLimit) {
          router.push('/subscription');
          return;
        }

        const quizData = await quizApi.getQuiz(quizId);
        setQuiz(quizData);

        // Create new attempt
        const attemptData = await quizApi.createAttempt(quizId);
        setAttempt(attemptData);

        // Set timer if quiz has time limit
        if (quizData.timeLimit) {
          setTimeLeft(quizData.timeLimit * 60); // Convert to seconds
        }

        // Initialize answers array
        const initialAnswers: Answer[] = quizData.questions.map(q => ({
          questionId: q.id,
          answer: '',
          timeSpent: 0,
        }));
        setAnswers(initialAnswers);

      } catch (error) {
        console.error('Failed to initialize quiz:', error);
        router.push('/dashboard');
      } finally {
        setLoadingQuiz(false);
      }
    };

    if (user && quizId) {
      initQuiz();
    }
  }, [user, quizId, router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quiz, handleSubmitQuiz]);

  const handleAnswerChange = (answer: string) => {
    setSelectedAnswer(answer);
    
    // Update answers array
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = {
      ...updatedAnswers[currentQuestionIndex],
      answer,
    };
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1]?.answer || '');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]?.answer || '');
    }
  };

  const handleSaveProgress = async () => {
    if (!attempt) return;

    try {
      await quizApi.updateAttempt(attempt.id, answers);
      alert('Đã lưu tiến độ bài làm!');
    } catch (error) {
      console.error('Failed to save progress:', error);
      alert('Không thể lưu tiến độ. Vui lòng thử lại.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || loadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy bài thi
          </h2>
          <Button onClick={() => router.push('/dashboard')}>
            Quay lại Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                {quiz.skill.charAt(0).toUpperCase() + quiz.skill.slice(1)} - Part {quiz.part}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {timeLeft > 0 && (
                <div className="text-lg font-mono text-red-600">
                  ⏱️ {formatTime(timeLeft)}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleSaveProgress}>
                Lưu tiến độ
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Câu {currentQuestionIndex + 1} / {quiz.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Audio Player (if listening) */}
          {quiz.skill === 'listening' && currentQuestion.audioUrl && (
            <div className="mb-6">
              <audio controls className="w-full">
                <source src={currentQuestion.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Question */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Câu {currentQuestionIndex + 1}: {currentQuestion.questionText}
            </h2>

            {/* Multiple Choice Options */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{String.fromCharCode(65 + index)}. {option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Fill in the blank */}
            {currentQuestion.type === 'fill_blank' && (
              <div>
                <textarea
                  value={selectedAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Essay */}
            {currentQuestion.type === 'essay' && (
              <div>
                <textarea
                  value={selectedAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Viết bài luận của bạn..."
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Câu trước
            </Button>

            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setSelectedAnswer(answers[index]?.answer || '');
                  }}
                  className={`w-8 h-8 rounded-full text-sm font-medium ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[index]?.answer
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Nộp bài
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Câu tiếp
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;