'use client';
import React, { useState } from 'react';
import SimpleWeChatSearchModal from '../components/button/SimpleWeChatSearchModal';

/**
 * 微信风格搜索功能演示页面
 * 展示如何使用WeChatSearchModal组件实现点击搜索图标弹出独立搜索页面的功能
 */
export default function SearchDemoPage() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);

  // 打开搜索模态框
  const handleOpenSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  // 关闭搜索模态框
  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  // 处理搜索逻辑
  const handleSearch = (query: string) => {
    // 保存到搜索历史
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]); // 只保留最近10条搜索历史
    }

    // 模拟搜索结果
    const mockResults = [
      `搜索结果: ${query} (1)`,
      `搜索结果: ${query} (2)`,
      `搜索结果: ${query} (3)`,
    ];
    setSearchResults(mockResults);

    // 在实际项目中，这里可以调用API进行搜索
    console.log('执行搜索:', query);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-lg font-medium">演示页面</h1>
          <button
            onClick={handleOpenSearchModal}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            aria-label="搜索"
          >
            🔍
          </button>
        </div>

        {/* 页面内容 */}
        <div className="p-4">
          <h2 className="text-md font-medium mb-4">微信风格搜索功能演示</h2>
          <p className="text-sm text-gray-600 mb-4">
            点击右上角的搜索图标，体验微信应用中顶部搜索功能的实现效果。
          </p>
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-sm text-blue-700">
              功能特点：<br />
              - 点击搜索图标弹出独立的搜索页面（完整页面模态框，无外边距）<br />
              - 页面仅在顶部区域显示搜索框及"取消"按钮<br />
              - 点击"取消"按钮关闭模态框<br />
              - 自动聚焦到搜索框，支持回车键搜索
            </p>
          </div>

          {/* 搜索历史展示 */}
          {searchHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">搜索历史</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 搜索结果展示 */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">搜索结果预览</h3>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm text-gray-700">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 简化版微信风格搜索模态框 */}
      <SimpleWeChatSearchModal
        isOpen={isSearchModalOpen}
        onClose={handleCloseSearchModal}
        placeholder="搜索任务、订单、银行卡等"
        onSearch={handleSearch}
      />
    </div>
  );
}