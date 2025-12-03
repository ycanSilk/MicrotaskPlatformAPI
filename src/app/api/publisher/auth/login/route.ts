import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import config from '../../apiconfig/config.json';

export async function POST(request: NextRequest) {
  try {
    console.log('接收到publisher登录请求');
    
    // 解析请求体
    const body = await request.json();
    console.log('登录请求参数:', body);
    
    // 服务端表单验证
    const errors = validateLoginForm(body);
    if (Object.keys(errors).length > 0) {
      console.log('表单验证失败:', errors);
      return NextResponse.json({
        success: false,
        message: Object.values(errors)[0],
        errors
      }, { status: 400 });
    }
    
    // 构建外部API请求URL
    // 根据配置决定使用环境变量还是config中的baseUrl
    const baseUrl = config.useEnvBaseUrl && process.env.API_BASE_URL ? process.env.API_BASE_URL : config.baseUrl;
    const apiUrl = `${baseUrl}${config.endpoints.auth.login}`;
    console.log('调用外部登录API:', apiUrl);
    console.log('使用的baseUrl配置:', { useEnvBaseUrl: config.useEnvBaseUrl, envApiBaseUrl: process.env.API_BASE_URL, finalBaseUrl: baseUrl });
    
    // 调用外部API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        username: body.username,
        password: body.password
      })
    });
    
    // 解析外部API响应
    const data = await response.json();
    console.log('外部API响应:', data);
    
    // 检查响应状态
    if (!response.ok || !data.success) {
      console.log('登录失败:', data.message || '外部API返回错误');
      return NextResponse.json({
        success: false,
        message: data.message || '登录失败，请检查用户名和密码'
      }, { status: response.status });
    }
    
    // 创建响应对象
    const nextResponse = NextResponse.json({
      success: true,
      message: data.message || '登录成功',
      data: data.data
    });

    // 设置HttpOnly Cookie存储token
    if (data.data?.token) {
      // 根据请求协议自动决定secure属性
      // 如果是HTTPS请求，则设置secure为true；否则为false
      const isHttps = request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://');
      
      nextResponse.cookies.set('publisher_token', data.data.token, {
        httpOnly: true,
        secure: isHttps, // 根据请求协议自动设置secure属性
        sameSite: 'lax',
        path: '/',
        maxAge: data.data.expiresIn ? Math.floor(data.data.expiresIn / 1000) : 86400 // 转换为秒
      });
    }
    console.log('登录成功，返回响应');
    return nextResponse;
    
  } catch (error) {
    console.error('登录处理过程中发生错误:', error);
    return NextResponse.json({
      success: false,
      message: '登录过程中发生错误，请稍后重试'
    }, { status: 500 });
  }
}

/**
 * 验证登录表单数据
 * @param data 表单数据
 * @returns 错误信息对象，如果验证通过则为空对象
 */
function validateLoginForm(data: any): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // 用户名非空校验
  if (!data.username || typeof data.username !== 'string' || data.username.trim() === '') {
    errors.username = '请输入用户名';
    return errors;
  }
  
  // 用户名长度校验 (如果需要)
  if (data.username.length < 4) {
    errors.username = '用户名长度至少为4个字符';
    return errors;
  }
  
  // 密码非空校验
  if (!data.password || typeof data.password !== 'string' || data.password.trim() === '') {
    errors.password = '请输入密码';
    return errors;
  }
  
  // 密码长度校验 (如果需要)
  if (data.password.length < 6) {
    errors.password = '密码长度至少为6个字符';
    return errors;
  }
  
  return errors;
}
