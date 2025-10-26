'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Radio } from '@/components/ui/Radio';
import { Label } from '@/components/ui/Label';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { CopyOutlined, EyeOutlined, CloseOutlined } from '@ant-design/icons';
import AccountCard from '../components/AccountCard';
import AccountRentalLayout from '../layout';
import { AccountRentalInfo } from '../types';

export default function AccountRentalMarketPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountRentalInfo[]>([]);
  
  // 处理返回逻辑
  const handleBack = () => {
    // 检查是否有from参数，如果有且等于commenter-hall，则返回抢单大厅
    const fromParam = searchParams?.from;
    if (fromParam === 'commenter-hall') {
      router.push('/commenter/hall');
    } else {
      // 否则使用浏览器的返回功能
      router.back();
    }
  };
  
  const [loading, setLoading] = useState(true);
  const [displayedAccounts, setDisplayedAccounts] = useState<AccountRentalInfo[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // 静态账号租赁数据
  useEffect(() => {
    setLoading(true);
    
    // 模拟延迟
    setTimeout(() => {
      const mockAccounts: AccountRentalInfo[] = [
        {
          id: '1',
          rentalDescription: '抖音美食账号出租，专注餐厅探店和美食测评，互动率高',
          price: 800,
          publishTime: '2024-06-20T10:30:00Z',
          orderNumber: 'ORD202406201030001',
          orderStatus: '待确认',
          rentalDays: 30,
          images: [
            'images/0e92a4599d02a7.jpg'      
          ]
        },
        {
          id: '2',
          rentalDescription: '美妆博主账号，擅长口红试色和妆容教程，粉丝多为年轻女性',
          price: 600,
          publishTime: '2024-06-19T15:20:00Z',
          orderNumber: 'ORD202406191520002',
          orderStatus: '已确认',
          rentalDays: 15,
          images: [
            'images/0e92a4599d02a7.jpg'      
          ]
        },
        {
          id: '3',
          rentalDescription: '旅游博主账号，高质量旅行攻略和目的地推荐，内容专业',
          price: 2000,
          publishTime: '2024-06-18T09:15:00Z',
          orderNumber: 'ORD202406180915003',
          orderStatus: '进行中',
          rentalDays: 7,
          images: [
            'images/0e92a4599d02a7.jpg'      
          ]
        },
        {
          id: '4',
          rentalDescription: '搞笑视频账号，轻松幽默的内容，深受年轻用户喜爱',
          price: 1200,
          publishTime: '2024-06-21T14:30:00Z',
          orderNumber: 'ORD202406211430004',
          orderStatus: '已完成',
          rentalDays: 30,
          images: [
            'images/0e92a4599d02a7.jpg'      
          ]
        },
        {
          id: '5',
          rentalDescription: '游戏主播账号，技术出众，解说专业，粉丝活跃度高',
          price: 1500,
          publishTime: '2024-06-20T11:20:00Z',
          orderNumber: 'ORD202406201120005',
          orderStatus: '待确认',
          rentalDays: 10,
          images: [
            'images/0e92a4599d02a7.jpg'      
          ]
        },
        {
          id: '6',
          rentalDescription: '生活方式账号，涵盖家居装饰、穿搭和健康饮食内容',
          price: 700,
          publishTime: '2024-06-22T08:45:00Z',
          orderNumber: 'ORD202406220845006',
          orderStatus: '已取消',
          rentalDays: 20,
          images: [
            'images/0e92a4599d02a7.jpg'      
          ]
        },
        {
          id: '7',
          rentalDescription: '数码测评账号，专业产品评测，客观公正，用户信任度高',
          price: 1100,
          publishTime: '2024-06-17T16:10:00Z',
          orderNumber: 'ORD202406171610007',
          orderStatus: '进行中',
          rentalDays: 30,
          images: [
            'images/0e92a4599d02a7.jpg'      
          ]
        }
      ];
      
      setAccounts(mockAccounts);
      setLoading(false);
    }, 500);
  }, []);

  // 使用useMemo优化排序操作，避免不必要的重复计算
  const filteredAccounts = useMemo(() => {
    let result = [...accounts];

    // 按发布时间降序排序
    result.sort((a, b) => {
      return new Date(b.publishTime || '').getTime() - new Date(a.publishTime || '').getTime();
    });

    return result;
  }, [accounts]);

  // 当账号列表变化时，重新设置显示的账号
  useEffect(() => {
    if (filteredAccounts.length > 0) {
      const initialBatch = filteredAccounts.slice(0, itemsPerPage);
      setDisplayedAccounts(initialBatch);
      setHasMore(filteredAccounts.length > initialBatch.length);
    } else {
      setDisplayedAccounts([]);
      setHasMore(false);
    }
  }, [filteredAccounts]);

  // 加载更多账号
  const loadMoreAccounts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      // 模拟网络请求延迟 - 减少延迟时间
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const startIndex = page * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newBatch = filteredAccounts.slice(startIndex, endIndex);
      
      if (newBatch.length > 0) {
        setDisplayedAccounts(prev => [...prev, ...newBatch]);
        setPage(prev => prev + 1);
        setHasMore(endIndex < filteredAccounts.length);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载更多账号失败:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 使用无限滚动钩子
  const { containerRef } = useInfiniteScroll({
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMoreAccounts,
    threshold: 200
  });

  // 已删除搜索相关功能

  // 根据订单状态返回对应的样式类名
  const getOrderStatusClass = (status: string): string => {
    switch (status) {
      case '待确认':
        return 'bg-yellow-100 text-yellow-800';
      case '已确认':
        return 'bg-green-100 text-green-800';
      case '进行中':
        return 'bg-blue-100 text-blue-800';
      case '已完成':
        return 'bg-purple-100 text-purple-800';
      case '已取消':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 格式化发布时间
  const formatPublishTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 处理账号卡片点击
  const handleAccountClick = (accountId: string) => {
    router.push(`/accountrental/account-rental-market/market-detail/${accountId}`);
  };

  // 处理图片点击，显示大图预览
  const handleImageClick = (event: React.MouseEvent, imageUrl: string) => {
    event.stopPropagation();
    setPreviewImage(imageUrl);
  };

  // 关闭图片预览
  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  // 复制订单号
  const copyOrderNumber = (event: React.MouseEvent, orderNumber: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(orderNumber)
      .then(() => {
        setCopySuccess(orderNumber);
        setTimeout(() => {
          setCopySuccess(null);
        }, 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div>加载中...</div>
          <div className="text-xs text-gray-500 mt-2">
            正在获取账号租赁市场数据，请稍候...
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="min-h-screen pb-28 max-w-7xl mx-auto">
      {/* 发布出租账号按钮 */}
      <div className="px-4 pt-4 mb-3">
        <Button 
          onClick={() => router.push('/accountrental/account-rental-publish/publish-for-rent')}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg text-lg font-medium shadow-md transition-all min-h-12 active:scale-95"
        >
          发布出租账号
        </Button>
      </div>

      {/* 筛选和搜索区域 - 优化移动端体验 */}
      <div className="px-4">
          <div className="bg-white rounded-xl">
          </div>
        </div>

              {/* 账号列表 - 添加滚动容器引用 */}
              <div 
                className="px-4"
                ref={containerRef}
                style={{ 
                  overflowY: 'auto'
                }}
              >
                {displayedAccounts.length === 0 && !loading ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                      <div className="text-4xl mb-4">📱</div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">暂无账号</h3>
                      <p className="text-gray-600 mb-4">目前市场上没有可租赁的账号</p>
                    </div>
                ) : (
                  <div className="space-y-4">
                    {displayedAccounts.map(account => (
                      <div 
                        key={account.id} 
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleAccountClick(account.id)}
                      >
                        {/* 图片缩略图区域 */}
                        {account.images && account.images.length > 0 && (
                          <div className="mb-3">
                            <div 
                              className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={(e) => handleImageClick(e, account.images![0])}
                            >
                              <img 
                                src={`/${account.images[0]}`} 
                                alt="账号缩略图" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                                <EyeOutlined className="text-white text-2xl" />
                              </div>
                            </div>
                          </div>
                        )}
                        

                        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{account.rentalDescription}</h3>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                          <div>发布时间: {formatPublishTime(account.publishTime)}</div>
                          <div>出租天数: {account.rentalDays}天</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xl font-bold text-red-600">¥{account.price}</div>
                          <Button className="bg-blue-500 hover:bg-blue-600 text-white">查看详情</Button>
                        </div>
                      </div>
                    ))}

                    {/* 加载更多指示器 */}
                    {loadingMore && (
                      <div className="py-6 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">加载中...</span>
                      </div>
                    )}

                    {/* 没有更多数据时的提示 */}
                    {!hasMore && displayedAccounts.length > 0 && (
                      <div className="py-6 text-center text-gray-500 text-sm">
                        没有更多账号了
                      </div>
                    )}
                  </div>
                )}
              </div>

      {/* 提示信息 */}
      <div className="px-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">账号租赁提示</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                请根据您的需求筛选合适的账号进行租赁。租赁前请仔细查看账号详情和租赁条款，确保账号符合您的推广需求。如有疑问，可联系客服咨询。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 图片预览模态框 */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
              onClick={handleClosePreview}
            >
              <CloseOutlined className="text-xl" />
            </button>
            <img 
              src={`/${previewImage}`} 
              alt="预览图片" 
              className="max-w-full max-h-[85vh] object-contain" 
            />
          </div>
        </div>
      )}

      </div>
    );
}
  