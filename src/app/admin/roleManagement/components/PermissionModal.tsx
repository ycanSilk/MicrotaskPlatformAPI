'use client';

import React, { useState, useEffect } from 'react';

// 系统角色类型定义
export interface SystemRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  isDefault?: boolean;
}

// 权限类型定义
export interface Permission {
  id: string;
  name: string;
  parentId?: string;
  level: number;
}

// 权限树节点类型
export type PermissionTreeNode = Permission & {
  children?: PermissionTreeNode[];
  checked?: boolean;
};

// 权限设置模态框组件属性
interface PermissionModalProps {
  isOpen: boolean;
  role: SystemRole | null;
  permissionTree: PermissionTreeNode[];
  onClose: () => void;
  onSave: (roleId: string, permissions: string[]) => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ 
  isOpen, 
  role, 
  permissionTree, 
  onClose, 
  onSave 
}) => {
  const [permissions, setPermissions] = useState<PermissionTreeNode[]>([]);
  const [isAllChecked, setIsAllChecked] = useState(false);

  // 初始化权限树
  useEffect(() => {
    if (isOpen && role) {
      // 深拷贝权限树
      const treeCopy = JSON.parse(JSON.stringify(permissionTree));
      
      // 设置初始选中状态
      const setCheckedState = (nodes: PermissionTreeNode[], selectedIds: Set<string>) => {
        nodes.forEach(node => {
          node.checked = selectedIds.has(node.id);
          if (node.children && node.children.length > 0) {
            setCheckedState(node.children, selectedIds);
          }
        });
      };
      
      const selectedIds = new Set(role.permissions.map(p => p.id));
      setCheckedState(treeCopy, selectedIds);
      setPermissions(treeCopy);
      
      // 检查是否全部选中
      const totalPermissions = permissionTree.flatMap(n => {
        const getAllIds = (node: PermissionTreeNode): string[] => {
          const ids: string[] = [node.id];
          if (node.children) {
            node.children.forEach(child => {
              ids.push(...getAllIds(child));
            });
          }
          return ids;
        };
        return getAllIds(n);
      }).length;
      
      setIsAllChecked(selectedIds.size === totalPermissions);
    }
  }, [isOpen, role, permissionTree]);

  // 处理复选框变化
  const handleCheckboxChange = (nodeId: string, checked: boolean) => {
    const updatePermissionTree = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          // 更新当前节点及其子节点
          const updatedNode = { ...node, checked };
          if (updatedNode.children && updatedNode.children.length > 0) {
            updatedNode.children = updateChildrenCheck(updatedNode.children, checked);
          }
          return updatedNode;
        } else if (node.children && node.children.length > 0) {
          // 递归更新子节点
          const updatedNode = { ...node };
          updatedNode.children = updatePermissionTree(node.children);
          
          // 更新父节点状态
          const allChecked = updatedNode.children.every(child => child.checked);
          const someChecked = updatedNode.children.some(child => child.checked);
          updatedNode.checked = allChecked;
          
          return updatedNode;
        }
        return node;
      });
    };

    const updateChildrenCheck = (children: PermissionTreeNode[], checked: boolean): PermissionTreeNode[] => {
      return children.map(child => {
        const updatedChild = { ...child, checked };
        if (updatedChild.children && updatedChild.children.length > 0) {
          updatedChild.children = updateChildrenCheck(updatedChild.children, checked);
        }
        return updatedChild;
      });
    };

    const newPermissions = updatePermissionTree(permissions);
    setPermissions(newPermissions);
    
    // 重新计算全选状态
    const getAllCheckedIds = (nodes: PermissionTreeNode[]): Set<string> => {
      const ids = new Set<string>();
      nodes.forEach(node => {
        if (node.checked) ids.add(node.id);
        if (node.children) {
          const childIds = getAllCheckedIds(node.children);
          childIds.forEach(id => ids.add(id));
        }
      });
      return ids;
    };
    
    const totalPermissions = permissionTree.flatMap(n => {
      const getAllIds = (node: PermissionTreeNode): string[] => {
        const ids: string[] = [node.id];
        if (node.children) {
          node.children.forEach(child => {
            ids.push(...getAllIds(child));
          });
        }
        return ids;
      };
      return getAllIds(n);
    }).length;
    
    setIsAllChecked(getAllCheckedIds(newPermissions).size === totalPermissions);
  };

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    const updateAllCheck = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(node => {
        const updatedNode = { ...node, checked };
        if (updatedNode.children && updatedNode.children.length > 0) {
          updatedNode.children = updateAllCheck(updatedNode.children);
        }
        return updatedNode;
      });
    };

    const newPermissions = updateAllCheck(permissions);
    setPermissions(newPermissions);
    setIsAllChecked(checked);
  };

  // 保存权限设置
  const handleSave = () => {
    if (!role) return;
    
    const getSelectedPermissionIds = (nodes: PermissionTreeNode[]): string[] => {
      let ids: string[] = [];
      nodes.forEach(node => {
        if (node.checked) ids.push(node.id);
        if (node.children) {
          ids = [...ids, ...getSelectedPermissionIds(node.children)];
        }
      });
      return ids;
    };
    
    const selectedIds = getSelectedPermissionIds(permissions);
    onSave(role.id, selectedIds);
  };

  // 渲染权限树
  const renderPermissionTree = (nodes: PermissionTreeNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="mb-2">
        <div 
          className={`flex items-center ${level > 0 ? `ml-${level * 4}` : ''}`}
        >
          <input
            type="checkbox"
            checked={node.checked || false}
            onChange={(e) => handleCheckboxChange(node.id, e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm cursor-pointer">{node.name}</label>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="mt-1">
            {renderPermissionTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">修改角色权限</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">角色: {role.name}</h3>
            <p className="text-sm text-gray-600">{role.description}</p>
          </div>
          
          {/* 全选/取消全选 */}
          <div className="mb-4 border-b pb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="font-medium cursor-pointer">全选/取消全选</label>
            </div>
          </div>
          
          {/* 权限树 */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">权限列表:</h4>
            <div className="space-y-4">
              {renderPermissionTree(permissions)}
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;