import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types';

interface ReorderButtonProps {
  order?: Order;
  taskId?: string;
  className?: string;
}

/**
 * 补单按钮组件 - 提供补单功能，点击直接跳转至补单页面
 */
const ReorderButton: React.FC<ReorderButtonProps> = ({ order, taskId, className = '' }) => {
  const router = useRouter();

  const handleReorder = () => {
    // 构建查询参数
    const queryParams = new URLSearchParams({
      reorder: 'true',
    });
    
    // 如果有订单对象，使用订单信息
    if (order) {
      // 模拟增加10个子订单
      const updatedSubOrderCount = order.subOrders.length + 10;
      console.log(`为订单 ${order.id} 增加子订单，新数量: ${updatedSubOrderCount}`);
      
      // 添加更多订单信息到查询参数
      queryParams.set('orderId', order.id);
      queryParams.set('title', order.title);
      queryParams.set('description', order.description);
      queryParams.set('type', order.type);
      queryParams.set('budget', order.budget.toString());
      queryParams.set('subOrderCount', updatedSubOrderCount.toString());
    }
    // 如果只有taskId
    else if (taskId) {
      queryParams.set('taskId', taskId);
      console.log(`为任务 ${taskId} 发起补单请求`);
    }
    
    // 构建完整路径并使用as any绕过typedRoutes的严格类型检查
    const path = `/publisher/create/supplementaryorder/?${queryParams.toString()}`;
    router.push(path as any);
  };

  return (
    <button
      onClick={handleReorder}
      className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors w-full ${className}`}
    >
      补单
    </button>
  );
};

export default ReorderButton;