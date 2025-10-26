import { User } from '@/types';
import publisherUsersData from '@/data/publisheruser/publisheruser.json';

export interface PublisherLoginCredentials {
  username: string;
  password: string;
}

export interface PublisherLoginResult {
  success: boolean;
  user?: User;
  message: string;
  token?: string;
}

export interface PublisherAuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

// 生成派单员Token
export const generatePublisherToken = (user: User): string => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
  };
  
  // 简单的Base64编码（生产环境需要使用真正的JWT）
  return btoa(JSON.stringify(payload));
};

// 验证派单员Token
export const validatePublisherToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));
    
    // 检查是否过期
    if (payload.exp < Date.now()) {
      return null;
    }
    
    // 验证角色是否为派单员
    if (payload.role !== 'publisher') {
      return null;
    }
    
    // 从派单员数据中查找用户
    const userData = publisherUsersData.users.find(u => u.id === payload.userId);
    
    if (!userData) {
      return null;
    }
    
    // 构造符合User接口的用户对象
    const userObject: User = {
      id: userData.id,
      username: userData.username,
      role: 'publisher',
      phone: userData.phone || '',
      balance: userData.balance || 0,
      status: 'active',
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    
    return userObject;
  } catch (error) {
    console.error('Publisher token validation error:', error);
    return null;
  }
};

// 派单员登录验证
export const authenticatePublisher = async (credentials: PublisherLoginCredentials): Promise<PublisherLoginResult> => {
  const { username, password } = credentials;
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 查找派单员用户
  const user = publisherUsersData.users.find(u => 
    u.username === username
  );
  
  if (!user) {
    return {
      success: false,
      message: '派单员用户名不存在'
    };
  }
  
  // 验证密码
  if (user.password !== password) {
    return {
      success: false,
      message: '密码错误'
    };
  }
  
  // 构造符合User接口的用户对象
  const userObject: User = {
    id: user.id,
    username: user.username,
    role: 'publisher',
    phone: user.phone,
    balance: user.balance || 0,
    status: 'active',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: new Date().toISOString()
  };
  
  // 生成Token
  const token = generatePublisherToken(userObject);
  
  return {
    success: true,
    user: userObject,
    token,
    message: '派单员登录成功'
  };
};

// 派单员本地存储管理
export const PublisherAuthStorage = {
  // 保存认证信息
  saveAuth: (session: PublisherAuthSession): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('publisher_auth_token', session.token);
      localStorage.setItem('publisher_user_info', JSON.stringify(session.user));
      localStorage.setItem('publisher_auth_expires', session.expiresAt.toString());
    } catch (error) {
      console.error('保存派单员认证信息失败:', error);
    }
  },
  
  // 获取认证信息
  getAuth: (): PublisherAuthSession | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const token = localStorage.getItem('publisher_auth_token');
      const userInfo = localStorage.getItem('publisher_user_info');
      const expiresAt = localStorage.getItem('publisher_auth_expires');
      
      console.log('Retrieved from localStorage:', { token, userInfo, expiresAt });
      
      if (!token || !userInfo || !expiresAt) {
        console.log('Missing required auth data in localStorage');
        return null;
      }
      
      // 检查是否过期
      const expiresAtNum = parseInt(expiresAt);
      console.log('Current time:', Date.now(), 'Expires at:', expiresAtNum);
      if (expiresAtNum < Date.now()) {
        console.log('Auth session expired, clearing auth');
        PublisherAuthStorage.clearAuth();
        return null;
      }
      
      const authSession = {
        token,
        user: JSON.parse(userInfo),
        expiresAt: expiresAtNum
      };
      
      console.log('Auth session parsed successfully:', authSession);
      return authSession;
    } catch (error) {
      console.error('获取派单员认证信息失败:', error);
      return null;
    }
  },
  
  // 清除认证信息
  clearAuth: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('publisher_auth_token');
      localStorage.removeItem('publisher_user_info');
      localStorage.removeItem('publisher_auth_expires');
    } catch (error) {
      console.error('清除派单员认证信息失败:', error);
    }
  },
  
  // 检查是否已登录
  isLoggedIn: (): boolean => {
    return PublisherAuthStorage.getAuth() !== null;
  },
  
  // 获取当前用户
  getCurrentUser: (): User | null => {
    const auth = PublisherAuthStorage.getAuth();
    return auth ? auth.user : null;
  }
};

// 派单员登出
export const publisherLogout = (): void => {
  PublisherAuthStorage.clearAuth();
  
  // 重定向到派单员登录页
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login/publisherlogin';
  }
};

// 派单员默认跳转路径
export const getPublisherHomePath = (): string => {
  return '/publisher/dashboard';
};

// 派单员权限检查
export const publisherHasPermission = (user: User, permission: string): boolean => {
  if (user.role !== 'publisher') {
    return false;
  }
  
  // 派单员默认没有特殊权限控制
  return true;
};