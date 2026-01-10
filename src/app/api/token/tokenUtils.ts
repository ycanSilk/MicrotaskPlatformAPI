import { cookies } from 'next/headers';
import { ModuleType, commenterTokenManager, publisherTokenManager, adminTokenManager, publicTokenManager } from './tokenManager';
export const dynamic = 'force-dynamic';
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
export const getTokenFromCookie = async (
  cookieName: string = 'publisher_token',
  operation: string = 'UNKNOWN'
): Promise<string> => {
  let token = '';
  
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(cookieName);
    token = cookieToken?.value || '';
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
    const tokenManager = getTokenManagerByModule(moduleType);
    
    if (!tokenManager) {
      return null;
    }
    
    const authData = tokenManager.getAuthData();
    const isAuthenticated = tokenManager.isAuthenticated();

    return {
      authData,
      isAuthenticated,
      moduleType,
      cookieName: tokenManager.getCookieName()
    };
  } catch (error) {
    return null;
  }
};

/**
 * 获取完整的token（结合Cookie和Token管理器）
 * @param moduleType 模块类型
 * @param operation 操作名称，用于日志记录
 * @returns 获取到的token对象，包含token字符串和相关信息
 */
export const getToken = async (
  moduleType: ModuleType = ModuleType.PUBLIC,
  operation: string = 'UNKNOWN'
): Promise<{ token: string; isAuthenticated: boolean; moduleType: ModuleType; cookieName: string }> => {
  try {
    // 获取Token管理器信息
    const managerInfo = getTokenInfoFromManager(moduleType, operation);
    
    if (!managerInfo) {
      return {
        token: '',
        isAuthenticated: false,
        moduleType,
        cookieName: `${moduleType}_token`
      };
    }
    
    // 从Cookie获取实际token（HttpOnly Cookie机制）
    const token = await getTokenFromCookie(managerInfo.cookieName, operation);
    
    return {
      token,
      isAuthenticated: managerInfo.isAuthenticated,
      moduleType,
      cookieName: managerInfo.cookieName
    };
  } catch (error) {
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
export const getAllModuleTokens = async (
  operation: string = 'UNKNOWN'
): Promise<Record<ModuleType, { token: string; isAuthenticated: boolean; cookieName: string }>> => { 
  return {
    [ModuleType.COMMENTER]: await getToken(ModuleType.COMMENTER, operation),
    [ModuleType.PUBLISHER]: await getToken(ModuleType.PUBLISHER, operation),
    [ModuleType.ADMIN]: await getToken(ModuleType.ADMIN, operation),
    [ModuleType.PUBLIC]: await getToken(ModuleType.PUBLIC, operation)
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
    return isLoggedIn;
  } catch (error) {
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
