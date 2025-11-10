'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface WithdrawalApplication {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  userInfo: CommenterUserInfo;
}

export default function WithdrawalReviewPage() {
  const [withdrawalApplications, setWithdrawalApplications] = useState<WithdrawalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // 模拟数据生成函数
  const generateMockWithdrawalApplications = (): WithdrawalApplication[] => {
    const mockData: WithdrawalApplication[] = [
      {
        id: 'WD20240801001',
        userId: 'com001',
        amount: 100.50,
        method: 'wechat',
        status: 'pending',
        requestedAt: '2024-08-01T10:30:00Z',
        userInfo: {
          userId: 'com001',
          nickname: '张三',
          avatar: '👨'
        }
      },
      {
        id: 'WD20240801002',
        userId: 'com002',
        amount: 50.00,
        method: 'alipay',
        status: 'approved',
        requestedAt: '2024-08-01T09:15:00Z',
        processedAt: '2024-08-01T09:30:00Z',
        userInfo: {
          userId: 'com002',
          nickname: '李四',
          avatar: '👨'
        }
      },
      {
        id: 'WD20240731001',
        userId: 'com003',
        amount: 200.00,
        method: 'bank',
        status: 'rejected',
        requestedAt: '2024-07-31T16:45:00Z',
        processedAt: '2024-07-31T17:00:00Z',
        userInfo: {
          userId: 'com003',
          nickname: '王五',
          avatar: '👩'
        }
      },
      {
        id: 'WD20240731002',
        userId: 'com004',
        amount: 75.25,
        method: 'wechat',
        status: 'pending',
        requestedAt: '2024-07-31T14:20:00Z',
        userInfo: {
          userId: 'com004',
          nickname: '赵六',
          avatar: '🧑'
        }
      }
    ];
    return mockData;
  };

  // 获取所有提现申请
  const fetchAllWithdrawalApplications = async () => {
    setLoading(true);
    debugLog('数据加载', '开始获取所有提现申请');
    
    try {
      // 使用模拟数据代替适配器调用
      const applicationsWithUserInfo = generateMockWithdrawalApplications();
      
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
      // 模拟审核操作，直接在前端更新状态
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
      
      // 模拟操作成功
      const result = true;
      
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