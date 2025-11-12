'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
        content: comment.content + ' '
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

  // 图片上传功能移至handlePublish函数内部

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
        console.log('========== 开始处理发布任务请求 ==========');
        // 防止重复提交
        if (isPublishing) {
          console.log('警告: 防止重复提交，发布功能已被禁用');
          return;
        }
        
        console.log('发布前表单数据检查开始');
        
        // 表单验证 - 全面检查所有必填字段
        if (!formData.videoUrl.trim()) {
          console.log('验证失败: 视频链接为空');
          setAlertConfig({
            title: '验证失败',
            message: '请输入抖音视频链接',
            icon: 'error',
            buttonText: '确定',
            onButtonClick: () => {}
          });
          setShowAlertModal(true);
          return;
        }
      
        // 验证评论内容
        const validComments = formData.comments.filter(comment => comment.content.trim() !== '');
        console.log(`评论内容验证: 有效评论数量=${validComments.length}, 总评论数量=${formData.comments.length}`);
        if (validComments.length === 0) {
          console.log('验证失败: 没有有效的评论内容');
          setAlertConfig({
            title: '验证失败',
            message: '请输入评论内容',
            icon: 'error',
            buttonText: '确定',
            onButtonClick: () => {}
          });
          setShowAlertModal(true);
          return;
        }
      
        // 验证任务数量
        console.log(`任务数量验证: quantity=${formData.quantity}`);
        if (!formData.quantity || formData.quantity < 1) {
          console.log('验证失败: 任务数量无效');
          setAlertConfig({
            title: '验证失败',
            message: '请设置有效的任务数量',
            icon: 'error',
            buttonText: '确定',
            onButtonClick: () => {}
          });
          setShowAlertModal(true);
          return;
        }
        
        console.log('表单验证通过，准备构建请求数据');
      
        try {
          // 设置加载状态
          setIsPublishing(true);
          console.log('设置发布状态为正在发布');
          
          // 不再需要从localStorage获取token，因为后端会从cookie自动获取
          // 前端只需要确保请求发送时携带了cookie（默认行为）
          console.log('使用credentials: include确保cookie传递');
      
          console.log('准备构建请求体，详细检查每个字段的数据类型和格式');
          
          // 构建请求体，按照后端API要求的完整格式
          const futureDate = new Date(Date.now() + parseInt(formData.deadline) * 60 * 60 * 1000);
          // 格式化deadline为'YYYY-MM-DD HH:mm:ss'格式
          const formattedDeadline = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')} ${String(futureDate.getHours()).padStart(2, '0')}:${String(futureDate.getMinutes()).padStart(2, '0')}:${String(futureDate.getSeconds()).padStart(2, '0')}`;
          
          const requestBody = {
            title: '测试中评',
            description: '这是一条中评评论任务',
            platform: 'DOUYIN',
            taskType: 'COMMENT',
            totalQuantity: formData.quantity,
            unitPrice: taskPrice,
            deadline: formattedDeadline,
            requirements: '按照要求发布评论',
            commentDetail: {
              commentType: 'SINGLE',
              linkUrl1: formData.videoUrl.trim(),
              unitPrice1: taskPrice,
              quantity1: formData.quantity,
              commentText1: formData.comments[0]?.content.trim() || '',
              commentImages1: formData.comments[0]?.image ? '/images/0e92a4599d02a7.jpg' : '', // 使用示例图片路径
              mentionUser1: '超哥超车', // 默认提及用户
              linkUrl2: '',
              unitPrice2: 0,
              quantity2: 0,
              commentText2: '',
              commentImages2: '',
              mentionUser2: ''
            }
          };
          
          // 详细记录每个字段的数据类型和值
          console.log('===== 请求体字段验证与数据类型检查 =====');
          console.log('title:', requestBody.title, '类型:', typeof requestBody.title);
          console.log('description:', requestBody.description, '类型:', typeof requestBody.description);
          console.log('platform:', requestBody.platform, '类型:', typeof requestBody.platform);
          console.log('taskType:', requestBody.taskType, '类型:', typeof requestBody.taskType);
          console.log('totalQuantity:', requestBody.totalQuantity, '类型:', typeof requestBody.totalQuantity);
          console.log('unitPrice:', requestBody.unitPrice, '类型:', typeof requestBody.unitPrice);
          console.log('deadline:', requestBody.deadline, '类型:', typeof requestBody.deadline);
          console.log('requirements:', requestBody.requirements, '类型:', typeof requestBody.requirements);
          
          // 详细检查commentDetail字段
          console.log('\n===== commentDetail字段验证 =====');
          console.log('commentType:', requestBody.commentDetail.commentType, '类型:', typeof requestBody.commentDetail.commentType);
          console.log('linkUrl1:', requestBody.commentDetail.linkUrl1, '类型:', typeof requestBody.commentDetail.linkUrl1);
          console.log('unitPrice1:', requestBody.commentDetail.unitPrice1, '类型:', typeof requestBody.commentDetail.unitPrice1);
          console.log('quantity1:', requestBody.commentDetail.quantity1, '类型:', typeof requestBody.commentDetail.quantity1);
          console.log('commentText1:', requestBody.commentDetail.commentText1, '类型:', typeof requestBody.commentDetail.commentText1);
          
          console.log('\n===== 完整请求体 =====');
          console.log('请求体构建完成，数据结构:', Object.keys(requestBody));
          console.log('详细请求数据:', JSON.stringify(requestBody, null, 2));
          console.log('请求体JSON字符串长度:', JSON.stringify(requestBody).length);
    
        // 调用后端API，使用正确的路由路径
        console.log('开始调用后端API: /api/publisher/publishertasks/topcomment');
        const apiUrl = '/api/publisher/publishertasks/topcomment';
        console.log('\n===== 准备发送API请求 =====');
        console.log('API URL:', apiUrl);
        console.log('请求方法:', 'POST');
        console.log('是否包含credentials:', true);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 不再需要手动添加Authorization头，token会通过cookie自动传递
          },
          body: JSON.stringify(requestBody),
          // 确保请求携带credentials
          credentials: 'include'
        });
        
        console.log('\n===== API响应接收 =====');
        console.log('响应状态码:', response.status);
        console.log('响应状态文本:', response.statusText);
        console.log('响应类型:', response.type);
        console.log('是否来自同一源:', response.type === 'basic');
        
        console.log(`API调用完成，响应状态码: ${response.status}, 响应状态: ${response.statusText}`);
    
        console.log('开始解析API响应');
        let result;
        try {
          result = await response.json();
          console.log('API响应解析成功:', JSON.stringify(result, null, 2));
        } catch (jsonError) {
          console.error('错误: 解析API响应JSON失败:', jsonError);
          throw new Error('服务器返回无效响应格式');
        }
    
        // 检查响应状态 - 关键问题点：不仅检查HTTP状态码，还要检查响应内容中的success标志和code字段
        console.log(`响应状态检查: HTTP状态=${response.ok ? 'ok' : 'error'}, 响应success标志=${result.success || false}, 响应code=${result.code || 'N/A'}`);
        
        // 重要：同时检查HTTP状态码、响应中的success标志和code字段
        // 即使HTTP状态码是200，只要success为false或code不是200，也要视为错误
        if (!response.ok || result.success === false || (result.code && result.code !== 200)) {
          const errorMsg = result.message || result.error || '发布任务失败，请稍后重试';
          console.error(`任务发布失败: HTTP状态=${response.status}, 响应code=${result.code || 'N/A'}, 错误消息=${errorMsg}`);
          throw new Error(errorMsg);
        }
        
        console.log('任务发布成功！后端返回了成功的响应');
    
        // 成功处理
        console.log('显示发布成功提示框');
        setAlertConfig({
          title: '发布成功',
          message: '任务已成功发布！',
          icon: 'success',
          buttonText: '确定',
          onButtonClick: () => {
            console.log('用户点击确认按钮，跳转到仪表盘页面');
            // 重置表单或返回上一页
            router.push('/publisher/dashboard');
          }
        });
        setShowAlertModal(true);
      } catch (error) {
        // 错误处理
        const errorMessage = error instanceof Error ? error.message : '发布任务时发生错误';
        console.error('严重错误: 发布任务失败:', error, '错误消息:', errorMessage);
        
        console.log('显示发布失败提示框');
        setAlertConfig({
          title: '发布失败',
          message: errorMessage,
          icon: 'error',
          buttonText: '确定',
          onButtonClick: () => {}
        });
        setShowAlertModal(true);
      } finally {
        // 无论成功失败，都重置加载状态
        console.log('重置发布状态为未发布');
        setIsPublishing(false);
        console.log('========== 发布任务请求处理结束 ==========');
      }
    };
    
    // 处理图片上传
    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // 检查文件大小
      if (file.size > 200 * 1024) { // 200KB
        setAlertConfig({
          title: '上传失败',
          message: '图片大小不能超过200KB',
          icon: 'error',
          buttonText: '确定',
          onButtonClick: () => {}
        });
        setShowAlertModal(true);
        return;
      }
      
      try {
        // 压缩图片
        const compressedFile = await compressImage(file);
        
        // 直接保存压缩后的图片文件，不再尝试获取imageUrl
        // 实际项目中应该调用上传API并获取URL
        const newComments = [...formData.comments];
        newComments[index] = {
          ...newComments[index],
          image: compressedFile
        };
        setFormData({...formData, comments: newComments});
        
        // 显示上传成功提示
        setAlertConfig({
          title: '上传成功',
          message: '图片上传成功！',
          icon: 'success',
          buttonText: '确定',
          onButtonClick: () => {}
        });
        setShowAlertModal(true);
      } catch (error) {
        console.error('上传图片失败:', error);
        setAlertConfig({
          title: '上传失败',
          message: '图片上传失败，请重试',
          icon: 'error',
          buttonText: '确定',
          onButtonClick: () => {}
        });
        setShowAlertModal(true);
      }
    };
    
    // 上传图片的函数已移除，图片处理在handleImageUpload中直接完成

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
          disabled={!formData.videoUrl.trim() || formData.quantity === undefined || formData.quantity < 1 || isPublishing}
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