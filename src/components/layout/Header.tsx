import { Link } from 'react-router';
import { User, Menu, X, Bell, LogOut, HelpCircle, Search, ChevronDown, AlertCircle, Send } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import CuaSoXacThuc from '../modals/CuaSoXacThuc';
import FAQModal from '../modals/FAQModal';
import { khService } from '../../services/khService';
import { mapProfile, unwrapData, unwrapPageContent } from '../../services/apiHelpers';
import { AUTH_SESSION_CLEARED_EVENT, hasActiveSession } from '../../services/api';
import digitalTravelLogo from '../../assets/digital-travel-logo.svg';

type HeaderNotification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type?: 'BOOKING' | 'COMPLAINT' | 'SUPPORT_NEED_INFO';
  supportRequest?: any;
};

const READ_NOTIFICATIONS_KEY = 'kh-read-notifications';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(hasActiveSession);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<any | null>(null);
  const [supportReplyContent, setSupportReplyContent] = useState('');
  const [isSubmittingSupportReply, setIsSubmittingSupportReply] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const tourCategories = [
    { id: 'beach', name: 'Biển Đảo', icon: '🏖️' },
    { id: 'mountain', name: 'Miền Núi', icon: '⛰️' },
    { id: 'city', name: 'Thành Phố', icon: '🏙️' },
    { id: 'countryside', name: 'Miền Tây', icon: '🌾' },
  ];

  const layThongBaoDaDoc = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const luuThongBaoDaDoc = (ids: string[]) => {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(new Set(ids))));
  };

  useEffect(() => {
    const handleSessionCleared = () => {
      setIsLoggedIn(false);
      setNotifications([]);
      setShowNotifications(false);
      if (window.location.pathname.includes('/passport')) {
        window.location.href = '/';
      }
    };

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
    return () => window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await khService.layDanhSachTour({ size: 20 });
        const titles = unwrapPageContent(res)
          .map((tour: any) => tour.tieuDeTour)
          .filter(Boolean);
        setSearchSuggestions(Array.from(new Set(titles)));
      } catch (error) {
        console.error('Không thể tải gợi ý tìm kiếm:', error);
        setSearchSuggestions([]);
      }
    };
    fetchSuggestions();
  }, []);

  const taiThongBao = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    try {
      const [res, profileResponse, supportResponse, complaintResponse] = await Promise.all([
        khService.getMyBookings({ size: 50 }),
        khService.layHoChieuSo(),
        khService.layYeuCauCanBoSung().catch(() => ({ data: [] })),
        khService.layYeuCauHoTro({ loaiYeuCau: 'KHIEU_NAI', size: 50 }).catch(() => ({ data: { content: [] } }))
      ]);
      localStorage.setItem('userProfile', JSON.stringify(mapProfile(unwrapData(profileResponse))));
      const readNotificationIds = layThongBaoDaDoc();
      const bookingItems: HeaderNotification[] = unwrapPageContent(res).map((booking: any) => {
        const statusMap: Record<string, string> = {
          'CHO_XAC_NHAN': 'Chờ xác nhận',
          'DA_XAC_NHAN': 'Đã xác nhận',
          'DA_HUY': 'Đã hủy',
          'HOAN_THANH': 'Hoàn thành'
        };
        const trangThaiText = statusMap[booking.trangThai] || booking.trangThai;
        const id = `booking-${booking.maDatTour}-${booking.trangThai || 'NONE'}`;

        return {
          id,
          title: 'Cập nhật đơn đặt tour',
          desc: `${booking.tieuDeTour || booking.maTourThucTe}: ${trangThaiText}`,
          time: booking.ngayDat ? new Date(booking.ngayDat).toLocaleDateString('vi-VN') : '',
          unread: !readNotificationIds.includes(id),
          type: 'BOOKING'
        };
      });

      const supportItems: HeaderNotification[] = (supportResponse?.data || []).map((request: any) => {
        const id = `support-${request.maYeuCau}-${request.trangThai}-${request.noiDung || ''}`;
        return {
          id,
          title: 'Yêu cầu bổ sung thông tin',
          desc: `${request.maYeuCau}${request.maDatTour ? ` · ${request.maDatTour}` : ''}`,
          time: 'Chờ bạn phản hồi',
          unread: !readNotificationIds.includes(id),
          type: 'SUPPORT_NEED_INFO',
          supportRequest: request
        };
      });

      const complaintStatusMap: Record<string, string> = {
        CHUA_XU_LY: 'Đang chờ xử lý',
        CHO_BO_SUNG: 'Cần bổ sung thông tin',
        CHO_GIAI_TRINH: 'Đang chờ giải trình',
        CHO_DUYET: 'Đang chờ duyệt',
        DA_XU_LY: 'Đã giải quyết',
        TU_CHOI: 'Đã từ chối'
      };
      const supportRequestIds = new Set(supportItems.map(item => item.supportRequest?.maYeuCau));
      const complaintItems: HeaderNotification[] = unwrapPageContent(complaintResponse)
        .filter((complaint: any) => !supportRequestIds.has(complaint.maYeuCau))
        .map((complaint: any) => {
          const id = `complaint-${complaint.maYeuCau}-${complaint.trangThai}-${complaint.noiDung || ''}`;
          return {
            id,
            title: 'Cập nhật khiếu nại',
            desc: `${complaint.maYeuCau}: ${complaintStatusMap[complaint.trangThai] || complaint.trangThai}`,
            time: complaint.maDatTour || '',
            unread: !readNotificationIds.includes(id),
            type: 'COMPLAINT'
          };
        });

      setNotifications([...supportItems, ...complaintItems, ...bookingItems]);
    } catch {
      setNotifications([]);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    taiThongBao();
    const refreshInterval = window.setInterval(taiThongBao, 30000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        taiThongBao();
      }
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [taiThongBao]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
      setShowSearchSuggestions(false);
    }
  };

  const filteredSuggestions = searchSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const xuLyDangXuat = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    if (window.location.pathname.includes('/passport')) {
      window.location.href = '/';
    }
  };

  const danhDauTatCaDaDoc = () => {
    luuThongBaoDaDoc([...layThongBaoDaDoc(), ...notifications.map(notif => notif.id)]);
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
  };

  const moThongBaoDatTour = (id: string) => {
    luuThongBaoDaDoc([...layThongBaoDaDoc(), id]);
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, unread: false } : notif));
  };

  const moYeuCauBoSung = (notif: HeaderNotification) => {
    moThongBaoDatTour(notif.id);
    setSelectedSupportRequest(notif.supportRequest || null);
    setSupportReplyContent('');
    setShowNotifications(false);
    setIsMenuOpen(false);
  };

  const guiBoSungHoTro = async () => {
    if (!selectedSupportRequest?.maYeuCau || !supportReplyContent.trim()) {
      return;
    }

    setIsSubmittingSupportReply(true);
    try {
      await khService.boSungYeuCauHoTro(selectedSupportRequest.maYeuCau, supportReplyContent.trim());
      setSelectedSupportRequest(null);
      setSupportReplyContent('');
      await taiThongBao();
      window.dispatchEvent(new CustomEvent('kh-toast', {
        detail: { message: 'Đã gửi thông tin bổ sung đến bộ phận xử lý.', type: 'success' }
      }));
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
      window.dispatchEvent(new CustomEvent('kh-toast', {
        detail: { message: apiMessage || 'Không thể gửi bổ sung. Vui lòng thử lại.', type: 'error' }
      }));
    } finally {
      setIsSubmittingSupportReply(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Shared Digital Travel brand */}
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700" title="Về trang chủ">
              <img src={digitalTravelLogo} alt="Digital Travel" className="w-9 h-9" />
              <span className="font-bold text-xl">Digital Travel</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 flex-1 mx-8">
              {/* Search Bar - Left */}
              <div className="relative flex-1 max-w-xl" ref={searchRef}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit();
                      }
                    }}
                    placeholder="Tìm kiếm tour theo tên, địa điểm..."
                    className="w-full pl-11 pr-20 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {searchQuery && (
                    <>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Xóa"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSearchSubmit}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Tìm
                      </button>
                    </>
                  )}
                </div>

                {/* Search Suggestions Dropdown */}
                {showSearchSuggestions && searchQuery && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                    <div className="px-3 py-2 text-xs text-gray-500 font-medium">
                      Gợi ý tìm kiếm
                    </div>
                    {filteredSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSearchSuggestions(false);
                          window.location.href = `/?search=${encodeURIComponent(suggestion)}`;
                        }}
                        className="w-full px-4 py-2.5 hover:bg-blue-50 text-left flex items-center space-x-3 transition-colors"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tour Categories Dropdown */}
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Danh mục tour</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {tourCategories.map(category => (
                      <Link
                        key={category.id}
                        to={`/?category=${category.id}`}
                        onClick={() => setShowCategoryDropdown(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                      >
                        <span className="text-2xl">{category.icon}</span>
                        <span className="text-gray-700 font-medium">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Notification Bell - only when logged in */}
              {isLoggedIn && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.some((notif) => notif.unread) && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Thông báo</h3>
                        <button
                          type="button"
                          onClick={danhDauTatCaDaDoc}
                          className="text-xs text-blue-600 cursor-pointer hover:underline"
                        >
                          Đánh dấu đã đọc
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">Chưa có thông báo mới</div>
                        ) : notifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => notif.type === 'SUPPORT_NEED_INFO' ? moYeuCauBoSung(notif) : moThongBaoDatTour(notif.id)}
                            className={`relative px-4 py-3 pr-9 hover:bg-gray-50 border-b border-gray-50 cursor-pointer ${notif.type === 'SUPPORT_NEED_INFO' ? 'pb-4 pr-14' : ''} ${notif.unread ? 'bg-blue-50/50' : ''}`}
                          >
                            <div className="mb-1">
                              <h4 className={`text-sm font-medium ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</h4>
                            </div>
                            {notif.unread && <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-blue-600"></span>}
                            <p className="text-xs text-gray-600 mb-1">{notif.desc}</p>
                            <span className="text-xs text-gray-400">{notif.time}</span>
                            {notif.type === 'SUPPORT_NEED_INFO' && (
                              <button
                                type="button"
                                title="Cập nhật thông tin"
                                aria-label="Cập nhật thông tin"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  moYeuCauBoSung(notif);
                                }}
                                className="absolute bottom-3 right-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-[0_5px_14px_rgba(37,99,235,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100/80 hover:text-blue-700 hover:shadow-[0_9px_18px_rgba(37,99,235,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/50 active:translate-y-0 active:scale-95"
                              >
                                <Send className="h-[17px] w-[17px]" strokeWidth={1.85} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-100 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotifications(false);
                            window.location.href = '/passport';
                          }}
                          className="text-sm text-blue-600 cursor-pointer hover:underline"
                        >
                          Xem tất cả
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFAQ(true)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Trợ giúp"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                  <Link
                    to="/passport"
                    className="flex items-center p-1 hover:bg-blue-50 rounded-full transition-all border-2 border-transparent hover:border-blue-400"
                    title="Xem Hộ chiếu số / Hồ sơ của bạn"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border border-blue-500">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </Link>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    title="Đăng xuất"
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFAQ(true)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Trợ giúp"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                  {/* User icon + label - triggers dangNhap modal */}
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Đăng nhập / Đăng ký"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Đăng nhập</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Link
                        to="/passport"
                        className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Hộ chiếu số
                      </Link>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowNotifications(!showNotifications)}
                          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Bell className="w-5 h-5" />
                          {notifications.some((notif) => notif.unread) && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {showNotifications && (
                      <div className="bg-gray-50 rounded-lg p-2 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">Chưa có thông báo mới</div>
                        ) : notifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (notif.type === 'SUPPORT_NEED_INFO') {
                                moYeuCauBoSung(notif);
                              } else {
                                setIsMenuOpen(false);
                                moThongBaoDatTour(notif.id);
                              }
                            }}
                            className={`relative p-2 pr-8 border-b border-gray-100 last:border-0 cursor-pointer ${notif.type === 'SUPPORT_NEED_INFO' ? 'pb-3 pr-12' : ''} ${notif.unread ? 'bg-blue-50/50' : ''}`}
                          >
                            <h4 className={`text-sm ${notif.unread ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{notif.title}</h4>
                            <p className="text-xs text-gray-600">{notif.desc}</p>
                            {notif.unread && <span className="absolute right-2 top-3 h-2 w-2 rounded-full bg-blue-600"></span>}
                            {notif.type === 'SUPPORT_NEED_INFO' && (
                              <button
                                type="button"
                                title="Cập nhật thông tin"
                                aria-label="Cập nhật thông tin"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  moYeuCauBoSung(notif);
                                }}
                                className="absolute bottom-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-[0_5px_14px_rgba(37,99,235,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100/80 hover:text-blue-700 hover:shadow-[0_9px_18px_rgba(37,99,235,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/50 active:translate-y-0 active:scale-95"
                              >
                                <Send className="h-[17px] w-[17px]" strokeWidth={1.85} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Hộ chiếu số
                    </button>
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="text-left px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Đăng nhập
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center animate-fade-in">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Xác nhận đăng xuất</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc muốn đăng xuất khỏi tài khoản?<br />
              Các thay đổi chưa lưu có thể bị mất.
            </p>

            {/* Show current account info */}
            {(() => {
              const profile = (() => {
                try { return JSON.parse(localStorage.getItem('userProfile') || '{}'); } catch { return {}; }
              })();
              return profile.email ? (
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 text-left border border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Tài khoản hiện tại</p>
                  <p className="text-sm font-bold text-gray-800">{profile.fullName || 'Người dùng'}</p>
                  <p className="text-xs text-gray-500">{profile.email}</p>
                </div>
              ) : null;
            })()}

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={xuLyDangXuat}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm shadow-sm"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSupportRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fade-in">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Cập nhật thông tin bổ sung</h3>
                <p className="mt-1 text-xs font-mono text-gray-500">
                  {selectedSupportRequest.maYeuCau}
                  {selectedSupportRequest.maDatTour ? ` · ${selectedSupportRequest.maDatTour}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSupportRequest(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mb-2 block text-sm font-bold text-gray-800">Nội dung phản hồi</label>
            <textarea
              value={supportReplyContent}
              onChange={(event) => setSupportReplyContent(event.target.value)}
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Nhập thông tin bổ sung, mã giấy tờ, đường dẫn ảnh/video bằng chứng..."
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedSupportRequest(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={guiBoSungHoTro}
                disabled={!supportReplyContent.trim() || isSubmittingSupportReply}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Send className="h-4 w-4" />
                {isSubmittingSupportReply ? 'Đang gửi...' : 'Gửi bổ sung'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <CuaSoXacThuc
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} />}
    </>
  );
}
