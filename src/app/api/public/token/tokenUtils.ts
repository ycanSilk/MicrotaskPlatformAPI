import { cookies } from 'next/headers';
import { ModuleType, commenterTokenManager, publisherTokenManager, adminTokenManager, publicTokenManager } from './tokenManager';

/**
 * 格式化日志输出
 * @param operation 操作名称
 * @param message 日志消息
 * @returns 格式化后的日志字符串
 */
export const formatLog = (operation: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${operation}] ${message}`;
};

/**
 * 从Cookie中获取token
 * @param cookieName Cookie名称，默认为'publisher_token'
 * @param operation 操作名称，用于日志记录
 * @returns 获取到的token字符串，如果失败则返回空字符串
 */
export const getTokenFromCookie = (
  cookieName: string = 'publisher_token',
  operation: string = 'UNKNOWN'
): string => {
  let token = '';
  
  try {
    const cookieStore = cookies();
    const cookieToken = cookieStore.get(cookieName);
    token = cookieToken?.value || '';
    console.log(formatLog(operation, `从Cookie获取token: ${token ? '已获取到token' : '未获取到token'}`));
  } catch (cookieError) {
    console.error(formatLog(operation, `无法从Cookie获取token: ${(cookieError as Error).message}`));
  }
  
  return token;
};

/**
 * 根据模块类型获取对应的Token管理器实例
 * @param moduleType 模块类型
 * @returns 对应的Token管理器实例
 */
const getTokenManagerByModule = (moduleType: ModuleType) => {
  switch (moduleType) {
    case ModuleType.COMMENTER:
      return commenterTokenManager;
    case ModuleType.PUBLISHER:
      return publisherTokenManager;
    case ModuleType.ADMIN:
      return adminTokenManager;
    case ModuleType.PUBLIC:
      return publicTokenManager;
    default:
      console.warn(formatLog('getTokenManagerByModule', `未知模块类型: ${moduleType}，默认使用公共模块`));
      return publicTokenManager;
  }
};

/**
 * 从Token管理器获取token信息
 * @param moduleType 模块类型
 * @param operation 操作名称，用于日志记录
 * @returns 模块的认证数据或null
 */
export const getTokenInfoFromManager = (
  moduleType: ModuleType = ModuleType.PUBLIC,
  operation: string = 'UNKNOWN'
) => {
  try {
    console.log(formatLog(operation, `从Token管理器获取${moduleType}模块的token信息`));
    const tokenManager = getTokenManagerByModule(moduleType);
    
    if (!tokenManager) {
      console.error(formatLog(operation, `无法获取${moduleType}模块的Token管理器`));
      return null;
    }
    
    const authData = tokenManager.getAuthData();
    const isAuthenticated = tokenManager.isAuthenticated();
    
    console.log(formatLog(operation, `${moduleType}模块认证状态: ${isAuthenticated ? '已认证' : '未认证'}`));
    
    return {
      authData,
      isAuthenticated,
      moduleType,
      cookieName: tokenManager.getCookieName()
    };
  } catch (error) {
    console.error(formatLog(operation, `从Token管理器获取token信息时发生错误: ${(error as Error).message}`));
    return null;
  }
};

/**
 * 获取完整的token（结合Cookie和Token管理器）
 * @param moduleType 模块类型
 * @param operation 操作名称，用于日志记录
 * @returns 获取到的token对象，包含token字符串和相关信息
 */
export const getToken = (
  moduleType: ModuleType = ModuleType.PUBLIC,
  operation: string = 'UNKNOWN'
): { token: string; isAuthenticated: boolean; moduleType: ModuleType; cookieName: string } => {
  try {
    console.log(formatLog(operation, `开始获取${moduleType}模块的token`));
    
    // 获取Token管理器信息
    const managerInfo = getTokenInfoFromManager(moduleType, operation);
    
    if (!managerInfo) {
      console.warn(formatLog(operation, `无法获取${moduleType}模块的Token管理器信息`));
      return {
        token: '',
        isAuthenticated: false,
        moduleType,
        cookieName: `${moduleType}_token`
      };
    }
    
    // 从Cookie获取实际token（HttpOnly Cookie机制）
    const token = getTokenFromCookie(managerInfo.cookieName, operation);
    
    return {
      token,
      isAuthenticated: managerInfo.isAuthenticated,
      moduleType,
      cookieName: managerInfo.cookieName
    };
  } catch (error) {
    console.error(formatLog(operation, `获取${moduleType}模块token时发生错误: ${(error as Error).message}`));
    return {
      token: '',
      isAuthenticated: false,
      moduleType,
      cookieName: `${moduleType}_token`
    };
  }
};

/**
 * 获取所有模块的token信息
 * @param operation 操作名称，用于日志记录
 * @returns 所有模块的token信息对象
 */
export const getAllModuleTokens = (
  operation: string = 'UNKNOWN'
): Record<ModuleType, { token: string; isAuthenticated: boolean; cookieName: string }> => {
  console.log(formatLog(operation, '获取所有模块的token信息'));
  
  return {
    [ModuleType.COMMENTER]: getToken(ModuleType.COMMENTER, operation),
    [ModuleType.PUBLISHER]: getToken(ModuleType.PUBLISHER, operation),
    [ModuleType.ADMIN]: getToken(ModuleType.ADMIN, operation),
    [ModuleType.PUBLIC]: getToken(ModuleType.PUBLIC, operation)
  };
};

/**
 * 验证token的有效性
 * @param token 要验证的token
 * @returns 如果token有效则返回true，否则返回false
 */
export const isValidToken = (token: string): boolean => {
  return !!token && token.trim() !== '';
};

/**
 * 安全地记录token（避免在日志中显示敏感信息）
 * @param token 原始token
 * @returns 部分隐藏的token或提示文本
 */
export const safeLogToken = (token: string): string => {
  if (!token) return '[空token]';
  
  // 安全处理：只显示前8个字符和后4个字符
  if (token.length <= 12) {
    return '[短token]';
  }
  
  return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
};

/**
 * 检查用户在特定模块是否已登录
 * @param moduleType 模块类型
 * @param operation 操作名称，用于日志记录
 * @returns 是否已登录
 */
export const isUserLoggedIn = (
  moduleType: ModuleType = ModuleType.PUBLIC,
  operation: string = 'UNKNOWN'
): boolean => {
  try {
    const tokenManager = getTokenManagerByModule(moduleType);
    const isLoggedIn = tokenManager.isAuthenticated();
    console.log(formatLog(operation, `${moduleType}模块用户登录状态: ${isLoggedIn ? '已登录' : '未登录'}`));
    return isLoggedIn;
  } catch (error) {
    console.error(formatLog(operation, `检查${moduleType}模块用户登录状态时发生错误: ${(error as Error).message}`));
    return false;
  }
};

export default {
  formatLog,
  getTokenFromCookie,
  getTokenInfoFromManager,
  getToken,
  getAllModuleTokens,
  isValidToken,
  safeLogToken,
  isUserLoggedIn,
  ModuleType
};
