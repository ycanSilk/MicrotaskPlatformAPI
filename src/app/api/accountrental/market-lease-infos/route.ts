import { NextResponse } from 'next/server';
import { AccountRentalInfo } from '@/app/accountrental/types';

// 转换外部API数据为前端需要的格式
  const transformLeaseInfoToAccountRentalInfo = (leaseInfo: any): AccountRentalInfo => {
    // 价格处理 - 使用pricePerDay作为价格
    const price = leaseInfo.pricePerDay || 0;
    
    // 创建对象，为所有必填字段提供默认值
    const baseObject: AccountRentalInfo = {
      id: String(leaseInfo.id) || `lease-${Date.now()}`,
      platform: '抖音',
      accountTitle: leaseInfo.title || '抖音账号出租',
      followersRange: '1000-5000',
      engagementRate: '3-5%',
      contentCategory: '生活',
      region: '全国',
      accountAge: '1-2年',
      accountScore: 4.5,
      orderPrice: price,
      price: price,
      rentalDuration: leaseInfo.minLeaseDays || 30,
      minimumRentalHours: 24,
      deliveryTime: 2,
      maxConcurrentUsers: 1,
      responseTime: 1,
      includedFeatures: ['账号登录', '内容发布'],
      description: leaseInfo.description || '抖音账号出租',
      rentalDescription: leaseInfo.description || '抖音账号出租',
      advantages: ['账号活跃', '粉丝真实'],
      restrictions: ['禁止违法内容'],
      isVerified: false,
      rating: 4.5,
      rentalCount: 0,
      availableCount: 1,
      publishTime: leaseInfo.createTime || new Date().toISOString(),
      status: 'ACTIVE',
      images: leaseInfo.images || [],
      publisherName: '系统用户',
      orderNumber: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      orderStatus: '待确认',
      rentalDays: leaseInfo.minLeaseDays || 30
    };
    
    return baseObject;
  };

export async function GET(request: Request) {
  try {
    // 从请求中获取查询参数
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '0';
    const size = url.searchParams.get('size') || '10';
    const sort = url.searchParams.get('sort') || 'createTime';
    const direction = url.searchParams.get('direction') || 'DESC';
    
    // 更新为新的外部API地址
    const externalApiUrl = `http://14.29.178.235:8889/api/lease/market/lease-infos?status=ACTIVE&page=0&size=10&sort=createTime&direction=DESC`;
    
    console.log('请求外部API:', externalApiUrl);
    
    // 调用外部API
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`外部API调用失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('外部API返回数据:', data);
    
    // 根据用户提供的API数据结构，使用data.content来获取数据
    const transformedData = data.data?.content?.map((item: any) => 
      transformLeaseInfoToAccountRentalInfo(item)
    ) || [];
    
    // 返回转换后的数据
    return NextResponse.json({
      success: true,
      data: transformedData,
      total: data.data?.totalElements || 0,
      page: parseInt(page),
      size: parseInt(size)
    });
    
  } catch (error) {
    console.error('获取租赁市场数据失败:', error);
    
    // 返回错误信息，不使用模拟数据
    return NextResponse.json({
      success: false,
      data: [],
      total: 0,
      page: 0,
      size: 10,
      message: error instanceof Error ? error.message : '获取租赁市场数据失败'
    }, {
      status: 500
    });
  }
}