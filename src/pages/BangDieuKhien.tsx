import { useState } from 'react';
import { MapPin, Users, DollarSign, ChevronRight, Loader2 } from 'lucide-react';
import type { Tour, Expense, Passenger } from '../types';
import { hdvService } from '../services/hdvService';

interface DashboardProps {
  currentTour: Tour | null;
  upcomingTours: Tour[];
  pastTours: Tour[];
  passengers: Passenger[];
  expenses: Expense[];
  attendanceStats: {
    total: number;
    checked: number;
    absent: number;
    pending: number;
  };
  setActiveTab: (tab: 'dashboard' | 'schedule' | 'attendance' | 'green' | 'expense' | 'incident' | 'profile') => void;
}

// Helper: Get passenger member rank labels (unified with DiemDanh.tsx)
const layHuyHieuHangThanhVien = (rank: string) => {
  switch (rank) {
    case 'KIM_CUONG':
      return <span className="text-[9px] font-bold text-slate-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded leading-none shrink-0">💎Kim Cương</span>;
    case 'VANG':
      return <span className="text-[9px] font-bold text-amber-600 bg-amber-50/50 border border-amber-200/50 px-1.5 py-0.5 rounded leading-none shrink-0">⭐ Vàng</span>;
    case 'BAC':
      return <span className="text-[9px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded leading-none shrink-0">Bạc</span>;
    case 'DONG':
      return <span className="text-[9px] font-semibold text-amber-700 bg-amber-50/30 border border-amber-200/30 px-1.5 py-0.5 rounded leading-none shrink-0">Đồng</span>;
    default:
      return <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded leading-none shrink-0">Thành viên</span>;
  }
};

// Helper function removed because it is unused

export default function BangDieuKhien({ currentTour, upcomingTours, pastTours, passengers, expenses, attendanceStats, setActiveTab }: DashboardProps) {
  const [selectedUpcomingTour, setSelectedUpcomingTour] = useState<Tour | null>(null);
  const [modalTab, setModalTab] = useState<'ITINERARY' | 'PASSENGERS'>('ITINERARY');
  const [selectedTourPassengers, setSelectedTourPassengers] = useState<Passenger[]>([]);
  const [selectedTourItinerary, setSelectedTourItinerary] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const handleOpenTour = async (tour: Tour) => {
    setSelectedUpcomingTour(tour);
    setModalTab('ITINERARY');
    setIsLoadingDetails(true);
    setDetailError(null);
    setSelectedTourPassengers([]);
    setSelectedTourItinerary([]);
    try {
      const [passengerResult, itineraryResult] = await Promise.allSettled([
        hdvService.layDanhSachDoan(tour.code),
        hdvService.layLichTrinhTourThucTe(tour.code)
      ]);

      if (passengerResult.status === 'fulfilled' && passengerResult.value?.data) {
        const mapped = passengerResult.value.data.map((p: any) => ({
          code: p.maKhachHang || p.maNguoiDongHanh,
          maKhachHang: p.maKhachHang || undefined,
          maNguoiDongHanh: p.maNguoiDongHanh || undefined,
          loaiKhach: p.loaiKhach,
          name: p.hoTenKhachHang || p.hoTen || '(Chưa cập nhật tên)',
          phone: p.soDienThoai || 'N/A',
          rank: p.hangThanhVien || 'THANH_VIEN',
          healthNotes: p.ghiChuYTe || p.ghiChu || '',
          bookingNotes: p.ghiChuDatTour || '',
          status: p.trangThai || 'CHUA_DIEM_DANH',
          greenPoints: p.diemXanh || 0
        }));
        setSelectedTourPassengers(mapped);
        setSelectedUpcomingTour({ ...tour, guestsCount: mapped.length });
      } else {
        setSelectedTourPassengers([]);
      }

      if (itineraryResult.status === 'fulfilled') {
        const tourRes = itineraryResult.value;
        if (tourRes?.data?.lichTrinh) {
          setSelectedTourItinerary(tourRes.data.lichTrinh);
        } else if (tourRes?.data?.lichTrinhTours) {
          setSelectedTourItinerary(tourRes.data.lichTrinhTours);
        } else {
          setSelectedTourItinerary([]);
        }
      }

      if (passengerResult.status === 'rejected' || itineraryResult.status === 'rejected') {
        setDetailError('Một phần dữ liệu chi tiết chưa tải được. Vui lòng kiểm tra backend hoặc thử lại.');
      }
    } catch (e) {
      console.error(e);
      setSelectedTourPassengers([]);
      setSelectedTourItinerary([]);
      setDetailError('Không thể tải chi tiết tour. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Helper: Format price currency
  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Current Active Tour Banner */}
      {currentTour ? (
        <div className="relative rounded-3xl overflow-hidden h-40 bg-slate-900 text-white shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-70 bg-[url('https://images.unsplash.com/photo-1540206395-68808572332f?q=80&w=640')]"></div>

          <div className="absolute inset-0 p-4 z-20 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] bg-gradient-to-r from-sky-400/90 to-blue-500/90 backdrop-blur-md border border-sky-300/50 font-black px-3 py-1 rounded-full uppercase tracking-widest text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                Đang diễn ra
              </span>
              <span className="text-xs bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full font-mono">
                {currentTour.code}
              </span>
            </div>

            <div className="z-10 mt-auto">
              <p className="text-xs text-sky-100 font-medium uppercase tracking-wider mb-1 flex items-center">
                <MapPin size={12} className="mr-1" /> {currentTour.destination}
              </p>
              <h1 className="text-lg font-bold leading-tight mb-2">
                {currentTour.name}
              </h1>
              <div className="flex items-center justify-between text-xs text-sky-100/90 border-t border-white/20 pt-2">
                <span>Khởi hành: {currentTour.departureDate}</span>
                <span className="font-semibold flex items-center">
                  <Users size={12} className="mr-1" /> {currentTour.guestsCount || passengers.length} Khách hàng
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden h-40 bg-slate-100 flex items-center justify-center">
          <p className="text-slate-400 font-medium">Chưa có chuyến đi nào đang diễn ra</p>
        </div>
      )}

      {/* DiemDanh quick metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => setActiveTab('attendance')}
          className="glass-card p-3 rounded-2xl flex flex-col justify-between cursor-pointer hover:bg-slate-50/80 active:scale-95 transition-all"
        >
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-medium">Tiến độ điểm danh</span>
            <Users size={16} className="text-sky-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {attendanceStats.checked}/{attendanceStats.total}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {attendanceStats.pending} chưa điểm danh • {attendanceStats.absent} vắng
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-sky-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(attendanceStats.checked / attendanceStats.total) * 100}%` }}
            ></div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('expense')}
          className="glass-card p-3 rounded-2xl flex flex-col justify-between cursor-pointer hover:bg-slate-50/80 active:scale-95 transition-all"
        >
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-medium">Chi phí phát sinh</span>
            <DollarSign size={16} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {expenses.filter(e => e.status === 'CHO_DUYET').length} yêu cầu chờ duyệt
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-amber-600">
            <span>Đã chi từ tạm ứng</span>
            <ChevronRight size={12} />
          </div>
        </div>
      </div>

      {/* Upcoming LichTrinh (Lịch trình sắp khởi hành) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Lịch trình sắp khởi hành</span>
          <span className="text-[11px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">{upcomingTours.length} chuyến</span>
        </h3>

        <div className="space-y-2">
          {upcomingTours.map((tour) => (
            <div
              key={tour.code}
              onClick={() => handleOpenTour(tour)}
              className="glass-card p-3 rounded-2xl flex items-center justify-between border-l-4 border-l-sky-400 cursor-pointer hover:bg-slate-50/50 transition-all duration-200"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-500 font-mono">
                    {tour.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-700">
                    {tour.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Khởi hành: {tour.departureDate} • Quy mô: {tour.guestsCount} khách
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Trip History (Lịch sử chuyến đi đã dẫn) */}
      <div className="space-y-2 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Lịch sử chuyến đi đã dẫn</span>
          <span className="text-[11px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">{pastTours.length} chuyến</span>
        </h3>

        <div className="space-y-2">
          {pastTours.map((tour) => (
            <div
              key={tour.code}
              onClick={() => handleOpenTour(tour)}
              className="glass-card p-3 rounded-2xl flex items-center justify-between border-l-4 border-l-slate-400 cursor-pointer hover:bg-slate-50/50 transition-all duration-200"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {tour.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-700">
                    {tour.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Hoàn thành: {tour.departureDate} • Quy mô: {tour.guestsCount} khách • <span className={tour.status === 'Đã quyết toán' || tour.status === 'Kết thúc' ? "text-emerald-600 font-bold" : "text-sky-600 font-bold"}>{tour.status}</span>
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* --- GLOBAL POPUP: UPCOMING TOUR ITINERARY BOTTOM SHEET --- */}
      {selectedUpcomingTour && (
        <div className="absolute inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal max-w-sm w-full p-4 rounded-3xl animate-slide-up max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Chi tiết lịch trình</h3>
              <button
                onClick={() => setSelectedUpcomingTour(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-1.5 overflow-hidden">
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-black uppercase shrink-0 font-mono border border-sky-200/50">
                    {selectedUpcomingTour.code}
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <div className="animate-marquee">
                      <h4 className="font-black text-sm text-sky-900 pr-8">
                        {selectedUpcomingTour.name}
                      </h4>
                      <h4 className="font-black text-sm text-sky-900 pr-8" aria-hidden="true">
                        {selectedUpcomingTour.name}
                      </h4>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Khởi hành: <span className="font-bold text-slate-700">{selectedUpcomingTour.departureDate}</span> • Quy mô: <span className="font-bold text-slate-700">{selectedTourPassengers.length || selectedUpcomingTour.guestsCount} khách</span>
                </p>
              </div>
            </div>

            {/* Ultra-Premium Segmented Tab Control */}
            <div className="bg-slate-50 p-1 rounded-xl flex space-x-1 border border-slate-100">
              <button
                onClick={() => setModalTab('ITINERARY')}
                className={`flex-1 py-1.5 text-[11px] rounded-lg font-bold transition-all duration-300 ${modalTab === 'ITINERARY'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                  : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                Chi tiết lịch trình
              </button>
              <button
                onClick={() => setModalTab('PASSENGERS')}
                className={`flex-1 py-1.5 text-[11px] rounded-lg font-bold transition-all duration-300 ${modalTab === 'PASSENGERS'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                  : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                Hành khách ({selectedTourPassengers.length || selectedUpcomingTour.guestsCount})
              </button>
            </div>

            {detailError && (
              <div className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                {detailError}
              </div>
            )}

            {isLoadingDetails ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="animate-spin text-sky-400" size={24} />
                <span className="text-[10px] text-slate-400 font-bold">Đang tải dữ liệu...</span>
              </div>
            ) : modalTab === 'PASSENGERS' ? (
              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {selectedTourPassengers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Chưa có danh sách hành khách.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTourPassengers.map((guest) => (
                      <div
                        key={guest.code}
                        className="bg-white p-3.5 rounded-2xl flex flex-col justify-between border border-slate-100 shadow-sm transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5 text-left">
                            <div className="flex items-center space-x-1.5">
                              <h4 className="font-black text-slate-800 text-sm">{guest.name}</h4>
                              {layHuyHieuHangThanhVien(guest.rank || 'THANH_VIEN')}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">SĐT: {guest.phone}</p>
                          </div>
                        </div>

                        {guest.healthNotes && (
                          <div className="mt-1 text-rose-500 text-[11px] leading-relaxed text-left">
                            <span className="font-extrabold">Lưu ý:</span>{' '}
                            <span className="font-semibold">{guest.healthNotes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-3.5 pl-3 relative border-l border-sky-100 max-h-[42vh] overflow-y-auto pr-1">
                  {selectedTourItinerary.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Chưa cập nhật chi tiết lịch trình.</p>
                  ) : (
                    selectedTourItinerary.map((item: any, index: number) => (
                      <div key={index} className="relative pl-4 pb-2">
                        <span className="absolute -left-[22px] top-1 w-3 h-3 bg-sky-400 border-2 border-white rounded-full"></span>
                        <h4 className="text-xs font-bold text-slate-800">Ngày {item.ngayThu || index + 1}: {item.hoatDong || item.tieuDe}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.moTa || item.noiDung}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedUpcomingTour(null)}
              className="w-full py-2 bg-sky-400 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Đồng ý đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
