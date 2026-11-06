import { useState } from 'react';
import { Gift, Ticket, Leaf, Calendar, ShieldCheck } from 'lucide-react';
import type { Tour, Voucher } from '../../types';

interface OrderSummaryProps {
  tour: Tour;
  numPeople: number;
  selectedVoucher: string | null;
  setSelectedVoucher: (id: string | null) => void;
  tinhTongTien: () => number;
  tinhDiemXanh: () => number;
  extraServicesTotal: number;
  passengerFareSummary: {
    adultCount: number;
    childCount: number;
    adultSubtotal: number;
    childSubtotal: number;
    total: number;
  };
  currentStep: number;
  vouchers?: Voucher[];
  onNextStep?: () => void;
  isProcessingPayment?: boolean;
}

export default function TongKetDonHang({
  tour,
  numPeople,
  selectedVoucher,
  setSelectedVoucher,
  tinhTongTien,
  tinhDiemXanh,
  extraServicesTotal,
  passengerFareSummary,
  currentStep,
  vouchers = [],
  onNextStep,
  isProcessingPayment
}: OrderSummaryProps) {
  const [customCode, setCustomCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const activeVouchers = vouchers.filter(v => v.status === 'active');
  const baseSubtotal = passengerFareSummary.total;
  const preVoucherTotal = baseSubtotal + extraServicesTotal;

  const handleApplyPromoCode = () => {
    setPromoError('');
    setPromoSuccess('');
    if (!customCode.trim()) return;

    const matched = activeVouchers.find(
      v => v.code.toUpperCase() === customCode.toUpperCase()
    );

    if (matched) {
      setSelectedVoucher(matched.id);
      setPromoSuccess(`Đã áp dụng mã "${matched.code}" thành công!`);
    } else {
      setPromoError('Mã giảm giá không hợp lệ hoặc không còn hiệu lực!');
    }
  };

  const finalTotal = tinhTongTien();

  return (
    <div className="bg-white rounded-2xl p-6 border-t-4 border-t-blue-600 shadow-sm space-y-5 transition-all duration-300">
      <div>
        <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
          Tóm tắt đơn hàng
        </h3>
      </div>

      <div className="flex space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-14 h-14 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <span className="block font-black text-slate-800 text-xs truncate">{tour.name}</span>
          <span className="block text-[10px] text-slate-500 mt-0.5 truncate">{tour.destination}</span>
          <div className="flex items-center space-x-1 mt-1.5 text-[10px] text-blue-600 font-bold">
            <Calendar className="w-3 h-3" />
            <span>KH: {tour.departureDate ? new Date(tour.departureDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</span>
          </div>
        </div>
      </div>

      {currentStep < 3 ? (
        <div className="space-y-4 pt-1">
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100/50 text-xs font-semibold text-slate-650">
            <div className="flex justify-between">
              <span>Số lượng hành khách</span>
              <span className="text-slate-900 font-bold">{numPeople} người</span>
            </div>
            <div className="flex justify-between">
              <span>Đơn giá tour</span>
              <span className="text-slate-900 font-bold">{formatPrice(tour.price)}</span>
            </div>

            {extraServicesTotal > 0 && (
              <div className="flex justify-between">
                <span>Dịch vụ thêm</span>
                <span className="text-slate-900 font-bold">+{formatPrice(extraServicesTotal)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-blue-100 bg-blue-50/40 p-2 text-[10px] text-slate-600">
              <div>
                <span className="block font-black uppercase text-slate-400">Nguoi lon</span>
                <span className="font-extrabold text-slate-900">{passengerFareSummary.adultCount} x {formatPrice(tour.price)}</span>
              </div>
              <div>
                <span className="block font-black uppercase text-slate-400">Tre em</span>
                <span className="font-extrabold text-slate-900">{passengerFareSummary.childCount} x {formatPrice(tour.price * 0.5)}</span>
              </div>
            </div>

            {tinhDiemXanh() > 0 && (
              <div className="flex justify-between text-green-700 bg-green-50/50 p-2 rounded-lg border border-green-100">
                <span className="flex items-center space-x-1 font-bold">
                  <Leaf className="w-3.5 h-3.5 text-green-600" />
                  <span>Điểm Xanh tích lũy</span>
                </span>
                <span className="font-extrabold">+{tinhDiemXanh()} điểm</span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-slate-800">Tạm tính</span>
              <span className="text-lg font-black text-blue-600">{formatPrice(preVoucherTotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onNextStep}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-blue-500/25"
          >
            <span>Tiếp tục để Thanh toán</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 pt-1 animate-fadeIn">
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100/50">
            <h4 className="font-black text-slate-800 text-xs flex items-center space-x-1.5 uppercase tracking-wide">
              <Gift className="w-4 h-4 text-blue-600" />
              <span>Khuyến mãi & Quà tặng</span>
            </h4>

            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-500 uppercase">Chọn Voucher có sẵn</label>
              <select
                value={selectedVoucher || ''}
                onChange={(e) => {
                  setSelectedVoucher(e.target.value || null);
                  setPromoSuccess('');
                  setPromoError('');
                }}
                className="w-full bg-white border-b-2 border-slate-200 focus:border-blue-600 px-3 py-2 outline-none text-xs font-semibold text-slate-800 transition-all rounded-t-lg rounded-b-none"
              >
                <option value="">-- Chọn mã giảm giá --</option>
                {activeVouchers.map((voucher) => (
                  <option key={voucher.id} value={voucher.id}>
                    {voucher.title} ({voucher.code}) - {voucher.discountType === 'percent' ? `${voucher.discount}%` : formatPrice(voucher.discount)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
              <label className="block text-[9px] font-black text-slate-500 uppercase">Nhập mã ưu đãi khác</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="flex-1 bg-white border-b-2 border-slate-200 focus:border-blue-600 px-3 py-2 outline-none text-xs font-mono text-slate-800 transition-all rounded-t-lg rounded-b-none"
                  placeholder="Ví dụ: SUMMER2026"
                />
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Áp dụng
                </button>
              </div>
              {promoError && <p className="text-[10px] text-red-650 font-bold">{promoError}</p>}
              {promoSuccess && <p className="text-[10px] text-green-705 font-bold">{promoSuccess}</p>}
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100/50 text-xs font-medium text-slate-650">
            <div className="flex justify-between">
              <span>Đơn giá tour ({numPeople} người)</span>
              <span className="font-bold text-slate-900">{formatPrice(baseSubtotal)}</span>
            </div>

            {extraServicesTotal > 0 && (
              <div className="flex justify-between">
                <span>Dịch vụ thêm</span>
                <span className="font-bold text-slate-900">+{formatPrice(extraServicesTotal)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-blue-100 bg-blue-50/40 p-2 text-[10px] text-slate-600">
              <div>
                <span className="block font-black uppercase text-slate-400">Nguoi lon</span>
                <span className="font-extrabold text-slate-900">{passengerFareSummary.adultCount} x {formatPrice(tour.price)}</span>
              </div>
              <div>
                <span className="block font-black uppercase text-slate-400">Tre em</span>
                <span className="font-extrabold text-slate-900">{passengerFareSummary.childCount} x {formatPrice(tour.price * 0.5)}</span>
              </div>
            </div>

            {selectedVoucher && (
              <div className="flex justify-between text-green-700">
                <span className="flex items-center space-x-1 font-bold">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Mã giảm giá áp dụng</span>
                </span>
                <span className="font-bold">
                  -{formatPrice(preVoucherTotal - tinhTongTien())}
                </span>
              </div>
            )}

            {tinhDiemXanh() > 0 && (
              <div className="flex justify-between text-green-700 bg-green-50/50 p-2 rounded-lg border border-green-100">
                <span className="flex items-center space-x-1 font-bold">
                  <Leaf className="w-3.5 h-3.5 text-green-600" />
                  <span>Điểm Xanh nhận thêm</span>
                </span>
                <span className="font-extrabold">+{tinhDiemXanh()} điểm</span>
              </div>
            )}

            <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-800 text-sm">Tổng cộng</span>
              <span className="text-xl font-extrabold text-blue-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessingPayment}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingPayment ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Đang xử lý giao dịch...</span>
              </span>
            ) : (
              <>
                <span>Xác nhận & Thanh toán</span>
                <ShieldCheck className="w-4 h-4 text-yellow-300 animate-pulse" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 font-bold pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span>Giao dịch an toàn & Bảo mật 100%</span>
          </div>
        </div>
      )}
    </div>
  );
}
