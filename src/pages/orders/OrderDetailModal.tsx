import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DollarSign, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import type { Order, Passenger } from './mockData';
import { ordersService } from '../../services/orders';
import type { ChiTietDatTourResponse, DonDatTourResponse } from '../../services/orders';
import { formatApiError } from '../../utils/apiHelpers';
import { useNotification } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/dateHelpers';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  maDatTour: string | null;
  onApproved?: () => void | Promise<void>;
}

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

const formatCurrency = (value?: number): string => `${(value || 0).toLocaleString('vi-VN')} đ`;

const formatAdditionalService = (service: NonNullable<DonDatTourResponse['chiTietDichVu']>[number]): string => {
  const name = service.tenDichVu || service.maDichVuThem || 'Dịch vụ thêm';
  const quantity = service.soLuong ? ` x${service.soLuong}` : '';
  const amount = service.thanhTien ?? (service.donGia && service.soLuong ? service.donGia * service.soLuong : service.donGia);

  return amount ? `${name}${quantity} - ${formatCurrency(amount)}` : `${name}${quantity}`;
};

const calculateAge = (birthday?: string, referenceDate?: string): number | undefined => {
  if (!birthday) return undefined;

  const birthDate = new Date(birthday);
  const dateToCompare = referenceDate ? new Date(referenceDate) : new Date();
  if (Number.isNaN(birthDate.getTime()) || Number.isNaN(dateToCompare.getTime())) return undefined;

  let age = dateToCompare.getFullYear() - birthDate.getFullYear();
  const monthDiff = dateToCompare.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && dateToCompare.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

const isChildPassenger = (passenger: ChiTietDatTourResponse, referenceDate?: string): boolean => {
  if (passenger.laTreEm !== undefined) return passenger.laTreEm;
  if (passenger.isTreEm !== undefined) return passenger.isTreEm;
  if (passenger.isChild !== undefined) return passenger.isChild;
  if (passenger.treEm !== undefined) return passenger.treEm;

  const passengerType = [
    passenger.loaiKhach,
    passenger.loaiKhachHang,
    passenger.loaiVe,
    passenger.nhomTuoi,
    passenger.doiTuong,
    passenger.doiTuongKhach,
    passenger.phanLoai,
  ].join(' ').toUpperCase();

  if (passengerType.includes('TRE') || passengerType.includes('CHILD')) return true;

  const age = passenger.doTuoi ?? passenger.tuoi ?? passenger.age ?? calculateAge(passenger.ngaySinh, referenceDate);
  return age !== undefined && age <= 11;
};



const getPaymentStatusLabel = (status: Order['paymentStatus']) => {
  switch (status) {
    case 'paid':
      return 'Thành công';
    case 'unpaid':
      return 'Chờ thanh toán';
    case 'failed':
      return 'Thất bại';
    case 'refunded':
      return 'Đã hoàn tiền';
    default:
      return status;
  }
};

const mapApiToOrder = (api: DonDatTourResponse): Order => {
  const passengerDetails = api.chiTietKhach || [];
  const childPassengers = passengerDetails.filter((p) => isChildPassenger(p, api.ngayKhoiHanh));
  const childTicketPrice = api.giaHienHanh ? api.giaHienHanh / 2 : undefined;
  const childTicketUnitPrice = api.tienVeTreEm && childPassengers.length > 0
    ? api.tienVeTreEm / childPassengers.length
    : undefined;
  const explicitVoucherDiscount = api.soTienUuDai ?? api.soTienGiam ?? api.tienGiam ?? api.giaTriVoucher ?? 0;
  const totalAmount = api.tongTien || 0;
  const originalAmount = api.tongTienGoc ?? (totalAmount + explicitVoucherDiscount);
  const voucherDiscount = explicitVoucherDiscount || Math.max(originalAmount - totalAmount, 0);

  return {
    id: api.maDatTour || '',
    orderCode: api.maDatTour || '',
    customerName: api.tenKhachHang || '',
    customerPhone: '',
    tourName: api.tieuDeTour || '',
    departureDate: api.ngayKhoiHanh || '',
    bookingDate: formatDateTime(api.ngayDat),
    totalAmount,
    originalAmount,
    voucherCode: api.maCodeVoucher || api.maVoucher,
    voucherName: api.tenVoucher || api.maVoucher,
    voucherDiscount,
    childTicketCount: childPassengers.length || api.soTreEm || api.soLuongVeTreEm || 0,
    childTicketAmount: api.tienVeTreEm
      ?? childPassengers.reduce((sum, p) => sum + (p.giaVeTreEm ?? childTicketPrice ?? 0), 0),
    greenPoints: api.diemXanhDuKien ?? api.soDiemXanh ?? api.diemXanh ?? 0,
    greenNote: api.ghiChuDiemXanh,
    additionalServices: api.chiTietDichVu?.map(formatAdditionalService).filter(Boolean),
    additionalServicesAmount: api.chiTietDichVu?.reduce((sum, s) => sum + (s.thanhTien ?? (s.donGia && s.soLuong ? s.donGia * s.soLuong : s.donGia) ?? 0), 0) || 0,
    adultCount: api.soNguoiLon ?? (passengerDetails.length - (childPassengers.length || api.soTreEm || api.soLuongVeTreEm || 0)),
    transactionCode: api.maGiaoDich || '—',
    paymentMethod: api.phuongThuc || '—',
    status: mapStatus(api.trangThai),
    paymentStatus: mapPaymentStatus(api.trangThai, api.daBaoChuyenKhoan),
    passengerCount: passengerDetails.length,
    passengers: passengerDetails.map(
      (p): Passenger => {
        const isChild = isChildPassenger(p, api.ngayKhoiHanh);

        return {
          name: p.hoTen || '—',
          ageGroup: isChild ? 'Trẻ em' : 'Người lớn',
          gender: 'Nam',
          customerCode: p.maKhachHang,
          phone: p.soDienThoai,
          identityNumber: p.cccd ?? p.soGiayTo,
          roomType: p.tenLoaiPhong,
          surcharge: p.mucPhuThu,
          price: isChild ? p.giaVeTreEm ?? childTicketPrice ?? childTicketUnitPrice ?? p.giaTaiThoiDiemDat : p.giaTaiThoiDiemDat,
        };
      }
    ),
    isExpired: api.thoiGianHetHan ? new Date(api.thoiGianHetHan) < new Date() : false,
  };
};

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
    setOrder(null);
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
    if (!isOpen || !maDatTour) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadDetail();
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, maDatTour, loadDetail]);

  if (!isOpen) return null;

  const renderPaymentBadge = (status: string) => {
    switch (status) {
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
  };

  const CustomHeader = (
    <div className="flex flex-col gap-1 pr-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-[#121C2C]">Chi tiết Đơn hàng</h2>
        {order && renderPaymentBadge(order.paymentStatus)}
        {order?.isExpired && <Badge label="Đã hết hạn" variant="error" />}
      </div>
      <p className="text-sm font-medium text-gray-500">Mã đơn: {maDatTour}</p>
    </div>
  );

  const canApprovePayment = order?.status === 'pending' && order?.paymentStatus === 'paid';
  const voucherDiscount = order?.voucherDiscount || 0;
  const originalAmount = order ? order.originalAmount ?? (order.totalAmount + voucherDiscount) : 0;
  const tourTicketAmount = order ? Math.max(originalAmount - (order.additionalServicesAmount || 0), 0) : 0;

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
      if (message.includes('giao dịch thành công trước đó') || message.includes('giao dịch thành công')) {
        notify(`Đơn ${order.orderCode} đã được thanh toán thành công từ trước.`, { type: 'info' });
        setError(null);
      } else {
        setError(message);
        notify(message, { type: 'error' });
      }
    } finally {
      setApproving(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!order) return;
    const confirmed = await confirm(`Từ chối thanh toán cho đơn ${order.orderCode}?`);
    if (!confirmed) return;

    setApproving(true);
    setError(null);
    try {
      await ordersService.tuChoiThanhToan(order.id);
      await loadDetail();
      await onApproved?.();
      notify(`Đã từ chối thanh toán đơn ${order.orderCode}.`, { type: 'success' });
    } catch (err: unknown) {
      const message = formatApiError(err, 'Lỗi khi từ chối thanh toán');
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
            <>
              <Button icon={<XCircle size={16} />} onClick={handleRejectPayment} disabled={approving}>
                Từ chối thanh toán
              </Button>
              <Button icon={<CheckCircle size={16} />} onClick={handleApprovePayment} disabled={approving}>
                Duyệt thanh toán
              </Button>
            </>
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

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
              <DollarSign size={18} className="text-[#00668A]" />
              Chi tiết chi phí đơn hàng
            </h3>
            <div className="bg-white p-4 rounded-xl border border-[#E1F1FF] flex flex-col shadow-sm text-sm">
              <div className="flex flex-col gap-2.5 pb-3 border-b border-[#E1F1FF]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Vé tour:</span>
                  <span className="font-medium text-gray-800 text-right">{formatCurrency(tourTicketAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Cơ cấu hành khách:</span>
                  <span className="font-medium text-gray-800 text-right">{order.adultCount || 0} người lớn, {order.childTicketCount || 0} trẻ em</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Dịch vụ bổ sung:</span>
                  <span className="font-medium text-gray-800 text-right">{formatCurrency(order.additionalServicesAmount || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Thuế & Phụ phí:</span>
                  <span className="font-medium text-green-600 text-right">Đã bao gồm</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 py-3 border-b border-[#E1F1FF]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Voucher áp dụng</span>
                  <span className="font-medium text-gray-800 text-right">{order.voucherCode || order.voucherName || 'Không áp dụng'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Số tiền gốc</span>
                  <span className="font-medium text-gray-800 text-right">{formatCurrency(originalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ưu đãi voucher</span>
                  <span className="font-medium text-green-600 text-right">-{formatCurrency(voucherDiscount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Sau khi trừ</span>
                  <span className="font-medium text-[#00668A] text-right">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Điểm xanh dự kiến</span>
                  <span className="font-medium text-green-600 text-right">+{order.greenPoints || 0} điểm</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 py-3 border-b border-[#E1F1FF]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mã giao dịch</span>
                  <span className="font-medium text-gray-800 text-right">{order.transactionCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="font-medium text-gray-800 text-right">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Thanh toán</span>
                  <span className="font-medium text-gray-800 text-right">{getPaymentStatusLabel(order.paymentStatus)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Thời gian</span>
                  <span className="font-medium text-gray-800 text-right">{order.bookingDate}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#121C2C]">Tổng cộng:</span>
                  <span className="font-bold text-[#00668A] text-base">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#121C2C]">Số tiền giao dịch:</span>
                  <span className="font-bold text-[#00668A] text-base">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
