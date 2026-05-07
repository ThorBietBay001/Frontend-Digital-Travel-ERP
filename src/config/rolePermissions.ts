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
  DIEUHANH: ['dashboard', 'tour-instance', 'dispatch', 'hr'],
  KETOAN: ['dashboard', 'finance'],
};

export const hasAccess = (role: string | undefined, menuKey: string): boolean => {
  if (!role) return false;
  const normalizedRole = role.replace(/^ROLE_/, '');
  return ROLE_MENU_ACCESS[normalizedRole]?.includes(menuKey) ?? false;
};
