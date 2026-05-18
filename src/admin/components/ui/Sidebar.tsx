import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlaneTakeoff,
  LayoutDashboard,
  Map,
  ClipboardList,
  Users,
  Megaphone,
  Ticket,
  Leaf,
  CalendarDays,
  CircleDollarSign,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

export interface SidebarProps {
  activeMenu?: string;
  defaultExpandedMenus?: string[];
}

type MenuChild = {
  title: string;
  path: string;
  key: string;
};

type MenuItem = {
  title: string;
  key: string;
  icon: React.ElementType;
  path?: string;
  children?: MenuChild[];
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Tổng quan',
    key: 'dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'Quản lý Sản phẩm Tour',
    key: 'products',
    icon: Map,
    children: [
      { title: 'Tour Mẫu', path: '/tour-template', key: 'tour-template' },
      { title: 'Tour Thực Tế', path: '/tour-instance', key: 'tour-instance' },
      { title: 'Dịch vụ Bổ sung', path: '/services', key: 'services' },
      { title: 'Hành động Xanh', path: '/green-actions', key: 'green-actions' },
    ],
  },
  {
    title: 'Quản lý Đơn hàng',
    key: 'orders',
    icon: ClipboardList,
    path: '/orders',
  },
  {
    title: 'Quản lý Khách hàng',
    key: 'customers',
    icon: Users,
    path: '/customers',
  },
  {
    title: 'Quản lý Khiếu nại',
    key: 'complaints',
    icon: Megaphone,
    path: '/complaints',
  },
  {
    title: 'Quản lý Khuyến mãi',
    key: 'promotions',
    icon: Ticket,
    path: '/promotions',
  },
  {
    title: 'Điều phối Hướng dẫn viên',
    key: 'dispatch',
    icon: Leaf,
    children: [
      { title: 'Phân công HDV', path: '/dispatch/assign', key: 'dispatch' },
      { title: 'Danh Sách HDV', path: '/dispatch/list', key: 'dispatch' },
    ],
  },
  {
    title: 'Lịch công tác của tôi',
    key: 'guide-schedule',
    icon: CalendarDays,
    path: '/guide/schedule',
  },
  {
    title: 'Tài chính & Kế toán',
    key: 'finance',
    icon: CircleDollarSign,
    children: [
      { title: 'Quản lý Chi phí', path: '/finance/cost-management', key: 'finance' },
      { title: 'Quyết toán Tour', path: '/finance/settlement', key: 'finance' },
      { title: 'Xử lý Hoàn tiền', path: '/finance/refund', key: 'finance' },
    ],
  },
  {
    title: 'Hệ thống',
    key: 'system',
    icon: Settings,
    children: [
      { title: 'Quản lý tài khoản', path: '/system/accounts', key: 'accounts' },
      { title: 'Quản lý nhân sự', path: '/system/hr', key: 'hr' },
      { title: 'Nhật ký hệ thống', path: '/system/logs', key: 'logs' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu = 'Tổng quan',
  defaultExpandedMenus = [],
}) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(defaultExpandedMenus);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((m) => m !== title) : [...prev, title]
    );
  };

  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen bg-white border-r border-[#E1F1FF] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-col z-50">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-6 gap-3 border-b border-[#E1F1FF]">
        <div className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-[#F4F9FF]">
          <PlaneTakeoff color="#89D4FF" size={24} />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-[#00668A] leading-tight">TourAdmin</h1>
          <p className="text-[12px] text-gray-500 font-medium leading-tight">Hệ thống quản lý</p>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-hide">
        {MENU_ITEMS.map((item) => {
          const hasChildren = !!item.children;
          const isVisible = hasChildren
            ? item.children!.some(child => hasAccess(user?.maVaiTro, child.key))
            : hasAccess(user?.maVaiTro, item.key);

          if (!isVisible) return null;

          const isExpanded = expandedMenus.includes(item.title);
          const isActive = activeMenu === item.title;
          const Icon = item.icon;

          return (
            <div key={item.title}>
              {/* Parent Item */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleMenu(item.title)}
                  aria-expanded={isExpanded}
                  className={`w-full min-h-[44px] flex items-center justify-between px-4 py-3 rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:ring-offset-1 ${
                    isActive
                      ? 'bg-[#E8F6FF] border-l-[4px] border-l-[#89D4FF] text-[#89D4FF] font-bold'
                      : 'text-gray-600 hover:bg-[#F9F9FF] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-[#89D4FF]' : 'text-gray-500'} />
                    <span className="text-[14px]">{item.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </button>
              ) : (
                <Link
                  to={item.path as string}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[44px] flex items-center gap-3 px-4 py-3 rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:ring-offset-1 ${
                    isActive
                      ? 'bg-[#E8F6FF] border-l-[4px] border-l-[#89D4FF] text-[#89D4FF] font-bold'
                      : 'text-gray-600 hover:bg-[#F9F9FF] font-medium'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-[#89D4FF]' : 'text-gray-500'} />
                  <span className="text-[14px]">{item.title}</span>
                </Link>
              )}

              {/* Submenu Items */}
              {hasChildren && isExpanded && (
                <div className="mt-1 space-y-1">
                  {item.children!.map((child) => {
                    if (!hasAccess(user?.maVaiTro, child.key)) return null;
                    const isChildActive = activeMenu === child.title;
                    return (
                      <Link
                        key={child.title}
                        to={child.path}
                        aria-current={isChildActive ? 'page' : undefined}
                        className={`min-h-[44px] flex items-center pl-[44px] pr-4 py-2.5 rounded-[8px] transition-colors text-[14px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:ring-offset-1 ${
                          isChildActive
                            ? 'text-[#89D4FF] font-semibold bg-[#FAFAFA]'
                            : 'text-gray-500 hover:bg-[#F9F9FF] hover:text-gray-700 font-medium'
                        }`}
                      >
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#E1F1FF]">
        <button
          type="button"
          onClick={() => { logout(); navigate('/login'); }}
          className="min-h-[44px] flex items-center gap-3 w-full px-4 py-3 rounded-[8px] text-[#BA1A1A] font-medium transition-colors hover:bg-[#FFF4F4] focus:outline-none focus:ring-2 focus:ring-[#BA1A1A] focus:ring-offset-1"
        >
          <LogOut size={20} />
          <span className="text-[14px]">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
