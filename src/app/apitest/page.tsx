'use client';

import * as React from 'react';
import { useState } from 'react';

// 定义API响应类型
interface MissionHallResponse {
  code: number;
  message: string;
  data: {
    list: any[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

// 定义API请求参数类型
interface MissionHallRequestParams {
  page: number;
  size: number;
  sortField?: string;
  sortOrder?: string;
  platform?: string;
  taskType?: string;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  Authorization?: string;
}

export default function APITestPage() {
  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<MissionHallResponse | null>(null);
  const [requestParams, setRequestParams] = useState<MissionHallRequestParams>({
    page: 0,
    size: 10,
    sortField: 'createTime',
    sortOrder: 'DESC',
    platform: 'DOUYIN',
    taskType: 'COMMENT'
  });
  const [token, setToken] = useState<string>('');

    // 自定义前端日志函数
  const log = {
    debug: (message: string, data?: any) => {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] [DEBUG] ${message}`, data);
    },
    info: (message: string, data?: any) => {
      const timestamp = new Date().toISOString();
      console.info(`[${timestamp}] [INFO] ${message}`, data);
    },
    error: (message: string, error?: any) => {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] [ERROR] ${message}`, error);
    }
  };

  // API调用函数
  const callMissionHallAPI = async () => {
    const requestId = `frontend-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 重置状态
    setIsLoading(true);
    setError(null);
    setResponseData(null);

    try {
      log.info(`[${requestId}] 开始调用任务大厅API`);
      const startTime = Date.now();
      
      // 构建请求参数，包含token
      const requestData = {
        ...requestParams
      };
      
      // 如果token存在，添加到请求参数中
      if (token.trim()) {
        requestData.Authorization = token.trim();
      }
      
      // 记录请求参数（过滤敏感信息）
      const sanitizedRequestData = { ...requestData };
      if (sanitizedRequestData.Authorization) {
        sanitizedRequestData.Authorization = 'Bearer ****';
      }
      log.info(`[${requestId}] 请求参数`, sanitizedRequestData);
      
      // API调用
      log.debug(`[${requestId}] 发起请求到: /api/public/taskmodule/missionhall`);
      const response = await fetch('/api/public/taskmodule/missionhall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      const endTime = Date.now();
      log.info(`[${requestId}] 请求完成，耗时: ${endTime - startTime}ms，状态码: ${response.status}`);

      // 检查响应状态
      if (!response.ok) {
        const errorMsg = `HTTP错误! 状态码: ${response.status}`;
        log.error(`[${requestId}] 请求失败: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // 解析响应数据
      log.debug(`[${requestId}] 开始解析响应数据`);
      const data = await response.json();
      log.info(`[${requestId}] 响应数据解析完成`, data);
      
      setResponseData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API调用失败';
      log.error(`[${requestId}] API调用异常`, err);
      setError(errorMessage);
    } finally {
      log.info(`[${requestId}] API调用流程结束`);
      setIsLoading(false);
    }
  };

  // 格式化JSON数据为易读字符串
  const formatJsonData = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  // 处理请求参数变化
  const handleParamChange = (field: keyof MissionHallRequestParams, value: any) => {
    setRequestParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API测试页面</h1>
        
        {/* 测试按钮 */}
        <div className="mb-8">
          <button
            onClick={callMissionHallAPI}
            disabled={isLoading}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                调用中...
              </>
            ) : (
              '调用任务大厅API'
            )}
          </button>
        </div>

        {/* 请求参数配置区 */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">请求参数配置</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authorization Token (格式: Bearer xxx)</label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="请输入Authorization Token，例如：Bearer eyJhbGciOiJIUzUxMiJ9..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">页码 (page)</label>
              <input
                type="number"
                min="0"
                value={requestParams.page}
                onChange={(e) => handleParamChange('page', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">每页条数 (size)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={requestParams.size}
                onChange={(e) => handleParamChange('size', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序字段 (sortField)</label>
              <input
                type="text"
                value={requestParams.sortField || ''}
                onChange={(e) => handleParamChange('sortField', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序方向 (sortOrder)</label>
              <select
                value={requestParams.sortOrder || 'DESC'}
                onChange={(e) => handleParamChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ASC">ASC</option>
                <option value="DESC">DESC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">平台 (platform)</label>
              <select
                value={requestParams.platform || 'DOUYIN'}
                onChange={(e) => handleParamChange('platform', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DOUYIN">抖音 (DOUYIN)</option>
                <option value="KUAISHOU">快手 (KUAISHOU)</option>
                <option value="XIAOHONGSHU">小红书 (XIAOHONGSHU)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">任务类型 (taskType)</label>
              <select
                value={requestParams.taskType || 'COMMENT'}
                onChange={(e) => handleParamChange('taskType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="COMMENT">评论 (COMMENT)</option>
                <option value="LIKE">点赞 (LIKE)</option>
                <option value="FOLLOW">关注 (FOLLOW)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 响应结果展示区 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">API响应结果</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-pulse text-gray-500">加载中，请稍候...</div>
              </div>
            ) : error ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">请求失败:</h3>
                <p>{error}</p>
              </div>
            ) : responseData ? (
              <>
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${responseData.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {responseData.success ? '成功' : '失败'}
                  </span>
                  <div className="text-sm text-gray-600 mt-1">
                    状态码: {responseData.code} | 消息: {responseData.message} | 时间戳: {responseData.timestamp}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md overflow-auto max-h-[600px]">
                  <pre className="p-4 text-sm text-gray-800 font-mono">
                    {formatJsonData(responseData)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-center py-12">
                点击上方按钮调用API以查看响应结果
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}