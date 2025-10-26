'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
// Admin auth storage removed
import { financeModelAdapter } from '@/data/commenteruser/finance_model_adapter';
import { WithdrawalRecord } from '@/data/commenteruser/finance_model_adapter';

// 调试日志函数
const debugLog = (stage: string, message: string, data?: any) => {
  console.log(`[管理员提现审核 - ${stage}]`, message);
  if (data !== undefined) {
    console.log(`[管理员提现审核 - ${stage}] 数据:`, data);
  }
};

interface CommenterUserInfo {
  userId: string;
  nickname?: string;
  avatar?: string;
}

interface WithdrawalApplication extends WithdrawalRecord {
  userInfo: CommenterUserInfo;
}

export default function WithdrawalReviewPage() {
  const [withdrawalApplications, setWithdrawalApplications] = useState<WithdrawalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, isLoggedIn } = useUser();

  // 获取所有提现申请
  const fetchAllWithdrawalApplications = async () => {
    setLoading(true);
    debugLog('数据加载', '开始获取所有提现申请');
    
    try {
      // 在实际系统中，这里应该调用后端API获取数据
      // 由于当前是模拟环境，我们直接从适配器获取所有提现记录
      const allWithdrawals = await financeModelAdapter.getUserWithdrawalRecords('');
      
      // 为每个提现记录添加用户信息
      const applicationsWithUserInfo: WithdrawalApplication[] = allWithdrawals.map(withdrawal => {
        // 在实际系统中，这里应该从用户表获取用户信息
        // 由于当前是模拟环境，我们构建一些简单的用户信息
        const userInfo: CommenterUserInfo = {
          userId: withdrawal.userId,
          nickname: withdrawal.userId === 'com001' ? '张三' : 
                   withdrawal.userId === 'com002' ? '李四' : 
                   withdrawal.userId === 'com003' ? '王五' : 
                   withdrawal.userId === 'com004' ? '赵六' : '未知用户',
          avatar: withdrawal.userId === 'com001' ? '👨' : 
                  withdrawal.userId === 'com002' ? '👨' : 
                  withdrawal.userId === 'com003' ? '👩' : 
                  withdrawal.userId === 'com004' ? '🧑' : '👤'
        };
        
        return {
          ...withdrawal,
          userInfo
        };
      });
      
      // 按申请时间降序排序
      applicationsWithUserInfo.sort((a, b) => 
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
      
      setWithdrawalApplications(applicationsWithUserInfo);
      debugLog('数据加载', `成功获取${applicationsWithUserInfo.length}条提现申请`);
    } catch (error) {
      debugLog('数据加载', '获取提现申请失败', error);
      setMessage('获取提现申请失败，请稍后重试');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // 处理提现审核
  const handleReviewWithdrawal = async (withdrawalId: string, isApproved: boolean) => {
    debugLog('审核处理', `开始审核提现申请 ${withdrawalId}`, { isApproved });
    
    try {
      // 调用适配器审核提现申请
      const result = isApproved 
        ? await financeModelAdapter.approveWithdrawal(withdrawalId) 
        : await financeModelAdapter.rejectWithdrawal(withdrawalId);
      
      if (result) {
        debugLog('审核处理', `提现申请 ${withdrawalId} 审核${isApproved ? '通过' : '拒绝'}成功`);
        setMessage(`提现申请已${isApproved ? '审核通过' : '拒绝'}`);
        // 重新加载提现申请列表
        fetchAllWithdrawalApplications();
      } else {
        debugLog('审核处理', `提现申请 ${withdrawalId} 审核失败`);
        setMessage('审核失败，请稍后重试');
      }
    } catch (error) {
      debugLog('审核处理', `提现申请 ${withdrawalId} 审核过程发生错误`, error);
      setMessage('审核过程中发生错误，请稍后重试');
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchAllWithdrawalApplications();
  }, []);

  // 检查是否为管理员且已登录
  const isAdminLoggedIn = () => {
    try {
      const adminUser = AdminAuthStorage.getCurrentUser();
      return !!adminUser;
    } catch (error) {
      return false;
    }
  };

  // 未登录状态显示
  if (!isAdminLoggedIn()) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-xl font-bold mb-4">请先以管理员身份登录</h2>
        <button 
          onClick={() => router.push('/auth/login/adminlogin')}
          className="bg-blue-500 text-white px-6 py-2 rounded font-medium"
        >
          前往登录
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">提现申请审核</h1>
      
      {/* 消息提示 */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm mb-4">
          {message}
        </div>
      )}
      
      {/* 加载状态 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单号</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提现金额</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提现方式</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请时间</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {withdrawalApplications.map((application) => {
                // 格式化日期时间
                const requestDate = new Date(application.requestedAt);
                const formattedRequestDate = `${requestDate.getFullYear()}-${String(requestDate.getMonth() + 1).padStart(2, '0')}-${String(requestDate.getDate()).padStart(2, '0')} ${String(requestDate.getHours()).padStart(2, '0')}:${String(requestDate.getMinutes()).padStart(2, '0')}`;
                
                const completeDate = application.processedAt ? new Date(application.processedAt) : null;
                const formattedCompleteDate = completeDate ? 
                  `${completeDate.getFullYear()}-${String(completeDate.getMonth() + 1).padStart(2, '0')}-${String(completeDate.getDate()).padStart(2, '0')} ${String(completeDate.getHours()).padStart(2, '0')}:${String(completeDate.getMinutes()).padStart(2, '0')}` : 
                  '-';
                
                // 获取状态显示文本和样式
                const getStatusDisplay = () => {
                  switch (application.status) {
                    case 'pending':
                      return { text: '待审核', className: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs' };
                    case 'approved':
                      return { text: '已完成', className: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs' };
                    case 'rejected':
                      return { text: '已拒绝', className: 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs' };
                    default:
                      return { text: '未知状态', className: 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs' };
                  }
                };
                
                const statusDisplay = getStatusDisplay();
                
                // 获取提现方式显示文本
                const getMethodDisplay = () => {
                  switch (application.method) {
                    case 'wechat':
                      return '微信钱包';
                    case 'alipay':
                      return '支付宝';
                    case 'bank':
                      return '银行卡';
                    default:
                      return application.method;
                  }
                };
                
                return (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{application.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="text-lg mr-2">{application.userInfo.avatar}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{application.userInfo.nickname}</div>
                          <div className="text-xs text-gray-500">{application.userInfo.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">¥{application.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{getMethodDisplay()}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{formattedRequestDate}</td>
                    <td className="py-3 px-4">
                      <span className={statusDisplay.className}>{statusDisplay.text}</span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {application.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReviewWithdrawal(application.id, true)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleReviewWithdrawal(application.id, false)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                          >
                            拒绝
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">已处理</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {withdrawalApplications.length === 0 && (
            <div className="mt-4 p-4 bg-gray-50 text-center text-gray-500">
              暂无提现申请
            </div>
          )}
        </div>
      )}
    </div>
  );
}