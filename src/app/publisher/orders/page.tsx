'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined, FilterOutlined, CalendarOutlined, DownOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import ReorderButton from '../../commenter/components/ReorderButton';
// 修复导入路径
import OrderStatus from '../../../components/order/OrderStatus';
import OrderTaskType from '../../../components/order/OrderTaskType';
import { OrderStatusType } from '../../../components/order/OrderStatus';
import { TaskType } from '../../../components/order/OrderTaskType';

// 定义订单类型接口
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

// 订单管理页面组件
const PublisherOrdersPage: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'budget' | 'status'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const datePickerRef = useRef<HTMLDivElement>(null);
  


  // 监听点击外部区域自动关闭日期选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker && datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    // 添加点击事件监听器
    document.addEventListener('mousedown', handleClickOutside);
    
    // 清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // 模拟获取订单数据
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // 在实际应用中，这里会调用API获取数据
        // const response = await fetch('/api/publisher/orders');
        // if (!response.ok) throw new Error('Failed to fetch orders');
        // const data = await response.json();
        // setOrders(data);

        // 静态模拟数据 - 替换循环随机生成的方式
        const mockOrders: Order[] = [
          {
            id: "order-1",
            orderNumber: "ORD-2023-0001",
            title: "社交媒体评论任务",
            description: "需要在各大社交媒体平台对指定内容进行评论互动，评论内容需积极正面，符合任务要求。",
            status: "completed",
            createdAt: "2023-11-01T10:00:00.000Z",
            updatedAt: "2023-11-05T15:30:00.000Z",
            budget: 500,
            assignedTo: "用户1",
            completionTime: "2023-11-05T15:30:00.000Z",
            type: "comment",
            subOrders: [
              {
                id: "suborder-1-1",
                orderId: "order-1",
                userId: "user-1",
                userName: "用户1",
                status: "completed",
                submitTime: "2023-11-03T14:20:00.000Z",
                reviewTime: "2023-11-04T09:15:00.000Z",
                reward: 100,
                content: "这是一个很好的产品，非常实用！",
                screenshots: ["https://picsum.photos/200/200"]
              },
              {
                id: "suborder-1-2",
                orderId: "order-1",
                userId: "user-2",
                userName: "用户2",
                status: "completed",
                submitTime: "2023-11-04T11:30:00.000Z",
                reviewTime: "2023-11-04T16:45:00.000Z",
                reward: 100,
                content: "已经使用了一段时间，体验非常棒！",
                screenshots: ["https://picsum.photos/201/201"]
              }
            ]
          },
          {
            id: "order-2",
            orderNumber: "ORD-2023-0002",
            title: "产品点赞推广",
            description: "为指定产品页面点赞并分享，提高产品曝光度和关注度。",
            status: "processing",
            createdAt: "2023-11-02T14:20:00.000Z",
            updatedAt: "2023-11-06T10:15:00.000Z",
            budget: 300,
            type: "like",
            subOrders: [
              {
                id: "suborder-2-1",
                orderId: "order-2",
                userId: "user-3",
                userName: "用户3",
                status: "processing",
                submitTime: "2023-11-05T09:30:00.000Z",
                reward: 75
              },
              {
                id: "suborder-2-2",
                orderId: "order-2",
                userId: "user-4",
                userName: "用户4",
                status: "pending",
                reward: 75
              },
              {
                id: "suborder-2-3",
                orderId: "order-2",
                userId: "user-5",
                userName: "用户5",
                status: "pending",
                reward: 75
              }
            ]
          },
          {
            id: "order-3",
            orderNumber: "ORD-2023-0003",
            title: "内容分享传播",
            description: "将指定内容分享到个人社交账号，要求有一定的粉丝基础，分享后需保留至少7天。",
            status: "reviewing",
            createdAt: "2023-11-03T09:15:00.000Z",
            updatedAt: "2023-11-07T14:45:00.000Z",
            budget: 800,
            type: "share",
            subOrders: [
              {
                id: "suborder-3-1",
                orderId: "order-3",
                userId: "user-6",
                userName: "用户6",
                status: "reviewing",
                submitTime: "2023-11-06T16:20:00.000Z",
                reward: 200,
                screenshots: ["https://picsum.photos/202/202", "https://picsum.photos/203/203"]
              },
              {
                id: "suborder-3-2",
                orderId: "order-3",
                userId: "user-7",
                userName: "用户7",
                status: "completed",
                submitTime: "2023-11-05T11:10:00.000Z",
                reviewTime: "2023-11-07T10:30:00.000Z",
                reward: 200,
                screenshots: ["https://picsum.photos/204/204"]
              }
            ]
          },
          {
            id: "order-4",
            orderNumber: "ORD-2023-0004",
            title: "市场调研问卷",
            description: "完成一份关于产品使用体验的市场调研问卷，需真实填写个人使用感受和建议。",
            status: "pending",
            createdAt: "2023-11-04T16:40:00.000Z",
            updatedAt: "2023-11-04T16:40:00.000Z",
            budget: 200,
            type: "other",
            subOrders: [
              {
                id: "suborder-4-1",
                orderId: "order-4",
                userId: "user-8",
                userName: "用户8",
                status: "pending",
                reward: 100
              },
              {
                id: "suborder-4-2",
                orderId: "order-4",
                userId: "user-9",
                userName: "用户9",
                status: "pending",
                reward: 100
              }
            ]
          },
          {
            id: "order-5",
            orderNumber: "ORD-2023-0005",
            title: "产品测试反馈",
            description: "试用新产品并提供详细的使用体验反馈和改进建议。",
            status: "completed",
            createdAt: "2023-11-05T11:30:00.000Z",
            updatedAt: "2023-11-08T09:20:00.000Z",
            budget: 600,
            assignedTo: "用户10",
            type: "other",
            subOrders: [
              {
                id: "suborder-5-1",
                orderId: "order-5",
                userId: "user-10",
                userName: "用户10",
                status: "completed",
                submitTime: "2023-11-07T15:45:00.000Z",
                reviewTime: "2023-11-08T09:20:00.000Z",
                reward: 600,
                content: "产品使用体验不佳，存在多个功能问题。",
                screenshots: ["https://picsum.photos/205/205"]
              }
            ]
          }
        ];

        setOrders(mockOrders);
      } catch (err) {
        setError('获取订单数据失败，请稍后重试。');
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 处理搜索
  const handleSearch = () => {
    // 搜索逻辑已在 useEffect 中实现，这里可以添加其他搜索相关的操作
    console.log('搜索关键词:', searchTerm);
  };

  // 处理日期范围选择器显示/隐藏已在顶部定义
  
  // 点击外部关闭日历组件
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker && datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
  
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // 过滤和排序订单
  useEffect(() => {
    let result = [...orders];

    // 搜索过滤
    if (searchTerm) {
      result = result.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // 日期范围过滤
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
      
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // 排序
    result.sort((a, b) => {
      if (sortBy === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'budget') {
        return sortDirection === 'asc' ? a.budget - b.budget : b.budget - a.budget;
      } else if (sortBy === 'status') {
        const statusOrder: Record<string, number> = {
          pending: 1,
          processing: 2,
          reviewing: 3,
          completed: 4,
          rejected: 5,
          cancelled: 6
        };
        return sortDirection === 'asc' 
          ? statusOrder[a.status] - statusOrder[b.status] 
          : statusOrder[b.status] - statusOrder[a.status];
      }
      return 0;
    });

    setFilteredOrders(result);
    setCurrentPage(1); // 重置到第一页
  }, [orders, searchTerm, statusFilter, dateRange, sortBy, sortDirection]);

  // 获取当前页的订单
  const getCurrentOrders = () => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filteredOrders.slice(indexOfFirstRecord, indexOfLastRecord);
  };

  // 计算总页数
  const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 处理排序变化
  const handleSort = (field: 'createdAt' | 'budget' | 'status') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // 刷新订单数据
  const handleRefresh = () => {
    // 重新获取数据的逻辑
    setLoading(true);
    // 在实际应用中，这里会重新调用API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // 处理导出订单
  const handleExport = () => {
    // 导出订单的逻辑
    alert('导出订单功能将在后续实现');
  };

  // 复制订单号的状态管理
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(null);
  useEffect(() => {
    if (copiedOrderNumber) {
      const timer = setTimeout(() => {
        setCopiedOrderNumber(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedOrderNumber]);

  // 查看订单详情
  const viewOrderDetails = (orderId: string) => {
    router.push(`/publisher/orders/task-detail/${orderId}`);
  };

  // 复制订单号并显示成功提示
  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopiedOrderNumber(orderNumber);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取状态对应的中文名称和样式
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: { text: '待处理', className: 'bg-yellow-100 text-yellow-800' },
      processing: { text: '进行中', className: 'bg-blue-100 text-blue-800' },
      reviewing: { text: '审核中', className: 'bg-purple-100 text-purple-800' },
      completed: { text: '已完成', className: 'bg-green-100 text-green-800' },
      rejected: { text: '已拒绝', className: 'bg-red-100 text-red-800' },
      cancelled: { text: '已取消', className: 'bg-gray-100 text-gray-800' }
    };
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
  };

  // 获取任务类型对应的评论类型文本
  const getTypeIcon = (type: string) => {
    // 假设这里根据类型返回评论类型，实际实现可能需要根据具体数据结构调整
    // 由于需要显示"上评评论""中评评论""上中评评论""中下评评论"，这里使用模拟逻辑
    // 实际应用中应根据订单的具体评论类型字段返回对应的文本
    switch (type) {
      case 'comment_positive':
        return <span className="text-blue-500">上评评论</span>;
      case 'comment_medium':
        return <span className="text-blue-500">中评评论</span>;
      case 'comment_positive_medium':
        return <span className="text-blue-500">上中评评论</span>;
      case 'comment_medium_negative':
        return <span className="text-blue-500">中下评评论</span>;
      case 'comment':
      case 'like':
      case 'share':
        // 对于现有的任务类型，返回默认评论类型
        return <span className="text-blue-500">上评评论</span>;
      default:
        return <span className="text-blue-500">上评评论</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-4 px-2">
          <div className="bg-white shadow-sm rounded-lg p-2">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded-md"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded-md"></div>
                ))}
              </div>
              <div className="h-10 bg-gray-200 rounded-md w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-7xl mx-auto py-4 px-2">
          <div className="bg-white shadow-sm rounded-lg p-2">
            <div className="flex flex-col items-center justify-center space-y-4">
              <ExclamationCircleOutlined className="h-12 w-12 text-red-500" />
              <p className="mb-2text-lg font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ReloadOutlined className="h-4 w-4 mr-2" />
                重试
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 获取子订单各状态的统计数据
  const getSubOrderStats = (subOrders: SubOrder[]) => {
    const stats = {
      total: subOrders.length,
      pending: subOrders.filter(sub => sub.status === 'pending').length,
      processing: subOrders.filter(sub => sub.status === 'processing').length,
      reviewing: subOrders.filter(sub => sub.status === 'reviewing').length,
      completed: subOrders.filter(sub => sub.status === 'completed').length,
      rejected: subOrders.filter(sub => sub.status === 'rejected').length
    };
    return stats;
  };

  // 检查主订单是否所有子订单都已完成
  const isOrderFullyCompleted = (order: Order) => {
    return order.status === 'completed' && order.subOrders.every(sub => sub.status === 'completed');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        <div className="">
          {/* 操作栏 */}
          <div className="bg-white shadow-sm mb-1">
            {/* 第一行：搜索框和搜索按钮 */}
            <div className="flex items-center space-x-3 mb-1 p-2">
              <div className="flex-grow">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchOutlined className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="搜索订单号、标题或描述"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <button 
                onClick={handleSearch} 
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md whitespace-nowrap"
              >
                搜索
              </button>
            </div>
            
            {/* 第二行：状态筛选和日期筛选 */}
            <div className="flex flex-wrap items-center space-x-3 p-2">
               {/* 日期筛选按钮和选择器 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  <CalendarOutlined className="h-4 w-4 mr-2" />
                  {dateRange ? `${dateRange.start.split('-')[1]}/${dateRange.start.split('-')[2]} 至 ${dateRange.end.split('-')[1]}/${dateRange.end.split('-')[2]}` : '日期'}
                  <DownOutlined className={`h-4 w-4 ml-2 ${showDatePicker ? 'transform rotate-180' : ''}`} />
                </button>
                
                {/* 日期选择器弹窗 */}
                {showDatePicker && (
                  <div ref={datePickerRef} className="absolute z-10 mt-1 bg-white rounded-md shadow-lg p-2 border border-gray-200 w-[270px] w-max-[300px] left-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">开始日期</label>
                        <input
                          type="date"
                          value={dateRange?.start || ''}
                          onChange={(e) => setDateRange({ start: e.target.value, end: dateRange?.end || '' })}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">结束日期</label>
                        <input
                          type="date"
                          value={dateRange?.end || ''}
                          onChange={(e) => setDateRange({ start: dateRange?.start || '', end: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3 space-x-2">
                      <button
                        onClick={() => {
                          setDateRange({ start: '', end: '' });
                          setShowDatePicker(false);
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50"
                      >
                        重置
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                      >
                        确定
                      </button>
                    </div>
                  </div>
                )}
              </div>


              {/* 状态筛选 */}
              <select 
                 value={statusFilter} 
                 onChange={(e) => setStatusFilter(e.target.value)} 
                 className="px-3 py-2 pr-8 border border-gray-300 text-sm rounded-md whitespace-nowrap appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               >
                <option value="all">全部状态</option>
                <option value="pending">待领取</option>
                <option value="processing">进行中</option>
                <option value="reviewing">审核中</option>
                <option value="completed">已完成</option>
              </select>
              
             
            </div>
          </div>
          
          {/* 订单列表 */}
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              <p className="font-medium">加载失败</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg p-2">
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <p>暂无订单数据</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-2 border border-gray-200 rounded-sm hover:shadow-md transition-shadow">
                      {/* 订单号和复制按钮 */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium">订单号：</span>
                            <span>{order.orderNumber}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">创建时间：{formatDate(order.createdAt)}</div>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={() => copyOrderNumber(order.orderNumber)}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          >
                            <CopyOutlined className="h-4 w-4 mr-1" />
                            复制
                          </button>
                          {copiedOrderNumber === order.orderNumber && (
                            <div className="absolute -top-8 right-0 bg-green-600 text-white text-xs px-2 py-1 rounded shadow">
                              复制成功
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 订单标题和状态 */}
                      <div className="mb-1">
                        <h3 className="font-semibold text-lg mb-1">订单描述</h3>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.status).className} mb-1 block`}>
                            {getStatusInfo(order.status).text}
                          </span>
                          <div className="flex items-center">
                            {getTypeIcon(order.type)}
                          </div>
                        </div>
                      </div>
                        
                      {/* 预算信息 */}
                      <div className="mb-1">
                        <div className="font-medium">
                          总预算：¥{order.budget}
                        </div>
                      </div>
                        
                      {/* 子订单统计 */}
                      <div className="bg-gray-50 p-2 rounded-md mb-1 text-center">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">子订单状态统计：</span>
                          <span className="text-xs text-gray-500">共 {getSubOrderStats(order.subOrders).total} 个子订单</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                              待处理：
                            </div>
                            <div className='text-center'>{getSubOrderStats(order.subOrders).pending}</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                              进行中：
                            </div>
                            <div className='text-center'>{getSubOrderStats(order.subOrders).processing}</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                              审核中：
                            </div>
                            <div className='text-center'>{getSubOrderStats(order.subOrders).reviewing}</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                              已完成：
                            </div>
                            <div className='text-center'>{getSubOrderStats(order.subOrders).completed}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => viewOrderDetails(order.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          查看详情
                        </button>
                        {isOrderFullyCompleted(order) && (
                          <button
                            onClick={() => router.push(`/publisher/create/supplementaryorder?id=${order.id}`)}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                          >
                            再次下单
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublisherOrdersPage;