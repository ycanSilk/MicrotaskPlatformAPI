'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentLoggedInUser, isAnyUserLoggedIn, commonLogin, commonLogout, getAuthStorageByRole } from '@/auth/common';

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (credentials: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => void;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 初始化用户状态
  useEffect(() => {
    const initializeAuth = () => {
      // 确保在客户端执行
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = getCurrentLoggedInUser();
        if (currentUser) {
          setUser(currentUser.user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 登录函数
  const handleLogin = async (credentials: any) => {
    setIsLoading(true);
    
    try {
      const result = await commonLogin(credentials);
      
      if (result.success && result.user) {
        // 更新状态
        setUser(result.user);
        setIsLoggedIn(true);
        
        return {
          success: true,
          message: result.message
        };
      } else {
        return {
          success: false,
          message: result.message || '登录失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '登录过程中发生错误，请重试'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const handleLogout = () => {
    commonLogout();
    setUser(null);
    setIsLoggedIn(false);
  };

  // 刷新用户信息
  const refreshUser = () => {
    const currentUser = getCurrentLoggedInUser();
    if (currentUser) {
      setUser(currentUser.user);
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // 更新用户信息
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    
    // 更新存储的用户信息
    if (updatedUser.role) {
      const authStorage = getAuthStorageByRole(updatedUser.role);
      if (authStorage) {
        const currentSession = authStorage.getAuth();
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            user: updatedUser
          };
          authStorage.saveAuth(updatedSession);
        }
      }
    }
  };

  return {
    user,
    isLoading,
    isLoggedIn,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
    updateUser,
    isAuthenticated: isLoggedIn && !!user
  };
}