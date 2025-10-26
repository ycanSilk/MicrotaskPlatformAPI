// 认证模块统一入口

// 导入管理员认证模块
export * as AdminAuth from './admin/auth';

export { 
  authenticateAdmin, 
  generateAdminToken, 
  validateAdminToken, 
  AdminAuthStorage, 
  adminLogout, 
  getAdminHomePath, 
  adminHasPermission 
} from './admin/auth';

// 导入派单员认证模块
export * as PublisherAuth from './publisher/auth';

export { 
  authenticatePublisher, 
  generatePublisherToken, 
  validatePublisherToken, 
  PublisherAuthStorage, 
  publisherLogout, 
  getPublisherHomePath, 
  publisherHasPermission 
} from './publisher/auth';

// 导入评论员认证模块
export * as CommenterAuth from './commenter/auth';

export { 
  authenticateCommenter, 
  generateCommenterToken, 
  validateCommenterToken, 
  CommenterAuthStorage, 
  commenterLogout, 
  getCommenterHomePath, 
  commenterHasPermission 
} from './commenter/auth';

// 导入通用认证工具
export * as CommonAuth from './common';

export { 
  commonLogin, 
  commonLogout, 
  isAnyUserLoggedIn, 
  getCurrentLoggedInUser, 
  getRoleHomePath, 
  validateTokenByRole, 
  clearAllAuth, 
  getAuthStorageByRole
} from './common';

// 导出类型定义
export type { 
  AdminLoginCredentials, 
  AdminLoginResult, 
  AdminAuthSession 
} from './admin/auth';

export type { 
  PublisherLoginCredentials, 
  PublisherLoginResult, 
  PublisherAuthSession 
} from './publisher/auth';

export type { 
  CommenterLoginCredentials, 
  CommenterLoginResult, 
  CommenterAuthSession 
} from './commenter/auth';

export type { 
  CommonLoginCredentials, 
  CommonLoginResult, 
  CommonAuthSession 
} from './common';