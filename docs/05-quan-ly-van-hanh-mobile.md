# Phân hệ Quản lý Vận hành Tour Thực tế (Mobile PWA)

> **Ghi chú kỹ thuật (Architecture Note) dành cho Frontend Dev:** 
> Phân hệ này được phát triển dưới dạng **PWA (Progressive Web App)** chạy trực tiếp trên trình duyệt thiết bị di động của Hướng dẫn viên. Để đáp ứng các Use-case tương tác thực địa, team Dev cần chủ động chuẩn bị các phương án sử dụng HTML5 API / Web API của trình duyệt:
> 
> *   **Camera API (getUserMedia):** Truy cập camera thiết bị để phục vụ các thao tác: Quét mã QR vé điện tử để điểm danh (UC41) [3], Chụp ảnh minh chứng xác nhận hành động xanh (UC42) [4], và Chụp ảnh hóa đơn chứng từ để hệ thống chạy AI OCR (UC44) [5].
> 
> *Lưu ý: Vì chạy trên trình duyệt web, cần thiết kế luồng thông báo xin cấp quyền (Request Permissions) truy cập Camera một cách rõ ràng, mượt mà trước khi thực thi các Use-case trên.*

## 5.1. Quản lý lịch trình và hành khách

### 5.1.1. Xem lịch trình và thông tin đoàn
**Bảng 5.1: Đặc tả Use-case Xem lịch trình và thông tin đoàn**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC40 |
| Tên Use-case | Xem lịch trình và thông tin đoàn |
| Tác nhân | Hướng dẫn viên (HDV) |
| Mô tả | Xem chi tiết lịch trình của tour được phân công và danh sách khách hàng trong đoàn kèm các thông tin cần thiết. |
| Tiền điều kiện | - HDV đã đăng nhập vào hệ thống và được phân công tour (có lệnh điều động). |
| Hậu điều kiện | - Hiển thị thông tin thành công. Không thay đổi dữ liệu trên hệ thống. |
| Luồng sự kiện chính | 1. HDV chọn tour từ danh sách được phân công.<br>2. Hệ thống hiển thị thông tin tổng quan (Tên tour, mã tour, ngày khởi hành, điểm đến).<br>3. HDV chọn tab "Lịch trình" để xem chi tiết hoạt động theo ngày, địa điểm, thực đơn.<br>4. HDV chọn tab "Danh sách đoàn" để xem danh sách khách kèm cảnh báo đặc biệt (nếu có).<br>5. HDV nhấn vào một khách hàng để xem chi tiết (SĐT, lưu ý y tế, dị ứng).<br>6. Đóng thông tin và trở về danh sách.<br>7. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Lỗi tải dữ liệu: Báo lỗi mạng và hiển thị nút thử lại. |

### 5.1.2. Điểm danh khách hàng
**Bảng 5.2: Đặc tả Use-case Điểm danh khách hàng**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC41 |
| Tên Use-case | Điểm danh khách hàng |
| Tác nhân | HDV |
| Mô tả | Xác nhận sự có mặt của khách hàng tại điểm hẹn, ghi nhận thời gian thực tế và các lưu ý cá nhân. |
| Tiền điều kiện | - Chuyến đi đang ở trạng thái "Sắp khởi hành" hoặc "Đang diễn ra". |
| Hậu điều kiện | - Trạng thái của khách hàng được cập nhật thành "Đã điểm danh". |
| Luồng sự kiện chính | 1. HDV chọn chuyến đi, nhấn "Bắt đầu điểm danh".<br>2. Nhập thời gian, địa điểm điểm danh.<br>3. HDV chọn quét mã QR bằng camera thiết bị.<br>4. Quét vé điện tử của khách hàng. Hệ thống tự động đánh dấu "Đã điểm danh".<br>5. HDV nhấn "Kết thúc điểm danh".<br>6. Hệ thống hiển thị hộp thoại tổng kết (Đã điểm danh X/Y người).<br>7. Nếu khách có lưu ý y tế, hiển thị Pop-up bắt buộc HDV nhấn "Đã xem và xác nhận".<br>8. Hoàn tất điểm danh và kết thúc use case. |
| Luồng sự kiện phụ | 3a. Điểm danh thủ công: HDV tìm kiếm bằng tên/SĐT và check box thủ công.<br>3b. Khách vắng mặt: Đánh dấu "Vắng mặt", nhập lý do. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 4a. Lỗi đọc QR: Do camera mờ hoặc mã hỏng, hệ thống cảnh báo và chuyển sang chế độ làm thủ công. |

## 5.2. Vận hành và xử lý sự cố

### 5.2.1. Xác nhận hành động xanh
**Bảng 5.3: Đặc tả Use-case Xác nhận hành động xanh**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC42 |
| Tên Use-case | Xác nhận hành động xanh |
| Tác nhân | HDV |
| Mô tả | Xác minh và ghi nhận các hành động bảo vệ môi trường mà du khách thực hiện để tự động cộng điểm thưởng xanh vào Hộ chiếu số. |
| Tiền điều kiện | - Chuyến đi "Đang diễn ra", khách hàng đã được điểm danh. |
| Hậu điều kiện | - Điểm thưởng xanh được cộng vào tài khoản khách hàng. |
| Luồng sự kiện chính | 1. HDV vào tab "Hành động xanh".<br>2. Chọn khách hàng (quét QR hoặc chọn thủ công).<br>3. Hệ thống hiển thị danh mục các hành động xanh khả dụng.<br>4. Chọn hành động khách đã thực hiện.<br>5. Chụp ảnh minh chứng thực tế bằng camera (nếu được yêu cầu).<br>6. Nhấn "Gửi xác nhận".<br>7. Hệ thống tự động tính và cộng điểm vào Hộ chiếu số.<br>8. Gửi thông báo đến tài khoản của khách hàng.<br>9. Kết thúc use case. |
| Luồng sự kiện phụ | 2a. Xác nhận hàng loạt: Chọn nhiều khách, chọn 1 hành động chung, chụp 1 ảnh minh chứng tổng thể để hệ thống tự chia điểm. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Lỗi tải danh mục / tải ảnh: Hệ thống báo lỗi và cho phép thử lại. |

### 5.2.2. Báo cáo sự cố
**Bảng 5.4: Đặc tả Use-case Báo cáo sự cố**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC43 |
| Tên Use-case | Báo cáo sự cố |
| Tác nhân | HDV |
| Mô tả | Báo cáo diễn biến sự cố, cách xử lý tại hiện trường và đính kèm bằng chứng để phục vụ quá trình hậu kiểm. |
| Tiền điều kiện | - HDV đã đăng nhập và đang quản lý chuyến đi "Đang diễn ra". |
| Hậu điều kiện | - Báo cáo sự cố được lưu và thông báo cho bộ phận điều hành (nếu mức độ nghiêm trọng). |
| Luồng sự kiện chính | 1. HDV mở form "Báo cáo tổng kết & Sự cố".<br>2. Chọn loại sự cố và mức độ (Thấp/Cao).<br>3. Nhập chi tiết diễn biến sự cố, cách xử lý và kết quả hiện tại.<br>4. Đính kèm hình ảnh hoặc video tại hiện trường.<br>5. Nhấn "Hoàn tất báo cáo".<br>6. Hệ thống ghi nhận vào CSDL.<br>7. Nếu sự cố mức độ "Cao", tự động gửi cảnh báo khẩn đến bộ phận quản lý.<br>8. Kết thúc use case. |
| Luồng sự kiện phụ | 2a. Sự cố y tế cá nhân: Chọn khách hàng cụ thể để hệ thống đính kèm hồ sơ y tế vào báo cáo. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 5a. Thiếu trường bắt buộc (hoặc lỗi tải ảnh): Hệ thống cảnh báo đỏ và yêu cầu bổ sung thông tin. |

### 5.2.3. Cập nhật chi phí thực tế
**Bảng 5.5: Đặc tả Use-case Cập nhật chi phí thực tế**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC44 |
| Tên Use-case | Cập nhật chi phí thực tế |
| Tác nhân | HDV |
| Mô tả | Cập nhật các khoản chi tiêu phát sinh thực tế (kèm hình ảnh hóa đơn) và đẩy về cho bộ phận Kế toán. |
| Tiền điều kiện | - Chuyến đi đang diễn ra hoặc vừa kết thúc (trong vòng 24h). |
| Hậu điều kiện | - Khoản chi phí được lưu ở trạng thái "Chờ duyệt" để kế toán xử lý. |
| Luồng sự kiện chính | 1. HDV truy cập tab "Quản lý chi phí" và nhấn "Thêm chi phí mới".<br>2. Nhập Hạng mục chi, Số tiền và Ghi chú.<br>3. Sử dụng camera để chụp ảnh hóa đơn/chứng từ.<br>4. Hệ thống chạy ngầm AI OCR để nhận dạng văn bản và đối chiếu số tiền.<br>5. HDV rà soát thông tin và nhấn "Lưu chi phí".<br>6. Hệ thống gửi dữ liệu về ERP kế toán với trạng thái "Chờ duyệt".<br>7. Kết thúc use case. |
| Luồng sự kiện phụ | Sửa/Xóa chi phí: HDV có thể chỉnh sửa khoản chi nếu tour chưa được kế toán quyết toán. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 2a. Nhập sai định dạng số tiền (âm, có chữ): Hệ thống cảnh báo lỗi và yêu cầu nhập lại. |