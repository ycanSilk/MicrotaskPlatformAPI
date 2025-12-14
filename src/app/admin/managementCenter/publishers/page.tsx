'use client'
import { Card, Button, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';

// 定义与后端API响应匹配的数据类型
interface Commenter {
  id: string;
  username: string;
  email: string;
  phone: string;
  createTime: string;
  parentId: string | null;
	companyName: string;
	contactPerson: string;
	userType: string;
	subAccountCount: number;
}

interface APIResponse {
  code: number;
  message: string;
  data: {
    list: Commenter[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

// 评论员卡片组件
const CommenterCard = ({ user }: { user: Commenter }) => {
  return (
    <Card>
      <div className="">用户名：{user.username}</div>
      <div className="">用户ID: {user.id}</div>
      <div className="">邮箱：{user.email}</div>
      <div className="">手机号：{user.phone}</div>
      <div className="">注册时间: {user.createTime}</div>
      <div className="">父用户ID: {user.parentId}</div>
      <div className="">公司名称: {user.companyName}</div>
      <div className="">负责人: {user.contactPerson}</div>
      <div className="">用户类型: {user.userType === 'MAIN' ? '主账号' : '子账号'}</div>
      <div className="">子账号数量: {user.subAccountCount}</div>
      <div className="flex space-x-2 mt-2">
        <Button variant="secondary" size="sm" className="flex-1">
          查看详情
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          管理
        </Button>
      </div>
    </Card>
  );
};

export default function CommenterManagementPage() {
  const [commenters, setCommenters] = useState<Commenter[]>([]);
  const [allCommenters, setAllCommenters] = useState<Commenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 每页显示条数

  // 本地搜索功能
  const handleSearch = () => {
    try {
      setLoading(true);
      // 根据搜索条件筛选本地数据
      const filteredCommenters = allCommenters.filter(commenter => {
        // 转换为小写以便不区分大小写搜索
        const searchLower = searchQuery.toLowerCase();
        // 匹配用户名、ID或手机号
        return (
          commenter.username.toLowerCase().includes(searchLower) ||
          commenter.id.includes(searchLower) ||
          commenter.phone.includes(searchLower)
        );
      });
      // 更新显示的评论员列表
      setCommenters(filteredCommenters);
      // 搜索后重置到第一页
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时调用后端API获取完整数据
    useEffect(() => {
      const fetchCommenters = async () => {
        try {
          const response = await fetch('/api/public/users/getbizuserlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for authentication
            body: JSON.stringify({
              page: 0,
              size: 10
            }),
          });

          if (response.status === 401) {
            // 处理未登录或认证失败的情况
            setError('未登录或认证已过期，请重新登录');
            return;
          }

          if (!response.ok) {
            throw new Error('Failed to fetch commenters');
          }

          const result: APIResponse = await response.json();
          console.log('请求url', '/api/public/users/getbizuserlist');
          console.log('这是获取派单用户列表API返回的原始响应:', result);

          if (result.success && (result.code === 1 || result.code === 200)) {
            const commentersData = result.data.list || [];
            setAllCommenters(commentersData); // 存储完整数据
            setCommenters(commentersData); // 初始显示完整数据
          } else {
            throw new Error(result.message || 'Failed to fetch commenters');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchCommenters();
    }, []);

  const totalPages = Math.ceil(commenters.length / pageSize);

  // Pagination handlers
  const handleFirstPage = () => setCurrentPage(1);
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handleLastPage = () => setCurrentPage(totalPages);
  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">派单用户管理</h1>
        <p className="text-sm text-gray-600">管理派单用户账号</p>
      </div>

      {/* 搜索栏和每页条数选择 */}
      <div className="px-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="输入用户名、ID或手机号搜索"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
          <Button variant="primary" size="sm" className="self-stretch sm:self-auto px-5" onClick={handleSearch}>
             搜索
           </Button>
        </div>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="px-4 py-8 text-center">加载中...</div>
      ) : error ? (
        <div className="px-4 py-8 text-red-600">错误: {error}</div>
      ) : (
        <>        
          {/* 评论员列表 */}
          <div className="px-4 space-y-3">
            {commenters.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((commenter) => (
              <CommenterCard key={commenter.id} user={commenter} />
            ))}
          </div>

          {/* Pagination */}
          <div className="px-4 py-4">
            <div className="text-sm text-center mb-3"> 总共 {commenters.length} 条记录，共 {totalPages} 页 </div>
            <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handleFirstPage}
                  disabled={currentPage === 1}
                  className="p-2"
                >
                  首页
                </Button>
                <Button
                  variant="ghost"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2"
                >
                  上一页
                </Button>
                
                {/* Show page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show current page, 2 pages before/after, and first/last pages
                    return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis for gaps
                    if (index > 0 && array[index] - array[index - 1] > 1) {
                      return (
                        <span key={`ellipsis-${page}`} className="p-2 text-gray-500">...</span>
                      );
                    }
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "primary" : "ghost"}
                        onClick={() => handlePageChange(page)}
                        className={`p-2 ${page === currentPage ? 'bg-blue-500 text-white' : ''}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                
                <Button
                  variant="ghost"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2"
                >
                  下一页
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLastPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2"
                >
                  末页
                </Button>
            </div>
            </div>
        </>
      )}
    </div>
  );
}