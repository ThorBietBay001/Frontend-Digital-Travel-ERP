import type { Tour, Passenger, ItineraryDay, Expense, BaoCaoSuCo } from './types';

export const initialPassengers: Passenger[] = [
  {
    code: 'KH001',
    name: 'Nguyễn Văn Hùng',
    phone: '0901234567',
    rank: 'KIM_CUONG',
    healthNotes: 'Tiền sử cao huyết áp, cần hạn chế hoạt động mạnh dưới nắng gắt trưa.',
    status: 'CHUA_DIEM_DANH',
    greenPoints: 1250
  },
  {
    code: 'KH002',
    name: 'Lê Thị Mai',
    phone: '0918765432',
    rank: 'VANG',
    healthNotes: 'Dị ứng rất nặng hải sản vỏ cứng (tôm, cua). Cần chuẩn bị suất ăn gà/thịt riêng.',
    status: 'CHUA_DIEM_DANH',
    greenPoints: 950
  },
  {
    code: 'KH003',
    name: 'Trần Tuấn Anh',
    phone: '0987654321',
    rank: 'BAC',
    healthNotes: '',
    status: 'CHUA_DIEM_DANH',
    greenPoints: 420
  },
  {
    code: 'KH004',
    name: 'Phạm Minh Trí',
    phone: '0934567890',
    rank: 'THANH_VIEN',
    healthNotes: 'Say tàu xe, cano rất nặng. Cần bố trí ngồi ghế trước đầu xe.',
    status: 'CHUA_DIEM_DANH',
    greenPoints: 100
  },
  {
    code: 'KH005',
    name: 'Vũ Hoàng Yến',
    phone: '0945678901',
    rank: 'DONG',
    healthNotes: '',
    status: 'CHUA_DIEM_DANH',
    greenPoints: 280
  },
  {
    code: 'KH006',
    name: 'Đỗ Gia Bảo',
    phone: '0956789012',
    rank: 'THANH_VIEN',
    healthNotes: 'Trẻ em (5 tuổi), đi cùng bố mẹ. Cần lưu ý phao cứu sinh vừa cỡ khi đi cano.',
    status: 'CHUA_DIEM_DANH',
    greenPoints: 60
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'EXP001',
    category: 'Ăn uống',
    amount: 1800000,
    status: 'DA_DUYET',
    notes: 'Hóa đơn ăn trưa Ngày 1 tại Nhà hàng Biên Hải Quán',
    date: '18/05/2026'
  },
  {
    id: 'EXP002',
    category: 'Vé tham quan',
    amount: 4500000,
    status: 'DA_DUYET',
    notes: 'Vé cano tham quan 4 đảo Phú Quốc Explorer',
    date: '19/05/2026'
  },
  {
    id: 'EXP003',
    category: 'Xăng xe',
    amount: 350000,
    status: 'CHO_DUYET',
    notes: 'Mua xăng bổ sung cho cano phát sinh tại cảng An Thới',
    date: '19/05/2026'
  }
];

export const initialIncidents: BaoCaoSuCo[] = [
  {
    id: 'INC001',
    type: 'Khác',
    severity: 'Thấp',
    description: 'Khách hàng Phạm Minh Trí say sóng nhẹ khi đi cano chặng 1.',
    treatment: 'Bố trí ngồi nghỉ khu vực thoáng, uống nước gừng ấm và cung cấp túi bóng sơ cua.',
    result: 'Khách đã hồi phục sau 15 phút, tiếp tục tham quan đảo thứ 2 bình thường.',
    time: '19/05/2026 09:45'
  }
];

export const initialNotifications = [
  { id: 1, text: 'Điều hành vừa điều động bạn dẫn tour DN002 ngày 22/05.', time: '10 phút trước', read: false },
  { id: 2, text: 'Kế toán đã duyệt chi phí EXP001 của đoàn Phú Quốc.', time: '2 giờ trước', read: true }
];

export const activeTour: Tour = {
  code: 'PQ001',
  name: 'Khám phá Đảo Ngọc Phú Quốc 3N2Đ',
  departureDate: '18/05/2026',
  destination: 'Phú Quốc',
  guestsCount: 6,
  status: 'Đang diễn ra',
  image: 'phu-quoc-hero'
};

export const upcomingTours: Tour[] = [
  {
    code: 'DN002',
    name: 'Đà Nẵng - Hội An - Bà Nà Hills 4N3Đ',
    departureDate: '22/05/2026',
    destination: 'Đà Nẵng',
    guestsCount: 15,
    status: 'Sắp khởi hành',
    image: 'da-nang-hero'
  },
  {
    code: 'HL003',
    name: 'Du thuyền Hạ Long Đẳng Cấp 5 Sao',
    departureDate: '26/05/2026',
    destination: 'Hạ Long',
    guestsCount: 20,
    status: 'Sắp khởi hành',
    image: 'ha-long-hero'
  }
];

export const upcomingItineraries: Record<string, { day: number; activity: string }[]> = {
  'DN002': [
    { day: 1, activity: 'Đón đoàn tại Sân bay Đà Nẵng, check-in resort biển Mỹ Khê nghỉ ngơi. Tối tự do tham quan Cầu Rồng phun lửa, Cầu Tình Yêu.' },
    { day: 2, activity: 'Chinh phục Sun World Bà Nà Hills, check-in Cầu Vàng nổi tiếng, vui chơi giải trí trong Fantasy Park.' },
    { day: 3, activity: 'Tham quan danh thắng Ngũ Hành Sơn, Làng đá Non Nước. Chiều dạo Phố cổ Hội An lung linh đèn lồng, ăn tối Cao Lầu sông Hoài.' },
    { day: 4, activity: 'Mua sắm đặc sản chả bò tại Chợ Hàn, xe đưa tiễn đoàn ra Sân bay Đà Nẵng. Kết thúc hành trình.' }
  ],
  'HL003': [
    { day: 1, activity: 'Đón khách tại Cảng tàu quốc tế Tuần Châu. Nhận phòng du thuyền 5 sao, ăn trưa hải sản. Chèo thuyền kayak khám phá Hang Luồn.' },
    { day: 2, activity: 'Tham quan Hang Sửng Sốt - hang động kỳ vĩ nhất Vịnh. Chinh phục đảo Ti Tốp ngắm toàn cảnh Vịnh Hạ Long. Tối Sunset Party trên boong.' },
    { day: 3, activity: 'Tập Taichi đón bình minh. Tham quan cơ sở ngọc trai biển lớn nhất Vịnh. Ăn trưa nhẹ và làm thủ tục về bến Tuần Châu tiễn khách.' }
  ],
  'NT001': [
    { day: 1, activity: 'Đón khách tại sân bay Cam Ranh. Ăn bún chả cá sứa đặc sản Nha Trang. Nhận phòng resort trên đảo Hòn Tre.' },
    { day: 2, activity: 'Thỏa thích vui chơi giải trí tại VinWonders Nha Trang. Tối thưởng thức Tata Show - siêu phẩm thực cảnh đỉnh cao thế giới.' },
    { day: 3, activity: 'Đi cano cao tốc tham quan Vịnh Nha Trang. Tắm biển Bãi Tranh cát mịn, lặn ngắm san hô nhiều sắc màu tại Hòn Mun.' },
    { day: 4, activity: 'Trải nghiệm tắm bùn khoáng nóng Tháp Bà phục hồi sức khỏe. Mua sắm tại Chợ Đầm và xe đưa ra sân bay kết thúc tour.' }
  ],
  'PQ000': [
    { day: 1, activity: 'Tham quan Di tích Nhà tù Phú Quốc, Viếng Chùa Hộ Quốc linh thiêng. Chiều tắm biển bãi cát trắng Bãi Sao. Ăn tối gỏi cá trích.' },
    { day: 2, activity: 'Tham quan nhà ga An Thới phong cách La Mã cổ đại. Ghé cơ sở ngọc trai Ngọc Hiền và xe tiễn đoàn ra Sân bay Phú Quốc.' }
  ]
};

export const itinerary: ItineraryDay[] = [
  {
    day: 1,
    date: '18/05/2026',
    schedule: [
      { time: '08:00', activity: 'Đón đoàn tại Sân bay Phú Quốc, xe đưa về khách sạn Grand World nghỉ ngơi.' },
      { time: '11:30', activity: 'Ăn trưa tại nhà hàng Biên Hải Quán.', notes: 'Thực đơn: Canh chua cá bớp, cá kho tộ, rau luộc kho quẹt.' },
      { time: '14:00', activity: 'Tham quan Grand World - "Thành phố không ngủ", đi thuyền trên sông Venice.' },
      { time: '18:30', activity: 'Ăn tối buffet tại khách sạn, tự do dạo chợ đêm Dương Đông.' }
    ],
    menu: {
      lunch: 'Canh chua cá bớp, cá kho tộ, rau luộc kho quẹt, cơm niêu.',
      dinner: 'Buffet Á-Âu tại Khách sạn Grand World.'
    }
  },
  {
    day: 2,
    date: '19/05/2026',
    schedule: [
      { time: '07:30', activity: 'Buffet sáng tại khách sạn, sẵn sàng trang phục biển.' },
      { time: '08:30', activity: 'Xuất phát đi Cảng An Thới, lên cano tham quan 4 đảo (Hòn Móng Tay, Mây Rút, Gầm Ghì, Hòn Thơm).' },
      { time: '12:00', activity: 'Ăn trưa hải sản trên đảo.', notes: 'Tôm nướng, cá sòng nướng, lẩu hải sản. Đặc biệt chuẩn bị suất gà sả ớt riêng cho chị Lê Thị Mai do dị ứng hải sản.' },
      { time: '14:30', activity: 'Trải nghiệm cáp treo vượt biển Hòn Thơm dài nhất thế giới.' },
      { time: '18:00', activity: 'Trở về đất liền, ăn tối tại nhà hàng Trùng Dương Marina.' }
    ],
    menu: {
      lunch: 'Tôm mũ ni nướng, mực hấp gừng, lẩu cá bớp (Suất gà riêng cho chị Mai).',
      dinner: 'Hải sản nướng, cơm chiên ghẹ, gỏi cá trích tại Trùng Dương Marina.'
    }
  },
  {
    day: 3,
    date: '20/05/2026',
    schedule: [
      { time: '08:00', activity: 'Buffet sáng, tự do tắm biển và mua quà lưu niệm.' },
      { time: '09:30', activity: 'Tham quan Di tích Nhà tù Phú Quốc và Cơ sở sản xuất nước mắm Khải Hoàn.' },
      { time: '12:00', activity: 'Trả phòng khách sạn, ăn trưa nhẹ bún quậy Thanh Hùng.' },
      { time: '14:30', activity: 'Xe đưa đoàn ra Sân bay Phú Quốc, làm thủ tục bay. Kết thúc hành trình.' }
    ],
    menu: {
      lunch: 'Đặc sản Bún Quậy Thanh Hùng Phú Quốc.',
      dinner: 'Không có (Ăn nhẹ trên sân bay tự túc).'
    }
  }
];

export const greenActionsList = [
  { id: 'ACT01', name: 'Sử dụng bình nước cá nhân (Không chai nhựa)', points: 50, icon: '🥤' },
  { id: 'ACT02', name: 'Sử dụng túi vải bảo vệ môi trường', points: 50, icon: '🛍️' },
  { id: 'ACT03', name: 'Nhặt rác tại bãi biển / điểm tham quan', points: 150, icon: '🧹' },
  { id: 'ACT04', name: 'Phân loại rác tại nguồn đúng quy định', points: 100, icon: '🚯' },
  { id: 'ACT05', name: 'Đi bộ hoặc di chuyển bằng xe điện', points: 80, icon: '🚌' }
];
