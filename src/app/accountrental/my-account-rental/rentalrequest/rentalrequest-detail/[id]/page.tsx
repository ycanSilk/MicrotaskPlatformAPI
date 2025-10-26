'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Space, Divider, Modal, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

// 出租信息状态类型
type RentalOfferStatus = '待审核' | '已上架' | '已租出' | '已下架' | '审核不通过';

// 账号要求接口
interface AccountRequirements {
  canChangeName: boolean;
  canIntroduction: boolean;
  canPostComments: boolean;
  canPostVideos: boolean;
  canUnbanAccount: boolean;
}

// 出租信息接口
interface RentalOffer {
  id: string;
  offerNo: string;
  userName: string;
  userId: string;
  accountType: string;
  accountName: string;
  accountDescription: string;
  rentalPrice: number;
  rentalUnit: string;
  rentalDuration: string; // 新增租赁时长字段
  createTime: string;
  status: RentalOfferStatus;
  imageUrl?: string;
  // 租赁信息（如果已租出）
  rentalInfo?: {
    rentalOrderNo: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    amount: number;
  };
  // 审核失败原因
  rejectReason?: string;
  // 账号数据展示图片
  dataImages?: string[];
  // 账号要求
  accountRequirements?: AccountRequirements;
  // 登录方式
  loginMethods?: string[];
  // 联系信息
  contactPhone?: string;
  contactQQ?: string;
  contactEmail?: string;
}




// 编辑表单状态类型
interface EditFormData {
  accountName: string;
  accountDescription: string;
  rentalPrice: string;
  rentalDuration: string;
  dataImages: string[];
  accountRequirements: AccountRequirements;
  loginMethods: string[];
  contactPhone?: string;
  contactQQ?: string;
  contactEmail?: string;
}

const RentalRequestDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams?.get('id') || '1'; // 默认ID为1
  const [offerDetail, setOfferDetail] = useState<RentalOffer | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); // 新增：是否处于编辑状态
  const [offShelfModalVisible, setOffShelfModalVisible] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [editForm, setEditForm] = useState<EditFormData>({
    accountName: '',
    accountDescription: '',
    rentalPrice: '',
    rentalDuration: '',
    dataImages: [],
    accountRequirements: {
      canChangeName: false,
      canIntroduction: false,
      canPostComments: false,
      canPostVideos: false,
      canUnbanAccount: false
    },
    loginMethods: [],
    contactPhone: '',
    contactQQ: '',
    contactEmail: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  
  // 模拟从API获取出租详情
  useEffect(() => {
    // 这里应该是实际API调用，这里使用模拟数据
    const mockOffers: RentalOffer[] = [
      {
        id: '1',
        offerNo: 'OFFER20240620001',
        userName: '张三',
        userId: 'USER123456',
        accountType: '抖音',
        accountName: '美食达人小C',
        accountDescription: '专注美食领域，以制作精致的餐厅探店和美食测评视频为主，互动率高，粉丝粘性强。主要内容包括热门餐厅探店、美食制作教程、特色小吃推荐等。账号粉丝主要为20-35岁的年轻人群，对美食有较高的热情和消费能力。',
        rentalPrice: 50,
        rentalUnit: '天',
        rentalDuration: '3', // 新增租赁时长
        createTime: '2024-06-20 10:30:00',
        status: '已上架',
        imageUrl: '/images/douyin-logo.png',
        dataImages: [
          '/images/1758384598887_578.jpg',
          '/images/1758380776810_96.jpg'
        ],
        accountRequirements: {
          canChangeName: true,
          canIntroduction: true,
          canPostComments: true,
          canPostVideos: false,
          canUnbanAccount: true
        },
        loginMethods: ['scan', 'phone_sms'],
        contactPhone: '13812346789',
        contactQQ: '2345678',
        contactEmail: 'example@qq.com'
      },
      {
        id: '2',
        offerNo: 'OFFER20240619002',
        userName: '李四',
        userId: 'USER234567',
        accountType: '抖音',
        accountName: '美妆博主小D',
        accountDescription: '专业美妆博主，擅长口红试色和妆容教程，粉丝多为年轻女性，互动积极。主要分享美妆技巧、产品测评、妆容教程等内容，内容风格清新自然，推荐产品性价比高，深受粉丝信赖。',
        rentalPrice: 600,
        rentalUnit: '天',
        rentalDuration: '可租赁1-14天', // 新增租赁时长
        createTime: '2024-06-19 15:20:00',
        status: '已租出',
        imageUrl: '/images/douyin-logo.png',
        rentalInfo: {
          rentalOrderNo: 'RENT20240621001',
          tenantName: '王五',
          startDate: '2024-06-25',
          endDate: '2024-06-28',
          amount: 2400
        },
        dataImages: [
         '/images/1758384598887_578.jpg',
          '/images/1758380776810_96.jpg'
        ]
      },
      {
        id: '5',
        offerNo: 'OFFER20240616005',
        userName: '钱七',
        userId: 'USER567890',
        accountType: '抖音',
        accountName: '游戏主播阿强',
        accountDescription: '人气游戏主播，技术出众，解说专业，擅长多款热门游戏，粉丝活跃度高。每天固定直播时间4小时以上，直播间互动热烈，打赏收入稳定。',
        rentalPrice: 1500,
        rentalUnit: '小时',
        rentalDuration: '每次至少2小时，最长8小时', // 新增租赁时长
        createTime: '2024-06-16 11:20:00',
        status: '审核不通过',
        imageUrl: '/images/douyin-logo.png',
        rejectReason: '请提供账号所有权证明文件和近期直播数据截图。账号信息需与实名认证信息一致。',
        rentalInfo: {
          rentalOrderNo: 'RENT20240621001',
          tenantName: '王五',
          startDate: '2024-06-25',
          endDate: '2024-06-28',
          amount: 2400
        },
        dataImages: [
         '/images/1758384598887_578.jpg',
          '/images/1758380776810_96.jpg'
        ]
      }
    ];

    // 查找匹配的出租信息
    const foundOffer = mockOffers.find(offer => offer.id === offerId) || mockOffers[0];
    // 确保账号类型为抖音
    const offerWithDouyinType = {
      ...foundOffer,
      accountType: '抖音',
      imageUrl: '/images/douyin-logo.png'
    };
    setOfferDetail(offerWithDouyinType);
    
    // 初始化编辑表单数据
    setEditForm({
      accountName: offerWithDouyinType.accountName,
      accountDescription: offerWithDouyinType.accountDescription,
      rentalPrice: offerWithDouyinType.rentalPrice.toString(),
      rentalDuration: offerWithDouyinType.rentalDuration || '',
      dataImages: offerWithDouyinType.dataImages || [],
      accountRequirements: offerWithDouyinType.accountRequirements || {
        canChangeName: false,
        canIntroduction: false,
        canPostComments: false,
        canPostVideos: false,
        canUnbanAccount: false
      },
      loginMethods: offerWithDouyinType.loginMethods || [],
      contactPhone: offerWithDouyinType.contactPhone || '',
      contactQQ: offerWithDouyinType.contactQQ || '',
      contactEmail: offerWithDouyinType.contactEmail || ''
    });
  }, [offerId]);

  // 处理返回列表
  const handleBackToList = () => {
    router.push('/accountrental/my-account-rental/rentaloffer');
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editForm.accountName.trim()) {
      newErrors.accountName = '请输入账号名称';
    }
    
    if (!editForm.accountDescription.trim()) {
      newErrors.accountDescription = '请输入账号描述';
    }
    
    if (!editForm.rentalPrice || parseFloat(editForm.rentalPrice) <= 0) {
      newErrors.rentalPrice = '请输入有效的价格';
    }
    
    if (!editForm.rentalDuration.trim()) {
      newErrors.rentalDuration = '请输入租赁时长';
    }
    
    // 手机号必填验证
    if (!editForm.contactPhone || !editForm.contactPhone.trim()) {
      newErrors.contactPhone = '请输入手机号';
    }
    
    // 联系信息验证（格式验证）
    validateContactInfo(newErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 联系信息验证函数
  const validateContactInfo = (errors: Record<string, string>) => {
    // 手机号验证：中国大陆手机号规则（已在validateForm中验证必填）
    if (editForm.contactPhone && editForm.contactPhone.trim()) {
      if (!/^1[3-9]\d{9}$/.test(editForm.contactPhone)) {
        errors.contactPhone = '请输入有效的中国大陆手机号（11位数字）';
      }
    }
    
    // QQ号验证：5-13位数字，不能以0开头（选填）
    if (editForm.contactQQ && editForm.contactQQ.trim()) {
      if (!/^[1-9]\d{4,13}$/.test(editForm.contactQQ)) {
        errors.contactQQ = '请输入有效的QQ号（5-13位数字，不能以0开头）';
      }
    }
    
    // 邮箱验证：标准邮箱格式，支持常见域名（选填）
    if (editForm.contactEmail && editForm.contactEmail.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(editForm.contactEmail)) {
        errors.contactEmail = '请输入有效的邮箱地址（如example@domain.com）';
      } else if (editForm.contactEmail.length > 100) {
        errors.contactEmail = '邮箱地址长度不能超过100个字符';
      }
    }
  };
  
  // 单个字段实时验证
  const validateField = (fieldName: string) => {
    const newErrors = { ...errors };
    
    switch (fieldName) {
      case 'contactPhone':
        if (!editForm.contactPhone || !editForm.contactPhone.trim()) {
          newErrors.contactPhone = '请输入手机号';
        } else if (!/^1[3-9]\d{9}$/.test(editForm.contactPhone)) {
          newErrors.contactPhone = '请输入有效的中国大陆手机号（11位数字）';
        } else {
          delete newErrors.contactPhone;
        }
        break;
      case 'contactQQ':
        if (editForm.contactQQ) {
          if (!/^[1-9]\d{4,13}$/.test(editForm.contactQQ)) {
            newErrors.contactQQ = '请输入有效的QQ号（5-13位数字，不能以0开头）';
          } else {
            delete newErrors.contactQQ;
          }
        } else {
          delete newErrors.contactQQ;
        }
        break;
      case 'contactEmail':
        if (editForm.contactEmail) {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(editForm.contactEmail)) {
            newErrors.contactEmail = '请输入有效的邮箱地址（如example@domain.com）';
          } else if (editForm.contactEmail.length > 100) {
            newErrors.contactEmail = '邮箱地址长度不能超过100个字符';
          } else {
            delete newErrors.contactEmail;
          }
        } else {
          delete newErrors.contactEmail;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    
    // 对联系信息字段进行实时验证
    if (['contactPhone', 'contactQQ', 'contactEmail'].includes(name)) {
      validateField(name);
    } else if (errors[name]) {
      // 清除其他字段的错误
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // 处理账号要求变化
  const handleAccountRequirementChange = (key: keyof AccountRequirements, value: boolean) => {
    setEditForm(prev => ({
      ...prev,
      accountRequirements: {
        ...prev.accountRequirements,
        [key]: value
      }
    }));
  };
  
  // 处理登录方式变化
  const handleLoginMethodChange = (method: string) => {
    setEditForm(prev => ({
      ...prev,
      loginMethods: prev.loginMethods.includes(method)
        ? prev.loginMethods.filter(m => m !== method)
        : [...prev.loginMethods, method]
    }));
  };

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImageFile(e.target.files[0]);
      // 这里应该上传图片到服务器，这里简化处理
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setEditForm(prev => ({
        ...prev,
        dataImages: [...prev.dataImages, imageUrl]
      }));
      // 清空input，允许选择相同文件
      e.target.value = '';
    }
  };

  // 处理删除图片
  const handleDeleteImage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      dataImages: prev.dataImages.filter((_, i) => i !== index)
    }));
  };

  // 开始编辑
  const handleStartEdit = () => {
    if (offerDetail) {
      setEditForm({
        accountName: offerDetail.accountName,
        accountDescription: offerDetail.accountDescription,
        rentalPrice: offerDetail.rentalPrice.toString(),
        rentalDuration: offerDetail.rentalDuration || '',
        dataImages: offerDetail.dataImages || [],
        accountRequirements: { ...(offerDetail.accountRequirements || {
          canChangeName: false,
          canIntroduction: false,
          canPostComments: false,
          canPostVideos: false,
          canUnbanAccount: false
        }) },
        loginMethods: [...(offerDetail.loginMethods || [])],
        contactPhone: offerDetail.contactPhone || '',
        contactQQ: offerDetail.contactQQ || '',
        contactEmail: offerDetail.contactEmail || ''
      });
    }
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    if (offerDetail) {
      setEditForm({
        accountName: offerDetail.accountName,
        accountDescription: offerDetail.accountDescription,
        rentalPrice: offerDetail.rentalPrice.toString(),
        rentalDuration: offerDetail.rentalDuration || '',
        dataImages: offerDetail.dataImages || [],
        accountRequirements: { ...(offerDetail.accountRequirements || {
          canChangeName: false,
          canIntroduction: false,
          canPostComments: false,
          canPostVideos: false,
          canUnbanAccount: false
        }) },
        loginMethods: [...(offerDetail.loginMethods || [])],
        contactPhone: offerDetail.contactPhone || '',
        contactQQ: offerDetail.contactQQ || '',
        contactEmail: offerDetail.contactEmail || ''
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    // 表单验证
    const newErrors: Record<string, string> = {};
    
    if (!editForm.accountName.trim()) {
      newErrors.accountName = '账号名称不能为空';
    }
    
    if (!editForm.accountDescription.trim()) {
      newErrors.accountDescription = '账号描述不能为空';
    }
    
    if (!editForm.rentalPrice.trim()) {
      newErrors.rentalPrice = '租金不能为空';
    } else if (isNaN(Number(editForm.rentalPrice)) || Number(editForm.rentalPrice) <= 0) {
      newErrors.rentalPrice = '请输入有效的租金金额';
    }
    
    if (!editForm.rentalDuration.trim()) {
      newErrors.rentalDuration = '租赁时长不能为空';
    }
    
    if (editForm.dataImages.length === 0) {
      newErrors.dataImages = '请至少上传一张账号数据图片';
    }
    
    if (editForm.loginMethods.length === 0) {
      newErrors.loginMethods = '请至少选择一种登录方式';
    }
    
    // 联系信息验证
    validateContactInfo(newErrors);
    
    // 检查账号要求是否至少选择一项
    const hasAnyRequirement = Object.values(editForm.accountRequirements).some(Boolean);
    if (!hasAnyRequirement) {
      newErrors.accountRequirements = '请至少选择一项账号支持';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (offerDetail) {
      // 模拟API请求保存数据
      const updatedOffer: RentalOffer = {
        ...offerDetail,
        accountName: editForm.accountName,
        accountDescription: editForm.accountDescription,
        rentalPrice: Number(editForm.rentalPrice),
        rentalDuration: editForm.rentalDuration,
        dataImages: editForm.dataImages,
        accountRequirements: editForm.accountRequirements,
        loginMethods: editForm.loginMethods,
        contactPhone: editForm.contactPhone,
        contactQQ: editForm.contactQQ,
        contactEmail: editForm.contactEmail,
        status: '待审核' // 编辑后自动变为待审核状态
      };
      
      // 更新本地状态
      setOfferDetail(updatedOffer);
      setIsEditing(false);
      message.success('出租信息已更新，等待审核');
    }
  };

  // 处理编辑出租（修复引用问题）
  const handleEditOffer = () => {
    handleStartEdit();
  };

  // 处理下架
  const handleOffShelf = () => {
    setOffShelfModalVisible(true);
  };

  // 处理确认下架
  const handleConfirmOffShelf = () => {
    console.log('下架出租信息:', offerId);
    setOffShelfModalVisible(false);
    
    // 如果有租赁信息，先取消订单
    if (offerDetail && offerDetail.rentalInfo) {
      console.log('取消租赁订单:', offerDetail.rentalInfo.rentalOrderNo);
      message.info('租赁订单已取消');
    }
    
    // 更新本地状态模拟下架成功
    if (offerDetail) {
      setOfferDetail({
        ...offerDetail,
        status: '已下架',
        rentalInfo: undefined,
        dataImages: []
      });
      message.success('出租信息已下架，相关数据已清理');
    }
  };

  // 处理重新上架
  const handleReList = () => {
    console.log('重新上架出租信息:', offerId);
    if (offerDetail) {
      setOfferDetail({
        ...offerDetail,
        status: '待审核'
      });
      message.success('出租信息已提交重新审核');
    }
  };

  // 处理查看订单
  const handleViewOrder = () => {
    message.info('查看租赁订单详情');
  };

  // 处理图片点击查看大图
  const handleImageClick = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  if (!offerDetail) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  // 获取状态对应的样式类
  const getStatusClass = () => {
    const statusClasses = {
      '待审核': 'bg-orange-100 text-orange-700',
      '已上架': 'bg-green-100 text-green-700',
      '已租出': 'bg-purple-100 text-purple-700',
      '已下架': 'bg-gray-100 text-gray-700',
      '审核不通过': 'bg-red-100 text-red-700'
    };
    return statusClasses[offerDetail.status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容区域 */}
      <div className="px-4 py-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 基本信息区域 */}
          <div className="p-5">
            {/* 表单区域 - 根据编辑状态显示可编辑或只读内容 */}
            <div className="space-y-6">
              {/* 账号描述 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">求租要求</label>
                {isEditing ? (
                  <textarea
                    name="accountDescription"
                    value={editForm.accountDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md resize-none ${errors.accountDescription ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="请输入账号描述"
                  />
                ) : (
                  <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 whitespace-pre-wrap line-clamp-3">{offerDetail.accountDescription}</div>
                )}
                {errors.accountDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountDescription}</p>
                )}
              </div>

              {/* 租赁价格 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">价格（元/天）：</label>
                {isEditing ? (
                  <div className="flex items-center">
                    <input
                        type="number"
                        name="rentalPrice"
                        value={editForm.rentalPrice}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${errors.rentalPrice ? 'border-red-500' : 'border-gray-300'} `}
                        placeholder="请输入租赁价格"
                        min="0"
                        step="0.01"
                      />
                  </div>
                ) : (
                  <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">{offerDetail.rentalPrice} </div>
                )}
                {errors.rentalPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.rentalPrice}</p>
                )}
              </div>

              {/* 租赁时长 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">租赁时长（天）：</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="rentalDuration"
                    value={editForm.rentalDuration}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.rentalDuration ? 'border-red-500' : 'border-gray-300'} `}
                    placeholder="例如：可租赁1-7天，每次至少2小时等"
                  />
                ) : (
                  <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">{offerDetail.rentalDuration}</div>
                )}
                {errors.rentalDuration && (
                  <p className="mt-1 text-sm text-red-600">{errors.rentalDuration}</p>
                )}
               
              </div>

              {/* 发布时间 */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">发布时间</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">{offerDetail.createTime}</div>
              </div>

              {/* 联系信息 */}
              <div className="mt-6">
                <div className="text-base font-medium mb-3">联系方式</div>
                <div className="space-y-4">
                  {/* 手机号 */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">手机号：</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="tel"
                          name="contactPhone"
                          value={editForm.contactPhone || ''}
                          onChange={handleInputChange}
                          onBlur={() => validateField('contactPhone')}
                          className={`w-full px-3 py-2 border rounded-md ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'} `}
                          placeholder="请输入手机号"
                          maxLength={11}
                          pattern="1[3-9]\d{9}"
                        />
                      </div>
                    ) : (
                      <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                        {offerDetail.contactPhone || ''}
                      </div>
                    )}
                    {errors.contactPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
                    )}
                  </div>
                  
                  {/* QQ号 */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">QQ号：</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          name="contactQQ"
                          value={editForm.contactQQ || ''}
                          onChange={handleInputChange}
                          onBlur={() => validateField('contactQQ')}
                          className={`w-full px-3 py-2 border rounded-md ${errors.contactQQ ? 'border-red-500' : 'border-gray-300'} `}
                          placeholder="请输入QQ号（选填）"
                          maxLength={13}
                        />
                      </div>
                    ) : (
                      <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 h-10">
                        {offerDetail.contactQQ || ''}
                      </div>
                    )}
                    {errors.contactQQ && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactQQ}</p>
                    )}
                  </div>
                  
                  {/* 邮箱 */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">邮箱：</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="email"
                          name="contactEmail"
                          value={editForm.contactEmail || ''}
                          onChange={handleInputChange}
                          onBlur={() => validateField('contactEmail')}
                          className={`w-full px-3 py-2 border rounded-md ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'} `}
                          placeholder="请输入邮箱地址（选填）"
                          maxLength={100}
                        />
                      </div>
                    ) : (
                      <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 h-10">
                        {offerDetail.contactEmail || ''}
                      </div>
                    )}
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

        {/* 如果已租出，显示租赁信息 */}
        {offerDetail.status === '已租出' && offerDetail.rentalInfo && (
          <>
            <Divider orientation="left" orientationMargin={0} className="my-4">
              <span className="text-base">当前租赁信息</span>
            </Divider>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border border-gray-200">
                  <td className="w-1/4 p-3 bg-gray-50 border-r border-gray-200 font-medium">租赁订单号</td>
                  <td className="p-3 border border-gray-200">{offerDetail.rentalInfo.rentalOrderNo}</td>
                </tr>
                <tr className="border border-gray-200">
                  <td className="w-1/4 p-3 bg-gray-50 border-r border-gray-200 font-medium">租户名称</td>
                  <td className="p-3 border border-gray-200">{offerDetail.rentalInfo.tenantName}</td>
                </tr>
                <tr className="border border-gray-200">
                  <td className="w-1/4 p-3 bg-gray-50 border-r border-gray-200 font-medium">租赁开始时间</td>
                  <td className="p-3 border border-gray-200">{offerDetail.rentalInfo.startDate}</td>
                </tr>
                <tr className="border border-gray-200">
                  <td className="w-1/4 p-3 bg-gray-50 border-r border-gray-200 font-medium">租赁结束时间</td>
                  <td className="p-3 border border-gray-200">{offerDetail.rentalInfo.endDate}</td>
                </tr>
                <tr className="border border-gray-200">
                  <td className="w-1/4 p-3 bg-gray-50 border-r border-gray-200 font-medium">租赁金额</td>
                  <td className="p-3 border border-gray-200">¥{offerDetail.rentalInfo.amount}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

          {/* 账号要求 */}
            <div className="mt-4">
              <div className="text-base font-medium mb-3">账号支持</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* 账号要求 - 查看模式 */}
                {!isEditing ? (
                  <>
                    <div className="flex items-center">
                      <span className={`mr-2 ${offerDetail.accountRequirements?.canChangeName ? 'text-green-500' : 'text-red-400'}`}>
                        {offerDetail.accountRequirements?.canChangeName ? '✓' : '✗'}
                      </span>
                      <span>修改抖音账号名称和头像</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${offerDetail.accountRequirements?.canIntroduction ? 'text-green-500' : 'text-red-400'}`}>
                        {offerDetail.accountRequirements?.canIntroduction ? '✓' : '✗'}
                      </span>
                      <span>修改账号简介</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${offerDetail.accountRequirements?.canPostComments ? 'text-green-500' : 'text-red-400'}`}>
                        {offerDetail.accountRequirements?.canPostComments ? '✓' : '✗'}
                      </span>
                      <span>支持发布评论</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${offerDetail.accountRequirements?.canPostVideos ? 'text-green-500' : 'text-red-400'}`}>
                        {offerDetail.accountRequirements?.canPostVideos ? '✓' : '✗'}
                      </span>
                      <span>支持发布视频</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${offerDetail.accountRequirements?.canUnbanAccount ? 'text-green-500' : 'text-red-400'}`}>
                        {offerDetail.accountRequirements?.canUnbanAccount ? '✓' : '✗'}
                      </span>
                      <span>支持账号解封</span>
                    </div>
                  </>
                ) : (
                  /* 账号要求 - 编辑模式 */
                  <>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.accountRequirements.canChangeName}
                        onChange={(e) => handleAccountRequirementChange('canChangeName', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">修改抖音账号名称和头像</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.accountRequirements.canIntroduction}
                        onChange={(e) => handleAccountRequirementChange('canIntroduction', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">修改账号简介</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.accountRequirements.canPostComments}
                        onChange={(e) => handleAccountRequirementChange('canPostComments', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">支持发布评论</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.accountRequirements.canPostVideos}
                        onChange={(e) => handleAccountRequirementChange('canPostVideos', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">支持发布视频</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.accountRequirements.canUnbanAccount}
                        onChange={(e) => handleAccountRequirementChange('canUnbanAccount', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">支持账号解封</span>
                    </label>
                    <div className='text-sm text-gray-600 md:col-span-2'>支持勾选选项越多，出租概率越大。</div>
                  </>
                )}
              </div>
            </div>

            {/* 登录方式 */}
            <div className="mt-4">
              <div className="text-base font-medium mb-3">登录方式</div>
              {!isEditing ? (
                /* 登录方式 - 查看模式 */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <span className={`mr-2 ${offerDetail.loginMethods?.includes('scan') ? 'text-green-500' : 'text-red-400'}`}>
                      {offerDetail.loginMethods?.includes('scan') ? '✓' : '✗'}
                    </span>
                    <span>扫码登录</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${offerDetail.loginMethods?.includes('phone_sms') ? 'text-green-500' : 'text-red-400'}`}>
                      {offerDetail.loginMethods?.includes('phone_sms') ? '✓' : '✗'}
                    </span>
                    <span>手机号+短信验证登录</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${offerDetail.loginMethods?.includes('no_login') ? 'text-green-500' : 'text-red-400'}`}>
                      {offerDetail.loginMethods?.includes('no_login') ? '✓' : '✗'}
                    </span>
                    <span>不登录账号，按照承租方要求完成租赁</span>
                  </div>
                </div>
              ) : (
                /* 登录方式 - 编辑模式 */
                <div>
                  <div className="space-y-1">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        value="scan"
                        checked={editForm.loginMethods.includes('scan')}
                        onChange={() => handleLoginMethodChange('scan')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">扫码登录</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        value="phone_sms"
                        checked={editForm.loginMethods.includes('phone_sms')}
                        onChange={() => handleLoginMethodChange('phone_sms')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">手机号+短信验证登录</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        value="no_login"
                        checked={editForm.loginMethods.includes('no_login')}
                        onChange={() => handleLoginMethodChange('no_login')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">不登录账号，按照承租方要求完成租赁</span>
                    </label>
                  </div>
                  <div className='text-sm text-gray-600 mt-1'>请至少选择一种登录方式。支持多种登录方式可以提高账号出租概率。</div>
                </div>
              )}
            </div>

            {/* 求租信息无需上传图片，已删除图片上传模块 */}
          </div>

          {/* 如果已租出，显示租赁信息 */}
          {offerDetail.status === '已租出' && offerDetail.rentalInfo && (
            <div className="border-t border-gray-100 p-5">
              <div className="text-base font-medium mb-4">当前租赁信息</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">租赁订单号</div>
                  <div className="font-medium">{offerDetail.rentalInfo.rentalOrderNo}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">租户名称</div>
                  <div className="font-medium">{offerDetail.rentalInfo.tenantName}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">租赁开始时间</div>
                  <div className="font-medium">{offerDetail.rentalInfo.startDate}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">租赁结束时间</div>
                  <div className="font-medium">{offerDetail.rentalInfo.endDate}</div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <div className="text-sm text-gray-500">租赁金额</div>
                  <div className="font-medium text-lg text-blue-600">¥{offerDetail.rentalInfo.amount}</div>
                </div>
              </div>
            </div>
          )}

          {/* 如果审核不通过，显示失败原因 */}
          {offerDetail.status === '审核不通过' && offerDetail.rejectReason && (
            <div className="border-t border-gray-100 p-5 bg-red-50">
              <div className="text-base font-medium text-red-700 mb-3">审核失败原因</div>
              <div className="bg-white p-4 rounded-md border border-red-200">
                <p className="text-gray-700 whitespace-pre-wrap">{offerDetail.rejectReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮区域 */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5">
            <div className="flex flex-wrap gap-3 justify-end">
              {isEditing ? (
                // 编辑模式下显示保存和取消按钮
                <>
                  <Button 
                    onClick={handleCancelEdit}
                    icon={<CloseOutlined />}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </Button>
                  <Button 
                    onClick={handleSaveEdit}
                    icon={<CheckOutlined />}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    保存
                  </Button>
                </>
              ) : (
                // 非编辑模式下显示相应操作按钮
                <>
                  {(offerDetail.status === '已上架' || offerDetail.status === '待审核') && (
                    <>
                      <Button 
                        onClick={handleStartEdit}
                        icon={<EditOutlined />}
                        className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        编辑
                      </Button>
                      <Button 
                        onClick={handleOffShelf}
                        icon={<DeleteOutlined />}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
                      >
                        下架
                      </Button>
                    </>
                  )}

                  {offerDetail.status === '已下架' && (
                    <Button 
                      onClick={handleReList}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      重新上架
                    </Button>
                  )}

                  {offerDetail.status === '已租出' && (
                    <Button 
                      onClick={handleViewOrder}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      查看订单
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 下架确认弹窗 */}
      <Modal
        title="下架出租"
        open={offShelfModalVisible}
        onOk={handleConfirmOffShelf}
        onCancel={() => setOffShelfModalVisible(false)}
        width={400}
        footer={[
          <Button key="cancel" onClick={() => setOffShelfModalVisible(false)}>
            取消
          </Button>,
          <Button key="confirm" danger onClick={handleConfirmOffShelf}>
            确认下架
          </Button>
        ]}
      >
        <div className="py-4">
          <p className="text-center">确定要下架该出租信息吗？下架后可重新上架。</p>
        </div>
      </Modal>

      {/* 图片预览Modal */}
      <Modal
        title="图片预览"
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <div className="flex justify-center items-center p-2">
          <img 
            src={previewImage} 
            alt="预览图片" 
            className="w-full h-auto max-h-[70vh] object-contain" 
          />
        </div>
      </Modal>
    </div>
  );
};

export default RentalRequestDetailPage;
