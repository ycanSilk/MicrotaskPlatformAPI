import { NextRequest, NextResponse } from 'next/server';
import config from '../../apiconfig/config.json';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';


export async function POST(request: NextRequest) {
  try {

    console.log('接取任务API请求开始');
    // 从请求中获取taskId参数
    const requestData = await request.json();
    const { taskId } = requestData;
    
    console.log(`请求参数: taskId=${taskId}`);

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


    
   // 获取token - 只从HttpOnly Cookie获取，这是更安全的认证方式
    let token = '';
    
    // 从Cookie获取token
    try {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get('commenter_token');
      token = cookieToken?.value || '';
    } catch (cookieError) {
      console.error('无法从Cookie获取token:', cookieError);
    }
    
    // 验证token有效性
    if (!token || token.trim() === '') {
      return NextResponse.json({
        code: 401,
        message: '未登录，请先登录',
        success: false
      }, { status: 401 });
    }
    // 从配置文件中获取API配置
    const baseUrl = config.baseUrl;
    const timeout = config.timeout || 5000;
    const defaultHeaders = config.headers || {};
    
    // 构造完整的API URL，将taskId作为路径参数
    const apiUrl = `${baseUrl}/tasks/${taskId}/accept/`;
    // 构造请求头，合并默认头和token头
    const requestHeaders: HeadersInit = {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

     // 调用外部API获取任务列表
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    });
    console.log(`API URL: ${apiUrl}`);
    // 解析响应数据
    const data = await response.json();
    // 只输出一次简要的响应信息
    console.log(`接取任务成功: taskId=${taskId}`);
    console.log(`接取任务的详细信息: `, data);
    console.log(`外部API响应: status=${response.status}, message=${data?.message || '无消息'}`);

    // 返回API响应
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('接取任务API调用失败:', error);
    
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
    console.log('接取任务API请求结束');
  }
}
