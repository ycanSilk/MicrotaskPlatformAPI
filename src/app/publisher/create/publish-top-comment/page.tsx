'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublisherAuthStorage } from '@/auth';

export default function PublishTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数获取任务信息，确保searchParams不为null
  const getSearchParam = (key: string) => {
    return searchParams?.get(key) || '';
  };
  
  const taskId = getSearchParam('taskId').trim();
  const taskTitle = getSearchParam('title').trim() || '中评任务发布页';
  const taskIcon = getSearchParam('icon').trim() || '📝';
  const taskPrice = parseFloat(getSearchParam('price').trim() || '4');
  const taskDescription = getSearchParam('description').trim() || '任务描述';
  
  // 新的表单数据结构，包含评论和图片上传信息
  // 添加默认信息填充以模拟补单操作
  const [formData, setFormData] = useState({
    videoUrl: 'https://www.douyin.com/video/example', // 默认视频链接
    quantity: 1, // 默认任务数量设为1
    comments: [
      {
        content: '这款产品真的太好了，超出预期！质量做工都很棒，强烈推荐给大家！',
        image: null as File | null
      }
    ],
    deadline: '48' // 默认截止时间设为48小时
  });

  const [isPublishing, setIsPublishing] = useState(false);

  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: '',
    buttonText: '确认',
    onButtonClick: () => {}
  });

  // 显示通用提示框
  const showAlert = (
    title: string, 
    message: string, 
    icon: string, 
    buttonText?: string, 
    onButtonClick?: () => void
  ) => {
    setAlertConfig({
      title, 
      message, 
      icon,
      buttonText: buttonText || '确认',
      onButtonClick: onButtonClick || (() => {})
    });
    setShowAlertModal(true);
  };

  // 任务数量变化处理 - 允许1-10个任务
  const handleQuantityChange = (newQuantity: number) => {
    // 限制数量在1-10之间
    const quantity = Math.max(1, Math.min(10, newQuantity));
    
    setFormData(prevData => {
      // 获取当前评论数量
      const currentCommentCount = prevData.comments.length;
      
      // 如果新的数量大于当前评论数量，添加新的评论项
      if (quantity > currentCommentCount) {
        const newComments = [...prevData.comments];
        for (let i = currentCommentCount; i < quantity; i++) {
          newComments.push({
            content: ``,
            image: null
          });
        }
        return {
          ...prevData,
          quantity,
          comments: newComments
        };
      }
      // 如果新的数量小于当前评论数量，减少评论项
      else if (quantity < currentCommentCount) {
        return {
          ...prevData,
          quantity,
          comments: prevData.comments.slice(0, quantity)
        };
      }
      // 如果数量不变，只更新quantity
      return {
        ...prevData,
        quantity
      };
    });
  };
  
  // AI优化评论功能
  const handleAIOptimizeComments = () => {
    // 模拟AI优化评论的逻辑
    // 实际项目中可能需要调用AI API
    setFormData(prevData => ({
      ...prevData,
      comments: prevData.comments.map(comment => ({
        ...comment,
        content: comment.content + ' [AI优化]'
      }))
    }));
    showAlert('优化成功', '评论内容已通过AI优化！', '✨');
  };

  // 图片压缩函数
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 保持原图宽高比例
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = height * (MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = width * (MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 质量参数，从0到1，1表示最佳质量
          let quality = 0.9;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // 如果压缩后大小仍大于200KB，继续降低质量
          while (compressedDataUrl.length * 0.75 > 200 * 1024 && quality > 0.1) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          
          // 将DataURL转换回File对象
          const byteString = atob(compressedDataUrl.split(',')[1]);
          const mimeString = compressedDataUrl.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          
          const blob = new Blob([ab], { type: mimeString });
          const compressedFile = new File([blob], file.name, { type: mimeString });
          resolve(compressedFile);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // 处理图片上传
  const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 压缩图片
      const compressedFile = await compressImage(file);
      
      // 更新表单数据中的图片
      setFormData(prevData => ({
        ...prevData,
        comments: prevData.comments.map((comment, i) => 
          i === index ? { ...comment, image: compressedFile } : comment
        )
      }));
      
      showAlert('上传成功', '图片已成功上传并压缩！', '✅');
    } catch (error) {
      showAlert('上传失败', '图片上传失败，请重试', '❌');
    }
  };

  // 移除已上传的图片
  const removeImage = (index: number) => {
    setFormData(prevData => ({
      ...prevData,
      comments: prevData.comments.map((comment, i) => 
        i === index ? { ...comment, image: null } : comment
      )
    }));
  };

  // 发布任务
  const handlePublish = async () => {
    // 防止重复提交
    if (isPublishing) {
      return;
    }
    
    // 表单验证 - 完整验证逻辑
    if (!formData.videoUrl) {
      showAlert('输入错误', '请输入视频链接', '⚠️');
      return;
    }
    
    // 验证任务数量
    if (formData.quantity === undefined) {
      showAlert('输入错误', '请输入任务数量', '⚠️');
      return;
    }
    
    // 评论已调整为可选填项，不再强制验证

    // 显示加载状态
    setIsPublishing(true);
    
    // 生成唯一请求ID用于跟踪，确保在整个函数作用域可用
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[任务发布-${requestId}] 开始发布任务...`);
    console.log(`[任务发布-${requestId}] 表单数据:`, formData);
    console.log(`[任务发布-${requestId}] 任务ID:`, taskId);

    try {
      // 使用PublisherAuthStorage获取认证token和用户信息
      const auth = PublisherAuthStorage.getAuth();
      const token = auth?.token;
      const userInfo = PublisherAuthStorage.getCurrentUser();
      
      console.log('[任务发布] 认证信息:', { token: token ? '存在' : '不存在', userInfo });
      
      if (!token || !userInfo) {
        console.log('[任务发布] 认证失败: 用户未登录或会话已过期');
        showAlert('认证失败', '用户未登录，请重新登录', '❌');
        // 使用setTimeout延迟跳转，确保用户看到提示
        setTimeout(() => {
          router.push('/publisher/login' as any);
        }, 1500);
        return;
      }

      // 计算总费用
      const totalCost = taskPrice * formData.quantity;
      
      // 余额校验 - 获取当前用户的可用余额
      console.log('[任务发布] 开始余额校验，总费用:', totalCost);
      const balanceResponse = await fetch('/api/publisher/finance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      const balanceData = await balanceResponse.json();
      console.log('[任务发布] 余额校验结果:', balanceData);
      
      if (!balanceData.success || !balanceData.data) {
        console.log('[任务发布] 获取余额失败');
        showAlert('系统错误', '获取账户余额失败，请稍后重试', '❌');
        return;
      }
      
      // 获取可用余额
      const availableBalance = balanceData.data.balance?.available || 0;
      console.log('[任务发布] 当前可用余额:', availableBalance);
      
      // 比较余额和总费用
      if (availableBalance < totalCost) {
        console.log('[任务发布] 余额不足，可用余额:', availableBalance, '总费用:', totalCost);
        showAlert(
          '余额不足', 
          `您的账户可用余额为 ¥${availableBalance.toFixed(2)}，完成此任务需要 ¥${totalCost.toFixed(2)}，请先充值再发布任务。`, 
          '⚠️'
        );
        return;
      }
      
      console.log('[任务发布] 余额充足，继续发布流程');

      // 构建API请求体 - 将所有评论合并为一个requirements字段
      const requirements = formData.comments.map(comment => comment.content).join('\n\n');
      const requestBody = {
        taskId: taskId || '',
        taskTitle,
        taskPrice: taskPrice,
        requirements: requirements,
        videoUrl: formData.videoUrl,
        quantity: formData.quantity,
        deadline: formData.deadline,
        needImageComment: true // 由于我们总是允许图片上传，设为true
      };

      console.log('API请求体:', requestBody);
      
      console.log(`[任务发布-${requestId}] 即将发送API请求，时间戳: ${Date.now()}`);
      
      // 调用API发布任务
      const response = await fetch('/api/publisher/comment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Request-ID': requestId // 添加请求ID头
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log(`[任务发布-${requestId}] API响应状态: ${response.status}, 接收时间: ${Date.now()}`);

      const result = await response.json();
      console.log(`[任务发布-${requestId}] API响应结果:`, result);
      
      if (result.success) {
        console.log(`[任务发布-${requestId}] 任务发布成功，即将显示成功提示`);
        // 修改为用户点击确认后才跳转
        showAlert(
          '发布成功', 
          `任务发布成功！订单号：${result.order?.orderNumber || ''}`, 
          '✅',
          '确定',
          () => {
            console.log(`[任务发布-${requestId}] 用户确认成功，准备跳转`);
            // 在用户点击确认按钮后跳转
            router.push('/publisher/dashboard');
          }
        );
      } else {
        // 发布失败，显示错误提示
        if (result.errorType === 'InsufficientBalance') {
          // 特定处理余额不足的情况
          showAlert('账户余额不足', '您的账户余额不足以支付任务费用，请先充值后再尝试发布任务。', '⚠️', '前往充值', () => {
            router.push('/publisher/finance');
          });
        } else {
          showAlert('发布失败', `任务发布失败: ${result.message || '未知错误'}`, '❌');
        }
      }
    } catch (error) {
      console.error(`[任务发布-${requestId}] 发布任务时发生错误:`, error);
      showAlert('网络错误', '发布任务时发生错误，请稍后重试', '⚠️');
    } finally {
      console.log(`[任务发布-${requestId}] 发布流程结束，重置发布状态`);
      setIsPublishing(false);
    }
  };

  const totalCost = (taskPrice * formData.quantity).toFixed(2);

  // 如果没有找到任务类型，返回错误页面
  if (!taskId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">❌</div>
          <div className="text-lg font-medium text-gray-800 mb-2">任务信息不完整</div>
          <Button 
            onClick={() => router.push('/publisher/create')}
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回选择任务
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
       <div className="px-4 py-3 space-y-4">

        <div className="text-lg text-red-500">
          <span className="text-2xl text-red-500">⚠️</span>提示：发布评论需求请规避抖音平台敏感词，否则会无法完成任务导致浪费宝贵时间。
        </div>

        {/* 视频链接 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            视频链接 <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="请输入抖音视频链接"
            value={formData.videoUrl}
            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
            className="w-full"
          />
        </div>

        {/* 截止时间 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务截止时间
          </label>
          <select 
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          >
            <option value="0.5">30分钟内</option>
            <option value="12">12小时</option>
            <option value="24">24小时</option>
          </select>
        </div>

        {/* 评论内容 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            评论内容
          </label>
          
          {/* AI优化评论功能按钮 */}
          <div className="mb-4">
            <Button 
              onClick={handleAIOptimizeComments}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              AI评论
            </Button>
          </div>
          
          {/* 动态渲染评论输入框 */}
          {formData.comments.map((comment, index) => (
            <div key={index} className="mb-4 py-2 border-b border-gray-200 last:border-b-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上评评论 {index + 1}
              </label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder={`请输入上评评论内容`}
                value={comment.content}
                onChange={(e) => {
                  const newComments = [...formData.comments];
                  newComments[index] = {...newComments[index], content: e.target.value};
                  setFormData({...formData, comments: newComments});
                }}
              />
                  
                  {/* 图片上传区域 */}
                  <div className="mt-1">
                    <div className="flex items-end space-x-3">
                      <div 
                        className={`w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${comment.image ? 'border-green-500' : 'border-gray-300 hover:border-blue-500'}`}
                        onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                      >
                        {comment.image ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={URL.createObjectURL(comment.image)} 
                              alt={`上评评论图片 ${index + 1}`} 
                              className="w-full h-full object-cover rounded"
                            />
                            <button 
                              type="button"
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xl">+</span>
                            <span className="text-xs text-gray-500 mt-1">点击上传图片</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        支持JPG、PNG格式，最大200KB
                      </div>
                    </div>
                    <input
                      id={`image-upload-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e)}
                      className="hidden"
                    />
                  </div>
                </div>
          ))}

        </div>

        {/* 任务数量 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务数量 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleQuantityChange(formData.quantity - 1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${formData.quantity <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
              disabled={formData.quantity <= 1}
            >
              -
            </button>
            <div className="flex-1">
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => handleQuantityChange(formData.quantity + 1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${formData.quantity >= 10 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
              disabled={formData.quantity >= 10}
            >
              +
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            上评任务单价为¥{taskPrice}，最多可发布10个任务
          </div>
        </div>

        {/* 费用预览 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">费用预览</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">任务费用</span>
              <span className="font-bold text-lg">¥{(taskPrice * formData.quantity).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">总计费用</span>
                <span className="font-bold text-lg text-orange-500">¥{totalCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定发布按钮 - 增强表单提交控制 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        <Button 
          onClick={handlePublish}
          disabled={!formData.videoUrl || formData.quantity === undefined || isPublishing}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
        >
          立即发布任务 - ¥{totalCost}
        </Button>
        <Button 
          onClick={() => router.back()}
          variant="secondary"
          className="w-full py-3 border border-gray-200 text-gray-700 rounded-2xl"
        >
          取消
        </Button>
      </div>

      {/* 通用提示框组件 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        buttonText={alertConfig.buttonText}
        onButtonClick={() => {
          alertConfig.onButtonClick();
          setShowAlertModal(false);
        }}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}