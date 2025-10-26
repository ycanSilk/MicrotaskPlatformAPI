"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserOutlined, CodeOutlined, MessageOutlined, MobileOutlined, LaptopOutlined, ShareAltOutlined, BulbOutlined, RightOutlined, UserAddOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';

// 邀请页面组件
const InvitePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'invite' | 'invited' | 'commission'>('invite');
  const [copied, setCopied] = useState<boolean>(false);

  // 模拟用户信息
  const userInfo = {
    id: 'user-123',
    name: '张三',
    avatar: <UserOutlined />,
  };

  // 生成模拟邀请记录数据
  const generateMockInviteRecords = () => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `invite-${i + 1}`,
      inviteeName: `用户${i + 1}`,
      inviteeAvatar: [
        <UserOutlined />, 
        <UserOutlined />, 
        <UserOutlined />, 
        <CodeOutlined />, 
        <CodeOutlined />
      ][i % 5],
      inviteDate: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      joinDate: i < 3 ? new Date(Date.now() - i * 86400000 - 43200000).toISOString() : null,
      status: i < 2 ? 'active' : i < 3 ? 'joined' : 'pending',
      completedTasks: i < 2 ? Math.floor(Math.random() * 10) + 1 : 0,
      totalEarnings: i < 2 ? Math.random() * 500 + 100 : 0,
      myCommission: i < 2 ? Math.random() * 100 + 20 : 0,
    }));
  };

  // 生成模拟佣金记录数据
  const generateMockCommissionRecords = () => {
    const records = [];
    const types = ['task', 'register', 'team'];
    const names = ['任务一', '任务二', '任务三', '任务四', '任务五'];
    const members = ['用户1', '用户2', '用户3', '用户4', '用户5'];
    
    for (let i = 0; i < 12; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const taskName = type === 'task' ? names[Math.floor(Math.random() * names.length)] : '';
      const commissionRate = type === 'task' ? 0.1 : type === 'register' ? 1 : 0.05;
      const commission = type === 'task' ? Math.random() * 50 + 10 : type === 'register' ? 20 : Math.random() * 100 + 10;
      const taskEarning = type === 'task' ? commission / commissionRate : 0;
      
      records.push({
        id: `comm-${i + 1}`,
        date: new Date(Date.now() - i * 86400000).toISOString(),
        type,
        memberName: members[Math.floor(Math.random() * members.length)],
        taskName,
        commission,
        commissionRate,
        taskEarning,
        description: type === 'team' ? '来自团队成员的业绩分成' : '',
      });
    }
    
    return records;
  };

  // 直接使用模拟数据
  const mockInviteRecords = generateMockInviteRecords();
  const mockCommissionRecords = generateMockCommissionRecords();

  // 计算邀请统计数据
  const inviteStats = {
    totalInvited: mockInviteRecords.length,
    activeUsers: mockInviteRecords.filter(record => record.status === 'active').length,
    totalCommission: mockInviteRecords.reduce((sum, record) => sum + record.myCommission, 0),
  };

  // 计算佣金统计数据
  const totalCommission = mockCommissionRecords.reduce((sum, record) => record.type !== 'team' ? sum + record.commission : sum, 0);
  const monthCommission = mockCommissionRecords
    .filter(record => new Date(record.date).getMonth() === new Date().getMonth() && record.type !== 'team')
    .reduce((sum, record) => sum + record.commission, 0);
  const yesterdayCommission = mockCommissionRecords
    .filter(record => {
      const recordDate = new Date(record.date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return recordDate.toDateString() === yesterday.toDateString() && record.type !== 'team';
    })
    .reduce((sum, record) => sum + record.commission, 0);
  const todayCommission = mockCommissionRecords
    .filter(record => {
      const recordDate = new Date(record.date);
      const today = new Date();
      return recordDate.toDateString() === today.toDateString() && record.type !== 'team';
    })
    .reduce((sum, record) => sum + record.commission, 0);

  const taskCommission = mockCommissionRecords
    .filter(record => record.type === 'task')
    .reduce((sum, record) => sum + record.commission, 0);
  const registerCommission = mockCommissionRecords
    .filter(record => record.type === 'register')
    .reduce((sum, record) => sum + record.commission, 0);

  const commissionStats = {
    total: totalCommission,
    month: monthCommission,
    yesterday: yesterdayCommission,
    today: todayCommission,
    breakdown: { task: taskCommission, register: registerCommission },
  };

  // 复制邀请链接
  const copyInviteLink = async () => {
    try {
      const inviteLink = `https://example.com/invite?ref=${userInfo?.id || 'default'}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      
      // 3秒后重置复制状态
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('复制失败，请手动复制');
    }
  };

  // 分享到社交媒体
  const shareToSocialMedia = (platform: string) => {
    const inviteLink = `https://example.com/invite?ref=${userInfo?.id || 'default'}`;
    const shareText = `我正在使用微任务平台，邀请你一起加入！完成任务赚取佣金，还有邀请奖励哦！${inviteLink}`;
    
    switch (platform) {
      case 'wechat':
        alert('已复制邀请链接，请在微信中粘贴分享');
        navigator.clipboard.writeText(shareText);
        break;
      case 'weibo':
        // 实际项目中应该使用微博分享API
        alert('跳转至微博分享页面');
        break;
      case 'qq':
        // 实际项目中应该使用QQ分享API
        alert('跳转至QQ分享页面');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 标签页切换 - 修改为按钮样式 */}
      <div className="bg-white px-2 py-4 mb-2">
        <div className="flex gap-1 mt-2">
          <button
            className={`flex-1 p-1 rounded-sm border border-gray-300 ${activeTab === 'invite' ? 'bg-blue-500 text-white font-medium' : 'bg-white '}`}
            onClick={() => setActiveTab('invite')}
          >
            邀请好友
          </button>
          <button
            className={`flex-1 p-1 rounded-sm border border-gray-300 ${activeTab === 'invited' ? 'bg-blue-500 text-white font-medium' : 'bg-white '}`}
            onClick={() => setActiveTab('invited')}
          >
            已邀请好友
          </button>
          <button
            className={`flex-1 p-1 rounded-sm border border-gray-300 ${activeTab === 'commission' ? 'bg-blue-500 text-white font-medium' : 'bg-white '}`}
            onClick={() => setActiveTab('commission')}
          >
            佣金收益
          </button>
        </div>
      </div>

      {/* 邀请好友标签页 */}
      {activeTab === 'invite' && (
        <div className="mx-4 space-y-6">
          {/* 我的邀请数据 - 调整布局 */}
          <div className="rounded-lg shadow-sm p-4 bg-white">
            <h3 className="font-bold text-gray-800 mb-4">我的邀请数据</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-sm font-bold text-blue-600">{inviteStats.totalInvited}</div>
                <div className="text-sm ">累计邀请</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-sm font-bold text-green-600">{inviteStats.activeUsers}</div>
                <div className="text-sm ">活跃用户</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-sm font-bold text-orange-600">¥{inviteStats.totalCommission.toFixed(2)}</div>
                <div className="text-sm ">累计佣金</div>
              </div>
            </div>
          </div>

          {/* 我的专属邀请码 - 调整布局 */}
          <div className="rounded-lg w-full shadow-sm p-4 bg-white">
            <h3 className="font-bold text-gray-800 mb-3">我的专属邀请码</h3>
            <div className="w-full items-center mb-4">
              <div className="bg-blue-100 text-center py-3 px-4 rounded-lg mb-4">
                <span className="text-2xl font-bold text-blue-600">{userInfo?.id.slice(-8).toUpperCase() || 'XXXXXXXXX'}</span>
              </div>
            </div>
            <div className="w-full items-center mb-4">
              <button 
                onClick={copyInviteLink}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full"
              >
                {copied ? '已复制' : '复制邀请码'}
              </button>
            </div>
            
            {/* 邀请链接 */}
            <div className="mt-4">
              <h3 className="font-bold text-gray-800 mb-3">邀请链接</h3>
              <div className=" items-center justify-between">
                <div className="text-sm bg-blue-100 px-4 py-4 text-center rounded-lg flex-1 truncate text-blue-600">
                  https://example.com/invite?ref={userInfo?.id || 'default'}
                </div>
                <div className='my-2  items-center'>
                   <button 
                      onClick={copyInviteLink}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full"
                      >
                      {copied ? <CheckCircleOutlined /> : '复制邀请链接'}
                    </button>
                </div>
              </div>
            </div>
          </div>

          {/* 快速分享 */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-3">快速分享</h3>
            <div className="grid grid-cols-4 gap-4">
              <button 
                onClick={() => shareToSocialMedia('wechat')}
                className="flex flex-col items-center p-3 bg-blue-500 rounded hover:bg-blue-700 transition-colors"
              >
                <MessageOutlined className="text-2xl mb-1 text-white" />
                <div className="text-xs text-white">微信</div>
              </button>
              <button 
                onClick={() => shareToSocialMedia('weibo')}
                className="flex flex-col items-center p-3 bg-blue-500 rounded hover:bg-blue-700 transition-colors"
              >
                <MobileOutlined className="text-2xl mb-1 text-white" />
                <div className="text-xs text-white">微博</div>
              </button>
              <button 
                onClick={() => shareToSocialMedia('qq')}
                className="flex flex-col items-center p-3 bg-blue-500 rounded hover:bg-blue-700 transition-colors"
              >
                <LaptopOutlined className="text-2xl mb-1 text-white" />
                <div className="text-xs text-white">QQ</div>
              </button>
              <button 
                onClick={() => shareToSocialMedia('other')}
                className="flex flex-col items-center p-3 bg-blue-500 rounded hover:bg-blue-700 transition-colors"
              >
                <ShareAltOutlined className="text-2xl mb-1 text-white" />
                <div className="text-xs text-white">更多</div>
              </button>
            </div>
          </div>

          {/* 邀请奖励规则 */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold mb-3">邀请奖励规则</h3>
            <div className="text-sm space-y-2">
              <div>1. 邀请新用户,指导新用户完成首个100元提现，可获得10元系统奖励</div>
              <div>2. 被邀请用户每完成一个任务，邀请者获得该任务收益5%的佣金</div>
              <div>3. 邀请者可获得被邀请用户长期的任务佣金，无时间限制</div>
            </div>
            <div className="mt-4 text-xs">
              * 活动最终解释权归平台所有
            </div>
          </div>
        </div>
      )}

      {/* 已邀请好友标签页 */}
      {activeTab === 'invited' && (
        <div className="mx-4 space-y-6">
      

          {/* 邀请记录列表 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="text-center">
                <h3 className="font-bold text-gray-800">已邀请好友 ({mockInviteRecords.filter(record => record.status !== 'pending').length}人)</h3>
              </div>
            </div>
            <div className="divide-y">
              {mockInviteRecords.filter(record => record.status !== 'pending').length > 0 ? (
                mockInviteRecords.filter(record => record.status !== 'pending').map((invite) => (
                  <div key={invite.id} className="p-4">
                    {/* 被邀请人基本信息 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                          {invite.inviteeAvatar || <UserOutlined />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{invite.inviteeName || '未知用户'}</div>
                          <div className="text-xs ">
                            邀请时间: {new Date(invite.inviteDate).toLocaleDateString()}
                         
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${invite.status === 'active' ? 'text-green-600' : invite.status === 'joined' ? 'text-blue-600' : 'text-yellow-600'}`}>
                          {invite.status === 'active' ? '活跃中' : invite.status === 'joined' ? '已注册' : '待注册'}
                        </div>
                        <div className="text-xs ">
                          {invite.status !== 'pending' && `已完成${invite.completedTasks || 0}个任务`}
                        </div>
                      </div>
                    </div>
                    
                    {/* 被邀请人数据统计 - 调整样式 */}
                    {invite.status !== 'pending' && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                          <div className="text-sm font-bold text-gray-800">¥{(invite.totalEarnings || 0).toFixed(2)}</div>
                          <div className="text-xs ">总收益</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                          <div className="text-sm font-bold text-green-600">¥{(invite.myCommission || 0).toFixed(2)}</div>
                          <div className="text-xs ">我的佣金</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                          <div className="text-sm font-bold text-blue-600">{invite.completedTasks || 0}</div>
                          <div className="text-xs ">完成任务</div>
                        </div>
                      </div>
                    )}
                    
                    {/* 查看详情按钮 */}
                    <div className="mt-3 flex justify-end">
                      <button 
                        onClick={() => router.push(`/commenter/invite/details/${invite.id}` as any)}
                        className="text-blue-500 text-sm hover:text-blue-600"
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <UserAddOutlined className="text-gray-400 text-5xl mb-4" />
                  <div className="">您还没有邀请任何好友</div>
                  <div className="text-gray-400 text-sm mt-2">快去邀请好友加入吧，一起赚取佣金！</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 佣金收益标签页 */}
      {activeTab === 'commission' && (
        <div className="mx-4 mt-6">
          {/* 佣金统计 */}
          <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <h3 className="font-bold text-gray-800 mb-4">佣金统计</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">¥{commissionStats.total.toFixed(2)}</div>
                <div className="text-xs ">累计佣金</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">¥{commissionStats.month.toFixed(2)}</div>
                <div className="text-xs ">本月佣金</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded">
                <div className="text-lg font-bold text-orange-600">¥{commissionStats.yesterday.toFixed(2)}</div>
                <div className="text-xs ">昨日佣金</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-600">¥{commissionStats.today.toFixed(2)}</div>
                <div className="text-xs ">今日佣金</div>
              </div>
            </div>
          </div>
          
          {/* 佣金来源分析 */}
          {commissionStats.total > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <h3 className="font-bold text-gray-800 mb-4">佣金来源分析</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm ">任务佣金</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">¥{commissionStats.breakdown.task.toFixed(2)}</div>
                    <div className="text-xs ">{((commissionStats.breakdown.task / commissionStats.total) * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm ">注册奖励</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">¥{commissionStats.breakdown.register.toFixed(2)}</div>
                    <div className="text-xs ">{((commissionStats.breakdown.register / commissionStats.total) * 100).toFixed(1)}%</div>
                  </div>
                </div>
                
                {/* 总计金额 */}
                <div className="mt-6 text-center">
                  <div className="text-lg font-bold text-gray-800">¥{commissionStats.total.toFixed(2)}</div>
                  <div className="text-xs ">总计佣金</div>
                </div>
              </div>
            </div>
          )}

          {/* 佣金明细 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">佣金明细</h3>
                <span className="text-xs ">最近{Math.min(mockCommissionRecords.length, 10)}条记录</span>
              </div>
            </div>
            <div className="divide-y overflow-y-auto">
              {/* 限制只显示前10条记录 */}
              {mockCommissionRecords.filter(record => record.type !== 'team').length > 0 ? (
                mockCommissionRecords.filter(record => record.type !== 'team').slice(0, 10).map((record) => (
                  <div key={record.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-800">{record.memberName}</span>
                          {record.type === 'register' ? (
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">注册奖励</span>
                          ) : (
                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">任务佣金</span>
                          )}
                        </div>
                        <div className="text-sm  mb-1">{record.taskName}</div>
                        <div className="text-xs ">{new Date(record.date).toLocaleString()}</div>
                        {record.type === 'task' && (
                          <div className="text-xs ">
                            佣金
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className={record.type === 'register' ? 'font-bold text-green-600' : 'font-bold text-blue-600'}>+¥{record.commission.toFixed(2)}</div>
                        <div className="text-xs ">
                          {record.type === 'register' ? '注册奖励' : '佣金'}
                        </div>
                      </div>
                    </div>
                    
                    {/* 查看佣金详情按钮 */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => router.push(`/commenter/invite/commission-details/${record.id}` as any)}
                        className="text-blue-500 text-sm hover:text-blue-600"
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <DollarOutlined className="text-gray-400 text-5xl mb-4" />
                  <div className="">暂无佣金记录</div>
                  <div className="text-gray-400 text-sm mt-2">邀请好友完成任务，即可获得佣金奖励！</div>
                </div>
              )}
            </div>
          </div>
          
          {/* 查看更多 */}
          {mockCommissionRecords.filter(record => record.type !== 'team').length > 10 && (
            <div className="p-4 border-t bg-gray-50">
              <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
                查看全部佣金记录
              </button>
            </div>
          )}
        </div>
      )}

      {/* 底部间距，确保内容不被遮挡 */}
      <div className="pb-20"></div>
    </div>
  );
};

export default InvitePage;