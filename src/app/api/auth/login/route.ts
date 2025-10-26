import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 定义响应数据类型
interface LoginResponse {
  code: number;
  message: string;
  data?: {
    token: string;
    tokenType: string;
    expiresIn: number;
    userInfo: {
      id: number;
      username: string;
      email: string | null;
      phone: string | null;
      avatarUrl: string | null;
    };
  };
  timestamp: number;
}

// 定义请求参数类型
interface LoginRequest {
  username: string;
  password: string;
}

// 定义配置文件类型
interface ApiConfig {
  baseUrl: string;
  api: {
    auth: {
      login: {
        path: string;
        method: string;
        requiredParams: string[];
        optionalParams: string[];
        responseFormat: any;
        description: string;
      };
    };
  };
  cors: {
    allowOrigin: string;
    allowMethods: string[];
    allowHeaders: string[];
    maxAge: string;
  };
  version: string;
  lastUpdated: string;
}

// 读取配置文件
function getApiConfig(): ApiConfig {
  try {
    const configPath = path.join(process.cwd(), 'src', 'app', 'api', 'config', 'apiConfig.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData) as ApiConfig;
    } catch (error) {
      throw new Error('配置文件加载失败');
  }
}

// 配置CORS响应头
function getCorsHeaders() {
  const config = getApiConfig();
  const corsConfig = config.cors;
  return {
    'Access-Control-Allow-Origin': corsConfig.allowOrigin,
    'Access-Control-Allow-Methods': corsConfig.allowMethods.join(', '),
    'Access-Control-Allow-Headers': corsConfig.allowHeaders.join(', '),
    'Access-Control-Max-Age': corsConfig.maxAge,
  };
}

// 处理OPTIONS预检请求
export function OPTIONS() {
  return NextResponse.json(
    { success: true, message: 'CORS preflight request successful' },
    { headers: getCorsHeaders() }
  );
}

// 处理登录请求的POST方法
export async function POST(request: NextRequest) {
  try {
    // 获取API配置
    const config = getApiConfig();
    const loginConfig = config.api.auth.login;
    
    // 解析请求体
    const body = await request.json();
    const { username, password }: LoginRequest = body;
    
    // 验证必要的字段
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段: username, password' },
        { status: 400, headers: getCorsHeaders() }
      );
    }
    
    // 组合基础URL和路径
    const externalApiUrl = `${config.baseUrl}${loginConfig.path}`;
    
    // 调用外部登录API
    const startTime = Date.now();
    const response = await fetch(externalApiUrl, {
      method: loginConfig.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify({ username, password })
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || `API请求失败: ${response.status}`,
          errorCode: response.status,
          responseTime
        },
        { status: response.status, headers: getCorsHeaders() }
      );
    }
    
    // 检查响应头中的内容类型
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      // 如果不是JSON响应，读取响应文本并返回错误
      const responseText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `API返回了非JSON响应 (${contentType || '未知类型'})`,
          errorCode: response.status,
          responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
          responseTime
        },
        { status: response.status, headers: getCorsHeaders() }
      );
    }
    
    try {
      // 解析API返回的真实数据
      const apiResponse: LoginResponse = await response.json();
      
      // 直接返回API的响应数据，保持前后端分离
      return NextResponse.json(
        apiResponse,
        {
          status: 200,
          headers: {
            ...getCorsHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (jsonError) {
      // JSON解析失败的情况
      return NextResponse.json(
        {
          success: false,
          error: `JSON解析失败: ${jsonError instanceof Error ? jsonError.message : '未知错误'}`,
          errorCode: 400,
          responseTime
        },
        { status: 400, headers: getCorsHeaders() }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '网络请求失败', 
        errorCode: 500 
      },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}