'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PermissionModal, { SystemRole, Permission, PermissionTreeNode } from '../roleManagement/components/PermissionModal';

// 角色卡片组件属性
interface RoleCardProps {
  role: SystemRole;
  onEditPermissions: (role: SystemRole) => void;
}

// 角色卡片组件
const RoleCard: React.FC<RoleCardProps> = ({ role, onEditPermissions }) => {
  // 格式化创建时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className={`p-5 border border-gray-200 hover:border-blue-400 transition-all shadow-md hover:shadow-lg ${role.isDefault ? 'bg-blue-50' : 'bg-white'}`}
    >
      <div className="mb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-800 mr-2">{role.name}</h3>
            {role.isDefault && (
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">默认角色</span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{role.description}</p>
      </div>
      
      <div className="mt-3 text-sm text-gray-500">
        <p>创建时间: {formatDate(role.createdAt)}</p>
        <p className="mt-1">权限数量: {role.permissions.length} 项</p>
      </div>
      
      {/* 权限预览 */}
      {role.permissions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-1">主要权限:</p>
          <div className="flex flex-wrap gap-1">
            {role.permissions.slice(0, 3).map((perm) => (
              <span key={perm.id} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                {perm.name}
              </span>
            ))}
            {role.permissions.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                +{role.permissions.length - 3}项
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* 操作按钮 */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <button 
          className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          onClick={() => onEditPermissions(role)}
        >
          修改权限
        </button>
      </div>
    </Card>
  );
};

// 主页面组件
export default function SystemRolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟权限树数据
  const permissionTree: PermissionTreeNode[] = [
    {
      id: 'user_manage',
      name: '用户管理',
      level: 1,
      children: [
        { id: 'user_view', name: '查看用户', level: 2 },
        { id: 'user_add', name: '添加用户', level: 2 },
        { id: 'user_edit', name: '编辑用户', level: 2 },
        { id: 'user_delete', name: '删除用户', level: 2 }
      ]
    },
    {
      id: 'role_manage',
      name: '角色管理',
      level: 1,
      children: [
        { id: 'role_view', name: '查看角色', level: 2 },
        { id: 'role_add', name: '添加角色', level: 2 },
        { id: 'role_edit', name: '编辑角色', level: 2 },
        { id: 'role_delete', name: '删除角色', level: 2 },
        { id: 'permission_manage', name: '权限管理', level: 2 }
      ]
    },
    {
      id: 'system_setting',
      name: '系统设置',
      level: 1,
      children: [
        { id: 'basic_setting', name: '基本设置', level: 2 },
        { id: 'security_setting', name: '安全设置', level: 2 }
      ]
    },
    {
      id: 'data_analysis',
      name: '数据分析',
      level: 1,
      children: [
        { id: 'user_analysis', name: '用户数据分析', level: 2 },
        { id: 'operation_analysis', name: '运营数据分析', level: 2 }
      ]
    },
    {
      id: 'financial_manage',
      name: '财务管理',
      level: 1,
      children: [
        { id: 'order_view', name: '订单查看', level: 2 },
        { id: 'payment_manage', name: '支付管理', level: 2 },
        { id: 'refund_manage', name: '退款管理', level: 2 }
      ]
    }
  ];

  // 模拟加载角色数据
  React.useEffect(() => {
    // 模拟API请求延迟
    const timer = setTimeout(() => {
      const mockRoles: SystemRole[] = [
        {
          id: '1',
          name: '超级管理员',
          description: '拥有系统所有权限的管理员角色',
          permissions: [
            { id: 'user_manage', name: '用户管理', level: 1 },
            { id: 'role_manage', name: '角色管理', level: 1 },
            { id: 'system_setting', name: '系统设置', level: 1 },
            { id: 'data_analysis', name: '数据分析', level: 1 },
            { id: 'financial_manage', name: '财务管理', level: 1 },
            { id: 'user_view', name: '查看用户', level: 2 },
            { id: 'user_add', name: '添加用户', level: 2 },
            { id: 'user_edit', name: '编辑用户', level: 2 },
            { id: 'user_delete', name: '删除用户', level: 2 },
            { id: 'role_view', name: '查看角色', level: 2 },
            { id: 'role_add', name: '添加角色', level: 2 },
            { id: 'role_edit', name: '编辑角色', level: 2 },
            { id: 'role_delete', name: '删除角色', level: 2 },
            { id: 'permission_manage', name: '权限管理', level: 2 },
            { id: 'basic_setting', name: '基本设置', level: 2 },
            { id: 'security_setting', name: '安全设置', level: 2 },
            { id: 'user_analysis', name: '用户数据分析', level: 2 },
            { id: 'operation_analysis', name: '运营数据分析', level: 2 },
            { id: 'order_view', name: '订单查看', level: 2 },
            { id: 'payment_manage', name: '支付管理', level: 2 },
            { id: 'refund_manage', name: '退款管理', level: 2 }
          ],
          createdAt: '2024-01-01T00:00:00Z',
          isDefault: true
        },
        {
          id: '2',
          name: '运营专员',
          description: '负责日常运营工作的角色',
          permissions: [
            { id: 'user_manage', name: '用户管理', level: 1 },
            { id: 'data_analysis', name: '数据分析', level: 1 },
            { id: 'user_view', name: '查看用户', level: 2 },
            { id: 'user_add', name: '添加用户', level: 2 },
            { id: 'user_edit', name: '编辑用户', level: 2 },
            { id: 'user_analysis', name: '用户数据分析', level: 2 },
            { id: 'operation_analysis', name: '运营数据分析', level: 2 }
          ],
          createdAt: '2024-01-05T00:00:00Z'
        },
        {
          id: '3',
          name: '财务专员',
          description: '负责财务管理的角色',
          permissions: [
            { id: 'financial_manage', name: '财务管理', level: 1 },
            { id: 'data_analysis', name: '数据分析', level: 1 },
            { id: 'order_view', name: '订单查看', level: 2 },
            { id: 'payment_manage', name: '支付管理', level: 2 },
            { id: 'refund_manage', name: '退款管理', level: 2 },
            { id: 'operation_analysis', name: '运营数据分析', level: 2 }
          ],
          createdAt: '2024-01-10T00:00:00Z'
        },
        {
          id: '4',
          name: '审计员',
          description: '负责系统审计的角色',
          permissions: [
            { id: 'data_analysis', name: '数据分析', level: 1 },
            { id: 'user_analysis', name: '用户数据分析', level: 2 },
            { id: 'operation_analysis', name: '运营数据分析', level: 2 }
          ],
          createdAt: '2024-01-15T00:00:00Z'
        }
      ];
      setRoles(mockRoles);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 处理修改权限
  const handleEditPermissions = (role: SystemRole) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  // 保存权限设置
  const handleSavePermissions = (roleId: string, permissionIds: string[]) => {
    // 模拟API保存操作
    const updatedRoles = roles.map(role => {
      if (role.id === roleId) {
        // 从权限树中获取详细信息
        const getPermissionDetails = (ids: string[], tree: PermissionTreeNode[]): Permission[] => {
          const permissions: Permission[] = [];
          
          const findPermissions = (nodes: PermissionTreeNode[]) => {
            nodes.forEach(node => {
              if (ids.includes(node.id)) {
                permissions.push({ id: node.id, name: node.name, level: node.level });
              }
              if (node.children) {
                findPermissions(node.children);
              }
            });
          };
          
          findPermissions(tree);
          return permissions;
        };
        
        return {
          ...role,
          permissions: getPermissionDetails(permissionIds, permissionTree)
        };
      }
      return role;
    });
    
    setRoles(updatedRoles);
    setIsModalOpen(false);
    setSelectedRole(null);
    
    // 显示成功提示
    alert('权限修改成功！');
  };

  // 导航到创建角色页面
  const navigateToCreateRole = () => {
    router.push('/admin/systemrole/createrole');
  };

  return (
    <div className="space-y-6 pb-32 px-4 pt-4">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">系统角色管理</h1>
        <p className="text-sm text-gray-600">管理系统中的角色和权限设置</p>
      </div>

      {/* 统计信息 */}
      <div className="space-y-1 border border-blue-200 py-2 rounded-md bg-blue-50 text-center"> 
            <div className="text-lg">总角色数</div>
            <div className="text-lg font-bold text-blue-600">{roles.length}</div>
      </div>

      {/* 创建角色按钮 */}
      <div className="mb-6 flex justify-center">
        <button 
          onClick={navigateToCreateRole}
          className="bg-blue-600 text-white px-6 py-3 items-center rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2 text-2xl">+</span>
          创建角色
        </button>
      </div>

      {/* 角色列表 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无角色数据</p>
          <button 
            onClick={navigateToCreateRole}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            创建第一个角色
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <RoleCard 
              key={role.id} 
              role={role} 
              onEditPermissions={handleEditPermissions}
            />
          ))}
        </div>
      )}

      {/* 权限设置模态框 */}
      <PermissionModal 
        isOpen={isModalOpen}
        role={selectedRole}
        permissionTree={permissionTree}
        onClose={handleCloseModal}
        onSave={handleSavePermissions}
      />
    </div>
  );
}