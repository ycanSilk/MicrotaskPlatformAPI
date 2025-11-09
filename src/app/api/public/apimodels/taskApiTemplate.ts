import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 硬编码配置（替代JSON导入）
const config = {
  baseUrl: 'https://api.example.com', // 示例API基础URL
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
} as const;

/**
 * Task API 调用模板
 * 用于标准化带taskId参数的API接口实现
 */

export async function POST(request: NextRequest) {
  try {
    // 记录请求开始
    console.log('Task API请求开始');
    
    // 1. 解析请求体并提取taskId参数
    const requestData = await request.json();
    const { taskId } = requestData;
    
    // 记录请求参数
    console.log(`请求参数: taskId=${taskId}`);

    // 2. 参数验证
    if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
      console.log('参数验证失败: 任务ID不能为空');
      return NextResponse.json(
        { 
          code: 400, 
          message: '任务ID不能为空', 
          data: null, 
          success: false,
          timestamp: Date.now()
        }, 
        { status: 400 }
      );
    }

    // 3. 从Cookie获取认证token
    let token = '';
    try {
      const cookieStore = cookies();
      // 根据用户角色选择合适的token名称
      // publisher用户使用 publisher_token
      // commenter用户使用 commenter_token
      const cookieToken = cookieStore.get('publisher_token') || cookieStore.get('commenter_token');
      token = cookieToken?.value || '';
    } catch (cookieError) {
      console.error('无法从Cookie获取token:', cookieError);
    }
    
    // 4. 验证token有效性
    if (!token || token.trim() === '') {
      return NextResponse.json({
        code: 401,
        message: '未登录，请先登录',
        success: false
      }, { status: 401 });
    }
    
    // 5. 获取API配置
    const baseUrl = config.baseUrl;
    const timeout = config.timeout;
    const defaultHeaders = config.headers;
    
    // 6. 构造API URL，将taskId作为路径参数
    // 注意：这里的API路径需要根据实际业务调整
    const apiUrl = `${baseUrl}/tasks/${taskId}/action`; // 示例路径，需根据实际API调整
    
    // 7. 构造请求头
    const requestHeaders: HeadersInit = {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 8. 构造完整的请求参数
    const requestParams = {
      ...requestData // 包含所有传入的参数
    };

    // 记录API调用信息
    console.log(`API URL: ${apiUrl}`);
    console.log(`请求参数: ${JSON.stringify(requestParams)}`);
    
    // 9. 调用外部API，设置超时控制
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestParams),
      signal: AbortSignal.timeout(timeout)
    });
    
    // 10. 解析响应数据
    const data = await response.json();
    
    // 记录响应信息
    console.log(`外部API响应: status=${response.status}, message=${data?.message || '无消息'}`);

    // 11. 直接返回外部API的响应
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    // 错误处理
    console.error('Task API调用失败:', error);
    
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
    // 记录请求结束
    console.log('Task API请求结束');
  }
}

// 导出一个前端调用模板函数（供前端参考）
export const frontendTaskApiCallTemplate = async (taskId: string, endpoint: string, additionalParams?: any) => {
  try {
    console.log(`=== 前端调用Task API开始 ===`, { taskId, endpoint });
    
    // 构建请求参数
    const requestParams = {
      taskId,
      ...additionalParams
    };
    
    // 调用后端API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestParams)
    });

    // 检查响应状态
    if (!response.ok) {
      console.error('API返回非成功状态:', response.status);
      // 尝试解析错误响应
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API调用失败，状态码: ${response.status}`);
      } catch (parseError) {
        throw new Error(`API调用失败，状态码: ${response.status}`);
      }
    }

    // 解析响应数据
    const responseData = await response.json();
    console.log('API响应数据:', responseData);
    
    // 检查API调用是否成功
    if (!responseData.success) {
      console.error('API返回失败标志:', responseData.message);
      throw new Error(responseData.message || 'API调用失败');
    }
    
    console.log('API调用成功');
    return responseData;
    
  } catch (error) {
    console.error('API调用错误:', error);
    throw error;
  } finally {
    console.log('=== 前端调用Task API结束 ===');
  }
};