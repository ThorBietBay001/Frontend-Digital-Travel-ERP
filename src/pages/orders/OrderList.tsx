import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { Order } from './mockData';
import type { DonDatTourResponse } from '../../services/orders';
import { ordersService } from '../../services/orders';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { hasAccess } from '../../config/rolePermissions';
import { formatApiError, unwrapPageContent } from '../../utils/apiHelpers';
import { formatDate } from '../../utils/dateHelpers';

const mapStatus = (s?: string): Order['status'] => {
  switch (s?.trim().toUpperCase()) {
    case 'DA_XAC_NHAN':
    case 'CONFIRMED':
      return 'confirmed';
    case 'HOAN_THANH':
    case 'COMPLETED':
      return 'completed';
    case 'CHO_HUY':
    case 'HUY':
    case 'CANCELLED':
    case 'DA_HUY':
    case 'HET_HAN_GIU_CHO':
    case 'THANH_TOAN_THAT_BAI':
      return 'cancelled';
    case 'CHO_XAC_NHAN':
    default:
      return 'pending';
  }
};

const mapPaymentStatus = (s?: string, daBaoChuyenKhoan?: boolean): Order['paymentStatus'] => {
  switch (s?.trim().toUpperCase()) {
    case 'CHO_XAC_NHAN':
      return daBaoChuyenKhoan ? 'paid' : 'unpaid';
    case 'DA_XAC_NHAN':
    case 'HOAN_THANH':
      return 'paid';
    case 'THANH_TOAN_THAT_BAI':
      return 'failed';
    case 'CHO_HUY':
    case 'HUY':
    case 'DA_HUY':
      return 'refunded';
    default:
      return 'unpaid';
  }
};



const mapToUI = (api: DonDatTourResponse): Order => ({
  id: api.maDatTour || '',
  orderCode: api.maDatTour || '',
  customerName: api.tenKhachHang || '',
  customerPhone: '',
  tourName: api.tieuDeTour || '',
  departureDate: formatDate(api.ngayKhoiHanh),
  bookingDate: formatDate(api.ngayDat),
  totalAmount: api.tongTien || 0,
  status: mapStatus(api.trangThai),
  paymentStatus: mapPaymentStatus(api.trangThai, api.daBaoChuyenKhoan),
  passengerCount: api.chiTietKhach?.length || 0,
  isExpired: api.thoiGianHetHan ? new Date(api.thoiGianHetHan) < new Date() : false,
});

const OrderList: React.FC = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { user } = useAuth();
  const { confirm, notify } = useNotification();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'orders')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ordersService.danhSachTatCa();
      setData(unwrapPageContent(res).map(mapToUI));
    } catch (err: unknown) {
      setError(formatApiError(err, 'Lỗi khi tải dữ liệu đơn hàng'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getAll();
  }, [user]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrderId(order.id);
    setModalOpen(true);
  };

  const canApprovePayment = (order: Order) => order.status === 'pending' && order.paymentStatus === 'paid';

  const handleApprovePayment = async (order: Order) => {
    const confirmed = await confirm(`Duyệt thanh toán cho đơn ${order.orderCode}?`);
    if (!confirmed) return;

    setApprovingId(order.id);
    setError(null);
    try {
      await ordersService.xacNhanDon(order.id);
      await getAll();
      notify(`Duyệt thanh toán đơn ${order.orderCode} thành công.`, { type: 'success' });
    } catch (err: unknown) {
      const message = formatApiError(err, 'Lỗi khi duyệt thanh toán');
      if (message.includes('giao dịch thành công trước đó') || message.includes('giao dịch thành công')) {
        notify(`Đơn ${order.orderCode} đã được thanh toán thành công từ trước.`, { type: 'info' });
        setError(null);
      } else {
        setError(message);
        notify(message, { type: 'error' });
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectPayment = async (order: Order) => {
    const confirmed = await confirm(`Từ chối thanh toán cho đơn ${order.orderCode}?`);
    if (!confirmed) return;

    setApprovingId(order.id);
    setError(null);
    try {
      await ordersService.tuChoiThanhToan(order.id);
      await getAll();
      notify(`Đã từ chối thanh toán đơn ${order.orderCode}.`, { type: 'success' });
    } catch (err: unknown) {
      const message = formatApiError(err, 'Lỗi khi từ chối thanh toán');
      setError(message);
      notify(message, { type: 'error' });
    } finally {
      setApprovingId(null);
    }
  };

  const filteredData = data.filter((order) => {
    const matchesSearch =
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === '' || paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<Order>[] = [
    {
      key: 'orderCode',
      title: 'Mã Đơn',
      width: '12%',
      render: (record) => <span className="font-bold text-[#00668A]">{record.orderCode}</span>,
    },
    {
      key: 'customer',
      title: 'Khách hàng',
      width: '18%',
      render: (record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{record.customerName}</span>
        </div>
      ),
    },
    {
      key: 'tourName',
      title: 'Tour',
      width: '25%',
      render: (record) => <span className="text-sm font-medium line-clamp-2" title={record.tourName}>{record.tourName}</span>,
    },
    { key: 'bookingDate', title: 'Ngày đặt', dataIndex: 'bookingDate', width: '10%' },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '12%',
      render: (record) => {
        switch (record.status) {
          case 'pending':
            return <Badge label="Chờ xác nhận" variant="warning" />;
          case 'confirmed':
            return <Badge label="Đã xác nhận" variant="info" />;
          case 'completed':
            return <Badge label="Hoàn thành" variant="success" />;
          case 'cancelled':
            return <Badge label="Đã hủy" variant="error" />;
          default:
            return null;
        }
      },
    },
    {
      key: 'paymentStatus',
      title: 'Thanh toán',
      width: '12%',
      render: (record) => {
        switch (record.paymentStatus) {
          case 'paid':
            return <Badge label="Thành công" variant="success" />;
          case 'unpaid':
            return <Badge label="Chờ thanh toán" variant="warning" />;
          case 'failed':
            return <Badge label="Thất bại" variant="error" />;
          case 'refunded':
            return <Badge label="Đã hoàn tiền" variant="neutral" />;
          default:
            return null;
        }
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'center',
      width: '11%',
      render: (record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<CheckCircle size={16} />}
            onClick={() => handleApprovePayment(record)}
            disabled={!canApprovePayment(record) || approvingId === record.id}
            className="p-2"
            aria-label="Duyệt thanh toán"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<XCircle size={16} />}
            onClick={() => handleRejectPayment(record)}
            disabled={!canApprovePayment(record) || approvingId === record.id}
            className="p-2 text-red-600"
            aria-label="Từ chối thanh toán"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={18} />}
            onClick={() => handleOpenDetail(record)}
            className="p-2"
            aria-label="Xem chi tiết"
          />
        </div>
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
            {/* <p className="text-gray-500 text-sm mt-1">Theo dõi các đơn đặt tour từ khách hàng.</p> */}
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
                { label: 'Đã hủy', value: 'cancelled' },
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
                { label: 'Thành công', value: 'paid' },
                { label: 'Chờ thanh toán', value: 'unpaid' },
                { label: 'Thất bại', value: 'failed' },
                { label: 'Đã hoàn tiền', value: 'refunded' },
              ]}
              value={paymentFilter}
              onChange={setPaymentFilter}
              placeholder="Thanh toán"
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
            <Table<Order> columns={columns} dataSource={paginatedData} rowKey="id" emptyText="Không tìm thấy đơn hàng nào" />
          )}
        </div>

        <Pagination current={page} pageSize={pageSize} total={filteredData.length} onChange={setPage} />
      </div>

      <OrderDetailModal isOpen={modalOpen} onClose={() => setModalOpen(false)} maDatTour={selectedOrderId} onApproved={getAll} />
    </MainLayout>
  );
};

export default OrderList;
