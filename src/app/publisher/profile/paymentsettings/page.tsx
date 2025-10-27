'use client';
import React from 'react';
import { ArrowLeftOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

const PaymentSettingsPage: React.FC = () => {
  // 支付设置菜单项数据
  const paymentSettings = [
    {
      id: 'order',
      title: '绑定支付宝',
      hasArrow: true,
    },
    {
      id: 'payment-password',
      title: '设置支付密码',
      hasArrow: true,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center">
          <button className="mr-4 p-1 rounded-full hover:bg-gray-100">
            <ArrowLeftOutlined className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">支付设置</h1>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="p-4">
        <div className="space-y-1">
          {paymentSettings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
            >
              <Link 
                href={item.id === 'order' 
                  ? '/publisher/profile/paymentsettings/bindalipay' 
                  : '/publisher/profile/paymentsettings/setpaymentpwd'}
                passHref
              >
                <button
                  className="w-full text-left px-4 py-4 flex items-center justify-between"
                  type="button"
                >
                  <span className="text-gray-900 font-medium">{item.title}</span>
                  {item.hasArrow && (
                    <RightOutlined className="w-4 h-4 text-gray-400 ml-1" />
                  )}
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* 底部安全提示 */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <div className="flex items-center justify-center mb-1">
            <div className="h-px bg-gray-300 flex-grow max-w-xs"></div>
            <span className="px-4">安全提示</span>
            <div className="h-px bg-gray-300 flex-grow max-w-xs"></div>
          </div>
          <p>请妥善保管您的支付密码，不要向他人透露</p>
          <p className="mt-1">如有疑问，请联系客服</p>
        </div>
      </main>
    </div>
  );
};

export default PaymentSettingsPage;