'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { InviteRecord } from '../../../../../types/invite';

const InviteDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string || 'default';
  
  // 定义多个静态邀请记录数据
  const mockInviteData: Record<string, InviteRecord> = {
    'invite-1': {
      id: 'invite-1',
      inviteeId: 'user123',
      inviteeName: '张小明',
      inviteeAvatar: 'https://picsum.photos/id/64/40/40',
      joinDate: new Date('2023-09-15T10:30:00.000Z').toISOString(),
      inviteDate: new Date('2023-09-10T14:20:00.000Z').toISOString(),
      status: 'joined',
      rewardAmount: 5.00,
      completedTasks: 15,
      totalEarnings: 328.50,
      myCommission: 45.50,
      level: '一级'
    },
    'invite-2': {
      id: 'invite-2',
      inviteeId: 'user124',
      inviteeName: '李小华',
      inviteeAvatar: 'https://picsum.photos/id/65/40/40',
      inviteDate: new Date('2023-09-20T09:15:00.000Z').toISOString(),
      status: 'pending',
      rewardAmount: 5.00,
      completedTasks: 0,
      totalEarnings: 0,
      myCommission: 0
    },
    'invite-3': {
      id: 'invite-3',
      inviteeId: 'user125',
      inviteeName: '王小强',
      inviteeAvatar: 'https://picsum.photos/id/66/40/40',
      joinDate: new Date('2023-09-05T16:45:00.000Z').toISOString(),
      inviteDate: new Date('2023-09-01T11:30:00.000Z').toISOString(),
      status: 'active',
      rewardAmount: 5.00,
      completedTasks: 42,
      totalEarnings: 1280.75,
      myCommission: 182.50,
      level: '一级'
    }
  };

  // 获取当前ID对应的邀请记录数据，如果不存在则使用默认数据
  const inviteDetail: InviteRecord = mockInviteData[id] || mockInviteData['invite-1'];

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
              <h1 className="text-xl font-semibold text-gray-900">邀请详情</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* 基本信息卡片 */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900">被邀请人信息</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <img 
                src={inviteDetail.inviteeAvatar} 
                alt={inviteDetail.inviteeName} 
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{inviteDetail.inviteeName}</h3>
                <div className="flex items-center mt-1">
                  {inviteDetail.status === 'joined' || inviteDetail.status === 'active' ? (
                    <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-sm">已注册</span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded text-sm">待注册</span>
                  )}
                  <span className="text-gray-500 text-sm ml-2">
                    邀请时间: {new Date(inviteDetail.inviteDate).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 注册信息 */}
              {(inviteDetail.status === 'joined' || inviteDetail.status === 'active') && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">注册信息</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">注册时间</span>
                      <span className="text-sm font-medium text-gray-900">{inviteDetail.joinDate ? new Date(inviteDetail.joinDate).toLocaleString() : '未注册'}</span>
                    </div>
                    {/* 完成任务信息 */}
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-600">完成任务</span>
                        <span className="text-sm font-medium text-gray-900">{inviteDetail.completedTasks}</span>
                      </div>
                  </div>
                </div>
              )}

              {/* 收益信息 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-3">收益信息</h4>
                <div className="space-y-2">
                  {(inviteDetail.status === 'joined' || inviteDetail.status === 'active') && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">被邀请人总收益</span>
                      <span className="text-sm font-medium text-gray-900">¥{inviteDetail.totalEarnings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">您获得的佣金</span>
                    <span className="text-sm font-medium text-green-600">¥{inviteDetail.myCommission.toFixed(2)}</span>
                  </div>
                  {(inviteDetail.status === 'joined' || inviteDetail.status === 'active') && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">邀请层级</span>
                      <span className="text-sm font-medium text-gray-900">{inviteDetail.level}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 推广建议 */}
            <div className="mt-8 bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 mb-3">推广建议</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {inviteDetail.status === 'pending' ? (
                  [
                    "可以通过微信或其他社交平台提醒被邀请人注册",
                    "分享平台的优势和任务收益，吸引对方加入",
                    "提供注册和完成任务的简单教程"
                  ]
                ) : (
                  [
                    "鼓励好友持续完成更多任务，双方收益都会增加",
                    "分享优质任务信息给好友，提高完成率",
                    "邀请更多好友加入，享受团队佣金奖励"
                  ]
                ).map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* 操作按钮 */}
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => router.push('/commenter/invite')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors mr-3"
              >
                返回列表
              </button>
              {inviteDetail.status === 'pending' && (
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  再次邀请
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InviteDetailsPage;