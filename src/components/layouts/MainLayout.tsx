import React from 'react';
import { Sidebar } from '../ui/Sidebar';
import TopBar from '../ui/TopBar';

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
            userName={userName} 
            userRole={userRole} 
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
