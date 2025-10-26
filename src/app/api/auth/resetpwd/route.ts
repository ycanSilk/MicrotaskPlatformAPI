import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

// 定义响应数据类型
interface ResetPasswordResponse {
  code: number;
  message: string;
  data?: string;
  timestamp: number;
}

// 定义请求参数类型
interface ResetPasswordRequest {
  username: string;
  newPassword: string;
  confirmPassword: string;
}

// 定义配置文件类型
interface ApiConfig {
  baseUrl: string;
  api: any;
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

// 通过用户名获取用户ID
async function getUserIdByUsername(username: string): Promise<number | null> {
  try {
    // 检查所有用户类型的JSON文件
    const userTypes = ['commenter', 'publisher', 'admin'];
    
    for (const userType of userTypes) {
      let userFilePath: string;
      
      switch (userType) {
        case 'commenter':
          userFilePath = path.join(process.cwd(), 'src', 'data', 'commenteruser', 'commenteruser.json');
          break;
        case 'publisher':
          userFilePath = path.join(process.cwd(), 'src', 'data', 'publisheruser', 'publisheruser.json');
          break;
        case 'admin':
          userFilePath = path.join(process.cwd(), 'src', 'data', 'adminuser', 'adminuser.json');
          break;
        default:
          continue;
      }
      
      // 检查文件是否存在
      if (fs.existsSync(userFilePath)) {
        const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
        
        if (userData.users && Array.isArray(userData.users)) {
          const user = userData.users.find((u: any) => u.username === username);
          if (user) {
            // 从用户ID中提取数字部分或返回默认ID
            if (user.id && typeof user.id === 'string') {
              // 尝试从ID字符串中提取数字
              const numericPart = user.id.replace(/\D/g, '');
              return numericPart ? parseInt(numericPart, 10) : 1;
            }
            return 1; // 默认ID
          }
        }
      }
    }
    
    // 如果在所有文件中都找不到用户
    return null;
  } catch (error) {
    console.error('获取用户ID失败:', error);
    return null;
  }
}

// 处理重置密码请求的POST方法
export async function POST(request: NextRequest) {
  try {
    // 获取API配置
    const config = getApiConfig();
    const baseUrl = config.baseUrl;
    
    // 解析请求体
    const body = await request.json();
    const { username, newPassword, confirmPassword }: ResetPasswordRequest = body;
    
    // 验证必要的字段
    if (!username || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段: username, newPassword, confirmPassword' },
        { status: 400, headers: getCorsHeaders() }
      );
    }
    
    // 验证密码一致性
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: '两次输入的密码不一致' },
        { status: 400, headers: getCorsHeaders() }
      );
    }
    
    // 验证密码长度（根据前端要求大于6位）
    if (newPassword.length <= 6) {
      return NextResponse.json(
        { success: false, error: '密码长度必须大于6位' },
        { status: 400, headers: getCorsHeaders() }
      );
    }
    
    // 通过用户名获取用户ID
    const userId = await getUserIdByUsername(username);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404, headers: getCorsHeaders() }
      );
    }
    
    // 组合基础URL和路径
    const resetPasswordUrl = `${baseUrl}/api/users/${userId}/reset-password`;
    
    // 调用外部重置密码API
    const startTime = Date.now();
    const response = await fetch(resetPasswordUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify({ newPassword })
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      // 处理API返回的错误
      console.error('外部API调用失败:', response.status);
      
      // 根据实际需求，可以返回不同的错误信息
      if (response.status === 403) {
        return NextResponse.json(
          {
            success: false,
            error: '权限不足，无法重置密码',
            errorCode: response.status,
            responseTime
          },
          { status: response.status, headers: getCorsHeaders() }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: `API请求失败: ${response.status}`,
          errorCode: response.status,
          responseTime
        },
        { status: response.status, headers: getCorsHeaders() }
      );
    }
    
    // 检查响应头中的内容类型
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      // 如果不是JSON响应，返回成功消息
      return NextResponse.json(
        {
          code: 0,
          message: '密码重置成功',
          data: '密码已成功更新',
          timestamp: Date.now()
        },
        { status: 200, headers: getCorsHeaders() }
      );
    }
    
    try {
      // 解析API返回的真实数据
      const apiResponse: ResetPasswordResponse = await response.json();
      
      // 直接返回API的响应数据
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
      // JSON解析失败的情况，但API请求成功，仍认为密码重置成功
      return NextResponse.json(
        {
          code: 0,
          message: '密码重置成功',
          data: '密码已成功更新',
          timestamp: Date.now()
        },
        { status: 200, headers: getCorsHeaders() }
      );
    }
  } catch (error) {
    console.error('重置密码过程中发生错误:', error);
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