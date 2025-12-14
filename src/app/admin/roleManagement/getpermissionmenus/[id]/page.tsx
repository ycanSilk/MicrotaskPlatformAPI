'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface MenuItem {
  id: string;
  menuName: string;
  menuCode: string;
  parentId: string;
  menuType: string;
  menuUrl: string;
  icon: string;
  sortOrder: number;
  status: string;
  createTime: string;
  children?: MenuItem[];
}

interface PermissionDetailResponse {
  code: number;
  message: string;
  data: {
    id: string;
    roleName: string;
    roleCode: string;
    description: string;
    status: string;
    createTime: string;
    userCount: number;
    menus: MenuItem[];
  };
  success: boolean;
  timestamp: number;
}

interface PermissionTreeNode extends Omit<MenuItem, 'children'> {
  children?: PermissionTreeNode[];
  expanded?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
}

const PermissionDetailsPage: React.FC = () => {
  const params = useParams() as { id: string };
  const id = params.id;
  const router = useRouter();
  const [permissionDetails, setPermissionDetails] = useState<PermissionDetailResponse['data'] | null>(null);
  const [permissionTree, setPermissionTree] = useState<PermissionTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch permission details from API
  const fetchPermissionDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/role/systemrole/getpermissionmenus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: id })
      });

      const data: PermissionDetailResponse = await response.json();

      if (data.success) {
        const roleData = data.data;
        setPermissionDetails(roleData);

        // Transform menus to tree structure and set initial state
        // For now, we'll assume selected permissions are stored elsewhere or need to be managed
        const tree = transformMenusToPermissionTree(roleData.menus, []);
        setPermissionTree(tree);
      } else {
        setError(data.message || '获取权限详情失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请稍后重试');
      console.error('获取权限详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform flat menus to tree structure with checked state
  const transformMenusToPermissionTree = (menus: MenuItem[], selectedPermissionIds: string[]): PermissionTreeNode[] => {
    const menuMap: Map<string, PermissionTreeNode> = new Map();

    // Create map of all menus
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, expanded: true });
    });

    // Build tree structure
    const tree: PermissionTreeNode[] = [];
    menuMap.forEach(menu => {
      if (!menu.parentId || !menuMap.has(menu.parentId)) {
        tree.push(menu);
      } else {
        const parent = menuMap.get(menu.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(menu);
      }
    });

    // Set checked state for selected permissions
    const setCheckedState = (node: PermissionTreeNode) => {
      // Check if current node is selected
      node.checked = selectedPermissionIds.includes(node.id);

      // Recursively check children
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => setCheckedState(child));

        // Update parent indeterminate state
        const allChildrenChecked = node.children.every(child => child.checked);
        const someChildrenChecked = node.children.some(child => child.checked);
        node.indeterminate = !allChildrenChecked && someChildrenChecked;
        node.checked = allChildrenChecked;
      }
    };

    tree.forEach(node => setCheckedState(node));

    return tree;
  };

  // Handle expand/collapse node
  const handleToggleExpand = (nodeId: string) => {
    const toggleNode = (node: PermissionTreeNode): PermissionTreeNode => {
      if (node.id === nodeId) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: node.children.map(toggleNode) };
      }
      return node;
    };

    setPermissionTree(prev => prev.map(toggleNode));
  };

  // Handle checkbox change - 修复父子菜单勾选逻辑
  const handleCheckboxChange = (nodeId: string, checked: boolean) => {
    // Check if parent node is checked when checking a child node
    const isParentChecked = (): boolean => {
      const findParent = (nodes: PermissionTreeNode[], targetId: string): boolean => {
        for (const node of nodes) {
          if (node.id === targetId) {
            return true; // Root node has no parent, so it's allowed
          }
          if (node.children?.length) {
            const childNode = node.children.find(child => child.id === targetId);
            if (childNode) {
              return node.checked || false; // Check if parent is checked
            }
            const result = findParent(node.children, targetId);
            if (result !== undefined) {
              return result;
            }
          }
        }
        return true; // Default to true if node not found
      };
      return findParent(permissionTree, nodeId);
    };

    // Prevent checking child node if parent is not checked
    if (checked && !isParentChecked()) {
      return;
    }

    const updateNode = (node: PermissionTreeNode): PermissionTreeNode => {
      if (node.id === nodeId) {
        // Update current node and all its children
        const updatedNode = { ...node, checked, indeterminate: false };
        if (updatedNode.children?.length) {
          updatedNode.children = updatedNode.children.map(child => updateChildNodes(child, checked));
        }
        return updatedNode;
      }

      // Update children recursively
      if (node.children?.length) {
        const updatedChildren = node.children.map(updateNode);
        // Update parent state based on children
        const allChecked = updatedChildren.every(child => child.checked);
        const someChecked = updatedChildren.some(child => child.checked);
        return {
          ...node,
          children: updatedChildren,
          checked: allChecked,
          indeterminate: !allChecked && someChecked
        };
      }

      return node;
    };

    // Recursively update all children of a node
    const updateChildNodes = (node: PermissionTreeNode, checked: boolean): PermissionTreeNode => {
      const updatedNode = { ...node, checked, indeterminate: false };
      if (updatedNode.children?.length) {
        updatedNode.children = updatedNode.children.map(child => updateChildNodes(child, checked));
      }
      return updatedNode;
    };

    setPermissionTree(prev => prev.map(updateNode));
  };

  // Get all selected permission IDs
  const getSelectedPermissionIds = (): string[] => {
    const selectedIds: string[] = [];

    const traverseTree = (node: PermissionTreeNode) => {
      if (node.checked) {
        selectedIds.push(node.id);
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach(traverseTree);
      }
    };

    permissionTree.forEach(traverseTree);

    return selectedIds;
  };

  // Handle select all/deselect all permissions
  const handleSelectAll = (checked: boolean) => {
    const updateAllNodes = (node: PermissionTreeNode): PermissionTreeNode => {
      const updatedNode = { ...node, checked, indeterminate: false };
      if (node.children?.length) {
        updatedNode.children = node.children.map(updateAllNodes);
      }
      return updatedNode;
    };

    setPermissionTree(prev => prev.map(updateAllNodes));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !permissionDetails) return;

    try {
      setLoading(true);
      const selectedPermissionIds = getSelectedPermissionIds();
      
      const response = await fetch('/api/role/systemrole/changepermission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: id,
          permissionIds: selectedPermissionIds,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear browser cache after successful permission update
        window.location.reload(); // Reload page
        router.push('/admin/roleManagement');
      } else {
        setError(data.message || '更新权限失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请稍后重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render permission tree recursively
  const renderPermissionTree = (nodes: PermissionTreeNode[], level: number = 0): JSX.Element[] => {
    return nodes.map(node => {
      const hasChildren = node.children && node.children.length > 0;
      const indentStyle = { paddingLeft: `${level * 24}px` };

      return (
        <div key={node.id} className="permission-node">
          <div
            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => hasChildren && handleToggleExpand(node.id)}
          >
            {/* Expand/Collapse icon */}
            {hasChildren && (
              <span className="text-gray-400">
                {node.expanded ? '▼' : '▶'}
              </span>
            )}
            {/* Checkbox */}
            <input
                type="checkbox"
                checked={node.checked || false}
                onChange={(e) => handleCheckboxChange(node.id, e.target.checked)}
                className="cursor-pointer"
                onClick={(e) => e.stopPropagation()} // Prevent expanding/collapsing when clicking checkbox
                ref={(input) => {
                  if (input) {
                    input.indeterminate = node.indeterminate || false;
                  }
                }}
              />
            {/* Menu Name */}
            <span className="text-sm font-medium" style={indentStyle}>
              {node.menuName}
            </span>
            {/* Permission Code (optional) */}
            {node.menuCode && (
              <span className="text-xs text-gray-500 ml-2">
                {node.menuCode}
              </span>
            )}
          </div>

          {/* Render children if expanded */}
          {hasChildren && node.expanded && (
            <div className="ml-4">
              {renderPermissionTree(node.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  useEffect(() => {
    fetchPermissionDetails();
  }, [id]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!permissionDetails) {
    return <div className="p-4">Permission details not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">权限详情</h1>
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => router.back()}
          >
            返回列表
          </button>
        </div>
        
        {/* 加载状态 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 flex justify-center items-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">正在加载权限详情...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-red-200 text-red-800 p-4 rounded-md">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden border-0 shadow-lg bg-white rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="pb-2 px-6 pt-6">
                <h2 className="text-xl font-bold">权限设置</h2>
                <p className="text-gray-600">请为角色配置权限</p>
              </div>
               
              <div className="space-y-6 px-6">
                {/* 角色名称 */}
                <div className="space-y-2">
                  <label htmlFor="roleName" className="text-base block">角色名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="roleName"
                    value={permissionDetails.roleName}
                    readOnly // 角色名称不应修改
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
                 
                {/* 角色描述 */}
                <div className="space-y-2">
                  <label htmlFor="roleDescription" className="block">角色描述</label>
                  <textarea
                    id="roleDescription"
                    value={permissionDetails.description}
                    readOnly // 角色描述不应修改
                    className="w-full min-h-[100px] resize-y px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
                 
                <div className="border-t border-gray-200 my-4"></div>
                 
                {/* 权限设置 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">菜单权限</h3>
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                   
                  {/* 批量操作 */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => handleSelectAll(true)}
                      className="bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md text-sm text-green-800"
                    >
                      全选
                    </button>
                    <button
                      onClick={() => handleSelectAll(false)}
                      className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-sm text-red-800"
                    >
                      取消全选
                    </button>
                  </div>
                  
                  {/* 批量操作 */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => handleSelectAll(true)}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm"
                    >
                      全选
                    </button>
                    <button
                      onClick={() => handleSelectAll(false)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                    >
                      取消全选
                    </button>
                  </div>
                  
                  {/* 权限树 */}
                  <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto border border-gray-200">
                    {renderPermissionTree(permissionTree)}
                  </div>
                </div>
              </div>
               
              <div className="px-6 pb-6 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <>加载中...</>
                  ) : '保存权限'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionDetailsPage;