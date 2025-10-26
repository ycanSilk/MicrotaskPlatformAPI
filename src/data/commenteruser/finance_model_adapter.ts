import { CommenterAuthStorage } from '@/auth/commenter/auth';
import boundUserInvitations from './bound_user_invitations.json';

// 定义类型接口
export interface DailyEarning {
  date: string;
  amount: number;
}

// 定义数据模型接口
export interface CommenterAccount {
  userId: string;
  availableBalance: number;
  inviteCode: string;
  referrerId?: string;
  createdAt: string;
  frozenBalance?: number;
  totalEarnings?: number;
  completedTasks?: number;
  lastUpdated?: string;
  todayEarnings?: number;
  yesterdayEarnings?: number;
  weeklyEarnings?: number;
  monthlyEarnings?: number;
  dailyEarnings?: DailyEarning[];
}

export interface TeamMember {
  id?: string;
  memberId: string;
  nickname: string;
  avatar?: string;
  joinDate: string;
  status: string;
  statusColor?: string;
  completedTasks: number;
  totalEarnings: number;
  myCommission: number;
  level?: string;
  commission?: number;
}

export interface CommissionRecord {
  id: string;
  inviterId: string;
  memberId: string;
  memberName: string;
  taskId?: string;
  taskName: string;
  taskEarning?: number;
  commission: number;
  date: string;
  type: 'task' | 'register';
}

export interface UserEarning {
  id: string;
  userId: string;
  taskId: string;
  taskName: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

// 模拟数据服务类
export class FinanceModelAdapter {
  private static instance: FinanceModelAdapter;
  private mockDataLoaded: boolean = false;
  private mockCommenterAccounts: CommenterAccount[] = [];
  private mockTeamMembers: TeamMember[] = [];
  private mockCommissionHistory: CommissionRecord[] = [];
  private mockEarningsRecords: UserEarning[] = [];
  private mockWithdrawalRecords: WithdrawalRecord[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): FinanceModelAdapter {
    if (!FinanceModelAdapter.instance) {
      FinanceModelAdapter.instance = new FinanceModelAdapter();
    }
    return FinanceModelAdapter.instance;
  }

  private initializeMockData(): void {
    // 模拟账户数据
    this.mockCommenterAccounts = [
      {
        userId: 'user1',
        availableBalance: 125.65,
        inviteCode: 'CM001',
        referrerId: undefined,
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        userId: 'user2',
        availableBalance: 89.30,
        inviteCode: 'CM002',
        referrerId: 'user1',
        createdAt: '2024-01-10T14:30:00Z'
      },
      {
        userId: 'user3',
        availableBalance: 45.80,
        inviteCode: 'CM003',
        referrerId: 'user1',
        createdAt: '2024-01-12T09:15:00Z'
      },
      {
        userId: 'user4',
        availableBalance: 234.75,
        inviteCode: 'CM004',
        referrerId: undefined,
        createdAt: '2024-01-05T16:45:00Z'
      },
      {
        userId: 'user5',
        availableBalance: 15.60,
        inviteCode: 'CM005',
        referrerId: 'user1',
        createdAt: '2024-01-14T11:20:00Z'
      },
      {
        userId: 'user6',
        availableBalance: 178.90,
        inviteCode: 'CM006',
        referrerId: 'user4',
        createdAt: '2024-01-08T13:50:00Z'
      },
      {
        userId: 'user7',
        availableBalance: 3.50,
        inviteCode: 'CM007',
        referrerId: 'user1',
        createdAt: '2024-01-15T10:30:00Z'
      }
    ];

    // 模拟团队成员数据
    this.mockTeamMembers = [
      {
        id: '1',
        memberId: 'user2',
        nickname: '小王',
        avatar: '👨',
        joinDate: '2024-01-10',
        status: '活跃',
        statusColor: 'text-green-600',
        completedTasks: 23,
        totalEarnings: 127.50,
        myCommission: 6.38,
        level: 'Lv.2 评论员'
      },
      {
        id: '2',
        memberId: 'user3',
        nickname: '小李',
        avatar: '👩',
        joinDate: '2024-01-12',
        status: '活跃',
        statusColor: 'text-green-600',
        completedTasks: 15,
        totalEarnings: 89.20,
        myCommission: 4.46,
        level: 'Lv.1 评论员'
      },
      {
        id: '3',
        memberId: 'user5',
        nickname: '小张',
        avatar: '🧑',
        joinDate: '2024-01-14',
        status: '新手',
        statusColor: 'text-orange-600',
        completedTasks: 3,
        totalEarnings: 15.60,
        myCommission: 0.78,
        level: '新手评论员'
      },
      {
        id: '4',
        memberId: 'user7',
        nickname: '小陈',
        avatar: '👨‍💻',
        joinDate: '2024-01-15',
        status: '休眠',
        statusColor: 'text-gray-500',
        completedTasks: 1,
        totalEarnings: 3.50,
        myCommission: 0.18,
        level: '新手评论员'
      }
    ];

    // 模拟佣金历史数据
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    this.mockCommissionHistory = [
      {
        id: '1',
        inviterId: 'user1',
        memberId: 'user2',
        memberName: '小王',
        taskId: 'task1',
        taskName: '美食探店推广',
        taskEarning: 3.50,
        commission: 0.18,
        date: `${today} 14:30`,
        type: 'task'
      },
      {
        id: '2',
        inviterId: 'user1',
        memberId: 'user3',
        memberName: '小李',
        taskId: 'task2',
        taskName: '护肤产品体验',
        taskEarning: 5.20,
        commission: 0.26,
        date: `${today} 10:20`,
        type: 'task'
      },
      {
        id: '3',
        inviterId: 'user1',
        memberId: 'user5',
        memberName: '小张',
        taskId: 'task3',
        taskName: '旅游体验分享',
        taskEarning: 4.20,
        commission: 0.21,
        date: `${yesterdayStr} 16:45`,
        type: 'task'
      },
      {
        id: '4',
        inviterId: 'user1',
        memberId: 'user2',
        memberName: '小王',
        taskId: '',
        taskName: '注册完成奖励',
        taskEarning: 0,
        commission: 5.00,
        date: '2024-01-10 09:15',
        type: 'register'
      },
      {
        id: '5',
        inviterId: 'user1',
        memberId: 'user3',
        memberName: '小李',
        taskId: '',
        taskName: '注册完成奖励',
        taskEarning: 0,
        commission: 5.00,
        date: '2024-01-12 11:30',
        type: 'register'
      },
      {
        id: '6',
        inviterId: 'user1',
        memberId: 'user5',
        memberName: '小张',
        taskId: '',
        taskName: '注册完成奖励',
        taskEarning: 0,
        commission: 5.00,
        date: '2024-01-14 08:45',
        type: 'register'
      },
      {
        id: '7',
        inviterId: 'user1',
        memberId: 'user7',
        memberName: '小陈',
        taskId: '',
        taskName: '注册完成奖励',
        taskEarning: 0,
        commission: 5.00,
        date: '2024-01-15 10:30',
        type: 'register'
      }
    ];

    // 模拟收益记录数据
    this.mockEarningsRecords = [
      {
        id: '1',
        userId: 'user1',
        taskId: 'task1',
        taskName: '美食探店评论',
        amount: 3.50,
        description: '完成美食探店评论任务',
        createdAt: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        userId: 'user1',
        taskId: 'task2',
        taskName: '电子产品评测',
        amount: 5.20,
        description: '完成电子产品评测任务',
        createdAt: '2024-01-15T10:20:00Z'
      },
      {
        id: '3',
        userId: 'user1',
        taskId: 'commission1',
        taskName: '团队佣金',
        amount: 0.44,
        description: '从小王、小李、小张的任务中获得的佣金',
        createdAt: '2024-01-15T23:00:00Z'
      }
    ];

    // 模拟提现记录数据
    this.mockWithdrawalRecords = [
      {
        id: '1',
        userId: 'user1',
        amount: 50.00,
        fee: 0.50,
        method: '微信',
        status: 'approved',
        requestedAt: '2024-01-10T15:30:00Z',
        processedAt: '2024-01-11T10:00:00Z'
      },
      {
        id: '2',
        userId: 'user1',
        amount: 30.00,
        fee: 0.30,
        method: '支付宝',
        status: 'pending',
        requestedAt: '2024-01-15T18:45:00Z'
      }
    ];

    this.mockDataLoaded = true;
  }

  // 获取用户账户信息
  public async getUserAccount(userId: string): Promise<CommenterAccount | null> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.mockCommenterAccounts.find(account => account.userId === userId) || null;
  }

  // 获取用户团队成员
  public async getUserTeamMembers(userId: string): Promise<TeamMember[]> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // 从bound_user_invitations.json获取用户邀请的所有已绑定成员
    const boundInvitations = boundUserInvitations.invitations
      .filter(invitation => invitation.inviterId === userId && invitation.status === 'bound');
    
    // 将邀请关系数据转换为TeamMember格式，结合现有的mock数据
    const teamMembers: TeamMember[] = boundInvitations.map((invitation, index) => {
      // 查找对应的mock数据或创建新数据
      const mockMember = this.mockTeamMembers.find(m => m.memberId === invitation.inviteeId);
      
      if (mockMember) {
        return mockMember;
      }
      
      // 如果没有对应的mock数据，创建默认的成员数据
      return {
        id: `team_${invitation.id}`,
        memberId: invitation.inviteeId || `user${Date.now()}`,
        nickname: invitation.inviteeName || `邀请成员${index + 1}`,
        avatar: '👤',
        joinDate: invitation.boundAt ? new Date(invitation.boundAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: '活跃',
        statusColor: 'text-green-600',
        completedTasks: Math.floor(Math.random() * 50),
        totalEarnings: Math.random() * 200,
        myCommission: Math.random() * 10,
        level: 'Lv.1 评论员'
      };
    });
    
    return teamMembers;
  }

  // 获取用户佣金历史
  public async getUserCommissionHistory(userId: string): Promise<CommissionRecord[]> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 获取用户作为邀请者的所有佣金记录
    const mockRecords = this.mockCommissionHistory.filter(record => record.inviterId === userId);
    
    // 从bound_user_invitations.json获取该用户的注册奖励记录
    const userInvitations = boundUserInvitations.invitations
      .filter(invitation => invitation.inviterId === userId);
    
    const invitationIds = userInvitations.map(invitation => invitation.id);
    
    // 获取这些邀请对应的注册奖励
    const registrationRewards = boundUserInvitations.inviteRewards
      .filter(reward => invitationIds.includes(reward.invitationId) && reward.rewardType === 'register')
      .map(reward => {
        const invitation = userInvitations.find(inv => inv.id === reward.invitationId);
        return {
          id: reward.id,
          inviterId: userId,
          memberId: invitation?.inviteeId || '',
          memberName: invitation?.inviteeName || '新成员',
          taskId: '',
          taskName: '注册完成奖励',
          taskEarning: 0,
          commission: reward.amount,
          date: reward.issuedAt ? new Date(reward.issuedAt).toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '-') : new Date().toLocaleString('zh-CN'),
          type: 'register' as const
        };
      });
    
    // 合并mock记录和从JSON获取的注册奖励记录
    const allRecords = [...mockRecords, ...registrationRewards];
    
    // 按日期排序（最新的在前）
    allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return allRecords;
  }

  // 获取用户收益记录
  public async getUserEarningsRecords(userId: string): Promise<UserEarning[]> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return this.mockEarningsRecords.filter(record => record.userId === userId);
  }

  // 获取用户提现记录
  public async getUserWithdrawalRecords(userId: string): Promise<WithdrawalRecord[]> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.mockWithdrawalRecords.filter(record => record.userId === userId);
  }

  // 计算佣金收益
  public async calculateCommissionEarnings(userId: string): Promise<number> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 获取现有佣金记录的收益
    const commissionRecords = this.mockCommissionHistory.filter(record => record.inviterId === userId);
    const mockCommissionTotal = commissionRecords.reduce((total, record) => total + record.commission, 0);
    
    // 获取bound_user_invitations.json中该用户的注册奖励总金额
    const userInvitations = boundUserInvitations.invitations
      .filter(invitation => invitation.inviterId === userId);
    
    const invitationIds = userInvitations.map(invitation => invitation.id);
    
    const registrationRewardsTotal = boundUserInvitations.inviteRewards
      .filter(reward => invitationIds.includes(reward.invitationId) && reward.rewardType === 'register' && reward.status === 'completed')
      .reduce((total, reward) => total + reward.amount, 0);
    
    // 合并两部分收益
    return mockCommissionTotal + registrationRewardsTotal;
  }

  // 创建提现记录
  public async createWithdrawal(userId: string, amount: number, method: string): Promise<WithdrawalRecord> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 验证提现金额
    const minWithdrawalAmount = 10;
    const maxWithdrawalAmount = 1000;
    
    if (amount < minWithdrawalAmount) {
      throw new Error(`提现金额不能低于${minWithdrawalAmount}元`);
    }
    
    if (amount > maxWithdrawalAmount) {
      throw new Error(`提现金额不能超过${maxWithdrawalAmount}元`);
    }
    
    // 验证账户余额
    const userAccount = this.mockCommenterAccounts.find(account => account.userId === userId);
    if (!userAccount || userAccount.availableBalance < amount) {
      throw new Error('账户余额不足');
    }
    
    // 计算手续费 (1%)
    const fee = amount * 0.01;
    
    // 创建新的提现记录
    const newWithdrawal: WithdrawalRecord = {
      id: `withdrawal_${Date.now()}`,
      userId,
      amount,
      fee,
      method,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    
    // 添加到模拟数据中
    this.mockWithdrawalRecords.push(newWithdrawal);
    
    // 更新账户余额（实际应该在提现成功后更新）
    // userAccount.availableBalance -= (amount + fee);
    
    return newWithdrawal;
  }

  // 创建用户收益记录
  public async createUserEarningRecord(
    userId: string,
    taskId: string,
    taskName: string,
    amount: number,
    description: string
  ): Promise<UserEarning> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newEarning: UserEarning = {
      id: `earning_${Date.now()}`,
      userId,
      taskId,
      taskName,
      amount,
      description,
      createdAt: new Date().toISOString()
    };
    
    this.mockEarningsRecords.push(newEarning);
    
    // 更新用户余额
    const userAccount = this.mockCommenterAccounts.find(account => account.userId === userId);
    if (userAccount) {
      userAccount.availableBalance += amount;
    }
    
    return newEarning;
  }

  // 管理员审核提现申请
  public async approveWithdrawal(withdrawalId: string): Promise<WithdrawalRecord> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const withdrawal = this.mockWithdrawalRecords.find(w => w.id === withdrawalId);
    if (!withdrawal) {
      throw new Error('提现记录不存在');
    }
    
    if (withdrawal.status !== 'pending') {
      throw new Error('提现申请已处理');
    }
    
    // 更新提现状态
    withdrawal.status = 'approved';
    withdrawal.processedAt = new Date().toISOString();
    
    // 更新用户余额
    const userAccount = this.mockCommenterAccounts.find(account => account.userId === withdrawal.userId);
    if (userAccount) {
      userAccount.availableBalance -= (withdrawal.amount + withdrawal.fee);
    }
    
    return withdrawal;
  }

  // 管理员拒绝提现申请
  public async rejectWithdrawal(withdrawalId: string, reason?: string): Promise<WithdrawalRecord> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const withdrawal = this.mockWithdrawalRecords.find(w => w.id === withdrawalId);
    
    if (!withdrawal) {
      throw new Error('提现记录不存在');
    }
    
    if (withdrawal.status !== 'pending') {
      throw new Error('提现申请已处理');
    }
    
    // 更新提现状态
    withdrawal.status = 'rejected';
    withdrawal.processedAt = new Date().toISOString();
    
    return withdrawal;
  }

  // 提交提现请求（用于withdraw页面）
  public async submitWithdrawal(withdrawalRequest: {
    userId: string;
    amount: number;
    method: string;
    accountInfo?: any;
    status: 'pending';
    createdAt: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      // 调用现有方法创建提现记录
      await this.createWithdrawal(
        withdrawalRequest.userId,
        withdrawalRequest.amount,
        withdrawalRequest.method
      );
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提现请求处理失败';
      return { success: false, message: errorMessage };
    }
  }
}

// 导出单例实例
export const financeModelAdapter = FinanceModelAdapter.getInstance();

// 兼容旧数据格式的转换工具
export const legacyDataConverter = {
  convertToNewAccountFormat(legacyAccount: any): CommenterAccount {
    return {
      userId: legacyAccount.userId || legacyAccount.id,
      availableBalance: legacyAccount.balance || 0,
      inviteCode: legacyAccount.inviteCode || `CM${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      referrerId: legacyAccount.referrerId || null,
      createdAt: legacyAccount.createdAt || new Date().toISOString()
    };
  },
  
  convertToNewEarningFormat(legacyEarning: any): UserEarning {
    return {
      id: legacyEarning.id,
      userId: legacyEarning.userId,
      taskId: legacyEarning.taskId,
      taskName: legacyEarning.taskName || '未知任务',
      amount: legacyEarning.amount || 0,
      description: legacyEarning.description || '任务收益',
      createdAt: legacyEarning.createdAt || new Date().toISOString()
    };
  },
  
  convertToNewWithdrawalFormat(legacyWithdrawal: any): WithdrawalRecord {
    return {
      id: legacyWithdrawal.id,
      userId: legacyWithdrawal.userId,
      amount: legacyWithdrawal.amount || 0,
      fee: legacyWithdrawal.fee || 0,
      method: legacyWithdrawal.method || '微信',
      status: legacyWithdrawal.status as 'pending' | 'approved' | 'rejected' || 'pending',
      requestedAt: legacyWithdrawal.requestedAt || new Date().toISOString(),
      processedAt: legacyWithdrawal.processedAt
    };
  }
};