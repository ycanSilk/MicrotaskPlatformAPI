import { User } from '@/types';
import commenterUsersData from '@/data/commenteruser/commenteruser.json';

export interface CommenterLoginCredentials {
  username: string;
  password: string;
}

export interface CommenterLoginResult {
  success: boolean;
  user?: User;
  message: string;
  token?: string;
}

export interface CommenterAuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

// 生成评论员Token
export const generateCommenterToken = (user: User): string => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
  };
  
  // 简单的Base64编码（生产环境需要使用真正的JWT）
  return btoa(JSON.stringify(payload));
};

// 验证评论员Token
export const validateCommenterToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));
    
    // 检查是否过期
    if (payload.exp < Date.now()) {
      return null;
    }
    
    // 验证角色是否为评论员
    if (payload.role !== 'commenter') {
      return null;
    }
    
    // 从评论员数据中查找用户
    const userData = commenterUsersData.users.find(u => u.id === payload.userId);
    
    if (!userData) {
      return null;
    }
    
    // 构造符合User接口的用户对象
    const userObject: User = {
      id: userData.id,
      username: userData.username,
      role: 'commenter',
      phone: userData.phone || '',
      balance: 0,
      status: 'active',
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    
    return userObject;
  } catch (error) {
    console.error('Commenter token validation error:', error);
    return null;
  }
};

// 评论员登录验证
export const authenticateCommenter = async (credentials: CommenterLoginCredentials): Promise<CommenterLoginResult> => {
  const { username, password } = credentials;
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 查找评论员用户
  const user = commenterUsersData.users.find(u => 
    u.username === username
  );
  
  if (!user) {
    return {
      success: false,
      message: '评论员用户名不存在'
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
    role: 'commenter',
    phone: user.phone,
    balance: 0,
    status: 'active',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: new Date().toISOString()
  };
  
  // 生成Token
  const token = generateCommenterToken(userObject);
  
  return {
    success: true,
    user: userObject,
    token,
    message: '评论员登录成功'
  };
};

// 评论员本地存储管理
export const CommenterAuthStorage = {
  // 保存认证信息
  saveAuth: (session: CommenterAuthSession): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('commenter_auth_token', session.token);
      localStorage.setItem('commenter_user_info', JSON.stringify(session.user));
      localStorage.setItem('commenter_auth_expires', session.expiresAt.toString());
    } catch (error) {
      console.error('保存评论员认证信息失败:', error);
    }
  },
  
  // 获取认证信息
  getAuth: (): CommenterAuthSession | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const token = localStorage.getItem('commenter_auth_token');
      const userInfo = localStorage.getItem('commenter_user_info');
      const expiresAt = localStorage.getItem('commenter_auth_expires');
      
      console.log('从localStorage获取认证数据:', {
        token: token ? token.substring(0, 20) + '...' : null,
        userInfo: userInfo ? JSON.parse(userInfo) : null,
        expiresAt: expiresAt
      });
      
      if (!token || !userInfo || !expiresAt) {
        console.log('缺少必要的认证数据:', {
          hasToken: !!token,
          hasUserInfo: !!userInfo,
          hasExpiresAt: !!expiresAt
        });
        return null;
      }
      
      // 检查是否过期
      if (parseInt(expiresAt) < Date.now()) {
        console.log('认证已过期，清除认证信息');
        CommenterAuthStorage.clearAuth();
        return null;
      }
      
      const authSession = {
        token,
        user: JSON.parse(userInfo),
        expiresAt: parseInt(expiresAt)
      };
      
      console.log('成功获取认证会话');
      return authSession;
    } catch (error) {
      console.error('获取评论员认证信息失败:', error);
      return null;
    }
  },
  
  // 获取Token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const auth = CommenterAuthStorage.getAuth();
      return auth ? auth.token : null;
    } catch (error) {
      console.error('获取Token失败:', error);
      return null;
    }
  },
  
  // 清除认证信息
  clearAuth: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('commenter_auth_token');
      localStorage.removeItem('commenter_user_info');
      localStorage.removeItem('commenter_auth_expires');
    } catch (error) {
      console.error('清除评论员认证信息失败:', error);
    }
  },
  
  // 验证Token
  verifyToken: (token: string): { userId: string; username: string; role: string; exp: number } | null => {
    try {
      // 在实际应用中，这里应该是真实的JWT验证
      // 这里我们简单解码token来获取用户信息
      const payload = JSON.parse(atob(token));
      
      // 检查token是否过期
      // 注意：JWT的exp通常是以秒为单位的时间戳，而Date.now()返回毫秒
      if (payload.exp && payload.exp < Date.now() / 1000) {
        console.log('Token已过期');
        return null;
      }
      
      return payload;
    } catch (error) {
      console.error('验证Token失败:', error);
      return null;
    }
  },
  
  // 检查是否已登录
  isLoggedIn: (): boolean => {
    return CommenterAuthStorage.getAuth() !== null;
  },
  
  // 获取当前用户
  getCurrentUser: (): User | null => {
    const auth = CommenterAuthStorage.getAuth();
    return auth ? auth.user : null;
  }
};

// 评论员登出
export const commenterLogout = (): void => {
  CommenterAuthStorage.clearAuth();
  
  // 重定向到评论员登录页
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login/commenterlogin';
  }
};

// 评论员默认跳转路径
export const getCommenterHomePath = (): string => {
  return '/commenter/hall';
};

// 评论员权限检查
export const commenterHasPermission = (user: User, permission: string): boolean => {
  if (user.role !== 'commenter') {
    return false;
  }
  
  // 评论员默认没有特殊权限控制
  return true;
};