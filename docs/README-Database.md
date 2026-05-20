# Digital Travel ERP - Database Documentation

## Tổng quan
Đây là tài liệu lưu trữ cấu trúc Cơ sở dữ liệu (Database Schema) chính thức của dự án **Digital Travel ERP**. CSDL được thiết kế tối ưu cho hệ quản trị **Oracle Database** với các ràng buộc (Constraints) mức Data Layer chặt chẽ, đảm bảo tính toàn vẹn nghiệp vụ.

- **Phiên bản:** Chốt (Final) - Cập nhật 2026-04-02
- **Cấu trúc Naming:** Logical-name (PascalCase tiếng Việt cho các Business Columns)
- **Hỗ trợ Audit:** Sử dụng bảng `NHATKYHETHONG` để tracking hành động (Insert, Update, Delete) thay vì gán Audit columns (CreatedBy, UpdatedAt) vào từng bảng.

## File Script
- **Script DDL:** [`init_db_oracle.sql`](./init_db_oracle.sql)
- Bạn có thể chạy trực tiếp file SQL này trên Oracle SQL Developer hoặc SQL*Plus. Script đã được cấu hình khối lệnh `BEGIN ... END` để tự động Drop các bảng cũ theo đúng thứ tự phụ thuộc Khóa ngoại (Foreign Keys) trước khi khởi tạo bảng mới.

## Cấu trúc các phân hệ chính (Modules)

Cơ sở dữ liệu gồm 24 bảng, chia làm 4 phân hệ chính (Mapping trực tiếp với 8 phân hệ Use-case của ứng dụng):

### 1. Định danh & Khách hàng (Identity & CRM)
- `VAITRO`, `TAIKHOAN`: Quản lý tài khoản đăng nhập và phân quyền cơ bản.
- `NHATKYHETHONG`: Lưu vết thao tác của người dùng.
- `HOCHIEUSO`: Profile nghiệp vụ của khách hàng (Điểm xanh, hạng thành viên, hồ sơ y tế).
- `NHANVIEN`, `NANGLUCNHANVIEN`: Quản lý hồ sơ nhân sự nội bộ và chứng chỉ của Hướng dẫn viên.

### 2. Sản phẩm (Product Management)
- `TOURMAU`, `LICHTRINHTOUR`: Định nghĩa khung chương trình chuẩn.
- `DICHVUTHEM`: Các dịch vụ bán kèm và dịch vụ phòng(Extra services).
- `HANHDONGXANH`: Danh mục điểm thưởng cho các hành động bảo vệ môi trường.
- `TOURTHUCTE`: Lịch khởi hành cụ thể được mở bán (Kế thừa từ Tour Mẫu).

### 3. Đặt Tour & Thanh toán (Booking & Payment)
- `DONDATTOUR`: Giao dịch mua tour gốc.
- `DSNGUOIDONGHANH`: Quản lý danh sách khách đi kèm (Không có tài khoản hệ thống).
- `CHITIETDATTOUR`: Lưu danh sách hành khách chi tiết của đơn (Mapping giữa Đơn - Khách - Người đồng hành).
- `CHITIETDICHVU`: Dịch vụ bán kèm trong đơn.
- `VOUCHER`, `KHUYENMAI_KH`, `DATTOUR_UUDAI`: Quản lý phát hành, lưu trữ và áp dụng mã giảm giá.
- `GIAODICH`: Lưu vết dòng tiền (Thanh toán, Hoàn tiền).
- `LICHSUTOUR`: Ghi nhận các tour khách hàng đã tham gia.

### 4. Vận hành & Hỗ trợ (Operations & Support)
- `PHANCONGTOUR`: Phân công Hướng dẫn viên (HDV) cho tour thực tế.
- `DIEMDANH`: Log điểm danh khách của HDV tại hiện trường.
- `HANHDONG`: Log xác nhận hành động xanh tại hiện trường.
- `NHATKYSUCO`, `CHIPHITHUCTE`: Báo cáo sự cố và khai báo chi phí của HDV gửi về Kế toán.
- `QUYETTOAN`: Tổng hợp Doanh thu - Chi phí - Lợi nhuận của từng tour.
- `NHATKYDOIDIEM`: Ghi nhận khách hàng dùng điểm xanh đổi Voucher.
- `YEUCAUHOTRO`: Tickets khiếu nại/hỗ trợ của khách.
- `DANHGIAKH`: Đánh giá 5 sao và nhận xét sau chuyến đi.

## Các điểm thiết kế nổi bật
1. Cơ chế **Composite Foreign Keys** tại bảng `DIEMDANH` và `HANHDONG` tham chiếu tới `PHANCONGTOUR`, đảm bảo chỉ có HDV được phân công mới có quyền điểm danh/xác nhận cho tour đó.
2. Các cột tiền tệ (`GiaSan`, `DonGia`, `ThanhTien`, `TongTien`) được cấp phát `NUMBER(18,2)` để đảm bảo độ chính xác cho giao dịch ERP.
3. Ràng buộc `CHECK` được triển khai mạnh mẽ (Ví dụ: `ThanhTien = SoLuong * DonGia` trong `CHITIETDICHVU`) giúp chặn các truy vấn cập nhật sai lệch dữ liệu từ Source code.
4. Tích hợp sẵn bộ Index ở cuối file cho các cột Foreign Key có tần suất truy vấn cao nhằm ngăn chặn Oracle Table Lock.
