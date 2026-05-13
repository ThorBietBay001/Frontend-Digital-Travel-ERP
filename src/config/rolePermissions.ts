export const MENU_KEYS = [
  'dashboard', 'tour-template', 'tour-instance', 'services', 'green-actions',
  'orders', 'customers', 'complaints', 'promotions',
  'dispatch', 'finance', 'guide-schedule', 'accounts', 'hr', 'logs'
] as const;

export type MenuKey = typeof MENU_KEYS[number];

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  SANPHAM: 'Nhân viên sản phẩm',
  KINHDOANH: 'Nhân viên kinh doanh',
  DIEUHANH: 'Nhân viên điều hành',
  KETOAN: 'Nhân viên kế toán',
  HDV: 'Hướng dẫn viên',
  KHACHHANG: 'Khách hàng',
};

export const ROLE_MENU_ACCESS: Record<string, MenuKey[]> = {
  ADMIN: ['dashboard', 'accounts', 'hr', 'logs'],
  SANPHAM: ['dashboard', 'tour-template', 'services', 'green-actions'],
  KINHDOANH: ['dashboard', 'orders', 'customers', 'complaints', 'promotions'],
  DIEUHANH: ['dashboard', 'tour-instance', 'dispatch'],
  KETOAN: ['dashboard', 'finance'],
  HDV: ['dashboard', 'guide-schedule'],
  KHACHHANG: ['dashboard'],
};

export const normalizeRole = (role: string | undefined): string => role?.replace(/^ROLE_/, '') ?? '';

export const hasAccess = (role: string | undefined, menuKey: string): boolean => {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) return false;
  return ROLE_MENU_ACCESS[normalizedRole]?.includes(menuKey as MenuKey) ?? false;
};

export const getRoleLabel = (role: string | undefined): string => {
  const normalizedRole = normalizeRole(role);
  return ROLE_LABELS[normalizedRole] ?? normalizedRole;
};
