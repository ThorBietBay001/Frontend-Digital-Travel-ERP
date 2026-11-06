# Digital Travel ERP - Giao diện Khách hàng (KH)

Dự án này chứa mã nguồn giao diện web (Frontend) dành cho **Khách hàng** của hệ thống **Digital Travel ERP**. Ứng dụng tập trung vào hành trình tìm tour, đặt tour, thanh toán và quản lý hồ sơ cá nhân (Hộ chiếu số).

## 1. Tổng quan tính năng
- Trang chủ và danh sách tour nổi bật.
- Trang chi tiết tour và luồng đặt tour/thanh toán theo từng bước.
- Hộ chiếu số (Digital Passport) để quản lý hồ sơ và lịch sử chuyến đi.
- Trang giới thiệu doanh nghiệp (About Us).
- Hệ thống modal hỗ trợ đăng nhập, FAQ, và tương tác nhanh.

## 2. Cấu trúc thư mục
- `src/components`: Các component tái sử dụng.
  - `booking/`: UI cho luồng đặt tour và thanh toán.
  - `layout/`: Layout chính (Header/Footer/Root).
  - `modals/`: Modal hỗ trợ xác thực và FAQ.
  - `ui/`: Bộ component UI từ Radix + các wrapper kiểu shadcn.
- `src/pages`: Các trang (Home, TourDetail, DigitalPassport, AboutUs, NotFound).
- `src/data`: Dữ liệu mẫu (mock data).
- `src/styles`: CSS tổng thể và theme.
- `docs/`: Tài liệu đặc tả nghiệp vụ và kiến trúc UI.
- `public/images`: Tài nguyên hình ảnh tĩnh.

## 3. Định tuyến trang (Routes)
Ứng dụng sử dụng `react-router` với các route chính:
- `/` trang Home.
- `/tour/:tourId` trang chi tiết tour.
- `/passport` trang Digital Passport.
- `/about` trang About Us.
- `*` trang NotFound.

## 4. Luồng nghiệp vụ chính (tóm tắt theo đặc tả)

### 4.1. Tra cứu và xem chi tiết tour
- **Tra cứu tour (UC25)**: nhập điểm đến/ngày/mức giá, hệ thống tính giá động và hiển thị danh sách kết quả kèm số chỗ còn nhận. Nếu không có kết quả, gợi ý tour gần nhất hoặc đang thu hút.
- **Xem chi tiết tour (UC26)**: hiển thị tổng quan, lịch trình, bảng giá, lịch khởi hành, đánh giá và chính sách.

### 4.2. Đặt tour và thanh toán
- **Đặt tour (UC27)**:
  - Chọn hình thức đi cá nhân/nhóm, hệ thống kiểm tra quỹ chỗ và tạm giữ chỗ kèm đồng hồ đếm ngược.
  - Nhập thông tin hành khách (người đặt tự động lấy từ Hộ chiếu số), chọn dịch vụ thêm và hành động xanh.
  - Tổng hợp giá, phụ thu, ưu đãi; chuyển sang bước thanh toán.
- **Áp dụng voucher (UC28)**: chọn/nhập mã, hệ thống kiểm tra hợp lệ, tạm khóa voucher và cập nhật tổng tiền.
- **Thanh toán (UC29)**: chọn phương thức thanh toán, chuyển qua cổng thanh toán, cập nhật trạng thái đơn hàng, phát hành vé điện tử và thông báo xác nhận.

### 4.3. Hộ chiếu số và lịch sử hành trình
- **Xem hồ sơ số (UC21)**: xem hồ sơ cá nhân, hạng thành viên, điểm thưởng xanh và tóm tắt lịch sử chuyến đi.
- **Xem lịch sử hành trình (UC22)**: phân loại theo trạng thái (sắp khởi hành/đã hoàn thành/đã hủy), xem chi tiết đơn hàng và thao tác liên quan.
- **Cập nhật hồ sơ (UC23)**: chỉnh sửa thông tin, xác thực OTP, lưu cập nhật.

### 4.4. Hủy tour và hoàn tiền
- **Hủy tour (UC32)**: kiểm tra điều kiện, tính phí phạt, cập nhật trạng thái đơn hàng và khởi tạo yêu cầu hoàn tiền.
- **Hoàn tiền (UC33)**: tạo yêu cầu hoàn tiền, cập nhật trạng thái “Đang xử lý hoàn tiền” và gửi thông báo.

## 5. Công nghệ sử dụng
- **React 19 + TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Radix UI** + **shadcn-style UI wrappers**
- **React Router**
- **Lucide React**

## 6. Lệnh phát triển
Cài đặt phụ thuộc:
```bash
npm install
```

Chạy dev server:
```bash
npm run dev
```

Build dự án:
```bash
npm run build
```

Lint:
```bash
npm run lint
```

Preview build:
```bash
npm run preview
```

## 7. Tài liệu tham khảo
Đọc thêm tại `docs/`:
- [Tổng quan hệ thống](docs/overview.md)
- [Danh mục hệ thống, Actor & Use-case](docs/00-danh-muc-he-thong.md)
- [Quản lý Hộ chiếu số](docs/02-quan-ly-ho-chieu-so.md)
- [Đặt tour & Thanh toán](docs/03-dat-tour-va-thanh-toan.md)
- [Quản lý Điều phối](docs/04-quan-ly-dieu-phoi.md)
- [Quản trị hệ thống](docs/08-quan-tri-he-thong.md)
- [Đặc tả luồng trạng thái](docs/SPEC-Status-Flows.md)
- [Kiến trúc giao diện khách hàng](docs/kien-truc-giao-dien-khach-hang.md)
