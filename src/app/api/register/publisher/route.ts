import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 读取发布者用户数据文件
const getPublisherUsers = () => {
  const filePath = path.join(process.cwd(), 'src/data/publisheruser/publisheruser.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
};

// 写入发布者用户数据文件
const savePublisherUsers = (data: any) => {
  const filePath = path.join(process.cwd(), 'src/data/publisheruser/publisheruser.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

export async function POST(request: Request) {
  try {
    const { username, password, phone, inviteCode } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (username.length < 6 || username.length > 20) {
      return NextResponse.json(
        { success: false, message: '用户名长度必须在6-20位之间' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '密码长度不能少于6位' },
        { status: 400 }
      );
    }

    // 如果提供了手机号，则验证手机号格式
    if (phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { success: false, message: '请输入正确的手机号码' },
          { status: 400 }
        );
      }
    }

    // 读取现有用户数据
    const userData = getPublisherUsers();
    
    // 检查用户名是否已存在
    const existingUser = userData.users.find((u: any) => u.username === username);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '用户名已存在，请选择其他用户名' },
        { status: 400 }
      );
    }

    // 如果提供了手机号，检查手机号是否已存在
    if (phone) {
      const existingPhone = userData.users.find((u: any) => u.phone === phone);
      if (existingPhone) {
        return NextResponse.json(
          { success: false, message: '手机号已被注册，请使用其他手机号' },
          { status: 400 }
        );
      }
    }

    // 生成新用户ID
    const newId = `pub${(userData.users.length + 1).toString().padStart(3, '0')}`;

    // 创建新用户
    const newUser = {
      id: newId,
      username,
      password, // 注意：实际项目中应该加密存储密码
      role: 'publisher',
      phone: phone || '', // 如果没有提供手机号，则存储空字符串
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 添加新用户到用户列表
    userData.users.push(newUser);

    // 保存更新后的用户数据
    savePublisherUsers(userData);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '派单员账号注册成功！欢迎加入抖音派单系统。',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Publisher registration error:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}