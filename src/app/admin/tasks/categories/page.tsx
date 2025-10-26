'use client'
import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';

// 任务分类项组件
interface TaskCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  taskCount: number;
}

const TaskCategoryItem = ({ category }: { category: TaskCategory }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
          <span>{category.icon}</span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{category.name}</div>
          <div className="text-xs text-gray-500">{category.taskCount} 个任务</div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm">
          编辑
        </Button>
        <Button variant="ghost" size="sm">
          删除
        </Button>
      </div>
    </div>
  );
};

export default function TaskCategoriesPage() {
  const [categories] = useState([
    {
      id: 'cat001',
      name: '短视频评论',
      icon: '📱',
      taskCount: 125
    },
    {
      id: 'cat002',
      name: '社交媒体互动',
      icon: '👍',
      taskCount: 89
    },
    {
      id: 'cat003',
      name: '内容评论',
      icon: '📝',
      taskCount: 67
    },
    {
      id: 'cat004',
      name: '问卷调查',
      icon: '📊',
      taskCount: 45
    },
    {
      id: 'cat005',
      name: '应用试玩',
      icon: '🎮',
      taskCount: 32
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">任务分类管理</h1>
        <p className="text-sm text-gray-600">管理平台任务分类和标签</p>
      </div>

      {/* 任务分类统计 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">任务分类列表 ({categories.length})</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <TaskCategoryItem key={category.id} category={category} />
            ))}
          </div>
          
          {/* 添加分类按钮 */}
          <div className="mt-4 flex justify-end">
            <Button variant="secondary">
              添加分类
            </Button>
          </div>
        </Card>
      </div>

      {/* 热门标签 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">热门标签</h3>
          <div className="flex flex-wrap gap-2">
            {['抖音', '快手', '小红书', '微信', '微博', '电商', '测评', '体验', '问答'].map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* 添加标签按钮 */}
          <div className="mt-4 flex justify-end">
            <Button variant="secondary">
              管理标签
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}