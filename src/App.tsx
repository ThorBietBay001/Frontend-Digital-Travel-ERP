import { useState, useMemo, useEffect } from 'react';
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
  Battery, 
  Wifi 
} from 'lucide-react';
import type { Passenger, Expense, BaoCaoSuCo as IncidentType } from './types';
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [guideProfile, setGuideProfile] = useState<any>(null);

  // UI States
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [currentTour, setCurrentTour] = useState<any>(null);
  const [upcomingTours, setUpcomingTours] = useState<any[]>([]);
  const [pastTours, setPastTours] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        try {
          const profileRes = await hdvService.layHoSo();
          if (profileRes?.data) setGuideProfile(profileRes.data);

          const tours = await hdvService.layDanhSachTour();
          if (tours?.data?.length > 0) {
            const ongoingTour = tours.data.find((t: any) => t.trangThaiTour === 'DANG_DIEN_RA');
            const upcoming = tours.data.filter((t: any) => ['MO_BAN', 'DA_CHOT', 'SAP_DIEN_RA'].includes(t.trangThaiTour));
            const past = tours.data.filter((t: any) => ['KET_THUC', 'DA_QUYET_TOAN', 'DA_HUY', 'HUY'].includes(t.trangThaiTour));
            
            // --- NOTIFICATION SYSTEM (Frontend Polling) ---
            const currentAssignments = tours.data.map((t: any) => t.maPhanCong);
            const savedAssignments = JSON.parse(localStorage.getItem('knownAssignments') || '[]');
            
            // Check for new assignments
            const newAssignments = currentAssignments.filter((ma: string) => !savedAssignments.includes(ma));
            if (newAssignments.length > 0) {
              const newNotifs = newAssignments.map((ma: string) => {
                const tourDetail = tours.data.find((t: any) => t.maPhanCong === ma);
                return {
                  id: Date.now() + Math.random(),
                  text: `Bạn vừa được phân công dẫn tour mới: ${tourDetail?.tenTour || tourDetail?.maTourThucTe}`,
                  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  read: false
                };
              });
              setNotifications(prev => [...newNotifs, ...prev]);
              // Update known assignments
              localStorage.setItem('knownAssignments', JSON.stringify([...savedAssignments, ...newAssignments]));
            } else if (savedAssignments.length === 0) {
              // Initial load: just save current assignments without notifying
              localStorage.setItem('knownAssignments', JSON.stringify(currentAssignments));
            }

            setUpcomingTours(upcoming.map((t: any) => ({
              code: t.maTourThucTe,
              name: t.tenTour || t.maTourThucTe,
              departureDate: new Date(t.ngayKhoiHanh).toLocaleDateString('vi-VN'),
              destination: 'Chưa cập nhật',
              guestsCount: t.soKhachToiDa && t.choConLai !== undefined ? t.soKhachToiDa - t.choConLai : 0,
              status: 'Sắp khởi hành'
            })));

            setPastTours(past.map((t: any) => ({
              code: t.maTourThucTe,
              name: t.tenTour || t.maTourThucTe, 
              departureDate: new Date(t.ngayKhoiHanh).toLocaleDateString('vi-VN'),
              endDateIso: t.ngayKetThuc || t.ngayKhoiHanh,
              destination: 'Chưa cập nhật',
              guestsCount: t.soKhachToiDa && t.choConLai !== undefined ? t.soKhachToiDa - t.choConLai : 0,
              status: t.trangThaiTour === 'DA_QUYET_TOAN' ? 'Đã quyết toán' : 'Kết thúc'
            })));

            if (ongoingTour) {
              // Map it to match BangDieuKhien.tsx props
              const mappedTour = {
                code: ongoingTour.maTourThucTe,
                name: ongoingTour.tenTour || ongoingTour.maTourThucTe,
                departureDate: new Date(ongoingTour.ngayKhoiHanh).toLocaleDateString('vi-VN'),
                destination: 'Đang đi', // Fallback
                guestsCount: 0,
                status: 'Đang diễn ra',
                maTourThucTe: ongoingTour.maTourThucTe
              };
              setCurrentTour(mappedTour);
              
              // Fetch đoàn
              const passRes = await hdvService.layDanhSachDoan(ongoingTour.maTourThucTe);
              if (passRes?.data) {
                const mapped = passRes.data.map((p: any) => ({
                  code: p.maKhachHang || p.maNguoiDongHanh,
                  maKhachHang: p.maKhachHang || undefined,
                  maNguoiDongHanh: p.maNguoiDongHanh || undefined,
                  loaiKhach: p.loaiKhach,
                  name: p.hoTenKhachHang || p.hoTen,
                  phone: p.soDienThoai || 'N/A',
                  rank: p.hangThanhVien || 'THANH_VIEN',
                  healthNotes: p.ghiChuYTe || p.ghiChu || '',
                  bookingNotes: p.ghiChuDatTour || '',
                  status: p.trangThai || 'CHUA_DIEM_DANH',
                  greenPoints: p.diemXanh || 0
                }));
                setPassengers(mapped);
                setCurrentTour({ ...mappedTour, guestsCount: mapped.length });
              }
            } else {
              setCurrentTour(null);
            }

            // --- TÍNH NĂNG MỚI: TỔNG HỢP CHI PHÍ VÀ SỰ CỐ CHO TẤT CẢ TOUR ---
            const allTours = [...upcoming, ...past];
            if (ongoingTour) allTours.push(ongoingTour);

            let allExpenses: any[] = [];
            let allIncidents: any[] = [];

            await Promise.all(allTours.map(async (t) => {
              try {
                const expRes = await hdvService.layChiPhi(t.maTourThucTe);
                if (expRes?.data) allExpenses = [...allExpenses, ...expRes.data];
              } catch (e) {}
              try {
                const incRes = await hdvService.laySuCo(t.maTourThucTe);
                if (incRes?.data) allIncidents = [...allIncidents, ...incRes.data];
              } catch (e) {}
            }));

            setExpenses(allExpenses.map((e: any) => ({
              id: e.maChiPhi,
              category: e.danhMuc,
              amount: e.thanhTien,
              status: e.trangThaiDuyet,
              notes: e.ghiChu || e.danhMuc,
              date: e.ngayKhai || new Date().toLocaleDateString('vi-VN'),
              photoUrl: e.hoaDonAnh
            })));

            setIncidents(allIncidents.map((sc: any) => ({
              id: sc.maNhatKySuCo,
              type: sc.loaiSuCo || 'Khác',
              severity: sc.mucDo || 'Thấp',
              status: sc.giaiPhap ? 'DA_XU_LY' : 'DANG_XU_LY',
              time: sc.thoiGianBaoCao || new Date().toLocaleString('vi-VN'),
              description: sc.moTa,
              solution: sc.giaiPhap || '',
              treatment: sc.giaiPhap || '',
              result: sc.giaiPhap || ''
            })));
          }
        } catch (e) {
          console.error("Failed to fetch tour data", e);
        }
      };
      
      // Initial fetch
      fetchData();

      // Polling every 30 seconds for real-time notification
      const intervalId = setInterval(fetchData, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [isLoggedIn]);

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
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setLoginError(null);
    setNotificationOpen(false);
  };

  const handleMarkNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const guideInitials = guideProfile?.hoTen ? guideProfile.hoTen.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase() : 'HD';

  // If not logged in, show the styled DangNhap component wrapped in a mobile layout
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4">
        {/* Mobile Device Frame Mockup for Browser Viewing */}
        <div className="w-full max-w-[420px] min-h-screen sm:min-h-[840px] sm:max-h-[860px] sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 bg-white flex flex-col overflow-hidden relative">
          
          {/* Header Status Bar (Simulated Mobile) */}
          <div className="bg-gradient-to-r from-sky-100/50 via-white to-sky-50 px-5 pt-3 pb-1 flex justify-between items-center text-[10px] font-bold text-slate-500 z-50">
            <span>02:15</span>
            <div className="flex items-center space-x-1.5">
              <Wifi size={10} className="stroke-[2.5px]" />
              <span className="text-[9px]">LTE</span>
              <Battery size={14} className="stroke-[2px]" />
            </div>
          </div>

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
        
        {/* Simulated PWA Mobile Header Status Bar */}
        <div className="bg-white px-5 pt-3 pb-1.5 flex justify-between items-center text-[10px] font-bold text-slate-500 z-50 border-b border-slate-100">
          <span>02:15</span>
          <div className="flex items-center space-x-1.5">
            <Wifi size={10} className="stroke-[2.5px]" />
            <span className="text-[9px]">LTE</span>
            <Battery size={14} className="stroke-[2px]" />
          </div>
        </div>

        {/* Global Premium Application Top Bar (Flat Design) */}
        {activeTab !== 'profile' && (
          <header className="bg-white px-4 py-3 flex justify-between items-center border-b border-slate-100 shadow-sm sticky top-0 z-40">
            <div className="flex items-center space-x-2.5">
              {/* HoSoCaNhan avatar button on the far left */}
              <button 
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 text-sky-600 font-extrabold text-[11px] flex items-center justify-center transition active:scale-90 shadow-sm shrink-0"
                title="Xem hồ sơ"
              >
                {guideInitials}
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
          <div className="absolute inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex justify-center p-4">
            {/* Centered Modal Content */}
            <div className="glass-modal max-w-sm w-full mt-14 p-4 rounded-3xl animate-slide-up max-h-[50vh] overflow-y-auto space-y-4 shadow-2xl h-fit border border-sky-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-slate-800 text-sm">Thông báo nghiệp vụ</h3>
                  {unreadCount > 0 && (
                    <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full leading-none">{unreadCount} mới</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
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

              {notifications.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <span className="text-3xl block">🔔</span>
                  <p className="text-xs text-slate-400 italic">Không có thông báo mới nào dành cho bạn.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className={`p-3 rounded-2xl border text-xs text-left cursor-pointer transition relative overflow-hidden flex items-start space-x-2 ${n.read ? 'bg-white border-slate-100 text-slate-500' : 'bg-sky-50/50 border-sky-100 text-slate-700 font-semibold'}`}
                    >
                      {!n.read && (
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0 mt-1.5"></span>
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="leading-relaxed">{n.text}</p>
                        <span className="text-[9px] text-slate-400 block font-mono">{n.time}</span>
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

        {/* Main Content Area (Scrollable PWA Viewport) */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
          {activeTab === 'dashboard' && (
            <BangDieuKhien 
              currentTour={currentTour}
              upcomingTours={upcomingTours}
              pastTours={pastTours}
              passengers={passengers}
              expenses={expenses}
              attendanceStats={attendanceStats}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'schedule' && (
            <LichTrinh maTourThucTe={currentTour?.maTourThucTe} />
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
              maTour={currentTour?.maTourThucTe}
              passengers={passengers}
              setPassengers={setPassengers}
            />
          )}

          {activeTab === 'expense' && (
            <QuanLyChiPhi 
              maTour={currentTour?.maTourThucTe}
              allTours={[...(currentTour ? [currentTour] : []), ...pastTours]}
              expenses={expenses}
              setExpenses={setExpenses}
            />
          )}

          {activeTab === 'incident' && (
            <BaoCaoSuCo 
              maTour={currentTour?.maTourThucTe}
              allTours={[...(currentTour ? [currentTour] : []), ...pastTours]}
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
          <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-between items-center py-2.5 px-3 z-40 shadow-lg shadow-sky-900/5">
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
