import { useState, useEffect } from 'react';
import {
  User, Calendar, Wallet,
  MapPin, Star, Clock, CreditCard,
  Phone, Edit, Gift, Ticket, X, Check, Bell,
  AlertTriangle, ShieldAlert, FileText, MessageSquare, ArrowRight, CheckCircle, ChevronDown, Search
} from 'lucide-react';
import { khService } from '../services/khService';
import {
  mapBooking,
  mapProfile,
  mapPublicTour,
  mapVoucher,
  unwrapData,
  unwrapPageContent
} from '../services/apiHelpers';
import type { Booking, Voucher } from '../types';
import { Link } from 'react-router';

type Tab = 'profile' | 'bookings' | 'vouchers' | 'complaints';
type BookingFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

interface ComplaintTicket {
  id: string;
  bookingId: string;
  tourName: string;
  category: string;
  subject: string;
  content: string;
  status: 'CHUA_XU_LY' | 'CHO_BO_SUNG' | 'CHO_GIAI_TRINH' | 'DA_XU_LY' | 'TU_CHOI';
  createdAt: string;
  updatedAt: string;
  history: string[];
}

export default function HoChieuSo() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<any>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    membershipTier: 'THANH_VIEN',
    greenPoints: 0,
    dateOfBirth: '',
    idCard: '',
    passport: '',
    healthInfo: '',
    allergies: ''
  });

  const [editedProfile, setEditedProfile] = useState<any>(profile);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [redeemableVouchers, setRedeemableVouchers] = useState<Voucher[]>([]);
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [allTours, setAllTours] = useState<any[]>([]);

  // Modal control states
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedVoucherForUse, setSelectedVoucherForUse] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, bookingsRes, pastToursRes, vouchersRes, redeemableVouchersRes, toursRes, complaintsRes] = await Promise.all([
          khService.layHoChieuSo().catch(() => ({ data: null })),
          khService.getMyBookings().catch(() => ({ data: { content: [] } })),
          khService.getPastTours().catch(() => ({ data: { content: [] } })),
          khService.getVouchers().catch(() => ({ data: { content: [] } })),
          khService.getRedeemableVouchers().catch(() => ({ data: { content: [] } })),
          khService.layDanhSachTour().catch(() => ({ data: [] })),
          khService.layYeuCauHoTro().catch(() => ({ data: { content: [] } }))
        ]);

        const profileData = unwrapData(profileRes);
        if (profileData) {
          const loadedProfile = mapProfile(profileData);
          setProfile(loadedProfile);
          setEditedProfile(loadedProfile);
        }

        const activeBks = unwrapPageContent(bookingsRes).map(mapBooking);
        const pastBks = unwrapPageContent(pastToursRes).map((b: any) => ({
          id: b.maLichSuTour,
          tourId: b.maTourThucTe,
          tourName: b.tieuDeTour,
          bookingDate: b.ngayThamGia,
          departureDate: b.ngayKhoiHanh,
          totalAmount: 0,
          status: 'completed' as const,
          guests: 1,
          passengers: 1,
          tourImage: `https://picsum.photos/seed/${b.maTourThucTe}/900/650`,
          qrCode: `QR-${b.maLichSuTour}`
        }));

        setBookings([...activeBks, ...pastBks]);
        setVouchers(unwrapPageContent(vouchersRes).map(mapVoucher));
        setRedeemableVouchers(unwrapPageContent(redeemableVouchersRes).map(mapVoucher));
        setAllTours(unwrapPageContent(toursRes).map(mapPublicTour));
        setComplaints(unwrapPageContent(complaintsRes).map((c: any) => ({
          id: c.maYeuCau,
          bookingId: c.maDatTour || '',
          tourName: c.maDatTour || 'Đơn đặt tour',
          category: c.loaiYeuCau === 'KHIEU_NAI' ? 'Khiếu nại' : c.loaiYeuCau === 'HOAN_TIEN' ? 'Hoàn tiền' : 'Hỗ trợ',
          subject: c.loaiYeuCau || 'Yêu cầu hỗ trợ',
          content: c.noiDung || '',
          status: c.trangThai || 'CHUA_XU_LY',
          createdAt: '',
          updatedAt: '',
          history: [`Trạng thái hiện tại: ${c.trangThai || 'CHUA_XU_LY'}`]
        })));
      } catch (err) {
        console.error("Failed to load digital passport data:", err);
      }
    };
    fetchData();
  }, []);

  // Custom OTP verification modal states (UC23)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);

  // Booking detail modal (UC22)
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  // Tour cancellation flow (UC32)
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationPenalty, setCancellationPenalty] = useState({ percent: 0, amount: 0, refund: 0 });

  // Tour review flow (UC35)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>([]);

  // Tour complaint flow (UC36)
  const [selectedBookingForComplaint, setSelectedBookingForComplaint] = useState<Booking | null>(null);
  const [complaintCategory, setComplaintCategory] = useState('Hướng dẫn viên');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintContent, setComplaintContent] = useState('');
  const [complaintFileName, setComplaintFileName] = useState('');

  // UC60: Change password flow
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Toast notification system
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const layThongBaoLoi = (err: any, fallback: string) => {
    return err?.response?.data?.message || err?.message || fallback;
  };

  const taiLaiHoSo = async () => {
    const profileResponse = await khService.layHoChieuSo();
    const loadedProfile = mapProfile(unwrapData<any>(profileResponse));
    setProfile(loadedProfile);
    setEditedProfile(loadedProfile);
    localStorage.setItem('userProfile', JSON.stringify(loadedProfile));
    return loadedProfile;
  };


  // Sync logic removed because we fetch from API

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (showOtpModal && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, otpCountdown]);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // UC23: Triggers OTP verification modal
  const handleSaveProfile = () => {
    setShowOtpModal(true);
    setOtpValue(['', '', '', '', '', '']);
    setOtpError('');
    setOtpCountdown(60);
  };

  // Verify OTP (standard code is 123456)
  const handleVerifyOtp = async () => {
    const enteredCode = otpValue.join('');
    if (enteredCode === '123456') {
      try {
        const response = await khService.capNhatHoSo({
          cccd: editedProfile.idCard,
          tenDangNhap: editedProfile.username,
          email: editedProfile.email,
          soDienThoai: editedProfile.phone,
          diUng: editedProfile.allergies,
          ghiChuYTe: editedProfile.healthInfo
        });
        const updatedProfile = mapProfile(unwrapData<any>(response));
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        setIsEditing(false);
        setShowOtpModal(false);
      setToast({ message: 'Cập nhật hồ sơ thành công!', type: 'success' });
      } catch (err: any) {
        setOtpError(layThongBaoLoi(err, 'Không thể cập nhật hồ sơ. Vui lòng thử lại.'));
      }
    } else {
      setOtpError('Mã OTP không chính xác. Vui lòng nhập "123456" để mô phỏng thành công!');
    }
  };

  const handleResendOtp = () => {
    setOtpCountdown(60);
    setOtpValue(['', '', '', '', '', '']);
    setOtpError('');
    setToast({ message: 'Mã OTP mới đã được gửi lại vào số điện thoại của bạn!', type: 'info' });
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      await khService.doiMatKhau({
        matKhauCu: currentPassword,
        matKhauMoi: newPassword,
        xacNhanMatKhau: confirmNewPassword
      });
      setPasswordError('');
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setToast({ message: 'Đổi mật khẩu thành công!', type: 'success' });
    } catch (err: any) {
      setPasswordError(layThongBaoLoi(err, 'Không thể đổi mật khẩu. Vui lòng thử lại.'));
    }
  };

  const layMauHangThanhVien = (tier: string) => {
    switch (tier) {
      case 'KIM_CUONG':
      case 'Platinum': return 'text-purple-600 bg-purple-100 border border-purple-300';
      case 'VANG':
      case 'VANG':
      case 'Gold': return 'text-yellow-700 bg-yellow-100 border border-yellow-300';
      case 'BAC':
      case 'BAC':
      case 'Silver': return 'text-gray-600 bg-gray-100 border border-gray-300';
      default: return 'text-orange-600 bg-orange-100 border border-orange-300';
    }
  };

  const layTenHangThanhVienVi = (tier: string) => {
    switch (tier) {
      case 'KIM_CUONG': return 'Kim Cương';
      case 'Platinum': return 'Bạch Kim';
      case 'Gold': return 'Vàng';
      case 'Silver': return 'Bạc';
      case 'DONG': return 'Đồng';
      default: return 'Thành Viên';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Sắp khởi hành</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Đã hoàn thành</span>;
      case 'cancelled':
      case 'DA_HUY':
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">Đã hủy</span>;
      case 'CHO_XAC_NHAN':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200/60 flex items-center space-x-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Chờ xác nhận</span>
          </span>
        );
      case 'DA_XAC_NHAN':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200/60">Đã xác nhận</span>;
      case 'CHO_HUY':
        return <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200/60">Chờ hủy</span>;
      case 'TU_CHOI_HOAN_TIEN':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">Từ chối hoàn tiền</span>;
      case 'HET_HAN_GIU_CHO':
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">Hết hạn giữ chỗ</span>;
      case 'THANH_TOAN_THAT_BAI':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Thanh toán thất bại</span>;
      default:
        return null;
    }
  };

  // UC30: Redeem Green Points for Voucher
  const tinhDiemCanDoiVoucher = (voucher: Voucher) => {
    return voucher.discountType === 'fixed'
      ? Math.ceil(voucher.discount / 100)
      : voucher.discount * 50;
  };

  const handleRedeemPoints = async (voucher: any, pointsRequired: number) => {
    if (profile.greenPoints < pointsRequired) {
      setToast({ message: 'Không đủ điểm xanh để quy đổi voucher này!', type: 'error' });
      return;
    }

    // Deduct points
    try {
      const response = await khService.doiVoucher(voucher.id);
      const newVoucher = mapVoucher(unwrapData<any>(response));
      await taiLaiHoSo();

      setVouchers(prev => [newVoucher, ...prev.filter(v => v.id !== newVoucher.id)]);
    setShowRedeemModal(false);
    setToast({ message: `Quy đổi thành công voucher "${voucher.title}"! Điểm thưởng xanh đã được khấu trừ.`, type: 'success' });
    } catch (err: any) {
      setToast({ message: layThongBaoLoi(err, 'Không thể quy đổi voucher. Vui lòng thử lại.'), type: 'error' });
    }
  };

  // UC32: Handle open cancel modal & calculate penalty
  const handleOpenCancelModal = (booking: Booking) => {
    setSelectedBookingForCancel(booking);
    setCancellationReason('');

    const today = new Date();
    const depDate = new Date(booking.departureDate);
    const diffTime = depDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let percent = 0;
    if (diffDays < 2) {
      percent = 100; // 100% penalty, meaning no refund (or not allowed to cancel)
    } else if (diffDays < 7) {
      percent = 50; // 50% penalty, refunds half
    } else {
      percent = 0; // 0% penalty, refunds all
    }

    const penaltyAmount = (booking.totalAmount * percent) / 100;
    const refundAmount = booking.totalAmount - penaltyAmount;

    setCancellationPenalty({ percent, amount: penaltyAmount, refund: refundAmount });
  };

  // Confirm tour cancellation (UC32 / UC33)
  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;

    const today = new Date();
    const depDate = new Date(selectedBookingForCancel.departureDate);
    const diffTime = depDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 2) {
      setToast({ message: 'Không thể hủy chuyến đi này! Ngày khởi hành còn dưới 2 ngày theo quy định hủy tour.', type: 'error' });
      setSelectedBookingForCancel(null);
      return;
    }

    try {
      if (selectedBookingForCancel.status === 'CHO_XAC_NHAN') {
        await khService.huyDatTour(selectedBookingForCancel.id);
      } else {
        await khService.yeuCauHuyTour(selectedBookingForCancel.id, { lyDo: cancellationReason.trim() });
      }

      setBookings(prev => prev.map(b =>
      b.id === selectedBookingForCancel.id
        ? { ...b, status: selectedBookingForCancel.status === 'CHO_XAC_NHAN' ? 'DA_HUY' as any : 'CHO_HUY' as any }
        : b
      ));

    // UC48 in SPEC-Status-Flows.md: If booking is cancelled, return voucher to CO_HIEU_LUC
    setToast({ message: `Yêu cầu hủy tour đã được gửi! Trạng thái: Chờ hủy. Số tiền hoàn trả dự kiến: ${formatPrice(cancellationPenalty.refund)}.`, type: 'success' });
      setSelectedBookingForCancel(null);
    } catch (err: any) {
      setToast({ message: layThongBaoLoi(err, 'Không thể gửi yêu cầu hủy tour. Vui lòng thử lại.'), type: 'error' });
    }
  };

  // UC35: Open review modal
  const handleOpenReviewModal = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setReviewStars(5);
    setReviewComment('');
    setSelectedReviewTags([]);
  };

  // Toggle review tag selection
  const handleToggleReviewTag = (tag: string) => {
    setSelectedReviewTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Submit tour review (UC35)
  const handleSubmitReview = async () => {
    if (!selectedBookingForReview) return;

    // Award +50 Green Points for submitting review
    try {
      const nhanXet = [
        reviewComment.trim(),
        selectedReviewTags.length ? `Tags: ${selectedReviewTags.join(', ')}` : ''
      ].filter(Boolean).join('\n');

      await khService.taoDanhGia({
        maTourThucTe: selectedBookingForReview.tourId,
        soSao: reviewStars,
        nhanXet
      });

      setToast({ message: 'Đánh giá thành công! Cảm ơn đóng góp của bạn.', type: 'success' });
      setSelectedBookingForReview(null);
    } catch (err: any) {
      setToast({ message: layThongBaoLoi(err, 'Không thể gửi đánh giá. Vui lòng thử lại.'), type: 'error' });
    }
  };

  // UC36: Open complaint modal
  const handleOpenComplaintModal = (booking: Booking) => {
    setSelectedBookingForComplaint(booking);
    setComplaintCategory('Hướng dẫn viên');
    setComplaintSubject('');
    setComplaintContent('');
    setComplaintFileName('');
  };

  // Submit complaint ticket (UC36)
  const handleSubmitComplaint = async () => {
    if (!selectedBookingForComplaint) return;

    if (!complaintSubject.trim() || !complaintContent.trim()) {
      setToast({ message: 'Vui lòng điền đầy đủ tiêu đề và nội dung khiếu nại!', type: 'error' });
      return;
    }

    try {
      const response = await khService.taoYeuCauHoTro({
        maDatTour: selectedBookingForComplaint.id,
        loaiYeuCau: 'KHIEU_NAI',
        noiDung: [
          `Danh mục: ${complaintCategory}`,
          `Tiêu đề: ${complaintSubject.trim()}`,
          complaintContent.trim(),
          complaintFileName ? `File đính kèm: ${complaintFileName}` : ''
        ].filter(Boolean).join('\n')
      });
      const c = unwrapData<any>(response);
      const newTicket: ComplaintTicket = {
        id: c.maYeuCau || `comp-${Date.now()}`,
        bookingId: c.maDatTour || selectedBookingForComplaint.id,
        tourName: selectedBookingForComplaint.tourName,
        category: complaintCategory,
        subject: complaintSubject,
        content: complaintContent,
        status: c.trangThai || 'CHUA_XU_LY',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        history: ['Khách hàng gửi khiếu nại lên hệ thống.']
      };

      setComplaints([newTicket, ...complaints]);
      setToast({ message: 'Khiếu nại đã được gửi thành công! Ban điều hành sẽ tiếp nhận và xử lý trong vòng 24h làm việc.', type: 'success' });
      setSelectedBookingForComplaint(null);
      setActiveTab('complaints');
    } catch (err: any) {
      setToast({ message: layThongBaoLoi(err, 'Không thể gửi khiếu nại. Vui lòng thử lại.'), type: 'error' });
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(booking => {
    // 1. Status Filter
    let statusMatch = true;
    if (bookingFilter !== 'all') {
      if (bookingFilter === 'upcoming') {
        statusMatch = ['upcoming', 'CHO_XAC_NHAN', 'DA_XAC_NHAN'].includes(booking.status);
      } else if (bookingFilter === 'completed') {
        statusMatch = booking.status === 'completed';
      } else if (bookingFilter === 'cancelled') {
        statusMatch = ['cancelled', 'CHO_HUY', 'DA_HUY', 'TU_CHOI_HOAN_TIEN', 'HET_HAN_GIU_CHO', 'THANH_TOAN_THAT_BAI'].includes(booking.status);
      } else {
        statusMatch = (booking.status as string) === bookingFilter;
      }
    }

    if (!statusMatch) return false;

    // 2. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return (
        booking.tourName.toLowerCase().includes(query) ||
        booking.qrCode.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Passport Card */}
        <div className="bg-gradient-to-r from-blue-100/95 via-indigo-80/90 to-sky-100/95 rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.15)] p-6 sm:p-8 mb-8 border border-blue-200 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/15 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none"></div>

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md border-2 border-white flex-shrink-0">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile.fullName}</h1>
                  <span className="text-[10px] font-black uppercase bg-emerald-100/90 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-200/60">Active</span>
                </div>
                <p className="text-slate-500 text-sm font-semibold">{profile.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 bg-white/80 border border-slate-200/50 text-[11px] font-bold text-slate-600 shadow-sm px-2.5 py-1 rounded-xl backdrop-blur-md">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>{profile.phone}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/80 border border-slate-200/50 text-[11px] font-bold text-slate-600 shadow-sm px-2.5 py-1 rounded-xl backdrop-blur-md max-w-[280px]">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span className="truncate">{profile.address}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3.5 w-full lg:w-auto">
              <div className="text-center bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-100 shadow-sm min-w-[130px] flex-1 sm:flex-initial">
                <p className="text-slate-450 text-[10px] uppercase tracking-wider mb-2 font-bold">Hạng Thành Viên</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase ${layMauHangThanhVien(profile.membershipTier)}`}>
                  {layTenHangThanhVienVi(profile.membershipTier)}
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-w-[150px] min-h-[76px] flex-1 sm:flex-initial">
                <span className="text-emerald-700 text-[10px] uppercase tracking-wider mb-1.5 font-bold flex items-center">
                  <Star className="w-3.5 h-3.5 mr-1 text-emerald-500 fill-current" />
                  Điểm Thưởng Xanh
                </span>
                <div className="flex items-baseline font-black text-2xl text-emerald-600 leading-none">
                  {profile.greenPoints}
                  <span className="text-[9px] font-bold text-emerald-600/80 ml-1.5">ĐIỂM XANH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50/50">
            <nav className="flex flex-col sm:flex-row">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 text-center font-bold transition-all flex items-center justify-center space-x-2 text-sm ${activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
              >
                <User className="w-4 h-4" />
                <span>Thông tin hộ chiếu</span>
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 py-4 px-6 text-center font-bold transition-all flex items-center justify-center space-x-2 text-sm ${activeTab === 'bookings'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Lịch sử chuyến đi</span>
              </button>
              <button
                onClick={() => setActiveTab('vouchers')}
                className={`flex-1 py-4 px-6 text-center font-bold transition-all flex items-center justify-center space-x-2 text-sm ${activeTab === 'vouchers'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Ví ưu đãi</span>
              </button>
              <button
                onClick={() => setActiveTab('complaints')}
                className={`flex-1 py-4 px-6 text-center font-bold transition-all flex items-center justify-center space-x-2 text-sm ${activeTab === 'complaints'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Khiếu nại & Hỗ trợ</span>
              </button>
            </nav>
          </div>

          <div className="p-8">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Chi tiết Hồ sơ du lịch</h2>
                    <p className="text-sm text-gray-600 mt-1">Thông tin này được sử dụng tự động điền mẫu khi đặt tour.</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setEditedProfile(profile);
                        setIsEditing(true);
                      }}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-sm text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Sửa hồ sơ</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={isEditing ? editedProfile.fullName : profile.fullName}
                      onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email liên hệ</label>
                    <input
                      type="email"
                      value={isEditing ? editedProfile.email : profile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={isEditing ? editedProfile.phone : profile.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                    <input
                      type="date"
                      value={isEditing ? editedProfile.dateOfBirth : profile.dateOfBirth}
                      onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số CCCD (CMND)</label>
                    <input
                      type="text"
                      value={isEditing ? editedProfile.idCard : profile.idCard}
                      onChange={(e) => setEditedProfile({ ...editedProfile, idCard: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số Hộ chiếu (Passport)</label>
                    <input
                      type="text"
                      value={isEditing ? editedProfile.passport : profile.passport}
                      onChange={(e) => setEditedProfile({ ...editedProfile, passport: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ thường trú</label>
                    <input
                      type="text"
                      value={isEditing ? editedProfile.address : profile.address}
                      onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tình trạng sức khỏe đặc biệt</label>
                    <input
                      type="text"
                      placeholder="VD: Cao huyết áp, say sóng xe..."
                      value={isEditing ? editedProfile.healthInfo || '' : profile.healthInfo || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, healthInfo: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-650 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Dị ứng thực phẩm / thuốc</label>
                    <input
                      type="text"
                      placeholder="VD: Không dị ứng, hải sản..."
                      value={isEditing ? editedProfile.allergies || '' : profile.allergies || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, allergies: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-650 font-medium"
                    />
                  </div>
                </div>

                {/* UC60: Đổi mật khẩu */}
                <div className="border-t border-gray-100 pt-6">
                  <button
                    onClick={() => { setShowChangePassword(!showChangePassword); setPasswordError(''); setPasswordSuccess(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                        <ShieldAlert className="w-4.5 h-4.5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-sm">Bảo mật tài khoản</h3>
                        <p className="text-xs text-gray-500 font-medium">Thay đổi mật khẩu đăng nhập</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showChangePassword ? 'rotate-180' : ''}`} />
                  </button>

                  {showChangePassword && (
                    <div className="mt-4 space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200 animate-fadeIn">
                      {passwordSuccess ? (
                        <div className="text-center py-6 space-y-3">
                          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-7 h-7 text-green-600" />
                          </div>
                          <p className="text-sm font-bold text-green-700">Mật khẩu đã được thay đổi thành công!</p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                            <input
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Nhập mật khẩu hiện tại"
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu mới</label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                            <input
                              type="password"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              placeholder="Nhập lại mật khẩu mới"
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {passwordError && (
                            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center">
                              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                              {passwordError}
                            </p>
                          )}

                          <button
                            onClick={handleChangePassword}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm text-sm"
                          >
                            Xác nhận đổi mật khẩu
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Chuyến đi của tôi</h2>
                    <p className="text-sm text-gray-600 mt-1">Danh sách tour bạn đang đăng ký hoặc đã hoàn thành.</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Search bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm theo tên tour, mã..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
                      />
                    </div>

                    {/* Minimalist Dropdown Filter */}
                    <div className="relative min-w-[170px]">
                      <select
                        value={bookingFilter}
                        onChange={(e) => setBookingFilter(e.target.value as BookingFilter)}
                        className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="all">Tất cả chuyến đi</option>
                        <option value="upcoming">Sắp khởi hành</option>
                        <option value="completed">Đã hoàn thành</option>
                        <option value="cancelled">Đã hủy & Hoàn tiền</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Không tìm thấy chuyến đi nào thỏa mãn</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="bg-white hover:shadow-lg transition-all rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row gap-6">
                        <img
                          src={booking.tourImage}
                          alt={booking.tourName}
                          className="w-full md:w-44 h-36 object-cover rounded-xl shadow-inner border border-gray-100"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-extrabold text-lg text-gray-900 leading-snug">{booking.tourName}</h3>
                                <p className="text-gray-500 text-xs font-semibold mt-1">Mã đặt chỗ: <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{booking.qrCode}</span></p>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                <span>Khởi hành: <strong className="text-gray-800">{formatDate(booking.departureDate)}</strong></span>
                              </div>
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                <span>Số khách: <strong className="text-gray-800">{booking.passengers} người</strong></span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <span>Ngày đặt: {formatDate(booking.bookingDate)}</span>
                              </div>
                              <div className="flex items-center text-blue-600 font-bold">
                                <CreditCard className="w-4 h-4 mr-2 text-blue-400" />
                                <span>Đã thanh toán: {formatPrice(booking.totalAmount)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-50">
                            <button
                              onClick={() => setSelectedBookingForDetail(booking)}
                              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Xem vé chi tiết</span>
                            </button>

                            {['upcoming', 'DA_XAC_NHAN', 'CHO_XAC_NHAN'].includes(booking.status) && (
                              <button
                                onClick={() => handleOpenCancelModal(booking)}
                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Hủy tour & Hoàn tiền</span>
                              </button>
                            )}

                            {/* Only Hủy tour & Hoàn tiền is shown */}

                            {booking.status === 'completed' && (
                              <>
                                <button
                                  onClick={() => handleOpenReviewModal(booking)}
                                  className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  <span>Đánh giá chuyến đi</span>
                                </button>
                                <button
                                  onClick={() => handleOpenComplaintModal(booking)}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span>Gửi khiếu nại</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vouchers Tab */}
            {activeTab === 'vouchers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Ví ưu đãi của tôi</h2>
                    <p className="text-sm text-gray-600 mt-1">Danh sách voucher của bạn hoặc quy đổi từ điểm xanh.</p>
                  </div>
                  <button
                    onClick={() => setShowRedeemModal(true)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md font-bold text-sm"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Quy đổi điểm xanh</span>
                  </button>
                </div>

                {vouchers.filter(v => v.status === 'active').length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Bạn chưa có voucher khả dụng nào</p>
                    <button
                      onClick={() => setShowRedeemModal(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center justify-center mx-auto space-x-1"
                    >
                      <span>Quy đổi điểm ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vouchers.filter(v => v.status === 'active').map((voucher) => (
                      <div key={voucher.id} className="border-2 border-blue-500 rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-white shadow-md flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-extrabold text-gray-900 text-base">{voucher.title}</h4>
                              <p className="text-blue-600 font-black text-2xl mt-1">
                                {voucher.discountType === 'percent'
                                  ? `${voucher.discount}%`
                                  : formatPrice(voucher.discount)
                                }
                              </p>
                            </div>
                            <Ticket className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="text-gray-600 text-xs font-semibold mt-2">{voucher.description}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Mã giảm giá</span>
                            <span className="text-gray-700 font-mono font-bold bg-gray-50 px-2 py-0.5 rounded border text-xs">{voucher.code}</span>
                          </div>
                          <button
                            onClick={() => setSelectedVoucherForUse(voucher)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-xs shadow-sm"
                          >
                            Dùng ngay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Khiếu nại & Yêu cầu hỗ trợ</h2>
                    <p className="text-sm text-gray-600 mt-1">Theo dõi trạng thái giải quyết khiếu nại (CSKH & Điều phối nội bộ).</p>
                  </div>
                </div>

                {complaints.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                    <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Bạn chưa gửi khiếu nại nào</p>
                    <p className="text-xs text-gray-400 mt-1">Để gửi khiếu nại, vui lòng vào tab "Lịch sử chuyến đi" và chọn khiếu nại cho các tour đã kết thúc.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {complaints.map((ticket) => (
                      <div key={ticket.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-gray-100">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-gray-400 uppercase">Mã phiếu: {ticket.id}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs font-semibold text-blue-600">{ticket.category}</span>
                            </div>
                            <h3 className="font-extrabold text-lg text-gray-900 mt-1">{ticket.subject}</h3>
                            <p className="text-xs text-gray-500 mt-1">Tour: <strong className="text-gray-700">{ticket.tourName}</strong></p>
                          </div>

                          {/* Ticket Status Badge */}
                          {ticket.status === 'CHUA_XU_LY' && <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">Chưa xử lý</span>}
                          {ticket.status === 'CHO_BO_SUNG' && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200">Đợi bổ sung hồ sơ</span>}
                          {ticket.status === 'CHO_GIAI_TRINH' && <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold border border-purple-200 animate-pulse">Đang đợi giải trình</span>}
                          {ticket.status === 'DA_XU_LY' && <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">Đã giải quyết</span>}
                          {ticket.status === 'TU_CHOI' && <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">Từ chối</span>}
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap font-medium">{ticket.content}</p>
                        </div>

                        {/* History / Actions */}
                        <div className="mt-4 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-50 gap-4">
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            <span>Nhật ký gần nhất: {ticket.history[ticket.history.length - 1]}</span>
                          </div>

                          {ticket.status === 'CHO_BO_SUNG' && (
                            <button
                              onClick={() => {
                                const addInfo = prompt('Nhập thêm thông tin bổ sung / link bằng chứng (video, ảnh):');
                                if (addInfo) {
                                  const updatedHistory = [...ticket.history, 'Khách hàng cập nhật thêm thông tin bổ sung.'];
                                  const updatedComplaints = complaints.map(c =>
                                    c.id === ticket.id
                                      ? {
                                        ...c,
                                        content: `${c.content}\n\n[Bổ sung ngày ${new Date().toLocaleDateString('vi-VN')}]: ${addInfo}`,
                                        status: 'CHUA_XU_LY' as const,
                                        history: updatedHistory
                                      }
                                      : c
                                  );
                                  setComplaints(updatedComplaints);
                                  alert('Cập nhật thông tin bổ sung thành công! Ticket của bạn đã được đưa lại hàng chờ xử lý.');
                                }
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-bold transition-colors"
                            >
                              Bổ sung bằng chứng
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* UC23: Custom Premium OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 relative text-center">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Phone className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Xác thực OTP cập nhật</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Mã xác nhận bảo mật đã được gửi đến số điện thoại <strong className="text-gray-800">{profile.phone}</strong>.<br />
              Vui lòng nhập mã OTP để tiếp tục lưu hồ sơ số.
            </p>

            <div className="flex justify-center space-x-2 mb-6">
              {otpValue.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value;
                    const next = [...otpValue];
                    next[idx] = val;
                    setOtpValue(next);
                    if (val && idx < 5) {
                      document.getElementById(`otp-${idx + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otpValue[idx] && idx > 0) {
                      document.getElementById(`otp-${idx - 1}`)?.focus();
                    }
                  }}
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-6 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                {otpError}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg mb-4 text-sm"
            >
              Xác thực OTP
            </button>

            <div className="text-xs text-gray-500">
              {otpCountdown > 0 ? (
                <p>Gửi lại mã xác nhận sau <strong className="text-gray-700">{otpCountdown} giây</strong></p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Redeem Voucher Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowRedeemModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Quy đổi voucher bằng Điểm xanh</h2>
                <p className="text-sm text-gray-600">Sử dụng điểm tích lũy từ các hoạt động bảo vệ môi trường.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 rounded-2xl p-5 mb-8 flex items-center justify-between">
              <span className="text-gray-700 font-bold">Số dư Điểm xanh của bạn:</span>
              <span className="text-green-600 font-black text-2xl flex items-center">
                <Star className="w-6 h-6 mr-1.5 fill-current" />
                {profile.greenPoints} ĐIỂM
              </span>
            </div>

            <h3 className="font-extrabold text-gray-900 mb-4 text-base">Kho ưu đãi xanh khả dụng (UC30)</h3>
            <div className="space-y-4">
              {redeemableVouchers.map((voucher) => {
                const pointsRequired = tinhDiemCanDoiVoucher(voucher);
                const canRedeem = profile.greenPoints >= pointsRequired;

                return (
                  <div key={voucher.id} className="border border-gray-200 rounded-2xl p-5 hover:border-blue-500 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:shadow-md">
                    <div className="flex-1">
                      <h4 className="font-extrabold text-gray-900">{voucher.title}</h4>
                      <p className="text-blue-600 font-extrabold text-lg mt-1">
                        {voucher.discountType === 'percent'
                          ? `Giảm ${voucher.discount}%`
                          : `Giảm ${formatPrice(voucher.discount)}`
                        }
                      </p>
                      <p className="text-gray-600 text-xs font-semibold mt-2">{voucher.description}</p>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50 gap-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Yêu cầu: {pointsRequired} PTS
                      </span>
                      <button
                        disabled={!canRedeem}
                        onClick={() => handleRedeemPoints(voucher, pointsRequired)}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all text-xs w-full sm:w-auto text-center ${canRedeem
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                          : 'bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-200'
                          }`}
                      >
                        {canRedeem ? 'Đổi voucher' : 'Không đủ điểm'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Use Voucher Modal */}
      {selectedVoucherForUse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 max-h-[90vh] flex flex-col shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setSelectedVoucherForUse(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Tour đang áp dụng ưu đãi</h2>
                <p className="text-sm text-gray-600">Voucher đang được tạm khóa để sử dụng đặt chỗ.</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex-shrink-0">
              <p className="text-blue-900 font-extrabold text-base">
                Ưu đãi: <span className="text-blue-700">{selectedVoucherForUse.title}</span> (Mã: {selectedVoucherForUse.code})
              </p>
              <p className="text-blue-700 text-xs font-semibold mt-1">{selectedVoucherForUse.description}</p>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                {allTours.slice(0, 4).map((tour) => (
                  <div key={tour.id} className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow bg-white">
                    <img src={tour.image} alt={tour.name} className="w-full sm:w-32 h-full object-cover" />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-gray-950 text-sm line-clamp-2 leading-snug mb-1">{tour.name}</h4>
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {tour.destination}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-blue-600 font-extrabold text-sm">{formatPrice(tour.price)}</span>
                        <Link
                          to={`/tour/${tour.id}`}
                          className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Xem & Đặt
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UC22: Custom Detailed Booking Modal */}
      {selectedBookingForDetail && (() => {
        const fullTour = allTours.find(t => t.id === selectedBookingForDetail.tourId);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setSelectedBookingForDetail(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Chi tiết vé điện tử</h2>
                  <p className="text-sm text-gray-600">Mã đặt vé: {selectedBookingForDetail.qrCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left side: Tour details */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="relative rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={selectedBookingForDetail.tourImage}
                      alt={selectedBookingForDetail.tourName}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(selectedBookingForDetail.status)}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                      <h3 className="font-extrabold text-lg leading-tight">{selectedBookingForDetail.tourName}</h3>
                      <p className="text-xs text-gray-200 mt-1">Khởi hành: {formatDate(selectedBookingForDetail.departureDate)}</p>
                    </div>
                  </div>

                  {/* Itinerary timeline summary */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5 text-blue-500" />
                      Tóm tắt lịch trình chi tiết
                    </h4>
                    {fullTour ? (
                      <div className="relative pl-6 border-l border-slate-200 ml-3 space-y-5">
                        {fullTour.itinerary.map((day: any) => (
                          <div key={day.day} className="relative">
                            {/* Timeline Pin Indicator */}
                            <div className="absolute -left-[34px] top-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center z-10 border border-slate-100 shadow-sm">
                              <MapPin className="w-3 h-3 text-slate-900 fill-slate-900" />
                            </div>
                            <h5 className="font-extrabold text-xs text-gray-800">Ngày {day.day}: {day.title}</h5>
                            <p className="text-xs text-gray-500 mt-0.5">{day.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Không tìm thấy thông tin lịch trình chi tiết.</p>
                    )}
                  </div>

                  {/* Guide info */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Hướng dẫn viên phụ trách (UC37/UC40)</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">👨‍💼</div>
                        <div>
                          <p className="font-extrabold text-sm text-gray-900">Lê Văn Tám</p>
                          <p className="text-[10px] text-gray-500 font-bold flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 fill-current mr-0.5" />
                            Được đánh giá 4.9★ • Nhiều kinh nghiệm
                          </p>
                          <p className="text-[10px] text-blue-600 font-bold mt-1">
                            <a href="tel:0987654321" className="hover:underline">SĐT: 0987.654.321</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Boarding ticket QR code & actions */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                  {/* QR Boarding pass card */}
                  <div className="bg-gradient-to-b from-blue-50/80 via-indigo-50/60 to-white rounded-2xl p-6 text-center shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center border border-blue-100/80">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500/30 via-indigo-500/40 to-blue-500/30"></div>
                    <div className="absolute top-0 right-0 w-36 h-36 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>

                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/80 relative z-10">Digital Boarding Ticket</p>
                    <h4 className="text-base font-extrabold mt-1.5 leading-tight text-slate-900 relative z-10">{selectedBookingForDetail.tourName}</h4>

                    {/* Simulated Boarding pass QR code - Soft luxury bg to reduce glare */}
                    <div className="my-6 relative bg-white p-4.5 rounded-2xl w-40 h-40 mx-auto border border-blue-100 shadow-md overflow-hidden relative z-10">
                      <div className="absolute inset-x-0 top-0 h-1 bg-blue-500/80 animate-scan z-10"></div>
                      <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="10" y="10" width="20" height="20" />
                        <rect x="15" y="15" width="10" height="10" fill="white" />
                        <rect x="70" y="10" width="20" height="20" />
                        <rect x="75" y="15" width="10" height="10" fill="white" />
                        <rect x="10" y="70" width="20" height="20" />
                        <rect x="15" y="75" width="10" height="10" fill="white" />
                        {/* QR pattern */}
                        <rect x="35" y="15" width="10" height="10" />
                        <rect x="50" y="25" width="15" height="5" />
                        <rect x="15" y="45" width="5" height="15" />
                        <rect x="40" y="40" width="20" height="20" />
                        <rect x="45" y="45" width="10" height="10" fill="white" />
                        <rect x="70" y="40" width="15" height="15" />
                        <rect x="35" y="70" width="15" height="10" />
                        <rect x="65" y="65" width="20" height="20" />
                      </svg>
                    </div>

                    <span className="font-mono text-xs text-blue-700 font-extrabold uppercase bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100 inline-block mx-auto mb-2 shadow-sm relative z-10">
                      {selectedBookingForDetail.qrCode}
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold relative z-10">
                      Mã QR vé điện tử dùng để xác thực thông tin đặt tour khi khởi hành.
                    </p>
                  </div>

                  {/* Payment / Cost summary */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-600 space-y-2">
                    <h5 className="font-bold text-gray-900 mb-2 border-b pb-1.5 border-gray-200">Chi tiết chi phí đơn hàng</h5>
                    <div className="flex justify-between">
                      <span>Giá tour gốc:</span>
                      <span className="font-semibold text-gray-800">{formatPrice(selectedBookingForDetail.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thuế & Phụ phí:</span>
                      <span className="font-semibold text-gray-850 text-green-600">Đã bao gồm</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-gray-900 border-t pt-2 mt-2">
                      <span>Tổng cộng đã trả:</span>
                      <span className="text-blue-600">{formatPrice(selectedBookingForDetail.totalAmount)}</span>
                    </div>
                  </div>

                  {/* UC33/UC50: Refund / Cancellation state display */}
                  {['cancelled', 'DA_HUY', 'CHO_HUY', 'TU_CHOI_HOAN_TIEN'].includes(selectedBookingForDetail.status) && (
                    <div className={`rounded-2xl p-4 space-y-2 border ${selectedBookingForDetail.status === 'CHO_HUY'
                      ? 'bg-amber-50 border-amber-200 text-amber-850'
                      : selectedBookingForDetail.status === 'TU_CHOI_HOAN_TIEN'
                        ? 'bg-red-50 border-red-200 text-red-850'
                        : 'bg-green-50 border-green-200 text-green-850'
                      }`}>
                      <h5 className="font-extrabold text-xs flex items-center">
                        {selectedBookingForDetail.status === 'CHO_HUY' && (
                          <>
                            <Clock className="w-4 h-4 mr-1 text-amber-600 animate-pulse" />
                            Đang xử lý yêu cầu hủy & hoàn tiền
                          </>
                        )}
                        {selectedBookingForDetail.status === 'TU_CHOI_HOAN_TIEN' && (
                          <>
                            <AlertTriangle className="w-4 h-4 mr-1 text-red-650" />
                            Yêu cầu hoàn tiền bị từ chối
                          </>
                        )}
                        {['cancelled', 'DA_HUY'].includes(selectedBookingForDetail.status) && (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                            Đã hoàn tiền thành công (UC50)
                          </>
                        )}
                      </h5>
                      <p className="text-[10px] text-gray-650 font-medium">
                        {selectedBookingForDetail.status === 'CHO_HUY' && `Yêu cầu hủy tour của bạn đã được tiếp nhận và chuyển sang phòng ban đối soát tài chính. Ban quản trị đang xử lý hoàn tiền dự kiến: ${formatPrice(selectedBookingForDetail.totalAmount)}.`}
                        {selectedBookingForDetail.status === 'TU_CHOI_HOAN_TIEN' && "Yêu cầu hoàn tiền của quý khách bị từ chối do vi phạm điều khoản hủy tour (ngày khởi hành còn dưới 2 ngày hoặc đã quá hạn quy định)."}
                        {['cancelled', 'DA_HUY'].includes(selectedBookingForDetail.status) && `Số tiền hoàn trả đã được quyết toán và chuyển khoản thành công về ví/tài khoản của bạn. Trạng thái tour đã chính thức được đóng.`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* UC32: Cancellation Confirmation Modal */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 relative animate-fade-in text-center">
            <button
              onClick={() => setSelectedBookingForCancel(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-650">
              <AlertTriangle className="w-8 h-8 animate-bounce text-red-600" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Xác nhận hủy đăng ký Tour</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn đang yêu cầu hủy tour: <strong className="text-gray-800">{selectedBookingForCancel.tourName}</strong>
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Số tiền thanh toán ban đầu:</span>
                <span className="font-semibold text-gray-900">{formatPrice(selectedBookingForCancel.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Phí phạt hủy tour ({cancellationPenalty.percent}%):</span>
                <span className="font-semibold text-red-600">-{formatPrice(cancellationPenalty.amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-950 border-t pt-3 mt-3">
                <span>Số tiền thực tế hoàn trả:</span>
                <span className="text-green-600 text-base">{formatPrice(cancellationPenalty.refund)}</span>
              </div>
            </div>

            <div className="text-left mb-6">
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Nhập lý do hủy chuyến (Bắt buộc):</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Vui lòng cung cấp lý do hủy để giúp chúng tôi cải thiện chất lượng..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              ></textarea>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedBookingForCancel(null)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors text-xs"
              >
                Giữ lại chuyến đi
              </button>
              <button
                disabled={!cancellationReason.trim()}
                onClick={handleConfirmCancel}
                className={`flex-1 py-3 rounded-xl font-bold transition-all text-xs text-white ${cancellationReason.trim()
                  ? 'bg-red-600 hover:bg-red-700 shadow-md'
                  : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                Xác nhận hủy & Hoàn tiền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UC35: Detailed Tour Review Modal */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setSelectedBookingForReview(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-green-50 rounded-2xl text-green-600">
                <Star className="w-6 h-6 fill-current text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Đánh giá chất lượng chuyến đi</h3>
                <p className="text-xs text-gray-500">Mã tour: {selectedBookingForReview.tourName}</p>
              </div>
            </div>

            {/* Interactive Stars Selection */}
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider mb-2">Đánh giá chung</span>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewStars(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${star <= reviewStars
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-gray-600 block mt-2">
                {reviewStars === 5 && 'Tuyệt vời, vô cùng hài lòng!'}
                {reviewStars === 4 && 'Rất tốt, dịch vụ chu đáo.'}
                {reviewStars === 3 && 'Tạm ổn, có thể cải thiện thêm.'}
                {reviewStars === 2 && 'Chưa hài lòng, nhiều thiếu sót.'}
                {reviewStars === 1 && 'Rất tệ, cực kỳ thất vọng.'}
              </span>
            </div>

            {/* Quick Review Tags */}
            <div className="mb-6">
              <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider mb-2">Tags ấn tượng nổi bật</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Hướng dẫn viên nhiệt tình',
                  'Khách sạn 4-5 sao cực đẹp',
                  'Lịch trình khoa học',
                  'Đồ ăn ngon xuất sắc',
                  'Có nhiều Hoạt động xanh ý nghĩa',
                  'Đúng giờ chuyên nghiệp'
                ].map((tag) => {
                  const selected = selectedReviewTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleReviewTag(tag)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${selected
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment textarea */}
            <div className="mb-6">
              <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider mb-2">Ý kiến nhận xét chi tiết</span>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ thêm cảm nhận và trải nghiệm thực tế của bạn về đoàn và dịch vụ..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              ></textarea>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <span className="text-green-800 text-xs font-bold flex items-center">
                <Gift className="w-4 h-4 mr-1 text-green-600" />
                Phần thưởng khuyến khích bảo vệ môi trường:
              </span>
              <span className="text-green-600 font-extrabold text-sm">+50 Điểm xanh</span>
            </div>

            <button
              onClick={handleSubmitReview}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md text-sm text-center"
            >
              Gửi đánh giá chuyến đi (UC35)
            </button>
          </div>
        </div>
      )}

      {/* UC36: Tour Complaint Ticket Modal */}
      {selectedBookingForComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setSelectedBookingForComplaint(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-red-50 rounded-2xl text-red-650">
                <ShieldAlert className="w-6 h-6 text-red-650" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Gửi yêu cầu Khiếu nại dịch vụ</h3>
                <p className="text-xs text-gray-500">Chúng tôi cam kết bảo vệ quyền lợi tối đa cho quý khách hàng.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Mục khiếu nại chính</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white font-medium"
                >
                  <option value="Hướng dẫn viên">Hướng dẫn viên thiếu chuyên nghiệp</option>
                  <option value="Khách sạn">Chất lượng phòng khách sạn kém</option>
                  <option value="Phương tiện di chuyển">Xe đưa đón trễ giờ / không sạch sẽ</option>
                  <option value="Ăn uống">Ăn uống không đúng thực đơn / mất vệ sinh</option>
                  <option value="Khác">Lý do kỹ thuật khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Tiêu đề phản ánh</label>
                <input
                  type="text"
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  placeholder="VD: Hướng dẫn viên tự ý bỏ điểm du lịch tại Hạ Long"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Mô tả chi tiết diễn biến sự việc</label>
                <textarea
                  value={complaintContent}
                  onChange={(e) => setComplaintContent(e.target.value)}
                  placeholder="Quý khách vui lòng mô tả rõ sự việc xảy ra, khung giờ, địa điểm cụ thể để ban thanh tra dễ dàng phối hợp xác minh..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Đính kèm ảnh / video bằng chứng (Mô phỏng)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setComplaintFileName(e.target.files[0].name);
                    }
                  }}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-150 transition-colors"
                />
                {complaintFileName && (
                  <p className="text-xs text-green-600 font-bold mt-1.5 flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Đã chọn file: {complaintFileName}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmitComplaint}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md text-sm text-center mt-6"
            >
              Gửi khiếu nại thanh tra (UC36)
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fadeIn">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[320px] max-w-lg ${toast.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
              : toast.type === 'error'
                ? 'bg-red-50/95 border-red-200 text-red-800'
                : 'bg-blue-50/95 border-blue-200 text-blue-800'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}>
              {toast.type === 'success' && <CheckCircle className="w-4.5 h-4.5 text-white" />}
              {toast.type === 'error' && <AlertTriangle className="w-4.5 h-4.5 text-white" />}
              {toast.type === 'info' && <Bell className="w-4.5 h-4.5 text-white" />}
            </div>
            <p className="text-xs font-bold flex-1 leading-relaxed">{toast.message}</p>
            <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100 p-1 rounded-full transition-opacity flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
