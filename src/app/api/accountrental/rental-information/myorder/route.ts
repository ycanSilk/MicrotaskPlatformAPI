import { NextRequest, NextResponse } from 'next/server';

// 定义接口响应的数据类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp: number;
}

interface PageContent {
  content: any[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}

// GET请求处理函数
export async function GET(request: NextRequest) {
  try {
    // 从请求URL中获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const lessorId = searchParams.get('lessorId') || '3'; // 默认值为3
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';
    const sort = searchParams.get('sort') || 'createTime';
    const direction = searchParams.get('direction') || 'DESC';

    // 构建外部API的URL
    const externalApiUrl = `http://localhost:8889/api/lease/lessor/orders/my?lessorId=${lessorId}&page=${page}&size=${size}&sort=${sort}&direction=${direction}`;

    // 调用外部API
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    });

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    // 获取响应数据
    const data: ApiResponse<PageContent> = await response.json();

    // 返回响应给客户端
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // 错误处理
    console.error('Error fetching rental orders:', error);
    return NextResponse.json(
      {
        code: 500,
        message: error instanceof Error ? error.message : '获取出租订单失败',
        data: null,
        success: false,
        timestamp: Date.now(),
      },
      {
        status: 500,
      }
    );
  }
}