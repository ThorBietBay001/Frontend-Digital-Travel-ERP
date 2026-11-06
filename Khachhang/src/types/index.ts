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
  endDate: string;
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
  status: 'CHO_XAC_NHAN' | 'DA_XAC_NHAN' | 'CHO_HUY' | 'CHO_HOAN_TIEN' | 'DA_HUY' | 'TU_CHOI_HOAN_TIEN' | 'HET_HAN_GIU_CHO' | 'THANH_TOAN_THAT_BAI' | 'KET_THUC' | 'DA_QUYET_TOAN';
  guests: number;
  bookingCode: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentTransactionId?: string;
  paymentAmount?: number;
  paymentPaidAt?: string;
  hasConfirmedTransfer?: boolean;
  originalAmount?: number;
  discountAmount?: number;
  voucherId?: string;
  voucherCode?: string;
  expectedGreenPoints?: number;
  tourImage?: string;
  passengers?: number;
  note?: string;
  adultCount?: number;
  childCount?: number;
  customerName?: string;
  details?: any[];
  services?: any[];
  guideName?: string;
  guidePhone?: string;
  guideRating?: number;
  guideReviewCount?: number;
  hasReviewed?: boolean;
  hasComplaint?: boolean;
  complaintStatus?: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  discount: number;
  discountType: 'percent' | 'fixed';
  maxDiscount?: number;
  requiredGreenPoints: number;
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
