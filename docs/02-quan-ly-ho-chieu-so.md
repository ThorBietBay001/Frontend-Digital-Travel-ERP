# Phân hệ Quản lý Hộ chiếu số

## 3.2.6. Xem thông tin hồ sơ số
**Bảng 3.23: Đặc tả Use-case Xem thông tin hồ sơ số**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC21 |
| Tên Use-case | Xem thông tin hồ sơ số |
| Tác nhân | Khách hàng |
| Mô tả | Cho phép khách hàng xem toàn bộ thông tin trong hồ sơ du lịch điện tử của mình, theo dõi hạng thành viên, điểm thưởng xanh và tóm tắt lịch sử các chuyến đi. |
| Tiền điều kiện | - Khách hàng đã đăng nhập thành công. |
| Hậu điều kiện | - Hệ thống hiển thị thành công thông tin tổng quan hồ sơ cá nhân của khách hàng. |
| Luồng sự kiện chính | 1. Khách hàng truy cập vào khu vực cá nhân và chọn mục "Hộ chiếu số" trên thanh menu.<br>2. Hệ thống truy xuất dữ liệu từ CSDL và hiển thị trang tổng quan gồm:<br>   - Thông tin cá nhân (Họ tên, ngày sinh, giới tính, số CCCD/Passport)<br>   - Thông tin liên lạc (SĐT, Email, Địa chỉ)<br>   - Hạng thành viên hiện tại và điểm thưởng xanh<br>   - Thông tin sức khỏe, dị ứng (nếu có)<br>3. Khách hàng có thể chọn thao tác tiếp theo:<br>   - Nếu chọn "Xem tất cả lịch sử": Hệ thống thực thi UC22.<br>   - Nếu chọn "Chỉnh sửa hồ sơ": Hệ thống thực thi UC23.<br>   - Nếu chọn "Ví ưu đãi": Hệ thống thực thi UC31.<br>4. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Khách hàng thoát khỏi mục “Hộ chiếu số”. Use case dừng lại. |

## 3.2.6.1. Xem chi tiết lịch sử hành trình
**Bảng 3.24: Đặc tả Use-case Xem chi tiết lịch sử hành trình**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC22 |
| Tên Use-case | Xem chi tiết lịch sử hành trình |
| Tác nhân | Khách hàng |
| Mô tả | Cho phép khách hàng xem danh sách đầy đủ các chuyến đi đã, đang và sắp thực hiện, đồng thời tra cứu chi tiết từng đơn đặt tour. |
| Tiền điều kiện | - Khách hàng đã đăng nhập và đang ở trang hồ sơ số (UC21). |
| Hậu điều kiện | - Hệ thống hiển thị chi tiết thông tin chuyến đi được chọn. |
| Luồng sự kiện chính | 1. Hệ thống truy vấn CSDL và hiển thị danh sách toàn bộ các chuyến đi của khách hàng, phân loại theo các tab: "Sắp khởi hành", "Đã hoàn thành", "Đã hủy".<br>2. Khách hàng nhấn chọn vào một Card chuyến đi cụ thể trong danh sách.<br>3. Hệ thống hiển thị chi tiết đơn hàng: Lịch trình, HDV, chi phí, mã vé QR.<br>4. Tại giao diện chi tiết, khách hàng có thể chọn các thao tác:<br>   - Nếu tour chưa khởi hành, chọn "Hủy tour": Hệ thống thực thi UC32.<br>   - Nếu tour đã hoàn thành, chọn "Đánh giá": Hệ thống thực thi UC35.<br>   - Nếu chọn "Khiếu nại": Hệ thống thực thi UC36.<br>5. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Khách hàng thoát khỏi tab thông tin chi tiết chuyến đi. Use case dừng lại. |

## 3.2.7. Cập nhật hồ sơ số
**Bảng 3.25: Đặc tả Use-case Cập nhật hồ sơ số**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC23 |
| Tên Use-case | Cập nhật hồ sơ số |
| Tác nhân | Khách hàng |
| Mô tả | Cho phép khách hàng chỉnh sửa, bổ sung các thông tin cá nhân, liên lạc và cập nhật tình trạng sức khỏe vào hồ sơ. |
| Tiền điều kiện | - Khách hàng đã đăng nhập và đang ở trang hồ sơ số (UC21). |
| Hậu điều kiện | - Dữ liệu cá nhân mới của khách hàng được cập nhật thành công vào hệ thống. |
| Luồng sự kiện chính | 1. Khách hàng nhấn nút "Chỉnh sửa hồ sơ" tại trang thông tin hồ sơ số.<br>2. Hệ thống hiển thị biểu mẫu chỉnh sửa thông tin. Các dữ liệu cũ đã được điền sẵn vào ô nhập liệu.<br>3. Khách hàng thay đổi thông tin (SĐT, Email, Tình trạng sức khỏe) và nhấn nút "Lưu thay đổi".<br>4. Hệ thống kiểm tra tính hợp lệ của các dữ liệu vừa nhập (định dạng email, độ dài SĐT).<br>5. Hệ thống tạo và gửi một mã OTP về SĐT của khách hàng.<br>6. Khách hàng kiểm tra và nhập mã OTP vào hộp thoại xác thực trên hệ thống.<br>7. Hệ thống đối chiếu mã OTP hợp lệ, tiến hành lưu dữ liệu vào CSDL, hiển thị thông báo "Cập nhật thành công".<br>8. Hệ thống tự động đóng biểu mẫu và trả luồng về trang tổng quan của UC21. |
| Luồng sự kiện phụ | 3a. Nếu khách hàng hủy thao tác, hệ thống hủy bỏ toàn bộ dữ liệu tạm và quay lại trang tổng quan hộ chiếu số. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 3a. Nếu thông tin nhập vào không đúng định dạng: Hệ thống hiển thông báo và yêu cầu thử lại.<br>6a. Nếu khách hàng nhập sai OTP, hệ thống từ chối cập nhật thông tin mới và yêu cầu khách hàng thực hiện gửi lại mã hoặc thử lại sau.<br>7a. Nếu xảy ra lỗi khi lưu dữ liệu, hệ thống hiển thị thông báo lỗi và yêu cầu thử lại. |

## 3.2.8. Tra cứu khách hàng 
**Bảng 3.26: Đặc tả Use-case Tra cứu khách hàng**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC24 |
| Tên Use-case | Tra cứu khách hàng |
| Tác nhân | Nhân viên |
| Mô tả | Cho phép nhân viên tìm kiếm và xem hồ sơ của khách hàng và đơn hàng tương ứng để hỗ trợ các nghiệp vụ liên quan. |
| Tiền điều kiện | - Nhân viên đã đăng nhập thành công vào hệ thống quản trị nội bộ và được cấp quyền truy cập phân hệ "Quản lý khách hàng". |
| Hậu điều kiện | - Hệ thống hiển thị danh sách kết quả hoặc chi tiết hồ sơ của khách hàng được tìm kiếm. Trạng thái dữ liệu của hệ thống không thay đổi (chỉ xem, không ghi đè). |
| Luồng sự kiện chính | 1. Nhân viên truy cập phân hệ "Quản lý khách hàng", nhập thông tin (SĐT, Email, CCCD) vào thanh tìm kiếm.<br>2. Hệ thống truy vấn CSDL.<br>3. Hệ thống hiển thị hồ sơ khách hàng gồm: tên, hạng thẻ, điểm xanh, lịch sử đơn hàng, khiếu nại.<br>4. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 2a. Nếu không có khách hàng nào thỏa yêu cầu tìm kiếm, hệ thống thông báo không tìm thấy và yêu cầu thử lại. |
