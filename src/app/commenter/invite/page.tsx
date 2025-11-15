"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserOutlined, CodeOutlined, MessageOutlined, MobileOutlined, LaptopOutlined, ShareAltOutlined, BulbOutlined, RightOutlined, UserAddOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { User } from '@/types';

// 邀请页面组件
const InvitePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'invite' | 'invited' | 'commission'>('invite');
  const [copied, setCopied] = useState<boolean>(false);
  // 定义与后端API一致的数据接口类型
  interface ApiResponse<T = any> {
    code: number;
    message: string;
    success: boolean;
    timestamp: number;
    data: T;
  }

  // 邀请码API响应数据类型
  interface InvitationCodeData {
    inviteCode: string;
    userId: string;
  }

  // 统计数据API响应数据类型
  interface AgentStatsData {
    teamMemberCount: number;
    totalReward: number;
    pendingReward: number;
    todayReward: number;
    monthReward: number;
    totalInvited: number;
    activeUsers: number;
  }

  // 邀请记录数据类型
  interface InviteRecord {
    id: string;
    inviteeName: string;
    inviteeAvatar: React.ReactNode;
    inviteDate: string;
    joinDate: string | null;
    status: 'active' | 'joined' | 'pending';
    completedTasks: number;
    totalEarnings: number;
    myCommission: number;
  }

  // 佣金记录数据类型
  interface CommissionRecord {
    id: string;
    date: string;
    type: 'task' | 'register' | 'team';
    memberName: string;
    taskName: string;
    commission: number;
    commissionRate: number;
    taskEarning: number;
    description: string;
  }

  // 状态管理
  const [invitationCodeData, setInvitationCodeData] = useState<InvitationCodeData | null>(null);
  const [agentStatsData, setAgentStatsData] = useState<AgentStatsData | null>(null);
  const [inviteRecords, setInviteRecords] = useState<InviteRecord[]>([]);
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 定义localStorage中存储的评论者认证数据类型
  interface CommenterAuthData {
    userId: string;
    username: string;
    userInfo: User;
    inviteCode?: string; // 邀请码字段
  }

  // 实现API请求逻辑，仅请求agentstats API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let userId: string | undefined;
      try {
          const commenterAuthDataStr = localStorage.getItem('commenter_auth_data');
          if (commenterAuthDataStr) {
            const commenterAuthData = JSON.parse(commenterAuthDataStr) as CommenterAuthData;
            const userInfo = commenterAuthData.userInfo;
            const storedInviteCode = userInfo.invitationCode;
            userId = userInfo.id;
            console.log('从localStorage获取到的user ID:', userId);
            console.log('从localStorage获取到的invitation_code:', storedInviteCode);
            // 从localStorage获取邀请码
            
            if (storedInviteCode && typeof storedInviteCode === 'string') {
              // 设置邀请码数据
              setInvitationCodeData({
                inviteCode: storedInviteCode,
                userId: userId || commenterAuthData.userId || ''
              });
              console.log('从localStorage获取到的邀请码:', storedInviteCode);
            }
          }
          const agentStatsResponse = await fetch('/api/public/inviteagent/agentstats', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': userId || ''
            },
          });

          if (!agentStatsResponse.ok) {
            console.log('请求失败')
            console.log('代理人统计API响应状态:', agentStatsResponse.status);
          }

          if (agentStatsResponse.ok) {
            console.log('请求成功')
            console.log('代理人统计API响应状态:', agentStatsResponse.status);
          }
          const agentStatsResponseData: ApiResponse<AgentStatsData> = await agentStatsResponse.json();
          console.log('请求url:', '/api/public/inviteagent/agentstats');
          console.log('从代理人统计API获取到的统计数据:', agentStatsResponseData.data);
          setAgentStatsData(agentStatsResponseData.data);





          const agentteamResponse = await fetch('/api/public/inviteagent/myagentteam', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': userId || ''
            },
          });
        if (!agentteamResponse.ok) {
            console.log('请求失败')
            console.log('代理人团队统计API响应状态:', agentteamResponse.status);
          }

          if (agentteamResponse.ok) {
            console.log('请求成功')
            console.log('代理人团队统计API响应状态:', agentteamResponse.status);
          }
          const agentteamResponseData: any = await agentteamResponse.json();
          console.log('请求url:', '/api/public/inviteagent/myagentteam');
          console.log('从代理人团队统计API获取到的统计数据:', agentteamResponseData.data);
          
          // 处理团队成员列表数据
          const teamResponse = agentteamResponseData.data;
          if (teamResponse?.list) {
            const formattedInviteRecords: InviteRecord[] = teamResponse.list.map((item: any) => ({
              id: item.id,
              inviteeName: item.username,
              inviteeAvatar: <UserOutlined />,
              inviteDate: item.createTime,
              joinDate: item.registerTime,
              status: 'active',
              completedTasks: 0, // 假设API当前未返回该字段，暂时设置为0
              totalEarnings: 0, // 假设API当前未返回该字段，暂时设置为0
              myCommission: 0, // 假设API当前未返回该字段，暂时设置为0
            }));
            setInviteRecords(formattedInviteRecords);
          }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取代理人统计数据失败';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 复制邀请码
  const copyInviteLink = async () => {
    try {
      const inviteCode = invitationCodeData?.inviteCode || '';
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true); 
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('复制失败，请手动复制');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 加载状态 */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-gray-700">加载中...</div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <strong className="font-bold">错误：</strong>
          <span>{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3" 
            onClick={() => setError(null)}
          >
            <span className="text-red-500 hover:text-red-700">×</span>
          </button>
        </div>
      )}

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
                <div className="text-sm font-bold text-blue-600">{agentStatsData?.totalInvited || 0}</div>
                <div className="text-sm ">累计邀请</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-sm font-bold text-green-600">{agentStatsData?.activeUsers || 0}</div>
                <div className="text-sm ">活跃用户</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-sm font-bold text-orange-600">¥{(agentStatsData?.totalReward || 0).toFixed(2)}</div>
                <div className="text-sm ">累计佣金</div>
              </div>
            </div>
          </div>

          {/* 我的专属邀请码 - 调整布局 */}
          <div className="rounded-lg w-full shadow-sm p-4 bg-white">
            <h3 className="font-bold text-gray-800 mb-3">我的专属邀请码</h3>
            <div className="w-full items-center mb-4">
              <div className="bg-blue-100 text-center py-3 px-4 rounded-lg mb-4">
                <span className="text-2xl font-bold text-blue-600">{invitationCodeData?.inviteCode || 'XXXXXXXX'}</span>
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
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="text-center">
                <h3 className="font-bold text-gray-800">已邀请好友 ({inviteRecords.filter((record: InviteRecord) => record.status !== 'pending').length}人)</h3>
              </div>
            </div>
            <div className="divide-y">
              {inviteRecords.filter((record: InviteRecord) => record.status !== 'pending').length > 0 ? (
                inviteRecords.filter((record: InviteRecord) => record.status !== 'pending').map((invite: InviteRecord) => (
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
            <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-600">¥{(agentStatsData?.totalReward || 0).toFixed(2)}</div>
            <div className="text-xs ">累计佣金</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">¥{(agentStatsData?.monthReward || 0).toFixed(2)}</div>
            <div className="text-xs ">本月佣金</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-600">¥{(agentStatsData?.pendingReward || 0).toFixed(2)}</div>
            <div className="text-xs ">昨日佣金</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded">
            <div className="text-lg font-bold text-purple-600">¥{(agentStatsData?.todayReward || 0).toFixed(2)}</div>
            <div className="text-xs ">今日佣金</div>
          </div>
        </div>
          </div>
          
          {/* 佣金来源分析 - 暂时隐藏，后续可以根据API返回数据添加 */}

          {/* 佣金明细 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">佣金明细</h3>
                <span className="text-xs ">最近{Math.min(commissionRecords.length, 10)}条记录</span>
              </div>
            </div>
            <div className="divide-y overflow-y-auto">
              {/* 限制只显示前10条记录 */}
              {commissionRecords.filter(record => record.type !== 'team').length > 0 ? (
                commissionRecords.filter(record => record.type !== 'team').slice(0, 10).map((record) => (
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
          {commissionRecords.filter(record => record.type !== 'team').length > 10 && (
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