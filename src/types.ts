// --- CORE TYPE DEFINITIONS ---

export interface Tour {
  code: string;
  maPhanCong?: string;
  trangThaiChapNhan?: 'CHO_PHAN_HOI' | 'DA_DONG_Y' | 'TU_CHOI';
  name: string;
  departureDate: string;
  startDate?: string;
  endDate?: string;
  destination: string;
  guestsCount: number;
  status: 'Chờ kích hoạt' | 'Mở bán' | 'Sắp khởi hành' | 'Đang diễn ra' | 'Kết thúc' | 'Đã quyết toán';
  image?: string;
  passengers?: Passenger[];
  itinerary?: TourItinerarySummary[];
  durationDays?: number;
  maxGuests?: number;
  availableSeats?: number;
  currentPrice?: number;
  services?: string[];
  greenActions?: string[];
}

export interface TourItinerarySummary {
  day: number;
  title: string;
  description?: string;
  menu?: string;
  activities?: ItineraryItem[];
}

export interface Passenger {
  code: string;
  listKey?: string;
  maKhachHang?: string;
  maNguoiDongHanh?: string;
  loaiKhach?: 'NGUOI_DAT' | 'NGUOI_DONG_HANH';
  name: string;
  phone: string;
  rank: 'KIM_CUONG' | 'VANG' | 'BAC' | 'DONG' | 'THANH_VIEN';
  healthNotes: string;
  status: 'CHUA_DIEM_DANH' | 'DA_DIEM_DANH' | 'VANG';
  absentReason?: string;
  greenPoints: number;
}

export interface ItineraryItem {
  time: string;
  activity: string;
  notes?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  schedule: ItineraryItem[];
  menu: { lunch: string; dinner: string };
}

export interface Expense {
  id: string;
  tourCode?: string;
  category: string;
  amount: number;
  status: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI';
  notes: string;
  date: string;
  photoUrl?: string;
}

export interface BaoCaoSuCo {
  id: string;
  tourCode?: string;
  type: string;
  severity: 'Thấp' | 'Cao';
  passengerName?: string;
  passengerCode?: string;
  healthNotes?: string;
  description: string;
  treatment: string;
  result: string;
  time: string;
}
