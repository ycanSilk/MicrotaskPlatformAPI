'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface OrderData {
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  budget?: number;
  subOrderCount?: number;
}

export default function SupplementaryOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData>({});
  
  // 从URL参数获取任务信息，确保searchParams不为null
  const getSearchParam = (key: string) => {
    return searchParams?.get(key) || '';
  };
  
  // 从URL参数获取订单信息
  useEffect(() => {
    if (!searchParams) return;
    const reorder = getSearchParam('reorder');
    if (reorder === 'true' || reorder === '') {
      const orderId = getSearchParam('orderId');
      const title = getSearchParam('title');
      const description = getSearchParam('description');
      const type = getSearchParam('type');
      const budget = getSearchParam('budget');
      const subOrderCount = getSearchParam('subOrderCount');

      const data: OrderData = {};
      if (orderId) data.id = orderId;
      if (title) data.title = title;
      if (description) data.description = description;
      if (type) data.type = type;
      if (budget) data.budget = parseFloat(budget);
      if (subOrderCount) data.subOrderCount = parseInt(subOrderCount, 10);

      setOrderData(data);
    }
  }, [searchParams]);
  
  // @用户相关状态
  const [mentionInput, setMentionInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  
  // 新的表单数据结构 - 所有内容都已默认填充
  const [formData, setFormData] = useState({
    // 预设视频链接，确保发布按钮可用
    videoUrl: 'https://www.douyin.com/video/7355624132482887973',
    
    // 评论模块 - 默认3条，已预设评论内容
    commentQuantity: 3,
    comments: [
      {
        content: '🔺这个产品真的很棒，使用后效果超出预期，强烈推荐给大家！',
        image: null as File | null
      },
      {
        content: '🔺性价比很高，质量也不错，物流速度快，服务态度好，下次还会购买。',
        image: null as File | null
      },
      {
        content: '🔺收到货后非常满意，和描述的一样好，朋友看到后也想要购买链接。',
        image: null as File | null
      }
    ],
    deadline: '24'
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

  // 处理评论数量变化，实现与评论输入框的联动
  const handleCommentQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(0, newQuantity); // 允许数量为0，实现完全移除
    setFormData(prevData => {
      let newComments = [...prevData.comments];
      
      // 如果新数量大于现有评论数量，添加新评论
      while (newComments.length < quantity) {
        newComments.push({
          content: `🔺补单评论${newComments.length + 1}，请输入评论内容`,
          image: null
        });
      }
      
      // 如果新数量小于现有评论数量，移除多余评论
      if (newComments.length > quantity) {
        newComments.splice(quantity);
      }
      
      // 检查是否有@用户标记，如果有，确保它在最新的最后一条评论中
      if (mentions.length > 0 && quantity > 0) {
        // 先从所有评论中移除@用户标记
        newComments = newComments.map(comment => ({
          ...comment,
          content: comment.content.replace(/ @\S+/g, '')
        }));
        
        // 然后将@用户标记添加到最新的最后一条评论
        const lastIndex = newComments.length - 1;
        newComments[lastIndex] = {
          ...newComments[lastIndex],
          content: newComments[lastIndex].content 
            ? `${newComments[lastIndex].content} @${mentions[0]}` 
            : `@${mentions[0]}`
        };
      }
      
      return {
        ...prevData,
        commentQuantity: quantity,
        comments: newComments
      };
    });
  };
  
  // 处理添加@用户标记
  const handleAddMention = () => {
    const trimmedMention = mentionInput.trim();
    
    // 1. 检查是否已经有一个@用户（限制数量为1）
    if (mentions.length >= 1) {
      showAlert('提示', '仅支持添加一个@用户', '💡');
      return;
    }
    
    // 2. 非法字符校验（只允许字母、数字、下划线、中文和@符号）
    const validPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5@]+$/;
    if (!validPattern.test(trimmedMention)) {
      showAlert('提示', '用户ID或昵称包含非法字符，仅支持字母、数字、下划线和中文', '⚠️');
      return;
    }
    
    // 3. 确保用户昵称ID唯一
    if (trimmedMention && !mentions.includes(trimmedMention)) {
      setMentions([trimmedMention]); // 只保留一个用户
      setMentionInput('');
      
      // 将@标记插入到评论列表的最后一条
      if (formData.comments.length > 0) {
        const lastIndex = formData.comments.length - 1;
        setFormData(prevData => ({
          ...prevData,
          comments: prevData.comments.map((comment, index) => 
            index === lastIndex 
              ? { 
                  ...comment, 
                  content: comment.content 
                    ? `${comment.content} @${trimmedMention}` 
                    : `@${trimmedMention}` 
                } 
              : comment
          )
        }));
      }
    } else if (mentions.includes(trimmedMention)) {
      showAlert('提示', '该用户昵称ID已添加', '💡');
    }
  };
  
  // 移除@用户标记
  const removeMention = (mention: string) => {
    setMentions(mentions.filter(m => m !== mention));
    
    // 从评论中移除该@标记
    setFormData(prevData => ({
      ...prevData,
      comments: prevData.comments.map(comment => ({
        ...comment,
        content: comment.content?.replace(` @${mention}`, '').replace(`@${mention}`, '') || comment.content
      }))
    }));
  };

  // AI优化评论功能
  const handleAICommentOptimize = () => {
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

  // 处理评论图片上传
  const handleCommentImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
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
  const removeCommentImage = (index: number) => {
    setFormData(prevData => ({
      ...prevData,
      comments: prevData.comments.map((comment, i) => 
        i === index ? { ...comment, image: null } : comment
      )
    }));
  };

  // 发布任务
  const handlePublish = async () => {
    // 表单验证
    if (!formData.videoUrl) {
      showAlert('输入错误', '请输入视频链接', '⚠️');
      return;
    }
    
    // 验证任务数量
    if (formData.commentQuantity === undefined) {
      showAlert('输入错误', '请输入任务数量', '⚠️');
      return;
    }

    // 显示加载状态
    setIsPublishing(true);
    console.log('开始发布补单...');
    console.log('表单数据:', formData);
    console.log('原订单信息:', orderData);

    try {
      // 使用PublisherAuthStorage获取认证token和用户信息
      const auth = PublisherAuthStorage.getAuth();
      const token = auth?.token;
      const userInfo = PublisherAuthStorage.getCurrentUser();
      
      console.log('[补单发布] 认证信息:', { token: token ? '存在' : '不存在', userInfo });
      
      if (!token || !userInfo) {
        console.log('[补单发布] 认证失败: 用户未登录或会话已过期');
        showAlert('认证失败', '用户未登录，请重新登录', '❌');
        // 使用setTimeout延迟跳转，确保用户看到提示
        setTimeout(() => {
          router.push('/publisher/login' as any);
        }, 1500);
        return;
      }

      // 计算总费用 - 基于补单任务数量
      // 这里使用默认价格2元/条，可以根据需要从orderData中获取
      const unitPrice = orderData.budget && orderData.subOrderCount 
        ? orderData.budget / orderData.subOrderCount 
        : 2;
      const totalCost = unitPrice * formData.commentQuantity;
      
      // 余额校验 - 获取当前用户的可用余额
      console.log('[补单发布] 开始余额校验，总费用:', totalCost);
      const balanceResponse = await fetch('/api/publisher/finance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      const balanceData = await balanceResponse.json();
      console.log('[补单发布] 余额校验结果:', balanceData);
      
      if (!balanceData.success || !balanceData.data) {
        console.log('[补单发布] 获取余额失败');
        showAlert('系统错误', '获取账户余额失败，请稍后重试', '❌');
        return;
      }
      
      // 获取可用余额
      const availableBalance = balanceData.data.balance?.available || 0;
      console.log('[补单发布] 当前可用余额:', availableBalance);
      
      // 比较余额和总费用
      if (availableBalance < totalCost) {
        console.log('[补单发布] 余额不足，可用余额:', availableBalance, '总费用:', totalCost);
        showAlert(
          '余额不足', 
          `您的账户可用余额为 ¥${availableBalance.toFixed(2)}，完成此任务需要 ¥${totalCost.toFixed(2)}，请先充值再发布任务。`, 
          '⚠️'
        );
        return;
      }
      
      console.log('[补单发布] 余额充足，继续发布流程');

      // 构建API请求体
      const requirements = `${formData.comments.map(comment => comment.content).join('\n\n')}`;
      const requestBody = {
        originalOrderId: orderData.id || '',
        taskTitle: orderData.title || '补单任务',
        taskPrice: unitPrice,
        requirements: requirements,
        videoUrl: formData.videoUrl,
        quantity: formData.commentQuantity,
        deadline: formData.deadline,
        mentions: mentions,
        needImageComment: true // 由于我们总是允许图片上传，设为true
      };

      console.log('API请求体:', requestBody);
      
      // 调用API发布补单
      const response = await fetch('/api/publisher/comment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('API响应状态:', response.status);

      const result = await response.json();
      console.log('API响应结果:', result);
      
      if (result.success) {
        // 修改为用户点击确认后才跳转
        showAlert(
          '发布成功', 
          `补单发布成功！订单号：${result.order?.orderNumber || ''}`, 
          '✅',
          '确定',
          () => {
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
          showAlert('发布失败', `补单发布失败: ${result.message || '未知错误'}`, '❌');
        }
      }
    } catch (error) {
      console.error('发布补单时发生错误:', error);
      showAlert('网络错误', '发布补单时发生错误，请稍后重试', '⚠️');
    } finally {
      setIsPublishing(false);
    }
  };

  // 价格计算
  const unitPrice = orderData.budget && orderData.subOrderCount 
    ? orderData.budget / orderData.subOrderCount 
    : 2;
  const totalCost = (unitPrice * formData.commentQuantity).toFixed(2);

  // 如果没有找到原订单信息，返回错误页面
  if (!orderData.id && getSearchParam('reorder') !== '') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">❌</div>
          <div className="text-lg font-medium text-gray-800 mb-2">订单信息不完整</div>
          <Button 
            onClick={() => router.push('/publisher/dashboard')}
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回任务管理
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-3 space-y-4">
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

        {/* 评论模块 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            补单评论
          </label>
          
          {/* AI优化评论功能按钮 */}
          <div className="mb-4">
            <Button 
              onClick={handleAICommentOptimize}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              AI优化评论
            </Button>
          </div>
          
          {/* 动态生成评论输入框 */}
          {formData.comments.map((comment, index) => {
            return (
              <div key={index} className="mb-1 py-2 border-b border-gray-900">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  补单评论{index + 1}
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder={`请输入评论内容`}
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
                      onClick={() => document.getElementById(`comment-image-upload-${index}`)?.click()}
                    >
                      {comment.image ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={URL.createObjectURL(comment.image)} 
                            alt={`补单评论${index + 1}图片`} 
                            className="w-full h-full object-cover rounded"
                          />
                          <button 
                            type="button"
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCommentImage(index);
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
                    id={`comment-image-upload-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCommentImageUpload(index, e)}
                    className="hidden"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* @用户标记 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            @用户标记
          </label>
          <span className="text-sm text-red-500">@用户昵称 请使用抖音唯一名字，如有相同名字请截图发送给评论员识别，否则会造成不便和结算纠纷</span>
          <div className="space-y-3">
            <Input
              placeholder="输入用户ID或昵称（仅支持字母、数字、下划线和中文）"
              value={mentionInput}
              onChange={(e) => setMentionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (!mentions.length && handleAddMention())}
              className="w-full"
              disabled={mentions.length >= 1}
            />
            <Button 
              onClick={handleAddMention}
              className={`w-full py-2 rounded-lg transition-colors ${mentions.length >= 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              disabled={mentions.length >= 1}
            >
              {mentions.length >= 1 ? '已添加用户标记' : '添加用户标记'}
            </Button>
          </div>
          {mentions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {mentions.map((mention, index) => (
                <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <span>@{mention}</span>
                  <button 
                    onClick={() => removeMention(mention)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 任务数量 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            补单任务数量 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleCommentQuantityChange(Math.max(1, formData.commentQuantity - 1))}
              className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center text-lg font-bold transition-colors"
            >
              -
            </button>
            <div className="flex-1">
              <Input
                type="number"
                min="1"
                value={formData.commentQuantity.toString()}
                onChange={(e) => handleCommentQuantityChange(parseInt(e.target.value) || 1)}
                className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => handleCommentQuantityChange(formData.commentQuantity + 1)}
              className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            补单任务单价为¥{unitPrice.toFixed(1)}
          </div>
        </div>

        {/* 费用预览 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between">
                <span className="font-medium text-gray-900">总计费用</span>
                <span className="font-bold text-lg text-orange-500">¥{totalCost}</span>
            </div>
        </div>
      </div>

      {/* 底部固定发布按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        <Button 
            onClick={handlePublish}
            disabled={!formData.videoUrl || formData.commentQuantity === undefined}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
          >
            立即发布补单 - ¥{totalCost}
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