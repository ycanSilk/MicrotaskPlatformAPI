import { NextRequest, NextResponse } from 'next/server';

// 定义排序信息接口
interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

// 定义分页信息接口
interface Pageable {
  offset: number;
  pageSize: number;
  pageNumber: number;
  sort: Sort;
  paged: boolean;
  unpaged: boolean;
}

// 定义出租请求项接口
interface RentRequestItem {
  id: number;
  userId: number;
  title: string;
  description: string;
  accountType: string;
  pricePerDay: number;
  depositAmount: number;
  minLeaseDays: number;
  maxLeaseDays: number;
  status: string; // PENDING, ACTIVE, INACTIVE等
  createTime: string;
  updateTime: string;
  username: string;
}

// 定义数据响应接口
interface DataResponse {
  totalPages: number;
  totalElements: number;
  size: number;
  content: RentRequestItem[];
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: Pageable;
  sort: Sort;
  empty: boolean;
}

// 定义完整API响应类型
interface ApiResponse {
  code: number;
  message: string;
  data: DataResponse;
  success: boolean;
  timestamp: number;
}

export async function GET(request: NextRequest) {
  // 从查询参数中获取值
  const userId = request.nextUrl.searchParams.get('userId') || '3';
  const page = request.nextUrl.searchParams.get('page') || '0';
  const size = request.nextUrl.searchParams.get('size') || '10';
  const sort = request.nextUrl.searchParams.get('sort') || 'createTime';
  const direction = request.nextUrl.searchParams.get('direction') || 'DESC';

  console.log(`获取用户${userId}的出租信息，页码: ${page}，每页大小: ${size}`);

  try {
    // 修复：使用动态参数构建URL
    const externalApiUrl = `http://localhost:8889/api/lease/lessor/lease-infos/my?userId=${userId}&page=${page}&size=${size}&sort=${sort}&direction=${direction}`;

    console.log('调用外部API URL:', externalApiUrl);

    // 调用外部API
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
    });

    // 检查响应状态
    if (!response.ok) {
      const errorMessage = `外部API调用失败，状态码: ${response.status}`;
      console.error(errorMessage);
      
      // 尝试获取错误详情
      let errorDetail = '';
      try {
        const errorResponse = await response.text();
        errorDetail = errorResponse;
      } catch (e) {
        errorDetail = '无法读取错误详情';
      }
      
      console.error('错误详情:', errorDetail);
      
      return NextResponse.json<ApiResponse>({
        code: response.status,
        message: `${errorMessage} - ${errorDetail}`,
        success: false,
        timestamp: Date.now(),
        data: {
          totalPages: 0,
          totalElements: 0,
          size: parseInt(size),
          content: [],
          number: parseInt(page),
          first: true,
          last: true,
          numberOfElements: 0,
          pageable: {
            offset: 0,
            pageSize: parseInt(size),
            pageNumber: parseInt(page),
            sort: {
              empty: true,
              sorted: false,
              unsorted: true
            },
            paged: true,
            unpaged: false
          },
          sort: {
            empty: true,
            sorted: false,
            unsorted: true
          },
          empty: true
        }
      }, { status: 500 });
    }

    // 解析响应数据
    const externalData = await response.json();
    
    console.log('外部API响应数据:', JSON.stringify(externalData, null, 2));

 

    // 直接返回外部API的原始响应数据
    return NextResponse.json(externalData, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取出租信息时发生未知错误';
    console.error('获取出租信息失败:', error);
    
    // 确保在错误情况下也返回完整的响应
    return NextResponse.json<ApiResponse>({
      code: 500,
      message: errorMessage,
      success: false,
      timestamp: Date.now(),
      data: {
        totalPages: 0,
        totalElements: 0,
        size: parseInt(size),
        content: [],
        number: parseInt(page),
        first: true,
        last: true,
        numberOfElements: 0,
        pageable: {
          offset: 0,
          pageSize: parseInt(size),
          pageNumber: parseInt(page),
          sort: {
            empty: true,
            sorted: false,
            unsorted: true
          },
          paged: true,
          unpaged: false
        },
        sort: {
          empty: true,
          sorted: false,
          unsorted: true
        },
        empty: true
      }
    }, { status: 500 });
  }
}