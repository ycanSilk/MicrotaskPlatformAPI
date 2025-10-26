// 个人资料相关类型定义

/**
 * 用户个人信息类型
 */
export interface UserProfile {
  id: string;
  avatar: string;
  name: string;
  phone: string;
  email: string | null;
  invitationCode: string;
  createdAt: string;
  [key: string]: any;
}

/**
 * 资料编辑字段类型
 */
export interface ProfileEditField {
  key: keyof UserProfile;
  label: string;
  placeholder?: string;
  validate?: (value: string) => string | null;
}

/**
 * 资料更新请求类型
 */
export interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
  email?: string | null;
  avatar?: string;
}

/**
 * 密码修改请求类型
 */
export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 账号安全设置类型
 */
export interface AccountSecurity {
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  lastLoginTime?: string;
  lastLoginIp?: string;
}
