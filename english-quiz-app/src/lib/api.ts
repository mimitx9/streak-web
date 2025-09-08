import axios from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  Quiz, 
  QuizAttempt, 
  ApiResponse,
  SubscriptionPlan,
  PaymentRequest,
  UserProgress,
  Answer
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Quiz API
export const quizApi = {
  getQuizzes: async (skill?: string, part?: number): Promise<Quiz[]> => {
    const params = new URLSearchParams();
    if (skill) params.append('skill', skill);
    if (part) params.append('part', part.toString());
    
    const response = await api.get<ApiResponse<Quiz[]>>(`/quizzes?${params.toString()}`);
    return response.data.data;
  },

  getQuiz: async (id: string): Promise<Quiz> => {
    const response = await api.get<ApiResponse<Quiz>>(`/quizzes/${id}`);
    return response.data.data;
  },

  createAttempt: async (quizId: string): Promise<QuizAttempt> => {
    const response = await api.post<ApiResponse<QuizAttempt>>('/quiz-attempts', { quizId });
    return response.data.data;
  },

  updateAttempt: async (attemptId: string, answers: Answer[]): Promise<QuizAttempt> => {
    const response = await api.put<ApiResponse<QuizAttempt>>(`/quiz-attempts/${attemptId}`, { answers });
    return response.data.data;
  },

  submitAttempt: async (attemptId: string): Promise<QuizAttempt> => {
    const response = await api.post<ApiResponse<QuizAttempt>>(`/quiz-attempts/${attemptId}/submit`);
    return response.data.data;
  },

  getAttempts: async (userId?: string): Promise<QuizAttempt[]> => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api.get<ApiResponse<QuizAttempt[]>>(`/quiz-attempts${params}`);
    return response.data.data;
  },

  getAttempt: async (id: string): Promise<QuizAttempt> => {
    const response = await api.get<ApiResponse<QuizAttempt>>(`/quiz-attempts/${id}`);
    return response.data.data;
  },
};

// Subscription API
export const subscriptionApi = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans');
    return response.data.data;
  },

  createPayment: async (data: PaymentRequest): Promise<{ paymentUrl: string }> => {
    const response = await api.post<ApiResponse<{ paymentUrl: string }>>('/subscriptions/payment', data);
    return response.data.data;
  },

  upgradeSubscription: async (planId: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/subscriptions/upgrade', { planId });
    return response.data.data;
  },
};

// Progress API
export const progressApi = {
  getUserProgress: async (userId: string): Promise<UserProgress[]> => {
    const response = await api.get<ApiResponse<UserProgress[]>>(`/progress/${userId}`);
    return response.data.data;
  },

  getSkillProgress: async (userId: string, skill: string): Promise<UserProgress> => {
    const response = await api.get<ApiResponse<UserProgress>>(`/progress/${userId}/${skill}`);
    return response.data.data;
  },
};

export default api;