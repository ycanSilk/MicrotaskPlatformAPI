import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

interface CoolingTimerProps {
  onCoolingStart?: (endTime: number) => void;
  onCoolingEnd?: () => void;
  initialMinutes?: number;
  initialSeconds?: number;
}

interface RemainingTime {
  minutes: number;
  seconds: number;
}

/**
 * 冷却计时器组件
 * 独立封装的计时逻辑，使用localStorage持久化状态
 */
export const CoolingTimer = forwardRef<{
  startCooling: (durationMinutes?: number) => void;
  endCooling: () => void;
  isCoolingDown: boolean;
  remainingTime: RemainingTime;
}, CoolingTimerProps>((props, ref) => {
  const { onCoolingStart, onCoolingEnd, initialMinutes = 5, initialSeconds = 0 } = props;
  const [coolingDown, setCoolingDown] = useState(false);
  const [coolingEndTime, setCoolingEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<RemainingTime>({ minutes: 0, seconds: 0 });

  // 从localStorage恢复冷却状态
  const restoreCoolingState = useCallback(() => {
    console.log('CoolingTimer: 从localStorage恢复冷却状态');
    try {
      const isCoolingDown = localStorage.getItem('commenter_cooling_down') === 'true';
      const coolingEndTimeStr = localStorage.getItem('commenter_cooling_end_time');
      
      console.log('CoolingTimer: localStorage数据:', {
        isCoolingDown,
        coolingEndTimeStr
      });
      
      if (isCoolingDown && coolingEndTimeStr && coolingEndTimeStr.trim() !== '') {
        const coolingEndTime = parseInt(coolingEndTimeStr, 10);
        const now = Date.now();
        const remaining = coolingEndTime - now;
        
        console.log('CoolingTimer: 冷却时间检查:', {
          coolingEndTime,
          now,
          remainingMs: remaining,
          remainingMinutes: Math.floor(remaining / 60000),
          remainingSeconds: Math.floor((remaining % 60000) / 1000)
        });
        
        if (remaining > 0) {
          console.log('CoolingTimer: 恢复冷却状态');
          setCoolingDown(true);
          setCoolingEndTime(coolingEndTime);
          
          // 计算剩余时间
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setRemainingTime({ minutes, seconds });
          
          return coolingEndTime;
        } else {
          console.log('CoolingTimer: 冷却时间已结束，清除localStorage');
          localStorage.removeItem('commenter_cooling_down');
          localStorage.removeItem('commenter_cooling_end_time');
        }
      }
    } catch (e) {
      console.error('CoolingTimer: 恢复冷却状态出错:', e);
    }
    return null;
  }, []);

  // 初始化时恢复冷却状态
  useEffect(() => {
    console.log('CoolingTimer: 初始化');
    restoreCoolingState();
  }, [restoreCoolingState]);

  // 冷却倒计时逻辑
  useEffect(() => {
    console.log('CoolingTimer: 倒计时效果更新', { coolingDown, coolingEndTime });
    let timer: NodeJS.Timeout | undefined;
    
    if (coolingDown && coolingEndTime) {
      console.log('CoolingTimer: 启动倒计时');
      
      const calculateRemainingTime = () => {
        const now = Date.now();
        const diff = coolingEndTime - now;
        
        console.log('CoolingTimer: 倒计时计算:', {
          coolingEndTime,
          now,
          diffMs: diff,
          diffMinutes: Math.floor(diff / 60000),
          diffSeconds: Math.floor((diff % 60000) / 1000)
        });
        
        if (diff <= 0) {
          console.log('CoolingTimer: 冷却时间已结束');
          setCoolingDown(false);
          setCoolingEndTime(null);
          setRemainingTime({ minutes: 0, seconds: 0 });
          localStorage.removeItem('commenter_cooling_down');
          localStorage.removeItem('commenter_cooling_end_time');
          
          if (onCoolingEnd) {
            onCoolingEnd();
          }
          
          return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        console.log('CoolingTimer: 更新剩余时间:', { minutes, seconds });
        setRemainingTime({ minutes, seconds });
      };
      
      calculateRemainingTime();
      timer = setInterval(calculateRemainingTime, 1000);
    }
    
    return () => {
      console.log('CoolingTimer: 清理倒计时定时器');
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [coolingDown, coolingEndTime, onCoolingEnd]);

  // 监听storage事件，同步多标签页状态
  useEffect(() => {
    console.log('CoolingTimer: 添加storage事件监听');
    
    const handleStorageChange = (e: StorageEvent) => {
      console.log('CoolingTimer: storage事件触发:', { key: e.key });
      
      if (e.key === 'commenter_cooling_down' || e.key === 'commenter_cooling_end_time') {
        // 恢复冷却状态以同步
        restoreCoolingState();
      }
    };
    
    const handleStorageChangeWrapper = (e: Event) => {
      handleStorageChange(e as StorageEvent);
    };
    
    window.addEventListener('storage', handleStorageChangeWrapper);
    
    return () => {
      console.log('CoolingTimer: 移除storage事件监听');
      window.removeEventListener('storage', handleStorageChangeWrapper);
    };
  }, [restoreCoolingState]);

  // 开始冷却方法
  const startCooling = useCallback((durationMinutes: number = initialMinutes) => {
    console.log('CoolingTimer: 开始冷却', { durationMinutes });
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = Date.now() + durationMs;
    
    console.log('CoolingTimer: 设置冷却时间:', {
      durationMs,
      endTime,
      endTimeHuman: new Date(endTime).toLocaleTimeString()
    });
    
    setCoolingDown(true);
    setCoolingEndTime(endTime);
    setRemainingTime({ minutes: durationMinutes, seconds: 0 });
    
    try {
      localStorage.setItem('commenter_cooling_down', 'true');
      localStorage.setItem('commenter_cooling_end_time', endTime.toString());
      console.log('CoolingTimer: 冷却状态保存到localStorage');
    } catch (e) {
      console.error('CoolingTimer: localStorage保存失败:', e);
    }
    
    if (onCoolingStart) {
      onCoolingStart(endTime);
    }
  }, [initialMinutes, onCoolingStart]);

  // 结束冷却方法
  const endCooling = useCallback(() => {
    console.log('CoolingTimer: 手动结束冷却');
    setCoolingDown(false);
    setCoolingEndTime(null);
    setRemainingTime({ minutes: 0, seconds: 0 });
    
    try {
      localStorage.removeItem('commenter_cooling_down');
      localStorage.removeItem('commenter_cooling_end_time');
      console.log('CoolingTimer: 清除localStorage中的冷却状态');
    } catch (e) {
      console.error('CoolingTimer: localStorage清除失败:', e);
    }
    
    if (onCoolingEnd) {
      onCoolingEnd();
    }
  }, [onCoolingEnd]);

  // 格式化剩余时间显示
  const formatRemainingTime = () => {
    const { minutes, seconds } = remainingTime;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 暴露给父组件的API
  useImperativeHandle(ref, () => ({
    startCooling,
    endCooling,
    isCoolingDown: coolingDown,
    remainingTime
  }));

  return (
    <div className="cooling-timer">
      {coolingDown && (
        <div className="cooling-info">
          冷却中: {formatRemainingTime()}
        </div>
      )}
    </div>
  );
});

export default CoolingTimer;