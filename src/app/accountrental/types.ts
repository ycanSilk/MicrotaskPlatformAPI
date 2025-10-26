// 简化的账号租赁信息接口定义
export interface AccountRentalInfo {
  id: string;             // 唯一标识符
  rentalDescription: string; // 租赁描述
  price: number;          // 价格
  publishTime: string;    // 发布时间
  orderNumber: string;    // 订单号
  orderStatus: string;    // 订单状态
  rentalDays: number;     // 出租天数
  images: string[];       // 图片URL数组
}