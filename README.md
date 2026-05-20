# Digital Travel ERP - Giao diện Khách hàng (KH)

Dự án này chứa mã nguồn giao diện web (Frontend) dành cho **Khách hàng** của hệ thống **Digital Travel ERP**. Hệ thống cung cấp trải nghiệm số hóa toàn diện từ lúc khách hàng tìm kiếm, đặt tour, cho đến khi trải nghiệm, phản hồi và quản lý hồ sơ cá nhân.

## 1. Cấu trúc thư mục dự án
- `src/components`: Chứa các React components có thể tái sử dụng.
  - `booking/`: Các component cho luồng Đặt tour & Thanh toán.
  - `ui/`: Các thành phần giao diện cơ bản (shadcn/ui hoặc custom).
- `src/data`: Dữ liệu mẫu (mock data).
- `docs/`: Tài liệu đặc tả hệ thống và quy trình nghiệp vụ.
- `figma/`: Các export giao diện tĩnh từ Figma.

## 2. Các luồng nghiệp vụ chính

### 2.1. Tra cứu và Đặt tour (Booking)
- **Tra cứu Tour**: Khách hàng có thể tìm kiếm chuyến đi theo điểm đến, ngày khởi hành và ngân sách.
- **Xem chi tiết Tour**: Hiển thị tổng quan chuyến đi, lịch trình, bảng giá, lịch khởi hành và chính sách.
- **Đặt tour & Thanh toán**: Cung cấp form nhập thông tin hành khách, áp dụng mã giảm giá (voucher) và thanh toán với đồng hồ đếm ngược giữ chỗ.

### 2.2. Quản lý Hộ chiếu số (Digital Passport)
Hộ chiếu số là nơi quản lý toàn bộ thông tin cá nhân và lịch sử du lịch của khách hàng:
- **Thông tin cá nhân**: Cập nhật hồ sơ, hạng thành viên, điểm thưởng xanh.
- **Lịch sử chuyến đi**: Theo dõi đơn đặt tour, yêu cầu hủy tour, hoàn tiền, đánh giá trải nghiệm và khiếu nại.
- **Ví ưu đãi**: Quản lý và quy đổi "Điểm thưởng xanh" thành mã giảm giá.

### 2.3. Hệ thống xác thực
Hỗ trợ đăng nhập, đăng ký và quản lý mật khẩu qua hệ thống Modal/Popup tối ưu trải nghiệm.

## 3. Kiến trúc giao diện (UI Architecture)
- **Trang chủ (Home)**: Banner tra cứu tour, danh sách tour nổi bật.
- **Trang chi tiết & Đặt tour (Tour Detail)**: Cung cấp thông tin chi tiết kèm chức năng đặt tour nổi bật.
- **Hộ chiếu số (Dashboard)**: Quản lý dưới dạng Tabs (Hồ sơ, Lịch sử, Ví voucher).

## 4. Công nghệ sử dụng
- **React 19 + TypeScript**: Xây dựng UI linh hoạt, an toàn kiểu dữ liệu.
- **Vite**: Build tool siêu tốc.
- **Tailwind CSS v4**: Định dạng giao diện hiện đại, responsive.
- **Lucide React**: Thư viện icon.

## 5. Hướng dẫn chạy dự án

Cài đặt các gói phụ thuộc:
```bash
npm install
```

Khởi chạy môi trường phát triển:
```bash
npm run dev
```

Build dự án:
```bash
npm run build
```

## 6. Tài liệu tham khảo
Đọc thêm về các tài liệu đặc tả hệ thống trong thư mục `docs/`:
- [Danh mục hệ thống, Actor & Use-case](docs/00-danh-muc-he-thong.md)
- [Quản lý Hộ chiếu số](docs/02-quan-ly-ho-chieu-so.md)
- [Đặt tour & Thanh toán](docs/03-dat-tour-va-thanh-toan.md)
- [Kiến trúc Giao diện](docs/kien-truc-giao-dien-khach-hang.md)
