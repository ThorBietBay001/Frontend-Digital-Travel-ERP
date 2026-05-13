import { Routes, Route, Navigate } from 'react-router-dom'
import TourTemplateList from './pages/tour-template/TourTemplateList'
import TourInstanceList from './pages/tour-instance/TourInstanceList'
import ServiceList from './pages/services/ServiceList'  
import GreenActionList from './pages/green-actions/GreenActionList' 
import OrderList from './pages/orders/OrderList'
import CustomerList from './pages/customers/CustomerList'
import ComplaintList from './pages/complaints/ComplaintList'
import VoucherList from './pages/promotions/VoucherList'
import AssignGuide from './pages/dispatch/AssignGuide'
import GuideList from './pages/dispatch/GuideList'
import CostList from './pages/finance/cost-management/CostList'
import SettlementList from './pages/finance/settlement/SettlementList'
import RefundList from './pages/finance/refund/RefundList'
import AccountList from './pages/system/accounts/AccountList'
import StaffList from './pages/system/hr/StaffList'
import SystemLogList from './pages/system/logs/SystemLogList'
import MainLayout from './components/layouts/MainLayout'
import Dashboard from './pages/dashboard/Dashboard'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import GuideSchedule from './pages/guide/GuideSchedule'

const ROLES_DASHBOARD = ['ADMIN', 'SANPHAM', 'KINHDOANH', 'DIEUHANH', 'KETOAN', 'HDV', 'KHACHHANG'];
const ROLES_SANPHAM = ['SANPHAM'];
const ROLES_KINHDOANH = ['KINHDOANH'];
const ROLES_DIEUHANH = ['DIEUHANH'];
const ROLES_KETOAN = ['KETOAN'];
const ROLES_HDV = ['HDV'];
const ROLES_ADMIN = ['ADMIN'];

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={ROLES_DASHBOARD}>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Quản lý Sản phẩm Tour */}
      <Route path="/tour-template" element={
        <ProtectedRoute allowedRoles={ROLES_SANPHAM}>
          <TourTemplateList />
        </ProtectedRoute>
      } />
      <Route path="/tour-instance" element={
        <ProtectedRoute allowedRoles={ROLES_DIEUHANH}>
          <TourInstanceList />
        </ProtectedRoute>
      } />
      <Route path="/services" element={
        <ProtectedRoute allowedRoles={ROLES_SANPHAM}>
          <ServiceList />
        </ProtectedRoute>
      } />
      <Route path="/green-actions" element={
        <ProtectedRoute allowedRoles={ROLES_SANPHAM}>
          <GreenActionList />
        </ProtectedRoute>
      } />

      {/* Kinh doanh */}
      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={ROLES_KINHDOANH}>
          <OrderList />
        </ProtectedRoute>
      } />
      <Route path="/customers" element={
        <ProtectedRoute allowedRoles={ROLES_KINHDOANH}>
          <CustomerList />
        </ProtectedRoute>
      } />
      <Route path="/complaints" element={
        <ProtectedRoute allowedRoles={ROLES_KINHDOANH}>
          <ComplaintList />
        </ProtectedRoute>
      } />
      <Route path="/promotions" element={
        <ProtectedRoute allowedRoles={ROLES_KINHDOANH}>
          <VoucherList />
        </ProtectedRoute>
      } />

      {/* Điều hành */}
      <Route path="/dispatch/assign" element={
        <ProtectedRoute allowedRoles={ROLES_DIEUHANH}>
          <AssignGuide />
        </ProtectedRoute>
      } />
      <Route path="/dispatch/list" element={
        <ProtectedRoute allowedRoles={ROLES_DIEUHANH}>
          <GuideList />
        </ProtectedRoute>
      } />
      <Route path="/dispatch" element={<Navigate to="/dispatch/assign" />} />

      {/* Tài chính */}
      <Route path="/finance/cost-management" element={
        <ProtectedRoute allowedRoles={ROLES_KETOAN}>
          <CostList />
        </ProtectedRoute>
      } />
      <Route path="/finance/settlement" element={
        <ProtectedRoute allowedRoles={ROLES_KETOAN}>
          <SettlementList />
        </ProtectedRoute>
      } />
      <Route path="/finance/refund" element={
        <ProtectedRoute allowedRoles={ROLES_KETOAN}>
          <RefundList />
        </ProtectedRoute>
      } />

      {/* Hướng dẫn viên */}
      <Route path="/guide/schedule" element={
        <ProtectedRoute allowedRoles={ROLES_HDV}>
          <GuideSchedule />
        </ProtectedRoute>
      } />

      {/* Hệ thống - chỉ ADMIN */}
      <Route path="/system/accounts" element={
        <ProtectedRoute allowedRoles={ROLES_ADMIN}>
          <AccountList />
        </ProtectedRoute>
      } />
      <Route path="/system/hr" element={
        <ProtectedRoute allowedRoles={ROLES_ADMIN}>
          <StaffList />
        </ProtectedRoute>
      } />
      <Route path="/system/logs" element={
        <ProtectedRoute allowedRoles={ROLES_ADMIN}>
          <SystemLogList />
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route
        path="*"
        element={
          <MainLayout
            activeMenu="Tổng quan"
            breadcrumb={[{ label: 'Trang không tồn tại' }]}
          >
            <h1 className="text-2xl font-bold text-[#121C2C]">404 - Không Tìm Thấy</h1>
            <p className="mt-4">Trang bạn yêu cầu chưa được phát triển hoặc không tồn tại.</p>
          </MainLayout>
        }
      />
    </Routes>
  )
}

export default App
