import React from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <MainLayout
      activeMenu="Tổng quan"
      breadcrumb={[{ label: 'Tổng quan' }]}
    >
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-[16px] shadow-sm border border-blue-50">
        <h1 className="text-[40px] font-bold text-[#00668A] mb-4">
          Chào mừng bạn, {user?.hoTen || 'Người dùng'}!
        </h1>
        <p className="text-gray-500 text-lg">
          Hệ thống Quản lý Điều hành Tour. Bạn đã đăng nhập với vai trò: {user?.maVaiTro}
        </p>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
