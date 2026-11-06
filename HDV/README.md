# 📱 Digital Travel ERP - Tour Guide Mobile Portal (HDV)

Ứng dụng di động tối ưu dành riêng cho **Hướng dẫn viên (HDV) thực địa**, được xây dựng dưới dạng Progressive Web App (PWA) giúp theo dõi hành trình, điểm danh du khách, quyết toán chi phí và báo cáo sự cố thời gian thực.

---

## 🚀 Tính năng chính của Cổng Hướng dẫn viên

1. **🔑 Đăng nhập Nghiệp vụ (Security Login):** Đăng nhập nhanh bằng mã số HDV được cấp phép để đồng bộ dữ liệu tour thực tế từ văn phòng điều hành.
2. **📊 Trang chủ & Chỉ số đoàn (Dashboard):** Xem chi tiết Tour đang diễn ra, tiến độ điểm danh nhanh, tổng hợp ngân sách chi tiêu và các lịch trình sắp khởi hành.
3. **📅 Lịch trình Tour & Thực đơn (Schedule):** Tra cứu hoạt động chi tiết theo thời gian thực (Giờ giấc, Hoạt động, Địa điểm) kèm theo thực đơn ẩm thực bữa trưa/tối đặc sắc.
4. **👥 Điểm danh du khách thông minh (Attendance Check):**
   * Quét mã QR hoặc check-in thủ công.
   * Hiển thị cảnh báo đỏ y tế đối với các hành khách có tiểu sử dị ứng/sức khỏe đặc biệt (bắt buộc HDV xác nhận).
   * Ghi nhận vắng mặt kèm lý do chi tiết cập nhật ngay lập tức lên ERP chính.
5. **🍀 Ghi nhận Hành động Xanh (Eco Green Passport):** Đồng hành cùng du lịch bền vững bằng việc xác nhận các hành động bảo vệ môi trường của du khách để cộng điểm tích lũy Hộ chiếu số.
6. **💵 Quyết toán chi phí thực địa (Expense Tracker):** Nhập khoản chi, chụp ảnh hóa đơn chứng từ và tự động trừ vào hạn mức tạm ứng của tour.
7. **🚨 Báo cáo sự cố khẩn cấp (Incident Report & SOS):** Báo cáo nhanh các sự cố (y tế, thời tiết, phương tiện) kèm ảnh chụp thực tế và kích hoạt trạng thái SOS khẩn cấp gửi về trung tâm điều hành.

---

## 📁 Cấu trúc Thư mục Chuẩn hóa (Modular Structure)

Mã nguồn được tổ chức sạch sẽ, chuẩn hóa theo mô hình mô-đun hóa các trang nghiệp vụ:

* **[src/App.tsx](src/App.tsx):** Page Shell trung tâm, quản lý trạng thái phiên làm việc, lưu trữ cơ sở dữ liệu ảo và thanh Footer điều hướng.
* **[src/types.ts](src/types.ts):** Định nghĩa chặt chẽ các thực thể TypeScript (Tour, Passenger, Expense, IncidentReport).
* **[src/mockData.ts](src/mockData.ts):** Cơ sở dữ liệu giả lập cho khách hàng, lịch trình, hành động xanh và chi phí.
* **`src/pages/` (NEW ✨):** Thư mục chứa các trang nghiệp vụ độc lập:
  * [Login.tsx](src/pages/Login.tsx): Trang xác thực tài khoản HDV.
  * [Profile.tsx](src/pages/Profile.tsx): Hồ sơ chi tiết HDV và năng lực thực địa.
  * [Dashboard.tsx](src/pages/Dashboard.tsx): Trang chủ quản lý tổng quan.
  * [Schedule.tsx](src/pages/Schedule.tsx): Quản lý chi tiết lịch trình và thực đơn ăn uống.
  * [Attendance.tsx](src/pages/Attendance.tsx): Hệ thống điểm danh và cảnh báo sức khỏe y tế.
  * [GreenPoints.tsx](src/pages/GreenPoints.tsx): Tích điểm hành động xanh cho du khách.
  * [ExpenseTracker.tsx](src/pages/ExpenseTracker.tsx): Quản lý chi phí và quyết toán tạm ứng thực địa.
  * [IncidentReport.tsx](src/pages/IncidentReport.tsx): Báo cáo sự cố và kích hoạt tín hiệu SOS khẩn cấp.

---

## 🛠️ Công nghệ Sử dụng & Thiết kế Premium

* **Core & Routing:** React 19 + TypeScript + Vite.
* **CSS & Style:** Tailwind CSS v4 với các lớp tiện ích được tùy biến sâu.
* **Aesthetics:** Thiết kế Glassmorphism hiện đại, màu sắc Tailored HSL dịu mắt, bóng mờ mịn màng và các vi hiệu ứng chuyển động tương tác mượt mà.
* **Typography:** Tích hợp phông chữ **Outfit** bo tròn hiện đại mang lại cảm giác cao cấp và chuyên nghiệp.

---

## 🧑‍💻 Hướng dẫn Phát triển & Biên dịch

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Khởi chạy môi trường Dev:
```bash
npm run dev
```

### 3. Kiểm tra kiểu dữ liệu TypeScript (Compile Check):
```bash
npx tsc --noEmit
```

### 4. Biên dịch dự án (Production Build):
```bash
npm run build
```
