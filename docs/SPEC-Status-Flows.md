# Đặc tả Luồng Trạng thái liên quan đến Hướng dẫn viên (HDV)

Tài liệu này tập trung vào các quy trình nghiệp vụ thực địa có sự chuyển đổi trạng thái dữ liệu phức tạp do Hướng dẫn viên (HDV) thực thi hoặc liên quan trực tiếp.

---

## 1. Phân hệ Điểm danh thực địa (DiemDanh - UC41)

Phân hệ này quản lý việc hiện diện của hành khách tại hiện trường tour do HDV điểm danh thủ công hoặc quét mã QR.

### Các trạng thái điểm danh (Enum):
*   `CHUA_DIEM_DANH`: Trạng thái mặc định khi tour chuẩn bị khởi hành.
*   `DA_DIEM_DANH`: Đã xác nhận sự có mặt thực tế của hành khách.
*   `VANG`: Khách không có mặt tại điểm hẹn tập trung sau khi kết thúc quy trình điểm danh.

### Luồng chuyển đổi trạng thái (State Transitions):

| Trạng thái gốc | Hành động | Trạng thái đích | Tác nhân | Ghi chú nghiệp vụ |
|---|---|---|---|---|
| `CHUA_DIEM_DANH` | Quét mã QR vé thành công | `DA_DIEM_DANH` | HDV | Hệ thống ghi nhận tự động qua camera quét mã QR |
| `CHUA_DIEM_DANH` | Tích chọn thủ công (Manual Check) | `DA_DIEM_DANH` | HDV | Dành cho trường hợp camera lỗi hoặc vé rách |
| `CHUA_DIEM_DANH` | Đánh dấu vắng mặt | `VANG` | HDV | HDV bắt buộc phải chọn lý do vắng mặt từ danh sách |
| `VANG` | Khách đến muộn và được xác nhận lại | `DA_DIEM_DANH` | HDV | Khôi phục trạng thái khi khách đuổi kịp đoàn |

---

## 2. Luồng Giải trình Sự việc & Hỗ trợ (YeuCauHoTro - UC39)

Quy trình giải quyết khiếu nại của khách hàng có liên quan đến công tác tổ chức của HDV tại hiện trường.

### Các trạng thái liên quan đến HDV:
*   `CHO_GIAI_TRINH`: Đang đợi Hướng dẫn viên nộp báo cáo giải trình diễn biến sự việc thực tế ở hiện trường.
*   `CHUA_XU_LY` / `DA_XU_LY`: Trạng thái xử lý chung của bộ phận Điều hành.

### Luồng giải trình của HDV:

| Trạng thái gốc | Hành động | Trạng thái đích | Tác nhân | Ghi chú |
|---|---|---|---|---|
| `CHUA_XU_LY` | Gửi yêu cầu giải trình cho HDV | `CHO_GIAI_TRINH` | NV Điều hành | Kích hoạt khi khách khiếu nại về dịch vụ/sự cố |
| `CHO_GIAI_TRINH` | HDV nộp báo cáo giải trình | `CHUA_XU_LY` | HDV | HDV gửi tường trình thực tế thông qua app nghiệp vụ |
