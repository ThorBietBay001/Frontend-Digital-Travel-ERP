import { useState } from 'react';
import { MapPin, Users, DollarSign, ChevronRight } from 'lucide-react';
import type { Tour, Expense } from '../types';
import { activeTour, upcomingTours, upcomingItineraries, initialPassengers } from '../mockData';

interface DashboardProps {
  expenses: Expense[];
  attendanceStats: {
    total: number;
    checked: number;
    absent: number;
    pending: number;
  };
  setActiveTab: (tab: 'dashboard' | 'schedule' | 'attendance' | 'green' | 'expense' | 'incident' | 'profile') => void;
}

// High-fidelity mock passengers with medical notes for each tour code
const upcomingTourPassengers: Record<string, { code: string; name: string; rank: string; phone: string; healthNotes: string }[]> = {
  'DN002': [
    { code: 'KH101', name: 'Nguyễn Bích Ngọc', rank: 'KIM_CUONG', phone: '0901234101', healthNotes: 'Không ăn được ngò rí (rau mùi).' },
    { code: 'KH102', name: 'Trần Minh Quân', rank: 'VANG', phone: '0901234102', healthNotes: 'Tiền sử hạ đường huyết, cần sẵn kẹo ngọt bên người.' },
    { code: 'KH103', name: 'Phan Thanh Hải', rank: 'BAC', phone: '0901234103', healthNotes: '' },
    { code: 'KH104', name: 'Lê Thu Trang', rank: 'THANH_VIEN', phone: '0901234104', healthNotes: 'Yêu cầu phòng không hút thuốc, bố trí tầng thấp.' },
    { code: 'KH105', name: 'Hoàng Anh Tuấn', rank: 'DONG', phone: '0901234105', healthNotes: '' },
    { code: 'KH106', name: 'Đặng Thùy Chi', rank: 'THANH_VIEN', phone: '0901234106', healthNotes: 'Say tàu xe cực kỳ nặng, xin ngồi đầu xe.' }
  ],
  'HL003': [
    { code: 'KH201', name: 'Lâm Hoài Nam', rank: 'KIM_CUONG', phone: '0912345201', healthNotes: 'Bị đau khớp nhẹ, tránh các hoạt động leo núi dốc đứng.' },
    { code: 'KH202', name: 'Ngô Khánh Linh', rank: 'VANG', phone: '0912345202', healthNotes: 'Dị ứng hạt điều và đậu phộng mức độ trung bình.' },
    { code: 'KH203', name: 'Dương Quốc Bảo', rank: 'BAC', phone: '0912345203', healthNotes: '' },
    { code: 'KH204', name: 'Bùi Gia Khánh', rank: 'THANH_VIEN', phone: '0912345204', healthNotes: 'Cần lưu ý hỗ trợ áo phao cỡ đại khi xuống thuyền kayak.' }
  ],
  'NT001': [
    { code: 'KH301', name: 'Phạm Hải Đăng', rank: 'KIM_CUONG', phone: '0988776301', healthNotes: 'Cần ăn nhạt, kiêng ăn mặn do huyết áp nhẹ.' },
    { code: 'KH302', name: 'Trịnh Thúy An', rank: 'VANG', phone: '0988776302', healthNotes: 'Đau khớp gối nhẹ, vui lòng bố trí xe đẩy hỗ trợ nếu cần.' },
    { code: 'KH303', name: 'Đoàn Văn Hậu', rank: 'BAC', phone: '0988776303', healthNotes: '' }
  ],
  'PQ000': [
    { code: 'KH401', name: 'Trần Thế Vinh', rank: 'KIM_CUONG', phone: '0933445401', healthNotes: 'Tiền sử bệnh tim nhẹ, mang theo thuốc cá nhân.' },
    { code: 'KH402', name: 'Nguyễn Mỹ Duyên', rank: 'THANH_VIEN', phone: '0933445402', healthNotes: 'Khách đang mang thai tháng thứ 4, tránh đi bộ đường dốc.' }
  ]
};

// Helper: Get passenger member rank labels (unified with Attendance.tsx)
const getRankBadge = (rank: string) => {
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

// Helper function to split activity description into list items by '.' or ','
const splitActivity = (activity: string): string[] => {
  if (!activity) return [];
  return activity
    .split(/[.,]\s+/)
    .map(item => item.trim())
    .filter(item => item.length > 1)
    .map(item => {
      let cleaned = item;
      if (cleaned.endsWith('.')) {
        cleaned = cleaned.slice(0, -1);
      }
      if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
      return cleaned;
    });
};

export default function Dashboard({ expenses, attendanceStats, setActiveTab }: DashboardProps) {
  const [selectedUpcomingTour, setSelectedUpcomingTour] = useState<Tour | null>(null);
  const [modalTab, setModalTab] = useState<'ITINERARY' | 'PASSENGERS'>('ITINERARY');

  // Helper: Format price currency
  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Current Active Tour Banner */}
      <div className="relative rounded-3xl overflow-hidden h-40 bg-slate-900 text-white shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-70 bg-[url('https://images.unsplash.com/photo-1540206395-68808572332f?q=80&w=640')]"></div>

        <div className="absolute inset-0 p-4 z-20 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[11px] bg-sky-400 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Đang diễn ra
            </span>
            <span className="text-xs bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full font-mono">
              {activeTour.code}
            </span>
          </div>

          <div className="z-10 mt-auto">
            <p className="text-xs text-sky-100 font-medium uppercase tracking-wider mb-1 flex items-center">
              <MapPin size={12} className="mr-1" /> Phú Quốc - Kiên Giang
            </p>
            <h1 className="text-lg font-bold leading-tight mb-2">
              {activeTour.name}
            </h1>
            <div className="flex items-center justify-between text-xs text-sky-100/90 border-t border-white/20 pt-2">
              <span>Khởi hành: {activeTour.departureDate}</span>
              <span className="font-semibold flex items-center">
                <Users size={12} className="mr-1" /> {activeTour.guestsCount} Khách hàng
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance quick metrics */}
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

      {/* Upcoming Schedule (Lịch trình sắp khởi hành) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Lịch trình sắp khởi hành</span>
          <span className="text-[11px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">{upcomingTours.length} chuyến</span>
        </h3>

        <div className="space-y-2">
          {upcomingTours.map((tour) => (
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
          <span className="text-[11px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">2 chuyến</span>
        </h3>

        <div className="space-y-2">
          <div
            onClick={() => {
              setSelectedUpcomingTour({
                code: 'NT001',
                name: 'Nha Trang Biển Xanh Vẫy Gọi 4N3Đ',
                departureDate: '02/05/2026',
                destination: 'Nha Trang',
                guestsCount: 12,
                status: 'Sắp khởi hành',
                image: ''
              });
              setModalTab('ITINERARY');
            }}
            className="glass-card p-3 rounded-2xl flex items-center justify-between border-l-4 border-l-slate-400 cursor-pointer hover:bg-slate-50/50 transition-all duration-200"
          >
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  NT001
                </span>
                <h4 className="text-xs font-bold text-slate-700">
                  Nha Trang Biển Xanh Vẫy Gọi 4N3Đ
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                Hoàn thành: 05/05/2026 • 12 khách • ⭐ 5.0 • <span className="text-emerald-600 font-bold">Đã quyết toán</span>
              </p>
            </div>
            <ChevronRight size={14} className="text-slate-400 shrink-0" />
          </div>

          <div
            onClick={() => {
              setSelectedUpcomingTour({
                code: 'PQ000',
                name: 'Khám phá Nam Đảo Phú Quốc 2N1Đ',
                departureDate: '12/05/2026',
                destination: 'Phú Quốc',
                guestsCount: 10,
                status: 'Sắp khởi hành',
                image: ''
              });
              setModalTab('ITINERARY');
            }}
            className="glass-card p-3 rounded-2xl flex items-center justify-between border-l-4 border-l-slate-400 cursor-pointer hover:bg-slate-50/50 transition-all duration-200"
          >
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  PQ000
                </span>
                <h4 className="text-xs font-bold text-slate-700">
                  Khám phá Nam Đảo Phú Quốc 2N1Đ
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                Hoàn thành: 14/05/2026 • 10 khách • ⭐ 4.9 • <span className="text-emerald-600 font-bold">Đã quyết toán</span>
              </p>
            </div>
            <ChevronRight size={14} className="text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* --- GLOBAL POPUP: UPCOMING TOUR ITINERARY BOTTOM SHEET --- */}
      {selectedUpcomingTour && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
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

            <div className="p-3 bg-gradient-to-tr from-sky-400 to-sky-500 text-white rounded-2xl relative overflow-hidden shadow-md shadow-sky-100">
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-black uppercase shrink-0 font-mono">
                  {selectedUpcomingTour.code}
                </span>
                <h4 className="font-black text-xs truncate">
                  {selectedUpcomingTour.name}
                </h4>
              </div>
              <p className="text-[11px] text-sky-100">
                Khởi hành: {selectedUpcomingTour.departureDate} • Quy mô: {selectedUpcomingTour.guestsCount} khách
              </p>
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
                Hành khách ({selectedUpcomingTour.guestsCount})
              </button>
            </div>

            {modalTab === 'PASSENGERS' ? (
              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  {(upcomingTourPassengers[selectedUpcomingTour.code] || initialPassengers).map((guest) => (
                    <div
                      key={guest.code}
                      className="bg-white p-3.5 rounded-2xl flex flex-col justify-between border border-slate-100 shadow-sm transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-black text-slate-800 text-sm">{guest.name}</h4>
                            {getRankBadge(guest.rank)}
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
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-3.5 pl-3 relative border-l border-sky-100 max-h-[42vh] overflow-y-auto pr-1">
                  {upcomingItineraries[selectedUpcomingTour.code]?.map((day) => (
                    <div key={day.day} className="relative space-y-0.5">
                      <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-sky-400 border-2 border-white ring-4 ring-sky-50 shadow-sm"></div>
                      <span className="text-[11px] font-bold text-sky-500 uppercase">Ngày {day.day}</span>
                      <ul className="list-none space-y-1 text-xs text-slate-700 font-semibold leading-relaxed mt-1">
                        {splitActivity(day.activity).map((act, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-sky-500 mr-1.5 mt-1 text-[9px]">•</span>
                            <span className="flex-1">{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )) || (
                      <p className="text-xs text-slate-400 italic">Chưa cập nhật chi tiết lịch trình.</p>
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
