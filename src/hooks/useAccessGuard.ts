import { useAuth } from '../context/AuthContext';
import { hasAccess } from '../config/rolePermissions';

/**
 * Hook kiểm tra quyền truy cập dựa trên menu key.
 * Trả về { canAccess: boolean, user } để dùng trong useEffect guard.
 *
 * Usage:
 *   const { canAccess } = useAccessGuard('tour-template');
 *   useEffect(() => { if (!canAccess) return; fetchData(); }, [canAccess]);
 */
export const useAccessGuard = (menuKey: string) => {
  const { user, isAuthenticated } = useAuth();
  const canAccess = isAuthenticated && hasAccess(user?.maVaiTro, menuKey);
  return { canAccess, user, isAuthenticated };
};
