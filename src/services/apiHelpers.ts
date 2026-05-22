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

const formatDuration = (days?: number | string): string => {
  const value = toNumber(days, 0);
  return value > 0 ? `${value} ngày` : 'Đang cập nhật';
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

  return {
    id,
    code: id,
    title,
    name: title,
    duration: formatDuration(item.thoiLuong),
    location: destination,
    destination,
    price,
    originalPrice: undefined,
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
  address: '',
  membershipTier: p?.hangThanhVien || 'THANH_VIEN',
  greenPoints: toNumber(p?.diemXanh, 0),
  dateOfBirth: p?.ngaySinh || '',
  idCard: p?.cccd || '',
  passport: '',
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
    status: b.trangThai || 'completed',
    guests: Array.isArray(b.chiTietKhach) ? b.chiTietKhach.length : 1,
    passengers: Array.isArray(b.chiTietKhach) ? b.chiTietKhach.length : 1,
    qrCode: id,
    tourImage: b.hinhAnh || b.image || tourImage(tourId)
  };
};

export const mapVoucher = (v: ApiRecord): Voucher => ({
  id: v.maVoucher || v.id || '',
  code: v.maCode || v.maVoucher || v.code || '',
  title: v.tenVoucher || (v.loaiUuDai === 'PHAN_TRAM' ? 'Ưu đãi phần trăm' : 'Ưu đãi tiền mặt'),
  discount: toNumber(v.giaTriGiam ?? v.discount, 0),
  discountType: v.loaiUuDai === 'PHAN_TRAM' ? 'percent' : 'fixed',
  minPurchase: 0,
  expiryDate: v.ngayHetHan || '',
  status: v.trangThai === 'CO_HIEU_LUC' || v.trangThai === 'SAN_SANG' ? 'active' : v.trangThai === 'HET_HAN' ? 'expired' : 'used',
  description: v.dieuKienApDung || 'Voucher ưu đãi từ Digital Travel'
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
