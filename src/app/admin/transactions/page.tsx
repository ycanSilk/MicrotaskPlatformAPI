'use client';

import React, { useState } from 'react';

// 模拟交易记录数据
type TransactionType = 'deposit' | 'withdrawal' | 'task_payment' | 'commission' | 'revenue';

type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  userInfo: {
    type: 'commenter' | 'publisher';
    id: string;
    name: string;
  };
  relatedId?: string; // 相关任务ID或订单ID
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
};

const mockTransactions: Transaction[] = [
  {
    id: 'TX202405120001',
    type: 'deposit',
    amount: 5000.00,
    userInfo: {
      type: 'publisher',
      id: 'PUB001',
      name: '品牌推广有限公司'
    },
    status: 'completed',
    timestamp: '2024-05-12 09:30:25',
    description: '充值任务发布资金'
  },
  {
    id: 'TX202405120002',
    type: 'task_payment',
    amount: 1875.50,
    userInfo: {
      type: 'publisher',
      id: 'PUB001',
      name: '品牌推广有限公司'
    },
    relatedId: 'TASK12345',
    status: 'completed',
    timestamp: '2024-05-12 10:15:38',
    description: '发布美妆测评任务'
  },
  {
    id: 'TX202405120003',
    type: 'commission',
    amount: 1250.35,
    userInfo: {
      type: 'commenter',
      id: 'COM456',
      name: '评论员小李'
    },
    relatedId: 'TASK12345',
    status: 'completed',
    timestamp: '2024-05-12 11:45:12',
    description: '完成美妆测评任务佣金'
  },
  {
    id: 'TX202405120004',
    type: 'revenue',
    amount: 625.15,
    userInfo: {
      type: 'publisher',
      id: 'PUB001',
      name: '品牌推广有限公司'
    },
    relatedId: 'TASK12345',
    status: 'completed',
    timestamp: '2024-05-12 11:45:12',
    description: '平台服务费'
  },
  {
    id: 'TX202405120005',
    type: 'withdrawal',
    amount: 1000.00,
    userInfo: {
      type: 'commenter',
      id: 'COM456',
      name: '评论员小李'
    },
    status: 'pending',
    timestamp: '2024-05-12 14:20:45',
    description: '提现申请'
  },
  {
    id: 'TX202405120006',
    type: 'deposit',
    amount: 2000.00,
    userInfo: {
      type: 'publisher',
      id: 'PUB002',
      name: '数码科技工作室'
    },
    status: 'completed',
    timestamp: '2024-05-12 15:10:30',
    description: '充值任务发布资金'
  },
  {
    id: 'TX202405120007',
    type: 'task_payment',
    amount: 1500.00,
    userInfo: {
      type: 'publisher',
      id: 'PUB002',
      name: '数码科技工作室'
    },
    relatedId: 'TASK12346',
    status: 'completed',
    timestamp: '2024-05-12 15:30:45',
    description: '发布数码产品体验任务'
  },
  {
    id: 'TX202405120008',
    type: 'withdrawal',
    amount: 500.00,
    userInfo: {
      type: 'commenter',
      id: 'COM789',
      name: '评论员小张'
    },
    status: 'completed',
    timestamp: '2024-05-12 16:45:20',
    description: '提现申请已处理'
  }
];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('today');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 交易类型显示名称
  const getTransactionTypeLabel = (type: TransactionType) => {
    const labels = {
      deposit: '充值',
      withdrawal: '提现',
      task_payment: '任务支付',
      commission: '佣金发放',
      revenue: '平台收入'
    };
    return labels[type];
  };

  // 交易类型对应的颜色
  const getTransactionTypeColor = (type: TransactionType) => {
    const colors = {
      deposit: 'text-green-600',
      withdrawal: 'text-blue-600',
      task_payment: 'text-purple-600',
      commission: 'text-yellow-600',
      revenue: 'text-red-600'
    };
    return colors[type];
  };

  // 交易状态显示名称
  const getTransactionStatusLabel = (status: string) => {
    const labels = {
      completed: '已完成',
      pending: '处理中',
      failed: '失败'
    };
    return labels[status as keyof typeof labels] || status;
  };

  // 交易状态对应的颜色
  const getTransactionStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // 过滤交易记录
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    // 实际应用中这里应该根据日期范围过滤
    // 简化示例中暂不实现日期过滤逻辑
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 分页逻辑
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // 处理分页切换
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">交易记录查询</h1>
        
        {/* 搜索和筛选区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="搜索交易ID、用户或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">全部类型</option>
              <option value="deposit">充值</option>
              <option value="withdrawal">提现</option>
              <option value="task_payment">任务支付</option>
              <option value="commission">佣金发放</option>
              <option value="revenue">平台收入</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="completed">已完成</option>
              <option value="pending">处理中</option>
              <option value="failed">失败</option>
            </select>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setDateRange('today')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${dateRange === 'today' ? 'bg-purple-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              今日
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${dateRange === 'week' ? 'bg-purple-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              本周
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${dateRange === 'month' ? 'bg-purple-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              本月
            </button>
          </div>
        </div>
        
        {/* 交易记录列表 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">相关ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{transaction.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      ¥{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {transaction.userInfo.name} ({transaction.userInfo.id})
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {transaction.relatedId || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                        {getTransactionStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {transaction.timestamp}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {transaction.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                    没有找到匹配的交易记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              显示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} 条，共 {filteredTransactions.length} 条记录
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                上一页
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === pageNum ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 交易概览卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="text-xs text-blue-700 mb-1">今日总交易额</div>
          <div className="text-xl font-bold text-blue-600">¥{mockTransactions.filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString()).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</div>
        </div>
        
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="text-xs text-green-700 mb-1">今日充值金额</div>
          <div className="text-xl font-bold text-green-600">¥{mockTransactions.filter(t => t.type === 'deposit' && new Date(t.timestamp).toDateString() === new Date().toDateString()).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="text-xs text-yellow-700 mb-1">今日提现金额</div>
          <div className="text-xl font-bold text-yellow-600">¥{mockTransactions.filter(t => t.type === 'withdrawal' && new Date(t.timestamp).toDateString() === new Date().toDateString()).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <div className="text-xs text-purple-700 mb-1">今日交易笔数</div>
          <div className="text-xl font-bold text-purple-600">{mockTransactions.filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString()).length}</div>
        </div>
      </div>
    </div>
  );
}