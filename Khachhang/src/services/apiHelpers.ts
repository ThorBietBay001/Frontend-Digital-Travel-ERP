import type { Booking, Tour, Voucher } from '../types';

type ApiRecord = Record<string, any>;

export const unwrapData = <T = any>(response: any): T => {
  return (response?.data ?? response) as T;
};

export const unwrapPageContent = <T = any>(response: any): T[] => {
  const data = unwrapData<any>(response);
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.content)) return data.content as T[];
  return [];
};

const toNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const taoSeedNumber = (value: string): number => {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

const laySoNgauNhienOnDinh = (seed: string, min: number, max: number): number => {
  const range = max - min + 1;
  return min + (taoSeedNumber(seed) % range);
};

const formatDuration = (days?: number | string, seed = ''): string => {
  const value = toNumber(days, 0);
  if (value > 0) return `${value} ngày`;

  const generatedDays = laySoNgauNhienOnDinh(seed || 'digital-travel-duration', 1, 5);
  return `${generatedDays} ngày`;
};

const getDurationDays = (days?: number | string, seed = ''): number => {
  const value = toNumber(days, 0);
  if (value > 0) return value;

  return laySoNgauNhienOnDinh(seed || 'digital-travel-duration', 1, 5);
};

const formatTripDuration = (days: number): string => {
  const nights = days <= 1 ? 1 : days - 1;
  return `${formatDuration(days)} ${nights} đêm`;
};

const calculateEndDate = (startDate: string, days: number): string => {
  if (!startDate) return '';

  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return '';

  date.setDate(date.getDate() + Math.max(days - 1, 0));
  return date.toISOString().slice(0, 10);
};

const tinhGiaGocGiaLap = (price: number, seed: string): number | undefined => {
  if (price <= 0) return undefined;

  const discountPercent = laySoNgauNhienOnDinh(`${seed}-discount`, 8, 28);
  const originalPrice = Math.ceil(price / (1 - discountPercent / 100) / 10000) * 10000;
  return Math.max(originalPrice, price + 10000);
};

const cleanListItem = (value: string): string => {
  return value
    .replace(/^[-–—•\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const splitTourNotes = (value: string): string[] => {
  return value
    .split(/\s*(?:[-–—•]\s+|,\s*|;\s*)/)
    .map(cleanListItem)
    .filter(Boolean);
};

export const splitItineraryActivities = (value: string): { time: string, activity: string }[] => {
  if (!value) return [];
  return value
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

const extractTourIncludes = (moTa: string): string[] => {
  const match = moTa.match(/bao gồm[^:]*:\s*([\s\S]*?)(?=\s*không bao gồm|$)/i);
  return match?.[1] ? splitTourNotes(match[1]) : [];
};

const extractTourExcludes = (moTa: string): string[] => {
  const match = moTa.match(/không bao gồm[^:]*:\s*([\s\S]*?)$/i);
  return match?.[1] ? splitTourNotes(match[1]) : [];
};

const buildTourIntro = (tour: Tour): string => {
  const destination = tour.destination || tour.name;

  return `Khám phá ${destination} theo cách trọn vẹn nhất cùng hành trình ${tour.name} – nơi mỗi điểm dừng không chỉ là một chuyến tham quan mà còn là trải nghiệm đáng nhớ về văn hóa, thiên nhiên và con người bản địa. Với lịch trình ${tour.duration}, tour được thiết kế hài hòa giữa nghỉ dưỡng, khám phá và các hoạt động trải nghiệm xanh, mang đến cảm giác thư thái nhưng vẫn đầy cảm hứng cho mọi du khách để bạn tận hưởng chuyến đi một cách tiện lợi, an toàn và đáng nhớ cùng Digital Travel.`;
};

export const tourImage = (id?: string): string => {
  return `https://picsum.photos/seed/${encodeURIComponent(id || 'digital-travel')}/900/650`;
};

export const mapPublicTour = (item: ApiRecord): Tour => {
  const id = item.maTourThucTe || item.id || '';
  const title = item.tieuDeTour || item.name || 'Tour du lịch';
  const destination = title.includes('-') ? title.split('-')[0].trim() : 'Việt Nam';
  const price = toNumber(item.giaHienHanh ?? item.price, 0);
  const totalSeats = toNumber(item.soKhachToiDa ?? item.totalSeats, 0);
  const originalPrice = toNumber(item.giaGoc ?? item.originalPrice, 0) || tinhGiaGocGiaLap(price, id || title);
  const durationDays = getDurationDays(item.thoiLuong, id || title);
  const departureDate = item.ngayKhoiHanh || '';
  const endDate = item.ngayKetThuc || calculateEndDate(departureDate, durationDays);

  return {
    id,
    code: id,
    title,
    name: title,
    duration: formatTripDuration(durationDays),
    location: destination,
    destination,
    price,
    originalPrice,
    rating: toNumber(item.diemDanhGia, 0),
    reviews: toNumber(item.soDanhGia, 0),
    image: item.hinhAnh || item.image || tourImage(id),
    tags: item.trangThai ? [item.trangThai] : [],
    startDate: departureDate,
    departureDate,
    endDate,
    availableSeats: toNumber(item.choConLai, totalSeats),
    totalSeats,
    description: item.moTa || '',
    highlights: [],
    included: [],
    excluded: [],
    itinerary: [],
    includes: [],
    excludes: [],
    greenActions: []
  };
};

export const mapTourDetail = (item: ApiRecord, greenActions: ApiRecord[] = []): Tour => {
  const tour = mapPublicTour(item);
  const moTa = item.moTa || '';
  const includes = extractTourIncludes(moTa);
  const excludes = extractTourExcludes(moTa);

  let mainDescription = moTa.trim();
  const matchDesc = moTa.match(/^([\s\S]*?)(?=\s*(?:bao gồm|không bao gồm))/i);
  if (matchDesc) {
    mainDescription = matchDesc[1].trim();
  }

  return {
    ...tour,
    description: mainDescription || buildTourIntro(tour),
    includes,
    excludes,
    included: includes,
    excluded: excludes,
    itinerary: (item.lichTrinh || []).map((lt: ApiRecord) => {
      const hoatDongStr = lt.hoatDong || '';
      const isTimeline = /\d{2}:\d{2}\s*[-–—]/.test(hoatDongStr);
      const isMultiline = /\\n|\n|<br/.test(hoatDongStr);
      
      let title = `Hoạt động ngày ${lt.ngayThu || 1}`;
      let activitiesStr = hoatDongStr;

      if (!isTimeline && !isMultiline && hoatDongStr.length > 0 && hoatDongStr.length < 150) {
        title = hoatDongStr;
        activitiesStr = '';
      } else if (isTimeline || isMultiline) {
        title = '';
      } else if (hoatDongStr) {
        title = hoatDongStr.substring(0, 50) + (hoatDongStr.length > 50 ? '...' : '');
      }

      return {
        day: toNumber(lt.ngayThu, 1),
        title,
        description: lt.moTa || '',
        meals: lt.thucDon || '',
        menu: lt.thucDon || '',
        activities: splitItineraryActivities(activitiesStr)
      };
    }),
    greenActions: greenActions.map(mapGreenAction)
  };
};

export const mapProfile = (p: ApiRecord) => ({
  fullName: p?.hoTen || '',
  username: p?.tenDangNhap || '',
  email: p?.email || '',
  phone: p?.soDienThoai || p?.sdt || p?.phone || p?.taiKhoan?.soDienThoai || '',
  accountStatus: p?.trangThaiTaiKhoan || p?.trangThai || p?.taiKhoan?.trangThai || 'HOAT_DONG',
  address: '',
  membershipTier: p?.hangThanhVien || 'THANH_VIEN',
  greenPoints: toNumber(p?.diemXanh, 0),
  dateOfBirth: p?.ngaySinh || '',
  idCard: p?.cccd || '',
  healthInfo: p?.ghiChuYTe || '',
  allergies: p?.diUng || ''
});

export const mapCustomerBookingStatus = (b: ApiRecord): Booking['status'] => {
  const orderStatus = b.trangThai || '';
  const tourStatus = b.trangThaiTour || '';

  if (orderStatus === 'DA_XAC_NHAN' && ['KET_THUC', 'DA_QUYET_TOAN'].includes(tourStatus)) {
    return 'KET_THUC';
  }

  if (!orderStatus && tourStatus === 'DA_QUYET_TOAN') {
    return 'KET_THUC';
  }

  if (orderStatus === 'DA_QUYET_TOAN') {
    return 'KET_THUC';
  }

  return (orderStatus || tourStatus || 'DA_XAC_NHAN') as Booking['status'];
};

export const mapBooking = (b: ApiRecord): Booking => {
  const id = b.maDatTour || b.maLichSuTour || '';
  const tourId = b.maTourThucTe || '';
  return {
    id,
    tourId,
    tourName: b.tieuDeTour || 'Tour du lịch',
    bookingDate: b.ngayDat || b.ngayThamGia || '',
    departureDate: b.ngayKhoiHanh || '',
    totalAmount: toNumber(b.tongTien, 0),
    status: mapCustomerBookingStatus(b),
    guests: Array.isArray(b.chiTietKhach) ? b.chiTietKhach.length : 1,
    passengers: Array.isArray(b.chiTietKhach) ? b.chiTietKhach.length : 1,
    bookingCode: id,
    paymentMethod: b.phuongThuc,
    paymentStatus: b.trangThaiThanhToan,
    paymentTransactionId: b.maGiaoDich,
    paymentAmount: toNumber(b.soTienThanhToan, 0),
    paymentPaidAt: b.ngayThanhToan || '',
    hasConfirmedTransfer: Boolean(b.daBaoChuyenKhoan),
    originalAmount: toNumber(b.tongTienGoc, 0),
    discountAmount: toNumber(b.soTienUuDai, 0),
    voucherId: b.maVoucher || '',
    voucherCode: b.maCodeVoucher || '',
    expectedGreenPoints: toNumber(b.diemXanhDuKien, 0),
    tourImage: b.hinhAnh || b.image || tourImage(tourId),
    note: b.ghiChu || '',
    adultCount: toNumber(b.soNguoiLon, 0),
    childCount: toNumber(b.soTreEm, 0),
    customerName: b.tenKhachHang || '',
    details: Array.isArray(b.chiTietKhach) ? b.chiTietKhach : [],
    services: Array.isArray(b.chiTietDichVu) ? b.chiTietDichVu : [],
    guideName: b.tenHuongDanVien || '',
    guidePhone: b.soDienThoaiHuongDanVien || '',
    guideRating: toNumber(b.danhGiaHuongDanVien, 0),
    guideReviewCount: toNumber(b.soDanhGiaHuongDanVien, 0),
    hasReviewed: Boolean(b.daDanhGia),
    hasComplaint: Boolean(b.daKhieuNai),
    complaintStatus: b.trangThaiKhieuNai || ''
  };
};

export const mapVoucher = (v: ApiRecord): Voucher => ({
  id: v.maVoucher || v.id || '',
  code: v.maCode || v.maVoucher || v.code || '',
  title: 'VOUCHER ƯU ĐÃI SỐC',
  discount: toNumber(v.giaTriGiam ?? v.discount, 0),
  discountType: v.loaiUuDai === 'PHAN_TRAM' ? 'percent' : 'fixed',
  maxDiscount: v.mucGiamToiDa == null ? undefined : toNumber(v.mucGiamToiDa, 0),
  requiredGreenPoints: toNumber(v.diemCanDoi, 0),
  minPurchase: 0,
  expiryDate: v.ngayHetHan || '',
  status: v.trangThai === 'CO_HIEU_LUC' || v.trangThai === 'SAN_SANG' ? 'active' : v.trangThai === 'HET_HAN' ? 'expired' : 'used',
  description: (v.dieuKienApDung || 'Voucher ưu đãi từ Digital Travel').replace(/\. /g, '.\n')
});

const getGreenActionDescription = (actionId: string, title: string) => {
  const descriptions: Record<string, string> = {
    HDX_BOTTLE: 'Giảm rác thải nhựa trong suốt hành trình, phù hợp tour leo núi và tham quan dài ngày.',
    HDX_CLEANUP: 'Cùng hướng dẫn viên làm sạch khu tham quan theo khung giờ an toàn của đoàn.',
    HDX_EBILL: 'Nhận chứng từ điện tử để hạn chế in ấn và lưu trữ thông tin đặt tour thuận tiện hơn.',
    HDX_TREE: 'Đóng góp vào hoạt động trồng cây hoặc phục hồi cảnh quan tại điểm đến.',
    HDX_LOCAL: 'Ưu tiên sản phẩm địa phương, giảm đồ nhựa dùng một lần và hỗ trợ sinh kế bản địa.',
    HDX_REFILL: 'Dùng trạm tiếp nước trong lịch trình để hạn chế chai nhựa phát sinh trên xe và tại điểm tham quan.',
    HDX_PUBLIC_TRANSFER: 'Ưu tiên xe ghép hoặc phương tiện công cộng cho chặng ngắn, giảm phát thải của đoàn.',
    HDX_LOCAL_MEAL: 'Chọn bữa ăn theo mùa từ nguyên liệu địa phương, phù hợp trải nghiệm ẩm thực bản địa.',
    HDX_CORAL_SAFE: 'Tuân thủ quy tắc bảo vệ biển, không chạm san hô và không xả rác khi tham gia hoạt động nước.',
    HDX_REUSABLE_BAG: 'Mang túi cá nhân khi mua đặc sản để giảm túi nilon tại chợ và làng nghề.',
    HDX_COMMUNITY_BUY: 'Mua sản phẩm trực tiếp từ cộng đồng địa phương để tăng lợi ích cho người dân điểm đến.'
  };

  return descriptions[actionId] || `Cam kết ${title.toLowerCase()} theo điều kiện thực tế của chuyến đi.`;
};

export const mapGreenAction = (a: ApiRecord) => {
  const id = a.maHanhDongXanh || a.id || '';
  const title = a.tenHanhDong || a.title || 'Hành động xanh';

  return {
    id,
    title,
    points: toNumber(a.diemCong ?? a.points, 0),
    description: a.moTa || getGreenActionDescription(id, title)
  };
};

export const mapExtraService = (s: ApiRecord) => ({
  id: s.maDichVuThem || s.id || '',
  title: s.ten || s.title || 'Dịch vụ thêm',
  price: toNumber(s.donGia ?? s.price, 0),
  description: s.donViTinh ? `Đơn vị tính: ${s.donViTinh}` : 'Dịch vụ bổ sung cho chuyến đi.'
});

export const mapReview = (r: ApiRecord) => ({
  name: r.hoTenKhachHang || 'Khách hàng',
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.hoTenKhachHang || 'Khách hàng')}&background=random`,
  rating: toNumber(r.soSao, 5),
  date: r.ngayDanhGia ? new Date(r.ngayDanhGia).toLocaleDateString('vi-VN') : '',
  tag: r.tieuDeTour || 'Khách đã đi tour',
  tier: 'Thành viên',
  comment: r.nhanXet || '',
  helpful: 0,
  images: [],
  greenAction: 'Đánh giá từ dữ liệu ERP'
});
