'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      await login(data);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1>
            <span className="rocket-icon">🚀</span>
            Đăng nhập hệ thống thi
          </h1>
        </div>
        
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label htmlFor="username">Tài khoản</label>
            <input
              type="text"
              id="username"
              {...register('username')}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="eye-icon">
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Nếu bạn chưa có tài khoản, vui lòng{' '}
            <Link href="/register" className="link">đăng ký tại đây</Link>,
          </p>
          <p>
            hoặc{' '}
            <Link href="/" className="link">quay lại trang chủ tại đây</Link>.
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
        }

        .login-form {
          background: white;
          padding: 40px 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h1 {
          color: #1a365d;
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .rocket-icon {
          font-size: 20px;
          color: #ff6b35;
        }

        .form {
          margin-bottom: 20px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: #2d3748;
          font-weight: 500;
          font-size: 14px;
        }

        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          background-color: white;
          box-sizing: border-box;
        }

        .input-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-group input.error {
          border-color: #ef4444;
        }

        .password-container {
          position: relative;
        }

        .password-container input {
          padding-right: 50px;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #6b7280;
          font-size: 16px;
        }

        .toggle-password:hover {
          color: #374151;
        }

        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .error-banner {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .login-btn:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .login-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        .login-footer p {
          margin: 5px 0;
        }

        .link {
          color: #3b82f6;
          text-decoration: underline;
          transition: color 0.3s ease;
        }

        .link:hover {
          color: #2563eb;
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .login-container {
            padding: 10px;
          }
          
          .login-form {
            padding: 30px 20px;
          }
          
          .login-header h1 {
            font-size: 20px;
          }
        }

        @media (max-width: 320px) {
          .login-header h1 {
            font-size: 18px;
            flex-direction: column;
            gap: 5px;
          }
          
          .rocket-icon {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;