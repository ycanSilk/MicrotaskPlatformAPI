import React from 'react';
import OrderHeaderTemplate from './OrderHeaderTemplate';
import AuditOrderCard from '../../../../components/task/sub-order/AuditOrderCard';

interface PendingOrder {
  id: string;
  taskTitle: string;
  commenterName: string;
  submitTime: string;
  content: string;
  images: string[];
  status: string;
  orderNumber?: string;
  updatedTime?: string;
}

interface AuditTabProps {
  pendingOrders: PendingOrder[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  handleOrderReview: (orderId: string, action: 'approve' | 'reject') => void;
  openImageViewer: (imageUrl: string) => void;
  filterRecentOrders: (tasks: any[]) => any[];
  searchOrders: (tasks: any[]) => any[];
  sortAuditTasks: (tasks: any[]) => any[];
  onViewAllClick: () => void;
}

const AuditTab: React.FC<AuditTabProps> = ({
  pendingOrders,
  searchTerm,
  setSearchTerm,
  handleSearch,
  sortBy,
  setSortBy,
  handleOrderReview,
  openImageViewer,
  filterRecentOrders,
  searchOrders,
  sortAuditTasks,
  onViewAllClick
}) => {
  // 复制订单号功能
  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      // 创建临时提示元素
      const tooltip = document.createElement('div');
      tooltip.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      tooltip.innerText = '订单号已复制';
      document.body.appendChild(tooltip);
      // 2秒后移除提示
      setTimeout(() => {
        document.body.removeChild(tooltip);
      }, 2000);
    }).catch(() => {
      // 静默处理复制失败
    });
  };

  // 获取过滤和搜索后的订单
  const filteredOrders = sortAuditTasks(searchOrders(filterRecentOrders(pendingOrders)));

  return (
    <div className="mx-4 mt-6 space-y-4">
      {/* 使用标准模板组件 */}
      <OrderHeaderTemplate
        title="待审核的订单"
        totalCount={pendingOrders.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewAllUrl="/publisher/orders"
        onViewAllClick={onViewAllClick}
      />
      
      {/* 子订单列表 - 使用封装的AuditOrderCard组件 */}
      {filteredOrders.map((order, index) => (
        <AuditOrderCard
          key={`pending-${order.id}-${index}`}
          order={order}
          onCopyOrderNumber={handleCopyOrderNumber}
          onOrderReview={handleOrderReview}
          onImageClick={openImageViewer}
        />
      ))}
    </div>
  );
};

export default AuditTab;