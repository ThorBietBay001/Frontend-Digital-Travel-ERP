# 🎨 Frontend - Digital Travel ERP

Kho lưu trữ giao diện người dùng (Frontend Monorepo) chuẩn hóa cho hệ thống **Digital Travel ERP**, tập trung cả 3 phân hệ người dùng trên cùng một kho lưu trữ duy nhất.

---

## 📁 Cấu trúc kho lưu trữ

```text
Frontend-Digital-Travel-ERP/
├── Admin/                   # Cổng Quản trị viên & Nhân viên nghiệp vụ
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── HDV/                     # Cổng Ứng dụng Hướng dẫn viên du lịch
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── Khachhang/               # Cổng Web Khách hàng đặt tour & tra cứu
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Hướng dẫn khởi chạy các phân hệ

Yêu cầu môi trường: **Node.js 20+** và **npm**.

### 1. Phân hệ Quản trị (`Admin/`)
```bash
cd Admin
npm install
npm run dev
# Mở trình duyệt: http://localhost:5173
```

### 2. Phân hệ Hướng dẫn viên (`HDV/`)
```bash
cd HDV
npm install
npm run dev -- --port 5174
# Mở trình duyệt: http://localhost:5174
```

### 3. Phân hệ Khách hàng (`Khachhang/`)
```bash
cd Khachhang
npm install
npm run dev -- --port 5175
# Mở trình duyệt: http://localhost:5175
```

---

## ⚙️ Cấu hình API Backend Proxy

Mặc định cả 3 ứng dụng đều cấu hình reverse proxy chuyển tiếp các yêu cầu `/api` về cổng `8080` của Backend (`http://localhost:8080`).

---

## 🧪 Kiểm tra mã nguồn

* `npm run lint`: Chạy ESLint kiểm tra lỗi cú pháp và chuẩn code.
* `npm run build`: Biên dịch TypeScript và đóng gói Vite sản phẩm ra thư mục `dist/`.
