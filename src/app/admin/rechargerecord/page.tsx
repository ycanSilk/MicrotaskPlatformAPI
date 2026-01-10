'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface RECHARGEalRecord {
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

const RECHARGEalListPage = () => {
  const router = useRouter();

  const [originalRecords, setOriginalRecords] = useState<RECHARGEalRecord[]>([]); // 保存原始数据
  const [records, setRecords] = useState<RECHARGEalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 获取提现记录数据
  useEffect(() => {
    const fetchRECHARGEalRecords = async () => {
      setLoading(true);
      try {
        // 调用真实API获取提现记录
        const response = await fetch('/api//walletmanagement/transactionrecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionType: 'RECHARGE',
            page: 1,
            size: 10
          })
        });

        if (!response.ok) {
          throw new Error('获取提现记录失败');
        }

        const data = await response.json();
        setOriginalRecords(data.data.list || []); // 保存原始数据
        setRecords(data.data.list || []); // 初始显示所有数据
      } catch (error) {
        console.error('获取提现记录失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRECHARGEalRecords();
  }, []);

  // 搜索功能
  const handleSearch = () => {
    // 这里可以添加实际的搜索API调用逻辑
    // 目前暂时使用本地过滤
    const filtered = originalRecords.filter(record => {
      const matchesSearch = !searchKeyword || record.orderNo.includes(searchKeyword) || record.description.includes(searchKeyword);
      const matchesDate = (!startDate || new Date(record.createTime) >= new Date(startDate)) && (!endDate || new Date(record.createTime) <= new Date(endDate));
      return matchesSearch && matchesDate;
    });
    setRecords(filtered);
  };

  // 根据日期范围过滤记录
  useEffect(() => {
    // 当日期范围变化时自动过滤记录
    const filtered = originalRecords.filter(record => {
      return (!startDate || new Date(record.createTime) >= new Date(startDate)) && (!endDate || new Date(record.createTime) <= new Date(endDate));
    });
    setRecords(filtered);
  }, [startDate, endDate, originalRecords]);

  // 默认只显示成功的充值记录
  const filteredRecords = records.filter(record => record.status === 'SUCCESS');

  // 获取状态文本和样式
  const getStatusInfo = (status: string, statusDescription: string) => {
    // 根据status设置颜色
    let color = 'bg-gray-100 text-gray-800 border-gray-200';
    if (status === 'PENDING' || status.includes('PENDING') || status.includes('processing')) {
      color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (status === 'SUCCESS' || status.includes('success') || status.includes('SUCCESS')) {
      color = 'bg-green-100 text-green-800 border-green-200';
    } else if (status === 'FAILED' || status.includes('failed') || status.includes('error')) {
      color = 'bg-red-100 text-red-800 border-red-200';
    } else if (status === 'CANCELLED' || status.includes('cancelled') || status.includes('cancel')) {
      color = 'bg-gray-100 text-gray-800 border-gray-200';
    }
    // 使用statusDescription作为显示文本，如果没有则使用默认
    const text = statusDescription || '未知状态';
    return { text, color };
  };



  // 处理记录点击，跳转到详情页并传递数据
  const handleRecordClick = (record: RECHARGEalRecord) => {
    console.log('【列表页】准备传递的数据:', record);
    console.log('【列表页】路由push参数:', {
      pathname: `/commenter/RECHARGEal/detail/${record.orderNo}`,
      state: record
    });
    (router as any).push(`/commenter/RECHARGEal/detail/${record.orderNo}`, { state: record });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <button 
            onClick={() => router.back()} 
            className="mr-2 p-1 rounded-full hover:bg-gray-200"
          >
            ←
          </button>
          <h1 className="text-xl font-medium">提现记录</h1>
        </div>
        
        {/* 搜索功能区域 */}
        <div className="mt-4 flex space-x-4">
          <input
            type="text"
            placeholder="搜索订单号或描述"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            搜索
          </button>
        </div>
        
        {/* 日期筛选组件 */}
        <div className="mt-4">
          <div>
            <div><label className="text-sm font-medium text-gray-700 mb-1">开始日期</label></div>
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>      
          </div>
          <div>
            <div><label className="text-sm font-medium text-gray-700 mb-1">结束日期</label></div>
            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>      
          </div>
        </div>
      </div>
        


      {/* 充值记录列表 */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="">加载中...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg">
          <p className="">暂无提现记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(record => {
            const statusInfo = getStatusInfo(record.status, record.statusDescription);
            return (
              <Card 
                key={record.orderNo}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRecordClick(record)}
              >
                <div className="">
                  <div className="flex justify-end mb-1">
                    <span className={`px-2 py-1 rounded text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
                  </div>   
                    <p>订单号: {record.orderNo}</p>    
                    <p>充值到: {record.channel === 'ALIPAY' ? '支付宝' : '银行卡'}</p>                                 
                    <p>充值金额: ¥{record.amount.toFixed(2)}</p>                         
                    <p>申请时间: {new Date(record.createTime).toLocaleString('zh-CN')}</p>                    
                    <p>充值时间: {new Date(record.updateTime).toLocaleString('zh-CN')}</p>
                    <p>充值备注：{record.typeDescription}</p>               
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RECHARGEalListPage;