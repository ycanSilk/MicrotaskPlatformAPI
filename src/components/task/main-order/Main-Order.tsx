import React from 'react';
import { useRouter } from 'next/navigation';
import { EditOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { Order, SubOrder } from '../../../types';

interface MainOrderCardProps {
  order: Order;
  onCopyOrderNumber?: (orderNumber: string) => void;
  onViewDetails?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  copiedOrderNumber?: string | null;
}

const MainOrderCard: React.FC<MainOrderCardProps> = ({
  order,
  onCopyOrderNumber,
  onViewDetails,
  onReorder,
  copiedOrderNumber
}) => {
  const router = useRouter();

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





  // 计算完成进度
  const subOrderStats = getSubOrderStats(order.subOrders);
  const completionRate = subOrderStats.total > 0 
    ? Math.round((subOrderStats.completed / subOrderStats.total) * 100) 
    : 0;

  // 处理复制订单号
  const handleCopyOrderNumber = () => {
    if (onCopyOrderNumber) {
      onCopyOrderNumber(order.orderNumber);
    }
  };

  // 处理查看详情
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(order.id);
    } else {
      router.push(`/publisher/orders/task-detail/${order.id}`);
    }
  };

  // 处理补单
  const handleReorder = () => {
    if (onReorder) {
      onReorder(order.id);
    } else {
      // 跳转到新的补单页面
      router.push(`/publisher/create/supplementaryorder?reorder=true&orderId=${order.id}&title=${encodeURIComponent(order.title)}&description=${encodeURIComponent(order.description)}&type=${order.type}&budget=${order.budget.toString()}&subOrderCount=${order.subOrders.length}`);
    }
  };

  return (
    <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-2 bg-white">
      <div className="flex items-center mb-1 overflow-hidden">
        <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate text-black text-sm">
          订单号：{order.orderNumber}
        </div>
        <button 
          className="text-blue-600 hover:text-blue-700 whitespace-nowrap text-sm"
          onClick={handleCopyOrderNumber}
        >
          <span>⧉ 复制</span>
        </button>
      </div>
      <div className="flex items-center space-x-3 mb-2 pb-1">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700`}>
          进行中
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          中下评评论
        </span>
      </div>
      <div className="mb-2 text-sm text-black text-sm">
        发布时间：{order.createdAt}
      </div>
      <div className="mb-2 text-sm text-black text-sm ">
        截止时间：{new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')}
      </div>
      <div className="text-black text-sm mb-2 w-full rounded-lg">
          要求：组合任务，中下评评论
      </div>
      <div className="mb-2 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
        <p className='mb-2  text-sm text-blue-600'>任务视频点击进入：</p>
        <a 
          href="http://localhost:3000/publisher/dashboard?tab=active" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center"
          onClick={(e) => {
            e.preventDefault();
            // 在实际应用中，这里应该跳转到抖音视频页面
            window.open('https://www.douyin.com', '_blank');
          }}
        >
          <span className="mr-1">⦿</span> 打开视频
        </a>
        
      </div>
      
      <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-medium text-blue-700"><EditOutlined className="inline-block mr-1" /> 推荐评论</h4>
          <button 
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
            onClick={() => {
                console.log('评论已复制');      
            }}
          >
            <CopyOutlined className="inline-block mr-1" /> 复制评论
          </button>
        </div>
        <p className="text-sm text-black bg-white p-3 rounded border border-blue-100 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3">
        测试评论
        </p>
      </div>

      
     
     <div className="flex gap-2 mb-2">
        <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
          <span className="text-white text-sm mb-1">总价</span>
          <span className="text-white text-sm block">¥{order.budget.toFixed(2)}</span>
        </div>
        <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
          <span className="text-white text-sm mb-1">单价</span>
          <span className="text-white text-sm block">¥{(order.budget / Math.max(subOrderStats.total, 1)).toFixed(2)}</span>
        </div>
        <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
          <span className="text-white text-sm mb-1">订单数</span>
          <span className="text-white text-sm block">{subOrderStats.total}</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex-1"
          onClick={handleViewDetails}
        >
          查看详情
        </button>
        <button 
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex-1"
          onClick={handleReorder}
        >
          补单
        </button>
      </div>
    </div>
  );
};

export default MainOrderCard;