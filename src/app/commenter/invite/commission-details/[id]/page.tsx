'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { CommissionRecord } from '../../../../../types/invite';

const CommissionDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string || 'default';

  // 定义多个静态佣金数据
  const mockCommissionData: Record<string, CommissionRecord> = {
    'comm-1': {
      id: 'comm-1',
      memberId: 'user001',
      memberName: '张三',
      memberAvatar: 'https://picsum.photos/id/64/40/40',
      type: 'register',
      taskName: '新用户注册',
      commission: 10.00,
      commissionRate: 0,
      date: '2023-11-10T09:15:00.000Z',
      status: 'completed',
      description: '新用户注册奖励'
    },
    'comm-5': {
      id: 'comm-5',
      memberId: 'user123',
      memberName: '李四',
      memberAvatar: 'https://picsum.photos/id/64/40/40',
      type: 'task',
      taskName: '完成产品评价任务',
      taskId: 'task123',
      commission: 45.50,
      commissionRate: 0.05,
      taskEarning: 910.00,
      date: '2023-11-15T10:30:00.000Z',
      status: 'completed',
      description: '来自推荐用户完成的优质任务奖励'
    }
  };

  // 获取当前ID对应的佣金数据，如果不存在则使用默认数据
  const commissionDetail: CommissionRecord = mockCommissionData[id] || mockCommissionData['comm-5'];

  const getTypeLabel = () => {
    switch (commissionDetail.type) {
      case 'register':
        return '注册奖励';
      case 'team':
        return '团队奖励';
      case 'task':
        return '任务佣金';
      default:
        return '佣金';
    }
  };

  const getTypeColor = () => {
    switch (commissionDetail.type) {
      case 'register':
        return 'bg-green-100 text-green-600';
      case 'team':
        return 'bg-purple-100 text-purple-600';
      case 'task':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getAmountColor = () => {
    switch (commissionDetail.type) {
      case 'register':
        return 'text-green-600';
      case 'team':
        return 'text-purple-600';
      case 'task':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/commenter/invite')}
                className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">佣金详情</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* 佣金基本信息 */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900">佣金记录 #{id || commissionDetail.id}</h2>
          </div>
          <div className="p-6">
            {/* 佣金金额卡片 */}
            <div className="text-center mb-8">
              <div className={`text-4xl font-bold ${getAmountColor()}`}>+¥{commissionDetail.commission.toFixed(2)}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${getTypeColor()}`}>
                {getTypeLabel()}
              </div>
              <div className="text-gray-500 mt-2">
                获得时间: {new Date(commissionDetail.date).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 被推荐人信息 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-3">被推荐人信息</h4>
                <div className="flex items-center mb-4">
                  <img 
                    src={commissionDetail.memberAvatar} 
                    alt={commissionDetail.memberName} 
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{commissionDetail.memberName}</div>
                    <div className="text-xs text-gray-500">ID: {commissionDetail.memberId}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">佣金类型</span>
                    <span className="text-sm font-medium text-gray-900">{getTypeLabel()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">状态</span>
                    <span className="text-sm font-medium text-green-600">已到账</span>
                  </div>
                </div>
              </div>

              {/* 佣金计算详情 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-3">佣金计算详情</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">佣金金额</span>
                    <span className="text-sm font-medium text-gray-900">¥{commissionDetail.commission.toFixed(2)}</span>
                  </div>
                  {commissionDetail.type === 'task' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">任务收益</span>
                        <span className="text-sm font-medium text-gray-900">¥{(commissionDetail.taskEarning || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">佣金比例</span>
                        <span className="text-sm font-medium text-gray-900">{(commissionDetail.commissionRate * 100).toFixed(1)}%</span>
                      </div>
                      {commissionDetail.taskEarning && (
                        <div className="pt-2 mt-2 border-t border-green-100">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>计算公式</span>
                            <span>¥{commissionDetail.taskEarning.toFixed(2)} × {(commissionDetail.commissionRate * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {commissionDetail.type === 'register' && (
                    <div className="pt-2 mt-2 border-t border-green-100">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>说明</span>
                        <span>新用户注册奖励</span>
                      </div>
                    </div>
                  )}
                  {commissionDetail.type === 'team' && (
                    <div className="pt-2 mt-2 border-t border-green-100">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>说明</span>
                        <span>团队业绩奖励</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 任务信息 */}
            {commissionDetail.type === 'task' && commissionDetail.taskName && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-3">关联任务信息</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">任务名称</span>
                    <span className="text-sm font-medium text-gray-900">{commissionDetail.taskName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">任务ID</span>
                    <span className="text-sm font-medium text-gray-900">{commissionDetail.taskId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 备注信息 */}
            {commissionDetail.description && (
              <div className="mt-6 bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-800 mb-3">备注信息</h4>
                <p className="text-sm text-gray-700">{commissionDetail.description}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => router.push('/commenter/invite')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors mr-3"
              >
                返回列表
              </button>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                查看更多佣金记录
              </button>
            </div>
          </div>
        </div>

        {/* 佣金说明 */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900">佣金说明</h2>
          </div>
          <div className="p-6">
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>所有佣金将在任务完成并审核通过后自动发放</li>
              <li>不同类型的任务可能有不同的佣金比例</li>
              <li>邀请新用户,指导新用户完成首个100元提现，可获得10元系统奖励</li>
              <li>邀请的用户完成任务，您将获得相应比例的佣金</li>
              <li>团队奖励根据您团队的整体业绩计算</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommissionDetailsPage;