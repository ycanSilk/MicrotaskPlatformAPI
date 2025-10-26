# 评论员收益系统数据模型设计

## 1. 设计概述

为支持评论员收益系统的核心功能（提现、提现记录管理、佣金计算等），设计一套完整、规范化的数据存储格式。新模型整合现有分散数据，明确数据关系，支持复杂业务场景，并提供良好的扩展性。

## 2. 数据模型结构

### 2.1 整体架构

```
commenter_finance/
├── accounts/         # 用户账户数据
├── earnings/         # 收益记录数据
├── withdrawals/      # 提现记录数据
├── commission/       # 佣金记录数据
├── teams/            # 团队关系数据
├── configs/          # 系统配置数据
└── schema.json       # 数据模型定义
```

### 2.2 核心数据集合

#### 2.2.1 账户数据 (accounts)

```json
{
  "accounts": [
    {
      "userId": "com001",
      "availableBalance": 456.80,
      "frozenBalance": 0,
      "totalEarnings": 2847.60,
      "withdrawnAmount": 2390.80,
      "completedTasks": 156,
      "withdrawalCount": 24,
      "inviteCode": "CM001",
      "totalInvited": 5,
      "referrerId": null,
      "lastUpdated": "2024-01-15T14:30:00Z",
      "paymentMethods": {
        "wechat": {
          "accountName": "张三",
          "accountNumber": "wxid_123456789",
          "verified": true
        },
        "alipay": {
          "accountName": "张三",
          "accountNumber": "13800138001",
          "verified": true
        },
        "bank": {
          "accountName": "张三",
          "accountNumber": "6228480001234567890",
          "bankName": "工商银行",
          "branchName": "北京朝阳支行",
          "verified": false
        }
      }
    }
  ]
}
```

#### 2.2.2 收益记录 (earnings)

```json
{
  "earnings": [
    {
      "id": "earn001",
      "userId": "com001",
      "taskId": "task001",
      "taskName": "美食探店推广",
      "amount": 3.50,
      "type": "task",
      "status": "completed",
      "earnedTime": "2024-01-15T14:30:00Z",
      "settleTime": "2024-01-15T14:35:00Z",
      "description": "完成美食探店评论任务",
      "commissionInfo": {
        "hasCommission": true,
        "commissionRate": 0.1,
        "commissionAmount": 0.35,
        "commissionRecipient": "com000"
      }
    },
    {
      "id": "earn002",
      "userId": "com001",
      "taskId": "invite_bonus",
      "taskName": "邀请好友奖励",
      "amount": 5.00,
      "type": "bonus",
      "status": "completed",
      "earnedTime": "2024-01-14T16:45:00Z",
      "settleTime": "2024-01-14T16:45:00Z",
      "description": "邀请用户com004注册并完成首单任务",
      "relatedUserId": "com004",
      "commissionInfo": {
        "hasCommission": false
      }
    }
  ]
}
```

#### 2.2.3 提现记录 (withdrawals)

```json
{
  "withdrawals": [
    {
      "id": "wd001",
      "userId": "com001",
      "amount": 100.00,
      "fee": 2.00,
      "totalAmount": 102.00,
      "method": "wechat",
      "status": "completed",
      "requestTime": "2024-01-18T09:00:00Z",
      "reviewTime": "2024-01-18T10:15:00Z",
      "completeTime": "2024-01-18T11:30:00Z",
      "description": "微信提现",
      "reviewerId": "admin001",
      "paymentInfo": {
        "transactionId": "wx202401181130123456789",
        "paidTo": "wxid_123456789"
      }
    }
  ]
}
```

#### 2.2.4 佣金记录 (commission)

```json
{
  "commissions": [
    {
      "id": "comm001",
      "recipientId": "com000",
      "sourceUserId": "com001",
      "sourceEarningId": "earn001",
      "amount": 0.35,
      "rate": 0.1,
      "type": "task",
      "status": "completed",
      "earnedTime": "2024-01-15T14:35:00Z",
      "description": "用户com001完成美食探店推广任务的佣金"
    },
    {
      "id": "comm002",
      "recipientId": "com001",
      "sourceUserId": "com004",
      "sourceEarningId": "earn006",
      "amount": 2.00,
      "rate": 0.1,
      "type": "team",
      "status": "completed",
      "earnedTime": "2025-09-18T09:35:00Z",
      "description": "团队成员com004完成科技类真人账号出租任务的佣金"
    }
  ]
}
```

#### 2.2.5 团队关系 (teams)

```json
{
  "teamMembers": [
    {
      "id": "tm001",
      "inviterId": "com001",
      "memberId": "com002",
      "joinDate": "2024-01-10T09:00:00Z",
      "level": 1,
      "status": "active",
      "memberInfo": {
        "nickname": "小王",
        "avatar": "👨",
        "completedTasks": 23,
        "totalEarnings": 127.50
      },
      "commissionStats": {
        "totalCommission": 6.38,
        "commissionRate": 0.1,
        "commissionThisWeek": 1.25,
        "commissionThisMonth": 3.82
      }
    }
  ]
}
```

#### 2.2.6 系统配置 (configs)

```json
{
  "config": {
    "withdrawal": {
      "minAmount": 100.00,
      "maxAmount": 5000.00,
      "fee": 2.00,
      "dailyLimit": 3,
      "allowedDays": [4],  // 周四
      "amountUnit": 100.00,
      "processingTime": "24小时内",
      "autoReviewAmount": 500.00  // 小于该金额自动审核
    },
    "commission": {
      "defaultRate": 0.1,
      "teamRates": [
        {"level": 1, "rate": 0.1},
        {"level": 2, "rate": 0.05},
        {"level": 3, "rate": 0.03}
      ],
      "inviteBonus": 5.00,
      "settlementCycle": "daily"
    },
    "earnings": {
      "settlementDelay": 0,
      "minTaskReward": 1.00,
      "maxTaskReward": 100.00
    },
    "security": {
      "maxFailedAttempts": 3,
      "lockoutDuration": 3600,
      "withdrawalVerification": true
    }
  }
}
```

### 2.3 数据模型定义 (schema.json)

```json
{
  "modelVersion": "2.0.0",
  "description": "评论员收益系统完整数据模型",
  "lastUpdated": "2024-09-16",
  
  "entities": {
    "accounts": {
      "description": "评论员账户信息",
      "primaryKey": "userId",
      "indexes": ["userId", "inviteCode", "referrerId"],
      "relationships": {
        "referrerId": {"entity": "accounts", "field": "userId"}
      }
    },
    "earnings": {
      "description": "评论员收益记录",
      "primaryKey": "id",
      "indexes": ["userId", "taskId", "earnedTime", "type"],
      "relationships": {
        "userId": {"entity": "accounts", "field": "userId"}
      }
    },
    "withdrawals": {
      "description": "评论员提现记录",
      "primaryKey": "id",
      "indexes": ["userId", "status", "requestTime", "method"],
      "relationships": {
        "userId": {"entity": "accounts", "field": "userId"}
      }
    },
    "commissions": {
      "description": "佣金记录",
      "primaryKey": "id",
      "indexes": ["recipientId", "sourceUserId", "earnedTime", "type"],
      "relationships": {
        "recipientId": {"entity": "accounts", "field": "userId"},
        "sourceUserId": {"entity": "accounts", "field": "userId"}
      }
    },
    "teamMembers": {
      "description": "团队成员关系",
      "primaryKey": "id",
      "indexes": ["inviterId", "memberId", "status"],
      "relationships": {
        "inviterId": {"entity": "accounts", "field": "userId"},
        "memberId": {"entity": "accounts", "field": "userId"}
      }
    }
  },
  
  "queryTemplates": {
    "getUserFinancialSummary": "SELECT * FROM accounts WHERE userId = ?",
    "getUserEarningsByDateRange": "SELECT * FROM earnings WHERE userId = ? AND earnedTime BETWEEN ? AND ?",
    "getUserWithdrawalHistory": "SELECT * FROM withdrawals WHERE userId = ?",
    "getUserTeamMembers": "SELECT * FROM teamMembers WHERE inviterId = ?",
    "getUserCommissionHistory": "SELECT * FROM commissions WHERE recipientId = ?"
  }
}
```

## 3. 功能实现支持

### 3.1 提现功能

新模型支持多种提现方式，并通过配置文件统一管理提现规则：
- 最低提现金额、最高提现金额、手续费、提现时间限制
- 提现金额必须为100元整数倍的限制
- 提现状态流转（pending -> review -> completed/rejected）
- 支付方式验证管理

### 3.2 提现记录管理

提现记录包含完整的生命周期信息：
- 申请时间、审核时间、完成时间
- 审核人信息
- 交易流水号
- 完整的状态流转

### 3.3 佣金计算系统

完整支持多级团队佣金计算：
- 默认佣金比例和团队级别佣金比例配置
- 详细的佣金记录，包括来源、比例、金额
- 佣金统计信息
- 邀请奖励机制

### 3.4 数据分析支持

模型设计支持丰富的数据分析功能：
- 按时间维度（今日、昨日、本周、本月）统计收益
- 按任务类型分析收益来源
- 团队业绩分析
- 佣金收入分析

## 4. 数据同步与更新机制

### 4.1 数据一致性保障

1. **事务管理**：关键操作（如提现、收益结算）应作为事务处理，确保数据一致性

2. **余额更新机制**：
   - 收益到账：可用余额 += 收益金额
   - 提现申请：可用余额 -= 提现金额，冻结余额 += 提现金额
   - 提现完成：冻结余额 -= 提现金额
   - 提现拒绝：冻结余额 -= 提现金额，可用余额 += 提现金额

3. **时间戳同步**：所有数据更新都应包含lastUpdated时间戳

### 4.2 更新流程示例

#### 4.2.1 提现申请流程

1. 用户发起提现请求
2. 系统验证提现规则（金额、时间等）
3. 创建提现记录（状态：pending）
4. 扣减用户可用余额，增加冻结余额
5. 管理员审核（状态：review）
6. 审核通过，处理支付（状态：completed）或拒绝（状态：rejected）
7. 更新用户余额和提现记录

#### 4.2.2 收益结算流程

1. 任务完成并通过审核
2. 系统计算任务收益和佣金
3. 创建收益记录
4. 更新用户可用余额
5. 如涉及团队佣金，创建佣金记录并更新相应账户余额

## 5. 系统扩展性设计

### 5.1 新增功能支持

1. **多级团队佣金**：支持多级代理模式，通过teamRates配置不同级别佣金比例

2. **活动奖励**：通过earnings的type字段扩展支持各种活动奖励

3. **多样化提现方式**：paymentMethods结构支持灵活扩展新的提现渠道

4. **定制化配置**：所有业务规则均可通过configs配置文件调整，无需修改代码

### 5.2 性能优化

1. **索引设计**：为常用查询字段建立索引，提高查询效率

2. **数据分片**：针对大规模数据，可按userId或时间进行数据分片存储

3. **缓存机制**：热门数据可引入缓存层，减少数据读取压力

## 6. 迁移策略

从现有系统迁移到新数据模型的策略：

1. **数据映射**：建立旧数据到新模型的映射关系
2. **批量转换**：编写脚本批量转换现有数据
3. **并行运行**：新旧系统并行运行，验证数据一致性
4. **逐步切换**：分功能模块逐步切换到新模型
5. **数据校验**：建立数据校验机制，确保迁移数据的完整性和准确性

## 7. 结语

新设计的数据存储格式整合了现有功能，提供了完整的提现、提现记录管理和佣金计算支持，并具有良好的扩展性和可维护性。通过配置驱动的设计，使得系统规则可以灵活调整，无需修改代码。统一的数据模型也为后续的数据分析和功能扩展奠定了基础。