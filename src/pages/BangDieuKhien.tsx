import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, MapPin, Users, DollarSign, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import type { Tour, Expense, Passenger } from '../types';

interface DashboardProps {
  currentTour: Tour | null;
  upcomingTours: Tour[];
  pastTours: Tour[];
  pendingTours: Tour[];
  passengers: Passenger[];
  expenses: Expense[];
  attendanceStats: {
    total: number;
    checked: number;
    absent: number;
    pending: number;
  };
  setActiveTab: (tab: 'dashboard' | 'schedule' | 'attendance' | 'green' | 'expense' | 'incident' | 'profile') => void;
  onAcceptAssignment: (maPhanCong?: string) => void;
  onRejectAssignment: (maPhanCong?: string) => void;
  acceptingAssignmentIds: string[];
  rejectingAssignmentIds: string[];
}

const PAGE_SIZE = 4;

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

interface PaginationTabsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getPaginationItems = (totalPages: number, currentPage: number) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = Array.from(new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]))
    .filter(page => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return pages.reduce<(number | 'ellipsis')[]>((items, page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push('ellipsis');
    items.push(page);
    return items;
  }, []);
};

function PaginationTabs({ currentPage, totalPages, onPageChange }: PaginationTabsProps) {
  if (totalPages <= 1) return null;
  const pageItems = getPaginationItems(totalPages, currentPage);

  return (
    <nav aria-label="Phân trang" className="mx-auto mt-1 flex w-fit items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
        aria-label="Trang trước"
      >
        <ChevronLeft size={14} />
      </button>
      {pageItems.map((page, index) => page === 'ellipsis' ? (
        <span key={`ellipsis-${index}`} className="size-8 rounded-lg border border-slate-100 bg-white text-[11px] font-semibold text-slate-400 flex items-center justify-center">
          ...
        </span>
      ) : (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`size-8 rounded-lg border bg-white text-[11px] font-semibold transition active:scale-95 ${
            currentPage === page
              ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500'
              : 'border-slate-100 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
          }`}
          aria-label={`Trang ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
        aria-label="Trang sau"
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}

export default function BangDieuKhien({
  currentTour,
  upcomingTours,
  pastTours,
  pendingTours,
  passengers,
  expenses,
  attendanceStats,
  setActiveTab,
  onAcceptAssignment,
  onRejectAssignment,
  acceptingAssignmentIds,
  rejectingAssignmentIds
}: DashboardProps) {
  const [selectedUpcomingTour, setSelectedUpcomingTour] = useState<Tour | null>(null);
  const [modalTab, setModalTab] = useState<'ITINERARY' | 'PASSENGERS'>('ITINERARY');
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const totalUpcomingPages = Math.max(1, Math.ceil(upcomingTours.length / PAGE_SIZE));
  const totalPastPages = Math.max(1, Math.ceil(pastTours.length / PAGE_SIZE));
  const paginatedUpcomingTours = useMemo(
    () => upcomingTours.slice((upcomingPage - 1) * PAGE_SIZE, upcomingPage * PAGE_SIZE),
    [upcomingPage, upcomingTours]
  );
  const paginatedPastTours = useMemo(
    () => pastTours.slice((pastPage - 1) * PAGE_SIZE, pastPage * PAGE_SIZE),
    [pastPage, pastTours]
  );

  useEffect(() => {
    setUpcomingPage(prev => Math.min(prev, totalUpcomingPages));
  }, [totalUpcomingPages]);

  useEffect(() => {
    setPastPage(prev => Math.min(prev, totalPastPages));
  }, [totalPastPages]);

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
              style={{ width: `${attendanceStats.total > 0 ? (attendanceStats.checked / attendanceStats.total) * 100 : 0}%` }}
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

      {pendingTours.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Yêu cầu điều phối</span>
            <span className="text-[11px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-mono">{pendingTours.length} yêu cầu</span>
          </h3>
          <div className="space-y-2">
            {pendingTours.map((tour) => {
              const accepting = acceptingAssignmentIds.includes(tour.maPhanCong || '');
              const rejecting = rejectingAssignmentIds.includes(tour.maPhanCong || '');
              const responding = accepting || rejecting;
              return (
                <div
                  key={tour.maPhanCong || tour.code}
                  className="glass-card p-3 rounded-2xl border-l-4 border-l-amber-400 space-y-3"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-mono">
                        {tour.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-700">{tour.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Khởi hành: {tour.departureDate} • Trạng thái tour: {tour.status}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUpcomingTour(tour);
                      setModalTab('ITINERARY');
                    }}
                    className="w-full h-9 rounded-xl bg-white text-sky-600 text-xs font-bold shadow-sm ring-1 ring-sky-100 transition active:scale-95 flex items-center justify-center gap-1.5"
                    aria-label={`Xem chi tiết tour ${tour.code}`}
                  >
                    <Eye size={14} />
                    Xem chi tiết tour
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onRejectAssignment(tour.maPhanCong)}
                      disabled={responding}
                      className="h-9 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold shadow-sm ring-1 ring-rose-100 transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center gap-1.5"
                    >
                      <X size={14} />
                      {rejecting ? 'Đang từ chối...' : 'Từ chối'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onAcceptAssignment(tour.maPhanCong)}
                      disabled={responding}
                      className="h-9 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-300 flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} />
                      {accepting ? 'Đang xác nhận...' : 'Đồng ý'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming LichTrinh (Lịch trình sắp khởi hành) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Lịch trình đã nhận</span>
          <span className="text-[11px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">{upcomingTours.length} chuyến</span>
        </h3>

        <div className="space-y-2">
          {paginatedUpcomingTours.map((tour) => (
            <div
              key={tour.code}
              onClick={() => {
                setSelectedUpcomingTour(tour);
                setModalTab('ITINERARY');
              }}
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
                  Khởi hành: {tour.departureDate} • {tour.status} • {tour.guestsCount} khách xác nhận
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
        {upcomingTours.length > PAGE_SIZE && (
          <PaginationTabs
            currentPage={upcomingPage}
            totalPages={totalUpcomingPages}
            onPageChange={setUpcomingPage}
          />
        )}
      </div>

      {/* Trip History (Lịch sử chuyến đi đã dẫn) */}
      <div className="space-y-2 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Lịch sử chuyến đi đã dẫn</span>
          <span className="text-[11px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">{pastTours.length} chuyến</span>
        </h3>

        <div className="space-y-2">
          {paginatedPastTours.map((tour) => (
            <div
              key={tour.code}
              onClick={() => {
                setSelectedUpcomingTour(tour);
                setModalTab('ITINERARY');
              }}
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
        {pastTours.length > PAGE_SIZE && (
          <PaginationTabs
            currentPage={pastPage}
            totalPages={totalPastPages}
            onPageChange={setPastPage}
          />
        )}
      </div>

      {/* --- GLOBAL POPUP: UPCOMING TOUR ITINERARY BOTTOM SHEET --- */}
      {selectedUpcomingTour && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal w-full max-w-[390px] p-5 rounded-3xl animate-slide-up max-h-[82dvh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100">
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
                  Khởi hành: <span className="font-bold text-slate-700">{selectedUpcomingTour.departureDate}</span> • Quy mô: <span className="font-bold text-slate-700">{selectedUpcomingTour.guestsCount} khách</span>
                </p>
              </div>
            </div>

            {/* Ultra-Premium Segmented Tab Control */}
            {selectedUpcomingTour.trangThaiChapNhan !== 'CHO_PHAN_HOI' && (
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
                  Hành khách ({selectedUpcomingTour.guestsCount})
                </button>
              </div>
            )}

            {modalTab === 'PASSENGERS' && selectedUpcomingTour.trangThaiChapNhan !== 'CHO_PHAN_HOI' ? (
              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  {(selectedUpcomingTour.passengers || []).map((guest, index) => (
                    <div
                      key={guest.listKey || `${guest.code}:${index}`}
                      className="bg-white p-3.5 rounded-2xl flex flex-col justify-between border border-slate-100 shadow-sm transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-black text-slate-800 text-sm">{guest.name}</h4>
                            {layHuyHieuHangThanhVien(guest.rank)}
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
                  {(selectedUpcomingTour.passengers || []).length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-5">
                      Chưa có hành khách đã thanh toán và được xác nhận.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-3.5 pl-3 relative border-l border-sky-100 max-h-[42vh] overflow-y-auto pr-1">
                  {(selectedUpcomingTour.itinerary || []).length > 0 ? (
                    (selectedUpcomingTour.itinerary || []).map((item) => (
                      <div key={`${selectedUpcomingTour.code}-${item.day}-${item.title}`} className="relative">
                        <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-sky-50"></span>
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
                          <p className="text-[10px] font-black text-sky-500 uppercase tracking-wider mb-1">Ngày {item.day}</p>
                          <h4 className="text-xs font-black text-slate-800 leading-snug">{item.title}</h4>
                          <div className="mt-2 space-y-2">
                            {(item.activities || []).map((hoatDong, index) => (
                              <div key={index} className="flex items-start gap-2 text-[11px] leading-relaxed">
                                {hoatDong.time && (
                                  <span className="rounded-lg border border-sky-100 bg-sky-50 px-1.5 py-0.5 font-mono font-bold text-sky-600 shrink-0">
                                    {hoatDong.time}
                                  </span>
                                )}
                                <span className="pt-0.5 text-slate-500">{hoatDong.activity}</span>
                              </div>
                            ))}
                          </div>
                          {item.description && <p className="mt-2 text-[11px] italic text-slate-400">{item.description}</p>}
                          {item.menu && (
                            <p className="mt-2 text-[11px] text-amber-600 font-semibold leading-relaxed">Thực đơn: {item.menu}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Chưa cập nhật chi tiết lịch trình.</p>
                  )}
                </div>

                {((selectedUpcomingTour.services || []).length > 0 || (selectedUpcomingTour.greenActions || []).length > 0) && (
                  <div className="space-y-2">
                    {(selectedUpcomingTour.services || []).length > 0 && (
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Dịch vụ thêm</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedUpcomingTour.services || []).map((service) => (
                            <span key={service} className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-1 rounded-lg">{service}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(selectedUpcomingTour.greenActions || []).length > 0 && (
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Hành động xanh</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedUpcomingTour.greenActions || []).map((action) => (
                            <span key={action} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">{action}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedUpcomingTour.trangThaiChapNhan === 'CHO_PHAN_HOI' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onRejectAssignment(selectedUpcomingTour.maPhanCong);
                    setSelectedUpcomingTour(null);
                  }}
                  disabled={rejectingAssignmentIds.includes(selectedUpcomingTour.maPhanCong || '') || acceptingAssignmentIds.includes(selectedUpcomingTour.maPhanCong || '')}
                  className="h-10 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold shadow-sm ring-1 ring-rose-100 transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center gap-1.5"
                >
                  <X size={14} />
                  Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAcceptAssignment(selectedUpcomingTour.maPhanCong);
                    setSelectedUpcomingTour(null);
                  }}
                  disabled={rejectingAssignmentIds.includes(selectedUpcomingTour.maPhanCong || '') || acceptingAssignmentIds.includes(selectedUpcomingTour.maPhanCong || '')}
                  className="h-10 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-300 flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  Đồng ý
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedUpcomingTour(null)}
                className="w-full py-2 bg-sky-400 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Đóng
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
