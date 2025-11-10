'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
// 移除不存在的导入，使用文件中已有的getCurrentUser函数
import { CreditCardOutlined } from '@ant-design/icons';
// 直接从localStorage获取用户信息的辅助函数
const getCurrentUser = () => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const authDataStr = localStorage.getItem('commenter_auth_data');
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      return {
        id: authData.userId || '',
        username: authData.username || '',
        ...(authData.userInfo || {})
      };
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
  return null;
};

interface BankCard {
  id: string;
  bankName: string;
  cardType: string;
  cardNumber: string;
  isDefault?: boolean;
}

export default function BankCardDetail() {
  const router = useRouter();
  const params = useParams();
  const [bankCard, setBankCard] = useState<BankCard | null>(null);
  const [showFullCardNumber, setShowFullCardNumber] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false); // 添加离线模式标志
  
  // 从API获取银行卡详情数据
  useEffect(() => {
    const fetchBankCard = async () => {
      if (!params || typeof params.id !== 'string') {
        setError('无效的银行卡ID');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // 获取当前登录用户信息
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setError('用户未登录，请重新登录');
          setTimeout(() => {
            router.push('/commenter/auth/login');
          }, 1500);
          return;
        }
        
        // 调用后端API获取银行卡详情
        // 使用正确的API路径 - 注意这里的路径需要根据实际后端实现进行调整
        const response = await fetch(`/api/commenter/bank/bankcardslist/${params.id}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'X-User-Id': currentUser.username
          }
        });
        
        // 先检查响应是否成功
        if (!response.ok) {
          setError(`获取银行卡详情失败: HTTP ${response.status}`);
          return;
        }
        
        // 检查响应内容类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // 如果不是JSON，尝试获取文本内容以便调试
          const textContent = await response.text();
          console.error('非JSON响应:', textContent);
          setError('服务器返回了非JSON格式的数据');
          return;
        }
        
        // 尝试解析JSON
        try {
          const data = await response.json();
          
          if (!data.success) {
            setError(data.message || '获取银行卡详情失败');
            return;
          }
          
          // 设置银行卡数据
          if (data.data) {
            setBankCard(data.data);
          } else {
            setError('未找到银行卡信息');
          }
        } catch (jsonError) {
          console.error('JSON解析错误:', jsonError);
          setError('服务器返回的数据格式错误');
        }
      } catch (err) {
          console.error('获取银行卡详情出错:', err);
          setError('网络错误，请稍后重试');
          // 当API调用失败时，使用模拟数据作为后备方案
          setIsOfflineMode(true);
          const mockCard: BankCard = {
            id: params.id,
            bankName: '招商银行',
            cardType: '储蓄卡',
            cardNumber: '6226 8888 8888 0280',
            isDefault: params.id === '1' // 假设ID为1的卡是默认卡
          };
          setBankCard(mockCard);
          setIsLoading(false);
        }
    };
    
    fetchBankCard();
  }, [params, router]);

  // 返回上一页
  const handleGoBack = () => {
    router.back();
  };

  // 切换显示完整卡号
  const toggleFullCardNumber = () => {
    setShowFullCardNumber(!showFullCardNumber);
  };

  // 解除绑定银行卡
  const handleUnbindCard = async () => {
    const confirmUnbind = window.confirm('确定要解除绑定这张银行卡吗？');
    
    if (confirmUnbind && bankCard) {
      try {
        // 获取当前登录用户信息
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setError('用户未登录，请重新登录');
          return;
        }
        
        // 调用后端API解除绑定
        const response = await fetch(`/api/commenter/bank/bankcardslist/${bankCard.id}`, {
          method: 'DELETE',
          headers: {
            'accept': '*/*',
            'X-User-Id': currentUser.username
          }
        });
        
        // 先检查响应状态
        if (!response.ok) {
          throw new Error(`解除绑定失败: HTTP ${response.status}`);
        }
        
        // 检查响应内容类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('服务器返回了非JSON格式的数据');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || '解除绑定失败');
        }
        
        // 删除成功后返回银行卡列表页
        alert('银行卡解除绑定成功');
        router.push('/commenter/bank-cards');
      } catch (error) {
        alert('银行卡解除绑定失败，请稍后再试');
        console.error('解除绑定银行卡失败:', error);
      }
    }
  };

  // 处理功能点击
  const handleFeatureClick = (feature: string) => {
    // 在实际项目中，这里应该根据不同功能跳转到相应页面
    alert(`跳转到${feature}页面`);
  };

  // 设置默认银行卡
  const handleSetDefaultCard = async () => {
    if (!bankCard) return;
    
    const confirmSetDefault = window.confirm(`确定要将${bankCard.bankName}${bankCard.cardType}设为默认银行卡吗？`);
    
    if (confirmSetDefault) {
      try {
        // 获取当前登录用户信息
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setError('用户未登录，请重新登录');
          return;
        }
        
        // 调用后端API设置默认银行卡
        const response = await fetch(`/api/commenter/bank/bankcardslist/setdefault/${bankCard.id}`, {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'X-User-Id': currentUser.username
          }
        });
        
        // 先检查响应状态
        if (!response.ok) {
          throw new Error(`设置默认银行卡失败: HTTP ${response.status}`);
        }
        
        // 检查响应内容类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('服务器返回了非JSON格式的数据');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || '设置默认银行卡失败');
        }
        
        // 设置成功后更新本地状态
        setBankCard({ ...bankCard, isDefault: true });
        alert('默认银行卡设置成功');
      } catch (error) {
        alert('设置默认银行卡失败，请稍后再试');
        console.error('设置默认银行卡失败:', error);
      }
    }
  };

  // 错误状态显示
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="text-red-500 text-xl mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600 text-center mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          返回银行卡列表
        </button>
      </div>
    );
  }
  
  // 加载状态显示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">加载银行卡信息中...</p>
      </div>
    );
  }
  
  // 如果没有数据且不是加载或错误状态
  if (!bankCard) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="text-gray-400 text-xl mb-4">
          <CreditCardOutlined className="h-16 w-16" />
        </div>
        <p className="text-gray-500 mb-6">未找到银行卡信息</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          返回银行卡列表
        </button>
      </div>
    );
  }

  // 格式化卡号显示
  const formatCardNumber = (cardNumber: string) => {
    if (showFullCardNumber) {
      return cardNumber;
    }
    // 显示部分卡号，隐藏中间部分
    const lastFourDigits = cardNumber.slice(-4);
    return `**** **** **** ${lastFourDigits}`;
  };

  return (
    <div className="min-h-screen bg-white px-4">
      {/* 顶部导航 */}
      <div className="flex text-xl text-center items-center justify-center px-4 py-3 bg-white border-b border-gray-200 relative">
        <button
          onClick={handleGoBack}
          className="absolute left-4 p-2 -ml-2 text-gray-600"
          aria-label="返回"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        银行卡详情
      </div>

      {/* 银行卡卡片 */}
      <div className="mx-4 mt-4 rounded-lg bg-red-600 p-6 mb-10 text-white" style={{ height: 'calc(100% + 20%)' }}>
        {/* 离线模式提示 */}
        {isOfflineMode && (
          <div className="mb-2 text-xs bg-yellow-500/30 p-1 rounded">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-200 mr-1"></span>
            离线模式：显示模拟数据
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="">
              <CreditCardOutlined className="h-7 w-7 text-white text-xl" />
            </div>
            <span className="ml-2 text-lg font-semibold">{bankCard.bankName} {bankCard.cardType}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-medium">{formatCardNumber(bankCard.cardNumber)}</p>
          <button 
            className="rounded-lg bg-white/20 px-4 py-2 text-sm hover:bg-white/30"
            onClick={toggleFullCardNumber}
          >
            {showFullCardNumber ? '隐藏卡号' : '完整卡号'}
          </button>
        </div>
      </div>

      {/* 功能列表 */}
      <div className="mt-4 divide-y divide-gray-200 mb-10">
        {/* 设置默认银行卡选项 - 如果不是默认卡才显示 */}
        {!bankCard.isDefault && (
          <div 
            className="flex items-center justify-between px-4 py-4 cursor-pointer rounded-lg hover:bg-gray-200"
            onClick={handleSetDefaultCard}
          >
            <span className="text-blue-600 font-medium">设为默认银行卡</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* 如果是默认卡，显示默认标识 */}
        {bankCard.isDefault && (
          <div className="flex items-center justify-between px-4 py-4 rounded-lg hover:bg-gray-200">
            <span className="font-medium">默认银行卡</span>
            <span className=" text-xs px-2 py-1 rounded-full">已设置</span>
          </div>
        )}
        
        <div 
          className="flex items-center justify-between px-4 py-4 cursor-pointer rounded-lg hover:bg-gray-200"
          onClick={() => handleFeatureClick('还款')}
        >
          <span>还款</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div 
          className="flex items-center justify-between px-4 py-4 cursor-pointer rounded-lg hover:bg-gray-200"
          onClick={() => handleFeatureClick('交易明细')}
        >
          <span>交易明细</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div 
          className="flex items-center justify-between px-4 py-4 cursor-pointer rounded-lg hover:bg-gray-200"
          onClick={() => handleFeatureClick('支付限额查询')}
        >
          <span>支付限额查询</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* 解除绑定选项 */}
      <div className="mt-4 px-4">
        <button 
          className="w-full rounded-lg border border-red-500 bg-white py-3 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
          onClick={handleUnbindCard}
        >
          解除绑定银行卡
        </button>
      </div>

      {/* 底部链接 */}
      <div className="mt-8 flex justify-center px-4 text-sm text-gray-500">
        <div className="flex flex-col items-center">
          <div className="flex space-x-4">
            <a href="#" className="text-blue-500 hover:underline">联系客服</a>
          </div>
        </div>
      </div>
    </div>
  );
}