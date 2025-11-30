import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
import config from '../../apiconfig/config.json';
export const dynamic = 'force-dynamic';
// 定义API响应类型接口
interface ApiResponse {
  code: number;
  message: string;
  data?: any;
  success: boolean;
  timestamp?: number;
}

// 定义日志记录工具
const logger = {
  info: (message: string, data?: any) => {
    // 在实际环境中，应使用更完善的日志系统
    console.log(`[INFO] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    // 在实际环境中，应使用更完善的日志系统
    console.error(`[ERROR] ${message}`, error || '');
  },
  debug: (message: string, data?: any) => {
    // 仅在开发环境记录调试信息
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
};

// 验证token格式的函数
const validateToken = (token: string): boolean => {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return false;
  }
  
  // 验证token是否为有效的JWT格式 (至少包含两个点号)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // 简单验证每个部分是否为有效的Base64格式
  try {
    // 第一部分是Header
    const header = Buffer.from(parts[0], 'base64').toString('utf8');
    JSON.parse(header);
    
    // 第二部分是Payload
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    JSON.parse(payload);
    
    return true;
  } catch (error) {
    return false;
  }
};

// 从多种来源获取token
const getToken = async (request: Request): Promise<{ token: string; source: string }> => {
  let token = '';
  let source = 'unknown';
  
  // 1. 优先从Authorization头获取token
  const authHeader = request.headers.get('Authorization');
  logger.debug('检查Authorization头', { authHeader });
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length === 2 && tokenParts[1]) {
      token = tokenParts[1];
      source = 'header';
      logger.debug('从Authorization头获取token');
    }
  }
  
  // 2. 如果Authorization头中没有token，从Cookie获取
  if (!token) {
    try {
      const cookieStore = await cookies();
      const cookieTokens = cookieStore.get('commenter_token');
      token = cookieTokens?.value || '';
      source = 'cookie';
      logger.debug('从Cookie获取token', { hasToken: !!token });
    } catch (cookieError) {
      logger.error('从Cookie获取token失败', cookieError);
    }
  }
  
  return { token, source };
};

export async function POST(request: Request) {
  // 记录请求开始
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  logger.info(`退出登录请求开始 [${requestId}]`);
  
  try {
    // 获取并验证token
    const { token, source } = await getToken(request);
    
    // 必须提供有效的token才能执行退出操作
    if (!token) {
      logger.error(`[${requestId}] 退出登录失败: 缺少token`);
      return NextResponse.json({
        code: 401,
        message: '未提供认证信息，请先登录',
        success: false,
        timestamp: Date.now()
      }, { status: 401 });
    }
    
    // 验证token格式是否正确
    if (!validateToken(token)) {
      logger.error(`[${requestId}] 退出登录失败: token格式无效`, { source });
      return NextResponse.json({
        code: 401,
        message: '提供的认证信息无效',
        success: false,
        timestamp: Date.now()
      }, { status: 401 });
    }
    
    logger.debug(`[${requestId}] 开始处理退出登录请求`, { tokenSource: source });
    
    // 从配置文件中获取API配置
    const baseUrl = config.baseUrl;
    const logoutEndpoint = config.endpoints?.auth?.logout;
    const timeout = config.timeout || 5000;
    const defaultHeaders = config.headers || {};
    
    // 验证配置是否完整
    if (!baseUrl || !logoutEndpoint) {
      logger.error(`[${requestId}] 退出登录失败: API配置不完整`);
      return NextResponse.json({
        code: 500,
        message: '服务器配置错误，无法完成退出操作',
        success: false,
        timestamp: Date.now()
      }, { status: 500 });
    }
    
    // 构造完整的API URL
    const apiUrl = `${baseUrl}${logoutEndpoint}`;
    
    // 构造请求头，合并默认头和token头
    const requestHeaders: HeadersInit = {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`
    };
    
    // 调用外部API执行退出操作
    let responseData: any;
    
    try {
      logger.debug(`[${requestId}] 调用外部退出API`, { apiUrl });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: requestHeaders,
        signal: AbortSignal.timeout(timeout),
        body: JSON.stringify({})
      });
      
      // 验证响应是否有效
      if (!response.ok) {
        // 尝试解析错误响应
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || `外部服务错误: ${response.status}`;
          const errorCode = errorData.code || response.status;
          
          logger.error(`[${requestId}] 外部API调用失败`, { 
            status: response.status,
            errorMessage,
            errorCode 
          });
          
          // 构造错误响应
          return NextResponse.json({
            code: errorCode,
            message: errorMessage,
            success: false,
            timestamp: Date.now()
          }, { status: response.status });
        } catch (parseError) {
          // 如果无法解析错误响应
          logger.error(`[${requestId}] 无法解析外部API错误响应`, parseError);
          
          return NextResponse.json({
            code: response.status,
            message: `外部服务错误: ${response.status}`,
            success: false,
            timestamp: Date.now()
          }, { status: response.status });
        }
      }
      
      // 解析成功响应
      responseData = await response.json();
      logger.debug(`[${requestId}] 外部API调用成功`, { responseCode: response.status });
      
    } catch (fetchError) {
      logger.error(`[${requestId}] 外部API调用异常`, fetchError);
      
      // 即使外部API调用失败，也尝试清除本地Cookie
      try {
        await clearAuthCookies();
        logger.debug(`[${requestId}] 外部API调用失败后，已清除本地Cookie`);
      } catch (clearError) {
        logger.error(`[${requestId}] 外部API调用失败后，清除Cookie也失败`, clearError);
      }
      
      // 根据不同类型的异常返回不同的错误信息
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json({
            code: 504,
            message: '外部API请求超时',
            success: false,
            timestamp: Date.now()
          }, { status: 504 });
        } else if (fetchError.message.includes('Failed to fetch')) {
          return NextResponse.json({
            code: 503,
            message: '无法连接到外部API服务',
            success: false,
            timestamp: Date.now()
          }, { status: 503 });
        } else if (fetchError.message.includes('JSON')) {
          return NextResponse.json({
            code: 502,
            message: '无法解析API响应数据',
            success: false,
            timestamp: Date.now()
          }, { status: 502 });
        }
      }
      
      // 其他未知异常
      return NextResponse.json({
        code: 500,
        message: '服务器内部错误',
        success: false,
        timestamp: Date.now()
      }, { status: 500 });
    }
    
    // 清除本地Cookie中的认证信息
    try {
      await clearAuthCookies();
      logger.debug(`[${requestId}] 成功清除本地认证Cookie`);
    } catch (cookieError) {
      logger.error(`[${requestId}] 清除Cookie失败`, cookieError);
      // 继续处理，因为外部API调用已成功
    }
    
    // 构造最终响应
    const finalResponse = NextResponse.json({
      code: responseData.code || 200,
      message: responseData.message || '退出成功',
      success: responseData.success ?? true,
      timestamp: Date.now()
    });
    
    logger.info(`[${requestId}] 退出登录请求成功完成`);
    return finalResponse;
  } catch (error) {
    // 捕获所有未预见的异常
    logger.error(`[${requestId}] 退出登录请求异常`, error);
    
    // 即使发生异常，也尝试清除本地Cookie
    try {
      await clearAuthCookies();
    } catch (cookieError) {
      // 忽略Cookie清除错误
    }
    
    return NextResponse.json({
      code: 500,
      message: '服务器内部错误',
      success: false,
      timestamp: Date.now()
    }, { status: 500 });
  }
}

// 清除认证相关的Cookie的工具函数
async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  const authCookies = ['commenter_token', 'commenter_auth_data', 'commenter_user_info'];
  
  for (const cookieName of authCookies) {
    try {
      cookieStore.delete(cookieName);
    } catch (error) {
      // 记录单个Cookie删除失败，但继续尝试其他Cookie
      logger.error(`清除Cookie失败: ${cookieName}`, error);
    }
  }
}

// 移除GET方法支持，强制使用POST方法保证安全性
// 退出登录操作应该是一个有状态的改变，不应该通过GET请求执行
export async function GET(request: Request) {
  return NextResponse.json({
    code: 405,
    message: '不支持GET请求，请使用POST方法',
    success: false,
    timestamp: Date.now()
  }, { status: 405 });
}