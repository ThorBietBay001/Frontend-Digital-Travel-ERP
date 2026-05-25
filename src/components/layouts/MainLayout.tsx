import React from 'react';
import { Sidebar } from '../ui/Sidebar';
import TopBar from '../ui/TopBar';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../config/rolePermissions';

export interface MainLayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
  expandedMenus?: string[];
  breadcrumb: { label: string; href?: string }[];
  userName?: string;
  userRole?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeMenu,
  expandedMenus,
  breadcrumb,
  userName,
  userRole,
}) => {
  const { user } = useAuth();
  const resolvedUserName = user?.tenHienThi || user?.hoTen || userName;
  const resolvedUserRole = getRoleLabel(user?.maVaiTro || userRole);

  return (
    <div className="flex h-screen bg-[#F9F9FF]">
      {/* Sidebar - Cố định bên trái */}
      <Sidebar activeMenu={activeMenu} defaultExpandedMenus={expandedMenus} />

      {/* Khu vực nội dung chính */}
      <div className="flex-1 flex flex-col ml-[260px] overflow-y-auto">
        
        {/* TopBar cố định ở phía trên khu vực nội dung */}
        <div className="sticky top-0 z-30">
          <TopBar 
            breadcrumb={breadcrumb} 
            userName={resolvedUserName} 
            userRole={resolvedUserRole} 
          />
        </div>

        {/* Nội dung bên trong phần chính */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
