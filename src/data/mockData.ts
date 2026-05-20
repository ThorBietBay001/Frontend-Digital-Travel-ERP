export interface Tour {
  id: string;
  name: string;
  destination: string;
  duration: string;
  price: number;
  originalPrice?: number;
  image: string;
  availableSeats: number;
  totalSeats: number;
  departureDate: string;
  rating: number;
  reviews: number;
  description: string;
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  greenActions: GreenAction[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface GreenAction {
  id: string;
  title: string;
  points: number;
  description: string;
}

export interface Booking {
  id: string;
  tourId: string;
  tourName: string;
  tourImage: string;
  departureDate: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'refunding' | 'CHO_XAC_NHAN' | 'DA_XAC_NHAN' | 'CHO_HUY' | 'DA_HUY' | 'TU_CHOI_HOAN_TIEN' | 'HET_HAN_GIU_CHO' | 'THANH_TOAN_THAT_BAI';
  totalAmount: number;
  passengers: number;
  qrCode: string;
  bookingDate: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minPurchase: number;
  expiryDate: string;
  status: 'active' | 'used' | 'expired';
  description: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  idCard: string;
  passport: string;
  address: string;
  membershipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  greenPoints: number;
  healthInfo?: string;
  allergies?: string;
}

export const mockTours: Tour[] = [
  {
    id: '1',
    name: 'Hạ Long - Thiên đường biển đảo',
    destination: 'Hạ Long, Quảng Ninh',
    duration: '3 ngày 2 đêm',
    price: 4500000,
    originalPrice: 5500000,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxvbmclMjBiYXklMjB2aWV0bmFtJTIwc2NlbmljfGVufDF8fHx8MTc3OTA1MDM4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    availableSeats: 8,
    totalSeats: 20,
    departureDate: '2026-06-15',
    rating: 4.8,
    reviews: 128,
    description: 'Khám phá vẻ đẹp huyền ảo của Vịnh Hạ Long với hàng nghìn hòn đảo đá vôi nhấp nhô trên mặt nước biển xanh ngọc bích.',
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội - Hạ Long - Tham quan hang động',
        description: 'Khởi hành từ Hà Nội, đến Hạ Long check-in du thuyền',
        activities: ['Đón khách tại Hà Nội', 'Di chuyển đến Hạ Long', 'Check-in du thuyền 5 sao', 'Tham quan hang Sửng Sốt', 'Bữa tối hải sản trên du thuyền']
      },
      {
        day: 2,
        title: 'Khám phá làng chài & chèo kayak',
        description: 'Trải nghiệm cuộc sống làng chài và các hoạt động thể thao nước',
        activities: ['Thăm làng chài Cửa Vạn', 'Chèo kayak qua các hang động', 'Bơi lội tại khu vực an toàn', 'BBQ tối trên boong tàu', 'Câu mực đêm']
      },
      {
        day: 3,
        title: 'Tai Chi - Trở về Hà Nội',
        description: 'Buổi sáng tập Tai Chi và trở về Hà Nội',
        activities: ['Tập Tai Chi trên boong tàu', 'Ăn sáng buffet', 'Trả phòng và rời du thuyền', 'Mua sắm đặc sản Hạ Long', 'Về đến Hà Nội']
      }
    ],
    includes: [
      'Xe du lịch đời mới có máy lạnh',
      'Du thuyền 5 sao 2 đêm',
      'Các bữa ăn theo chương trình',
      'Hướng dẫn viên nhiệt tình',
      'Vé tham quan các điểm',
      'Bảo hiểm du lịch'
    ],
    excludes: [
      'Chi phí cá nhân',
      'Đồ uống có cồn',
      'Tips cho HDV và lái xe',
      'Thuế VAT'
    ],
    greenActions: [
      {
        id: 'ga1',
        title: 'Không sử dụng nhựa dùng một lần',
        points: 50,
        description: 'Cam kết mang theo bình nước cá nhân và từ chối đồ nhựa dùng một lần'
      },
      {
        id: 'ga2',
        title: 'Thu gom rác thải tại điểm đến',
        points: 100,
        description: 'Tham gia hoạt động dọn dẹp rác thải tại bãi biển'
      }
    ]
  },
  {
    id: '2',
    name: 'Sapa - Miền đất sương mù',
    destination: 'Sapa, Lào Cai',
    duration: '4 ngày 3 đêm',
    price: 5200000,
    originalPrice: 6200000,
    image: 'https://images.unsplash.com/photo-1609412058473-c199497c3c5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXBhJTIwdmlldG5hbSUyMG1vdW50YWlucyUyMHRlcnJhY2VzfGVufDF8fHx8MTc3OTA1MDM4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    availableSeats: 12,
    totalSeats: 25,
    departureDate: '2026-06-20',
    rating: 4.9,
    reviews: 95,
    description: 'Chinh phục đỉnh Fansipan - nóc nhà Đông Dương, thăm thú ruộng bậc thang và tìm hiểu văn hóa dân tộc thiểu số.',
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội - Sapa',
        description: 'Khởi hành đi Sapa, tham quan thị trấn',
        activities: ['Xuất phát từ Hà Nội', 'Đến Sapa check-in khách sạn', 'Tham quan nhà thờ đá Sapa', 'Khám phá chợ tình Sapa', 'Ăn tối buffet lẩu']
      },
      {
        day: 2,
        title: 'Chinh phục Fansipan',
        description: 'Leo núi Fansipan bằng cáp treo',
        activities: ['Đi cáp treo lên đỉnh Fansipan', 'Check-in tại nóc nhà Đông Dương', 'Thăm chùa Bà và cổng trời', 'Chiêm ngưỡng toàn cảnh Sapa', 'Về khách sạn nghỉ ngơi']
      },
      {
        day: 3,
        title: 'Trekking & Văn hóa bản làng',
        description: 'Trekking qua các bản làng dân tộc',
        activities: ['Trekking đến bản Cát Cát', 'Thăm thác nước Cát Cát', 'Tìm hiểu nghề dệt lanh của H\'Mông', 'Thăm bản Tả Van', 'Trải nghiệm homestay']
      },
      {
        day: 4,
        title: 'Ruộng bậc thang - Về Hà Nội',
        description: 'Ngắm ruộng bậc thang và trở về',
        activities: ['Thăm thung lũng Mường Hoa', 'Chụp ảnh ruộng bậc thang', 'Mua sắm đặc sản Sapa', 'Khởi hành về Hà Nội', 'Kết thúc chuyến đi']
      }
    ],
    includes: [
      'Xe limousine cao cấp',
      'Khách sạn 4 sao',
      'Vé cáp treo Fansipan khứ hồi',
      'Các bữa ăn đặc sản',
      'Hướng dẫn viên địa phương',
      'Bảo hiểm du lịch'
    ],
    excludes: [
      'Chi phí cá nhân',
      'Đồ uống có cồn',
      'Tips cho HDV',
      'Thuế VAT'
    ],
    greenActions: [
      {
        id: 'ga3',
        title: 'Sử dụng phương tiện di chuyển xanh',
        points: 80,
        description: 'Đi bộ hoặc thuê xe đạp thay vì xe máy khi tham quan'
      },
      {
        id: 'ga4',
        title: 'Ủng hộ sản phẩm địa phương',
        points: 60,
        description: 'Mua đặc sản và thủ công mỹ nghệ từ người dân địa phương'
      }
    ]
  },
  {
    id: '3',
    name: 'Hội An - Phố cổ lung linh',
    destination: 'Hội An, Quảng Nam',
    duration: '3 ngày 2 đêm',
    price: 3800000,
    originalPrice: 4500000,
    image: 'https://images.unsplash.com/photo-1562005094-c724030f99bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2klMjBhbiUyMGFuY2llbnQlMjB0b3duJTIwbGFudGVybnN8ZW58MXx8fHwxNzc5MDUwMzkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    availableSeats: 6,
    totalSeats: 15,
    departureDate: '2026-06-25',
    rating: 4.7,
    reviews: 156,
    description: 'Dạo bước trên những con phố cổ kính với hàng nghìn chiếc đèn lồng rực rỡ sắc màu, tìm hiểu lịch sử văn hóa Hội An.',
    itinerary: [
      {
        day: 1,
        title: 'Đà Nẵng - Hội An',
        description: 'Bay đến Đà Nẵng và khám phá Hội An',
        activities: ['Đón tại sân bay Đà Nẵng', 'Di chuyển đến Hội An', 'Check-in resort', 'Tham quan phố cổ Hội An', 'Thả đèn hoa đăng trên sông Hoài']
      },
      {
        day: 2,
        title: 'Làng nghề & Thánh địa Mỹ Sơn',
        description: 'Trải nghiệm làng nghề và di sản văn hóa',
        activities: ['Thăm làng gốm Thanh Hà', 'Trải nghiệm làm gốm', 'Tham quan thánh địa Mỹ Sơn', 'Tìm hiểu văn hóa Chăm', 'Nghỉ dưỡng tại resort']
      },
      {
        day: 3,
        title: 'Biển An Bàng - Về Đà Nẵng',
        description: 'Thư giãn tại biển và trở về',
        activities: ['Tắm biển An Bàng', 'Thưởng thức hải sản tươi sống', 'Mua sắm đặc sản Hội An', 'Ra sân bay Đà Nẵng', 'Kết thúc chuyến đi']
      }
    ],
    includes: [
      'Vé máy bay khứ hồi',
      'Resort 4 sao gần biển',
      'Xe đưa đón sân bay',
      'Các bữa ăn đặc sản',
      'Vé tham quan',
      'Bảo hiểm du lịch'
    ],
    excludes: [
      'Chi phí cá nhân',
      'Dịch vụ spa',
      'Tips cho HDV',
      'Thuế VAT'
    ],
    greenActions: [
      {
        id: 'ga5',
        title: 'Tham gia làm sạch bãi biển',
        points: 100,
        description: 'Dành 30 phút thu gom rác thải tại bãi biển An Bàng'
      },
      {
        id: 'ga6',
        title: 'Từ chối túi ni-lông',
        points: 40,
        description: 'Mang theo túi vải khi mua sắm tại chợ và cửa hàng'
      }
    ]
  },
  {
    id: '4',
    name: 'Đồng bằng sông Cửu Long',
    destination: 'Cần Thơ - Vĩnh Long',
    duration: '2 ngày 1 đêm',
    price: 2800000,
    image: 'https://images.unsplash.com/photo-1543411789-1a67a2ac05c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWtvbmclMjBkZWx0YSUyMHZpZXRuYW0lMjBib2F0fGVufDF8fHx8MTc3OTA1MDM5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    availableSeats: 10,
    totalSeats: 20,
    departureDate: '2026-07-01',
    rating: 4.6,
    reviews: 87,
    description: 'Trải nghiệm cuộc sống miệt vườn Nam Bộ với chợ nổi Cái Răng, vườn trái cây và ẩm thực đặc sắc.',
    itinerary: [
      {
        day: 1,
        title: 'TP.HCM - Cần Thơ',
        description: 'Khởi hành đến miền Tây sông nước',
        activities: ['Xuất phát từ TP.HCM', 'Thăm chùa Vĩnh Tràng', 'Tham quan vườn trái cây', 'Đến Cần Thơ check-in khách sạn', 'Dạo chơi bến Ninh Kiều']
      },
      {
        day: 2,
        title: 'Chợ nổi - Về TP.HCM',
        description: 'Khám phá chợ nổi và trở về',
        activities: ['Thăm chợ nổi Cái Răng', 'Ăn sáng trên thuyền', 'Thăm làng nghề bánh tráng', 'Mua đặc sản miền Tây', 'Về đến TP.HCM']
      }
    ],
    includes: [
      'Xe du lịch đời mới',
      'Khách sạn 3 sao',
      'Thuyền tham quan chợ nổi',
      'Các bữa ăn miền Tây',
      'Hướng dẫn viên',
      'Bảo hiểm du lịch'
    ],
    excludes: [
      'Chi phí cá nhân',
      'Đồ uống có cồn',
      'Tips',
      'Thuế VAT'
    ],
    greenActions: [
      {
        id: 'ga7',
        title: 'Bảo vệ hệ sinh thái sông nước',
        points: 70,
        description: 'Không vứt rác xuống sông và kênh rạch'
      }
    ]
  },
  {
    id: '5',
    name: 'Phú Quốc - Đảo ngọc thiên đường',
    destination: 'Phú Quốc, Kiên Giang',
    duration: '4 ngày 3 đêm',
    price: 7500000,
    originalPrice: 8900000,
    image: 'https://images.unsplash.com/photo-1514890084135-f16d926f4d03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaHUlMjBxdW9jJTIwaXNsYW5kJTIwYmVhY2glMjBzdW5zZXR8ZW58MXx8fHwxNzc5MDUwMzkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    availableSeats: 5,
    totalSeats: 18,
    departureDate: '2026-07-10',
    rating: 4.9,
    reviews: 203,
    description: 'Nghỉ dưỡng tại đảo ngọc với bãi biển xanh trong, trải nghiệm lặn ngắm san hô và thưởng thức hải sản tươi sống.',
    itinerary: [
      {
        day: 1,
        title: 'TP.HCM - Phú Quốc',
        description: 'Bay đến đảo ngọc',
        activities: ['Bay đến Phú Quốc', 'Check-in resort 5 sao', 'Tự do tắm biển', 'BBQ hải sản tối', 'Nghỉ ngơi']
      },
      {
        day: 2,
        title: 'Tour 4 đảo - Lặn ngắm san hô',
        description: 'Khám phá các đảo nhỏ xung quanh',
        activities: ['Tour 4 đảo bằng canô', 'Lặn ngắm san hô', 'Câu cá', 'Bữa trưa trên đảo', 'Ngắm hoàng hôn biển']
      },
      {
        day: 3,
        title: 'VinWonders & Safari',
        description: 'Vui chơi tại công viên giải trí',
        activities: ['Tham quan VinWonders', 'Thăm Vinpearl Safari', 'Trải nghiệm trò chơi', 'Xem show biểu diễn', 'Mua sắm đặc sản']
      },
      {
        day: 4,
        title: 'Chợ đêm - Về TP.HCM',
        description: 'Mua sắm và trở về',
        activities: ['Tham quan chợ đêm Phú Quốc', 'Mua ngọc trai và nước mắm', 'Ra sân bay', 'Bay về TP.HCM', 'Kết thúc chuyến đi']
      }
    ],
    includes: [
      'Vé máy bay khứ hồi',
      'Resort 5 sao all-inclusive',
      'Tour 4 đảo',
      'Vé VinWonders & Safari',
      'Tất cả bữa ăn',
      'Bảo hiểm du lịch'
    ],
    excludes: [
      'Chi phí cá nhân',
      'Dịch vụ spa cao cấp',
      'Tips',
      'Thuế VAT'
    ],
    greenActions: [
      {
        id: 'ga8',
        title: 'Bảo vệ rạn san hô',
        points: 120,
        description: 'Không chạm vào và phá hoại san hô khi lặn biển'
      },
      {
        id: 'ga9',
        title: 'Giảm rác thải nhựa',
        points: 50,
        description: 'Không sử dụng ống hút nhựa và đồ nhựa dùng một lần'
      }
    ]
  },
  {
    id: '6',
    name: 'Nha Trang - Biển xanh cát trắng',
    destination: 'Nha Trang, Khánh Hòa',
    duration: '3 ngày 2 đêm',
    price: 4200000,
    image: 'https://images.unsplash.com/photo-1732243395944-cb3ff9311091?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtJTIwdHJhdmVsJTIwZGVzdGluYXRpb24lMjBiZWFjaHxlbnwxfHx8fDE3NzkwNTAzODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    availableSeats: 15,
    totalSeats: 30,
    departureDate: '2026-07-05',
    rating: 4.5,
    reviews: 142,
    description: 'Tận hưởng kỳ nghỉ tại thành phố biển xinh đẹp với bãi tắm dài, hải sản phong phú và nhiều hoạt động thể thao nước.',
    itinerary: [
      {
        day: 1,
        title: 'TP.HCM - Nha Trang',
        description: 'Bay đến Nha Trang',
        activities: ['Bay đến Nha Trang', 'Check-in khách sạn', 'Tắm biển tự do', 'Dạo phố biển', 'Ăn tối hải sản']
      },
      {
        day: 2,
        title: 'Tour 3 đảo',
        description: 'Khám phá các đảo',
        activities: ['Tour tham quan 3 đảo', 'Thăm thủy cung Trí Nguyên', 'Lặn ngắm san hô', 'Trò chơi dù bay', 'Tiệc tối trên du thuyền']
      },
      {
        day: 3,
        title: 'Vinpearl Land - Về TP.HCM',
        description: 'Vui chơi và trở về',
        activities: ['Vinpearl Land & Aquarium', 'Trải nghiệm cáp treo', 'Mua sắm tại Lotte Mart', 'Ra sân bay', 'Bay về TP.HCM']
      }
    ],
    includes: [
      'Vé máy bay khứ hồi',
      'Khách sạn 4 sao',
      'Tour 3 đảo',
      'Vé Vinpearl Land',
      'Các bữa ăn chính',
      'Bảo hiểm'
    ],
    excludes: [
      'Chi phí cá nhân',
      'Đồ uống',
      'Tips',
      'Thuế VAT'
    ],
    greenActions: [
      {
        id: 'ga10',
        title: 'Tham gia dọn rác biển',
        points: 90,
        description: 'Tham gia chiến dịch làm sạch bãi biển'
      }
    ]
  }
];

export const mockUserProfile: UserProfile = {
  id: 'user-001',
  fullName: 'Nguyễn Văn An',
  email: 'nguyenvanan@example.com',
  phone: '0912345678',
  dateOfBirth: '1990-05-15',
  gender: 'Nam',
  idCard: '001090012345',
  passport: 'C1234567',
  address: '123 Đường Lê Lợi, Quận 1, TP. HCM',
  membershipTier: 'Gold',
  greenPoints: 1250,
  healthInfo: 'Khỏe mạnh',
  allergies: 'Không có'
};

export const mockBookings: Booking[] = [
  {
    id: 'book-001',
    tourId: '1',
    tourName: 'Hạ Long - Thiên đường biển đảo',
    tourImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxvbmclMjBiYXklMjB2aWV0bmFtJTIwc2NlbmljfGVufDF8fHx8MTc3OTA1MDM4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    departureDate: '2026-06-15',
    status: 'upcoming',
    totalAmount: 4500000,
    passengers: 2,
    qrCode: 'QR-HALONG-001',
    bookingDate: '2026-05-10'
  },
  {
    id: 'book-002',
    tourId: '2',
    tourName: 'Sapa - Miền đất sương mù',
    tourImage: 'https://images.unsplash.com/photo-1609412058473-c199497c3c5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXBhJTIwdmlldG5hbSUyMG1vdW50YWlucyUyMHRlcnJhY2VzfGVufDF8fHx8MTc3OTA1MDM4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    departureDate: '2026-03-20',
    status: 'completed',
    totalAmount: 5200000,
    passengers: 1,
    qrCode: 'QR-SAPA-002',
    bookingDate: '2026-02-15'
  },
  {
    id: 'book-003',
    tourId: '3',
    tourName: 'Hội An - Phố cổ lung linh',
    tourImage: 'https://images.unsplash.com/photo-1562005094-c724030f99bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2klMjBhbiUyMGFuY2llbnQlMjB0b3duJTIwbGFudGVybnN8ZW58MXx8fHwxNzc5MDUwMzkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    departureDate: '2026-04-10',
    status: 'cancelled',
    totalAmount: 3800000,
    passengers: 2,
    qrCode: 'QR-HOIAN-003',
    bookingDate: '2026-03-05'
  }
];

export const mockVouchers: Voucher[] = [
  {
    id: 'voucher-001',
    code: 'SUMMER2026',
    title: 'Giảm giá mùa hè',
    discount: 15,
    discountType: 'percentage',
    minPurchase: 3000000,
    expiryDate: '2026-08-31',
    status: 'active',
    description: 'Giảm 15% cho đơn hàng từ 3 triệu đồng'
  },
  {
    id: 'voucher-002',
    code: 'GREEN500',
    title: 'Ưu đãi xanh',
    discount: 500000,
    discountType: 'fixed',
    minPurchase: 5000000,
    expiryDate: '2026-12-31',
    status: 'active',
    description: 'Giảm 500k cho tour từ 5 triệu đồng'
  },
  {
    id: 'voucher-003',
    code: 'HALONG20',
    title: 'Đặc biệt Hạ Long',
    discount: 20,
    discountType: 'percentage',
    minPurchase: 4000000,
    expiryDate: '2026-06-30',
    status: 'used',
    description: 'Giảm 20% cho tour Hạ Long'
  }
];

export const availableVouchers: Omit<Voucher, 'status'>[] = [
  {
    id: 'store-001',
    code: 'NEW300',
    title: 'Khách hàng mới',
    discount: 300000,
    discountType: 'fixed',
    minPurchase: 2000000,
    expiryDate: '2026-12-31',
    description: 'Giảm 300k cho khách hàng mới - Đổi 200 điểm'
  },
  {
    id: 'store-002',
    code: 'VIP25',
    title: 'VIP đặc biệt',
    discount: 25,
    discountType: 'percentage',
    minPurchase: 10000000,
    expiryDate: '2026-12-31',
    description: 'Giảm 25% cho tour cao cấp - Đổi 500 điểm'
  },
  {
    id: 'store-003',
    code: 'FAMILY10',
    title: 'Ưu đãi gia đình',
    discount: 10,
    discountType: 'percentage',
    minPurchase: 5000000,
    expiryDate: '2026-09-30',
    description: 'Giảm 10% cho nhóm từ 4 người - Đổi 300 điểm'
  }
];
