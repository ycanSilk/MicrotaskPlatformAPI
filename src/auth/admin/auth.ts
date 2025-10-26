import { User } from '@/types';

// 管理员用户数据（临时，实际项目中应从数据库获取）
const adminUsers = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    phone: '13800138000',
    balance: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    permissions: ['all']
  }
];

export interface AdminLoginCredentials {
  username: string;
  password: string;
}

export interface AdminLoginResult {
  success: boolean;
  user?: User;
  message: string;
  token?: string;
}

export interface AdminAuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

// 生成管理员Token
export const generateAdminToken = (user: User): string => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
  };
  
  // 简单的Base64编码（生产环境需要使用真正的JWT）
  return btoa(JSON.stringify(payload));
};

// 验证管理员Token
export const validateAdminToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));
    
    // 检查是否过期
    if (payload.exp < Date.now()) {
      return null;
    }
    
    // 验证角色是否为管理员
    if (payload.role !== 'admin') {
      return null;
    }
    
    // 查找管理员用户
    const userData = adminUsers.find(u => u.id === payload.userId);
    
    if (!userData) {
      return null;
    }
    
    // 构造符合User接口的用户对象
    const userObject: User = {
      id: userData.id,
      username: userData.username,
      role: 'admin',
      phone: userData.phone || '',
      balance: userData.balance || 0,
      status: 'active',
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      permissions: userData.permissions
    };
    
    return userObject;
  } catch (error) {
    console.error('Admin token validation error:', error);
    return null;
  }
};

// 管理员登录验证
export const authenticateAdmin = async (credentials: AdminLoginCredentials): Promise<AdminLoginResult> => {
  const { username, password } = credentials;
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 查找管理员用户
  const user = adminUsers.find(u => 
    u.username === username && u.password === password
  );
  
  if (!user) {
    return {
      success: false,
      message: '管理员用户名或密码错误'
    };
  }
  
  // 构造符合User接口的用户对象
  const userObject: User = {
    id: user.id,
    username: user.username,
    role: 'admin',
    phone: user.phone,
    balance: user.balance || 0,
    status: 'active',
    createdAt: user.createdAt,
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    permissions: user.permissions
  };
  
  // 生成Token
  const token = generateAdminToken(userObject);
  
  return {
    success: true,
    user: userObject,
    token,
    message: '管理员登录成功'
  };
};

// 管理员本地存储管理
export const AdminAuthStorage = {
  // 保存认证信息
  saveAuth: (session: AdminAuthSession): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('admin_auth_token', session.token);
      localStorage.setItem('admin_user_info', JSON.stringify(session.user));
      localStorage.setItem('admin_auth_expires', session.expiresAt.toString());
    } catch (error) {
      console.error('保存管理员认证信息失败:', error);
    }
  },
  
  // 获取认证信息
  getAuth: (): AdminAuthSession | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const token = localStorage.getItem('admin_auth_token');
      const userInfo = localStorage.getItem('admin_user_info');
      const expiresAt = localStorage.getItem('admin_auth_expires');
      
      if (!token || !userInfo || !expiresAt) {
        return null;
      }
      
      // 检查是否过期
      if (parseInt(expiresAt) < Date.now()) {
        AdminAuthStorage.clearAuth();
        return null;
      }
      
      const authSession = {
        token,
        user: JSON.parse(userInfo),
        expiresAt: parseInt(expiresAt)
      };
      
      return authSession;
    } catch (error) {
      console.error('获取管理员认证信息失败:', error);
      return null;
    }
  },
  
  // 清除认证信息
  clearAuth: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('admin_auth_token');
      localStorage.removeItem('admin_user_info');
      localStorage.removeItem('admin_auth_expires');
    } catch (error) {
      console.error('清除管理员认证信息失败:', error);
    }
  },
  
  // 检查是否已登录
  isLoggedIn: (): boolean => {
    return AdminAuthStorage.getAuth() !== null;
  },
  
  // 获取当前用户
  getCurrentUser: (): User | null => {
    const auth = AdminAuthStorage.getAuth();
    return auth ? auth.user : null;
  }
};

// 管理员登出
export const adminLogout = (): void => {
  AdminAuthStorage.clearAuth();
  
  // 重定向到管理员登录页
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login/adminlogin';
  }
};

// 管理员默认跳转路径
export const getAdminHomePath = (): string => {
  return '/admin/dashboard';
};

// 管理员权限检查
export const adminHasPermission = (user: User, permission: string): boolean => {
  if (user.role !== 'admin') {
    return false;
  }
  
  // 管理员拥有所有权限
  return true;
};