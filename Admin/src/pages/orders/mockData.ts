// --- AUTO GENERATED FROM OPENAPI ---

export interface ApiResponseDonDatTourResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: DonDatTourResponse;
  error?: string;
}

export interface ApiResponsePageDonDatTourResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageDonDatTourResponse;
  error?: string;
}

export interface DonDatTourResponse {
  maDatTour?: string;
  maTourThucTe?: string;
  tieuDeTour?: string;
  ngayKhoiHanh?: string;
  giaHienHanh?: number;
  thoiLuong?: number;
  maKhachHang?: string;
  tenKhachHang?: string;
  ngayDat?: string;
  tongTien?: number;
  tongTienGoc?: number;
  soTienUuDai?: number;
  maVoucher?: string;
  maCodeVoucher?: string;
  tenVoucher?: string;
  giaTriVoucher?: number;
  soTienGiam?: number;
  tienGiam?: number;
  soNguoiLon?: number;
  soTreEm?: number;
  soLuongVeTreEm?: number;
  tienVeTreEm?: number;
  diemXanh?: number;
  soDiemXanh?: number;
  diemXanhDuKien?: number;
  ghiChuDiemXanh?: string;
  trangThai?: string;
  maGiaoDich?: string;
  phuongThuc?: string;
  daBaoChuyenKhoan?: boolean;
  thoiGianHetHan?: string;
  ghiChu?: string;
  thoiDiemTao?: string;
  capNhatVao?: string;
  chiTietKhach?: ChiTietDatTourResponse[];
  chiTietDichVu?: ChiTietDichVuResponse[];
}

export interface PageDonDatTourResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: DonDatTourResponse[];
  number?: number;
  numberOfElements?: number;
  pageable?: PageableObject;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface ChiTietDatTourResponse {
  maChiTietDat?: string;
  maKhachHang?: string;
  hoTen?: string;
  soDienThoai?: string;
  cccd?: string;
  soGiayTo?: string;
  loaiKhach?: string;
  loaiKhachHang?: string;
  loaiVe?: string;
  ngaySinh?: string;
  doTuoi?: number;
  tuoi?: number;
  age?: number;
  nhomTuoi?: string;
  doiTuong?: string;
  doiTuongKhach?: string;
  phanLoai?: string;
  laTreEm?: boolean;
  isTreEm?: boolean;
  isChild?: boolean;
  treEm?: boolean;
  maLoaiPhong?: string;
  tenLoaiPhong?: string;
  mucPhuThu?: number;
  giaTaiThoiDiemDat?: number;
  giaVeTreEm?: number;
}

export interface ChiTietDichVuResponse {
  maChiTietDichVu?: string;
  maDichVuThem?: string;
  tenDichVu?: string;
  donViTinh?: string;
  soLuong?: number;
  donGia?: number;
  thanhTien?: number;
}

export interface PageableObject {
  offset?: number;
  pageNumber?: number;
  pageSize?: number;
  paged?: boolean;
  sort?: SortObject;
  unpaged?: boolean;
}

export interface SortObject {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
}

// --- END AUTO GENERATED ---
export interface Passenger {
  name: string;
  ageGroup: 'Người lớn' | 'Trẻ em' | 'Em bé';
  gender: 'Nam' | 'Nữ';
  customerCode?: string;
  phone?: string;
  identityNumber?: string;
  roomType?: string;
  surcharge?: number;
  price?: number;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  email?: string;
  tourName: string;
  departureDate: string;
  bookingDate: string;
  totalAmount: number;
  originalAmount?: number;
  voucherCode?: string;
  voucherName?: string;
  voucherDiscount?: number;
  childTicketCount?: number;
  childTicketAmount?: number;
  greenPoints?: number;
  greenNote?: string;
  additionalServices?: string[];
  additionalServicesAmount?: number;
  adultCount?: number;
  transactionCode?: string;
  paymentMethod?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'failed' | 'refunded';
  passengerCount: number;
  passengers?: Passenger[];
  isExpired?: boolean;
}

export const mockOrders: Order[] = [
  {
    id: '1',
    orderCode: 'DH-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    email: 'nguyenvana@example.com',
    tourName: 'Khám phá Vịnh Hạ Long',
    departureDate: '20/05/2025',
    bookingDate: '10/05/2025',
    totalAmount: 5000000,
    status: 'confirmed',
    paymentStatus: 'paid',
    passengerCount: 2,
    passengers: [
      { name: 'Nguyễn Văn A', ageGroup: 'Người lớn', gender: 'Nam' },
      { name: 'Trần Thị M', ageGroup: 'Người lớn', gender: 'Nữ' }
    ]
  },
  {
    id: '2',
    orderCode: 'DH-002',
    customerName: 'Trần Thị B',
    customerPhone: '0987654321',
    email: 'tranthib@example.com',
    tourName: 'Hà Giang - Mùa Hoa Tam Giác Mạch',
    departureDate: '15/05/2025',
    bookingDate: '01/05/2025',
    totalAmount: 15200000,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    passengerCount: 4,
    passengers: [
      { name: 'Trần Thị B', ageGroup: 'Người lớn', gender: 'Nữ' },
      { name: 'Phạm Văn C', ageGroup: 'Người lớn', gender: 'Nam' },
      { name: 'Phạm Thị D', ageGroup: 'Trẻ em', gender: 'Nữ' },
      { name: 'Phạm Văn E', ageGroup: 'Em bé', gender: 'Nam' }
    ]
  },
  {
    id: '3',
    orderCode: 'DH-003',
    customerName: 'Lê Văn C',
    customerPhone: '0912345678',
    tourName: 'Tour Ẩm thực Huế',
    departureDate: '10/05/2025',
    bookingDate: '25/04/2025',
    totalAmount: 1200000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    passengerCount: 2,
    passengers: [
      { name: 'Lê Văn C', ageGroup: 'Người lớn', gender: 'Nam' },
      { name: 'Hoàng Thị Y', ageGroup: 'Người lớn', gender: 'Nữ' }
    ]
  },
  {
    id: '4',
    orderCode: 'DH-004',
    customerName: 'Phạm Thị D',
    customerPhone: '0933333333',
    email: 'phamthid@example.com',
    tourName: 'Côn Đảo - Bảo Tồn Rùa Biển',
    departureDate: '01/06/2025',
    bookingDate: '15/05/2025',
    totalAmount: 13000000,
    status: 'pending',
    paymentStatus: 'unpaid',
    passengerCount: 2,
    passengers: [
      { name: 'Phạm Thị D', ageGroup: 'Người lớn', gender: 'Nữ' },
      { name: 'Hoàng Văn F', ageGroup: 'Người lớn', gender: 'Nam' }
    ]
  }
];
