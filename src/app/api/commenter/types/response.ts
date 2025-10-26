// API响应类型定义

/**
 * 基础响应类型
 */
export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  code?: number;
  data?: T;
  timestamp?: number;
}

/**
 * 成功响应类型
 */
export interface SuccessResponse<T = any> extends BaseResponse<T> {
  success: true;
  data: T;
  code?: 200;
}

/**
 * 错误响应类型
 */
export interface ErrorResponse extends BaseResponse {
  success: false;
  code: number;
  message: string;
}

/**
 * 分页请求参数类型
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应数据类型
 */
export interface PaginationData<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T = any> extends BaseResponse<PaginationData<T>> {
  data: PaginationData<T>;
}
