import { User } from '@/types';
import { AdminAuthStorage } from './admin/auth';
import { PublisherAuthStorage } from './publisher/auth';
import { CommenterAuthStorage } from './commenter/auth';

// 通用认证接口定义
export interface CommonLoginCredentials {
  username: string;
  password: string;
  role: 'admin' | 'publisher' | 'commenter';
}

export interface CommonLoginResult {
  success: boolean;
  user?: User;
  message: string;
  token?: string;
  role?: 'admin' | 'publisher' | 'commenter';
}

export interface CommonAuthSession {
  user: User;
  token: string;
  expiresAt: number;
  role: 'admin' | 'publisher' | 'commenter';
}

// 获取对应的认证存储管理器
export const getAuthStorageByRole = (role: 'admin' | 'publisher' | 'commenter') => {
  switch (role) {
    case 'admin':
      return AdminAuthStorage;
    case 'publisher':
      return PublisherAuthStorage;
    case 'commenter':
      return CommenterAuthStorage;
    default:
      throw new Error(`未知角色: ${role}`);
  }
};

// 通用登录函数（用于代理到对应的角色登录）
export const commonLogin = async (credentials: CommonLoginCredentials): Promise<CommonLoginResult> => {
  const { role, username, password } = credentials;
  
  try {
    // 动态导入对应的认证模块
    let result;
    
    switch (role) {
      case 'admin':
        {
          const { authenticateAdmin } = await import('./admin/auth');
          const adminResult = await authenticateAdmin({ username, password });
          result = {
            ...adminResult,
            role: 'admin'
          };
        }
        break;
      case 'publisher':
        {
          const { authenticatePublisher } = await import('./publisher/auth');
          const publisherResult = await authenticatePublisher({ username, password });
          result = {
            ...publisherResult,
            role: 'publisher'
          };
        }
        break;
      case 'commenter':
        {
          const { authenticateCommenter } = await import('./commenter/auth');
          const commenterResult = await authenticateCommenter({ username, password });
          result = {
            ...commenterResult,
            role: 'commenter'
          };
        }
        break;
      default:
        return {
          success: false,
          message: `未知角色: ${role}`
        };
    }
    
    // 如果登录成功，保存认证信息
    if (result.success && result.user && result.token) {
      const authStorage = getAuthStorageByRole(role);
      const session = {
        user: result.user,
        token: result.token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
      };
      authStorage.saveAuth(session);
    }
    
    return result as CommonLoginResult;
  } catch (error) {
    console.error(`登录失败: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      message: `登录失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
};

// 通用登出函数
export const commonLogout = (role?: 'admin' | 'publisher' | 'commenter') => {
  if (role) {
    // 如果指定了角色，只登出该角色
    const authStorage = getAuthStorageByRole(role);
    authStorage.clearAuth();
  } else {
    // 否则登出所有角色
    AdminAuthStorage.clearAuth();
    PublisherAuthStorage.clearAuth();
    CommenterAuthStorage.clearAuth();
  }
  
  // 重定向到登录页（根据角色或当前路径）
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    let loginPath = '/auth/login/publisherlogin'; // 默认
    
    if (role === 'admin' || currentPath.startsWith('/admin')) {
      loginPath = '/auth/login/adminlogin';
    } else if (role === 'publisher' || currentPath.startsWith('/publisher')) {
      loginPath = '/auth/login/publisherlogin';
    } else if (role === 'commenter' || currentPath.startsWith('/commenter')) {
      loginPath = '/auth/login/commenterlogin';
    }
    
    window.location.href = loginPath;
  }
};

// 检查是否有任何角色已登录
export const isAnyUserLoggedIn = (): boolean => {
  return AdminAuthStorage.isLoggedIn() || 
         PublisherAuthStorage.isLoggedIn() || 
         CommenterAuthStorage.isLoggedIn();
};

// 获取当前已登录的用户（如果有多个角色登录，优先级：admin > publisher > commenter）
export const getCurrentLoggedInUser = (): { user: User; role: 'admin' | 'publisher' | 'commenter' } | null => {
  // 检查管理员是否登录
  const adminUser = AdminAuthStorage.getCurrentUser();
  if (adminUser) {
    return { user: adminUser, role: 'admin' };
  }
  
  // 检查派单员是否登录
  const publisherUser = PublisherAuthStorage.getCurrentUser();
  if (publisherUser) {
    return { user: publisherUser, role: 'publisher' };
  }
  
  // 检查评论员是否登录
  const commenterUser = CommenterAuthStorage.getCurrentUser();
  if (commenterUser) {
    return { user: commenterUser, role: 'commenter' };
  }
  
  return null;
};

// 根据角色获取默认跳转路径
export const getRoleHomePath = (role: 'admin' | 'publisher' | 'commenter'): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'publisher':
      return '/publisher/dashboard';
    case 'commenter':
      return '/commenter/hall';
    default:
      return '/';
  }
};

// 验证Token（根据角色）
export const validateTokenByRole = async (token: string, role: 'admin' | 'publisher' | 'commenter'): Promise<User | null> => {
  try {
    // 动态导入对应的认证模块
    let user: User | null = null;
    
    switch (role) {
      case 'admin':
        {
          const { validateAdminToken } = await import('./admin/auth');
          user = validateAdminToken(token);
        }
        break;
      case 'publisher':
        {
          const { validatePublisherToken } = await import('./publisher/auth');
          user = validatePublisherToken(token);
        }
        break;
      case 'commenter':
        {
          const { validateCommenterToken } = await import('./commenter/auth');
          user = validateCommenterToken(token);
        }
        break;
    }
    
    return user;
  } catch (error) {
    console.error(`Token验证失败: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

// 清除所有认证信息
export const clearAllAuth = (): void => {
  AdminAuthStorage.clearAuth();
  PublisherAuthStorage.clearAuth();
  CommenterAuthStorage.clearAuth();
};