"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserOutlined, CodeOutlined, MessageOutlined, MobileOutlined, LaptopOutlined, ShareAltOutlined, BulbOutlined, RightOutlined, UserAddOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { User } from '@/types';
import { generateInviteCode } from '@/lib/utils';

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

  const [generatingInviteCode, setGeneratingInviteCode] = useState<boolean>(false);
  const [agentStatsData, setAgentStatsData] = useState<AgentStatsData | null>(null);
  const [inviteRecords, setInviteRecords] = useState<InviteRecord[]>([]);
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>(''); // 改为公有的状态变量
  const [showGenerateButton, setShowGenerateButton] = useState<boolean>(true); // 控制生成邀请码按钮的显示
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false); // 控制成功提示框的显示

  // 定义localStorage中存储的评论者认证数据类型
  interface CommenterAuthData {
    userId: string;
    username: string;
    userInfo: User;
    inviteCode?: string; // 邀请码字段
  }

  // 从localStorage获取用户ID的函数
  const getUserFromLocalStorage = () => {
    try {
      const commenterAuthDataStr = localStorage.getItem('commenter_auth_data');
      if (commenterAuthDataStr) {
        const commenterAuthData = JSON.parse(commenterAuthDataStr) as CommenterAuthData;
        const userInfo = commenterAuthData.userInfo;
        const storedInviteCode = userInfo.invitationCode;
        const currentUserId = userInfo.id;
        console.log('从localStorage获取到的user ID，要传递给后端:', currentUserId);
        console.log('从localStorage获取到的invitation_code:', storedInviteCode);
        
        // 更新用户ID状态
        setUserId(currentUserId);
        
        // 从localStorage获取邀请码
        if (storedInviteCode && typeof storedInviteCode === 'string') {
          // 设置邀请码数据
          setInvitationCodeData({
            inviteCode: storedInviteCode,
            userId: currentUserId || commenterAuthData.userId || ''
          });
          // 如果有邀请码，则隐藏生成邀请码按钮
          setShowGenerateButton(false);
          console.log('从localStorage获取到的邀请码:', storedInviteCode);
        } else {
          // 如果没有邀请码，则显示生成邀请码按钮
          setShowGenerateButton(true);
        }
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
    }
  };

  // 生成邀请码函数
  const GenerateInviteCode = async () => {
    setGeneratingInviteCode(true);
    try {
      if (!userId || userId.trim() === '') {
        // 如果userId为空，尝试从localStorage重新获取
        getUserFromLocalStorage();
        if (!userId || userId.trim() === '') {
          setError('未找到有效的用户ID');
          setGeneratingInviteCode(false);
          return;
        }
      }
      console.log('要传递给/api/public/inviteagent/myinvitationcode后端的user ID:', userId);

      // 调用生成邀请码的API
      const response = await fetch('/api/public/inviteagent/myinvitationcode', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId  // 在请求头中传递userId
        }
      });
      
      if (!response.ok) {
        console.log('请求失败');
        console.log('生成邀请码API响应状态:', response.status);
        setError(`请求失败: ${response.status}`);
        return;
      }

      console.log('请求成功');
      console.log('生成邀请码API响应状态:', response.status);
      const data: ApiResponse<InvitationCodeData> = await response.json();
      console.log('请求url:', '/api/public/inviteagent/myinvitationcode');
      console.log('从生成邀请码API获取到的邀请码数据:', data);
      
      // 同时检查HTTP状态和响应数据中的success字段
      if (data.success === true) {
        // 成功后显示自定义美化提示框
        setShowSuccessModal(true);
      } else {
        // 处理API返回的错误，即使HTTP状态是200
        const errorMessage = data.message || '生成邀请码失败';
        setError(errorMessage);
      }
    } catch (err) {
      // 处理网络错误或其他意外异常
      console.error('生成邀请码时发生异常:', err);
      const errorMessage = err instanceof Error ? `网络或系统错误: ${err.message}` : '生成邀请码时发生未知错误';
      setError(errorMessage);
    } finally {
      setGeneratingInviteCode(false);
    }
  };

  // 实现API请求逻辑
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // 首先从localStorage获取用户ID
    getUserFromLocalStorage();
    
    const fetchData = async () => {
      try {
        // 等待userId设置完成
        if (!userId) {
          // 如果没有userId，先等待一下再检查
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!userId) {
            console.log('无法获取用户ID，跳过API请求');
            return;
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
          console.log('请求失败');
          console.log('代理人统计API响应状态:', agentStatsResponse.status);
        }

        if (agentStatsResponse.ok) {
          console.log('请求成功');
          console.log('代理人统计API响应状态:', agentStatsResponse.status);
        }
        const agentStatsResponseData: ApiResponse<AgentStatsData> = await agentStatsResponse.json();
        console.log('请求url:', '/api/public/inviteagent/agentstats');
        console.log('从代理人统计API获取到的统计数据:', agentStatsResponseData.data);
        setAgentStatsData(agentStatsResponseData.data);

        // 初始加载时获取邀请码
        const generateInviteCodeResponse = await fetch('/api/public/inviteagent/myinvitationcode', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId || ''
          },
        });
        
        if (!generateInviteCodeResponse.ok) {
          console.log('请求失败');
          console.log('生成邀请码API响应状态:', generateInviteCodeResponse.status);
        }

        if (generateInviteCodeResponse.ok) {
          console.log('请求成功');
          console.log('生成邀请码API响应状态:', generateInviteCodeResponse.status);
        }
        
        const generateInviteCodeResponseData: ApiResponse<InvitationCodeData> = await generateInviteCodeResponse.json();
        console.log('请求url:', '/api/public/inviteagent/myinvitationcode');
        console.log('从生成邀请码API获取到的邀请码数据:', generateInviteCodeResponseData.data);
        
        if (generateInviteCodeResponseData.success === true && generateInviteCodeResponseData.data) {
          setInvitationCodeData(generateInviteCodeResponseData.data);
        }

        // 获取团队成员数据
        const agentteamResponse = await fetch('/api/public/inviteagent/myagentteam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId || ''
          },
        });
        
        if (!agentteamResponse.ok) {
          console.log('请求失败');
          console.log('代理人团队统计API响应状态:', agentteamResponse.status);
        }

        if (agentteamResponse.ok) {
          console.log('请求成功');
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
  }, [userId]);

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
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 transition-all duration-300">
          <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 border-opacity-70 mb-4"></div>
            <div className="text-gray-700 font-medium">加载中...</div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-6 right-6 bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-lg shadow-lg z-50 max-w-md animate-slide-in transition-all duration-300">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="font-bold text-red-800">操作失败</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
            <button 
              className="ml-4 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors" 
              onClick={() => setError(null)}
              aria-label="关闭"
            >
              <span className="text-lg font-semibold">×</span>
            </button>
          </div>
        </div>
      )}

      {/* 标签页切换 - 美化样式 */}
      <div className="bg-white px-4 py-4 shadow-sm mb-4">
        <div className="flex gap-2 mt-2 max-w-3xl mx-auto">
          <button
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium ${activeTab === 'invite' 
              ? 'bg-blue-500 text-white shadow-md transform scale-105' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('invite')}
          >
            <span className="flex items-center justify-center">
              <UserAddOutlined className="mr-2" />
              邀请好友
            </span>
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium ${activeTab === 'invited' 
              ? 'bg-blue-500 text-white shadow-md transform scale-105' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('invited')}
          >
            <span className="flex items-center justify-center">
              <UserOutlined className="mr-2" />
              已邀请好友
            </span>
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-medium ${activeTab === 'commission' 
              ? 'bg-blue-500 text-white shadow-md transform scale-105' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('commission')}
          >
            <span className="flex items-center justify-center">
              <DollarOutlined className="mr-2" />
              佣金收益
            </span>
          </button>
        </div>
      </div>

      {/* 邀请好友标签页 */}
      {activeTab === 'invite' && (
        <div className="mx-4 space-y-6">
          {/* 我的邀请数据 - 美化样式 */}
          <div className="rounded-xl shadow-md p-6 bg-white transition-all hover:shadow-lg">
            <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center">
              <CodeOutlined className="mr-2 text-blue-500" />
              我的邀请数据
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-xl p-5 transition-all duration-300 hover:bg-blue-100 transform hover:-translate-y-1">
                <div className="text-2xl font-bold text-blue-600">{agentStatsData?.totalInvited || 0}</div>
                <div className="text-sm text-gray-600 mt-1">累计邀请</div>
              </div>
              <div className="bg-green-50 rounded-xl p-5 transition-all duration-300 hover:bg-green-100 transform hover:-translate-y-1">
                <div className="text-2xl font-bold text-green-600">{agentStatsData?.activeUsers || 0}</div>
                <div className="text-sm text-gray-600 mt-1">活跃用户</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-5 transition-all duration-300 hover:bg-orange-100 transform hover:-translate-y-1">
                <div className="text-2xl font-bold text-orange-600">¥{(agentStatsData?.totalReward || 0).toFixed(2)}</div>
                <div className="text-sm text-gray-600 mt-1">累计佣金</div>
              </div>
            </div>
          </div>
          
          {/* 自定义成功提示框 */}
          <Modal
            title="操作成功"
            open={showSuccessModal}
            onOk={() => {
              setShowSuccessModal(false);
              window.location.reload();
            }}
            onCancel={() => setShowSuccessModal(false)}
            okText="确定"
            cancelText="取消"
            centered
            footer={[
              <button
                key="cancel"
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mr-4 font-medium"
              >
                取消
              </button>,
              <button
                key="confirm"
                onClick={() => {
                  setShowSuccessModal(false);
                  window.location.reload();
                }}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow"
              >
                确定
              </button>
            ]}
            className="custom-modal"
            width={420}
            style={{
              borderRadius: '16px',
            }}
          >
            <div className="text-center py-6">
              <div className="flex justify-center mb-5">
                <CheckCircleOutlined className="text-green-500 text-5xl" />
              </div>
              <p className="text-xl font-bold text-gray-800 mb-2">邀请码生成成功！</p>
              <p className="text-gray-600">点击确定刷新页面查看邀请码</p>
            </div>
          </Modal>
     

          {/* 我的专属邀请码 - 美化样式 */}
          <div className="rounded-xl w-full shadow-md p-6 bg-white transition-all hover:shadow-lg">
            <h3 className="font-bold text-xl text-gray-800 mb-5 flex items-center">
              <CodeOutlined className="mr-2 text-blue-500" />
              我的专属邀请码
            </h3>
            <div className="w-full items-center mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-center py-5 px-6 rounded-xl mb-6 border border-blue-100">
                <span className="text-3xl font-bold text-blue-600 tracking-wider">{invitationCodeData?.inviteCode || '点击生成邀请码按钮生成专属邀请码'}</span>
              </div>
            </div>
            <div className="w-full items-center mb-4 space-y-4">
              <button 
                onClick={copyInviteLink}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 w-full transform hover:scale-[1.02] flex items-center justify-center"
              >
                <ShareAltOutlined className="mr-2" />
                {copied ? '已复制' : '复制邀请码'}
              </button>
              {showGenerateButton && (
                <button 
                  onClick={GenerateInviteCode}
                  className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 w-full transform hover:scale-[1.02] flex items-center justify-center"
                  disabled={generatingInviteCode}
                >
                  {generatingInviteCode ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-opacity-30 border-t-white mr-2"></div>
                      生成中...
                    </>
                  ) : (
                    <>
                      <CodeOutlined className="mr-2" />
                      生成邀请码
                    </>
                  )}
                </button>
              )}
            </div>
            

          </div>
          {/* 邀请奖励规则 */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
            <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
              <BulbOutlined className="mr-2 text-yellow-500" />
              邀请奖励规则
            </h3>
            <div className="text-gray-700 space-y-3">
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 mt-0.5 flex-shrink-0">1</div>
                <div>邀请新用户,指导新用户完成首个100元提现，可获得10元系统奖励</div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 mt-0.5 flex-shrink-0">2</div>
                <div>被邀请用户每完成一个任务，邀请者获得该任务收益5%的佣金</div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 mt-0.5 flex-shrink-0">3</div>
                <div>邀请者可获得被邀请用户长期的任务佣金，无时间限制</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 italic">
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