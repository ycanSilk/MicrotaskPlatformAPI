import { redirect } from 'next/navigation';

/**
 * Admin 导航页面
 * 当访问 /admin 时，自动重定向到 /admin/dashboard
 * 避免 404 页面问题
 */
const AdminPage = () => {
  // 自动重定向到管理员系统的仪表盘页面
  redirect('/admin/dashboard');
};

export default AdminPage;