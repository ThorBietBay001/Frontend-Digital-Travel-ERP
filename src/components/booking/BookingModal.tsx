import { useState, useEffect } from 'react';
import { X, Clock, ChevronLeft, ShieldCheck, Copy, Check, Lock, ExternalLink } from 'lucide-react';
import { type Tour, mockVouchers, mockUserProfile, mockBookings } from '../../data/mockData';
import { useNavigate } from 'react-router';

import PassengerForm, { type PassengerData } from './PassengerForm';
import GreenActionSelection from './GreenActionSelection';
import ExtraServicesSelection, { type ExtraService } from './ExtraServicesSelection';
import PaymentMethodSelection from './PaymentMethodSelection';
import OrderSummary from './OrderSummary';
import BookingSuccess from './BookingSuccess';

const mockExtraServices: ExtraService[] = [
  { id: 'es1', title: 'Xe đưa đón tận nơi (2 chiều)', price: 450000, description: 'Xe riêng đón tiễn từ nhà đến điểm tập trung khởi hành' },
  { id: 'es2', title: 'Gói bảo hiểm du lịch VIP', price: 150000, description: 'Nâng cấp mức bồi thường bảo hiểm lên 1 tỷ VNĐ' },
  { id: 'es3', title: 'Bữa ăn chay/Kiêng đặc biệt', price: 0, description: 'Phục vụ thực đơn chay hoặc kiêng theo yêu cầu y tế' }
];

interface BookingModalProps {
  tour: Tour;
  onClose: () => void;
}

export default function BookingModal({ tour, onClose }: BookingModalProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Load dynamic profile from localStorage
  const [profile] = useState(() => {
    const stored = localStorage.getItem('userProfile');
    return stored ? JSON.parse(stored) : mockUserProfile;
  });

  const [bookingType, setBookingType] = useState<'individual' | 'group'>('individual');
  const [numPeople, setNumPeople] = useState(1);
  
  // Pre-fill Passenger 1 from the Digital Passport profile (UC27 step 5)
  const [passengers, setPassengers] = useState<PassengerData[]>([
    {
      name: profile.fullName || '',
      phone: profile.phone || '',
      idCard: profile.idCard || '',
      email: profile.email || '',
      dateOfBirth: profile.dateOfBirth || ''
    }
  ]);
  
  const [selectedGreenActions, setSelectedGreenActions] = useState<string[]>([]);
  const [selectedExtraServices, setSelectedExtraServices] = useState<string[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQrPayment, setShowQrPayment] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(300); // 5 minutes
  const [transferMemo, setTransferMemo] = useState('');
  const [createdQrCode, setCreatedQrCode] = useState('');
  const [bookingStatus, setBookingStatus] = useState('upcoming');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Green points deduction state (UC29 luồng phụ 1a)
  const [useGreenPoints, setUseGreenPoints] = useState(false);
  const greenPointsDiscount = profile.greenPoints * 500; // 1 point = 500đ

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Hết thời gian giữ chỗ! Vui lòng đặt lại.');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  useEffect(() => {
    let timer: any;
    if (showQrPayment && qrCountdown > 0) {
      timer = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            alert('Giao dịch thanh toán bằng mã QR đã hết hạn! Vui lòng thực hiện lại.');
            setShowQrPayment(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQrPayment, qrCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatQrTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleGroupSizeChange = (num: number) => {
    if (num > tour.availableSeats) {
      alert(`Chỉ còn ${tour.availableSeats} chỗ trống!`);
      return;
    }
    setNumPeople(num);
    const newPassengers = Array(num).fill(null).map((_, idx) => (
      passengers[idx] || (idx === 0 ? {
        name: profile.fullName || '',
        phone: profile.phone || '',
        idCard: profile.idCard || '',
        email: profile.email || '',
        dateOfBirth: profile.dateOfBirth || ''
      } : { name: '', phone: '', idCard: '', email: '', dateOfBirth: '' })
    ));
    setPassengers(newPassengers);
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const toggleGreenAction = (actionId: string) => {
    setSelectedGreenActions(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const toggleService = (serviceId: string) => {
    setSelectedExtraServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const extraServicesTotal = selectedExtraServices.reduce((sum, id) => {
    const service = mockExtraServices.find(s => s.id === id);
    return sum + (service?.price || 0);
  }, 0);

  const calculateTotal = () => {
    let total = tour.price * numPeople + extraServicesTotal;

    if (selectedVoucher) {
      const storedVouchers = localStorage.getItem('vouchers');
      const vouchers = storedVouchers ? JSON.parse(storedVouchers) : mockVouchers;
      const voucher = vouchers.find((v: any) => v.id === selectedVoucher);
      if (voucher) {
        if (voucher.discountType === 'percentage') {
          total = total * (1 - voucher.discount / 100);
        } else {
          total = total - voucher.discount;
        }
      }
    }

    return total;
  };

  const calculateGreenPoints = () => {
    return selectedGreenActions.reduce((sum, actionId) => {
      const action = tour.greenActions.find(a => a.id === actionId);
      return sum + (action?.points || 0);
    }, 0);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate passenger info
      const allFilled = passengers.every(p => p.name && p.phone && p.idCard && p.email);
      if (!allFilled) {
        alert('Vui lòng điền đầy đủ thông tin hành khách!');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmail = passengers.find(p => !emailRegex.test(p.email));
      if (invalidEmail) {
        alert('Vui lòng nhập email hợp lệ!');
        return;
      }

      // Validate phone format
      const phoneRegex = /^[0-9]{10,11}$/;
      const invalidPhone = passengers.find(p => !phoneRegex.test(p.phone));
      if (invalidPhone) {
        alert('Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)!');
        return;
      }
    }
    setCurrentStep(prev => Math.min(3, prev + 1));
  };

  const handleBackStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessingPayment(true);

    const memo = `DDT${Math.floor(100000 + Math.random() * 900000)}`;
    const qr = `QR-${tour.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    
    setTransferMemo(memo);
    setCreatedQrCode(qr);

    // Simulate redirection/processing to show QR code screen
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowQrPayment(true);
      setQrCountdown(300); // Reset timer to 5 minutes
    }, 1200);
  };

  const handleConfirmTransfer = () => {
    // Save new booking to localStorage with status CHO_XAC_NHAN
    const storedBookings = localStorage.getItem('bookings');
    const currentBookings = storedBookings ? JSON.parse(storedBookings) : mockBookings;
    
    const netPaidAmount = Math.max(0, calculateTotal() - (useGreenPoints ? greenPointsDiscount : 0));
    
    const actualQrCode = createdQrCode || `QR-${tour.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    
    const newBooking = {
      id: `book-${Date.now()}`,
      tourId: tour.id,
      tourName: tour.name,
      tourImage: tour.image,
      departureDate: tour.departureDate,
      status: 'CHO_XAC_NHAN',
      totalAmount: netPaidAmount,
      passengers: numPeople,
      qrCode: actualQrCode,
      bookingDate: new Date().toISOString().split('T')[0]
    };

    const updatedBookings = [newBooking, ...currentBookings];
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));

    // Update user green points in localStorage
    let updatedPoints = profile.greenPoints;
    if (useGreenPoints) {
      updatedPoints = 0; // deducted all points
    }
    updatedPoints += calculateGreenPoints(); // award green points

    // Update membership tier based on greenPoints
    let newTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
    if (updatedPoints >= 50000) {
      newTier = 'Platinum';
    } else if (updatedPoints >= 20000) {
      newTier = 'Gold';
    } else if (updatedPoints >= 5000) {
      newTier = 'Silver';
    } else {
      newTier = 'Bronze';
    }

    const updatedProfile = {
      ...profile,
      greenPoints: updatedPoints,
      membershipTier: newTier
    };
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

    // Mark the voucher as used if one was selected
    if (selectedVoucher) {
      const storedVouchers = localStorage.getItem('vouchers');
      const vouchers = storedVouchers ? JSON.parse(storedVouchers) : mockVouchers;
      const updatedVouchers = vouchers.map((v: any) => 
        v.id === selectedVoucher ? { ...v, status: 'used' } : v
      );
      localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
    }

    setBookingStatus('CHO_XAC_NHAN');
    setShowSuccess(true);
  };

  const handleSuccess = () => {
    onClose();
    navigate('/passport');
  };

  if (showSuccess) {
    return (
      <BookingSuccess
        tour={tour}
        onClose={onClose}
        handleSuccess={handleSuccess}
        greenPoints={calculateGreenPoints()}
        bookingStatus={bookingStatus}
        qrCode={createdQrCode}
      />
    );
  }

  const getPaymentBrandInfo = () => {
    const totalAmount = Math.max(0, calculateTotal() - (useGreenPoints ? greenPointsDiscount : 0));
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
          account: '0349888888',
          bank: 'Ngân hàng Quân Đội (MB Bank)',
          primaryColor: '#0050B3',
          logoText: 'VietQR',
          amount: totalAmount,
          desc: 'Quét mã VietQR bằng ứng dụng ngân hàng của bạn để chuyển khoản 24/7 miễn phí.'
        };
    }
  };

  const stepsList = [
    { step: 1, name: 'Thông tin hành khách' },
    { step: 2, name: 'Dịch vụ thêm & Hành động xanh' },
    { step: 3, name: 'Thanh toán & Xác nhận' }
  ];

  const brand = getPaymentBrandInfo();

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#f0f4f9] rounded-[2.5rem] max-w-6xl w-full my-4 relative shadow-2xl overflow-hidden border border-slate-200/40 flex flex-col max-h-[92vh]">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 px-6 sm:px-8 py-5 relative">
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
                <p className="text-xs text-blue-100/90 font-medium flex items-center space-x-2">
                  <span>Vui lòng không đóng cửa sổ này trước khi giao dịch được xác thực.</span>
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

            {/* Glowing Timer */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center space-x-2 shadow-inner self-start sm:self-center">
              <Clock className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="font-extrabold text-xs text-white tracking-widest font-mono">
                {showQrPayment ? formatQrTime(qrCountdown) : formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Wizard Steps Progress Tracker (Hidden during QR Payment step) */}
        {!showQrPayment && (
          <div className="bg-white border-b border-slate-100 px-6 sm:px-8 py-4 overflow-x-auto whitespace-nowrap scrollbar-none">
            <div className="flex items-center justify-between min-w-[320px] max-w-xl mx-auto">
              {stepsList.map((s, idx) => {
                const isActive = s.step === currentStep;
                const isCompleted = s.step < currentStep;
                return (
                  <div key={s.step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${
                        isActive
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 scale-110'
                          : isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : s.step}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${
                        isActive ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                        {s.name}
                      </span>
                    </div>
                    {idx < stepsList.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 min-w-[50px] rounded-full transition-colors duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-100'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Main Content (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f0f4f9] scrollbar-thin">
          {showQrPayment ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              {/* Left Column: QR Code scanning card */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center relative overflow-hidden">

                  {/* Brand Header Label - clear and prominent */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 text-white text-xs font-black uppercase tracking-wider rounded-2xl mb-5 bg-gradient-to-r shadow-md ${brand.bg}`}>
                    <span className="text-base leading-none">
                      {brand.logoText === 'MoMo' ? '💜' : brand.logoText === 'VNPAY' ? '🏦' : '🏧'}
                    </span>
                    <span>{brand.title}</span>
                  </div>

                  {/* Simulated interactive premium QR box */}
                  <div className="relative bg-white p-4.5 rounded-[1.8rem] w-64 h-64 border-4 border-slate-100 shadow-inner flex items-center justify-center overflow-hidden mb-4 group transition-all hover:scale-[1.02]">
                    {/* Laser scanning micro-animation line */}
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500 animate-scan z-10" />
                    
                    {/* Dynamic styled QR Code SVG */}
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

                      {/* Small mock data dots */}
                      <rect x="32" y="7" width="6" height="6" />
                      <rect x="42" y="12" width="8" height="4" />
                      <rect x="54" y="6" width="4" height="8" />
                      <rect x="62" y="14" width="6" height="4" />
                      
                      <rect x="7" y="32" width="6" height="6" />
                      <rect x="15" y="42" width="4" height="8" />
                      <rect x="6" y="54" width="8" height="4" />
                      <rect x="14" y="62" width="4" height="6" />

                      <rect x="32" y="32" width="36" height="36" rx="4" fill="white" className="shadow-sm" />
                      <rect x="35" y="35" width="30" height="30" fill={brand.primaryColor} opacity="0.08" />
                      
                      {/* Mini brand badge inside center of QR */}
                      <circle cx="50" cy="50" r="14" fill="white" stroke={brand.primaryColor} strokeWidth="1.5" />
                      <text x="50" y="52.2" fontSize="5.5" fontWeight="950" textAnchor="middle" fill={brand.primaryColor} letterSpacing="-0.2">
                        {brand.logoText}
                      </text>

                      <rect x="35" y="75" width="8" height="8" />
                      <rect x="47" y="82" width="12" height="4" />
                      <rect x="63" y="76" width="6" height="8" />
                      <rect x="74" y="74" width="20" height="20" rx="1" fill={brand.primaryColor} opacity="0.15" />
                      <rect x="78" y="78" width="12" height="12" fill={brand.primaryColor} />
                      <rect x="82" y="82" width="4" height="4" fill="white" />
                    </svg>
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

              {/* Right Column: Transfer instructions details */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-5">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Thông Tin Chuyển Khoản Chi Tiết
                  </h3>

                  {/* Pricing Display */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số tiền chuyển khoản</span>
                    <p className="text-3xl font-black text-blue-600 tracking-tight">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(brand.amount)}
                    </p>
                  </div>

                  {/* Transfer Details Rows */}
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
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-extrabold self-start sm:self-center transition-all ${
                              copiedField === row.key
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

                  {/* Step Warning Note */}
                  <div className="bg-yellow-50/60 border border-yellow-250 p-4 rounded-xl text-left space-y-1">
                    <p className="text-[10px] font-black text-yellow-800 uppercase tracking-widest">Lưu ý quan trọng</p>
                    <p className="text-[10px] text-yellow-750 font-medium leading-relaxed">
                      Bạn vui lòng giữ đúng số tiền chuyển khoản và **Nội dung chuyển khoản (Memo)** được tạo tự động phía trên để hệ thống ERP của chúng tôi ghi nhận và đối soát lập tức tự động khi nhận biến động số dư.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <form onSubmit={handleSubmit} id="booking-wizard-form">
              {currentStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Form fields column */}
                  <div className="lg:col-span-2 space-y-6 animate-slideIn">
                    <PassengerForm
                      passengers={passengers}
                      handlePassengerChange={handlePassengerChange}
                      bookingType={bookingType}
                      setBookingType={setBookingType}
                      numPeople={numPeople}
                      handleGroupSizeChange={handleGroupSizeChange}
                      availableSeats={tour.availableSeats}
                    />
                  </div>

                  {/* Subtotal Order Summary Receipt Sidepanel */}
                  <div className="lg:col-span-1">
                    <OrderSummary
                      tour={tour}
                      numPeople={numPeople}
                      selectedVoucher={selectedVoucher}
                      setSelectedVoucher={setSelectedVoucher}
                      calculateTotal={calculateTotal}
                      calculateGreenPoints={calculateGreenPoints}
                      useGreenPoints={useGreenPoints}
                      setUseGreenPoints={setUseGreenPoints}
                      userGreenPoints={profile.greenPoints}
                      greenPointsDiscount={greenPointsDiscount}
                      extraServicesTotal={extraServicesTotal}
                      currentStep={currentStep}
                      onNextStep={handleNextStep}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6 animate-slideIn">
                    <ExtraServicesSelection
                      extraServices={mockExtraServices}
                      selectedServices={selectedExtraServices}
                      toggleService={toggleService}
                    />
                    <GreenActionSelection
                      greenActions={tour.greenActions}
                      selectedGreenActions={selectedGreenActions}
                      toggleGreenAction={toggleGreenAction}
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <OrderSummary
                      tour={tour}
                      numPeople={numPeople}
                      selectedVoucher={selectedVoucher}
                      setSelectedVoucher={setSelectedVoucher}
                      calculateTotal={calculateTotal}
                      calculateGreenPoints={calculateGreenPoints}
                      useGreenPoints={useGreenPoints}
                      setUseGreenPoints={setUseGreenPoints}
                      userGreenPoints={profile.greenPoints}
                      greenPointsDiscount={greenPointsDiscount}
                      extraServicesTotal={extraServicesTotal}
                      currentStep={currentStep}
                      onNextStep={handleNextStep}
                    />
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                // Step 2: Advanced Payment Method selection & Vouchers checkout Columns
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Payment selection left side */}
                  <div className="lg:col-span-2 space-y-6 animate-slideIn">
                    <PaymentMethodSelection
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                    />
                    
                    {/* Visual Security Badge */}
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

                  {/* Final Order Summary right side */}
                  <div className="lg:col-span-1">
                    <OrderSummary
                      tour={tour}
                      numPeople={numPeople}
                      selectedVoucher={selectedVoucher}
                      setSelectedVoucher={setSelectedVoucher}
                      calculateTotal={calculateTotal}
                      calculateGreenPoints={calculateGreenPoints}
                      useGreenPoints={useGreenPoints}
                      setUseGreenPoints={setUseGreenPoints}
                      userGreenPoints={profile.greenPoints}
                      greenPointsDiscount={greenPointsDiscount}
                      extraServicesTotal={extraServicesTotal}
                      currentStep={currentStep}
                      isProcessingPayment={isProcessingPayment}
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Wizard Step Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-150 px-6 sm:px-8 py-4.5 flex items-center justify-between rounded-b-[2.5rem] z-10 shadow-inner">
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
