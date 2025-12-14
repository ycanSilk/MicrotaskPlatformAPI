"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LeftOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined, DownloadOutlined, MessageOutlined, UserOutlined, DollarOutlined, CalendarOutlined, FileTextOutlined, TrophyOutlined, ShareAltOutlined, LikeOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
// 定义订单类型接口
export interface SubOrder {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  submitTime?: string;
  reviewTime?: string;
  reward: number;
  content?: string;
  screenshots?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  budget: number;
  assignedTo?: string;
  completionTime?: string;
  type: 'comment' | 'like' | 'share' | 'other';
  subOrders: SubOrder[];
  videoUrl?: string;
}

// 订单详情页面组件
const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'suborders' | 'history'>('overview');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [subOrderFilter, setSubOrderFilter] = useState('all');

  // 模拟获取订单详情数据
  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const mockOrder: Order = {
          id: orderId,
          orderNumber: `ORD-${2023}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          title: `详细任务 ${Math.floor(Math.random() * 100)}`,
          description: `这是一个详细的任务描述，包含了具体的任务要求、执行标准、验收条件等信息。\n\n任务要求：\n1. 完成指定内容的评论/点赞/分享\n2. 按照规定格式提交截图证明\n3. 确保内容符合平台规范\n4. 在截止日期前完成任务\n\n注意事项：\n- 提交的内容必须真实有效\n- 截图必须清晰可见任务完成状态\n- 禁止使用作弊手段完成任务`,
          status: ['pending', 'processing', 'reviewing', 'completed', 'rejected', 'cancelled'][Math.floor(Math.random() * 6)] as Order['status'],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          budget: 100 + Math.floor(Math.random() * 900),
          assignedTo: Math.random() > 0.3 ? `用户${Math.floor(Math.random() * 100)}` : undefined,
          completionTime: Math.random() > 0.5 ? new Date().toISOString() : undefined,
          type: ['comment', 'like', 'share', 'other'][Math.floor(Math.random() * 4)] as Order['type'],
          videoUrl: 'https://example.com/videos/task-demo.mp4',
          subOrders: Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, subIndex) => ({
            id: `suborder-${Date.now()}-${subIndex}`,
            orderId: orderId,
            userId: `user-${subIndex + 1}`,
            userName: `用户${subIndex + 1}`,
            status: ['pending', 'processing', 'reviewing', 'completed', 'rejected'][subIndex % 5] as SubOrder['status'],
            submitTime: subIndex < 8 ? new Date().toISOString() : undefined,
            reviewTime: subIndex < 6 ? new Date().toISOString() : undefined,
            reward: 10 + Math.floor(Math.random() * 90),
            content: subIndex % 2 === 0 ? '这是用户提交的详细内容示例。内容必须符合平台规范，真实有效。' : undefined,
            screenshots: subIndex % 3 === 0 ? ['https://picsum.photos/400/300?random=' + subIndex, 'https://picsum.photos/400/301?random=' + subIndex] : undefined,
          })),
        };

        setOrder(mockOrder);
      } catch (err) {
        setError('获取订单详情失败，请稍后重试。');
        console.error('Failed to fetch order detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // 处理返回按钮点击
  const handleBack = () => {
    router.push('/publisher/orders');
  };

  // 处理审核操作
  const handleReview = (subOrderId: string, approve: boolean) => {
    // 在实际应用中，这里会调用API更新子订单状态
    alert(`${approve ? '通过' : '拒绝'}子订单 ${subOrderId}`);
  };

  // 处理导出订单
  const handleExport = () => {
    // 导出订单的逻辑
    alert('导出订单详情功能将在后续实现');
  };

  // 复制到剪贴板功能
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    });
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取状态对应的中文名称和样式
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
      pending: { text: '待处理', className: 'bg-yellow-100 text-yellow-800', icon: <ClockCircleOutlined className="h-4 w-4" /> },
      processing: { text: '进行中', className: 'bg-blue-100 text-blue-800', icon: <ClockCircleOutlined className="h-4 w-4" /> },
      reviewing: { text: '审核中', className: 'bg-purple-100 text-purple-800', icon: <LockOutlined className="h-4 w-4" /> },
      completed: { text: '已完成', className: 'bg-green-100 text-green-800', icon: <CheckCircleOutlined className="h-4 w-4" /> },
      rejected: { text: '已拒绝', className: 'bg-red-100 text-red-800', icon: <CloseCircleOutlined className="h-4 w-4" /> },
      cancelled: { text: '已取消', className: 'bg-gray-100 text-gray-800', icon: <ExclamationCircleOutlined className="h-4 w-4" /> }
    };
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800', icon: <ExclamationCircleOutlined className="h-4 w-4" /> };
  };

  // 获取任务类型对应的图标和文本
  const getTypeInfo = (type: string) => {
    const typeMap: Record<string, { text: string; icon: React.ReactNode; className: string }> = {
      comment: { text: '评论任务', icon: <MessageOutlined className="h-5 w-5" />, className: 'text-blue-500' },
      like: { text: '点赞任务', icon: <LikeOutlined className="h-5 w-5" />, className: 'text-red-500' },
      share: { text: '分享任务', icon: <ShareAltOutlined className="h-5 w-5" />, className: 'text-green-500' },
      other: { text: '其他任务', icon: <FileTextOutlined className="h-5 w-5" />, className: 'text-gray-500' }
    };
    return typeMap[type] || { text: '未知类型', icon: <FileTextOutlined className="h-5 w-5" />, className: 'text-gray-500' };
  };

  // 计算子订单统计信息
  const getSubOrderStats = () => {
    if (!order) return { total: 0, pending: 0, processing: 0, reviewing: 0, completed: 0, rejected: 0 };
    
    const stats = {
      total: order.subOrders.length,
      pending: 0,
      processing: 0,
      reviewing: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0
    };

    order.subOrders.forEach(subOrder => {
      stats[subOrder.status]++;
    });

    return stats;
  };

  // 计算完成进度
  const getCompletionRate = () => {
    const stats = getSubOrderStats();
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-md w-24"></div>
            <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded-md"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded-md"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 bg-gray-200 rounded-md"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LeftOutlined className="h-4 w-4 mr-2" />
            返回订单列表
          </button>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <ExclamationCircleOutlined className="h-12 w-12 text-red-500" />
              <p className="text-gray-700 text-lg font-medium">{error || '订单不存在或已被删除'}</p>
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                返回订单列表
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getSubOrderStats();
  const completionRate = getCompletionRate();
  const typeInfo = getTypeInfo(order.type);
  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* 返回按钮 */}
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LeftOutlined className="h-4 w-4 mr-2" />
            返回订单列表
          </button>

          {/* 订单头部信息 */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">订单信息</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.className}`}>
                {statusInfo.text}
              </span>
            </div>
            
            {/* 订单基本信息 */}
            <div className="mb-4">
              {/* 订单编号和订单类型在同一行显示 */}
              <div className="gap-8 mb-4">
                {/* 订单编号和复制按钮 */}
                <div>
                  <p className="text-sm text-gray-600">订单编号</p>
                  <div className="flex items-center mb-2">
                    <p className="font-medium mr-2">{order.orderNumber}</p>
                    <button 
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => copyToClipboard(order.orderNumber)}
                      title="复制订单编号"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* 订单类型 */}
                <div>
                  <p className="text-sm text-gray-600">订单类型</p>
                  <p className="font-medium">{typeInfo.text}</p>
                </div>
              </div>
              
              {/* 其他信息保持grid布局 */}
              <div className="grid grid-cols-1 gap-4">
              
                <div>
                  <p className="text-sm text-gray-600">发布时间</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">截止时间</p>
                  <p className="font-medium">{formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())}</p>
                </div>
              </div>
              
              {/* 视频链接 */}
              {order.videoUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">视频链接</p>
                  <a 
                    href={order.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {order.videoUrl}
                  </a>
                </div>
              )}
            </div>
            
            {/* 任务描述 */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">任务描述</p>
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 whitespace-pre-line">
                {order.description}
              </div>
            </div>
            
            {/* 订单进度 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-semibold text-gray-900">完成进度</h3>
                <span className="text-sm font-medium text-blue-600">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
            
            {/* 订单统计 - 同一行均等宽度 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-blue-500 mb-1">总单价</div>
                <div className="text-sm font-bold text-gray-900">¥{order.budget.toFixed(2)}</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-green-500 mb-1">单价</div>
                <div className="text-sm font-bold text-gray-900">¥{(order.budget / stats.total).toFixed(2)}</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-purple-500 mb-1">订单总数</div>
                <div className="text-sm font-bold text-gray-900">{stats.total}</div>
              </div>
            </div>
          </div>



          {/* 标签页 - 调整为均等宽度 */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  概览
                </button>
                <button
                  onClick={() => setActiveTab('suborders')}
                  className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'suborders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  子订单 ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  操作历史
                </button>
              </nav>
            </div>
            
            {/* 标签页内容 */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">任务概览</h3>
                  
                  {/* 子订单状态分布 - 移除已拒绝状态 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">子订单状态分布</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                        <div className="text-sm text-blue-700">进行中</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.reviewing}</div>
                        <div className="text-sm text-orange-700">待审核</div>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <div className="text-sm text-green-700">已完成</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <div className="text-sm text-yellow-700">待处理</div>
                      </div>
                    </div>
                  </div>

                  {/* 任务信息摘要 */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h4 className="flex items-center text-sm font-medium text-blue-800 mb-3">
                      <FileTextOutlined className="h-4 w-4 mr-2" />
                      任务摘要
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">• 订单类型：{typeInfo.text}</p>
                      <p className="text-gray-700">• 当前状态：{statusInfo.text}</p>
                      <p className="text-gray-700">• 总单价：¥{order.budget.toFixed(2)}</p>
                      <p className="text-gray-700">• 单价：¥{(order.budget / stats.total).toFixed(2)}</p>
                      <p className="text-gray-700">• 子订单数量：{stats.total}</p>
                      <p className="text-gray-700">• 完成率：{completionRate}%</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'suborders' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">子订单详情</h3>
                  
                  {/* 订单状态下拉选择器 */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                     
                      <select
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={subOrderFilter}
                        onChange={(e) => setSubOrderFilter(e.target.value)}
                      >
                        <option value="all">全部</option>
                        <option value="completed">已完成</option>
                        <option value="processing">进行中</option>
                        <option value="reviewing">待审核</option>
                        <option value="pending">待领取</option>
                      </select>
                    </div>
                  </div>
                  
                  {order.subOrders.length > 0 ? (
                    <div className="space-y-4">
                      {order.subOrders.filter(subOrder => {
                        if (subOrderFilter === 'all') return true;
                        return subOrder.status === subOrderFilter;
                      }).map((subOrder) => {
                        const subOrderStatusInfo = getStatusInfo(subOrder.status);
                        return (
                          <div key={subOrder.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center mb-2 md:mb-0">
                                  <span className="text-sm font-medium text-gray-500 mr-2">订单编号:</span>
                                  <span className="text-sm text-gray-900 font-medium">{subOrder.id}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subOrderStatusInfo.className}`}>
                                    {subOrderStatusInfo.icon}
                                    <span className="ml-1">{subOrderStatusInfo.text}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-500 mr-2">领取用户:</span>
                                  <span className="text-sm text-gray-900">{subOrder.userName}</span>
                                </div>
                                <div className="flex items-start">
                                  <span className="text-sm font-medium text-gray-500 mr-2">奖励金额:</span>
                                  <span className="text-sm text-gray-900 font-medium">¥{subOrder.reward.toFixed(2)}</span>
                                </div>
                                {subOrder.submitTime && (
                                  <div className="flex items-start">
                                    <span className="text-sm font-medium text-gray-500 mr-2">提交时间:</span>
                                    <span className="text-sm text-gray-900">{formatDate(subOrder.submitTime)}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* 提交内容 */}
                              {subOrder.content && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">提交内容</h4>
                                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                    {subOrder.content}
                                  </div>
                                </div>
                              )}
                               
                              {/* 提交截图 */}
                              {subOrder.screenshots && subOrder.screenshots.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">提交截图</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {subOrder.screenshots.map((screenshot, index) => (
                                      <div key={index} className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden bg-gray-100">
                                        <img 
                                          src={screenshot} 
                                          alt={`提交截图 ${index + 1}`} 
                                          className="object-cover w-full h-full cursor-pointer hover:opacity-90"
                                          onClick={() => setSelectedScreenshot(screenshot)}
                                          loading="lazy"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* 操作区域 */}
                              <div className="mt-4 flex space-x-2">
                                {/* 查看详情按钮 - 始终显示 */}
                                <button 
                                  className="flex-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 px-4 py-2"
                                  onClick={() => router.push(`/publisher/orders/account-rental/${orderId}/suborders-detail/${subOrder.id}`)}
                                >
                                  查看详情
                                </button>
                                
                                {/* 审核按钮 - 仅在审核中状态显示 */}
                                {subOrder.status === 'reviewing' && (
                                  <>
                                    <button 
                                      className="flex-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 px-4 py-2"
                                      onClick={() => handleReview(subOrder.id, false)}
                                    >
                                      拒绝
                                    </button>
                                    <button 
                                      className="flex-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 px-4 py-2"
                                      onClick={() => handleReview(subOrder.id, true)}
                                    >
                                      通过
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <TeamOutlined className="h-10 w-10 mb-2 opacity-50" />
                      <p>暂无子订单</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">操作日志</h3>
                  
                  {/* 操作日志列表 */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <CalendarOutlined className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-900">创建订单</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 pl-10">
                        用户创建了订单 {order.orderNumber}
                      </div>
                    </div>
                    
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <UserOutlined className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-900">分配任务</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(new Date(Date.now() - 3600000).toISOString())}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 pl-10">
                        向 {stats.total} 个用户分配了子任务
                      </div>
                    </div>
                    
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <FileTextOutlined className="h-4 w-4" />
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-900">更新订单</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.updatedAt)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 pl-10">
                        更新了订单状态为 {statusInfo.text}
                      </div>
                    </div>
                    
                    {stats.completed > 0 && (
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                              <CheckCircleOutlined className="h-4 w-4" />
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">完成子任务</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(new Date(Date.now() - 7200000).toISOString())}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 pl-10">
                          已完成 {stats.completed} 个子任务的审核
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* 图片查看大图模态框 */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedScreenshot(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={selectedScreenshot} 
              alt="大图预览" 
              className="max-w-full max-h-[90vh] object-contain rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;