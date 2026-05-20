# Kien truc giao dien khach hang

Tai lieu nay mo ta kien truc giao dien web khach hang Digital Travel ERP theo 3 man hinh chinh va 1 he thong popup. Noi dung duoc doi chieu tu cac use case khach hang trong phan he Ho chieu so va Dat tour - Thanh toan.

## 1. Kien truc giao dien chinh (UI Architecture)

### 1.1. Man hinh 1: Trang chu (Home/Landing Page)
- Thanh dieu huong:
  - Logo (Trang chu)
  - Menu dieu huong
  - Nut truy cap Ho so so
  - Nut Dang nhap/Dang ky
- Hero Section:
  - Khung tra cuu tour (Diem den, Ngay di, Ngan sach)
- Main Content:
  - Danh sach tour (grid the tour) theo noi bat hoac ket qua tra cuu
  - Moi the co tom tat thong tin va nut "Xem chi tiet"

### 1.2. Man hinh 2: Trang chi tiet & Dat tour (Tour Detail & Checkout)
- Chi tiet tour:
  - Hinh anh, lich trinh, gia, chinh sach, ngay khoi hanh
- Sticky Booking Bar:
  - Hien thi tong gia va nut "Dat Tour Ngay" (CTA)
- Booking Form (hien thi khi bam Dat Tour):
  - Nhap thong tin hanh khach
  - Khung ap dung ma voucher
  - Cong thanh toan va xac nhan

### 1.3. Man hinh 3: Ho so so (Digital Passport / Dashboard)
- Giao dien Tabs, khong phai chuyen trang
  - Tab 1: Thong tin ca nhan
    - Xem/Sua ho so
    - Hang thanh vien
    - Diem thuong xanh
  - Tab 2: Lich su chuyen di
    - Quan ly don hang dang dat, tour da di
    - Hanh dong: Huy tour, Yeu cau hoan tien, Danh gia, Khieu nai
  - Tab 3: Vi uu dai (Voucher Wallet)
    - Danh sach voucher dang co
    - Kho uu dai de quy doi diem xanh

### 1.4. He thong Popup/Modal: Xac thuc
- Dang nhap, Dang ky, Quen mat khau
- Hien dang popup/modals tren nen Trang chu (hoac chuyen trang nhe)

## 2. Luong giao dien nguoi dung (User Flow)

### 2.1. Luong 1: Tra cuu va Dat tour
1. Bat dau o Trang chu
2. Tra cuu (UC25): Nhap thong tin tra cuu -> load danh sach tour
3. Xem chi tiet (UC26): Chon 1 tour -> Trang Chi tiet
4. Dat tour (UC27): Bam "Dat Tour" -> mo Booking Form
5. Ap dung voucher (UC28): Chon/nhap ma -> cap nhat gia
6. Thanh toan (UC29): Bam "Thanh toan" -> xu ly giao dich
7. Hoan tat: Thong bao dat tour thanh cong, ve day ve Ho so so

### 2.2. Luong 2: Quan ly ca nhan & Hau mai
1. Bam Avatar/Ho so so tren thanh dieu huong
2. Neu chua dang nhap: Mo popup Dang nhap/Dang ky (UC57/UC56)
3. Dang nhap thanh cong -> Ho so so
4. Tab Thong tin ca nhan (UC21/UC23): Xem va cap nhat ho so
5. Tab Chuyen di (UC22):
   - Tour sap di: Huy tour (UC32) -> Yeu cau hoan tien (UC33)
   - Tour da di: Danh gia (UC35) hoac Khieu nai (UC36)
6. Tab Uu dai (UC31):
   - Xem voucher
   - Quy doi voucher (UC30) va cap nhat vi

## 3. Ghi chu trien khai UI
- Cac chuc nang lien quan ho so so can dang nhap
- Huy tour va hoan tien chi kich hoat voi tour hop le
- Booking Form nen co dem nguoc thoi gian giu cho
- Luong ap dung voucher cap nhat gia truc tiep tren giao dien
