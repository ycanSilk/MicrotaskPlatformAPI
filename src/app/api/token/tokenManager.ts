// 多模块登录Token管理器
// 主要负责管理各模块的认证状态，基于HttpOnly Cookie的认证机制
// 支持派单模块、接单模块等多模块隔离使用

/**
 * 模块类型枚举
 */
export enum ModuleType {
  COMMENTER = 'commenter',   // 接单模块
  PUBLISHER = 'publisher',   // 派单模块
  ADMIN = 'admin',           // 管理模块
  PUBLIC = 'public'          // 公共模块
}

/**
 * 环境检测辅助函数
 */
const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * 安全的sessionStorage操作包装器
 */
class SessionStorageWrapper {
  private modulePrefix: string;
  
  constructor(modulePrefix: string) {
    this.modulePrefix = modulePrefix;
  }
  
  private getPrefixedKey(key: string): string {
    return `${this.modulePrefix}_${key}`;
  }
  
  setItem(key: string, value: string): boolean {
    try {
      if (!isBrowser()) {
        return false;
      }   
      const prefixedKey = this.getPrefixedKey(key);
      sessionStorage.setItem(prefixedKey, value);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  getItem(key: string): string | null {
    try {
      if (!isBrowser()) {
        return null;
      }
      
      const prefixedKey = this.getPrefixedKey(key);
      return sessionStorage.getItem(prefixedKey);
    } catch (error) {
      return null;
    }
  }
  
  removeItem(key: string): boolean {
    try {
      if (!isBrowser()) {
        return false;
      }
      const prefixedKey = this.getPrefixedKey(key);
      sessionStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * 多模块Token管理器类
 * 为每个模块创建独立的实例，避免冲突
 */
export class TokenManager {
  private moduleType: ModuleType;
  private modulePrefix: string;
  private sessionKey: string;
  private sessionLastActivityKey: string;
  private userInfoKey: string;
  private cookieName: string;
  private sessionStorage: SessionStorageWrapper;
  private isAuthenticatedFlag: boolean = false;
  
  /**
   * 构造函数
   * @param moduleType 模块类型
   */
  constructor(moduleType: ModuleType) {
    this.moduleType = moduleType;
    this.modulePrefix = moduleType;
    this.sessionKey = 'active_session';
    this.sessionLastActivityKey = `${this.sessionKey}_last_activity`;
    this.userInfoKey = 'user_info';
    this.cookieName = `${moduleType}_token`;
    this.sessionStorage = new SessionStorageWrapper(this.modulePrefix);
  }
  
  /**
   * 保存认证数据
   * @param authData 认证数据对象，包含用户信息等
   * @returns 是否保存成功
   */
  saveAuthData(authData: { userInfo?: any }): boolean {
    try {
      // 首先检查是否在浏览器环境中
      if (!isBrowser()) {
        return false;
      }

      // 设置会话标记和最后活动时间，表示用户已认证
      this.sessionStorage.setItem(this.sessionKey, 'true');
      this.sessionStorage.setItem(this.sessionLastActivityKey, Date.now().toString());
      
      // 更新实例认证标志
      this.isAuthenticatedFlag = true;
      
      // 保存用户信息到sessionStorage，但不保存token
      if (authData.userInfo) {
        try {
          const userInfoString = JSON.stringify(authData.userInfo);
          this.sessionStorage.setItem(this.userInfoKey, userInfoString);
        } catch (userInfoError) {
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 获取认证数据
   * @returns 包含用户信息的对象或null（如果未认证）
   */
  getAuthData(): { userInfo?: any } | null {
    try {

      if (!isBrowser()) {
        return null;
      }

      // 更新最后活动时间
      this.sessionStorage.setItem(this.sessionLastActivityKey, Date.now().toString());
      
      // 检查会话标记
      const sessionActive = this.sessionStorage.getItem(this.sessionKey) === 'true';
      if (!sessionActive) {
        return null;
      }
      
      // 尝试获取用户信息
      let userInfo = null;
      try {
        const userInfoStr = this.sessionStorage.getItem(this.userInfoKey);
        if (userInfoStr) {
          userInfo = JSON.parse(userInfoStr);
        } else {
          console.log(`[${this.moduleType}] TokenManager.getAuthData: 未找到用户信息`);
        }
      } catch (parseError) {
        console.warn(`[${this.moduleType}] TokenManager.getAuthData: 解析用户信息失败:`, parseError);
      }
      return {
        userInfo
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 获取用户信息
   * @returns 用户信息对象或空对象（如果不存在）
   */
  getUserInfo(): any {
    try {
      const userInfoStr = this.sessionStorage.getItem(this.userInfoKey);
      
      if (userInfoStr) {
        return JSON.parse(userInfoStr);
      }

      return {};
    } catch (error) {
      return {};
    }
  }
  
  /**
   * 检查用户是否已登录
   * @returns 是否已登录（基于会话状态）
   */
  isAuthenticated(): boolean {
    try {
    
      if (!isBrowser()) {
        return false;
      }
      
      // 检查会话状态
      const sessionActive = this.sessionStorage.getItem(this.sessionKey) === 'true';
      if (!sessionActive) {
        this.isAuthenticatedFlag = false;
        return false;
      }
      
      // 检查会话是否过期
      if (this.isSessionExpired()) {
        this.isAuthenticatedFlag = false;
        return false;
      }
      
      // 更新实例认证标志
      this.isAuthenticatedFlag = true;
      
      // 注意：在HttpOnly Cookie机制下，我们无法直接检查token是否有效
      // 实际的token验证将在服务器端通过请求头中的Cookie进行

      return true;
    } catch (error) {
      this.isAuthenticatedFlag = false;
      return false;
    }
  }
  
  /**
   * 移除认证数据
   * @returns 是否移除成功
   */
  removeAuthData(): boolean {
    try {

      this.sessionStorage.removeItem(this.sessionKey);
      this.sessionStorage.removeItem(this.sessionLastActivityKey);
      this.sessionStorage.removeItem(this.userInfoKey);

      
      // 重置认证标志
      this.isAuthenticatedFlag = false;
      
      // 注意：HttpOnly Cookie不能通过JavaScript删除
      // 需要通过向服务器发送请求来清除服务器端的Cookie
   
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 清除Cookie的辅助函数
   * 注意：由于HttpOnly Cookie的安全限制，JavaScript无法直接删除HttpOnly Cookie
   * 此函数主要用于兼容性和文档说明
   */
  clearAuthCookie(): void {
    console.warn(`[${this.moduleType}] TokenManager.clearAuthCookie: 警告 - JavaScript无法直接删除HttpOnly Cookie`);
    console.warn(`[${this.moduleType}] TokenManager.clearAuthCookie: 请调用登出API以在服务器端清除HttpOnly Cookie (${this.cookieName})`);
  }
  
  /**
   * 处理登录响应并更新认证状态
   * @param loginResponse 登录响应对象
   * @returns 是否处理成功
   */
  handleLoginResponse(loginResponse: { success: boolean; data?: { userInfo?: any } }): boolean {
    try {    
      if (!loginResponse.success) {
        return false;
      }
      
      // 构造认证数据对象（不包含token）
      const authData = {
        userInfo: loginResponse.data?.userInfo
      };
      
      // 保存认证状态数据
      const saveResult = this.saveAuthData(authData);
    
      return saveResult;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 检查会话是否过期
   * @param maxInactivityTime 最大不活动时间（毫秒），默认30分钟
   * @returns 会话是否过期
   */
  isSessionExpired(maxInactivityTime: number = 30 * 60 * 1000): boolean {
    try {
      const lastActivityStr = this.sessionStorage.getItem(this.sessionLastActivityKey);
      if (!lastActivityStr) return true;
      
      const lastActivityTime = parseInt(lastActivityStr, 10);
      const currentTime = Date.now();
      
      const isExpired = (currentTime - lastActivityTime) > maxInactivityTime;
      if (isExpired) {
        console.log(`[${this.moduleType}] TokenManager.isSessionExpired: 会话已过期，${(currentTime - lastActivityTime) / 1000}秒 > ${maxInactivityTime / 1000}秒`);
      }
      
      return isExpired;
    } catch (error) {      
      return true;
    }
  }
  
  /**
   * 更新会话活动时间
   */
  updateSessionActivity(): void {
    this.sessionStorage.setItem(this.sessionLastActivityKey, Date.now().toString());
  }
  
  /**
   * 获取当前模块类型
   */
  getModuleType(): ModuleType {
    return this.moduleType;
  }
  
  /**
   * 获取Cookie名称
   */
  getCookieName(): string {
    return this.cookieName;
  }
}

// 创建并导出默认实例（向后兼容，默认使用接单模块）
export const commenterTokenManager = new TokenManager(ModuleType.COMMENTER);
export const publisherTokenManager = new TokenManager(ModuleType.PUBLISHER);
export const adminTokenManager = new TokenManager(ModuleType.ADMIN);
export const publicTokenManager = new TokenManager(ModuleType.PUBLIC);

// 向后兼容的默认导出
export default commenterTokenManager;

// 导出常用的辅助函数（向后兼容）
export const saveAuthData = (authData: { userInfo?: any }): boolean => commenterTokenManager.saveAuthData(authData);
export const getAuthData = (): { userInfo?: any } | null => commenterTokenManager.getAuthData();
export const getUserInfo = (): any => commenterTokenManager.getUserInfo();
export const isAuthenticated = (): boolean => commenterTokenManager.isAuthenticated();
export const removeAuthData = (): boolean => commenterTokenManager.removeAuthData();
export const handleLoginResponse = (loginResponse: { success: boolean; data?: { userInfo?: any } }): boolean => commenterTokenManager.handleLoginResponse(loginResponse);
export const clearAuthCookie = (): void => commenterTokenManager.clearAuthCookie();
export const isSessionExpired = (maxInactivityTime?: number): boolean => commenterTokenManager.isSessionExpired(maxInactivityTime || 30 * 60 * 1000);
export const updateSessionActivity = (): void => commenterTokenManager.updateSessionActivity();
export const isAuthenticatedFlag = commenterTokenManager['isAuthenticatedFlag'];

