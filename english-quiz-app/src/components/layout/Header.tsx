'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-gray-200 h-15 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">🚀</span>
          </div>
          <span className="text-gray-800 font-semibold text-lg">LUYỆN THI VSTEP</span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center space-x-6">
        <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
          Luyện đề
        </Link>
        <Link href="/quiz" className="text-gray-700 hover:text-gray-900 font-medium">
          Thi thử
        </Link>
        <Link href="/subscription" className="text-gray-700 hover:text-gray-900 font-medium">
          Gói cước
        </Link>
        <Link href="/schedule" className="text-gray-700 hover:text-gray-900 font-medium">
          Lịch thi
        </Link>
        <Link href="/articles" className="text-gray-700 hover:text-gray-900 font-medium">
          Bài viết
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 font-medium">{user.username}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="outline" size="sm">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Đăng ký</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;