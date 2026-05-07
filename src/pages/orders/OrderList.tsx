import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Eye } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { Order } from './mockData';
import type { DonDatTourResponse } from '../../services/orders';
import { ordersService } from '../../services/orders';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const OrderList: React.FC = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const mapStatus = (s?: string): Order['status'] => {
    switch (s?.toUpperCase()) {
      case 'CONFIRMED': return 'confirmed';
      case 'COMPLETED': return 'completed';
      case 'CANCELLED': return 'cancelled';
      default: return 'pending';
    }
  };

  const mapToUI = (api: DonDatTourResponse): Order => ({
    id: api.maDatTour || '',
    orderCode: api.maDatTour || '',
    customerName: api.tenKhachHang || '',
    customerPhone: '',
    tourName: api.tieuDeTour || '',
    departureDate: api.ngayKhoiHanh || '',
    bookingDate: api.ngayDat || '',
    totalAmount: api.tongTien || 0,
    status: mapStatus(api.trangThai),
    paymentStatus: 'unpaid',
    passengerCount: api.chiTietKhach?.length || 0,
  });

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'orders')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ordersService.danhSachTatCa();
      setData(res && res.content ? res.content.map(mapToUI) : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const filteredData = data.filter((order) => {
    const matchesSearch = order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === '' || paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    let matchesMonth = true;
    if (monthFilter && monthFilter !== 'all') {
      const parts = order.departureDate.split('/');
      if (parts.length === 3) matchesMonth = `${parts[1]}/${parts[2]}` === monthFilter;
      else {
        const dashParts = order.departureDate.split('-');
        if (dashParts.length === 3) matchesMonth = dashParts[1] === monthFilter.split('/')[0];
      }
    }
    return matchesSearch && matchesStatus && matchesPayment && matchesMonth;
  });

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<Order>[] = [
    {
      key: 'orderCode',
      title: 'Mã Đơn',
      render: (record) => <span className="font-bold text-[#00668A]">{record.orderCode}</span>,
    },
    {
      key: 'customer',
      title: 'Khách hàng',
      render: (record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{record.customerName}</span>
          <span className="text-xs text-gray-500">{record.customerPhone}</span>
        </div>
      )
    },
    {
      key: 'tourName',
      title: 'Tour',
      render: (record) => <span className="text-sm font-medium">{record.tourName}</span>
    },
    { key: 'departureDate', title: 'Ngày khởi hành', dataIndex: 'departureDate' },
    {
      key: 'passengerCount',
      title: 'SL khách',
      align: 'center',
      render: (record) => <span>{record.passengerCount}</span>
    },
    {
      key: 'totalAmount',
      title: 'Tổng tiền (VND)',
      align: 'right',
      render: (record) => (
        <span className="font-bold text-gray-800">{record.totalAmount.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (record) => {
        switch (record.status) {
          case 'pending': return <Badge label="Chờ xác nhận" variant="warning" />;
          case 'confirmed': return <Badge label="Đã xác nhận" variant="info" />;
          case 'completed': return <Badge label="Hoàn thành" variant="success" />;
          case 'cancelled': return <Badge label="Đã hủy" variant="error" />;
          default: return null;
        }
      },
    },
    {
      key: 'paymentStatus',
      title: 'Thanh toán',
      render: (record) => {
        switch (record.paymentStatus) {
          case 'paid': return <Badge label="Đã Thanh Toán" variant="success" />;
          case 'unpaid': return <Badge label="Chưa Thanh Toán" variant="warning" />;
          case 'partial': return <Badge label="Thanh Toán 1 phần" variant="info" />;
          case 'refunded': return <Badge label="Đã Hoàn Tiền" variant="neutral" />;
          default: return null;
        }
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'center',
      render: (record) => (
        <Button variant="ghost" size="sm" icon={<Eye size={18} />} onClick={() => handleOpenDetail(record)} className="p-2" aria-label="Xem chi tiết" />
      ),
    },
  ];

  return (
    <MainLayout
      activeMenu="Quản lý Đơn hàng"
      expandedMenus={[]}
      breadcrumb={[{ label: 'Quản lý Đơn hàng' }]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col h-full gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]">Quản lý Đơn hàng</h1>
            <p className="text-gray-500 text-sm mt-1">Theo dõi các đơn đặt tour từ khách hàng.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <SearchInput placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="w-[180px]">
            <Select
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Chờ xác nhận', value: 'pending' },
                { label: 'Đã xác nhận', value: 'confirmed' },
                { label: 'Hoàn thành', value: 'completed' },
                { label: 'Đã hủy', value: 'cancelled' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái đơn"
            />
          </div>
          <div className="w-[180px]">
            <Select
              options={[
                { label: 'Tất cả TT', value: 'all' },
                { label: 'Đã thanh toán', value: 'paid' },
                { label: 'Chưa thanh toán', value: 'unpaid' },
                { label: 'Hoàn tiền', value: 'refunded' }
              ]}
              value={paymentFilter}
              onChange={setPaymentFilter}
              placeholder="Thanh toán"
            />
          </div>
          <div className="w-[160px]">
            <Select
              options={[
                { label: 'Tất cả tháng', value: 'all' },
                { label: 'Tháng 05/2025', value: '05/2025' },
                { label: 'Tháng 06/2025', value: '06/2025' }
              ]}
              value={monthFilter}
              onChange={setMonthFilter}
              placeholder="Tháng khởi hành"
            />
          </div>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex-1 relative min-h-[300px] overflow-x-auto">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500 p-8">{error}</div>
          ) : (
            <Table<Order>
              columns={columns}
              dataSource={paginatedData}
              rowKey="id"
              emptyText="Không tìm thấy đơn hàng nào"
            />
          )}
        </div>

        <Pagination current={page} pageSize={pageSize} total={filteredData.length} onChange={setPage} />
      </div>

      <OrderDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        order={selectedOrder}
      />
    </MainLayout>
  );
};

export default OrderList;
