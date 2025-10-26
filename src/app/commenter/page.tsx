import { redirect } from 'next/navigation';

/**
 * Commenter 导航页面
 * 当访问 /commenter 时，自动重定向到 /commenter/dashboard
 * 避免 404 页面问题
 */
const CommenterPage = () => {
  // 自动重定向到抢单系统的仪表盘页面
  redirect('/commenter/hall');
};

export default CommenterPage;