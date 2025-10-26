'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

// 租用按钮组件
export const RentButton = ({ accountId }: { accountId: string }) => {
  const router = useRouter();
  
  const handleRentNow = () => {
    router.push(`/accountrental/account-rental-market?rentId=${accountId}&showPayment=true`);
  };
  
  return (
    <Button 
      onClick={handleRentNow}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
    >
      立即租用
    </Button>
  );
};

// ClientOnly组件用于包裹客户端组件
export const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};