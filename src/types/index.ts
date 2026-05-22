export interface Tour {
  id: string;
  code: string;
  title: string;
  name: string;
  duration: string;
  location: string;
  destination: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  startDate: string;
  departureDate: string;
  availableSeats: number;
  totalSeats: number;
  description: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: any[];
  includes: string[];
  excludes: string[];
  greenActions: GreenAction[];
}

export interface Booking {
  id: string;
  tourId: string;
  tourName: string;
  bookingDate: string;
  departureDate: string;
  totalAmount: number;
  status: 'CHO_XAC_NHAN' | 'DA_XAC_NHAN' | 'CHO_HUY' | 'DA_HUY' | 'upcoming' | 'completed' | 'cancelled' | 'TU_CHOI_HOAN_TIEN' | 'HET_HAN_GIU_CHO' | 'THANH_TOAN_THAT_BAI' | 'DA_HOAN_THANH';
  guests: number;
  qrCode: string;
  paymentMethod?: string;
  tourImage?: string;
  passengers?: number;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  discount: number;
  discountType: 'percent' | 'fixed';
  minPurchase: number;
  expiryDate: string;
  status: 'active' | 'used' | 'expired';
  description: string;
}

export interface GreenAction {
  id: string;
  title: string;
  points: number;
  description: string;
  icon?: any;
}
