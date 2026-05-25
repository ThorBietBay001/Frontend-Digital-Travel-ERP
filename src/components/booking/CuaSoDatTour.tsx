import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { X, Clock, ChevronLeft, ShieldCheck, Copy, Check, Lock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Tour, Voucher } from '../../types';
import { khService } from '../../services/khService';
import { mapExtraService, mapProfile, mapVoucher, unwrapData, unwrapPageContent } from '../../services/apiHelpers';
import { hasActiveSession } from '../../services/api';
import BieuMauHanhKhach, { type PassengerData } from './BieuMauHanhKhach';
import ChonHanhDongXanh from './ChonHanhDongXanh';
import ChonDichVuThem, { type ExtraService } from './ChonDichVuThem';
import ChonPhuongThucThanhToan from './ChonPhuongThucThanhToan';
import TongKetDonHang from './TongKetDonHang';
import DatTourThanhCong from './DatTourThanhCong';

interface BookingModalProps {
  tour: Tour;
  onClose: () => void;
  onSessionExpired: () => void;
}

const emptyPassenger: PassengerData = {
  name: '',
  phone: '',
  idCard: '',
  email: '',
  dateOfBirth: ''
};

const getStoredProfile = () => {
  try {
    const stored = localStorage.getItem('userProfile');
    return stored ? JSON.parse(stored) : { greenPoints: 0 };
  } catch {
    return { greenPoints: 0 };
  }
};

const CHILD_MAX_AGE = 11;

const getAgeOnDate = (dateOfBirth: string, referenceDate?: string) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const targetDate = referenceDate ? new Date(referenceDate) : new Date();
  if (Number.isNaN(birthDate.getTime()) || Number.isNaN(targetDate.getTime())) return null;

  let age = targetDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = targetDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && targetDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

const isChildPassenger = (dateOfBirth: string, referenceDate?: string) => {
  const age = getAgeOnDate(dateOfBirth, referenceDate);
  return age !== null && age <= CHILD_MAX_AGE;
};

const isHoldExpiredError = (message: string) => {
  const normalized = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  return normalized.includes('HET HAN GIU CHO') || normalized.includes('HET_HAN_GIU_CHO');
};

export default function CuaSoDatTour({ tour, onClose, onSessionExpired }: BookingModalProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<any>(getStoredProfile);
  const [bookingType, setBookingType] = useState<'individual' | 'group'>('individual');
  const [numPeople, setNumPeople] = useState(1);
  const [passengers, setPassengers] = useState<PassengerData[]>([{
    name: profile.fullName || '',
    phone: profile.phone || '',
    idCard: profile.idCard || '',
    email: profile.email || '',
    dateOfBirth: profile.dateOfBirth || ''
  }]);
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedGreenActions, setSelectedGreenActions] = useState<Record<string, number>>({});
  const [selectedExtraServices, setSelectedExtraServices] = useState<Record<string, number>>({});
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [bookingNote, setBookingNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [timeRemaining, setTimeRemaining] = useState(60 * 10); // 10 phút
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQrPayment, setShowQrPayment] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(300);
  const [transferMemo, setTransferMemo] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [bookingStatus, setBookingStatus] = useState('CHO_XAC_NHAN');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [expirationNotice, setExpirationNotice] = useState<'HOLD' | 'PAYMENT' | null>(null);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        if (!hasActiveSession()) {
          onSessionExpired();
          return;
        }

        const profileResponse = await khService.layHoChieuSo();
        const mappedProfile = mapProfile(unwrapData<any>(profileResponse));
        setProfile(mappedProfile);
        localStorage.setItem('userProfile', JSON.stringify(mappedProfile));
        setPassengers(prev => prev.map((passenger, index) => index === 0 ? {
          name: mappedProfile.fullName || passenger.name || '',
          phone: mappedProfile.phone || passenger.phone || '',
          idCard: mappedProfile.idCard || passenger.idCard || '',
          email: mappedProfile.email || passenger.email || '',
          dateOfBirth: mappedProfile.dateOfBirth || passenger.dateOfBirth || ''
        } : passenger));

        const [servicesResponse, vouchersResponse] = await Promise.all([
          khService.layDichVuThem(tour.id),
          khService.getVouchers()
        ]);
        setExtraServices(unwrapPageContent<any>(servicesResponse).map(mapExtraService));
        setVouchers(unwrapPageContent<any>(vouchersResponse).map(mapVoucher));
      } catch (err) {
        console.error(err);
        if ((axios.isAxiosError(err) && err.response?.status === 401) || !hasActiveSession()) {
          onSessionExpired();
          return;
        }
        setError('Không tải được dữ liệu đặt tour từ hệ thống. Vui lòng đăng nhập lại hoặc thử lại sau.');
      }
    };

    loadBookingData();
  }, [onSessionExpired, tour.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setExpirationNotice('HOLD');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (showQrPayment && qrCountdown > 0) {
      timer = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setExpirationNotice('PAYMENT');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQrPayment, qrCountdown]);

  useEffect(() => {
    if (expirationNotice === 'PAYMENT' && createdBookingId) {
      void khService.capNhatHetHanThanhToanQr(createdBookingId).catch((err) => {
        console.error('Không thể cập nhật trạng thái hết hạn thanh toán:', err);
      });
    }
  }, [createdBookingId, expirationNotice]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const thayDoiSoLuongKhach = (num: number) => {
    if (num > tour.availableSeats) {
      setError(`Chỉ còn ${tour.availableSeats} chỗ trống! Vui lòng giảm số lượng hành khách.`);
      return;
    }

    setNumPeople(num);
    setPassengers(prev => Array(num).fill(null).map((_, idx) => (
      prev[idx] || (idx === 0 ? {
        name: profile.fullName || '',
        phone: profile.phone || '',
        idCard: profile.idCard || '',
        email: profile.email || '',
        dateOfBirth: profile.dateOfBirth || ''
      } : { ...emptyPassenger })
    )));
  };

  const thayDoiThongTinHanhKhach = (index: number, field: string, value: string) => {
    setPassengers(prev => prev.map((passenger, idx) => (
      idx === index ? { ...passenger, [field]: value } : passenger
    )));
  };

  const chonHanhDongXanh = (actionId: string) => {
    setSelectedGreenActions(prev => {
      const next = { ...prev };
      if (next[actionId]) {
        delete next[actionId];
      } else {
        next[actionId] = 1;
      }
      return next;
    });
  };

  const chonDichVuThem = (serviceId: string) => {
    setSelectedExtraServices(prev => {
      const next = { ...prev };
      if (next[serviceId]) {
        delete next[serviceId];
      } else {
        next[serviceId] = 1;
      }
      return next;
    });
  };

  const capNhatSoLuongDichVu = (serviceId: string, quantity: number) => {
    setSelectedExtraServices(prev => ({
      ...prev,
      [serviceId]: Math.max(1, quantity)
    }));
  };

  const capNhatSoLuongHanhDongXanh = (actionId: string, quantity: number) => {
    setSelectedGreenActions(prev => ({
      ...prev,
      [actionId]: Math.max(1, quantity)
    }));
  };

  const extraServicesTotal = useMemo(() => {
    return Object.entries(selectedExtraServices).reduce((sum, [id, quantity]) => {
      const service = extraServices.find(item => item.id === id);
      return sum + (service?.price || 0) * quantity;
    }, 0);
  }, [extraServices, selectedExtraServices]);

  const passengerFareSummary = useMemo(() => {
    const referenceDate = tour.departureDate || tour.startDate;
    const adultCount = passengers.filter(passenger => !isChildPassenger(passenger.dateOfBirth, referenceDate)).length;
    const childCount = passengers.length - adultCount;
    const adultSubtotal = adultCount * tour.price;
    const childSubtotal = childCount * tour.price * 0.5;

    return {
      adultCount,
      childCount,
      adultSubtotal,
      childSubtotal,
      total: adultSubtotal + childSubtotal
    };
  }, [passengers, tour.departureDate, tour.price, tour.startDate]);

  const tinhDiemXanh = () => {
    return Object.entries(selectedGreenActions).reduce((sum, [actionId, quantity]) => {
      const action = tour.greenActions.find(item => item.id === actionId);
      return sum + (action?.points || 0) * quantity;
    }, 0);
  };

  const tinhTongTien = () => {
    let total = passengerFareSummary.total + extraServicesTotal;
    if (selectedVoucher) {
      const voucher = vouchers.find(item => item.id === selectedVoucher);
      if (voucher) {
        total = voucher.discountType === 'percent'
          ? total * (1 - voucher.discount / 100)
          : total - voucher.discount;
      }
    }
    return Math.max(0, total);
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      const allFilled = passengers.every(p => p.name && p.phone && p.idCard && p.email && p.dateOfBirth);
      if (!allFilled) {
        setError('Vui lòng điền đầy đủ thông tin hành khách!');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (passengers.some(p => !emailRegex.test(p.email))) {
        setError('Vui lòng nhập email hợp lệ!');
        return;
      }

      const phoneRegex = /^[0-9]{10,11}$/;
      if (passengers.some(p => !phoneRegex.test(p.phone))) {
        setError('Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)!');
        return;
      }
    }

    setCurrentStep(prev => Math.min(3, prev + 1));
  };

  const handleBackStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const mapPaymentMethodToApi = () => {
    if (paymentMethod === 'ewallet') return 'MOMO_WALLET';
    if (paymentMethod === 'credit_card') return 'MOMO_ATM';
    return 'CHUYEN_KHOAN';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsProcessingPayment(true);

    try {
      const bookingResponse = await khService.datTour({
        maTourThucTe: tour.id,
        ghiChu: bookingNote.trim() || undefined,
        danhSachDichVu: Object.entries(selectedExtraServices).map(([id, quantity]) => ({ maDichVuThem: id, soLuong: quantity })),
        danhSachNguoiDongHanh: passengers.slice(1).map(passenger => ({
          hoTen: passenger.name.trim(),
          soDienThoai: passenger.phone.trim(),
          cccd: passenger.idCard.trim() || undefined,
          ngaySinh: passenger.dateOfBirth || undefined
        })),
        danhSachHanhDongXanhChiTiet: Object.entries(selectedGreenActions).map(([id, quantity]) => ({
          maHanhDongXanh: id,
          soLuong: quantity
        }))
      });

      const booking = unwrapData<any>(bookingResponse);
      const maDatTour = booking.maDatTour || booking.id || '';
      if (!maDatTour) {
        throw new Error('Hệ thống chưa trả về mã đặt tour. Vui lòng kiểm tra lại đơn hàng.');
      }

      if (selectedVoucher && maDatTour) {
        await khService.apVoucher(maDatTour, selectedVoucher);
      }

      if (maDatTour) {
        await khService.khoiTaoThanhToan({
          maDonDatTour: maDatTour,
          phuongThuc: mapPaymentMethodToApi()
        });
      }

      setCreatedBookingId(maDatTour);
      setTransferMemo(maDatTour);
      setBookingStatus('CHO_XAC_NHAN');
      setShowQrPayment(true);
      setQrCountdown(300);
    } catch (err: any) {
      if (err?.response?.status === 401 || !hasActiveSession()) {
        onSessionExpired();
        return;
      }
      const message = err?.response?.data?.message || err?.message || 'Đặt tour hoặc thanh toán thất bại. Vui lòng thử lại.';
      if (isHoldExpiredError(message)) {
        setExpirationNotice('HOLD');
      } else {
        setError(message);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!createdBookingId) return;

    setError('');
    setIsProcessingPayment(true);
    try {
      await khService.xacNhanDaChuyenKhoan(createdBookingId);
      setBookingStatus('CHO_XAC_NHAN');
      setShowQrPayment(false);
      setShowSuccess(true);
    } catch (err: any) {
      if (err?.response?.status === 401 || !hasActiveSession()) {
        onSessionExpired();
        return;
      }
      const message = err?.response?.data?.message || 'Không thể ghi nhận chuyển khoản. Vui lòng thử lại.';
      if (isHoldExpiredError(message) || message.toLowerCase().includes('qr đã hết hiệu lực')) {
        setExpirationNotice('PAYMENT');
      } else {
        setError(message);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSuccess = () => {
    onClose();
    navigate('/passport');
  };

  const getPaymentBrandInfo = () => {
    const totalAmount = tinhTongTien();
    switch (paymentMethod) {
      case 'ewallet':
        return {
          bg: 'from-pink-650 via-pink-600 to-rose-600',
          title: 'Ví Điện Tử MoMo (Merchant QR)',
          account: '0912345678',
          bank: 'Ví điện tử MoMo',
          primaryColor: '#A50064',
          logoText: 'MoMo',
          amount: totalAmount,
          desc: 'Quét mã MoMo để kết nối tài khoản thanh toán tự động.'
        };
      case 'credit_card':
        return {
          bg: 'from-blue-600 via-indigo-650 to-blue-750',
          title: 'Cổng thanh toán VNPAY-QR',
          account: 'VNPAY-DIGITRAVEL',
          bank: 'Cổng VNPAY (Visa/Master/ATM)',
          primaryColor: '#0055A5',
          logoText: 'VNPAY',
          amount: totalAmount,
          desc: 'Hỗ trợ quét thanh toán qua 40+ ứng dụng ngân hàng và Ví điện tử liên kết.'
        };
      case 'bank_transfer':
      default:
        return {
          bg: 'from-blue-700 via-indigo-750 to-indigo-900',
          title: 'VietQR - Ngân hàng TMCP Quân Đội (MB Bank)',
          account: '0763148344',
          bank: 'Ngân hàng Quân Đội (MB Bank)',
          primaryColor: '#0050B3',
          logoText: 'VietQR',
          qrImageUrl: 'https://img.vietqr.io/image/MB-0763148344-qr_only.png',
          amount: totalAmount,
          desc: 'Quét mã VietQR bằng ứng dụng ngân hàng của bạn để chuyển khoản 24/7 miễn phí.'
        };
    }
  };

  if (showSuccess) {
    return (
      <DatTourThanhCong
        onClose={onClose}
        xuLyThanhCong={handleSuccess}
        greenPoints={tinhDiemXanh()}
        bookingStatus={bookingStatus}
        bookingCode={createdBookingId}
      />
    );
  }

  if (expirationNotice) {
    const isPaymentExpired = expirationNotice === 'PAYMENT';
    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
        <div className="w-full max-w-sm rounded-3xl bg-white border border-amber-100 shadow-2xl p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">
            {isPaymentExpired ? 'Thời gian thanh toán đã hết' : 'Thời gian giữ chỗ đã hết'}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {isPaymentExpired
              ? 'Mã thanh toán QR đã hết hiệu lực và đơn đã hết hạn giữ chỗ. Tài khoản của bạn vẫn đang đăng nhập; vui lòng mở lại tour để đặt mới.'
              : 'Phiên đặt tour này đã hết thời gian xử lý. Tài khoản của bạn vẫn đang đăng nhập; vui lòng mở lại tour để đặt chỗ mới.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors"
          >
            Đã hiểu, quay lại tour
          </button>
        </div>
      </div>
    );
  }

  const stepsList = [
    { step: 1, name: 'Thông tin hành khách' },
    { step: 2, name: 'Dịch vụ thêm & Hành động xanh' },
    { step: 3, name: 'Thanh toán & Xác nhận' }
  ];
  const brand = getPaymentBrandInfo();

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 overflow-hidden animate-fadeIn">
      <div className="bg-[#f0f4f9] rounded-[2.5rem] max-w-6xl w-full relative shadow-2xl overflow-hidden border border-slate-200/40 flex flex-col h-[calc(100dvh-1.5rem)] sm:h-[92dvh]">
        <div className="shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 px-6 sm:px-8 py-5 relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all active:scale-95 z-20"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {showQrPayment ? (
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-100 uppercase tracking-widest bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/20">
                  Cổng Thanh toán Trực tuyến
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Quét Mã QR Thanh Toán
                </h2>
                <p className="text-xs text-blue-100/90 font-medium">
                  Vui lòng không đóng cửa sổ này trước khi giao dịch được xác thực.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full">
                  Hệ thống đăng ký Tour Trực Tuyến
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  {tour.name}
                </h2>
                <p className="text-xs text-blue-100/90 font-medium flex items-center space-x-2">
                  <span>{tour.destination}</span>
                  <span>•</span>
                  <span className="bg-yellow-400 text-slate-900 font-extrabold px-2 py-0.5 rounded text-[10px]">{tour.duration}</span>
                </p>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center space-x-2 shadow-inner self-start sm:self-center">
              <Clock className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="font-extrabold text-xs text-white tracking-widest font-mono">
                {formatTime(showQrPayment ? qrCountdown : timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white border-b border-slate-100 px-6 sm:px-8 pt-4 pb-4 overflow-x-auto scrollbar-none">
          <div className="relative grid grid-cols-3 min-w-[620px] max-w-4xl mx-auto">
            <div className="absolute left-[16.666%] right-[16.666%] top-4 h-0.5 bg-slate-100" />
            <div
              className="absolute left-[16.666%] top-4 h-0.5 bg-green-500 transition-all duration-500"
              style={{ width: `${Math.max(0, currentStep - 1) * 33.333}%` }}
            />
            {stepsList.map((s) => {
              const isActive = s.step === currentStep;
              const isCompleted = s.step < currentStep;
              return (
                <div key={s.step} className="relative flex flex-col items-center text-center px-3">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 scale-110'
                    : isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                    {isCompleted ? '✓' : s.step}
                  </div>
                  <span className={`mt-3 text-xs font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f0f4f9] scrollbar-thin">
          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {showQrPayment ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center relative overflow-hidden">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 text-white text-xs font-black uppercase tracking-wider rounded-2xl mb-5 bg-gradient-to-r shadow-md ${brand.bg}`}>
                    <span>{brand.logoText}</span>
                  </div>

                  <div className="relative bg-white p-4.5 rounded-[1.8rem] w-64 h-64 border-4 border-slate-100 shadow-inner flex items-center justify-center overflow-hidden mb-4 group transition-all hover:scale-[1.02]">
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500 animate-scan z-10" />
                    {brand.qrImageUrl ? (
                      <img
                        src={brand.qrImageUrl}
                        alt="VietQR MB Bank 0763148344"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill={brand.primaryColor}>
                        <rect x="5" y="5" width="22" height="22" rx="2" fill={brand.primaryColor} />
                        <rect x="9" y="9" width="14" height="14" rx="1" fill="white" />
                        <rect x="12" y="12" width="8" height="8" rx="0.5" fill={brand.primaryColor} />
                        <rect x="73" y="5" width="22" height="22" rx="2" fill={brand.primaryColor} />
                        <rect x="77" y="9" width="14" height="14" rx="1" fill="white" />
                        <rect x="80" y="12" width="8" height="8" rx="0.5" fill={brand.primaryColor} />
                        <rect x="5" y="73" width="22" height="22" rx="2" fill={brand.primaryColor} />
                        <rect x="9" y="77" width="14" height="14" rx="1" fill="white" />
                        <rect x="12" y="80" width="8" height="8" rx="0.5" fill={brand.primaryColor} />
                        <rect x="32" y="7" width="6" height="6" />
                        <rect x="42" y="12" width="8" height="4" />
                        <rect x="54" y="6" width="4" height="8" />
                        <rect x="35" y="35" width="30" height="30" fill={brand.primaryColor} opacity="0.08" />
                        <circle cx="50" cy="50" r="14" fill="white" stroke={brand.primaryColor} strokeWidth="1.5" />
                        <text x="50" y="52.2" fontSize="5.5" fontWeight="950" textAnchor="middle" fill={brand.primaryColor}>
                          {brand.logoText}
                        </text>
                        <rect x="35" y="75" width="8" height="8" />
                        <rect x="47" y="82" width="12" height="4" />
                        <rect x="63" y="76" width="6" height="8" />
                        <rect x="78" y="78" width="12" height="12" fill={brand.primaryColor} />
                        <rect x="82" y="82" width="4" height="4" fill="white" />
                      </svg>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 font-bold max-w-xs leading-relaxed">
                    {brand.desc}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center space-x-3 text-left">
                  <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <span className="text-[10px] text-slate-650 leading-normal font-medium">
                    Giao dịch được mã hóa an toàn 256-bit theo tiêu chuẩn bảo mật ngân hàng quốc tế.
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-5">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Thông Tin Chuyển Khoản Chi Tiết
                  </h3>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số tiền chuyển khoản</span>
                    <p className="text-3xl font-black text-blue-600 tracking-tight">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(brand.amount)}
                    </p>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {[
                      { label: 'Ngân hàng / Đơn vị thụ hưởng', val: brand.bank, key: 'bank', copy: false },
                      { label: 'Số tài khoản / Số điện thoại', val: brand.account, key: 'account', copy: true },
                      { label: 'Tên người nhận', val: 'CONG TY CO PHAN DIGITAL TRAVEL ERP', key: 'name', copy: false },
                      { label: 'Nội dung chuyển khoản (Memo)', val: transferMemo, key: 'memo', copy: true }
                    ].map((row) => (
                      <div key={row.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-150/40 gap-2 transition-all">
                        <div className="space-y-0.5">
                          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">{row.label}</span>
                          <span className="block font-bold text-slate-800 text-sm tracking-tight">{row.val}</span>
                        </div>
                        {row.copy && (
                          <button
                            type="button"
                            onClick={() => handleCopy(row.val, row.key)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-extrabold self-start sm:self-center transition-all ${copiedField === row.key
                              ? 'bg-green-500 border-green-500 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100 hover:text-slate-800'
                              }`}
                          >
                            {copiedField === row.key ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đã sao chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-50/60 border border-yellow-250 p-4 rounded-xl text-left space-y-1">
                    <p className="text-[10px] font-black text-yellow-800 uppercase tracking-widest">Lưu ý quan trọng</p>
                    <p className="text-[10px] text-yellow-750 font-medium leading-relaxed">
                      Bạn vui lòng giữ đúng số tiền chuyển khoản và nội dung chuyển khoản được tạo tự động phía trên để hệ thống ERP ghi nhận và đối soát.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="booking-wizard-form">
              {currentStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6 animate-slideIn">
                    <BieuMauHanhKhach
                      passengers={passengers}
                      thayDoiThongTinHanhKhach={thayDoiThongTinHanhKhach}
                      bookingType={bookingType}
                      setBookingType={setBookingType}
                      numPeople={numPeople}
                      thayDoiSoLuongKhach={thayDoiSoLuongKhach}
                      availableSeats={tour.availableSeats}
                      bookingNote={bookingNote}
                      setBookingNote={setBookingNote}
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <TongKetDonHang
                      tour={tour}
                      numPeople={numPeople}
                      selectedVoucher={selectedVoucher}
                      setSelectedVoucher={setSelectedVoucher}
                      tinhTongTien={tinhTongTien}
                      tinhDiemXanh={tinhDiemXanh}
                      extraServicesTotal={extraServicesTotal}
                      passengerFareSummary={passengerFareSummary}
                      currentStep={currentStep}
                      vouchers={vouchers}
                      onNextStep={handleNextStep}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6 animate-slideIn">
                    <ChonDichVuThem
                      extraServices={extraServices}
                      selectedServices={selectedExtraServices}
                      chonDichVuThem={chonDichVuThem}
                      capNhatSoLuongDichVu={capNhatSoLuongDichVu}
                    />
                    <ChonHanhDongXanh
                      greenActions={tour.greenActions}
                      selectedGreenActions={selectedGreenActions}
                      chonHanhDongXanh={chonHanhDongXanh}
                      capNhatSoLuongHanhDongXanh={capNhatSoLuongHanhDongXanh}
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <TongKetDonHang
                      tour={tour}
                      numPeople={numPeople}
                      selectedVoucher={selectedVoucher}
                      setSelectedVoucher={setSelectedVoucher}
                      tinhTongTien={tinhTongTien}
                      tinhDiemXanh={tinhDiemXanh}
                      extraServicesTotal={extraServicesTotal}
                      passengerFareSummary={passengerFareSummary}
                      currentStep={currentStep}
                      vouchers={vouchers}
                      onNextStep={handleNextStep}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6 animate-slideIn">
                    <ChonPhuongThucThanhToan
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                    />

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start space-x-4">
                      <ShieldCheck className="w-8 h-8 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-800 text-sm">Cổng thanh toán Bảo mật Hàng đầu</span>
                        <span className="block text-xs text-slate-500 leading-relaxed">
                          Thông tin cá nhân và tài khoản của bạn được mã hóa hoàn toàn theo tiêu chuẩn SSL quốc tế. Cam kết hoàn tiền nhanh theo chính sách Digital Travel.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <TongKetDonHang
                      tour={tour}
                      numPeople={numPeople}
                      selectedVoucher={selectedVoucher}
                      setSelectedVoucher={setSelectedVoucher}
                      tinhTongTien={tinhTongTien}
                      tinhDiemXanh={tinhDiemXanh}
                      extraServicesTotal={extraServicesTotal}
                      passengerFareSummary={passengerFareSummary}
                      currentStep={currentStep}
                      vouchers={vouchers}
                      isProcessingPayment={isProcessingPayment}
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="shrink-0 bg-slate-50 border-t border-slate-150 px-6 sm:px-8 py-4.5 flex items-center justify-between rounded-b-[2.5rem] z-10 shadow-inner">
          {showQrPayment ? (
            <>
              <button
                type="button"
                onClick={() => setShowQrPayment(false)}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại sửa thông tin</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={isProcessingPayment}
                className="flex items-center space-x-1.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl active:scale-95 transition-all text-xs font-black shadow-md shadow-green-500/20"
              >
                <ShieldCheck className="w-4 h-4 text-green-200 animate-pulse" />
                <span>Tôi đã chuyển khoản thành công</span>
              </button>
            </>
          ) : (
            <>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-xs font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại sửa thông tin</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-xs font-bold"
                >
                  <span>Hủy bỏ</span>
                </button>
              )}

              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">
                Giao dịch mã hóa an toàn SSL 256-bit
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
