import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Compass,
  Calendar,
  Users,
  Leaf,
  DollarSign,
  AlertTriangle,
  Bell,
  LogOut,
  X,
  CheckCircle,
  Send
} from 'lucide-react';
import type { Passenger, Expense, Tour, BaoCaoSuCo as IncidentType } from './types';
// Removed mockData imports

// Component imports
import DangNhap from './pages/DangNhap';
import BangDieuKhien from './pages/BangDieuKhien';
import LichTrinh from './pages/LichTrinh';
import DiemDanh from './pages/DiemDanh';
import DiemXanh from './pages/DiemXanh';
import QuanLyChiPhi from './pages/QuanLyChiPhi';
import BaoCaoSuCo from './pages/BaoCaoSuCo';
import HoSoCaNhan from './pages/HoSoCaNhan';
import { hdvService } from './services/hdvService';

type TabType = 'dashboard' | 'schedule' | 'attendance' | 'green' | 'expense' | 'incident' | 'profile';

const READ_NOTIFICATION_IDS_KEY = 'hdv-read-notification-ids';
const DISMISSED_ASSIGNMENT_NOTIFICATION_IDS_KEY = 'hdv-dismissed-assignment-notification-ids';

const layDanhSachIdDaLuu = (key: string): string[] => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const tachTimelineHoatDong = (giaTri?: string) => {
  return (giaTri || '')
    .split(/\\n|\r?\n|<br\s*\/?>/)
    .map((dong) => dong.trim())
    .filter(Boolean)
    .map((dong) => {
      const cleanedDong = dong.replace(/^[-–—•\s]+/, '').trim();
      const khop = cleanedDong.match(/^(\d{2}:\d{2})\s*[-–—]\s*(.+)$/);
      return khop
        ? { time: khop[1], activity: khop[2] }
        : { time: '', activity: cleanedDong };
    });
};

type AppNotification = {
  id: string;
  text: string;
  time: string;
  read: boolean;
  type: 'ASSIGNMENT_CONFIRMATION' | 'ACTION_RESULT' | 'GUIDE_EXPLANATION_REQUEST' | 'SETTLEMENT_INFO_REQUEST';
  tour?: Tour;
  supportRequest?: GuideExplanationRequest;
  settlementRequest?: SettlementInfoRequest;
};

type GuideExplanationRequest = {
  maYeuCau?: string;
  maDatTour?: string;
  loaiYeuCau?: string;
  noiDung?: string;
  trangThai?: string;
};

type SettlementInfoRequest = {
  maQuyetToan?: string;
  maTour?: string;
  tenTour?: string;
  ghiChu?: string;
  hoaDonAnh?: string;
};

export default function App() {
  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [loginCode, setLoginCode] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Application Data States
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incidents, setIncidents] = useState<IncidentType[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [upcomingTours, setUpcomingTours] = useState<Tour[]>([]);
  const [pastTours, setPastTours] = useState<Tour[]>([]);
  const [pendingTours, setPendingTours] = useState<Tour[]>([]);
  const [guideExplanationRequests, setGuideExplanationRequests] = useState<GuideExplanationRequest[]>([]);
  const [settlementInfoRequests, setSettlementInfoRequests] = useState<SettlementInfoRequest[]>([]);
  const [acceptingAssignmentIds, setAcceptingAssignmentIds] = useState<string[]>([]);
  const [rejectingAssignmentIds, setRejectingAssignmentIds] = useState<string[]>([]);
  const [submittingGuideRequestIds, setSubmittingGuideRequestIds] = useState<string[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => layDanhSachIdDaLuu(READ_NOTIFICATION_IDS_KEY));
  const [dismissedAssignmentNotificationIds, setDismissedAssignmentNotificationIds] = useState<string[]>(
    () => layDanhSachIdDaLuu(DISMISSED_ASSIGNMENT_NOTIFICATION_IDS_KEY)
  );
  const [guideProfile, setGuideProfile] = useState<any>(null);
  const [selectedGuideRequest, setSelectedGuideRequest] = useState<GuideExplanationRequest | null>(null);
  const [guideExplanationContent, setGuideExplanationContent] = useState('');
  const [selectedSettlementRequest, setSelectedSettlementRequest] = useState<SettlementInfoRequest | null>(null);
  const [settlementNoteContent, setSettlementNoteContent] = useState('');
  const [settlementReceiptUrl, setSettlementReceiptUrl] = useState('');

  const formatAllergyNote = (allergy: unknown): string => {
    const value = String(allergy || '').trim();
    if (!value) return '';
    const detail = value.replace(/^dị ứng\s*:?\s*/i, '').trim() || value;
    return `Dị ứng ${detail.charAt(0).toLocaleLowerCase('vi-VN')}${detail.slice(1)}`;
  };

  const buildHealthNotes = (p: any): string => {
    const notes = [
      p.ghiChuYTe,
      formatAllergyNote(p.diUng)
    ]
      .map((note) => String(note || '').trim())
      .filter(Boolean);

    return notes.join(' | ');
  };

  const mapPassenger = (p: any): Passenger => ({
    code: p.maKhachHang || p.maNguoiDongHanh,
    listKey: p.maDatTour
      ? `${p.maDatTour}:${p.loaiKhach || ''}:${p.maKhachHang || p.maNguoiDongHanh}`
      : undefined,
    maKhachHang: p.maKhachHang || undefined,
    maNguoiDongHanh: p.maNguoiDongHanh || undefined,
    loaiKhach: p.loaiKhach,
    name: p.hoTenKhachHang || p.hoTen,
    phone: p.soDienThoai || 'N/A',
    rank: p.hangThanhVien || 'THANH_VIEN',
    healthNotes: buildHealthNotes(p),
    status: p.trangThai || 'CHUA_DIEM_DANH',
    greenPoints: p.diemXanh || 0
  });

  const getTourStatusLabel = (status?: string): Tour['status'] => {
    switch (status) {
      case 'CHO_KICH_HOAT':
        return 'Chờ kích hoạt';
      case 'MO_BAN':
        return 'Mở bán';
      case 'SAP_DIEN_RA':
        return 'Sắp khởi hành';
      case 'DANG_DIEN_RA':
        return 'Đang diễn ra';
      case 'DA_QUYET_TOAN':
        return 'Đã quyết toán';
      default:
        return 'Kết thúc';
    }
  };

  const mapAssignmentToTour = (assignment: any): Tour => {
    const tourPassengers = (assignment.danhSachHanhKhach || []).map(mapPassenger);
    return {
      code: assignment.maTourThucTe,
      maPhanCong: assignment.maPhanCong,
      trangThaiChapNhan: assignment.trangThaiChapNhan,
      name: assignment.tenTour || assignment.maTourThucTe,
      departureDate: assignment.ngayKhoiHanh ? new Date(assignment.ngayKhoiHanh).toLocaleDateString('vi-VN') : '-',
      startDate: assignment.ngayKhoiHanh,
      endDate: assignment.ngayKetThuc || assignment.ngayKhoiHanh,
      destination: 'Chưa cập nhật',
      guestsCount: tourPassengers.length || assignment.soKhachDaXacNhan || 0,
      status: getTourStatusLabel(assignment.trangThaiTour),
      passengers: tourPassengers
    };
  };

  const loadPassengersForTour = async (maTourThucTe: string): Promise<Passenger[]> => {
    const passRes = await hdvService.layDanhSachDoan(maTourThucTe);
    return (passRes?.data || []).map(mapPassenger);
  };

  const hydrateTourDetails = async (tour: Tour): Promise<Tour> => {
    const [passengerResult, detailResult] = await Promise.allSettled([
      loadPassengersForTour(tour.code),
      hdvService.layLichTrinhTourThucTe(tour.code)
    ]);
    const hydratedTour = { ...tour };

    if (passengerResult.status === 'fulfilled') {
      hydratedTour.passengers = passengerResult.value;
      hydratedTour.guestsCount = passengerResult.value.length;
    }

    if (detailResult.status === 'fulfilled') {
      const lichTrinh = Array.isArray(detailResult.value?.data) ? detailResult.value.data : [];
      hydratedTour.itinerary = lichTrinh.map((item: any) => {
        const hoatDongStr = item.hoatDong || '';
        const isTimeline = /\d{2}:\d{2}\s*[-–—]/.test(hoatDongStr);
        const isMultiline = /\\n|\n|<br/.test(hoatDongStr);

        let title = item.tieuDe || 'Lịch trình trong ngày';
        let activitiesStr = hoatDongStr;

        if (!item.tieuDe && !isTimeline && !isMultiline && hoatDongStr.length > 0 && hoatDongStr.length < 150) {
          title = hoatDongStr;
          activitiesStr = '';
        } else if (!item.tieuDe && (isTimeline || isMultiline)) {
          title = 'Lịch trình trong ngày';
        } else if (!item.tieuDe && hoatDongStr) {
          title = hoatDongStr.substring(0, 50) + (hoatDongStr.length > 50 ? '...' : '');
        }

        return {
          day: item.ngayThu,
          title,
          description: item.moTa || undefined,
          menu: item.thucDon || undefined,
          activities: tachTimelineHoatDong(activitiesStr)
        };
      });
    }

    return hydratedTour;
  };

  const mapIncident = (i: any): IncidentType => ({
    id: i.maNhatKySuCo,
    tourCode: i.maTour,
    type: i.loaiSuCo || 'Khác',
    severity: i.mucDo === 'SOS' ? 'Cao' : 'Thấp',
    passengerName: i.hoTenKhachHang || i.passengerName,
    passengerCode: i.maKhachHang || i.maNguoiDongHanh || i.passengerCode,
    healthNotes: buildHealthNotes(i) || i.healthNotes,
    description: i.moTa,
    treatment: i.giaiPhap || '',
    result: i.giaiPhap || '',
    time: i.thoiGianBaoCao
  });

  const mapExpense = (e: any): Expense => ({
    id: e.maChiPhi,
    tourCode: e.maTour,
    category: e.danhMuc,
    amount: e.thanhTien,
    status: e.trangThaiDuyet,
    notes: e.ghiChu || e.danhMuc,
    date: e.ngayKhai,
    photoUrl: e.hoaDonAnh
  });

  const loadHdvData = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const tours = await hdvService.layDanhSachTour();
      const data = tours?.data || [];
      const pending = data.filter((t: any) => t.trangThaiChapNhan === 'CHO_PHAN_HOI');
      const accepted = data.filter((t: any) => t.trangThaiChapNhan === 'DA_DONG_Y');
      const ongoingTour = accepted.find((t: any) => t.trangThaiTour === 'DANG_DIEN_RA');
      const upcoming = accepted.filter((t: any) => ['CHO_KICH_HOAT', 'MO_BAN', 'SAP_DIEN_RA'].includes(t.trangThaiTour));
      const past = accepted.filter((t: any) => t.trangThaiTour === 'KET_THUC' || t.trangThaiTour === 'DA_QUYET_TOAN');

      setPendingTours(await Promise.all(pending.map((t: any) => hydrateTourDetails(mapAssignmentToTour(t)))));
      setUpcomingTours(await Promise.all(upcoming.map((t: any) => hydrateTourDetails(mapAssignmentToTour(t)))));
      setPastTours(await Promise.all(past.map((t: any) => hydrateTourDetails(mapAssignmentToTour(t)))));

      const [allIncRes, allExpRes, guideExplanationRes, settlementInfoRes] = await Promise.all([
        hdvService.layTatCaSuCo().catch(() => null),
        hdvService.layTatCaChiPhi().catch(() => null),
        hdvService.layYeuCauGiaiTrinh().catch(() => null),
        hdvService.layQuyetToanCanBoSung().catch(() => null)
      ]);
      setIncidents(Array.isArray(allIncRes?.data) ? allIncRes.data.map(mapIncident) : []);
      setExpenses(Array.isArray(allExpRes?.data) ? allExpRes.data.map(mapExpense) : []);
      setGuideExplanationRequests(Array.isArray(guideExplanationRes?.data) ? guideExplanationRes.data : []);
      setSettlementInfoRequests(Array.isArray(settlementInfoRes?.data) ? settlementInfoRes.data : []);

      if (ongoingTour) {
        const mappedTour = await hydrateTourDetails({ ...mapAssignmentToTour(ongoingTour), destination: 'Đang đi' });
        setCurrentTour(mappedTour);
        setPassengers(mappedTour.passengers || []);
      } else {
        setCurrentTour(null);
        setPassengers([]);
      }
    } catch (e) {
      console.error("Failed to fetch tour data", e);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadHdvData();
  }, [loadHdvData]);

  useEffect(() => {
    if (!isLoggedIn) return;
    localStorage.setItem(READ_NOTIFICATION_IDS_KEY, JSON.stringify(readNotificationIds));
  }, [isLoggedIn, readNotificationIds]);

  useEffect(() => {
    if (!isLoggedIn) return;
    localStorage.setItem(DISMISSED_ASSIGNMENT_NOTIFICATION_IDS_KEY, JSON.stringify(dismissedAssignmentNotificationIds));
  }, [dismissedAssignmentNotificationIds, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const loadGuideProfile = async () => {
      try {
        const res = await hdvService.layHoSo();
        setGuideProfile(res?.data || null);
      } catch (e) {
        console.error('Failed to fetch guide profile', e);
      }
    };

    loadGuideProfile();
  }, [isLoggedIn]);

  const handleAcceptAssignment = async (maPhanCong?: string) => {
    if (!maPhanCong) return;
    setAcceptingAssignmentIds(prev => [...prev, maPhanCong]);
    try {
      const tour = pendingTours.find(item => item.maPhanCong === maPhanCong);
      await hdvService.dongYPhanCong(maPhanCong);
      setNotifications(prev => [
        {
          id: `accepted-${maPhanCong}-${Date.now()}`,
          text: `Bạn đã đồng ý nhận tour ${tour?.code || maPhanCong}${tour?.name ? ` - ${tour.name}` : ''}.`,
          time: 'Vừa xong',
          read: false,
          type: 'ACTION_RESULT',
          tour
        },
        ...prev
      ]);
      await loadHdvData();
    } catch (e) {
      console.error('Failed to accept assignment', e);
      alert('Không thể đồng ý phân công. Vui lòng thử lại.');
    } finally {
      setAcceptingAssignmentIds(prev => prev.filter(id => id !== maPhanCong));
    }
  };

  const handleRejectAssignment = async (maPhanCong?: string) => {
    if (!maPhanCong) return;
    const confirmed = window.confirm('Bạn có chắc muốn từ chối yêu cầu điều phối này?');
    if (!confirmed) return;

    setRejectingAssignmentIds(prev => [...prev, maPhanCong]);
    try {
      const tour = pendingTours.find(item => item.maPhanCong === maPhanCong);
      await hdvService.tuChoiPhanCong(maPhanCong);
      setNotifications(prev => [
        {
          id: `rejected-${maPhanCong}-${Date.now()}`,
          text: `Bạn đã từ chối yêu cầu điều phối tour ${tour?.code || maPhanCong}${tour?.name ? ` - ${tour.name}` : ''}.`,
          time: 'Vừa xong',
          read: false,
          type: 'ACTION_RESULT',
          tour
        },
        ...prev
      ]);
      await loadHdvData();
    } catch (e) {
      console.error('Failed to reject assignment', e);
      alert('Không thể từ chối phân công. Vui lòng thử lại.');
    } finally {
      setRejectingAssignmentIds(prev => prev.filter(id => id !== maPhanCong));
    }
  };

  const handleOpenGuideExplanation = (request?: GuideExplanationRequest) => {
    if (!request) return;
    setSelectedGuideRequest(request);
    setGuideExplanationContent('');
    setNotificationOpen(false);
  };

  const handleSubmitGuideExplanation = async () => {
    const maYeuCau = selectedGuideRequest?.maYeuCau;
    if (!maYeuCau || !guideExplanationContent.trim()) {
      alert('Vui lòng nhập nội dung giải trình.');
      return;
    }

    setSubmittingGuideRequestIds(prev => [...prev, maYeuCau]);
    try {
      await hdvService.capNhatGiaiTrinh(maYeuCau, guideExplanationContent.trim());
      setNotifications(prev => [
        {
          id: `guide-explanation-sent-${maYeuCau}-${Date.now()}`,
          text: `Bạn đã gửi giải trình cho yêu cầu ${maYeuCau}.`,
          time: 'Vừa xong',
          read: false,
          type: 'ACTION_RESULT'
        },
        ...prev
      ]);
      setSelectedGuideRequest(null);
      setGuideExplanationContent('');
      await loadHdvData();
    } catch (e) {
      console.error('Failed to submit guide explanation', e);
      const apiMessage = (e as any)?.response?.data?.message || (e as any)?.response?.data?.error;
      alert(apiMessage || 'Không thể gửi giải trình. Vui lòng thử lại.');
    } finally {
      setSubmittingGuideRequestIds(prev => prev.filter(id => id !== maYeuCau));
    }
  };

  const handleOpenSettlementInfo = (request?: SettlementInfoRequest) => {
    if (!request) return;
    setSelectedSettlementRequest(request);
    setSettlementNoteContent('');
    setSettlementReceiptUrl(request.hoaDonAnh || '');
    setNotificationOpen(false);
  };

  const handleSubmitSettlementInfo = async () => {
    const maQuyetToan = selectedSettlementRequest?.maQuyetToan;
    if (!maQuyetToan || !settlementNoteContent.trim()) {
      alert('Vui lòng nhập ghi chú bổ sung.');
      return;
    }

    setSubmittingGuideRequestIds(prev => [...prev, maQuyetToan]);
    try {
      await hdvService.boSungQuyetToan(maQuyetToan, {
        ghiChu: settlementNoteContent.trim(),
        hoaDonAnh: settlementReceiptUrl.trim() || undefined
      });
      setNotifications(prev => [
        {
          id: `settlement-info-sent-${maQuyetToan}-${Date.now()}`,
          text: `Bạn đã gửi bổ sung quyết toán cho tour ${selectedSettlementRequest?.maTour || maQuyetToan}.`,
          time: 'Vừa xong',
          read: false,
          type: 'ACTION_RESULT'
        },
        ...prev
      ]);
      setSelectedSettlementRequest(null);
      setSettlementNoteContent('');
      setSettlementReceiptUrl('');
      await loadHdvData();
    } catch (e) {
      console.error('Failed to submit settlement info', e);
      const apiMessage = (e as any)?.response?.data?.message || (e as any)?.response?.data?.error;
      alert(apiMessage || 'Không thể gửi bổ sung quyết toán. Vui lòng thử lại.');
    } finally {
      setSubmittingGuideRequestIds(prev => prev.filter(id => id !== maQuyetToan));
    }
  };

  // Compute attendance stats to pass down
  const attendanceStats = useMemo(() => {
    const total = passengers.length;
    const checked = passengers.filter(p => p.status === 'DA_DIEM_DANH').length;
    const absent = passengers.filter(p => p.status === 'VANG').length;
    const pending = total - checked - absent;
    return { total, checked, absent, pending };
  }, [passengers]);

  const xuLyDangXuat = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(READ_NOTIFICATION_IDS_KEY);
    localStorage.removeItem(DISMISSED_ASSIGNMENT_NOTIFICATION_IDS_KEY);
    setIsLoggedIn(false);
    setReadNotificationIds([]);
    setDismissedAssignmentNotificationIds([]);
    setActiveTab('dashboard');
    setLoginError(null);
    setNotificationOpen(false);
    setGuideProfile(null);
  };

  const assignmentNotifications = useMemo<AppNotification[]>(() => {
    return pendingTours
      .filter(tour => !dismissedAssignmentNotificationIds.includes(`assignment-${tour.maPhanCong || tour.code}`))
      .map(tour => {
        const id = `assignment-${tour.maPhanCong || tour.code}`;
        return {
          id,
          text: `Yêu cầu xác nhận điều phối tour ${tour.code} - ${tour.name}.`,
          time: `Khởi hành ${tour.departureDate}`,
          read: readNotificationIds.includes(id),
          type: 'ASSIGNMENT_CONFIRMATION',
          tour
        };
      });
  }, [dismissedAssignmentNotificationIds, pendingTours, readNotificationIds]);

  const guideExplanationNotifications = useMemo<AppNotification[]>(() => {
    return guideExplanationRequests.map(request => {
      const id = `guide-explanation-${request.maYeuCau}`;
      return {
        id,
        text: `Admin yêu cầu bạn giải trình yêu cầu ${request.maYeuCau}${request.maDatTour ? ` của đơn ${request.maDatTour}` : ''}.`,
        time: 'Chờ bạn cập nhật nội dung',
        read: readNotificationIds.includes(id),
        type: 'GUIDE_EXPLANATION_REQUEST',
        supportRequest: request
      };
    });
  }, [guideExplanationRequests, readNotificationIds]);

  const settlementInfoNotifications = useMemo<AppNotification[]>(() => {
    return settlementInfoRequests.map(request => {
      const id = `settlement-info-${request.maQuyetToan}`;
      return {
        id,
        text: `Kế toán yêu cầu bổ sung quyết toán tour ${request.maTour}${request.tenTour ? ` - ${request.tenTour}` : ''}.`,
        time: 'Chờ ghi chú và hóa đơn ảnh',
        read: readNotificationIds.includes(id),
        type: 'SETTLEMENT_INFO_REQUEST',
        settlementRequest: request
      };
    });
  }, [readNotificationIds, settlementInfoRequests]);

  const allNotifications = useMemo(() => {
    return [...settlementInfoNotifications, ...guideExplanationNotifications, ...assignmentNotifications, ...notifications];
  }, [assignmentNotifications, guideExplanationNotifications, notifications, settlementInfoNotifications]);

  const handleMarkNotificationRead = (id: string) => {
    setReadNotificationIds(prev => prev.includes(id) ? prev : [...prev, id]);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setDismissedAssignmentNotificationIds(prev => [
      ...prev,
      ...assignmentNotifications.map(notification => notification.id).filter(id => !prev.includes(id))
    ]);
  };

  const unreadCount = useMemo(() => {
    return allNotifications.filter(n => !n.read).length;
  }, [allNotifications]);

  const guideInitials = useMemo(() => {
    if (!guideProfile?.hoTen) return 'HD';
    return guideProfile.hoTen
      .split(' ')
      .map((part: string) => part[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  }, [guideProfile]);

  // If not logged in, show the styled DangNhap component wrapped in a mobile layout
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
        {/* Mobile Device Frame Mockup for Browser Viewing */}
        <div className="w-full max-w-[420px] min-h-screen sm:min-h-[840px] sm:max-h-[860px] sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 bg-white flex flex-col overflow-hidden relative">

          {/* DangNhap view */}
          <DangNhap
            loginCode={loginCode}
            setLoginCode={setLoginCode}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            loginError={loginError}
            setLoginError={setLoginError}
            setIsLoggedIn={setIsLoggedIn}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
      {/* Mobile Device Frame Mockup for Browser Viewing */}
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[840px] sm:max-h-[860px] sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 bg-slate-50 flex flex-col overflow-hidden relative">

        {/* Global Premium Application Top Bar (Flat Design) */}
        {activeTab !== 'profile' && (
          <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-slate-100 shadow-sm sticky top-0 z-40">
            <div className="flex items-center space-x-2.5">
              {/* HoSoCaNhan avatar button on the far left */}
              <button
                onClick={() => setActiveTab('profile')}
                className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-sky-500 border border-white text-white font-extrabold text-[11px] flex items-center justify-center transition active:scale-90 shadow-sm shadow-sky-100 shrink-0 ring-2 ring-sky-50"
                title="Xem hồ sơ"
              >
                {guideInitials}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </button>
              <div>
                <h1 className="text-xs font-black text-slate-800 tracking-wider leading-none">DIGITAL TRAVEL</h1>
                <p className="text-[9px] text-sky-500 font-bold uppercase tracking-widest leading-none mt-1">Nghiệp vụ Hướng dẫn viên</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Notification Icon */}
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-1.5 hover:bg-slate-50 rounded-full text-slate-600 transition active:scale-90"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white font-extrabold text-[8px] rounded-full flex items-center justify-center animate-pulse leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Logout Icon button */}
              <button
                onClick={xuLyDangXuat}
                className="p-1.5 hover:bg-rose-50 hover:text-rose-500 rounded-full text-slate-500 transition active:scale-90"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>
        )}

        {/* --- GLOBAL POPUP: Notification Center List (Glassmorphism Modal) --- */}
        {notificationOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Centered Modal Content */}
            <div className="glass-modal max-w-sm w-full p-4 rounded-3xl animate-slide-up max-h-[70vh] overflow-y-auto space-y-4 shadow-2xl h-fit border border-sky-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-slate-800 text-sm">Thông báo nghiệp vụ</h3>
                  {unreadCount > 0 && (
                    <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full leading-none">{unreadCount} mới</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {allNotifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      className="text-[10px] text-slate-400 hover:text-rose-500 font-bold transition"
                    >
                      Xóa hết
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {allNotifications.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Bell size={28} className="mx-auto text-slate-300" />
                  <p className="text-xs text-slate-400 italic">Không có thông báo mới nào dành cho bạn.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allNotifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className={`p-3 rounded-2xl border text-xs text-left cursor-pointer transition relative overflow-hidden flex items-start space-x-2 ${n.type === 'GUIDE_EXPLANATION_REQUEST' ? 'pb-12' : ''} ${n.read ? 'bg-white border-slate-100 text-slate-500' : 'bg-sky-50/50 border-sky-100 text-slate-700 font-semibold'}`}
                    >
                      {!n.read && (
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0 mt-1.5"></span>
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="leading-relaxed">{n.text}</p>
                        <span className="text-[9px] text-slate-400 block font-mono">{n.time}</span>
                        {n.type === 'ASSIGNMENT_CONFIRMATION' && (
                          <span className="mt-2 inline-flex text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">
                            Chờ xác nhận
                          </span>
                        )}
                        {n.type === 'ACTION_RESULT' && (
                          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                            <CheckCircle size={12} />
                            Đã ghi nhận
                          </span>
                        )}
                        {n.type === 'GUIDE_EXPLANATION_REQUEST' && (
                          <button
                            type="button"
                            title="Cập nhật nội dung"
                            aria-label="Cập nhật nội dung"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleMarkNotificationRead(n.id);
                              handleOpenGuideExplanation(n.supportRequest);
                            }}
                            className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_6px_16px_rgba(14,165,233,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-700 hover:shadow-[0_10px_20px_rgba(14,165,233,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 active:translate-y-0 active:scale-95"
                          >
                            <Send size={17} strokeWidth={1.85} />
                          </button>
                        )}
                        {n.type === 'SETTLEMENT_INFO_REQUEST' && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleMarkNotificationRead(n.id);
                              handleOpenSettlementInfo(n.settlementRequest);
                            }}
                            className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 rounded-lg transition active:scale-95"
                          >
                            <Send size={12} />
                            Bổ sung quyết toán
                          </button>
                        )}
                      </div>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMarkNotificationRead(n.id);
                          }}
                          className="text-[10px] text-sky-500 font-extrabold hover:underline shrink-0"
                        >
                          Đọc
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setNotificationOpen(false)}
                className="w-full py-2 bg-sky-400 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        )}

        {selectedGuideRequest && (
          <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-modal max-w-sm w-full p-4 rounded-3xl animate-slide-up shadow-2xl border border-sky-100 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Cập nhật giải trình</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    {selectedGuideRequest.maYeuCau}
                    {selectedGuideRequest.maDatTour ? ` · ${selectedGuideRequest.maDatTour}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGuideRequest(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                  Nội dung gửi admin
                </label>
                <textarea
                  value={guideExplanationContent}
                  onChange={(event) => setGuideExplanationContent(event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 resize-none leading-relaxed"
                  placeholder="Nhập nội dung giải trình, thông tin xác minh hoặc bằng chứng liên quan..."
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitGuideExplanation}
                disabled={submittingGuideRequestIds.includes(selectedGuideRequest.maYeuCau || '')}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {submittingGuideRequestIds.includes(selectedGuideRequest.maYeuCau || '') ? 'Đang gửi...' : 'Gửi đến admin'}
              </button>
            </div>
          </div>
        )}

        {selectedSettlementRequest && (
          <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-modal max-w-sm w-full p-4 rounded-3xl animate-slide-up shadow-2xl border border-amber-100 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Bổ sung quyết toán</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    {selectedSettlementRequest.maQuyetToan}
                    {selectedSettlementRequest.maTour ? ` · ${selectedSettlementRequest.maTour}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSettlementRequest(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                  Ghi chú gửi kế toán
                </label>
                <textarea
                  value={settlementNoteContent}
                  onChange={(event) => setSettlementNoteContent(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none leading-relaxed"
                  placeholder="Nhập ghi chú giải trình số liệu, chứng từ hoặc thông tin bổ sung..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                  HoaDonAnh
                </label>
                <input
                  value={settlementReceiptUrl}
                  onChange={(event) => setSettlementReceiptUrl(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="https://.../hoa-don.jpg"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitSettlementInfo}
                disabled={submittingGuideRequestIds.includes(selectedSettlementRequest.maQuyetToan || '')}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {submittingGuideRequestIds.includes(selectedSettlementRequest.maQuyetToan || '') ? 'Đang gửi...' : 'Gửi về admin'}
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area (Scrollable PWA Viewport) */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
          {activeTab === 'dashboard' && (
            <BangDieuKhien
              currentTour={currentTour}
              upcomingTours={upcomingTours}
              pastTours={pastTours}
              pendingTours={pendingTours}
              passengers={passengers}
              expenses={expenses}
              attendanceStats={attendanceStats}
              setActiveTab={setActiveTab}
              onAcceptAssignment={handleAcceptAssignment}
              onRejectAssignment={handleRejectAssignment}
              acceptingAssignmentIds={acceptingAssignmentIds}
              rejectingAssignmentIds={rejectingAssignmentIds}
            />
          )}

          {activeTab === 'schedule' && (
            <LichTrinh maTourThucTe={currentTour?.code} />
          )}

          {activeTab === 'attendance' && (
            <DiemDanh
              currentTour={currentTour}
              passengers={passengers}
              setPassengers={setPassengers}
            />
          )}

          {activeTab === 'green' && (
            <DiemXanh
              maTour={currentTour?.code}
              passengers={passengers}
              setPassengers={setPassengers}
            />
          )}

          {activeTab === 'expense' && (
            <QuanLyChiPhi
              maTour={currentTour?.code}
              currentTour={currentTour}
              pastTours={pastTours}
              expenses={expenses}
              setExpenses={setExpenses}
            />
          )}

          {activeTab === 'incident' && (
            <BaoCaoSuCo
              maTour={currentTour?.code}
              currentTour={currentTour}
              pastTours={pastTours}
              passengers={passengers}
              incidents={incidents}
              setIncidents={setIncidents}
            />
          )}

          {activeTab === 'profile' && (
            <HoSoCaNhan
              onBack={() => setActiveTab('dashboard')}
              onLogout={xuLyDangXuat}
            />
          )}
        </main>

        {/* Premium Bottom PWA Tab bar Navigation (Fluid & Styled) */}
        {activeTab !== 'profile' && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto sm:absolute sm:max-w-none bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-between items-center py-2.5 px-3 z-40 shadow-lg shadow-sky-900/5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-sky-500 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Compass size={16} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
              <span className="text-[9px] uppercase tracking-wider">Tổng quan</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${activeTab === 'schedule' ? 'text-sky-500 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Calendar size={16} strokeWidth={activeTab === 'schedule' ? 2.5 : 2} />
              <span className="text-[9px] uppercase tracking-wider">Lịch trình</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${activeTab === 'attendance' ? 'text-sky-500 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Users size={16} strokeWidth={activeTab === 'attendance' ? 2.5 : 2} />
              <span className="text-[9px] uppercase tracking-wider">Điểm danh</span>
            </button>

            <button
              onClick={() => setActiveTab('green')}
              className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${activeTab === 'green' ? 'text-emerald-500 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Leaf size={16} strokeWidth={activeTab === 'green' ? 2.5 : 2} />
              <span className="text-[9px] uppercase tracking-wider">Điểm xanh</span>
            </button>

            <button
              onClick={() => setActiveTab('expense')}
              className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${activeTab === 'expense' ? 'text-amber-500 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <DollarSign size={16} strokeWidth={activeTab === 'expense' ? 2.5 : 2} />
              <span className="text-[9px] uppercase tracking-wider">Chi phí</span>
            </button>

            <button
              onClick={() => setActiveTab('incident')}
              className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${activeTab === 'incident' ? 'text-rose-500 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <AlertTriangle size={16} strokeWidth={activeTab === 'incident' ? 2.5 : 2} />
              <span className="text-[9px] uppercase tracking-wider">Sự cố</span>
            </button>
          </nav>
        )}

      </div>
    </div>
  );
}
