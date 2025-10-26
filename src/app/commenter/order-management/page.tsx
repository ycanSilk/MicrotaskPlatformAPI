'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneOutlined } from '@ant-design/icons';
import Link from 'next/link';

// 定义订单状态类型
type OrderStatus = '进行中' | '待审核' | '已完成' | '异常订单';

// 定义订单接口
interface Order {
  id: string;
  orderNo: string;
  parentOrderNo: string;
  title: string;
  price: number;
  status: OrderStatus;
  publishTime: string;
  deadline?: string;
  submitTime?: string;
  completedTime?: string;
  taskType: string;
  taskRequirements: string;
}

// 获取状态对应的标签颜色
const getStatusTagColor = (status: OrderStatus): string => {
  const statusColors = {
    '进行中': 'bg-blue-100 text-blue-600',
    '待审核': 'bg-orange-100 text-orange-600',
    '已完成': 'bg-green-100 text-green-600',
    '异常订单': 'bg-red-100 text-red-600'
  };
  return statusColors[status];
};

// 任务类型映射函数 - 将英文taskType转换为中文名称
const getTaskTypeName = (taskType?: string): string => {
  const taskTypeMap: Record<string, string> = {
    'comment_middle': '中下评评论',
    'account_rental': '账号出租',
    'video_send': '视频分享'
  };
  return taskTypeMap[taskType || ''] || taskType || '评论';
};

const OrderManagementPage = () => {
  const router = useRouter();
  // 标签页选项扩展，添加全部选项
  const [activeTab, setActiveTab] = useState<'全部' | OrderStatus>('全部');
  const [selectedMonth, setSelectedMonth] = useState<string>('全部');
  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);
  
  // 日历相关状态
  const [showDateRange, setShowDateRange] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  const [selectedDateRange, setSelectedDateRange] = useState<{start: string, end: string} | null>(null);
  
  // 当前日历显示的年月
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  
  // 选中的日期范围
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  
  // 日历显示状态 - 默认关闭
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  
  // 定义日历天的数据结构
  interface CalendarDay {
    date: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }
  
  // 生成月份数据（近6个月 + 全部）
  const generateMonthOptions = () => {
    const options = ['全部'];
    const now = new Date();
    
    // 添加近6个月
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      options.push(monthStr);
    }
    
    return options;
  };
  
  const monthOptions = generateMonthOptions();
  
  // 切换月份下拉框显示状态
  const toggleMonthDropdown = () => {
    setShowMonthDropdown(!showMonthDropdown);
  };
  
  // 选择月份
  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setSelectedDateRange(null); // 清除日期范围选择
    setShowMonthDropdown(false);
  };
  
  // 生成日历天数
  const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const today = new Date();
    
    // 获取上个月需要显示的天数
    const prevMonthDays = firstDay.getDay(); // 0-6，0是星期日
    const prevMonthLastDay = new Date(year, month - 1, 0);
    
    // 添加上个月的天数
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay.getDate() - i,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // 添加当前月的天数
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const isToday = today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === i;
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday
      });
    }
    
    // 添加下个月的天数，补足6行（42天）
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  
  // 切换月份
  const changeCalendarMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDates([]); // 重置选中的日期
  };
  
  // 获取日期按钮的样式类
  const getDateButtonClass = (day: CalendarDay) => {
    if (!day.isCurrentMonth) {
      return 'text-gray-200';
    }
    
    const isSelected = selectedDates.includes(day.date);
    
    return isSelected ? 'bg-red-500 text-white' : 'text-gray-800 hover:bg-gray-100';
  };
  
  // 处理日期选择
  const handleDateSelect = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    
    // 简单的单选逻辑，可以扩展为范围选择
    setSelectedDates([day.date]);
  };
  
  // 日历取消
  const handleCalendarCancel = () => {
    setSelectedDates([]);
    setDateRange({start: '', end: ''});
  };
  
  // 日历确认
  const handleCalendarConfirm = () => {
    if (showDateRange && dateRange.start && dateRange.end) {
      // 设置日期范围
      setSelectedDateRange(dateRange);
      setSelectedMonth('全部'); // 清除月份选择
    } else if (selectedDates.length > 0) {
      // 处理月份内日期选择
      const selectedMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      setSelectedMonth(selectedMonthStr);
      setSelectedDateRange(null); // 清除日期范围选择
    }
  };
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 点击外部区域关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
      }
    };
    
    // 添加事件监听
    document.addEventListener('mousedown', handleClickOutside);
    
    // 清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNo: 'COM20240620001',
      parentOrderNo: 'PUB20240620001',
      title: '中下评评论',
      price: 6.00,
      status: '进行中',
      publishTime: '2025-10-20 10:30:00',
      deadline: '2025-10-23 23:59:59',
      taskType: 'comment_middle',
      taskRequirements: '1. 查看指定视频 2. 发表中下评评论 3. 评论需包含关键词'
    },
    {
      id: '2',
      orderNo: 'COM20240619002',
      parentOrderNo: 'PUB20240619002',
      title: '中下评评论',
      price: 5.88,
      status: '待审核',
      publishTime: '2025-10-19 15:20:00',
      submitTime: '2025-10-20 09:45:00',
      taskType: 'comment_middle',
      taskRequirements: '1. 查看指定视频 2. 发表中下评评论 3. 评论需包含关键词'
    },
    {
      id: '3',
      orderNo: 'COM20240618003',
      parentOrderNo: 'PUB20240618003',
      title: '中评评论',
      price: 8.50,
      status: '已完成',
      publishTime: '2025-10-18 09:15:00',
      submitTime: '2025-10-19 11:30:00',
      completedTime: '2025-10-20 16:45:00',
      taskType: 'comment_middle',
      taskRequirements: '1. 查看指定视频 2. 发表中下评评论 3. 评论需包含关键词'
    },
    {
      id: '4',
      orderNo: 'COM20240617004',
      parentOrderNo: 'PUB20240617004',
      title: '上评评论',
      price: 7.20,
      status: '异常订单',
      publishTime: '2025-10-17 14:30:00',
      submitTime: '2025-10-18 10:20:00',
      taskType: 'comment_top',
      taskRequirements: '1. 查看指定视频 2. 发表上评评论 3. 评论需包含关键词'
    },
    {
      id: '5',
      orderNo: 'COM20240616005',
      parentOrderNo: 'PUB20240616005',
      title: '上中评评论',
      price: 12.00,
      status: '进行中',
      publishTime: '2025-10-16 11:20:00',
      deadline: '2025-10-22 23:59:59',
      taskType: 'comment_top_middle',
      taskRequirements: '1. 查看指定视频 2. 发表上中评评论 3. 评论需包含关键词'
    }
  ]);

  // 复制订单号功能
  const copyOrderNo = (orderNo: string) => {
    navigator.clipboard.writeText(orderNo).then(() => {
      alert('订单号已复制');
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  };

  // 处理联系客服
  const handleContactService = (orderId: string) => {
    console.log('联系客服，订单ID:', orderId);
    alert('即将为您连接客服，请稍候...');
  };

  // 过滤订单（状态 + 月份/日期范围）
  const filteredOrders = orders.filter(order => {
    // 如果是"全部"标签，则不进行状态过滤
    const statusMatch = activeTab === '全部' || order.status === activeTab;
    let dateMatch = true;
    
    if (selectedDateRange) {
      // 日期范围过滤
      const orderDate = order.publishTime.split(' ')[0]; // 只取日期部分
      dateMatch = orderDate >= selectedDateRange.start && orderDate <= selectedDateRange.end;
    } else if (selectedMonth !== '全部') {
      // 月份过滤
      dateMatch = order.publishTime.startsWith(selectedMonth);
    }
    
    return statusMatch && dateMatch;
  });
  
  // 切换日历显示状态
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  // 选项卡配置
  const tabItems: ('全部' | OrderStatus)[] = ['全部', '进行中', '待审核', '已完成', '异常订单'];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 标签页切换栏组件 - 参考图片1的样式 */}
      <div className="bg-white p-2 mb-4 w-full">
        <div className="flex">
          {tabItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`p-2 mr-1 text-sm font-medium relative transition-colors ${activeTab === item ? 'text-red-500' : 'text-gray-600'}`}
            >
              <span>{item}</span>
              {activeTab === item && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 日历选择组件 */}
      <div className="mb-4">
        {/* 日历触发按钮 */}
        <button 
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm flex items-center shadow-sm hover:border-gray-400 transition-colors"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          {selectedDateRange ? 
            `日期范围：${selectedDateRange.start} 至 ${selectedDateRange.end}` : 
            '选择日期范围'}
          <span className={`ml-2 transform transition-transform ${showCalendar ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {/* 展开的日历面板 */}
        {showCalendar && (
          <div className="bg-white p-4 mt-1 rounded-lg shadow-md border border-gray-200">
            {/* 日期范围选择视图 */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">开始日期：</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">结束日期：</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => setShowCalendar(false)}
              >
                关闭
              </button>
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                onClick={() => {
                  if (dateRange.start && dateRange.end) {
                    // 设置日期范围
                    setSelectedDateRange(dateRange);
                    setSelectedMonth('全部'); // 清除月份选择
                    setShowCalendar(false); // 选择后关闭面板
                  }
                }}
              >
                确定
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 订单列表 */}
      <div className="space-y-4 mb-2 p-3">
        {filteredOrders.map((order) => (
          <Link href={`/commenter/order-management/${order.id}`} key={order.id}>
            <div className="bg-white rounded-lg p-4 shadow-sm transition-all hover:shadow-md cursor-pointer mb-3">
              {/* 订单头部信息 */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-black">订单号：{order.orderNo}</span>
                <button 
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyOrderNo(order.orderNo);
                  }}
                  style={{ fontSize: '12px' }}
                >
                  复制
                </button>
              </div>

              {/* 订单详细信息 */}
              <div className="py-3">
                {/* 状态和价格在同一行，状态在左侧 */}
                <div className="flex justify-between items-center mb-3">
                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusTagColor(order.status)}`}>
                    {order.status}
                  </div>
                  <span className="text-lg font-bold text-red-500">¥{order.price.toFixed(2)}</span>
                </div>
                
                {/* 时间信息 - 删除任务类型显示 */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500">发布时间：{order.publishTime}</span>
                  </div>
                  
                  {/* 根据状态显示不同的时间信息 */}
                  {order.status === '进行中' && order.deadline && (
                    <div className="text-sm text-gray-500">截止时间：{order.deadline}</div>
                  )}
                  {order.status === '待审核' && order.submitTime && (
                    <div className="text-sm text-gray-500">提交时间：{order.submitTime}</div>
                  )}
                  {order.status === '已完成' && order.completedTime && (
                    <div className="text-sm text-gray-500">完成时间：{order.completedTime}</div>
                  )}
                  {order.status === '异常订单' && order.submitTime && (
                    <div className="text-sm text-gray-500">提交时间：{order.submitTime}</div>
                  )}
                </div>
                
                {/* 任务要求摘要 */}
                <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                  任务要求：{order.taskRequirements}
                </div>
              </div>
              
              {/* 操作按钮区域 */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContactService(order.id);
                  }}
                  className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                >
                  联系客服
                </button>
                <div className="text-sm text-gray-500">
                  父订单号：{order.parentOrderNo}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* 如果没有订单 */}
        {filteredOrders.length === 0 && (
          <div className="bg-white p-8 text-center rounded-lg">
            <p className="text-sm text-gray-500">暂无订单</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagementPage;