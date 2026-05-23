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
  const departure = tour.departureDate
    ? ` khởi hành ${new Date(tour.departureDate).toLocaleDateString('vi-VN')}`
    : '';

  return `Hành trình ${tour.name} đưa du khách khám phá ${destination} với lịch trình ${tour.duration}${departure}. Chuyến đi được thiết kế để cân bằng trải nghiệm tham quan, nghỉ ngơi và các hoạt động xanh, phù hợp cho khách muốn đặt tour nhanh từ hệ thống Digital Travel.`;
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

  return {
    id,
    code: id,
    title,
    name: title,
    duration: formatDuration(item.thoiLuong, id || title),
    location: destination,
    destination,
    price,
    originalPrice,
    rating: toNumber(item.diemDanhGia, 0),
    reviews: toNumber(item.soDanhGia, 0),
    image: item.hinhAnh || item.image || tourImage(id),
    tags: item.trangThai ? [item.trangThai] : [],
    startDate: item.ngayKhoiHanh || '',
    departureDate: item.ngayKhoiHanh || '',
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

  return {
    ...tour,
    description: buildTourIntro(tour),
    includes,
    excludes,
    included: includes,
    excluded: excludes,
    itinerary: (item.lichTrinh || []).map((lt: ApiRecord) => ({
      day: toNumber(lt.ngayThu, 1),
      title: lt.tieuDe || `Ngày ${lt.ngayThu || 1}`,
      description: lt.hoatDong || '',
      meals: lt.thucDon || '',
      menu: lt.thucDon || '',
      activities: (lt.hoatDong || '').split(/[.;]/).map((s: string) => s.trim()).filter(Boolean)
    })),
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
    status: b.trangThai || b.trangThaiTour || 'DA_XAC_NHAN',
    guests: Array.isArray(b.chiTietKhach) ? b.chiTietKhach.length : 1,
    passengers: Array.isArray(b.chiTietKhach) ? b.chiTietKhach.length : 1,
    qrCode: id,
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
  minPurchase: 0,
  expiryDate: v.ngayHetHan || '',
  status: v.trangThai === 'CO_HIEU_LUC' || v.trangThai === 'SAN_SANG' ? 'active' : v.trangThai === 'HET_HAN' ? 'expired' : 'used',
  description: (v.dieuKienApDung || 'Voucher ưu đãi từ Digital Travel').replace(/\. /g, '.\n')
});

export const mapGreenAction = (a: ApiRecord) => ({
  id: a.maHanhDongXanh || a.id || '',
  title: a.tenHanhDong || a.title || 'Hành động xanh',
  points: toNumber(a.diemCong ?? a.points, 0),
  description: a.moTa || 'Cam kết hành động xanh trong chuyến đi.'
});

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
