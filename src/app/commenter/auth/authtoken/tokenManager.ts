// 定义评论用户接口
interface CommenterUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  // 其他可能的用户属性
}
  
// 定义登录响应接口
export interface LoginApiResponse {
  code: number;
  message: string;
  data: {
    token: string;
    expiresIn: number; // 毫秒
    userInfo: {
      id: string;
      username: string;
      email: string | null;
      phone: string;
      invitationCode: string;
      createTime: string;
    };
  };
  success: boolean;
  timestamp: number;
}

// 定义Token存储接口
export interface TokenStorage {
  token: string;
  tokenType: string;
  expiresIn: number; // 毫秒
  timestamp: number;
  expiresAt: number;
  userInfo?: {
    id: string;
    username: string;
    email: string | null;
    phone: string;
    invitationCode: string;
    createTime: string;
  };
}

// 定义认证信息接口
export interface AuthInfo {
  token: string;
  user: {
    id: string;
    username: string;
    email: string | null;
    phone: string;
    role: 'commenter';
    balance: number;
    status: 'active';
    createdAt: string;
    invitationCode: string;
    avatar: string;
    lastLoginTime: string;
  };
  expiresAt: number;
}

/**
 * Token管理器类 - 负责处理Commenter用户的Token管理
 */
export class CommenterTokenManager {
  private static readonly STORAGE_KEY = 'commenterAuthToken';
  private static readonly USER_INFO_KEY = 'commenterUserInfo';

  /**
   * 解析登录API响应数据
   * @param response 登录API返回的响应数据
   * @returns 解析后的Token和用户信息
   */
  public static parseLoginResponse(response: LoginApiResponse): TokenStorage {
    if (!response.success || !response.data) {
      throw new Error(`登录失败: ${response.message || '无效的响应数据'}`);
    }

    const { token, expiresIn, userInfo } = response.data;
    const currentTime = Date.now();
    
    return {
      token,
      tokenType: 'Bearer',
      expiresIn,
      timestamp: currentTime,
      expiresAt: currentTime + expiresIn,
      userInfo
    };
  }

  /**
   * 保存Token到本地存储
   * @param tokenStorage Token存储对象
   */
  public static saveToken(tokenStorage: TokenStorage): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenStorage));
        // 单独保存用户信息，便于在不获取完整token的情况下获取用户信息
        if (tokenStorage.userInfo) {
          localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(tokenStorage.userInfo));
        }
      }
    } catch (error) {
      console.error('保存Token失败:', error);
      throw new Error('无法保存认证信息，请检查浏览器存储权限');
    }
  }

  /**
   * 从本地存储获取Token
   * @returns Token存储对象或null（如果不存在或已过期）
   */
  public static getToken(): TokenStorage | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      const tokenData = localStorage.getItem(this.STORAGE_KEY);
      if (!tokenData) {
        return null;
      }

      const tokenStorage: TokenStorage = JSON.parse(tokenData);
      
      // 检查token是否已过期
      if (this.isTokenExpired(tokenStorage)) {
        this.removeToken();
        return null;
      }

      return tokenStorage;
    } catch (error) {
      console.error('获取Token失败:', error);
      return null;
    }
  }

  /**
   * 移除Token
   */
  public static removeToken(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.USER_INFO_KEY);
      }
    } catch (error) {
      console.error('移除Token失败:', error);
    }
  }

  /**
   * 检查Token是否已过期
   * @param tokenStorage Token存储对象
   * @returns 是否已过期
   */
  public static isTokenExpired(tokenStorage: TokenStorage): boolean {
    return Date.now() >= (tokenStorage.expiresAt || 0);
  }

  /**
   * 获取Token剩余有效期（毫秒）
   * @returns 剩余有效期，负数表示已过期
   */
  public static getTokenRemainingTime(): number {
    const token = this.getToken();
    if (!token) {
      return -1;
    }
    return token.expiresAt - Date.now();
  }

  /**
   * 格式化剩余时间为可读字符串
   * @returns 格式化的时间字符串
   */
  public static formatRemainingTime(): string {
    const remainingMs = this.getTokenRemainingTime();
    
    if (remainingMs <= 0) {
      return '已过期';
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  /**
   * 构建认证请求头
   * @returns 包含Authorization的请求头对象
   */
  public static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return {};
    }

    return {
      'Authorization': `${token.tokenType} ${token.token}`
    };
  }

  /**
   * 从Token中提取用户信息（仅用于显示，不用于认证）
   * @returns 用户信息对象或null
   */
  public static getUserInfo(): any | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      // 优先从单独保存的用户信息中获取
      const userInfoStr = localStorage.getItem(this.USER_INFO_KEY);
      if (userInfoStr) {
        return JSON.parse(userInfoStr);
      }

      // 如果没有单独保存，尝试从token中获取
      const tokenData = this.getToken();
      return tokenData?.userInfo || null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 生成AuthInfo对象（兼容现有认证系统）
   * @param tokenStorage Token存储对象
   * @returns AuthInfo对象
   */
  public static createAuthInfo(tokenStorage: TokenStorage): AuthInfo {
    if (!tokenStorage.userInfo) {
      throw new Error('Token存储对象中缺少用户信息');
    }

    const userInfo = tokenStorage.userInfo;
    
    return {
      token: tokenStorage.token,
      user: {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email || null,
        phone: userInfo.phone,
        role: 'commenter',
        balance: 0,
        status: 'active',
        createdAt: userInfo.createTime,
        invitationCode: userInfo.invitationCode,
        avatar: '',
        lastLoginTime: new Date().toISOString()
      },
      expiresAt: tokenStorage.expiresAt
    };
  }

  /**
   * 验证Token的有效性
   * @param token Token字符串
   * @returns 是否有效
   */
  public static isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return false;
    }

    // 基本的JWT格式验证
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // 尝试解码payload部分来验证token的有效性
    try {
      // 注意：这里只是进行格式验证，不进行签名验证
      // 完整的签名验证需要在服务器端进行
      const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadStr);
      
      // 检查payload是否包含必要字段
      if (!payload.sub || !payload.iat || !payload.exp) {
        return false;
      }

      // 检查是否已过期
      const currentTime = Math.floor(Date.now() / 1000); // 转换为秒
      if (currentTime > payload.exp) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 设置Token自动刷新时间
   * @param refreshCallback 刷新回调函数
   * @param beforeExpiryMs 提前多少毫秒刷新（默认300000ms = 5分钟）
   * @returns 定时器ID，可用于清除定时器
   */
  public static setupAutoRefresh(
    refreshCallback: () => Promise<void>,
    beforeExpiryMs: number = 300000
  ): number {
    // 立即检查一次token是否即将过期
    this.checkAndRefreshToken(refreshCallback, beforeExpiryMs);

    // 设置定时器，每分钟检查一次
    return window.setInterval(() => {
      this.checkAndRefreshToken(refreshCallback, beforeExpiryMs);
    }, 60000); // 每分钟检查一次
  }

  /**
   * 检查并刷新token
   * @private
   */
  private static async checkAndRefreshToken(
    refreshCallback: () => Promise<void>,
    beforeExpiryMs: number
  ): Promise<void> {
    const remainingTime = this.getTokenRemainingTime();
    
    // 如果剩余时间小于指定的刷新提前量，则刷新token
    if (remainingTime > 0 && remainingTime < beforeExpiryMs) {
      try {
        await refreshCallback();
        console.log('Token自动刷新成功');
      } catch (error) {
        console.error('Token自动刷新失败:', error);
        // 刷新失败时，可能需要清除token并通知用户重新登录
      }
    }
  }
}