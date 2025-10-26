// 测试环境配置

export interface WithdrawalConfig {
  minAmount: number;
  maxAmount: number;
  fee: number;
  dailyLimit: number;
  allowedDays: number[];
  amountUnit: number;
  processingTime: string;
  autoReviewAmount: number;
}

export interface FinanceTestConfig {
  isTestMode: boolean;
  withdrawal: WithdrawalConfig;
}

// 默认测试配置
export const defaultFinanceTestConfig: FinanceTestConfig = {
  isTestMode: true,
  withdrawal: {
    minAmount: 1.00,      // 最低提现金额改为1元
    maxAmount: 5000.00,
    fee: 0.00,            // 测试环境不收取手续费
    dailyLimit: 999,      // 取消提现次数限制
    allowedDays: [0, 1, 2, 3, 4, 5, 6], // 允许所有日期提现
    amountUnit: 1.00,     // 允许任意金额（以1元为单位）
    processingTime: "即时处理（测试环境）",
    autoReviewAmount: 500.00
  }
};

// 当前活跃的测试配置
let currentTestConfig: FinanceTestConfig = { ...defaultFinanceTestConfig };

// 获取当前测试配置
export const getFinanceTestConfig = (): FinanceTestConfig => {
  return currentTestConfig;
};

// 设置测试模式
export const setFinanceTestMode = (isTestMode: boolean): void => {
  currentTestConfig.isTestMode = isTestMode;
};

// 切换测试模式
export const toggleFinanceTestMode = (): boolean => {
  currentTestConfig.isTestMode = !currentTestConfig.isTestMode;
  return currentTestConfig.isTestMode;
};

// 导出完整的配置管理工具
export const financeTestConfigManager = {
  getConfig: getFinanceTestConfig,
  setTestMode: setFinanceTestMode,
  toggleTestMode: toggleFinanceTestMode
};