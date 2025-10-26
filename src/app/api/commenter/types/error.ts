// 错误处理类型定义

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 系统错误
  SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  TIMEOUT = 408,
  
  // 认证授权错误
  UNAUTHORIZED = 401,
  TOKEN_EXPIRED = 4011,
  TOKEN_INVALID = 4012,
  PERMISSION_DENIED = 403,
  
  // 请求错误
  BAD_REQUEST = 400,
  PARAMS_INVALID = 4001,
  RESOURCE_NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  
  // 业务错误
  LOGIN_FAILED = 1001,
  USER_EXIST = 1002,
  USER_NOT_FOUND = 1003,
  INVALID_CREDENTIALS = 1004,
  OPERATION_FAILED = 1005,
  DATA_VALIDATION_FAILED = 1006,
}

/**
 * 错误信息类型
 */
export interface ErrorInfo {
  code: number;
  message: string;
  details?: any;
}

/**
 * 错误处理配置类型
 */
export interface ErrorConfig {
  showToast?: boolean;
  redirect?: string;
  retryable?: boolean;
}

/**
 * API错误类型
 */
export class ApiError extends Error {
  code: number;
  details?: any;
  
  constructor(message: string, code: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}
