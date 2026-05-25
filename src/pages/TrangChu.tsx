import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, MapPin, Calendar, Clock, DollarSign, Star, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { khService } from '../services/khService';
import { mapPublicTour, unwrapData, unwrapPageContent } from '../services/apiHelpers';
import type { Tour } from '../types';

export default function TrangChu() {
  const TOURS_PER_PAGE = 9;
  const [searchParams, setSearchParams] = useSearchParams();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [tourPage, setTourPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchTours = async () => {
      try {
        const pageSize = 10;
        const firstResponse = await khService.layDanhSachTour({ page: 0, size: pageSize });
        const firstPage = unwrapData<any>(firstResponse);
        const allItems = [...unwrapPageContent<any>(firstResponse)];
        const totalPages = Number(firstPage?.totalPages || 1);

        for (let page = 1; page < totalPages; page += 1) {
          const response = await khService.layDanhSachTour({ page, size: pageSize });
          allItems.push(...unwrapPageContent<any>(response));
        }

        if (!isMounted) return;
        const tours = allItems.map(mapPublicTour);
        setAllTours(tours);
        setFilteredTours(tours);
      } catch (error) {
        console.error('Lỗi tải danh sách tour:', error);
      }
    };
    fetchTours();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroImages = [
    'https://images.unsplash.com/photo-1535262412227-85541e910204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2UlMjBhenVyZSUyMHdhdGVyfGVufDF8fHx8MTc3OTA1MTQyN3ww&ixlib=rb-4.1.0&q=80&w=1920',
    'https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920'
  ];

  // Auto-rotate hero background every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const xuLyTimKiem = () => {
    let results = [...allTours];

    if (destination) {
      results = results.filter(tour =>
        tour.destination.toLowerCase().includes(destination.toLowerCase()) ||
        tour.name.toLowerCase().includes(destination.toLowerCase())
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      results = results.filter(tour => {
        if (!tour.departureDate) return false;
        return new Date(tour.departureDate) >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      results = results.filter(tour => {
        if (!tour.departureDate) return false;
        return new Date(tour.departureDate) <= end;
      });
    }

    if (maxPrice) {
      results = results.filter(tour => tour.price <= parseInt(maxPrice));
    }

    setFilteredTours(results);
    setTourPage(1);
    setSelectedDestination(null);
    setSelectedCategory(null);

    // Update URL to reflect search so header label shows correctly
    if (destination) {
      setSearchParams({ search: destination });
    } else {
      setSearchParams({});
    }

    // Scroll to results after short delay to allow render
    setTimeout(() => cuonDenDanhSachTour(), 100);
  };

  const xuLyLocDiemDen = (destName: string) => {
    const results = allTours.filter(tour =>
      tour.destination.toLowerCase().includes(destName.toLowerCase())
    );
    setFilteredTours(results);
    setTourPage(1);
    cuonDenDanhSachTour();
  };

  const xuLyLocDanhMuc = (categoryId: string) => {
    let results = [...allTours];

    const beachKeywords = [
      'phu quoc', 'nha trang', 'ha long', 'con dao', 'mui ne', 'phan thiet', 'vung tau',
      'quy nhon', 'phu yen', 'tuy hoa', 'cu lao cham', 'co to', 'cat ba', 'ly son',
      'binh thuan', 'khanh hoa', 'quang ninh', 'hai phong', 'sam son', 'cua lo',
      'quang binh', 'binh dinh', 'ninh thuan', 'phan rang', 'ba ria', 'kien giang'
    ];

    const mountainKeywords = [
      'sa pa', 'da lat', 'moc chau', 'ha giang', 'cao bang', 'bac kan', 'lang son',
      'tuyen quang', 'thai nguyen', 'phu tho', 'bac giang', 'lai chau', 'dien bien',
      'son la', 'yen bai', 'hoa binh', 'kon tum', 'gia lai', 'dak lak', 'dak nong',
      'lam dong', 'buon ma thuot', 'pleiku', 'mang den', 'ta xua', 'bao loc'
    ];

    const cityKeywords = [
      'ha noi', 'ho chi minh', 'sai gon', 'da nang', 'hai phong', 'can tho', 'hue',
      'hoi an', 'ninh binh', 'vinh', 'thanh hoa', 'nam dinh', 'thai binh', 'hai duong',
      'hung yen', 'vinh phuc', 'bac ninh', 'dong nai', 'bien hoa', 'binh duong', 'thu dau mot'
    ];

    const countrysideKeywords = [
      'can tho', 'vinh long', 'long an', 'tien giang', 'ben tre', 'tra vinh', 'dong thap',
      'an giang', 'kien giang', 'hau giang', 'soc trang', 'bac lieu', 'ca mau', 'my tho',
      'chau doc', 'ha tien'
    ];

    switch (categoryId) {
      case 'beach':
        results = results.filter(tour =>
          beachKeywords.some(keyword => chuanHoaVanBan(tour.destination).includes(keyword))
        );
        break;
      case 'mountain':
        results = results.filter(tour =>
          mountainKeywords.some(keyword => chuanHoaVanBan(tour.destination).includes(keyword))
        );
        break;
      case 'city':
        results = results.filter(tour =>
          cityKeywords.some(keyword => chuanHoaVanBan(tour.destination).includes(keyword))
        );
        break;
      case 'countryside':
        results = results.filter(tour =>
          countrysideKeywords.some(keyword => chuanHoaVanBan(tour.destination).includes(keyword))
        );
        break;
    }

    setFilteredTours(results);
    setTourPage(1);
    cuonDenDanhSachTour();
  };

  const handleSearchFilter = (query: string) => {
    const results = allTours.filter(tour =>
      tour.name.toLowerCase().includes(query.toLowerCase()) ||
      tour.destination.toLowerCase().includes(query.toLowerCase()) ||
      tour.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTours(results);
    setTourPage(1);
    cuonDenDanhSachTour();
  };

  const cuonDenDanhSachTour = () => {
    const toursSection = document.getElementById('tours');
    if (toursSection) {
      toursSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const xuLyChonDiemDen = (destName: string) => {
    setSelectedDestination(destName);
    setSelectedCategory(null);
    setSearchParams({ destination: destName });
    xuLyLocDiemDen(destName);
  };

  const datLaiBoLoc = () => {
    setSelectedDestination(null);
    setSelectedCategory(null);
    setFilteredTours(allTours);
    setTourPage(1);
    setSearchParams({});
  };

  const chuanHoaVanBan = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const khopDiemDen = (tourDestination: string, destName: string) => {
    return chuanHoaVanBan(tourDestination).includes(chuanHoaVanBan(destName));
  };

  const dinhDangGia = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const layTenDanhMuc = (categoryId: string) => {
    const categories: { [key: string]: string } = {
      beach: 'Tour Biển Đảo',
      mountain: 'Tour Miền Núi',
      city: 'Tour Thành Phố',
      countryside: 'Tour Miền Tây'
    };
    return categories[categoryId] || 'Tour';
  };

  const totalTourPages = Math.ceil(filteredTours.length / TOURS_PER_PAGE);
  const tourPageStartIndex = (tourPage - 1) * TOURS_PER_PAGE;
  const paginatedTours = filteredTours.slice(tourPageStartIndex, tourPageStartIndex + TOURS_PER_PAGE);
  const pageItems = (() => {
    if (totalTourPages <= 5) {
      return Array.from({ length: totalTourPages }, (_, index) => index + 1);
    }

    const visiblePages = new Set(
      [1, totalTourPages, tourPage - 1, tourPage, tourPage + 1].filter(
        (page) => page >= 1 && page <= totalTourPages
      )
    );

    return Array.from(visiblePages)
      .sort((a, b) => a - b)
      .reduce<(number | 'ellipsis')[]>((items, page, index, pages) => {
        if (index > 0 && page - pages[index - 1] > 1) {
          items.push('ellipsis');
        }
        items.push(page);
        return items;
      }, []);
  })();

  const chuyenTrangTour = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalTourPages || 1);
    setTourPage(nextPage);
    setTimeout(() => cuonDenDanhSachTour(), 0);
  };

  useEffect(() => {
    if (tourPage > totalTourPages && totalTourPages > 0) {
      setTourPage(totalTourPages);
    }
  }, [tourPage, totalTourPages]);

  // Handle filters from URL after tours and filter handlers are ready.
  useEffect(() => {
    const destParam = searchParams.get('destination');
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (destParam) {
      setSelectedDestination(destParam);
      setSelectedCategory(null);
      xuLyLocDiemDen(destParam);
    } else if (categoryParam) {
      setSelectedDestination(null);
      setSelectedCategory(categoryParam);
      xuLyLocDanhMuc(categoryParam);
    } else if (searchParam) {
      setSelectedDestination(null);
      setSelectedCategory(null);
      handleSearchFilter(searchParam);
    } else {
      setFilteredTours(allTours);
    }
  }, [searchParams, allTours]);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Fullscreen with rotating background */}
      <div className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Stacked background images with crossfade */}
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: heroIndex === idx ? 1 : 0
            }}
          />
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              Khám Phá Việt Nam Cùng
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Digital Travel
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 font-light max-w-2xl mx-auto">
              Du lịch thông minh • Bền vững • Trải nghiệm khác biệt
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Điểm đến
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Nhập điểm đến..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) {
                      setEndDate('');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (startDate && e.target.value < startDate) {
                      setStartDate('');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Ngân sách tối đa
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="VNĐ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <button
              onClick={xuLyTimKiem}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Tìm kiếm tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flash Sale Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-white px-6 py-3 rounded-full mb-4 shadow-lg">
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent font-bold text-xl">🔥 FLASH SALE - ƯU ĐÃI SỐC 🔥</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
              Giảm Đến 30% - Đặt Ngay Hôm Nay!
            </h2>
            <p className="text-xl text-white opacity-90 drop-shadow-md">
              Chương trình có thời hạn - Nhanh tay đặt tour yêu thích
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allTours
              .filter((t): t is Tour & { originalPrice: number } => typeof t.originalPrice === 'number')
              .sort((a, b) => {
                const discountA = (a.originalPrice - a.price) / a.originalPrice;
                const discountB = (b.originalPrice - b.price) / b.originalPrice;
                return discountB - discountA;
              })
              .slice(0, 3)
              .map((tour) => (
                <TourCard key={tour.id} tour={tour} dinhDangGia={dinhDangGia} />
              ))}
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Điểm Đến Phổ Biến
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá những địa điểm được yêu thích nhất tại Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Hạ Long', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400' },
              { name: 'Sa Pa', image: 'https://images.unsplash.com/photo-1609412058473-c199497c3c5d?w=400' },
              { name: 'Hội An', image: 'https://images.unsplash.com/photo-1562005094-c724030f99bd?w=400' },
              { name: 'Phú Quốc', image: 'https://images.unsplash.com/photo-1514890084135-f16d926f4d03?w=400' },
              { name: 'Đà Lạt', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400' },
              { name: 'Nha Trang', image: 'https://images.unsplash.com/photo-1732243395944-cb3ff9311091?w=400' },
              { name: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400' },
              { name: 'Cần Thơ', image: 'https://images.unsplash.com/photo-1543411789-1a67a2ac05c6?w=400' }
            ].map((dest, idx) => {
              const tourCount = allTours.filter(tour => khopDiemDen(tour.destination, dest.name)).length;
              return (
                <div
                  key={idx}
                  onClick={() => xuLyChonDiemDen(dest.name)}
                  className={`relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all ${selectedDestination === dest.name ? 'ring-4 ring-blue-500' : ''
                    }`}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-xl mb-1">{dest.name}</h3>
                    <p className="text-white/90 text-sm">{tourCount} tour</p>
                  </div>
                  {selectedDestination === dest.name && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Đã chọn
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tour Categories & Top Rated Tours */}
      <div id="tours" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            {selectedDestination
              ? `Tour ${selectedDestination}`
              : selectedCategory
                ? layTenDanhMuc(selectedCategory)
                : searchParams.get('search')
                  ? `Kết quả tìm kiếm: "${searchParams.get('search')}"`
                  : 'Khám Phá Các Tour Nổi Bật'}
          </h2>
          <p className="text-lg text-gray-600">
            {selectedDestination || selectedCategory || searchParams.get('search') ? (
              <span>
                Tìm thấy {filteredTours.length} tour •
                <button
                  onClick={datLaiBoLoc}
                  className="text-blue-600 hover:underline ml-2"
                >
                  Xem tất cả tour
                </button>
              </span>
            ) : (
              'Được yêu thích nhất bởi khách hàng'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTours.length > 0 ? (
            paginatedTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} dinhDangGia={dinhDangGia} />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy tour phù hợp</p>
              <button
                onClick={() => {
                  setSelectedDestination(null);
                  setFilteredTours(allTours);
                  setTourPage(1);
                  setSearchParams({});
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xem tất cả tour
              </button>
            </div>
          )}
        </div>

        {totalTourPages > 1 && (
          <div className="mt-10 flex items-center justify-center">
            <nav
              aria-label="Phân trang tour"
              className="inline-flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => chuyenTrangTour(tourPage - 1)}
                disabled={tourPage === 1}
                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none disabled:bg-slate-100 disabled:text-slate-300"
                aria-label="Trang trước"
              >
                <ChevronLeft className="size-3.5" />
              </button>

              {pageItems.map((item, index) => (
                item === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-sm font-semibold text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => chuyenTrangTour(item)}
                    className={`size-9 rounded-lg border bg-white text-sm font-semibold transition-colors ${item === tourPage
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                        : 'border-slate-100 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    aria-current={item === tourPage ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              ))}

              <button
                type="button"
                onClick={() => chuyenTrangTour(tourPage + 1)}
                disabled={tourPage === totalTourPages}
                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none disabled:bg-slate-100 disabled:text-slate-300"
                aria-label="Trang sau"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* How to Book */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              ĐẶT TOUR chỉ với 4 BƯỚC đơn giản
            </h2>
            <p className="text-lg text-gray-600">
              Trải nghiệm đặt tour nhanh chóng, dễ dàng và an toàn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '🔍', title: 'Tìm Kiếm Tour', desc: 'Lựa chọn tour yêu thích từ hàng trăm điểm đến' },
              { step: '2', icon: '📝', title: 'Điền Thông Tin', desc: 'Nhập thông tin hành khách và chọn dịch vụ' },
              { step: '3', icon: '💳', title: 'Thanh Toán', desc: 'Thanh toán an toàn qua nhiều phương thức' },
              { step: '4', icon: '✈️', title: 'Nhận Vé & Đi', desc: 'Nhận vé điện tử nhanh chóng và sẵn sàng khởi hành' }
            ].map((item, idx) => (
              <div key={idx} className="text-center relative">
                <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-[15px] leading-relaxed max-w-[240px] mx-auto">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full z-0">
                    <div className="border-t-4 border-dashed border-blue-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

const dinhDangNgay = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('vi-VN');
};

const dinhDangKhoangNgay = (startDate?: string, endDate?: string) => {
  const start = dinhDangNgay(startDate);
  const end = dinhDangNgay(endDate);

  if (start && end) return `${start} - ${end}`;
  return start || end;
};

// Tour Card Component
function TourCard({ tour, dinhDangGia }: { tour: any; dinhDangGia: (price: number) => string }) {
  const dateRange = dinhDangKhoangNgay(tour.departureDate, tour.endDate);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-56 object-cover"
        />
        {tour.originalPrice && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{Math.round((1 - tour.price / tour.originalPrice) * 100)}%
          </div>
        )}
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span>{tour.rating}</span>
          <span className="text-gray-500">({tour.reviews})</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-900">{tour.name}</h3>
        <p className="text-gray-600 text-sm mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-1 shrink-0 text-gray-500" />
          {tour.duration}
        </p>
        <p className="text-gray-600 text-sm mb-4 flex items-center gap-x-1">
          <Calendar className="w-4 h-4 shrink-0 text-gray-500" />
          <span>{dateRange}</span>
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            {tour.originalPrice && (
              <p className="text-gray-400 line-through text-sm">
                {dinhDangGia(tour.originalPrice)}
              </p>
            )}
            <p className="text-blue-600 font-bold text-xl">
              {dinhDangGia(tour.price)}
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            <span>{tour.availableSeats}/{tour.totalSeats} chỗ</span>
          </div>
        </div>

        <Link
          to={`/tour/${tour.id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
