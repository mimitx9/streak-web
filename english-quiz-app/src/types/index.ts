// User types
export interface User {
  id: string;
  email: string;
  username: string;
  subscriptionType: 'free' | 'premium';
  freeAttemptsUsed: number;
  freeAttemptsLimit: number;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  skill: 'listening' | 'reading' | 'writing' | 'speaking';
  part: number;
  questions: Question[];
  timeLimit?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  type: 'multiple_choice' | 'fill_blank' | 'essay' | 'speaking';
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
  order: number;
}

// Quiz Attempt types
export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Answer[];
  score?: number;
  timeSpent: number; // in seconds
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
}

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  timeSpent: number; // in seconds
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Subscription types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  duration: number; // in days
}

export interface PaymentRequest {
  planId: string;
  paymentMethod: string;
}

// Progress types
export interface UserProgress {
  userId: string;
  skill: string;
  totalAttempts: number;
  correctAnswers: number;
  averageScore: number;
  lastAttemptAt: string;
}