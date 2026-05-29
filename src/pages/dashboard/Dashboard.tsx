import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, MapPin, Wallet, ShoppingCart, Users, Map as MapIcon, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

// API Services
import { customersService } from '../../services/customers';
import { ordersService } from '../../services/orders';
import { tourInstanceService } from '../../services/tour-instance';
import { tourTemplateService } from '../../services/tour-template';
import { incidentService } from '../../services/incidents';
import type { NhatKySuCoResponse } from '../../services/incidents';
import { ChevronLeft, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import type { TourThucTeResponse } from '../../pages/tour-instance/mockData';
import PowerBIConnectionModal from './PowerBIConnectionModal';
import { formatDate } from '../../utils/dateHelpers';

const revenueData = [
  { name: 'T1', value: 120000000 },
  { name: 'T2', value: 250000000 },
  { name: 'T3', value: 380000000 },
  { name: 'T4', value: 500000000 },
  { name: 'T5', value: 420000000 },
  { name: 'T6', value: 650000000 },
  { name: 'T7', value: 800000000 },
  { name: 'T8', value: 950000000 },
  { name: 'T9', value: 720000000 },
  { name: 'T10', value: 550000000 },
  { name: 'T11', value: 680000000 },
  { name: 'T12', value: 1250000000 },
];

const pieData = [
  { name: 'Đã xác nhận', value: 65, color: '#3B82F6' },
  { name: 'Đang xử lý', value: 25, color: '#60A5FA' },
  { name: 'Đã hủy', value: 10, color: '#93C5FD' },
];

const topDestinations = [
  { name: 'Hội An, Quảng Nam', percent: 45 },
  { name: 'Đà Lạt, Lâm Đồng', percent: 30 },
  { name: 'Nha Trang, Khánh Hòa', percent: 15 },
  { name: 'Phú Quốc, Kiên Giang', percent: 10 },
];

function formatVietnameseCurrencyShort(value: number) {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace('.0', '').replace('.', ',') + ' Tỷ VNĐ';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',') + ' Triệu VNĐ';
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace('.0', '').replace('.', ',') + ' Nghìn VNĐ';
  return value.toLocaleString('vi-VN') + ' VNĐ';
}

function getTimeAgo(dateInput: any): string {
  if (!dateInput) return 'Vừa xong';
  
  let time: number;
  if (Array.isArray(dateInput)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
    time = new Date(year, month - 1, day, hour, minute, second).getTime();
  } else {
    time = new Date(dateInput).getTime();
  }

  const now = new Date().getTime();
  const diffMinutes = Math.floor((now - time) / 60000);

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
}

function formatTrangThaiTour(status: string | undefined): string {
  if (!status) return '---';
  switch (status) {
    case 'MO_BAN': return 'Mở bán';
    case 'DANG_THUC_HIEN': return 'Đang thực hiện';
    case 'DA_HOAN_THANH': return 'Đã hoàn thành';
    case 'DA_QUYET_TOAN': return 'Đã quyết toán';
    case 'HUY': return 'Đã hủy';
    case 'DA_DONG': return 'Đã đóng';
    default: return status;
  }
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    customers: 834245,
    orders: 31684,
    tours: 256,
    revenue: 5000000000
  });

  const [featuredTours, setFeaturedTours] = useState<TourThucTeResponse[]>([]);
  const [destinations, setDestinations] = useState<{ name: string, percent: number }[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<NhatKySuCoResponse[]>([]);
  const [isPowerBiModalOpen, setIsPowerBiModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourThucTeResponse | null>(null);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  useEffect(() => {
    // Fetch actual data from backend
    const fetchStats = async () => {
      try {
        const [customers, orders, tours, incidents] = await Promise.all([
          customersService.timKiemKhachHang({ page: 0, size: 1 }).catch(() => null),
          ordersService.danhSachTatCa({ page: 0, size: 1 }).catch(() => null),
          tourInstanceService.danhSach({ page: 0, size: 1 }).catch(() => null),
          incidentService.lichSuSuCoCuaHdv().catch(() => null)
        ]);

        setStats(prev => ({
          ...prev,
          customers: customers?.totalElements || prev.customers,
          orders: orders?.totalElements || prev.orders,
          tours: tours?.totalElements || prev.tours
        }));

        // Fetch larger batch for featured calculation & top destinations
        const allToursResp = await tourInstanceService.danhSach({ page: 0, size: 500 }).catch(() => null);
        if (allToursResp && allToursResp.content) {
          // 1. Gói Tour Nổi Bật (Featured Tours)
          // Lọc các tour đang mở bán và còn chỗ
          const activeTours = allToursResp.content.filter(t => t.trangThai === 'MO_BAN' && typeof t.choConLai === 'number' && t.choConLai > 0);
          
          // Sắp xếp theo chỗ còn lại tăng dần (gần full nhất lên đầu)
          activeTours.sort((a, b) => (a.choConLai || 0) - (b.choConLai || 0));

          // Loại bỏ các tour trùng mẫu để đa dạng
          const uniqueFeatured: TourThucTeResponse[] = [];
          const seenMau = new Set<string>();
          for (const t of activeTours) {
            if (t.maTourMau && !seenMau.has(t.maTourMau)) {
              seenMau.add(t.maTourMau);
              uniqueFeatured.push(t);
            }
          }

          // Chỉ lấy 12 tour
          setFeaturedTours(uniqueFeatured.slice(0, 12));

          // 2. Top Điểm Đến (Tính tổng khách đặt của các tour thực tế theo từng tour mẫu)
          const validStatuses = ['DA_QUYET_TOAN', 'KET_THUC', 'MO_BAN', 'DANG_THUC_HIEN'];
          const validTours = allToursResp.content.filter(t => t.trangThai && validStatuses.includes(t.trangThai.toUpperCase()));

          const templateStats = new Map<string, { name: string, booked: number }>();
          let totalBookedAll = 0;

          for (const t of validTours) {
            if (!t.maTourMau) continue;
            
            const soKhachToiDa = t.soKhachToiDa || 0;
            const choConLai = t.choConLai || 0;
            let booked = soKhachToiDa - choConLai;
            if (booked < 0) booked = 0;
            
            if (booked > 0) {
              // Lấy tên tour từ tieuDeTour, cắt chuỗi trước dấu '-' để lấy tên điểm đến ngắn gọn
              const fullName = t.tieuDeTour || 'Chưa có tên';
              const shortName = fullName.split('-')[0].trim();
              
              if (!templateStats.has(t.maTourMau)) {
                templateStats.set(t.maTourMau, { name: shortName, booked: 0 });
              }
              const stat = templateStats.get(t.maTourMau)!;
              stat.booked += booked;
              totalBookedAll += booked;
            }
          }

          if (totalBookedAll > 0) {
            const sortedDestinations = Array.from(templateStats.values())
              .sort((a, b) => b.booked - a.booked)
              .slice(0, 4);
            const maxBooked = sortedDestinations.length > 0 ? sortedDestinations[0].booked : 1;
            setDestinations(
              sortedDestinations.map(stat => ({
                name: stat.name,
                percent: Math.round((stat.booked / maxBooked) * 100)
              }))
            );
          } else {
            setDestinations(topDestinations);
          }
        } else {
          // API failed (e.g. 403) → always show mock data
          setDestinations(topDestinations);
        }

        if (incidents) {
          setRecentIncidents(incidents.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonthAndYear = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  const todayDate = today.getDate();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert to Mon=0 ... Sun=6
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

  const prevMonthDays = Array.from({ length: firstDayOffset }, (_, i) => daysInPrevMonth - firstDayOffset + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
  const nextMonthDays = Array.from({ length: totalSlots - (firstDayOffset + daysInMonth) }, (_, i) => i + 1);

  return (
    <MainLayout activeMenu="Tổng quan" breadcrumb={[{ label: 'Tổng quan' }]}>
      <div className="flex flex-col gap-6 animate-fadeIn pb-10">
        {/* HEADER ACTIONS */}
        <div className="flex justify-end gap-3">
          <Button variant="primary" className="py-2.5 px-6 text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2" onClick={() => setIsPowerBiModalOpen(true)}>
            <BarChart3 size={18} />
            Phân tích dữ liệu
          </Button>
        </div>

        {/* TOP SECTION */}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          {/* Left: 4 Metrics */}
          <div className="col-span-9 grid grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-center h-full relative overflow-hidden min-h-[160px]">
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-50 rounded-full opacity-60 z-0 pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-center gap-2 w-full">
                <div className="p-2.5 bg-blue-100/70 rounded-[14px] text-blue-600">
                  <Wallet size={20} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  <span>12.5%</span>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center w-full mt-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Doanh thu</p>
                <h3 className="text-3xl font-bold text-gray-900 break-words leading-tight" title={`${stats.revenue.toLocaleString('vi-VN')} VNĐ`}>{formatVietnameseCurrencyShort(stats.revenue)}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-center h-full relative overflow-hidden min-h-[160px]">
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-50 rounded-full opacity-60 z-0 pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-center gap-2 w-full">
                <div className="p-2.5 bg-blue-100/70 rounded-[14px] text-blue-600">
                  <ShoppingCart size={20} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  <span>8.2%</span>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center w-full mt-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Đơn hàng</p>
                <h3 className="text-3xl font-bold text-gray-900 break-words leading-tight" title={stats.orders.toLocaleString('vi-VN')}>{stats.orders.toLocaleString('vi-VN')}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-center h-full relative overflow-hidden min-h-[160px]">
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-50 rounded-full opacity-60 z-0 pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-center gap-2 w-full">
                <div className="p-2.5 bg-blue-100/70 rounded-[14px] text-blue-600">
                  <Users size={20} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  <span>15.3%</span>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center w-full mt-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Khách hàng</p>
                <h3 className="text-3xl font-bold text-gray-900 break-words leading-tight" title={stats.customers.toLocaleString('vi-VN')}>{stats.customers.toLocaleString('vi-VN')}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-center h-full relative overflow-hidden min-h-[160px]">
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-50 rounded-full opacity-60 z-0 pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-center gap-2 w-full">
                <div className="p-2.5 bg-blue-100/70 rounded-[14px] text-blue-600">
                  <MapIcon size={20} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold">
                  <ArrowDownRight size={14} strokeWidth={3} />
                  <span>2.1%</span>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center w-full mt-4">
                <p className="text-gray-600 text-sm font-medium mb-1">Tổng Tour</p>
                <h3 className="text-3xl font-bold text-gray-900 break-words leading-tight" title={`${stats.tours.toLocaleString('vi-VN')} Tours`}>{stats.tours.toLocaleString('vi-VN')}</h3>
              </div>
            </div>
          </div>

          {/* Right: Calendar */}
          <div className="col-span-3">
            <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 h-full flex flex-col justify-center">
              <div className="flex justify-between items-center mb-4">
                <button className="text-gray-400 hover:text-gray-800 transition-colors" onClick={() => changeMonth(-1)}>&lt;</button>
                <h3 className="font-bold text-gray-800">Tháng {currentMonth + 1}, {currentYear}</h3>
                <button className="text-gray-400 hover:text-gray-800 transition-colors" onClick={() => changeMonth(1)}>&gt;</button>
              </div>
              <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-2">
                <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
              </div>
              <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
                {prevMonthDays.map(d => (
                  <div key={`prev-${d}`} className="py-1 text-gray-300">{d}</div>
                ))}
                {currentMonthDays.map(d => {
                  const isToday = isCurrentMonthAndYear && d === todayDate;
                  return (
                    <div key={`curr-${d}`} className={`py-1 ${isToday ? 'bg-blue-400 text-white rounded-full mx-1' : 'text-gray-700'}`}>
                      {d}
                    </div>
                  );
                })}
                {nextMonthDays.map(d => (
                  <div key={`next-${d}`} className="py-1 text-gray-300">{d}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Featured Tours (Expanded horizontally) */}
          <div className="col-span-9">
            <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800">Gói Tour Nổi Bật</h3>
              </div>
              <div className="relative flex items-center group flex-1">
                <button 
                  onClick={() => setCurrentFeaturedIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentFeaturedIndex === 0}
                  className="absolute left-0 -ml-4 z-10 p-2 bg-white border border-gray-100 rounded-full shadow-md text-gray-600 disabled:opacity-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="overflow-hidden w-full px-2 py-1">
                  <div 
                    className="flex gap-4 transition-transform duration-500 ease-in-out w-full"
                    style={{ transform: `translateX(calc(-${currentFeaturedIndex * 100}% - ${currentFeaturedIndex * 16}px))` }}
                  >
                  {featuredTours.length > 0 ? featuredTours.map((tour, idx) => {
                    const days = tour.ngayKhoiHanh && tour.ngayKetThuc ? Math.max(1, Math.round((new Date(tour.ngayKetThuc).getTime() - new Date(tour.ngayKhoiHanh).getTime()) / (1000 * 3600 * 24))) : 1;
                    const natureImages = [
                      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=80',
                      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80',
                      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
                      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&q=80'
                    ];
                    return (
                      <div key={idx} className="w-[calc(25%-12px)] shrink-0 flex flex-col gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedTour(tour)}>
                        <div className="h-32 bg-gray-200 rounded-xl bg-cover bg-center relative shadow-sm" style={{ backgroundImage: `url('${natureImages[idx % natureImages.length]}')` }}>
                        </div>
                      <p className="font-semibold text-sm text-gray-800 truncate" title={tour.tieuDeTour}>{tour.tieuDeTour || 'Tour Thực Tế'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarIcon size={12} /> {days} Ngày {Math.max(0, days - 1)} Đêm</p>
                      <p className="font-bold text-sm text-blue-600 mt-1">₫{(tour.giaHienHanh || 0).toLocaleString('vi-VN')}</p>
                    </div>
                  );
                }) : (
                  <div className="w-full text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                )}
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentFeaturedIndex(prev => Math.min(Math.ceil(featuredTours.length / 4) - 1, prev + 1))}
                  disabled={featuredTours.length <= 4 || currentFeaturedIndex >= Math.ceil(featuredTours.length / 4) - 1}
                  className="absolute right-0 -mr-4 z-10 p-2 bg-white border border-gray-100 rounded-full shadow-md text-gray-600 disabled:opacity-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Pagination Dots */}
              {featuredTours.length > 4 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {Array.from({ length: Math.ceil(featuredTours.length / 4) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentFeaturedIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${idx === currentFeaturedIndex ? 'bg-blue-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Top Destinations */}
          <div className="col-span-3">
            <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 h-full flex flex-col justify-center">
              <h3 className="font-bold text-lg text-gray-800 mb-6 text-center">Top Điểm Đến</h3>
              <div className="flex flex-col gap-4">
                {destinations.map((dest, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate pr-2">{dest.name}</span>
                      <span className="text-gray-500 shrink-0">{dest.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${dest.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-12 gap-6 items-start mt-2">
          <div className="col-span-9 grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 col-span-1">
              <h3 className="font-bold text-lg text-gray-800 mb-4 text-center">Tổng quan Đơn hàng</h3>
              <div className="h-48 relative" style={{ minWidth: 0, minHeight: 0 }}>
                <ResponsiveContainer width="99%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800" title={stats.orders.toString()}>
                    {stats.orders > 1000 ? (stats.orders / 1000).toFixed(1).replace('.0', '') + 'k' : stats.orders}
                  </span>
                  <span className="text-xs text-gray-500">Tổng</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4 text-sm">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800 text-center w-full">Doanh thu năm 2025</h3>
              </div>
              <div className="flex-1 min-h-[200px]" style={{ minWidth: 0, minHeight: 0 }}>
                <ResponsiveContainer width="99%" height="100%">
                  <LineChart data={revenueData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                      formatter={(value) => [formatVietnameseCurrencyShort(Number(value ?? 0)), 'Doanh thu']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 h-full flex flex-col justify-start">
              <h3 className="font-bold text-lg text-gray-800 mb-6 text-center">Báo cáo sự cố</h3>
              <div className="flex flex-col gap-6">
                {recentIncidents.length > 0 ? recentIncidents.map((incident, idx) => {
                  const isSOS = incident.mucDo === 'SOS';
                  return (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className={`mt-0.5 shrink-0 ${isSOS ? 'text-orange-500' : 'text-blue-500'}`}>
                        {isSOS ? <AlertTriangle size={18} fill="currentColor" className="text-orange-100" /> : <Info size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 break-words">
                          <span className="font-semibold">{incident.maHdvBaoCao || 'HDV'}</span> đã báo cáo sự cố 
                          <span className="font-medium text-gray-600 block mt-0.5 italic">"{incident.moTa || incident.loaiSuCo || 'Không có nội dung'}"</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{incident.thoiGianBaoCao ? getTimeAgo(incident.thoiGianBaoCao) : 'Vừa xong'}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-gray-500 text-center py-4">Không có báo cáo sự cố nào gần đây.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Power BI Modal */}
      <PowerBIConnectionModal
        isOpen={isPowerBiModalOpen}
        onClose={() => setIsPowerBiModalOpen(false)}
      />

      {/* Tour Detail Popup */}
      {selectedTour && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col relative animate-slideUp">
            <button
              className="absolute top-4 right-4 bg-white/50 hover:bg-white p-2 rounded-full text-gray-800 transition-colors z-10 backdrop-blur-sm shadow-sm"
              onClick={() => setSelectedTour(null)}
            >
              <XCircle size={24} />
            </button>
            <div className="h-48 bg-gray-200 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80')" }}></div>
            <div className="p-6 overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{selectedTour.tieuDeTour || 'Tour Thực Tế'}</h2>
              <p className="text-gray-500 flex items-center gap-2 text-sm mb-6"><MapPin size={16} /> Mã Tour: {selectedTour.maTourThucTe}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Ngày khởi hành</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5"><CalendarIcon size={14} className="text-blue-500" /> {formatDate(selectedTour.ngayKhoiHanh)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Giá hiện hành</p>
                  <p className="font-bold text-blue-600 flex items-center gap-1.5"><Wallet size={14} /> ₫{(selectedTour.giaHienHanh || 0).toLocaleString('vi-VN')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Chỗ còn lại</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5"><Users size={14} className="text-emerald-500" /> {selectedTour.choConLai || 0} / {selectedTour.soKhachToiDa || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Trạng thái tour</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-orange-500" /> {formatTrangThaiTour(selectedTour.trangThai)}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button variant="primary" className="flex-1" onClick={() => setSelectedTour(null)}>Đóng</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
