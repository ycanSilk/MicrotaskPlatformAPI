// 用户认证相关类型定义

/**
 * 登录请求参数类型
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录响应数据类型
 */
export interface LoginResponseData {
  token: string;
  userId: string;
  username: string;
  userInfo: UserInfo;
  expiresIn: number;
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: string;
  username: string;
  phone?: string;
  email?: string | null;
  avatar?: string;
  role?: string;
  status?: string;
  invitationCode?: string;
  createTime?: string;
  [key: string]: any;
}

/**
 * 认证存储数据类型
 */
export interface AuthStorageData {
  token: string;
  userId: string;
  username: string;
  userInfo: UserInfo;
  expiresAt: number;
  createdAt: number;
}

/**
 * 认证状态类型
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
}
