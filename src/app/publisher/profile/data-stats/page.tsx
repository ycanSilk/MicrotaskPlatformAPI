"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DataStatsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('week'); // 'today' | 'week' | 'month'
  
  // 模拟数据
  const statsData = {
    today: {
      publishedTasks: 12,
      completedTasks: 8,
      totalSpent: 156.80,
      pendingReview: 3
    },
    week: {
      publishedTasks: 45,
      completedTasks: 38,
      totalSpent: 892.50,
      pendingReview: 7
    },
    month: {
      publishedTasks: 189,
      completedTasks: 165,
      totalSpent: 3847.20,
      pendingReview: 24
    }
  };

  const currentStats = statsData[dateRange as keyof typeof statsData];

  // 任务分类统计
  const categoryStats = [
    { category: '美食', count: 45, spent: 324.50, color: 'bg-orange-50 text-orange-600' },
    { category: '数码', count: 38, spent: 612.80, color: 'bg-blue-50 text-blue-600' },
    { category: '美妆', count: 32, spent: 258.70, color: 'bg-pink-50 text-pink-600' },
    { category: '旅游', count: 28, spent: 445.60, color: 'bg-green-50 text-green-600' },
    { category: '影视', count: 25, spent: 189.30, color: 'bg-purple-50 text-purple-600' }
  ];

  // 效果统计
  const effectStats = [
    { metric: '平均完成率', value: '87.3%', trend: '+2.5%', color: 'text-green-600' },
    { metric: '平均单价', value: '¥4.85', trend: '+0.32', color: 'text-green-600' },
    { metric: '用户满意度', value: '4.8分', trend: '+0.1', color: 'text-green-600' },
    { metric: '复购率', value: '73.2%', trend: '-1.2%', color: 'text-red-500' }
  ];

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm">
        <div className="px-5 py-4 flex items-center">
          <button 
            onClick={handleBack}
            className="text-gray-600 mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-medium text-gray-800">数据统计</h1>
        </div>
      </div>

      {/* 时间范围选择 */}
      <div className="mt-4 px-5">
        <div className="flex rounded-lg bg-white p-1 shadow-sm">
          <button
            onClick={() => setDateRange('today')}
            className={`flex-1 py-2.5 text-center rounded-md font-medium transition-colors ${
              dateRange === 'today' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            今日
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`flex-1 py-2.5 text-center rounded-md font-medium transition-colors ${
              dateRange === 'week' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            本周
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`flex-1 py-2.5 text-center rounded-md font-medium transition-colors ${
              dateRange === 'month' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            本月
          </button>
        </div>
      </div>

      {/* 核心数据概览 */}
      <div className="mt-5 px-5">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-gray-700 mb-4">核心数据</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{currentStats.publishedTasks}</div>
              <div className="text-xs text-blue-700 mt-1">发布任务</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{currentStats.completedTasks}</div>
              <div className="text-xs text-green-700 mt-1">完成任务</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">¥{currentStats.totalSpent}</div>
              <div className="text-xs text-orange-700 mt-1">总支出</div>
            </div>
            <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{currentStats.pendingReview}</div>
              <div className="text-xs text-purple-700 mt-1">待审核</div>
            </div>
          </div>
        </div>
      </div>

      {/* 订单数据总览 */}
      <div className="mt-5 px-5">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-gray-700 mb-4">订单数据总览</h3>
          <div className="space-y-4">
            {/* 评论订单 */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-800">评论订单</div>
                </div>
                <div className="text-sm text-gray-500">{dateRange === 'today' ? '今日' : dateRange === 'week' ? '本周' : '本月'}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">订单总数</div>
                  <div className="font-bold text-gray-800">{dateRange === 'today' ? 10 : dateRange === 'week' ? 38 : 156}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">已完成</div>
                  <div className="font-bold text-green-600">{dateRange === 'today' ? 7 : dateRange === 'week' ? 32 : 134}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">总支出</div>
                  <div className="font-bold text-orange-600">¥{dateRange === 'today' ? 128.5 : dateRange === 'week' ? 724.3 : 3125.8}</div>
                </div>
              </div>
            </div>
            
            {/* 租赁订单 */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="font-medium text-gray-800">租赁订单</div>
                </div>
                <div className="text-sm text-gray-500">{dateRange === 'today' ? '今日' : dateRange === 'week' ? '本周' : '本月'}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">订单总数</div>
                  <div className="font-bold text-gray-800">{dateRange === 'today' ? 2 : dateRange === 'week' ? 7 : 33}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">进行中</div>
                  <div className="font-bold text-blue-600">{dateRange === 'today' ? 1 : dateRange === 'week' ? 3 : 12}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">总支出</div>
                  <div className="font-bold text-orange-600">¥{dateRange === 'today' ? 28.3 : dateRange === 'week' ? 168.2 : 721.4}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 效果分析 */}
      <div className="mt-5 px-5">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <h3 className="font-medium text-gray-700 mb-4">效果分析</h3>
          <div className="grid grid-cols-2 gap-3">
            {effectStats.slice(0, 2).map((item, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1.5">{item.metric}</div>
                <div className="font-bold text-gray-800 mb-1.5">{item.value}</div>
                <div className={`text-xs ${item.color} flex items-center`}>
                  {item.trend.startsWith('+') ? (
                    <>↗️ <span>{item.trend}</span></>
                  ) : (
                    <>↘️ <span>{item.trend}</span></>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}