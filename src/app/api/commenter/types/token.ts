// Token相关数据类型定义

/**
 * 登录响应数据类型
 */
export interface LoginResponseData {
  token: string;
  userId: string;
  username: string;
  userInfo: any;
  expiresIn: number;
}

/**
 * 登录响应类型
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: LoginResponseData;
}

/**
 * 存储的数据结构
 */
export interface AuthStorageData {
  token: string;
  userId: string;
  username: string;
  userInfo: any;
  expiresAt: number;
  createdAt: number;
}
