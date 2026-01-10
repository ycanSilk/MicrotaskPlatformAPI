'use client';

import React, { useEffect, useState } from 'react';

// 定义API响应数据类型
interface TransactionRecord {
  orderNo: string;
  transactionType: string;
  typeDescription: string;
  amount: number;
  beforeBalance: number;
  afterBalance: number;
  status: string;
  statusDescription: string;
  description: string;
  channel: string;
  createTime: string;
  updateTime: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: {
    list: TransactionRecord[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

export default function AdminProcessWithdrawPage() {
  // 状态管理
  const [transactionRecords, setTransactionRecords] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // 模态框状态
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedOrderNo, setSelectedOrderNo] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [modalType, setModalType] = useState<'approve' | 'FAILED'>('approve');
  const [processing, setProcessing] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // 获取交易流水记录
  const fetchTransactionRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api//walletmanagement/transactionrecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: 1, size: 10 ,transactionType:'WITHDRAW'}), // 可以根据需要调整页码和每页条数
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setTransactionRecords(data.data.list);
      } else {
        setError(data.message || '获取数据失败');
      }
    } catch (err) {
      setError('网络请求失败，请稍后重试');
      console.error('API请求失败：', err);
    } finally {
      setLoading(false);
    }
  };

  // 在组件挂载时获取数据
  useEffect(() => {
    fetchTransactionRecords();
  }, []);

  // 处理批准提现
  const handleApproveWithdrawal = (orderNo: string) => {
    setModalType('approve');
    setSelectedOrderNo(orderNo);
    setRemark('');
    setModalError(null);
    setIsModalVisible(true);
  };

  // 处理拒绝提现
  const handleRejectWithdrawal = (orderNo: string) => {
    setModalType('FAILED');
    setSelectedOrderNo(orderNo);
    setRemark('');
    setModalError(null);
    setIsModalVisible(true);
  };

  // 处理模态框确认
  const handleModalConfirm = async () => {
    // 输入验证
    if (!remark.trim()) {
      setModalError('请输入审核意见');
      return;
    }

    setProcessing(true);
    setModalError(null);

    // 定义API URL
    const apiUrl = '/api//walletmanagement/processwithdraw';
    // 定义请求参数
    const requestParams = {
        orderNo: selectedOrderNo,
        success: modalType === 'approve' ? 'SUCCESS' : 'FAILED',
        remark: remark.trim(),
      };

    try {
      console.log('=== 提现审核请求开始 ===');
      // 记录请求URL
      console.log('请求URL:', apiUrl);
      // 记录请求参数
      console.log('请求参数:', requestParams);
      // 记录请求状态
      console.log('请求状态:', 'pending');

      // 调用API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestParams),
      });

      // 记录响应状态码
      console.log('响应状态码:', response.status);

      const result = await response.json();

      // 记录完整响应数据
      console.log('完整响应数据:', result);

      if (result.success) {
        // 记录请求状态
        console.log('请求状态:', 'success');
        // 关闭模态框
        setIsModalVisible(false);
        // 刷新订单列表
        await fetchTransactionRecords();
      } else {
        // 记录请求状态
        console.log('请求状态:', 'error');
        setModalError(result.message || '处理失败');
      }
    } catch (err) {
      // 记录请求状态
      console.log('请求状态:', 'error');
      setModalError('网络请求失败，请稍后重试');
      console.error('API请求失败：', err);
    } finally {
      console.log('=== 提现审核请求结束 ===');
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-100 text-blue-600';
      case 'SUCCESS': return 'bg-green-100 text-green-600';
      case 'CANCELLED': return 'bg-green-100 text-green-600';
      case 'FAILED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="pb-20">
      {/* 审核意见模态框 */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-800">
                {modalType === 'approve' ? '确认提现' : '拒绝提现'}
              </h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">审核意见</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入审核意见..."
                />
                {modalError && (
                  <div className="mt-1 text-sm text-red-600">{modalError}</div>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => setIsModalVisible(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors text-sm"
                disabled={processing}
              >
                取消
              </button>
              <button
                onClick={handleModalConfirm}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${modalType === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white ${!remark.trim() || processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!remark.trim() || processing}
              >
                {processing ? (
                  <div className="flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>处理中...</span>
                  </div>
                ) : (
                  '确认'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 提现申请列表 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-800">提现申请管理</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {/* 加载状态 */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : error ? (
              /* 错误状态 */
              <div className="flex justify-center items-center py-8">
                <span className="text-red-600">{error}</span>
              </div>
            ) : transactionRecords.length > 0 ? (
              /* 交易记录列表 */
              transactionRecords.map((record) => (
                <div key={record.orderNo} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-800">{record.description}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(record.status)}`}>
                          {record.statusDescription}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>提现申请编号：{record.orderNo}</div>
                        <div>提现金额：¥{record.amount.toFixed(2)}</div>
                        <div>提现到：{record.channel === 'ALIPAY' ? '支付宝 ' : '银行卡 '}</div>
                        <div>申请时间：{record.createTime}</div>
                        <div>处理时间：{record.updateTime}</div>                
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮（仅在待审核状态显示） */}
                  {record.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveWithdrawal(record.orderNo)}
                        className="flex-1 bg-green-500 text-white py-2 rounded font-medium hover:bg-green-600 transition-colors text-sm"
                      >
                        ✅ 确认提现
                      </button>
                      <button
                        onClick={() => handleRejectWithdrawal(record.orderNo)}
                        className="flex-1 bg-red-500 text-white py-2 rounded font-medium hover:bg-red-600 transition-colors text-sm"
                      >
                        ❌ 拒绝
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* 空数据状态 */
              <div className="flex justify-center items-center py-8">
                <span className="text-gray-500">暂无交易记录</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 提现统计 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">提现统计</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-orange-50 rounded">
              <div className="text-lg font-bold text-orange-600">2</div>
              <div className="text-xs text-gray-500">待审核</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">¥15,678</div>
              <div className="text-xs text-gray-500">今日已处理</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">95.6%</div>
              <div className="text-xs text-gray-500">通过率</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-lg font-bold text-purple-600">2.4小时</div>
              <div className="text-xs text-gray-500">平均处理时间</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
