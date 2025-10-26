// Publisher模块路由配置管理

/**
 * 路由配置项接口
 */
export interface RouteConfig {
  path: string;
  title: string;
  children?: Record<string, RouteConfig>;
  isDynamic?: boolean;
}

/**
 * Publisher模块路由配置
 * 统一管理所有路由路径、标题和层级关系
 */
export const publisherRoutes: Record<string, RouteConfig> = {
  // 主页面
  publisher: {
    path: '/publisher',
    title: '发布者中心'
  },
  
  // Dashboard相关路由
  dashboard: {
    path: '/publisher/dashboard',
    title: '评论订单',
    children: {
      active: { path: '/publisher/dashboard/active', title: '活跃任务' },
      completed: { path: '/publisher/dashboard/completed', title: '已完成任务' },
      audit: { path: '/publisher/dashboard/audit', title: '审核中任务' },
      overview: { path: '/publisher/dashboard/overview', title: '任务概览' },
      taskDetail: { 
        path: '/publisher/dashboard/task-detail', 
        title: '任务详情',
        isDynamic: true
      },
      accountRentalDetail: { 
        path: '/publisher/dashboard/account-rental-detail', 
        title: '账号租赁详情'
      }
    }
  },
  
  // 创建任务相关路由
  create: {
    path: '/publisher/create',
    title: '发布任务',
    children: {
      platformtype: { path: '/publisher/create/platformtype', title: '发布评论' },
      platformTask: {
        path: '/publisher/create/platform-task/douyin',
        title: '发布抖音评论'
      },
      publishTopComment: { 
        path: '/publisher/create/publish-top-comment', 
        title: '发布上评评论'
      },
      publishMiddleComment: { 
        path: '/publisher/create/publish-middle-comment', 
        title: '发布中评评论'
      },
      taskCombinationMiddleBottom: { 
        path: '/publisher/create/task-combination-middle-bottom', 
        title: '发布中下评评论'
      },
      taskCombinationTopMiddle: { 
        path: '/publisher/create/task-combination-top-middle', 
        title: '发布上中评评论'
      },
      taskCombinationAll: { 
        path: '/publisher/create/task-combination-all', 
        title: '发布全类型评论'
      },
      searchKeywordTask: { 
        path: '/publisher/create/search-keyword-task', 
        title: '放大镜搜索'
      },
      supplementaryorder: { 
        path: '/publisher/create/supplementaryorder', 
        title: '补充订单'
      },
      videoSend: { 
        path: '/publisher/create/video-send', 
        title: '视频发送'
      },
      videoTask: { 
        path: '/publisher/create/video-task', 
        title: '视频任务'
      }
    }
  },
  
  // 个人中心相关路由
  profile: {
    path: '/publisher/profile',
    title: '我的',
    children: {
      dataStats: { path: '/publisher/profile/data-stats', title: '数据统计' },
      personalInfo: { path: '/publisher/profile/personal-info', title: '个人信息' },
      settings: { path: '/publisher/profile/settings', title: '个人资料' },
      verification: { path: '/publisher/profile/verification', title: '身份认证' }
    }
  },
  
  // 订单相关路由
  orders: {
    path: '/publisher/orders',
    title: '订单管理',
    children: {
      active: { path: '/publisher/orders/active', title: '活跃订单' },
      taskDetail: { 
        path: '/publisher/orders/task-detail/[id]', 
        title: '订单详情',
        isDynamic: true
      },
      accountRental: { 
        path: '/publisher/orders/account-rental/[id]', 
        title: '账号租赁订单',
        isDynamic: true
      }
    }
  },
  
  // 财务管理相关路由
  finance: {
    path: '/publisher/finance',
    title: '充值'
  },
  
  balance: {
    path: '/publisher/balance',
    title: '余额',
    children: {
      transactionList: { 
        path: '/publisher/balance/transaction-list', 
        title: '余额记录'
      },
      transactionDetails: { 
        path: '/publisher/balance/transaction-details/[id]', 
        title: '账单详情',
        isDynamic: true
      }
    }
  },
  
  transactions: {
    path: '/publisher/transactions',
    title: '充值记录',
    children: {
      transactionDetail: { 
        path: '/publisher/transactions/[id]', 
        title: '充值详情',
        isDynamic: true
      }
    }
  },
  
  bankCards: {
    path: '/publisher/bank-cards',
    title: '银行卡管理',
    children: {
      bankCardList: { 
        path: '/publisher/bank-cards/bank-cardlist/[id]', 
        title: '银行卡详情',
        isDynamic: true
      }
    }
  },
  
  bindBankCard: {
    path: '/publisher/bind-bank-card',
    title: '绑定银行卡'
  },
  
  // 其他路由
  notification: {
    path: '/publisher/notification',
    title: '通知提醒'
  },
  
  douyinVersion: {
    path: '/publisher/douyin-version',
    title: '下载中心'
  },
  
  stats: {
    path: '/publisher/stats',
    title: '统计报表'
  },
  
  taskHistory: {
    path: '/publisher/tasks/history',
    title: '任务历史'
  },
  
  orderManagement: {
    path: '/publisher/order-management',
    title: '订单管理选择'
  }
};

/**
 * 路由层级关系和返回路径映射
 */
export const routeHierarchyMap: Record<string, string> = {
  // 创建任务相关路由层级
  '/publisher/create/platform-task/douyin': '/publisher/create/platformtype',
  '/publisher/create/publish-top-comment': '/publisher/create/platform-task/douyin',
  '/publisher/create/publish-middle-comment': '/publisher/create/platform-task/douyin',
  '/publisher/create/task-combination-middle-bottom': '/publisher/create/platform-task/douyin',
  '/publisher/create/task-combination-top-middle': '/publisher/create/platform-task/douyin',
  '/publisher/create/task-combination-all': '/publisher/create/platform-task/douyin',
  '/publisher/create/search-keyword-task': '/publisher/create/platform-task/douyin',
  '/publisher/create/supplementaryorder': '/publisher/orders',
  '/publisher/create/video-send': '/publisher/create/platform-task/douyin',
  '/publisher/create/video-task': '/publisher/create/platform-task/douyin',
  
  // 订单相关路由层级
  '/publisher/orders/task-detail': '/publisher/orders',
  '/publisher/orders/task-detail/[id]': '/publisher/orders',
  '/publisher/orders/active': '/publisher/orders',
  '/publisher/orders/account-rental': '/publisher/orders',
  '/publisher/orders/account-rental/[id]': '/publisher/orders/account-rental',
  
  // Dashboard相关路由层级
  '/publisher/dashboard/active': '/publisher/dashboard',
  '/publisher/dashboard/completed': '/publisher/dashboard',
  '/publisher/dashboard/audit': '/publisher/dashboard',
  '/publisher/dashboard/overview': '/publisher/dashboard',
  '/publisher/dashboard/task-detail': '/publisher/dashboard',
  '/publisher/dashboard/account-rental-detail': '/publisher/dashboard',
  
  // 个人资料相关路由层级
  '/publisher/profile/data-stats': '/publisher/profile',
  '/publisher/profile/personal-info': '/publisher/profile',
  '/publisher/profile/settings': '/publisher/profile',
  '/publisher/profile/verification': '/publisher/profile',
  
  // 财务相关路由层级
  '/publisher/balance': '/publisher/profile',
  '/publisher/balance/transaction-list': '/publisher/balance',
  '/publisher/balance/transaction-details': '/publisher/balance/transaction-list',
  '/publisher/balance/transaction-details/[id]': '/publisher/balance/transaction-list',
  '/publisher/bank-cards': '/publisher/profile',
  '/publisher/bank-cards/bank-cardlist': '/publisher/bank-cards',
  '/publisher/bank-cards/bank-cardlist/[id]': '/publisher/bank-cards',
  '/publisher/bind-bank-card': '/publisher/bank-cards',
  
  // 其他路由层级
  '/publisher/transactions/[id]': '/publisher/transactions',
  '/publisher/tasks/history': '/publisher/dashboard'
};

/**
 * 发布者模块的一级页面
 */
export const firstLevelPages = [
  '/publisher',
  '/publisher/dashboard',
  '/publisher/profile',
  '/publisher/order-management',
  '/publisher/orders',
  '/publisher/notification',
  '/publisher/douyin-version',
  '/publisher/finance',
  '/publisher/transactions',
  '/publisher/bank-cards',
  '/publisher/stats',
  '/publisher/tasks/history'
];

/**
 * 获取所有路由路径的映射（用于标题查找）
 * @returns 扁平化的路由路径到标题的映射
 */
export const getFlatRouteTitleMap = (): Record<string, string> => {
  const flatMap: Record<string, string> = {};
  
  const traverseRoutes = (routes: Record<string, RouteConfig>) => {
    Object.values(routes).forEach(route => {
      flatMap[route.path] = route.title;
      if (route.children) {
        traverseRoutes(route.children);
      }
    });
  };
  
  traverseRoutes(publisherRoutes);
  return flatMap;
};

/**
 * 动态路由模式配置
 */
export const dynamicRoutePatterns = [
  // 订单详情动态路由
  { 
    pattern: /^publisher\/orders\/task-detail\/(.*)$/, 
    target: '/publisher/orders' 
  },
  // 订单子详情动态路由
  { 
    pattern: /^publisher\/orders\/task-detail\/.*\/suborders-detail\/(.*)$/, 
    target: (path: string) => {
      const match = path.match(/^(publisher\/orders\/task-detail\/[^/]+)/);
      return match ? `/${match[1]}` : '/publisher/orders';
    } 
  },
  // 交易详情动态路由
  { 
    pattern: /^publisher\/transactions\/.*$/, 
    target: '/publisher/transactions' 
  },
  // 余额交易详情动态路由
  { 
    pattern: /^publisher\/balance\/transaction-details\/.*$/, 
    target: '/publisher/balance/transaction-list' 
  },
  // 银行卡详情动态路由
  { 
    pattern: /^publisher\/bank-cards\/bank-cardlist\/.*$/, 
    target: '/publisher/bank-cards' 
  },
  // 账号租赁订单详情动态路由
  { 
    pattern: /^publisher\/orders\/account-rental\/.*$/, 
    target: '/publisher/orders/account-rental' 
  },
  // Dashboard任务详情动态路由
  { 
    pattern: /^publisher\/dashboard\/task-detail\/.*$/, 
    target: '/publisher/dashboard' 
  }
];