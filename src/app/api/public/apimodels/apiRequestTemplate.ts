/**
 * 后端API请求路由模板
 * 
 * 用途：用于快速创建标准化的后端API请求转发路由文件
 * 特性：
 * 1. 模块化的参数配置系统
 * 2. 标准化的请求处理流程
 * 3. 完善的错误处理机制
 * 4. 清晰的日志记录系统
 * 
 * 使用步骤：
 * 1. 复制此文件到目标目录
 * 2. 修改文件顶部的配置参数
 * 3. 根据需要自定义参数处理和验证逻辑
 * 4. 调整导出的HTTP方法函数
 */

import { NextRequest, NextResponse } from 'next/server';
import config from '../apiconfig/config.json'; // 根据实际路径调整
import { tokenManagerInstance } from '../auth/token/tokenManager'; // 根据实际路径调整

// ================================================================
// 配置区域 - 创建新API时只需修改此处
// ================================================================

/**
 * API配置参数
 * 创建新API时，修改以下配置即可快速生成新的路由
 */
const API_CONFIG = {
  // API名称（用于日志和错误信息）
  apiName: 'API请求模板',
  
  // 外部API端点路径 - 从配置文件获取或直接指定
  endpointPath: config.endpoints.task?.template || '/api/template',
  
  // HTTP请求方法
  httpMethod: 'POST',
  
  // 是否需要认证（如需认证，会自动从tokenManager获取token）
  requiresAuth: true,
  
  // 请求超时时间（毫秒）
  timeout: config.timeout || 5000,
};

/**
 * 请求参数配置
 * 为每个参数类型提供独立的配置接口
 */
const PARAM_CONFIG = {
  // 路径参数配置（用于URL路径中的参数，如 /users/{userId}）
  path: {
    // 示例：
    // userId: {
    //   required: true,
    //   type: 'string',
    //   description: '用户ID',
    //   example: '12345'
    // }
  },
  
  // 查询参数配置（用于URL查询字符串中的参数，如 ?page=1&limit=10）
  query: {
    // 示例：
    // page: {
    //   required: false,
    //   type: 'number',
    //   default: 1,
    //   description: '页码',
    //   example: '1'
    // },
    // limit: {
    //   required: false,
    //   type: 'number',
    //   default: 10,
    //   description: '每页数量',
    //   example: '10'
    // }
  },
  
  // 请求头参数配置（用于HTTP请求头中的参数）
  header: {
    // 示例：
    // 'X-Custom-Header': {
    //   required: false,
    //   type: 'string',
    //   description: '自定义请求头',
    //   example: 'custom-value'
    // }
  },
  
  // 请求体参数配置（用于POST/PUT请求的请求体）
  body: {
    // 示例：
    // name: {
    //   required: true,
    //   type: 'string',
    //   description: '名称',
    //   example: '张三'
    // },
    // age: {
    //   required: false,
    //   type: 'number',
    //   description: '年龄',
    //   example: '25'
    // }
  }
};

// ================================================================
// 工具函数
// ================================================================

/**
 * 安全日志记录TOKEN，隐藏部分敏感信息
 * @param token - 完整的token字符串
 * @returns 脱敏后的token字符串
 */
function safeLogToken(token: string | null | undefined): string {
  if (!token) return 'null';
  if (token.length <= 10) return token;
  return `${token.substring(0, 5)}...${token.substring(token.length - 5)}`;
}

/**
 * 验证请求参数
 * @param request - NextRequest对象
 * @returns 验证结果和错误信息
 */
async function validateRequest(request: NextRequest): Promise<{ isValid: boolean; error?: string }> {
  try {
    // 验证路径参数
    // 注意：路径参数通常由Next.js路由系统处理，此处仅作示例
    
    // 验证查询参数
    const searchParams = request.nextUrl.searchParams;
    for (const [paramName, paramConfig] of Object.entries(PARAM_CONFIG.query)) {
      if (paramConfig.required && !searchParams.has(paramName)) {
        return { isValid: false, error: `缺少必需的查询参数: ${paramName}` };
      }
    }
    
    // 验证请求体参数（如果是POST/PUT请求）
    if (['POST', 'PUT', 'PATCH'].includes(API_CONFIG.httpMethod)) {
      try {
        const body = await request.json();
        for (const [paramName, paramConfig] of Object.entries(PARAM_CONFIG.body)) {
          if (paramConfig.required && !(paramName in body)) {
            return { isValid: false, error: `缺少必需的请求体参数: ${paramName}` };
          }
        }
      } catch (error) {
        // 如果不是JSON格式，可能是form-data等其他格式，此处仅作示例
      }
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('参数验证失败:', error);
    return { isValid: false, error: '参数验证过程中发生错误' };
  }
}

// ================================================================
// 核心请求处理逻辑
// ================================================================

/**
 * 构建请求URL
 * @param request - NextRequest对象
 * @returns 完整的API请求URL
 */
function buildRequestUrl(request: NextRequest): string {
  // 基础URL
  const baseUrl = config.baseUrl;
  
  // 端点路径
  let endpoint = API_CONFIG.endpointPath;
  
  // 处理查询参数
  const searchParams = request.nextUrl.searchParams;
  const queryParams = Array.from(searchParams.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  // 构建完整URL
  let url = `${baseUrl}${endpoint}`;
  if (queryParams) {
    url += `?${queryParams}`;
  }
  
  return url;
}

/**
 * 构建请求头
 * @param token - 认证token
 * @param request - NextRequest对象
 * @returns 完整的请求头对象
 */
function buildRequestHeaders(token: string | null, request: NextRequest): Record<string, string> {
  // 基础请求头
  const headers: Record<string, string> = {
    ...config.headers,
    'Content-Type': 'application/json',
  };
  
  // 添加认证token
  if (token && API_CONFIG.requiresAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 添加自定义请求头
  for (const [headerName, headerConfig] of Object.entries(PARAM_CONFIG.header)) {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      headers[headerName] = headerValue;
    } else if (headerConfig.required) {
      console.warn(`缺少必需的请求头: ${headerName}`);
    }
  }
  
  return headers;
}

/**
 * 处理请求体
 * @param request - NextRequest对象
 * @returns 请求体内容
 */
async function processRequestBody(request: NextRequest): Promise<BodyInit | null> {
  // 对于GET请求，不需要请求体
  if (API_CONFIG.httpMethod === 'GET') {
    return null;
  }
  
  // 直接使用原始请求体
  // 在实际应用中，可能需要根据PARAM_CONFIG.body进行处理和转换
  return request.body;
}

// ================================================================
// 主要处理函数
// ================================================================

/**
 * 处理API请求
 * @param request - NextRequest对象
 * @returns NextResponse对象
 */
async function handleApiRequest(request: NextRequest): Promise<NextResponse> {
  // 请求ID，用于跟踪整个请求生命周期
  const requestId = `req_${Date.now()}`;
  console.log(`[${API_CONFIG.apiName}] 请求开始 - ID: ${requestId}`);
  
  try {
    // 参数验证
    const validationResult = await validateRequest(request);
    if (!validationResult.isValid) {
      console.warn(`[${API_CONFIG.apiName}] 参数验证失败: ${validationResult.error}`);
      return NextResponse.json(
        {
          code: 400,
          message: validationResult.error || '请求参数无效',
          data: null,
          success: false,
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }
    
    // 获取认证token
    let token: string | null = null;
    if (API_CONFIG.requiresAuth) {
      token = tokenManagerInstance.getToken();
      console.log(`[${API_CONFIG.apiName}] 获取到的TOKEN: ${safeLogToken(token)}`);
      
      // 验证token是否存在
      if (!token) {
        console.warn(`[${API_CONFIG.apiName}] 未授权错误: TOKEN不存在`);
        return NextResponse.json(
          {
            code: 401,
            message: '未授权，请先登录',
            data: null,
            success: false,
            timestamp: Date.now()
          },
          { status: 401 }
        );
      }
    }
    
    // 构建请求URL
    const url = buildRequestUrl(request);
    console.log(`[${API_CONFIG.apiName}] 请求URL: ${url}`);
    
    // 构建请求头
    const headers = buildRequestHeaders(token, request);
    
    // 处理请求体
    const body = await processRequestBody(request);
    
    // 发送请求到外部API
    console.log(`[${API_CONFIG.apiName}] 发送${API_CONFIG.httpMethod}请求到外部API`);
    const response = await fetch(url, {
      method: API_CONFIG.httpMethod,
      headers,
      body,
      timeout: API_CONFIG.timeout
    });
    
    // 解析响应数据
    const data = await response.json();
    console.log(`[${API_CONFIG.apiName}] 外部API返回数据: ${JSON.stringify(data)}`);
    
    // 将外部API返回的数据原封不动地传递给前端
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[${API_CONFIG.apiName}] 请求处理失败:`, error);
    
    // 错误处理
    return NextResponse.json(
      {
        code: 500,
        message: '服务器内部错误',
        data: null,
        success: false,
        timestamp: Date.now()
      },
      { status: 500 }
    );
  } finally {
    console.log(`[${API_CONFIG.apiName}] 请求结束 - ID: ${requestId}`);
  }
}

// ================================================================
// 导出部分 - 根据需要导出不同的HTTP方法
// ================================================================

/**
 * 处理GET请求
 * 如果API需要支持GET方法，取消下面的注释
 */
// export async function GET(request: NextRequest) {
//   return handleApiRequest(request);
// }

/**
 * 处理POST请求
 */
export async function POST(request: NextRequest) {
  return handleApiRequest(request);
}

/**
 * 处理PUT请求
 * 如果API需要支持PUT方法，取消下面的注释
 */
// export async function PUT(request: NextRequest) {
//   return handleApiRequest(request);
// }

/**
 * 处理DELETE请求
 * 如果API需要支持DELETE方法，取消下面的注释
 */
// export async function DELETE(request: NextRequest) {
//   return handleApiRequest(request);
// }

// ================================================================
// 使用示例
// ================================================================
/*
如何使用此模板创建新的API路由：

1. 复制此文件到目标目录，例如：src/app/api/commenter/task/gettask/route.ts

2. 修改API_CONFIG配置：
const API_CONFIG = {
  apiName: '获取任务详情',
  endpointPath: config.endpoints.task.detail,
  httpMethod: 'GET',
  requiresAuth: true,
  timeout: 10000,
};

3. 配置请求参数：
const PARAM_CONFIG = {
  path: {
    taskId: {
      required: true,
      type: 'string',
      description: '任务ID',
      example: '123456'
    }
  },
  query: {},
  header: {},
  body: {}
};

4. 根据需要导出相应的HTTP方法函数：
export async function GET(request: NextRequest) {
  return handleApiRequest(request);
}

5. 根据实际需求可能需要自定义buildRequestUrl函数中的路径参数处理
*/
