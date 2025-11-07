import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
import { getAllModuleTokens, isValidToken } from '../../token/tokenUtils';

// 创建标准化响应的辅助函数
function createStandardResponse(
  code: number,
  message: string,
  data: {
    list: any[];
    total: number;
    page: number;
    size: number;
    pages: number;
  },
  success: boolean
) {
  return {
    code,
    message,
    data,
    success,
    timestamp: Date.now()
  };
}

export async function POST(request: Request) {
  try {
    // 解析请求体
    let requestData;
    try {
      const rawBody = await request.text();
      requestData = JSON.parse(rawBody);
    } catch (jsonError) {
      console.error('解析请求体失败:', jsonError);
      return NextResponse.json(
        createStandardResponse(400, '请求参数格式错误', {
          list: [],
          total: 0,
          page: 0,
          size: 10,
          pages: 0
        },
        false
        ), 
        { status: 400 }
      );
    }
    
    // 获取token
    let token = '';
    
    // 从请求参数获取
    if (requestData?.Authorization) {
      token = requestData.Authorization.startsWith('Bearer ') 
        ? requestData.Authorization.substring(7) 
        : requestData.Authorization;
    }
    // 从tokenUtils获取
    if (!token) {
      const allTokens = getAllModuleTokens('GET_MISSION_HALL_TASKS');
      // 确保allTokens是对象类型
      if (typeof allTokens === 'object' && allTokens !== null) {
        for (const moduleType in allTokens) {
          if (Object.prototype.hasOwnProperty.call(allTokens, moduleType)) {
            if (allTokens[moduleType]?.token && isValidToken(allTokens[moduleType].token)) {
              token = allTokens[moduleType].token;
              break;
            }
          }
        }
      }
    }
    // 从请求头获取
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    // 从Cookie获取
    if (!token) {
      const cookieStore = cookies();
      const tokenKeys = ['commenter_token', 'publisher_token', 'admin_token', 'user_token', 'auth_token', 'token'];
      // 确保cookieStore存在且get方法可用
      if (cookieStore && typeof cookieStore.get === 'function') {
        for (const key of tokenKeys) {
          const cookieToken = cookieStore.get(key)?.value;
          if (cookieToken && isValidToken(cookieToken)) {
            token = cookieToken;
            break;
          }
        }
      }
    }
    
    // 验证token
    if (!isValidToken(token)) {
      return NextResponse.json(
      createStandardResponse(401, '未授权访问', {
        list: [],
        total: 0,
        page: 0,
        size: 10,
        pages: 0
      },
      false
      ), 
      { status: 401 }
    );
    }
    
    // 构建请求参数
    const requestParams = {
      page: requestData?.page || 0,
      size: requestData?.size || 10,
      sortField: requestData?.sortField || 'createTime',
      sortOrder: requestData?.sortOrder || 'DESC',
      platform: requestData?.platform || 'DOUYIN',
      taskType: requestData?.taskType || 'COMMENT',
      minPrice: requestData?.minPrice === undefined ? 1 : requestData.minPrice,
      maxPrice: requestData?.maxPrice === undefined ? 999 : requestData.maxPrice,
      keyword: requestData?.keyword || ''
    };
    
    // 安全构建API URL
    let apiUrl = '';
    try {
      if (config && config.baseUrl && config.endpoints && config.endpoints.task && config.endpoints.task.missionhall) {
        apiUrl = `${config.baseUrl}${config.endpoints.task.missionhall}`;
        // 输出请求日志
        console.log('请求URL:', apiUrl);
        console.log('请求参数:', requestParams);
      } else {
        throw new Error('配置信息不完整，无法构建API URL');
      }
    } catch (configError) {
      console.error('构建API URL失败:', configError);
      return NextResponse.json(
        createStandardResponse(500, '服务器配置错误', {
          list: [],
          total: 0,
          page: 0,
          size: 10,
          pages: 0
        },
        false
        ), 
        { status: 500 }
      );
    }
    
    // 调用外部API
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(config.headers || {})
        },
        body: JSON.stringify(requestParams)
      });
      
      // 处理响应
      try {
        const responseData = await response.json();
        
        // 构建返回数据
        const dataContent = {
          list: responseData?.data?.list || [],
          total: responseData?.data?.total || 0,
          page: responseData?.data?.page || requestParams.page,
          size: responseData?.data?.size || requestParams.size,
          pages: responseData?.data?.pages || 0
        };
        
        // 构建标准化响应
        const standardResponse = createStandardResponse(
          response.status, 
          response.status >= 200 && response.status < 300 ? '成功' : '请求失败',
          dataContent,
          response.status >= 200 && response.status < 300
        );
        
        // 输出返回数据日志
        console.log('返回数据:', standardResponse);
        
        return NextResponse.json(standardResponse, { status: response.status });
      } catch (jsonError) {
        console.error('解析API响应失败:', jsonError);
        return NextResponse.json(
          createStandardResponse(500, '解析响应失败', {
            list: [],
            total: 0,
            page: requestParams.page,
            size: requestParams.size,
            pages: 0
          },
          false
          ), 
          { status: 500 }
        );
      }
    } catch (fetchError) {
      console.error('API请求失败:', fetchError);
      return NextResponse.json(
          createStandardResponse(500, '请求外部服务失败', {
            list: [],
            total: 0,
            page: requestParams.page,
            size: requestParams.size,
            pages: 0
          },
          false
          ), 
          { status: 500 }
        );
    }
    
  } catch (error) {
    console.error('服务器内部错误:', error);
    return NextResponse.json(
      createStandardResponse(500, '服务器内部错误', {
        list: [],
        total: 0,
        page: 0,
        size: 10,
        pages: 0
      },
      false
      ), 
      { status: 500 }
    );
  }
}

// 处理不支持的HTTP方法
export async function GET(request: Request) {
  return NextResponse.json(
    createStandardResponse(405, '不支持的请求方法', {
      list: [],
      total: 0,
      page: 0,
      size: 10,
      pages: 0
    },
    false
    ), 
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function PUT(request: Request) {
  return NextResponse.json(
    createStandardResponse(405, '不支持的请求方法', {
      list: [],
      total: 0,
      page: 0,
      size: 10,
      pages: 0
    }), 
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function DELETE(request: Request) {
  return NextResponse.json(
    createStandardResponse(405, '不支持的请求方法', {
      list: [],
      total: 0,
      page: 0,
      size: 10,
      pages: 0
    }), 
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}