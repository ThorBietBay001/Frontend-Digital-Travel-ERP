export const MENU_KEYS = [
  'dashboard', 'tour-template', 'tour-instance', 'services', 'green-actions',
  'orders', 'customers', 'complaints', 'promotions',
  'dispatch', 'finance', 'accounts', 'hr', 'logs'
] as const;

export type MenuKey = typeof MENU_KEYS[number];

export const ROLE_MENU_ACCESS: Record<string, string[]> = {
  ADMIN: [...MENU_KEYS],
  SANPHAM: ['dashboard', 'tour-template', 'tour-instance', 'services', 'green-actions'],
  KINHDOANH: ['dashboard', 'orders', 'customers', 'complaints', 'promotions'],
  SALES: ['dashboard', 'orders', 'customers', 'complaints', 'promotions'],
  DIEUHANH: ['dashboard', 'tour-instance', 'dispatch', 'hr'],
  MANAGER: ['dashboard', 'tour-instance', 'dispatch', 'hr'],
  KETOAN: ['dashboard', 'finance'],
};

export const hasAccess = (role: string | undefined, menuKey: string): boolean => {
  if (!role) {
    return false;
  }

  // Standardize role by removing potential prefixes like "ROLE_"
  const standardizedRole = role.trim().toUpperCase().replace(/^ROLE_/, '');

  // ADMIN has access to everything
  if (standardizedRole === 'ADMIN') {
    return true;
  }

  const permissions = ROLE_MENU_ACCESS[standardizedRole];
  if (!permissions) {
    return false;
  }

  // Check for wildcard access
  if (permissions.includes('*')) {
    return true;
  }

  // Check for specific menu key access
  return permissions.includes(menuKey);
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    SANPHAM: 'Nhân viên sản phẩm',
    KINHDOANH: 'Nhân viên kinh doanh',
    DIEUHANH: 'Nhân viên điều hành',
    KETOAN: 'Nhân viên kế toán',
    HDV: 'Hướng dẫn viên',
    KHACHHANG: 'Khách hàng',
  };
  return labels[role] || role;
};
