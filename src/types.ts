// --- CORE TYPE DEFINITIONS ---

export interface Tour {
  code: string;
  name: string;
  departureDate: string;
  destination: string;
  guestsCount: number;
  status: 'Sắp khởi hành' | 'Đang diễn ra' | 'Kết thúc' | 'Đã quyết toán';
  image: string;
  endDateIso?: string;
}

export interface Passenger {
  code: string;
  maKhachHang?: string;
  maNguoiDongHanh?: string;
  loaiKhach?: 'NGUOI_DAT' | 'NGUOI_DONG_HANH';
  name: string;
  phone: string;
  rank: 'KIM_CUONG' | 'VANG' | 'BAC' | 'DONG' | 'THANH_VIEN';
  healthNotes: string;
  bookingNotes?: string;
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
  category: string;
  amount: number;
  status: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI';
  notes: string;
  date: string;
  photoUrl?: string;
}

export interface BaoCaoSuCo {
  id: string;
  type: string;
  severity: 'Thấp' | 'Cao';
  passengerName?: string;
  passengerCode?: string;
  description: string;
  treatment: string;
  result: string;
  time: string;
}
