import { NextRequest, NextResponse } from 'next/server';
import config from '../../apiconfig/config.json';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
// 定义提交任务请求参数的接口
interface SubmitTaskRequest {
  subtaskId: string;
  submittedImages?: string;
  submittedLinkUrl?: string;
  submittedComment?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('提交子任务API请求开始');
    // 从请求中获取参数
    const requestData: SubmitTaskRequest = await request.json();
    const { subtaskId, submittedImages, submittedLinkUrl, submittedComment } = requestData;
    
    console.log(`请求参数: subtaskId=${subtaskId}, submittedImages=${submittedImages}, submittedLinkUrl=${submittedLinkUrl}, submittedComment=${submittedComment}`);

    // 参数验证
    if (!subtaskId || typeof subtaskId !== 'string' || subtaskId.trim() === '') {
      console.log('参数验证失败: 子任务ID不能为空');
      return NextResponse.json(
        { 
          code: 400, 
          message: '子任务ID不能为空', 
          data: null, 
          success: false,
          timestamp: Date.now()
        }, 
        { status: 400 }
      );
    }
    
    // 对可选参数进行类型验证
    if (submittedImages !== undefined && typeof submittedImages !== 'string') {
      console.log('参数验证失败: submittedImages必须是字符串类型');
      return NextResponse.json(
        { 
          code: 400, 
          message: '提交的图片必须是字符串类型', 
          data: null, 
          success: false,
          timestamp: Date.now()
        }, 
        { status: 400 }
      );
    }
    
    if (submittedLinkUrl !== undefined && typeof submittedLinkUrl !== 'string') {
      console.log('参数验证失败: submittedLinkUrl必须是字符串类型');
      return NextResponse.json(
        { 
          code: 400, 
          message: '提交的链接必须是字符串类型', 
          data: null, 
          success: false,
          timestamp: Date.now()
        }, 
        { status: 400 }
      );
    }
    
    if (submittedComment !== undefined && typeof submittedComment !== 'string') {
      console.log('参数验证失败: submittedComment必须是字符串类型');
      return NextResponse.json(
        { 
          code: 400, 
          message: '提交的评论必须是字符串类型', 
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
    
    // 构造完整的API URL，将subtaskId作为路径参数
    const apiUrl = `${baseUrl}/tasks/accepted/${subtaskId}/submit`;
    // 构造请求头，合并默认头和token头
    const requestHeaders: HeadersInit = {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

     // 构建请求体，包含所有参数
    const requestBody = {
      subtaskId,
      submittedImages,
      submittedLinkUrl,
      submittedComment
    };
    
    // 调用外部API提交任务
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(timeout)
    });
    console.log(`API URL: ${apiUrl}`);
    // 解析响应数据
    const data = await response.json();
    // 只输出一次简要的响应信息
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
