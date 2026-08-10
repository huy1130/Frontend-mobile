import {
  HeroStats,
  ProcessStep,
  Feature,
  ServiceItem,
  ComboPackage,
  Promotion,
  Branch,
  MembershipTier,
  CustomerReview
} from '../types/home'

export const mockHeroStats: HeroStats = {
  customers: 15400,
  bookings: 48900,
  branches: 8,
  satisfactionRate: 99.2
}

export const mockProcessSteps: ProcessStep[] = [
  {
    id: 1,
    stepNumber: '01',
    title: 'Đặt lịch trực tuyến',
    description: 'Chọn chi nhánh, thời gian và dịch vụ phù hợp chỉ trong 30 giây qua website hoặc ứng dụng.',
    iconName: 'CalendarCheck'
  },
  {
    id: 2,
    stepNumber: '02',
    title: 'Bàn giao & Checklist xe',
    description: 'Kỹ thuật viên lập biên bản tiếp nhận xe chi tiết kèm hình ảnh rõ ràng trước khi thao tác.',
    iconName: 'ClipboardCheck'
  },
  {
    id: 3,
    stepNumber: '03',
    title: 'Chăm sóc chuyên sâu',
    description: 'Sử dụng quy trình rửa xe 3 bước đạt chuẩn kết hợp dung dịch cao cấp nhập khẩu từ Châu Âu.',
    iconName: 'Sparkles'
  },
  {
    id: 4,
    stepNumber: '04',
    title: 'Nhận xe & Tích điểm',
    description: 'Kiểm tra chất lượng hoàn hảo, thanh toán tiện lợi và tự động tích điểm nâng hạng thành viên.',
    iconName: 'Award'
  }
]

export const mockFeatures: Feature[] = [
  {
    id: 'f1',
    title: 'Theo Dõi Trạng Thái Real-time',
    description: 'Cập nhật trực tiếp từng công đoạn rửa xe của bạn trên ứng dụng theo thời gian thực.',
    iconName: 'Eye',
    highlightText: 'Độc quyền'
  },
  {
    id: 'f2',
    title: 'Biên Bản Giao Nhận Số Hóa',
    description: 'Đảm bảo minh bạch tuyệt đối tình trạng trầy xước, đồ đạc trên xe bằng hình ảnh chụp thực tế.',
    iconName: 'ShieldCheck',
    highlightText: 'Minh bạch'
  },
  {
    id: 'f3',
    title: 'Tích Điểm Tự Động & Đổi Quà',
    description: 'Mỗi 10,000đ chi tiêu đều tích lũy điểm thưởng để đổi voucher và miễn phí dịch vụ.',
    iconName: 'Gift',
    highlightText: 'Ưu đãi'
  },
  {
    id: 'f4',
    title: 'Chuỗi Chi Nhánh Chuẩn Chuẩn 5★',
    description: 'Phòng chờ sang trọng với WiFi tốc độ cao, cà phê miễn phí và hệ thống lọc nước rửa xe chuẩn công nghiệp.',
    iconName: 'MapPin',
    highlightText: 'Đẳng cấp'
  }
]

export const mockComboPackages: ComboPackage[] = [
  {
    id: 'combo-1',
    name: 'Combo Rửa Xe Sinh Thái & Hút Bụi',
    tagline: 'Phù hợp cho xe đi hằng ngày, sạch bóng nhanh chóng',
    originalPrice: 180000,
    discountedPrice: 139000,
    saveBadge: 'Tiết kiệm 23%',
    servicesIncluded: [
      'Rửa vỏ bọt tuyết siêu mịn 3 bước',
      'Hút bụi toàn bộ sàn & ghế ngồi',
      'Lau dọn bảng điều khiển & kính',
      'Dưỡng bóng lốp xe nano'
    ],
    durationMinutes: 35,
    bonusPoints: 14
  },
  {
    id: 'combo-2',
    name: 'Combo Hybrid Ultimate Detailing',
    tagline: 'Chăm sóc toàn diện ngoại thất & nội thất chuyên sâu',
    originalPrice: 650000,
    discountedPrice: 489000,
    saveBadge: 'Tiết kiệm 25%',
    isBestSeller: true,
    servicesIncluded: [
      'Tất cả dịch vụ của Combo Rửa Xe Sinh Thái',
      'Tẩy sạch nhựa đường & bụi sơn',
      'Dọn nội thất diệt khuẩn bằng hơi nước nóng 140°C',
      'Khử mùi Ozon sinh học diệt 99.9% vi khuẩn',
      'Xịt phủ bóng khoang máy an toàn'
    ],
    durationMinutes: 75,
    bonusPoints: 49
  },
  {
    id: 'combo-3',
    name: 'Combo Phủ Ceramic Bảo Vệ Sơn & Kính',
    tagline: 'Bảo vệ lớp sơn xe hiệu ứng lá sen kháng nước',
    originalPrice: 1200000,
    discountedPrice: 890000,
    saveBadge: 'Tiết kiệm 26%',
    servicesIncluded: [
      'Tẩy ố kính lái & kính sườn toàn bộ xe',
      'Đánh bóng loại bỏ xước dăm nhẹ',
      'Phủ 2 lớp Ceramic Quick Coat ngoại thất',
      'Dưỡng da/nỉ ghế xe cao cấp',
      'Bảo hành hiệu ứng kháng nước 6 tháng'
    ],
    durationMinutes: 120,
    bonusPoints: 89
  }
]

export const mockPromotions: Promotion[] = [
  {
    id: 'promo-1',
    code: 'WELCOME50K',
    title: 'Giảm Ngay 50.000đ Cho Khách Hàng Mới',
    description: 'Áp dụng cho đơn đặt lịch lần đầu tiên qua website hoặc app.',
    discountBadge: '-50,000đ',
    validUntil: '31/08/2026',
    minSpend: 100000,
    category: 'new_user'
  },
  {
    id: 'promo-2',
    code: 'WEEKEND20',
    title: 'Ưu Đãi Cuối Tuần - Giảm 20% Combo Detailing',
    description: 'Đặt lịch trước thứ 7 & Chủ nhật hằng tuần để nhận ưu đãi cực hời.',
    discountBadge: '-20%',
    validUntil: '15/09/2026',
    minSpend: 300000,
    category: 'weekend'
  },
  {
    id: 'promo-3',
    code: 'TIERDOUBLE',
    title: 'Nhân Đôi Điểm Thưởng Hạng Vàng & Kim Cương',
    description: 'Tích lũy X2 số điểm cho mọi giao dịch dịch vụ chăm sóc xe.',
    discountBadge: 'X2 Điểm',
    validUntil: '31/12/2026',
    category: 'tier_bonus'
  }
]

export const mockIndividualServices: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Rửa Xe Bọt Tuyết Tiêu Chuẩn',
    category: 'exterior',
    description: 'Sử dụng dung dịch trung tính pH7 bảo vệ sơn xe, xịt gầm sạch bùn đất.',
    price: 90000,
    durationMinutes: 25,
    popular: true
  },
  {
    id: 'srv-2',
    name: 'Dọn Nội Thất Chuyên Sâu Hơi Nước',
    category: 'interior',
    description: 'Giặt ghế, hút ẩm, làm sạch trần xe và diệt khuẩn bằng máy hơi nước nóng.',
    price: 350000,
    durationMinutes: 60,
    popular: true
  },
  {
    id: 'srv-3',
    name: 'Tẩy Ố Kính Lái & Phủ Nước Nano',
    category: 'detailing',
    description: 'Xóa sạch vết ố mốc kính lâu năm, giúp gạt mưa mượt mà và tăng tầm nhìn đêm.',
    price: 250000,
    durationMinutes: 45
  },
  {
    id: 'srv-4',
    name: 'Vệ Sinh Khoang Máy Chuyên Nghiệp',
    category: 'detailing',
    description: 'Làm sạch bụi bẩn, dầu mỡ khoang động cơ bằng dung dịch chuyên dụng và dưỡng dây curoa.',
    price: 300000,
    durationMinutes: 50
  },
  {
    id: 'srv-5',
    name: 'Phủ Bóng Sơn Kháng Bụi Bẩn (Wax)',
    category: 'protection',
    description: 'Tạo lớp màng bảo vệ sơn khỏi tia UV, chống bám bụi và tạo độ bóng gương.',
    price: 200000,
    durationMinutes: 30
  },
  {
    id: 'srv-6',
    name: 'Khử Mùi Ozon Diệt Vi Khuẩn Auto',
    category: 'interior',
    description: 'Máy phát Ozon nồng độ cao loại bỏ tận gốc mùi thuốc lá, mùi thức ăn trên xe.',
    price: 150000,
    durationMinutes: 20
  }
]

export const mockBranches: Branch[] = [
  {
    id: 'br-1',
    name: 'Hybrid Wash - Chi Nhánh Quận 1',
    address: '124 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    phone: '0901 888 124',
    rating: 4.9,
    reviewsCount: 320,
    status: 'open',
    operatingHours: '07:30 - 20:30',
    imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
    facilities: ['Phòng chờ máy lạnh', 'Cà phê hạt miễn phí', 'WiFi 5G', 'Bãi đỗ xe 20 chỗ']
  },
  {
    id: 'br-2',
    name: 'Hybrid Wash - Chi Nhánh Quận 7',
    address: '456 Nguyễn Thị Thập, Phường Tân Quy, Quận 7, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    phone: '0901 888 456',
    rating: 4.8,
    reviewsCount: 285,
    status: 'open',
    operatingHours: '07:30 - 21:00',
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
    facilities: ['Khu vui chơi trẻ em', 'Cà phê hạt miễn phí', 'Phủ Ceramic chuẩn Đức']
  },
  {
    id: 'br-3',
    name: 'Hybrid Wash - Chi Nhánh Thủ Đức',
    address: '89 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    phone: '0901 888 089',
    rating: 4.9,
    reviewsCount: 410,
    status: 'open',
    operatingHours: '07:00 - 21:00',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    facilities: ['Cầu nâng 4 trụ chuyên dụng', 'Rửa gầm tự động', 'Phòng sấy sơn hồng ngoại']
  }
]

export const mockTiers: MembershipTier[] = [
  {
    id: 'tier-copper',
    level: 'copper',
    name: 'Hạng Đồng',
    minPoints: 0,
    pointMultiplier: '1.0x',
    discountPercent: 0,
    color: 'from-orange-700 to-orange-900',
    badgeBg: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
    benefits: [
      'Tích lũy 10% điểm thưởng cho mỗi hóa đơn',
      'Nhắc lịch bảo dưỡng định kỳ tự động',
      'Được ưu đãi sinh nhật giảm 10%'
    ]
  },
  {
    id: 'tier-silver',
    level: 'silver',
    name: 'Hạng Bạc',
    minPoints: 500,
    pointMultiplier: '1.2x',
    discountPercent: 5,
    color: 'from-slate-400 to-slate-600',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
    benefits: [
      'Tất cả đặc quyền Hạng Đồng',
      'Giảm 5% cho tất cả các dịch vụ đơn lẻ',
      'Tích điểm X1.2 cho mọi hóa đơn',
      'Miễn phí 01 lần rửa xe bọt tuyết mừng sinh nhật'
    ]
  },
  {
    id: 'tier-gold',
    level: 'gold',
    name: 'Hạng Vàng',
    minPoints: 2000,
    pointMultiplier: '1.5x',
    discountPercent: 10,
    color: 'from-yellow-400 to-yellow-600',
    badgeBg: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30',
    benefits: [
      'Tất cả đặc quyền Hạng Bạc',
      'Giảm 10% trực tiếp trên tổng hóa đơn',
      'Ưu tiên xếp hàng đặt lịch giờ cao điểm',
      'Miễn phí 01 lần khử mùi Ozon mỗi tháng'
    ]
  },
  {
    id: 'tier-diamond',
    level: 'diamond',
    name: 'Hạng Kim Cương',
    minPoints: 5000,
    pointMultiplier: '2.0x',
    discountPercent: 15,
    color: 'from-cyan-400 to-blue-600',
    badgeBg: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30',
    benefits: [
      'Đặc quyền cao cấp bậc nhất hệ thống',
      'Giảm 15% tất cả dịch vụ & Combo Detailing',
      'Nhân đôi điểm tích lũy X2.0',
      'Chuyên viên riêng chăm sóc & tư vấn bảo dưỡng xe',
      'Dịch vụ nhận & giao xe tận nhà trong bán kính 10km'
    ]
  }
]

export const mockCustomerReviews: CustomerReview[] = [
  {
    id: 'rev-1',
    customerName: 'Anh Trần Minh Tuấn',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    carModel: 'Mercedes-Benz C300 AMG',
    rating: 5,
    comment: 'Tôi rất ấn tượng với biên bản bàn giao xe số hóa của Hybrid Wash. Quy trình chuyên nghiệp, khoang máy dọn xong nhìn như mới đập hộp!',
    date: '15/07/2026',
    branchName: 'Chi Nhánh Quận 1'
  },
  {
    id: 'rev-2',
    customerName: 'Chị Nguyễn Phương Thảo',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    carModel: 'Porsche Macan GTS',
    rating: 5,
    comment: 'Tính năng theo dõi tiến độ rửa xe theo thời gian thực rất tiện. Đặt lịch online không bao giờ phải chờ đợi, phòng chờ cực thơm và hiện đại.',
    date: '28/07/2026',
    branchName: 'Chi Nhánh Quận 7'
  },
  {
    id: 'rev-3',
    customerName: 'Anh Hoàng Quốc Bảo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    carModel: 'BMW 530i M Sport',
    rating: 5,
    comment: 'Combo Ceramic ở đây làm rất kĩ. Kháng nước lá sen rõ rệt sau 2 tháng sử dụng. Điểm thưởng tích lại được đổi voucher quá xịn!',
    date: '01/08/2026',
    branchName: 'Chi Nhánh Thủ Đức'
  }
]
