# Đặc tả Luồng Trạng thái (Status Flow Specification)

Tài liệu này tập trung vào các quy trình nghiệp vụ có sự chuyển đổi trạng thái dữ liệu phức tạp, phục vụ cho việc thiết kế logic Backend và các biểu đồ trạng thái (State Diagram).

---

## 1. Phân hệ Điểm danh (DiemDanh)

Phân hệ này quản lý việc hiện diện của hành khách tại hiện trường tour.

### Các trạng thái (Enum):
*   `CHUA_DIEM_DANH`: Trạng thái mặc định khi tour sắp khởi hành.
*   `DA_DIEM_DANH`: Đã xác nhận sự có mặt.
*   `VANG`: Khách không có mặt tại điểm hẹn sau khi kết thúc quy trình điểm danh.

### Luồng chuyển đổi trạng thái (UC41):

| Trạng thái gốc | Hành động | Trạng thái đích | Tác nhân |
|---|---|---|---|
| `CHUA_DIEM_DANH` | Quét mã QR thành công | `DA_DIEM_DANH` | HDV |
| `CHUA_DIEM_DANH` | Tích chọn thủ công (Manual Check) | `DA_DIEM_DANH` | HDV |
| `CHUA_DIEM_DANH` | Đánh dấu vắng mặt + Nhập lý do | `VANG` | HDV |
| `VANG` | Khách đến muộn và được xác nhận lại | `DA_DIEM_DANH` | HDV |

---

## 2. Phân hệ Giải quyết Khiếu nại (YeuCauHoTro)

Quy trình xử lý các Ticket hỗ trợ và khiếu nại từ khách hàng.

### Các trạng thái (Enum):
*   `CHUA_XU_LY`: Phiếu mới gửi hoặc đang đợi nhân viên tiếp nhận.
*   `CHO_BO_SUNG`: Đang đợi khách hàng cung cấp thêm bằng chứng/thông tin.
*   `CHO_GIAI_TRINH`: Đang đợi HDV hoặc các bên liên quan giải trình diễn biến.
*   `DA_XU_LY`: Kết thúc xử lý (Đã bồi thường hoặc giải quyết xong).
*   `TU_CHOI`: Từ chối khiếu nại do không đủ bằng chứng hoặc sai thực tế.

### Luồng chuyển đổi trạng thái (UC36 & UC39):

| Trạng thái gốc | Hành động | Trạng thái đích | Tác nhân |
|---|---|---|---|
| (Khởi tạo) | Gửi khiếu nại (UC36) | `CHUA_XU_LY` | Khách hàng |
| `CHUA_XU_LY` | Yêu cầu khách thêm ảnh/video | `CHO_BO_SUNG` | NV Điều hành |
| `CHO_BO_SUNG` | Khách hàng cập nhật thông tin | `CHUA_XU_LY` | Hệ thống (Auto) |
| `CHUA_XU_LY` | Gửi yêu cầu giải trình cho HDV | `CHO_GIAI_TRINH` | NV Điều hành |
| `CHO_GIAI_TRINH` | HDV nộp báo cáo giải trình | `CHUA_XU_LY` | Hệ thống (Auto) |
| `CHUA_XU_LY` | Phê duyệt phương án giải quyết | `DA_XU_LY` | NV Điều hành |
| `CHUA_XU_LY` | Bác bỏ khiếu nại | `TU_CHOI` | NV Điều hành |

---

## 3. Phân hệ Hạng thành viên (HoChieuSo)

Quy trình thăng hạng dựa trên điểm tích lũy của khách hàng.

### Các cấp bậc (Membership Ranks):
*   `THANH_VIEN`: Mức khởi đầu khi vừa đăng ký.
*   `DONG` (Bronze): Đạt mốc điểm tích lũy cơ bản.
*   `BAC` (Silver): Đạt mốc điểm trung bình.
*   `VANG` (Gold): Đạt mốc điểm cao.
*   `KIM_CUONG` (Diamond): Mức cao nhất.

### Luồng nâng hạng (Hệ thống tự động):

| Hạng hiện tại | Điều kiện (Ví dụ) | Hạng mới | Ghi chú |
|---|---|---|---|
| `THANH_VIEN` | Điểm tích lũy >= 1,000 | `DONG` | Cập nhật ngay khi đơn hàng hoàn thành |
| `DONG` | Điểm tích lũy >= 5,000 | `BAC` | |
| `BAC` | Điểm tích lũy >= 20,000 | `VANG` | |
| `VANG` | Điểm tích lũy >= 50,000 | `KIM_CUONG` | |

*Lưu ý: Điểm tích lũy được tính dựa trên giá trị đơn hàng đã quyết toán (UC48) và các hành động xanh (UC42).*

---

## 4. Phân hệ Khuyến mãi - Voucher (KhuyenMai)

Phân hệ này quản lý vòng đời của Voucher (Master) và trạng thái sở hữu Voucher của từng Khách hàng trong ví.

### Các trạng thái (Enum):

*   **Trạng thái Voucher Master (`Voucher.TrangThai`):**
    *   `SAN_SANG`: Voucher đã được khởi tạo thành công và sẵn sàng để phân phối hoặc đổi điểm (Mặc định).
    *   `VO_HIEU_HOA`: Vô hiệu hóa chiến dịch Voucher (giúp ngắt chiến dịch sớm trước ngày hết hạn thực tế).
*   **Trạng thái Voucher trong Ví của Khách hàng (`KhuyenMai_KH.TrangThai`):**
    *   `CO_HIEU_LUC`: Voucher đã được phân phối vào ví của khách hàng, sẵn sàng áp dụng khi mua Tour (Mặc định).
    *   `DA_SU_DUNG`: Khách hàng đã áp dụng voucher này vào một đơn đặt Tour thành công.
    *   `DA_THU_HOI`: Voucher bị nhân viên thu hồi khỏi ví của khách hàng (do lỗi nghiệp vụ hoặc phân phối nhầm).
    *   `HET_HAN`: Voucher đã hết hạn sử dụng dựa trên ngày hết hạn (`NgayHetHan`).

### Luồng chuyển đổi trạng thái của Voucher Master (`Voucher` - UC52 & UC53):

| Trạng thái gốc | Hành động | Trạng thái đích | Tác nhân | Ghi chú |
|---|---|---|---|---|
| (Khởi tạo) | Tạo mới voucher (UC53) | `SAN_SANG` | NV Kinh doanh | Lưu vào CSDL ở trạng thái sẵn sàng phát hành |
| `SAN_SANG` | Ngắt chiến dịch/Vô hiệu hóa (UC52) | `VO_HIEU_HOA` | NV Kinh doanh | Dừng việc phát hành/đổi điểm mới và dừng áp dụng |

### Luồng chuyển đổi trạng thái Voucher của Khách hàng (`KhuyenMai_KH` - UC45 & UC48 & UC54):

| Trạng thái gốc | Hành động | Trạng thái đích | Tác nhân | Ghi chú |
|---|---|---|---|---|
| (Khởi tạo) | Phân phối mã ưu đãi (UC54) | `CO_HIEU_LUC` | NV Kinh doanh | Hệ thống ghi nhận vào Ví của khách hàng mục tiêu |
| (Khởi tạo) | Đổi điểm tích lũy lấy Voucher (UC45) | `CO_HIEU_LUC` | Khách hàng | Ghi nhận qua Nhật ký đổi điểm và thêm vào Ví |
| `CO_HIEU_LUC` | Áp dụng Voucher đặt Tour thành công | `DA_SU_DUNG` | Khách hàng / Hệ thống | Cập nhật khi đơn đặt Tour được xác nhận |
| `DA_SU_DUNG` | Đơn đặt Tour bị Hủy (UC48) | `CO_HIEU_LUC` | Hệ thống (Auto) / NV | Hoàn trả Voucher lại Ví nếu vẫn còn trong hạn sử dụng |
| `DA_SU_DUNG` | Đơn đặt Tour bị Hủy + Quá hạn sử dụng | `HET_HAN` | Hệ thống (Auto) | Không hoàn trả lại trạng thái hoạt động nếu đã quá hạn |
| `CO_HIEU_LUC` | Thu hồi Voucher đã phát (UC54) | `DA_THU_HOI` | NV Kinh doanh | Thu hồi khỏi ví khách hàng khi có sai sót |
| `CO_HIEU_LUC` | Quá thời hạn sử dụng (`NgayHetHan`) | `HET_HAN` | Hệ thống (Auto) | Tự động chuyển trạng thái hoặc kiểm tra tại thời điểm truy vấn |

