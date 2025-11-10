'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCardOutlined } from '@ant-design/icons';
// 简单的Toast组件替代方案
const SimpleToast = ({ message, type, onClose, duration }: { message: string; type: 'success' | 'error'; onClose: () => void; duration: number }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
      {message}
      <button onClick={onClose} className="ml-2">×</button>
    </div>
  );
};

// 根据后端API响应示例定义数据接口
interface BankCard {
  id: string;
  userId: string;
  cardholderName: string;
  cardNumber: string;
  bank: string;
  issuingBank: string;
  isDefault: boolean;
  createTime: string;
  // UI显示需要的属性
  bankName?: string;
  cardType?: string;
  bgColor?: string;
}

// 定义API响应接口
interface ApiResponse {
  code: number;
  message: string;
  data: BankCard[];
  success: boolean;
  timestamp: number;
}

export default function BankCardsPage() {
  const router = useRouter();
  
  // 银行卡数据状态
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  // 控制设置默认卡的模式是否激活
  const [isSettingDefaultMode, setIsSettingDefaultMode] = useState(false);
  // 存储用户选择的银行卡ID
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  // 控制成功提示框的显示
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  // 错误状态
  const [error, setError] = useState<string | null>(null);
  // 刷新状态
  const [isRefreshing, setIsRefreshing] = useState(false);
  // 移除了defaultBankCardId状态，因为我们直接使用银行卡列表中的isDefault字段

  // 卡号脱敏处理函数
  const maskCardNumber = (cardNumber: string): string => {
    if (!cardNumber || cardNumber.length < 8) return cardNumber;
    
    // 保留前4位和后4位，中间用*替换
    const firstFour = cardNumber.slice(0, 4);
    const lastFour = cardNumber.slice(-4);
    const middleLength = cardNumber.length - 8;
    const maskedMiddle = '*'.repeat(middleLength);
    
    return `${firstFour}${maskedMiddle}${lastFour}`;
  };

  // 获取银行卡列表数据
  const fetchBankCards = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch('/api/public/bank/getbankcardslist', {
        method: 'GET', // 使用GET方法以匹配后端API
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // 设置超时处理
        signal: AbortSignal.timeout(10000),
        // 凭证设置，确保cookie可以被发送到API
        credentials: 'include' as RequestCredentials
      });

      
      console.log('=== 开始调用银行卡列表API ===');
      console.log('API URL:', '/api/public/bank/getbankcardslist');
      console.log('请求方法:', response);
      
      
 
      
      // 获取响应头信息
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('响应头:', responseHeaders);
      
      // 获取响应体文本
      const responseText = await response.text();
      console.log('响应体原始文本:', responseText);
      
      // 尝试解析JSON
      let apiResponse: ApiResponse;
      try {
        if (responseText) {
          apiResponse = JSON.parse(responseText) as ApiResponse;
          console.log('解析后的JSON数据:', apiResponse);
        } else {
          console.warn('响应体为空');
          setError('获取银行卡列表失败：响应体为空');
          return;
        }
      } catch (jsonError) {
        console.error('JSON解析错误:', jsonError);
        console.error('原始响应文本:', responseText);
        throw new Error(`JSON解析错误: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
      }
      
      // 处理API返回的错误，即使HTTP状态码是200
      if (!apiResponse.success) {
        const errorMsg = apiResponse.message || '获取银行卡列表失败';
        console.error('API返回错误:', errorMsg);
        console.error('错误代码:', apiResponse.code);
        setError(errorMsg);
        return;
      }
      
      // 确保响应状态正常
      if (!response.ok) {
        console.error('HTTP错误状态:', response.status);
        setError(`请求失败，状态码: ${response.status}`);
        return;
      }
      
      console.log('API调用成功');
      
      // 处理返回的数据
      const cards = apiResponse.data || [];
      console.log('银行卡数据列表长度:', cards.length);
      console.log('银行卡数据列表:', cards);
      
      // 转换API返回的数据为前端显示需要的格式
      const formattedCards = cards.map((card: BankCard) => ({
        id: card.id,
        userId: card.userId,
        cardholderName: card.cardholderName,
        cardNumber: maskCardNumber(card.cardNumber), // 对卡号进行脱敏处理
        bank: card.bank,
        issuingBank: card.issuingBank,
        // 直接使用API返回的isDefault字段来判断
        isDefault: card.isDefault,
        createTime: card.createTime,
        // 添加UI需要的字段映射
        bankName: card.bank || card.issuingBank || '未知银行',
        cardType: '储蓄卡', // 默认类型
        bgColor: '#f82525ff' // 默认背景色
      }));
      
      console.log('格式化后的银行卡数据，带默认状态标记:', formattedCards);
      
      console.log('格式化后的银行卡数据:', formattedCards);
      setBankCards(formattedCards);
      console.log('=== 银行卡列表API调用完成 ===');
    } catch (err) {
      console.error('获取银行卡列表出错:', err);
      if (err instanceof Error) {
        console.error('错误详情:', { message: err.message, stack: err.stack });
        setError(`网络错误: ${err.message}`);
      } else {
        setError('网络错误，请稍后重试');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // 不再需要单独获取默认银行卡信息的函数，因为isDefault字段已经包含在银行卡列表数据中
  
  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      // 只需要获取一次银行卡列表，因为isDefault字段已经包含在列表数据中
      await fetchBankCards();
    };
    
    initData();
  }, []);
  
  // 下拉刷新处理
  const handleRefresh = () => {
    fetchBankCards(true);
  };
  
  // 跳转到银行卡详情页
  const viewCardDetails = (cardId: string) => {
    router.push(`/commenter/bank-cards/bank-cardlist/${cardId}`);
  };

  // 跳转到添加银行卡页面
  const navigateToBindCard = () => {
    router.push('/commenter/bind-bank-card');
  };

  // 打开设置默认卡模式
  const startSettingDefaultMode = () => {
    // 获取当前默认卡ID作为初始选择
    const currentDefault = bankCards.find(card => card.isDefault);
    setSelectedCardId(currentDefault?.id || null);
    setIsSettingDefaultMode(true);
  };
  
  // 关闭设置默认卡模式
  const cancelSettingDefaultMode = () => {
    setIsSettingDefaultMode(false);
    setSelectedCardId(null);
  };
  
  // 选择银行卡
  const selectCard = (cardId: string) => {
    setSelectedCardId(cardId);
  };
  
  // 确认设置默认银行卡
  const confirmSetDefaultCard = async () => {
    if (!selectedCardId) return;
    
    try {
      // 调用后端API设置默认银行卡
      console.log(`开始调用设置默认银行卡API，cardId: ${selectedCardId}`);
      
      const response = await fetch('/api/public/bank/setdefaultbank', {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // 通过请求体传递cardId
        body: JSON.stringify({ cardId: selectedCardId }),
        // 凭证设置，确保cookie可以被发送到API
        credentials: 'include' as RequestCredentials
      });
      
      // 获取响应体文本
      const responseText = await response.text();
      console.log('设置默认银行卡API响应:', responseText);
      
      // 尝试解析JSON
      let apiResponse;
      try {
        if (responseText) {
          apiResponse = JSON.parse(responseText);
        } else {
          throw new Error('响应体为空');
        }
      } catch (jsonError) {
        throw new Error(`JSON解析错误: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
      }
      
      // 检查响应状态和API返回结果
      if (!response.ok || !apiResponse.success) {
        const errorMsg = apiResponse.message || `请求失败，状态码: ${response.status}`;
        throw new Error(errorMsg);
      }
      
      // 设置默认卡成功后刷新整个页面
      window.location.reload();
      console.log('设置默认卡成功，刷新页面');
      
      // 显示成功提示框
      setShowSuccessToast(true);
    } catch (err) {
      console.error('设置默认银行卡失败:', err);
      if (err instanceof Error) {
        setError(`设置默认银行卡失败: ${err.message}`);
      } else {
        setError('设置默认银行卡失败，请稍后重试');
      }
    } finally {
      // 退出设置模式
      setIsSettingDefaultMode(false);
      setSelectedCardId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center h-16 px-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600"
            aria-label="返回"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-lg font-medium text-gray-800">银行卡</h1>
          <div className="w-8"></div> {/* 为了布局平衡 */}
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="px-10 py-3">
        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* 加载状态 */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        )}
        
        {/* 刷新状态 */}
        {isRefreshing && (
          <div className="py-3 flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
            <p className="text-gray-600 text-sm">刷新中...</p>
          </div>
        )}
        
        {/* 空状态 */}
        {!isLoading && bankCards.length === 0 && !error && (
          <div className="py-16 flex flex-col items-center justify-center">
            <CreditCardOutlined className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-6">暂无绑定的银行卡</p>
            <button
              onClick={navigateToBindCard}
              className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium transition-colors"
            >
              添加银行卡
            </button>
          </div>
        )}
        
        {/* 银行卡列表 */}
        {!isLoading && bankCards.length > 0 && (
          <div className="space-y-4 pt-5">
            {bankCards.map((card) => (
              <div key={card.id} className="w-full rounded-xl overflow-hidden shadow-md transition-all duration-200 hover:shadow-lg">
                {/* 银行卡卡片 */}
                <button
                  onClick={() => isSettingDefaultMode ? selectCard(card.id) : viewCardDetails(card.id)}
                  className={`w-full bg-red-600 p-5 text-white relative overflow-hidden text-left transition-all ${isSettingDefaultMode ? 'cursor-pointer' : 'hover:shadow-md'}`}
                  aria-label={`查看${card.bankName}${card.cardType}详情`}
                >
                  {/* 银行Logo和名称 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex">
                      <CreditCardOutlined className="h-7 w-7 text-white text-xl mr-2" />
                      <div>
                        <h3 className="text-xl font-medium text-left">{card.bankName}</h3>
                        <p className="text-xs text-left">{card.cardType}</p>
                      </div>
                    </div>
                    {/* 默认银行卡标识 */}
                    {card.isDefault && (
                      <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg absolute top-4 right-5">默认</span>
                    )}
                  </div>
                  
                  {/* 卡号 */}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium tracking-wider">{card.cardNumber}</p>
                  </div>
                  
                  {/* 单选框 - 仅在设置默认卡模式下显示 */}
                  {isSettingDefaultMode && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCardId === card.id ? 'border-blue-500 bg-blue-500' : 'border-white'}`}>
                        {selectedCardId === card.id && (
                          <div className="w-3 h-3 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  )}
                </button>
              </div>
            ))}
            
            {/* 下拉刷新提示 */}
            <div 
              className="py-3 text-center text-gray-500 text-sm"
              onClick={handleRefresh}
            >
              <span className="cursor-pointer">下拉刷新</span>
            </div>
          </div>
        )}
        
        {/* 设置默认银行卡按钮区域 */}
        {!isSettingDefaultMode ? (
          <div className="mt-6">
            <button
              onClick={startSettingDefaultMode}
              className="w-full py-4 bg-white rounded-xl shadow-sm flex items-center justify-center space-x-2 font-medium transition-colors hover:bg-blue-500 hover:text-white"
            >
              <span>设置默认银行卡</span>
            </button>
          </div>
        ) : (
          // 设置模式下显示保存和取消按钮
          <div className="mt-6 space-y-4">
            <button
              onClick={confirmSetDefaultCard}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium transition-colors"
              disabled={!selectedCardId}
            >
              保存
            </button>
            <button
              onClick={cancelSettingDefaultMode}
              className="w-full py-4 bg-white border border-gray-300 rounded-xl font-medium transition-colors"
            >
              取消
            </button>
          </div>
        )}

        {/* 添加银行卡按钮 */}
        {!isSettingDefaultMode && (
          <div className="mt-6">
              <button
                onClick={navigateToBindCard}
                className="w-full py-4 bg-white rounded-xl shadow-sm flex items-center justify-center space-x-2  font-medium transition-colors hover:bg-blue-500 hover:text-white"
              >
                <span className="text-lg">+</span>
                <span>添加银行卡</span>
              </button>
          </div> 
        )}
      </div>
        
         {/* 成功提示框 */}
        {showSuccessToast && (
          <SimpleToast
            message="默认银行卡设置成功"
            type="success"
            onClose={() => setShowSuccessToast(false)}
            duration={3000}
          />
        )}
        
        {/* 全局错误提示 */}
        {error && (
          <SimpleToast
            message={error}
            type="error"
            onClose={() => setError(null)}
            duration={5000}
          />
        )}
    </div>
    
  
  );
}