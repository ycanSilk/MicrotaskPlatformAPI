import { cookies } from 'next/headers';
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
    console.log(formatLog(operation, `从Cookie获取token: ${token ? '已获取到token' : '未获取到token'}`));
  } catch (cookieError) {
    console.error(formatLog(operation, `无法从Cookie获取token: ${(cookieError as Error).message}`));
  }
  
  return token;
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
 * 返回完整的token
 * @param token 原始token
 * @returns 完整的token或提示文本
 */
export const safeLogToken = (token: string): string => {
  if (!token) return '[空token]';
  return token;
};

export default {
  formatLog,
  getTokenFromCookie,
  isValidToken,
  safeLogToken
};
