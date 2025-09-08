'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { quizApi } from '@/lib/api';
import { Quiz } from '@/types';
import QuizCard from '@/components/quiz/QuizCard';
import Button from '@/components/ui/Button';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizApi.getQuizzes(selectedSkill);
        setQuizzes(data);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, [selectedSkill]);

  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  const skills = [
    { key: '', label: 'Tất cả', icon: '📚' },
    { key: 'listening', label: 'Listening', icon: '🎧' },
    { key: 'reading', label: 'Reading', icon: '📖' },
    { key: 'writing', label: 'Writing', icon: '✍️' },
    { key: 'speaking', label: 'Speaking', icon: '🗣️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng, {user.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            Chọn bài luyện thi để bắt đầu cải thiện kỹ năng tiếng Anh của bạn
          </p>
          
          {/* User Stats */}
          <div className="mt-4 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {user.subscriptionType === 'free' 
                    ? `${user.freeAttemptsUsed}/${user.freeAttemptsLimit}`
                    : '∞'
                  }
                </div>
                <div className="text-sm text-gray-600">Lượt làm đề</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {user.subscriptionType === 'premium' ? 'Premium' : 'Free'}
                </div>
                <div className="text-sm text-gray-600">Gói dịch vụ</div>
              </div>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/subscription')}
                >
                  Nâng cấp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <button
                key={skill.key}
                onClick={() => setSelectedSkill(skill.key)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedSkill === skill.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <span className="mr-2">{skill.icon}</span>
                {skill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quizzes Grid */}
        {loadingQuizzes ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onStart={handleStartQuiz}
              />
            ))}
          </div>
        )}

        {quizzes.length === 0 && !loadingQuizzes && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có bài thi nào
            </h3>
            <p className="text-gray-600">
              Hiện tại chưa có bài thi nào cho kỹ năng này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;