import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Bell, Earth } from 'lucide-react';

export interface TopBarProps {
  breadcrumb: { label: string; href?: string }[];
  notificationCount?: number;
  userName?: string;
  userRole?: string;
}

const TopBar: React.FC<TopBarProps> = ({
  breadcrumb,
  notificationCount = 0,
  userName = 'Người dùng',
  userRole = 'Vai trò',
}) => {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=E8F6FF&color=00668A`;

  return (
    <header className="h-[64px] bg-white/90 backdrop-blur-md border-b border-[#E1F1FF] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Breadcrumb - Trái */}
      <nav className="flex items-center gap-1.5 text-[14px] font-medium">
        {breadcrumb.map((item, index) => {
          const isLast = index === breadcrumb.length - 1;

          return (
            <div key={index} className="flex items-center gap-1.5">
              {isLast ? (
                <span className="text-[#00668A] font-bold">{item.label}</span>
              ) : item.href ? (
                <Link to={item.href} className="text-gray-500 hover:text-[#00668A] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-500">{item.label}</span>
              )}

              {/* Ngăn cách giữa các item */}
              {!isLast && <ChevronRight size={16} className="text-gray-400" />}
            </div>
          );
        })}
      </nav>

      {/* Hành động & Info người dùng - Phải */}
      <div className="flex items-center gap-6">
        
        {/* Nút Đổi Ngôn ngữ (Chỉ template icon) */}
        <button className="text-gray-500 hover:text-[#00668A] transition-colors">
          <Earth size={20} />
        </button>

        {/* Thông báo */}
        <button className="relative text-gray-500 hover:text-[#00668A] transition-colors">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#BA1A1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Divider dọc */}
        <div className="h-8 w-px bg-[#E1F1FF]"></div>

        {/* Avatar & User Info */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img 
            src={avatarUrl} 
            alt={userName} 
            className="w-10 h-10 rounded-full border border-[#E1F1FF] object-cover" 
          />
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#00668A] leading-tight">{userName}</span>
            <span className="text-[12px] text-gray-500 font-medium leading-tight">{userRole}</span>
          </div>
        </div>
        
      </div>
    </header>
  );
};

export default TopBar;
