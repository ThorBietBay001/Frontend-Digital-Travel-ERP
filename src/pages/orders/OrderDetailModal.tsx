import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, DollarSign, MapPin, Users, Tag, Ticket, Leaf, Clock, CheckCircle } from 'lucide-react';
import type { Order, Passenger } from './mockData';
import { ordersService } from '../../services/orders';
import type { DonDatTourResponse } from '../../services/orders';
import { formatApiError } from '../../utils/apiHelpers';
import { useNotification } from '../../context/NotificationContext';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  maDatTour: string | null;
  onApproved?: () => void | Promise<void>;
}

const mapStatus = (s?: string): Order['status'] => {
  switch (s?.toUpperCase()) {
    case 'DA_XAC_NHAN':
      return 'confirmed';
    case 'HOAN_THANH':
      return 'completed';
    case 'CHO_HUY':
    case 'HUY':
      return 'cancelled';
    default:
      return 'pending';
  }
};

const mapPaymentStatus = (s?: string): Order['paymentStatus'] => {
  switch (s?.toUpperCase()) {
    case 'CHO_XAC_NHAN':
      return 'pending_confirmation';
    case 'DA_XAC_NHAN':
    case 'HOAN_THANH':
      return 'paid';
    case 'CHO_HUY':
    case 'HUY':
      return 'refunded';
    default:
      return 'unpaid';
  }
};

const formatCurrency = (value?: number): string => `${(value || 0).toLocaleString('vi-VN')} đ`;

const formatDateTime = (value?: string): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const time = d.toLocaleTimeString('vi-VN', { hour12: false });
  const date = d.toLocaleDateString('vi-VN');
  return `${time}, ${date}`;
};

const getPaymentStatusLabel = (status: Order['paymentStatus']) => {
  switch (status) {
    case 'paid':
      return 'Đã thanh toán';
    case 'unpaid':
      return 'Chưa thanh toán';
    case 'pending_confirmation':
      return 'Chờ xác nhận';
    case 'partial':
      return 'Thanh toán 1 phần';
    case 'refunded':
      return 'Đã hoàn tiền';
    default:
      return status;
  }
};

const getOrderStatusLabel = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'completed':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

const mapApiToOrder = (api: DonDatTourResponse): Order => ({
  id: api.maDatTour || '',
  orderCode: api.maDatTour || '',
  customerName: api.tenKhachHang || '',
  customerPhone: '',
  tourName: api.tieuDeTour || '',
  departureDate: api.ngayKhoiHanh || '',
  bookingDate: formatDateTime(api.ngayDat),
  totalAmount: api.tongTien || 0,
  voucherCode: api.maVoucher,
  voucherName: api.tenVoucher,
  voucherDiscount: api.soTienGiam ?? api.tienGiam ?? api.giaTriVoucher ?? 0,
  childTicketCount: api.soLuongVeTreEm ?? api.chiTietKhach?.filter((p) => p.loaiKhach?.toUpperCase().includes('TRE') || (p.doTuoi !== undefined && p.doTuoi < 12)).length ?? 0,
  childTicketAmount: api.tienVeTreEm ?? api.chiTietKhach?.reduce((sum, p) => sum + (p.giaVeTreEm || 0), 0) ?? 0,
  greenPoints: api.soDiemXanh ?? api.diemXanh ?? 0,
  greenNote: api.ghiChuDiemXanh,
  roomType: api.chiTietKhach?.find((p) => p.tenLoaiPhong)?.tenLoaiPhong,
  roomSurcharge: api.chiTietKhach?.reduce((sum, p) => sum + (p.mucPhuThu || 0), 0) ?? 0,
  status: mapStatus(api.trangThai),
  paymentStatus: mapPaymentStatus(api.trangThai),
  passengerCount: api.chiTietKhach?.length || 0,
  passengers: (api.chiTietKhach || []).map(
    (p): Passenger => ({
      name: p.hoTen || '—',
      ageGroup: p.loaiKhach?.toUpperCase().includes('TRE') ? 'Trẻ em' : 'Người lớn',
      gender: 'Nam',
      customerCode: p.maKhachHang,
      phone: p.soDienThoai,
      identityNumber: p.cccd ?? p.soGiayTo,
      roomType: p.tenLoaiPhong,
      surcharge: p.mucPhuThu,
      price: p.giaTaiThoiDiemDat,
    })
  ),
});

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, maDatTour, onApproved }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirm, notify } = useNotification();

  const loadDetail = useCallback(async () => {
    if (!maDatTour) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await ordersService.chiTietDatTour(maDatTour);
      setOrder(mapApiToOrder(detail));
    } catch (err: unknown) {
      setError(formatApiError(err, 'Không tải được chi tiết đơn'));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [maDatTour]);

  useEffect(() => {
    if (!isOpen || !maDatTour) {
      setOrder(null);
      setError(null);
      return;
    }

    loadDetail();
  }, [isOpen, maDatTour, loadDetail]);

  if (!isOpen) return null;

  const renderPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge label="Đã thanh toán" variant="success" />;
      case 'unpaid':
        return <Badge label="Chưa thanh toán" variant="warning" />;
      case 'pending_confirmation':
        return <Badge label="Chờ xác nhận" variant="info" />;
      case 'partial':
        return <Badge label="Thanh toán 1 phần" variant="info" />;
      case 'refunded':
        return <Badge label="Đã hoàn tiền" variant="neutral" />;
      default:
        return null;
    }
  };

  const CustomHeader = (
    <div className="flex flex-col gap-1 pr-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-[#121C2C]">Chi tiết Đơn hàng</h2>
        {order && renderPaymentBadge(order.paymentStatus)}
      </div>
      <p className="text-sm font-medium text-gray-500">Mã đơn: {maDatTour}</p>
    </div>
  );

  const canApprovePayment = order?.paymentStatus === 'pending_confirmation';

  const handleApprovePayment = async () => {
    if (!order) return;
    const confirmed = await confirm(`Duyệt thanh toán cho đơn ${order.orderCode}?`);
    if (!confirmed) return;

    setApproving(true);
    setError(null);
    try {
      await ordersService.xacNhanDon(order.id);
      await loadDetail();
      await onApproved?.();
      notify(`Duyệt thanh toán đơn ${order.orderCode} thành công.`, { type: 'success' });
    } catch (err: unknown) {
      const message = formatApiError(err, 'Lỗi khi duyệt thanh toán');
      setError(message);
      notify(message, { type: 'error' });
    } finally {
      setApproving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<>{CustomHeader}</>}
      size="xl"
      footer={(
        <div className="flex items-center justify-end gap-3">
          {canApprovePayment && (
            <Button icon={<CheckCircle size={16} />} onClick={handleApprovePayment} disabled={approving}>
              Duyệt thanh toán
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>Đóng</Button>
        </div>
      )}
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : !order ? (
        <div className="text-center text-gray-500 py-8">Không có dữ liệu đơn hàng</div>
      ) : (
        <div className="flex flex-col gap-6 text-sm text-gray-700 font-sans">
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
              <MapPin size={18} className="text-[#00668A]" />
              Tour Thực Tế
            </h3>
            <div className="bg-[#F4F9FF] p-4 rounded-xl border border-[#89D4FF] flex justify-between items-center flex-wrap gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Tên tour</span>
                <span className="font-bold text-[#00668A] text-base">{order.tourName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Ngày khởi hành</span>
                <span className="font-semibold text-gray-800">{order.departureDate}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Số lượng khách</span>
                <span className="font-semibold text-gray-800">{order.passengerCount} người</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F9F9FF] p-4 rounded-xl border border-[#E1F1FF] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500 flex items-center gap-2"><Clock size={16} className="text-[#00668A]" /> Thời gian đặt</span>
              <span className="font-semibold text-gray-800 text-right">{order.bookingDate}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Trạng thái đơn</span>
              <span className="font-semibold text-gray-800 text-right">{getOrderStatusLabel(order.status)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
                <User size={18} className="text-[#00668A]" />
                Thông tin Khách hàng
              </h3>
              <div className="bg-[#F9F9FF] p-4 rounded-xl border border-[#E1F1FF] flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-[#E1F1FF] pb-2">
                  <span className="text-gray-500">Họ tên</span>
                  <span className="font-semibold text-gray-800">{order.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mã KH</span>
                  <span className="font-medium text-gray-800">{order.id}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#E1F1FF] pt-2">
                  <span className="text-gray-500">Loại phòng</span>
                  <span className="font-medium text-gray-800">{order.roomType || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Phụ thu</span>
                  <span className="font-medium text-gray-800">{order.roomSurcharge ? formatCurrency(order.roomSurcharge) : '—'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
                <DollarSign size={18} className="text-[#00668A]" />
                Thanh toán
              </h3>
              <div className="bg-white p-4 rounded-xl border border-[#E1F1FF] flex flex-col gap-2.5 shadow-sm">
                <div className="flex justify-between items-center border-b border-[#E1F1FF] pb-2">
                  <span className="text-gray-500">Tổng tiền</span>
                  <span className="font-bold text-[#121C2C] text-base">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#E1F1FF] pb-2">
                  <span className="text-gray-500">Trạng thái TT</span>
                  <span className="font-medium">{getPaymentStatusLabel(order.paymentStatus)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#E1F1FF] pb-2">
                  <span className="text-gray-500 flex items-center gap-1"><Tag size={14} /> Voucher</span>
                  <span className="font-medium text-right">
                    {order.voucherCode || order.voucherName ? `${order.voucherCode || order.voucherName}${order.voucherDiscount ? ` (-${formatCurrency(order.voucherDiscount)})` : ''}` : 'Chưa áp dụng'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#E1F1FF] pb-2">
                  <span className="text-gray-500 flex items-center gap-1"><Ticket size={14} /> Vé trẻ em</span>
                  <span className="font-medium text-right">{order.childTicketCount || 0} vé{order.childTicketAmount ? ` - ${formatCurrency(order.childTicketAmount)}` : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1"><Leaf size={14} /> Điểm xanh</span>
                  <span className="font-medium text-green-700 text-right">{order.greenPoints ? `+${order.greenPoints} điểm` : 'Chưa ghi nhận'}{order.greenNote ? ` - ${order.greenNote}` : ''}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
              <Users size={18} className="text-[#00668A]" />
              Danh sách Hành khách
            </h3>
            <div className="border border-[#E1F1FF] rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F9F9FF] text-gray-600 font-medium border-b border-[#E1F1FF]">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">STT</th>
                    <th className="px-4 py-3 text-center">Họ và tên</th>
                    <th className="px-4 py-3 text-center">Loại khách</th>
                    <th className="px-4 py-3 text-center">Số điện thoại</th>
                    <th className="px-4 py-3 text-center">CCCD</th>
                    <th className="px-4 py-3 text-center">Giá vé</th>
                  </tr>
                </thead>
                <tbody>
                  {order.passengers && order.passengers.length > 0 ? (
                    order.passengers.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 border-b border-[#E1F1FF] last:border-b-0">
                        <td className="px-4 py-3 text-center">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 text-center">
                          <div className="flex flex-col items-center">
                            <span>{p.name}</span>
                            {p.customerCode && <span className="text-xs text-gray-500">{p.customerCode}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">{p.ageGroup}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{p.phone || '—'}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{p.identityNumber || '—'}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{p.price ? formatCurrency(p.price) : '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500 italic">
                        Chưa có thông tin hành khách.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
