export const MENU_PERMISSIONS: Record<string, string[]> = {
  'ADMIN': ['dashboard', 'tour-template', 'tour-instance', 'services', 'green-actions', 'orders', 'customers', 'complaints', 'promotions', 'dispatch', 'finance', 'accounts', 'hr', 'logs'],
  'PRODUCT': ['dashboard', 'tour-template', 'tour-instance', 'services', 'green-actions'],
  'SALES': ['dashboard', 'orders', 'customers', 'promotions'],
  'OPERATOR': ['dashboard', 'dispatch', 'complaints'],
  'ACCOUNTANT': ['dashboard', 'finance'],
  'CUSTOMER': ['dashboard'],
};

export const hasAccess = (role: string | undefined, menuKey: string): boolean => {
  if (!role) return false;
  return MENU_PERMISSIONS[role]?.includes(menuKey) ?? false;
};
