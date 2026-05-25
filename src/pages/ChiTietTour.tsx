import { useCallback, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  Star, ArrowLeft, Check, X, Leaf, Eye, Utensils, ChevronRight, Compass, MapPin, ThumbsUp
} from 'lucide-react';
import type { Tour } from '../types';
import { khService } from '../services/khService';
import { mapTourDetail, unwrapData, unwrapPageContent } from '../services/apiHelpers';
import CuaSoDatTour from '../components/booking/CuaSoDatTour';
import CuaSoXacThuc from '../components/modals/CuaSoXacThuc';
import { hasActiveSession } from '../services/api';

export default function ChiTietTour() {
  const { tourId } = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCuaSoDatTour, setShowCuaSoDatTour] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [selectedItineraryDay, setSelectedItineraryDay] = useState<number | null>(null);
  const [showCuaSoXacThuc, setShowCuaSoXacThuc] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [tourReviewsList, setTourReviewsList] = useState<any[]>([]);

  const handleBookingSessionExpired = useCallback(() => {
    setShowCuaSoDatTour(false);
    setShowCuaSoXacThuc(true);
  }, []);

  // Reviews filters and likes state
  const [activeReviewFilter, setActiveReviewFilter] = useState<'all' | 'images' | '5star' | '4star' | '3star' | '2star' | '1star'>('all');
  const [helpfulCounts, setHelpfulCounts] = useState<Record<number, number>>({});
  const [pendingHelpfulIndex, setPendingHelpfulIndex] = useState<number | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tourId]);

  useEffect(() => {
    if (!tourId) return;

    const fetchTour = async () => {
      setLoading(true);
      setError('');
      try {
        const [tourResponse, greenResponse, reviewsResponse] = await Promise.all([
          khService.layChiTietTour(tourId),
          khService.getGreenActions(tourId).catch(() => ({ data: { content: [] } })),
          khService.layDanhGiaTour(tourId).catch(() => ({ data: { content: [] } }))
        ]);

        const greenActions = unwrapPageContent<any>(greenResponse);
        setTour(mapTourDetail(unwrapData<any>(tourResponse), greenActions));

        const reviewsData = unwrapPageContent<any>(reviewsResponse);
        setTourReviewsList(reviewsData.map((r: any) => ({
          id: r.maDanhGia,
          name: r.hoTenKhachHang || 'Khách hàng',
          rating: r.soSao || 5,
          date: r.ngayDanhGia ? new Date(r.ngayDanhGia).toLocaleDateString('vi-VN') : '',
          tag: 'Khách đi tour',
          tier: 'Thành viên',
          comment: r.nhanXet || '',
          helpful: 0,
          images: [],
          greenAction: ''
        })));
      } catch (err) {
        console.error(err);
        setError('Không tải được chi tiết tour. Vui lòng kiểm tra hệ thống hoặc thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [tourId]);

  // Smooth scroll to selected day in itinerary detail modal
  useEffect(() => {
    if (showItineraryModal && selectedItineraryDay !== null) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`itinerary-day-${selectedItineraryDay}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showItineraryModal, selectedItineraryDay]);

  const getDayMeals = (tId: string, day: number, meals?: string) => {
    if (meals && meals.includes('|')) {
      const parts = meals.split('|').map(s => s.trim()).filter(Boolean);
      return (
        <div className="flex flex-col gap-1 mt-1.5">
          {parts.map((p, i) => {
            const [k, ...rest] = p.split(':');
            const v = rest.join(':').trim();
            if (!v || v.toLowerCase() === 'null') return null;
            let icon = '🍽️';
            if (k.trim().toLowerCase().includes('sáng')) { icon = '☕'; }
            else if (k.trim().toLowerCase().includes('trưa')) { icon = '🍲'; }
            else if (k.trim().toLowerCase().includes('chiều')) { icon = '🍵'; }
            else if (k.trim().toLowerCase().includes('tối')) { icon = '🌙'; }
            return (
              <span key={i} className="flex items-center gap-1 px-1 py-0.5 text-[10.5px] font-bold text-slate-900">
                <span>{icon}</span> {k.trim()}: <span className="text-slate-900 font-medium">{v}</span>
              </span>
            );
          })}
        </div>
      );
    }
    if (meals && meals.trim()) {
      return meals;
    }
    if (tId === '1') {
      if (day === 1) return 'tự túc ăn chiều';
      if (day === 2) return 'Ăn sáng, trưa, tối';
      return 'Ăn sáng, trưa';
    }
    if (tId === '2') {
      if (day === 1) return 'tự túc ăn tối';
      if (day === 2) return 'Ăn sáng, trưa, tối';
      if (day === 3) return 'Ăn sáng, trưa, tối';
      return 'Ăn sáng, trưa';
    }
    return 'Ăn sáng, trưa';
  };

  const getDayImage = (tId: string, day: number) => {
    const images: Record<string, string[]> = {
      '1': [
        'https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
      ],
      '2': [
        'https://images.unsplash.com/photo-1609412058473-c199497c3c5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
        'https://images.unsplash.com/photo-1508873696983-2df519f0397e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
        'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
      ]
    };
    const tourImgs = images[tId] || images['1'];
    return tourImgs[(day - 1) % tourImgs.length];
  };

  // Scenery Galleries database
  const tourGalleries: Record<string, string[]> = {
    '1': [
      'https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1555661530-68c8e98db4e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1547950518-c0b021f7c54e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
    ],
    '2': [
      'https://images.unsplash.com/photo-1609412058473-c199497c3c5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1508873696983-2df519f0397e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1547950518-c0b021f7c54e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
    ],
    '3': [
      'https://images.unsplash.com/photo-1562005094-c724030f99bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1599708153386-62e2d53bf59e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1588066532230-0584b723fcfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1547950518-c0b021f7c54e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
    ]
  };

  const defaultSceneries = [
    tour?.image || '',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'https://images.unsplash.com/photo-1547950518-c0b021f7c54e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
  ];
  const gallery = tour ? (tourGalleries[tour.id] || defaultSceneries) : [];

  // Automatically cycle scenery images every 5 seconds
  useEffect(() => {
    if (!gallery.length) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % gallery.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [gallery.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (value?: string) => {
    if (!value) return 'Đang cập nhật';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Đang cập nhật';

    return date.toLocaleDateString('vi-VN');
  };

  // Authentic Customer Reviews List is now fetched from the API

  const toggleHelpful = (idx: number) => {
    setHelpfulCounts(prev => {
      const current = prev[idx] !== undefined ? prev[idx] : tourReviewsList[idx].helpful;
      const isAlreadyClicked = prev[idx] !== undefined && prev[idx] > tourReviewsList[idx].helpful;
      return {
        ...prev,
        [idx]: isAlreadyClicked ? current - 1 : current + 1
      };
    });
  };

  const handleHelpfulClick = (idx: number) => {
    if (!hasActiveSession()) {
      setPendingHelpfulIndex(idx);
      setShowCuaSoXacThuc(true);
      return;
    }

    toggleHelpful(idx);
  };

  const filteredReviewsList = tourReviewsList.filter((review) => {
    if (activeReviewFilter === 'images') return review.images && review.images.length > 0;
    if (activeReviewFilter === '5star') return review.rating === 5;
    if (activeReviewFilter === '4star') return review.rating === 4;
    if (activeReviewFilter === '3star') return review.rating === 3;
    if (activeReviewFilter === '2star') return review.rating === 2;
    if (activeReviewFilter === '1star') return review.rating === 1;
    return true;
  });
  const actualReviewCount = tourReviewsList.length;
  const displayReviewCount = actualReviewCount > 0 ? actualReviewCount : (tour?.reviews || 0);
  const actualRating = actualReviewCount
    ? (tourReviewsList.reduce((sum, review) => sum + Number(review.rating || 0), 0) / actualReviewCount).toFixed(1)
    : (tour?.rating ? tour.rating.toFixed(2) : '0.00');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 px-4 flex items-center justify-center">
        <div className="text-sm font-bold text-slate-600">Đang tải chi tiết tour...</div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 px-4">
        <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-xl font-black text-slate-900">Không tìm thấy tour</h1>
          <p className="text-sm text-slate-500 mt-2">{error || 'Tour không tồn tại trong hệ thống.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-6 text-blue-600 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* Sticky Quick Access Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-150 sticky top-16 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors font-bold text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Danh sách Tour</span>
          </Link>
          <div className="flex items-center space-x-6">
            <span className="hidden sm:inline text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
              Khởi hành: {formatDate(tour.departureDate)}
            </span>
          </div>
        </div>
      </div>


      {/* Prominent Tour Title Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-1 animate-fadeIn">
        <div className="space-y-3">

          {/* Nổi bật tên Tour */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {tour.name}
          </h1>

          {/* Tags row */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
              {tour.destination}
            </span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center space-x-1">
              <Leaf className="w-3 h-3 text-green-600" />
              <span>Chuyến đi Xanh (Eco-Tour)</span>
            </span>
            <span className="bg-yellow-50 text-amber-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-yellow-100">
              {tour.duration}
            </span>
          </div>

        </div>
      </div>

      {/* Dynamic Premium Image Gallery (Grid-based Bento Layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[350px] sm:h-[480px] rounded-3xl overflow-hidden shadow-xl border border-white">

          {/* Main Large View */}
          <div className="lg:col-span-3 relative group h-full">
            <img
              src={gallery[activeImageIndex]}
              alt={tour.name}
              className="w-full h-full object-cover transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
              <span className="inline-flex items-center space-x-1.5 bg-slate-900/60 backdrop-blur-md text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1.2 rounded-xl shadow-md border border-white/10">
                <span>Hình ảnh thực tế {activeImageIndex + 1}/{gallery.length}</span>
              </span>
            </div>
          </div>

          {/* Scrollable Thumbnail Bento Panel (Right Sidebar) */}
          <div className="hidden lg:flex flex-col space-y-3 h-full overflow-y-auto pr-1 scrollbar-thin">
            {gallery.map((imgUrl, idx) => {
              const isActive = activeImageIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-[105px] w-full flex-shrink-0 rounded-r-2xl rounded-l-none overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20 scale-[0.98]' : 'border-transparent hover:border-slate-350'
                    }`}
                >
                  <img
                    src={imgUrl}
                    alt="Scenic view thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolright oute inset-0 bg-slate-950/15 hover:bg-transparent transition-colors" />
                  {isActive && (
                    <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                      <span className="bg-blue-600 text-white p-1 rounded-full shadow">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Small thumbnail picker (visible on mobile only) */}
        <div className="flex lg:hidden justify-center space-x-2 mt-3">
          {gallery.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${activeImageIndex === idx ? 'bg-blue-600 w-6' : 'bg-slate-300'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Detailed Itinerary and Information */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick Tour Highlights */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-blue-600" />
                </span>
                <span>Thông tin hành trình</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                {tour.description}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-100/50 text-center space-y-1">
                  <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Thời gian</span>
                  <span className="block text-slate-900 font-extrabold text-xs sm:text-sm">{tour.duration}</span>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-4 rounded-2xl border border-green-100/50 text-center space-y-1">
                  <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Đánh giá</span>
                  <span className="block text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                    <span>{actualRating !== '0.0' ? actualRating : tour.rating}</span>
                  </span>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 p-4 rounded-2xl border border-orange-100/50 text-center space-y-1">
                  <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Chỗ trống</span>
                  <span className="block text-orange-650 font-extrabold text-xs sm:text-sm">{tour.availableSeats} ghế</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </span>
                <span>Lịch trình</span>
              </h2>

              <div className="space-y-3 pt-2">
                {tour.itinerary.map((day: any) => (
                  <button
                    key={day.day}
                    type="button"
                    onClick={() => {
                      setSelectedItineraryDay(day.day);
                      setShowItineraryModal(true);
                    }}
                    className="w-full flex items-center justify-between p-4.5 text-left bg-blue-50/40 border border-blue-100 hover:border-blue-300 hover:bg-blue-50/80 rounded-2xl shadow-sm transition-all group"
                  >
                    <div className="space-y-1">
                      <span className="block font-black text-slate-800 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                        {day.title?.toLowerCase().startsWith(`ngày ${day.day}`)
                          ? day.title
                          : `Ngày ${day.day}${day.title ? `: ${day.title}` : ''}`}
                      </span>

                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Timeline Modal */}
            {showItineraryModal && (
              <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
                <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden relative shadow-2xl border border-slate-100">

                  {/* Modal Header */}
                  <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-black text-slate-900">LỊCH TRÌNH</h3>
                    <button
                      onClick={() => setShowItineraryModal(false)}
                      className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-8">
                    <div className="relative pl-5 sm:pl-7 border-l border-slate-200 ml-3 space-y-10 py-2">

                      {tour.itinerary.map((day: any) => {
                        const isSelected = selectedItineraryDay === day.day;
                        return (
                          <div
                            key={day.day}
                            id={`itinerary-day-${day.day}`}
                            className="relative group scroll-mt-20"
                          >
                            {/* Timeline Pin Indicator */}
                            <div className="absolute -left-[40px] sm:-left-[48px] top-6 w-6 h-6 bg-white rounded-full flex items-center justify-center z-10 border border-slate-100 shadow-sm transition-all duration-300">
                              <MapPin className={`w-3.5 h-3.5 transition-all duration-300 ${isSelected
                                ? 'text-slate-950 fill-slate-950 scale-110'
                                : 'text-slate-400 fill-slate-400'
                                }`} />
                            </div>

                            <div className="space-y-4">
                              {/* Day Blue Info Card with Image */}
                              <div className={`rounded-2xl flex items-stretch border transition-all overflow-hidden min-h-[110px] sm:min-h-[130px] ${isSelected
                                ? 'bg-[#eaf4ff] border-blue-150 shadow-sm'
                                : 'bg-slate-50 border-slate-100'
                                }`}>
                                <div className="w-3/5 space-y-1 p-4 sm:p-5 pr-4 flex flex-col justify-center">
                                  <span className="block font-black text-blue-600 text-sm sm:text-base">
                                    Ngày {day.day}
                                  </span>
                                  {day.title && (!day.title?.toLowerCase().startsWith(`ngày ${day.day}`) || day.title.length > `ngày ${day.day}`.length + 2) && (
                                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">
                                      {day.title?.toLowerCase().startsWith(`ngày ${day.day}`)
                                        ? day.title.substring(`ngày ${day.day}`.length).replace(/^[\s:-]+/, '').trim()
                                        : day.title}
                                    </h4>
                                  )}
                                  <div className="mt-2.5">
                                  {typeof getDayMeals(tour.id, day.day, day.meals || day.menu) === 'string' ? (
                                    <span className="inline-flex items-center text-xs font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md">
                                      <Utensils className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                                      <span>{getDayMeals(tour.id, day.day, day.meals || day.menu)}</span>
                                    </span>
                                  ) : (
                                    getDayMeals(tour.id, day.day, day.meals || day.menu)
                                  )}
                                </div>
                                </div>
                                <div className="w-2/5 relative flex-shrink-0">
                                  <img
                                    src={getDayImage(tour.id, day.day)}
                                    alt={`Scenery of Day ${day.day}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                </div>
                              </div>

                              {/* Activity White Card */}
                              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                                <p className="font-extrabold text-slate-800 text-xs sm:text-sm">
                                  Hoạt động chính:
                                </p>
                                <ul className="space-y-2">
                                  {(day.activities || []).map((activity: any, idx: number) => {
                                    const isObj = typeof activity === 'object' && activity !== null;
                                    const time = isObj ? activity.time : '';
                                    const actText = isObj ? activity.activity : activity;
                                    return (
                                      <li key={idx} className="flex items-start text-xs font-semibold text-slate-650">
                                        {time ? (
                                          <span className="rounded-md border border-sky-100 bg-sky-50 px-1.5 py-0.5 font-mono font-bold text-sky-600 shrink-0 mr-2">
                                            {time}
                                          </span>
                                        ) : (
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mr-2.5 mt-2 flex-shrink-0" />
                                        )}
                                        <span className="leading-relaxed pt-0.5">{actText}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Inclusions and Exclusions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <span className="block font-black text-slate-900 text-sm uppercase tracking-wide flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Dịch vụ bao gồm</span>
                  </span>
                  <ul className="space-y-2">
                    {tour.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start text-xs font-semibold text-slate-650">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <span className="block font-black text-slate-900 text-sm uppercase tracking-wide flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Không bao gồm</span>
                  </span>
                  <ul className="space-y-2">
                    {tour.excludes.map((item, idx) => (
                      <li key={idx} className="flex items-start text-xs font-semibold text-slate-650">
                        <X className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Eco Commitments section */}
            {tour.greenActions && tour.greenActions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-3xl p-6 sm:p-8 border border-green-150 shadow-sm space-y-6">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                    <Leaf className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Cam kết du lịch xanh & bền vững</h3>
                    <p className="text-[10px] text-green-700 font-black uppercase tracking-wider mt-0.5">Mỗi hành động nhỏ, bảo vệ hành tinh xanh</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tour.greenActions.map((action) => (
                    <div key={action.id} className="bg-white p-4.5 rounded-2xl border border-green-100/80 shadow-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">{action.title}</span>
                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap">
                          +{action.points} Điểm Xanh
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highly Authentic Customer Reviews */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              {/* Streamlined Airbnb-style Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>Đánh giá từ khách hàng</span>
                    <span className="flex items-center text-amber-500 font-extrabold text-base sm:text-lg ml-1">
                      <Star className="w-4.5 h-4.5 fill-current mr-1 animate-pulse" />
                      {actualRating}
                    </span>
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {displayReviewCount > 0
                      ? `Dựa trên ${displayReviewCount} đánh giá thực tế đã đối soát qua ERP du lịch`
                      : 'Chưa có đánh giá thực tế từ khách hàng'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs xs:text-base font-extrabold text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                  <span className="flex items-center gap-1.5">Tổng đánh giá: <strong className="text-white-200 font-extralarge">{displayReviewCount}</strong></span>
                </div>
              </div>

              {/* Dropdown Filter */}
              <div className="flex items-center justify-end">
                <select
                  value={activeReviewFilter}
                  onChange={(e) => setActiveReviewFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {[
                    { id: 'all', label: 'Tất cả', count: tourReviewsList.length },
                    { id: 'images', label: 'Có ảnh', count: tourReviewsList.filter(r => r.images && r.images.length > 0).length },
                    { id: '5star', label: '5 ★', count: tourReviewsList.filter(r => r.rating === 5).length },
                    { id: '4star', label: '4 ★', count: tourReviewsList.filter(r => r.rating === 4).length },
                    { id: '3star', label: '3 ★', count: tourReviewsList.filter(r => r.rating === 3).length },
                    { id: '2star', label: '2 ★', count: tourReviewsList.filter(r => r.rating === 2).length },
                    { id: '1star', label: '1 ★', count: tourReviewsList.filter(r => r.rating === 1).length }
                  ].map((chip) => (
                    <option key={chip.id} value={chip.id}>
                      {chip.label} ({chip.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Clean Reviews List */}
              <div className="divide-y divide-slate-100">
                {filteredReviewsList.map((review, idx) => {
                  const originalIdx = tourReviewsList.findIndex(r => r.name === review.name);
                  const likes = helpfulCounts[originalIdx] !== undefined ? helpfulCounts[originalIdx] : review.helpful;
                  const hasLiked = helpfulCounts[originalIdx] !== undefined && helpfulCounts[originalIdx] > review.helpful;

                  return (
                    <article key={idx} className="py-5 first:pt-2 last:pb-2">
                      <div className="flex items-start gap-3">
                        <div className="relative mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                          {review.name.charAt(0).toUpperCase()}
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500" title="Khách đã đi tour thực tế">
                            <Check className="h-2 w-2 text-white" />
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-sm font-semibold text-slate-950">{review.name}</h3>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                  {review.tier}
                                </span>
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                                <span>{review.tag}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="inline-flex items-center gap-1 text-emerald-700">
                                  <Check className="h-3 w-3" />
                                  Khách đi tour thực tế
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 sm:flex-col sm:items-end sm:gap-0.5">
                              <div className="flex items-center gap-0.5">
                                {Array(5).fill(0).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                                  />
                                ))}
                              </div>
                              <span>{review.date}</span>
                            </div>
                          </div>

                          <p className="max-w-3xl text-sm leading-6 text-slate-700">
                            {review.comment}
                          </p>

                          {review.images && review.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {review.images.map((imgUrl: string, imgIdx: number) => (
                                <div key={imgIdx} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-20 sm:w-20">
                                  <img
                                    src={imgUrl}
                                    alt="Ảnh đánh giá thực tế"
                                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-3 pt-1">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              Đã xác thực
                            </span>

                            <button
                              onClick={() => handleHelpfulClick(originalIdx)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${hasLiked
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              <ThumbsUp className={`h-3.5 w-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                              <span>Hữu ích</span>
                              <span className="text-slate-400">({likes})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {filteredReviewsList.length === 0 && (
                  <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed my-2">
                    <Star className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-[11px] font-bold text-slate-450">Không có đánh giá nào phù hợp với bộ lọc đã chọn</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Premium Sticky Pricing Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-[2.5rem] shadow-xl p-6 sticky top-24 border border-slate-200 space-y-6">

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2">
                {tour.originalPrice && (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-slate-450 line-through text-sm font-bold">
                      {formatPrice(tour.originalPrice)}
                    </span>
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm">
                      -{Math.round((1 - tour.price / tour.originalPrice) * 100)}% GIẢM
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
                  <p className="text-3xl font-black text-blue-600 tracking-tight">
                    {formatPrice(tour.price)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mức giá tốt nhất cho mỗi hành khách</p>
                </div>
              </div>

              {/* Minimalist flat list info rows */}
              <div className="space-y-4 pt-2">
                {/* Ngày khởi hành */}
                <div className="flex justify-between items-center text-sm pb-3.5 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Ngày khởi hành</span>
                  <span className="text-slate-900 font-black">
                    {formatDate(tour.departureDate)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm pb-3.5 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Ngày kết thúc</span>
                  <span className="text-slate-900 font-black">
                    {formatDate(tour.endDate)}
                  </span>
                </div>

                {/* Thời gian */}
                <div className="flex justify-between items-center text-sm pb-3.5 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Thời gian</span>
                  <span className="text-slate-900 font-black">{tour.duration}</span>
                </div>

                {/* Số chỗ còn lại */}
                <div className="flex justify-between items-center text-sm pb-3.5 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Số chỗ còn lại</span>
                  <span className="text-orange-650 font-black">
                    {tour.availableSeats} chỗ
                  </span>
                </div>
              </div>

              {/* Main Booking Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    const isLoggedIn = hasActiveSession();
                    if (!isLoggedIn) {
                      setPendingHelpfulIndex(null);
                      setShowCuaSoXacThuc(true);
                    } else {
                      setShowCuaSoDatTour(true);
                    }
                  }}
                  className="w-full bg-[#1a56db] hover:bg-[#1140b3] text-white py-3.5 rounded-2xl transition-all font-black text-sm shadow-md active:scale-[0.98] text-center"
                >
                  Đặt tour ngay
                </button>
                <p className="text-center text-xs text-slate-400 font-semibold">
                  Miễn phí hủy trong 24h đầu tiên
                </p>
              </div>

            </div>
          </div>

          {showCuaSoDatTour && (
            <CuaSoDatTour
              tour={tour}
              onClose={() => setShowCuaSoDatTour(false)}
              onSessionExpired={handleBookingSessionExpired}
            />
          )}

          {showCuaSoXacThuc && (
            <CuaSoXacThuc
              onClose={() => {
                setPendingHelpfulIndex(null);
                setShowCuaSoXacThuc(false);
              }}
              onLoginSuccess={() => {
                setShowCuaSoXacThuc(false);
                if (pendingHelpfulIndex !== null) {
                  toggleHelpful(pendingHelpfulIndex);
                  setPendingHelpfulIndex(null);
                } else {
                  setShowCuaSoDatTour(true);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
