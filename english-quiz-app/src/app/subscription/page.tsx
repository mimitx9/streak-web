'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionApi } from '@/lib/api';
import { SubscriptionPlan } from '@/types';
import Button from '@/components/ui/Button';

const SubscriptionPage: React.FC = () => {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionApi.getPlans();
        setPlans(data);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    if (user) {
      fetchPlans();
    }
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (!user) return;

    setIsUpgrading(planId);
    try {
      // Mock payment process
      await subscriptionApi.createPayment({
        planId,
        paymentMethod: 'credit_card',
      });

      // In a real app, you would redirect to payment gateway
      // For now, we'll simulate successful payment
      await subscriptionApi.upgradeSubscription(planId);
      await refreshUser();
      
      alert('Nâng cấp thành công!');
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Nâng cấp thất bại. Vui lòng thử lại.');
    } finally {
      setIsUpgrading(null);
    }
  };

  if (loading || loadingPlans) {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chọn gói dịch vụ phù hợp
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nâng cấp để có thể làm bài thi không giới hạn và truy cập vào tất cả các tính năng cao cấp
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gói hiện tại: {user.subscriptionType === 'premium' ? 'Premium' : 'Free'}
              </h2>
              <p className="text-gray-600">
                {user.subscriptionType === 'free' 
                  ? `Đã sử dụng ${user.freeAttemptsUsed}/${user.freeAttemptsLimit} lượt làm đề miễn phí`
                  : 'Không giới hạn lượt làm đề'
                }
              </p>
            </div>
            {user.subscriptionType === 'free' && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Còn lại</div>
                <div className="text-2xl font-bold text-blue-600">
                  {user.freeAttemptsLimit - user.freeAttemptsUsed}
                </div>
                <div className="text-sm text-gray-600">lượt làm đề</div>
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-sm p-6 relative ${
                plan.name.toLowerCase().includes('premium') ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.name.toLowerCase().includes('premium') && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Phổ biến
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {plan.price.toLocaleString('vi-VN')} {plan.currency}
                </div>
                <div className="text-sm text-gray-600">
                  / {plan.duration} ngày
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                {user.subscriptionType === 'premium' ? (
                  <Button variant="outline" disabled className="w-full">
                    Đã nâng cấp
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    loading={isUpgrading === plan.id}
                    disabled={isUpgrading !== null}
                    className="w-full"
                  >
                    {isUpgrading === plan.id ? 'Đang xử lý...' : 'Nâng cấp ngay'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Free Plan Info */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Gói Free - Hoàn toàn miễn phí
            </h3>
            <p className="text-blue-700 mb-4">
              Bạn có thể làm {user.freeAttemptsLimit} bài thi miễn phí để trải nghiệm dịch vụ
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Quay lại Dashboard
              </Button>
              <Button onClick={() => router.push('/quiz')}>
                Bắt đầu làm bài
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Câu hỏi thường gặp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Tôi có thể hủy gói Premium bất cứ lúc nào không?
              </h3>
              <p className="text-gray-600">
                Có, bạn có thể hủy gói Premium bất cứ lúc nào. Sau khi hủy, bạn sẽ quay lại gói Free với giới hạn lượt làm đề.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Có những phương thức thanh toán nào?
              </h3>
              <p className="text-gray-600">
                Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, ví điện tử và chuyển khoản ngân hàng.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Tôi có thể làm lại bài thi đã làm không?
              </h3>
              <p className="text-gray-600">
                Với gói Premium, bạn có thể làm lại bài thi không giới hạn số lần để luyện tập.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Có hỗ trợ khách hàng không?
              </h3>
              <p className="text-gray-600">
                Chúng tôi có đội ngũ hỗ trợ khách hàng 24/7 qua email và chat trực tuyến.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;