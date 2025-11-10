'use client';

import { Button, Input, AlertModal } from '@/components/ui';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PublishTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数获取任务信息
  const taskId = searchParams?.get('taskId');
  const taskTitle = searchParams?.get('title') || '中评评论';
  const taskIcon = searchParams?.get('icon') || '📝';
  const taskPrice = parseFloat(searchParams?.get('price') || '0');
  const taskDescription = searchParams?.get('description') || '按照任务要求，在指定视频连接发布评论。';
  
  // @用户相关状态
  const [mentionInput, setMentionInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  
  // 新的表单数据结构，包含评论和图片上传信息
  // 添加默认信息填充以模拟补单操作
  const [formData, setFormData] = useState({
    videoUrl: '', // 空字符串，让用户手动输入
    quantity: 3, // 默认任务数量设为3
    comments: [
      {
        content: '', // 空内容，让用户手动输入
        image: null as File | null
      },
      {
        content: '', // 空内容，让用户手动输入
        image: null as File | null
      },
      {
        content: '', // 空内容，让用户手动输入
        image: null as File | null
      }
    ]
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

  // 处理任务数量变化，实现与评论输入框的联动
  const handleQuantityChange = (newQuantity: number) => {
    const quantity = Math.max(1, newQuantity); // 确保最小数量为1
    setFormData(prevData => {
      let newComments = [...prevData.comments];
      
      // 如果新数量大于现有评论数量，添加新评论
      while (newComments.length < quantity) {
        newComments.push({
          content: `🔺终端评论${newComments.length + 1}，请输入评论内容`,
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
        quantity,
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
    
    // 从所有评论中移除该@标记
    setFormData(prevData => ({
      ...prevData,
      comments: prevData.comments.map(comment => ({
        ...comment,
        content: comment.content?.replace(` @${mention}`, '').replace(`@${mention}`, '') || comment.content
      }))
    }));
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

        console.log('===== 图片上传处理开始 =====');
        console.log('  图片索引:', index);
        console.log('  文件信息:', {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        });

        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          console.log('  ❌ 文件类型无效:', file.type);
          showAlert('文件类型错误', '请上传JPG或PNG格式的图片', '⚠️');
          return;
        }

        // 检查文件大小（预压缩检查）
        if (file.size > 2 * 1024 * 1024) { // 2MB
          console.log('  ❌ 文件过大:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
          showAlert('文件过大', '请上传小于2MB的图片', '⚠️');
          return;
        }

        try {
          // 压缩图片
          console.log('  🔄 开始压缩图片...');
          const compressedFile = await compressImage(file);
          
          // 验证压缩结果
          if (!compressedFile || compressedFile.size === 0) {
            throw new Error('图片压缩失败：生成了空文件');
          }
          
          console.log('  ✅ 图片压缩完成');
          console.log('    - 原始大小:', (file.size / 1024).toFixed(2), 'KB');
          console.log('    - 压缩后大小:', (compressedFile.size / 1024).toFixed(2), 'KB');
          
          // 生成唯一文件名，避免覆盖 - 使用更规范的命名格式
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 10000);
          const extension = file.name.substring(file.name.lastIndexOf('.'));
          const uniqueFileName = `comment_${timestamp}_${random}_${index}${extension}`;
          console.log('  📁 生成唯一文件名:', uniqueFileName);
          
          // 创建新的File对象，使用唯一文件名
          const fileWithUniqueName = new File([compressedFile], uniqueFileName, {
            type: compressedFile.type
          });
          
          console.log('  📋 创建新File对象完成');
          console.log('    - 新文件名:', fileWithUniqueName.name);
          console.log('    - 新文件类型:', fileWithUniqueName.type);
          console.log('    - 新文件大小:', (fileWithUniqueName.size / 1024).toFixed(2), 'KB');
          
          // 更新表单数据中的图片
          setFormData(prevData => ({
            ...prevData,
            comments: prevData.comments.map((comment, i) => 
              i === index ? { ...comment, image: fileWithUniqueName } : comment
            )
          }));
          
          console.log('  ✅ 图片已成功添加到表单数据，等待上传');
          showAlert('上传准备完成', '图片已成功压缩并准备上传！', '✅');
        } catch (error) {
          console.error('  ❌ 图片处理失败:', error);
          showAlert('处理失败', `图片处理失败: ${error instanceof Error ? error.message : '未知错误'}`, '❌');
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


  
  // 将小时数转换为具体时间格式
  const convertHoursToDateTime = (hours: string | number): string => {
    try {
      // 固定为30分钟
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      
      // 格式化日期时间为 YYYY-MM-DD HH:mm:ss
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hoursStr = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hoursStr}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('时间转换错误:', error);
      throw new Error('时间格式转换失败');
    }
  };

  // 发布任务
  const handlePublish = async () => {
    // 验证评论内容（作为额外保障）
    const emptyComments = formData.comments.filter(comment => !comment.content || comment.content.trim() === '');
    if (emptyComments.length > 0) {
      showAlert('输入错误', '请填写所有评论内容', '⚠️');
      return;
    }

    // 显示加载状态
    setIsPublishing(true);

    try {
      // 构建评论详情数据
      const commentDetail: Record<string, string | number> = {};
      
      // 添加commentType字段
      commentDetail.commentType = 'SINGLE';
      
      const quantity = parseInt(formData.quantity.toString(), 10);
      
      // 创建FormData用于上传图片和其他数据
      const formDataToSend = new FormData();
      
      console.log('===== 开始构建FormData =====');
      
      // 添加基本任务信息
      formDataToSend.append('taskTitle', taskTitle || '中评评论');
      formDataToSend.append('taskPrice', taskPrice.toString());
      formDataToSend.append('videoUrl', formData.videoUrl);
      formDataToSend.append('quantity', quantity.toString());
      formDataToSend.append('deadline', '0.5'); // 固定为30分钟
      formDataToSend.append('mentions', JSON.stringify(mentions || []));
      
      // 明确指定上传路径参数 - 使用相对路径格式
      formDataToSend.append('uploadPath', 'public/uploads');
      console.log('已指定上传路径参数: public/uploads');
      
      // 为每个评论添加数据
      for (let i = 1; i <= quantity; i++) {
        const commentIndex = (i - 1) % formData.comments.length;
        const comment = formData.comments[commentIndex] || {};
        
        console.log(`\n处理评论${i}的数据...`);
        
        // 添加评论字段到FormData
        formDataToSend.append(`linkUrl${i}`, formData.videoUrl || '');
        formDataToSend.append(`unitPrice${i}`, taskPrice.toString());
        formDataToSend.append(`quantity${i}`, '1');
        
        // 移除commentText中的@用户标记
        const cleanContent = (comment.content || '').replace(/ @\S+/g, '').trim();
        formDataToSend.append(`commentText${i}`, cleanContent);
        console.log(`  添加评论内容: ${cleanContent.substring(0, 50)}${cleanContent.length > 50 ? '...' : ''}`);
        
        // 处理图片上传 - 确保文件正确添加到FormData
        if (comment.image) {
          const fieldName = `commentImages${i}`;
          console.log(`  添加图片${i}到FormData - 字段名: ${fieldName}`, {
            name: comment.image.name,
            type: comment.image.type,
            size: comment.image.size,
            lastModified: comment.image.lastModified
          });
          
          // 确保文件正确附加到FormData，使用标准的文件上传格式
          try {
            formDataToSend.append(fieldName, comment.image, comment.image.name);
            console.log(`  图片${i}成功添加到FormData`);
            
            // 验证FormData是否包含该文件
            const appendedFile = formDataToSend.get(fieldName);
            console.log(`  FormData验证: 文件已${appendedFile ? '成功' : '失败'}添加`);
          } catch (e) {
            console.error(`  图片${i}添加到FormData失败:`, e);
          }
          
          // 添加额外信息帮助后端处理
          formDataToSend.append(`hasImage${i}`, 'true');
          // 添加文件保存路径信息 - 使用相对路径
          formDataToSend.append(`imagePath${i}`, `uploads/${comment.image.name}`);
          console.log(`  设置图片保存路径: uploads/${comment.image.name}`);
        } else {
          formDataToSend.append(`commentImages${i}`, '');
          formDataToSend.append(`hasImage${i}`, 'false');
          console.log(`  评论${i}无图片`);
        }
        
        // 仅在最后一条评论设置mentionUser
        if (i === quantity && mentions.length > 0) {
          formDataToSend.append(`mentionUser${i}`, mentions[0]);
        } else {
          formDataToSend.append(`mentionUser${i}`, '');
        }
      }
      
      // 调用API端点，使用FormData进行多部分表单上传
      // 添加超时控制和重试机制
      const MAX_RETRIES = 2;
      let retries = 0;
      let response;
      
      while (retries <= MAX_RETRIES) {
        try {
          // 使用Promise.race添加超时控制
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('请求超时')), 30000); // 30秒超时
          });
          
          console.log('===== 准备发送API请求 =====');
          
          // 统计图片数量
          let imageCount = 0;
          for (let j = 1; j <= quantity; j++) {
            if (formDataToSend.get(`commentImages${j}`)) {
              imageCount++;
            }
          }
          console.log(`  请求包含图片数量: ${imageCount}`);
          console.log(`  请求包含字段总数: ${formDataToSend.entries().next().done ? 0 : Array.from(formDataToSend.entries()).length}`);
          
          response = await Promise.race([
            fetch('/api/publisher/publishertasks/middlecomment', {
              method: 'POST',
              // 不需要设置Content-Type，浏览器会自动设置正确的multipart/form-data类型
              body: formDataToSend,
              credentials: 'include', // 确保携带cookie
              // 添加额外的头信息
              headers: {
                // 注意：不要手动设置Content-Type，让浏览器自动处理
                'X-Requested-With': 'XMLHttpRequest',
                // 添加自定义头部用于调试
                'X-File-Upload-Count': imageCount.toString()
              }
            }),
            timeoutPromise
          ]);
          
          console.log(`===== API请求完成 =====`);
          console.log(`  状态码: ${response.status}`);
          console.log(`  状态文本: ${response.statusText}`);
          console.log(`  响应URL: ${response.url}`);
          
          // 如果响应状态码不是服务器错误，可以继续处理
          if (!response.status.toString().startsWith('5')) {
            break;
          }
          
          // 服务器错误，尝试重试
          retries++;
          if (retries <= MAX_RETRIES) {
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        } catch (error) {
          retries++;
          if (retries > MAX_RETRIES) {
            throw error;
          }
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (!response) {
        throw new Error('所有上传重试均失败');
      }
      
      // 始终尝试解析响应体，无论状态码如何
      let result;
      try {
        result = await response.json();
        console.log('响应数据:', result);
        
        // 检查是否有图片上传相关信息
        console.log('===== 响应数据分析 =====');
        console.log('  原始响应数据:', JSON.stringify(result, null, 2).substring(0, 500) + '...');
        
        // 检查所有可能的图片路径字段
        for (let j = 1; j <= quantity; j++) {
          const imageField = `commentImages${j}`;
          if (result.commentDetail && result.commentDetail[imageField]) {
            console.log(`  响应中的图片路径(${imageField}):`, result.commentDetail[imageField]);
          } else if (result[imageField]) {
            console.log(`  响应中的图片路径(${imageField}):`, result[imageField]);
          }
        }
        
        // 特别检查commentImages3
        if (result.commentImages3) {
          console.log('  返回的图片路径信息(commentImages3):', result.commentImages3);
        }
      } catch (e) {
        console.error('解析响应失败:', e);
        // 如果响应不是有效的JSON，创建一个错误结果对象
        result = {
          success: false,
          message: '服务器返回无效响应'
        };
      }
      
      // 根据状态码和响应结果进行处理
      if (response.status === 200) {
        // 当API调用成功返回状态码为200时
        if (result.success) {
          // 修改为用户点击确认后才跳转
          showAlert(
            '发布任务成功', 
            `任务发布成功！`, 
            '✅',
            '确定',
            () => {
              // 在用户点击确认按钮后跳转
              router.push('/publisher/dashboard');
            }
          );
          
          // 记录图片上传成功信息
          console.log('===== 任务发布成功信息 =====');
          console.log('响应数据:', result);
          
          // 检查是否有图片路径信息
          if (result.commentDetail) {
            console.log('服务器返回的图片路径信息:');
            for (let j = 1; j <= quantity; j++) {
              const imagePath = result.commentDetail[`commentImages${j}`];
              if (imagePath) {
                console.log(`评论${j}图片路径:`, imagePath);
              }
            }
          }
        } else {
          // 200状态码但success为false的情况
          if (result.errorType === 'InsufficientBalance') {
            // 特定处理余额不足的情况
            showAlert('账户余额不足', '您的账户余额不足以支付任务费用，请先充值后再尝试发布任务。', '⚠️', '前往充值', () => {
              router.push('/publisher/finance');
            });
          } else {
            // 提取并显示返回结果中的message字段内容作为错误提示信息
            showAlert('发布失败', result.message || '任务发布失败', '❌');
          }
        }
      } else {
        // 当API调用返回非200状态码时
        // 提取并显示返回结果中的message字段内容作为错误提示信息
        // 对于500错误提供更友好的提示
        if (response.status === 500) {
          // 特别处理500错误，显示更详细的错误信息
          const errorMessage = result.message || '服务器内部错误，请稍后重试';
          showAlert('发布失败', errorMessage, '❌');
        } else {
          // 其他非200错误
          showAlert('发布失败', result.message || `服务器错误 (${response.status})`, '❌');
        }
      }
    } catch (error) {
      // 分析错误类型给出更具体的提示
      if (error instanceof Error && error.message.includes('时间格式转换失败')) {
        showAlert('时间格式错误', '任务截止时间转换失败，请检查后重试', '⚠️');
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        showAlert('网络错误', '无法连接到服务器，请检查网络连接后重试', '⚠️');
      } else {
        showAlert('网络错误', '发布任务时发生错误，请稍后重试', '⚠️');
      }
    } finally {
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
      {/* 页面头部 */}
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

        {/* 截止时间 - 固定为30分钟 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务截止时间
          </label>
          <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
            30分钟内
          </div>
        </div>

        {/* 派单示例模块 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm overflow-y-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            评论内容
          </label>
          
          {/* AI优化评论功能按钮 - 删除了推荐评论按钮 */}
          <div className="mb-4">
            <Button 
              onClick={handleAIOptimizeComments}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              AI评论
            </Button>
          </div>
          
          {/* 动态生成评论输入框 */}
          {formData.comments.map((comment, index) => {
            const isLastComment = index === formData.comments.length - 1;
            
            return (
              <div key={index} className="mb-1 py-2 border-b border-gray-900">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评论{index + 1}
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder={`默认最后一条评论带@功能`}
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
                            alt={`评论${index + 1}图片`} 
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

        {/* 任务数量 - 移至评论区域下方 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务数量 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <button 
                onClick={() => handleQuantityChange(Math.max(1, formData.quantity - 1))}
                disabled={formData.quantity <= 1}
                className={`w-10 h-10 rounded-full text-lg font-bold transition-colors ${formData.quantity <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'}`}
              >
                -
              </button>
            <div className="flex-1">
              <Input
                type="number"
                min="1"
                value={formData.quantity.toString()}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                max="10"
                className="w-full text-2xl font-bold text-gray-900 text-center py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => handleQuantityChange(formData.quantity + 1)}
              className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {taskId === 'comment_top' && '上评任务单价为¥3.0'}
            {taskId === 'comment_middle' && '中评任务单价为¥2.0'}
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
              disabled={formData.comments.some(comment => !comment.content || comment.content.trim() === '') || isPublishing}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
            >
              {isPublishing ? '发布中...' : `立即发布任务 - ¥${totalCost}`}
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