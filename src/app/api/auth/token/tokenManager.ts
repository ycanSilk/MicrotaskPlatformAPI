// 管理员登录Token管理器
// 主要负责管理认证状态，基于HttpOnly Cookie的认证机制

// 定义常量
const SESSION_KEY = 'admin_active_session';
const SESSION_LAST_ACTIVITY = `${SESSION_KEY}_last_activity`;
const USER_INFO_KEY = 'admin_user_info';
const COOKIE_NAME = 'admin_token'; // 用于文档说明，实际不再通过JS操作

// 全局状态变量，不再直接存储token值，改为存储认证状态标志
export let isAuthenticatedFlag: boolean = false;

/**
 * 环境检测辅助函数
 */
const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * 安全的sessionStorage操作包装器
 */
const safeSessionStorage = {
  setItem(key: string, value: string): boolean {
    try {
      if (!isBrowser()) {
        console.debug(`safeSessionStorage.setItem: 非浏览器环境，无法设置 '${key}'`);
        return false;
      }
      
      console.debug(`safeSessionStorage.setItem: 设置键 '${key}'`);
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`safeSessionStorage.setItem(${key}) 失败:`, error);
      return false;
    }
  },
  
  getItem(key: string): string | null {
    try {
      if (!isBrowser()) {
        console.debug(`safeSessionStorage.getItem: 非浏览器环境，无法获取 '${key}'`);
        return null;
      }
      
      console.debug(`safeSessionStorage.getItem: 获取键 '${key}'`);
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`safeSessionStorage.getItem(${key}) 失败:`, error);
      return null;
    }
  },
  
  removeItem(key: string): boolean {
    try {
      if (!isBrowser()) {
        console.debug(`safeSessionStorage.removeItem: 非浏览器环境，无法移除 '${key}'`);
        return false;
      }
      
      console.debug(`safeSessionStorage.removeItem: 移除键 '${key}'`);
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`safeSessionStorage.removeItem(${key}) 失败:`, error);
      return false;
    }
  }
};

/**
 * 保存认证数据（不再保存token，只保存状态和用户信息）
 * @param authData 认证数据对象，包含用户信息等
 * @returns 是否保存成功
 */
export function saveAuthData(authData: { userInfo?: any }): boolean {
  try {
    console.log('saveAuthData: 开始保存认证状态数据');
    
    // 首先检查是否在浏览器环境中
    if (!isBrowser()) {
      console.warn('saveAuthData: 警告: 尝试在非浏览器环境中保存认证数据');
      return false;
    }

    // 设置会话标记和最后活动时间，表示用户已认证
    safeSessionStorage.setItem(SESSION_KEY, 'true');
    safeSessionStorage.setItem(SESSION_LAST_ACTIVITY, Date.now().toString());
    
    // 更新全局认证标志
    isAuthenticatedFlag = true;
    
    // 保存用户信息到sessionStorage，但不保存token
    if (authData.userInfo) {
      try {
        console.log('saveAuthData: 准备保存用户信息到sessionStorage');
        const userInfoString = JSON.stringify(authData.userInfo);
        safeSessionStorage.setItem(USER_INFO_KEY, userInfoString);
        console.log('saveAuthData: 用户信息已成功保存');
      } catch (userInfoError) {
        console.warn('saveAuthData: 保存用户信息失败:', userInfoError);
      }
    }
    
    console.log('saveAuthData: 认证状态保存完成');
    return true;
  } catch (error) {
    console.error('saveAuthData: 保存认证数据过程中发生错误:', error);
    return false;
  }
}

/**
 * 获取认证数据（不再包含token，只返回用户信息）
 * @returns 包含用户信息的对象或null（如果未认证）
 */
export function getAuthData(): { userInfo?: any } | null {
  try {
    console.log('getAuthData: 开始获取认证状态数据');
    
    // 首先检查是否在浏览器环境中
    if (!isBrowser()) {
      console.warn('getAuthData: 警告: 尝试在非浏览器环境中获取认证数据');
      return null;
    }

    // 更新最后活动时间
    safeSessionStorage.setItem(SESSION_LAST_ACTIVITY, Date.now().toString());
    
    // 检查会话标记
    const sessionActive = safeSessionStorage.getItem(SESSION_KEY) === 'true';
    if (!sessionActive) {
      console.log('getAuthData: 会话已过期或无效');
      return null;
    }
    
    // 尝试获取用户信息
    let userInfo = null;
    try {
      const userInfoStr = safeSessionStorage.getItem(USER_INFO_KEY);
      if (userInfoStr) {
        userInfo = JSON.parse(userInfoStr);
        console.log('getAuthData: 成功获取用户信息');
      } else {
        console.log('getAuthData: 未找到用户信息');
      }
    } catch (parseError) {
      console.warn('getAuthData: 解析用户信息失败:', parseError);
    }
    
    console.log('getAuthData: 认证数据获取完成');
    return {
      userInfo
    };
  } catch (error) {
    console.error('getAuthData: 获取认证数据时发生错误:', error);
    return null;
  }
}

/**
 * 获取用户信息
 * @returns 用户信息对象或空对象（如果不存在）
 */
export function getUserInfo(): any {
  try {
    console.log('getUserInfo: 开始获取用户信息');
    const userInfoStr = safeSessionStorage.getItem(USER_INFO_KEY);
    
    if (userInfoStr) {
      console.log(`getUserInfo: 找到用户信息，长度: ${userInfoStr.length}`);
      return JSON.parse(userInfoStr);
    }
    
    console.log('getUserInfo: 未找到用户信息');
    return {};
  } catch (error) {
    console.error('getUserInfo: 获取用户信息时发生错误:', error);
    return {};
  }
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录（基于会话状态）
 */
export function isAuthenticated(): boolean {
  try {
    console.log('isAuthenticated: 开始检查用户登录状态');
    
    // 检查浏览器环境
    if (!isBrowser()) {
      console.log('isAuthenticated: 在非浏览器环境中，默认未登录');
      return false;
    }
    
    // 检查会话状态
    const sessionActive = safeSessionStorage.getItem(SESSION_KEY) === 'true';
    if (!sessionActive) {
      console.log('isAuthenticated: 会话无效或已过期');
      isAuthenticatedFlag = false;
      return false;
    }
    
    // 更新全局认证标志
    isAuthenticatedFlag = true;
    
    // 注意：在HttpOnly Cookie机制下，我们无法直接检查token是否有效
    // 实际的token验证将在服务器端通过请求头中的Cookie进行
    console.log('isAuthenticated: 基于会话状态，用户已登录');
    return true;
  } catch (error) {
    console.error('isAuthenticated: 检查登录状态时发生错误:', error);
    isAuthenticatedFlag = false;
    return false;
  }
}

/**
 * 移除认证数据
 * @returns 是否移除成功
 */
export function removeAuthData(): boolean {
  try {
    console.log('removeAuthData: 开始清除认证数据');
    
    // 清除会话数据
    safeSessionStorage.removeItem(SESSION_KEY);
    safeSessionStorage.removeItem(SESSION_LAST_ACTIVITY);
    safeSessionStorage.removeItem(USER_INFO_KEY);
    console.log('removeAuthData: 会话数据已清除');
    
    // 重置认证标志
    isAuthenticatedFlag = false;
    
    // 注意：HttpOnly Cookie不能通过JavaScript删除
    // 需要通过向服务器发送请求来清除服务器端的Cookie
    console.log('removeAuthData: 前端认证状态已清除，HttpOnly Cookie需通过服务器端清除');
    
    return true;
  } catch (error) {
    console.error('removeAuthData: 移除认证数据时发生错误:', error);
    return false;
  }
}

/**
 * 清除Cookie的辅助函数
 * 注意：由于HttpOnly Cookie的安全限制，JavaScript无法直接删除HttpOnly Cookie
 * 此函数主要用于兼容性和文档说明
 */
export function clearAuthCookie(): void {
  console.warn('clearAuthCookie: 警告 - JavaScript无法直接删除HttpOnly Cookie');
  console.warn('clearAuthCookie: 请调用登出API以在服务器端清除HttpOnly Cookie');
}

/**
 * 处理登录响应并更新认证状态
 * @param loginResponse 登录响应对象
 * @returns 是否处理成功
 */
export function handleLoginResponse(loginResponse: { success: boolean; data?: { userInfo?: any } }): boolean {
  try {
    console.log('handleLoginResponse: 开始处理登录响应');
    
    // 验证登录响应
    if (!loginResponse.success) {
      console.error('handleLoginResponse: 无效的登录响应');
      return false;
    }
    
    // 构造认证数据对象（不包含token）
    const authData = {
      userInfo: loginResponse.data?.userInfo
    };
    
    console.log('handleLoginResponse: 准备保存认证状态数据');
    // 保存认证状态数据
    const saveResult = saveAuthData(authData);
    console.log(`handleLoginResponse: 登录响应处理${saveResult ? '成功' : '失败'}`);
    
    return saveResult;
  } catch (error) {
    console.error('handleLoginResponse: 处理登录响应时发生错误:', error);
    return false;
  }
}

/**
 * 检查会话是否过期
 * @param maxInactivityTime 最大不活动时间（毫秒），默认30分钟
 * @returns 会话是否过期
 */
export function isSessionExpired(maxInactivityTime: number = 30 * 60 * 1000): boolean {
  try {
    const lastActivityStr = safeSessionStorage.getItem(SESSION_LAST_ACTIVITY);
    if (!lastActivityStr) return true;
    
    const lastActivityTime = parseInt(lastActivityStr, 10);
    const currentTime = Date.now();
    
    return (currentTime - lastActivityTime) > maxInactivityTime;
  } catch (error) {
    console.error('isSessionExpired: 检查会话过期状态时发生错误:', error);
    return true;
  }
}

/**
 * 更新会话活动时间
 */
export function updateSessionActivity(): void {
  safeSessionStorage.setItem(SESSION_LAST_ACTIVITY, Date.now().toString());
}

// 导出默认对象
export default {
  saveAuthData,
  getAuthData,
  getUserInfo,
  isAuthenticated,
  removeAuthData,
  handleLoginResponse,
  clearAuthCookie,
  isSessionExpired,
  updateSessionActivity,
  isAuthenticatedFlag
};

