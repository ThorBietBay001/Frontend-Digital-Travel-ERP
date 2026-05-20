# Phân hệ Quản trị Hệ thống

## 8.1. Quản lý truy cập tài khoản (Authentication)

### 8.1.1. Quản lý truy cập tài khoản (Overview)
**Bảng 8.1: Đặc tả Use-case Quản lý truy cập tài khoản**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC55 |
| Tên Use-case | Quản lý truy cập tài khoản (Overview) |
| Tác nhân | Khách hàng, Người dùng hệ thống |
| Mô tả | Use-case tổng quan cho phép người dùng đăng ký, đăng nhập, đăng xuất và khôi phục mật khẩu. |
| Tiền điều kiện | - Người dùng có thiết bị kết nối Internet. |
| Hậu điều kiện | - Trạng thái truy cập của người dùng được xác thực và cập nhật. |
| Luồng sự kiện chính | 1. Người dùng truy cập hệ thống.<br>2. Chọn chức năng tương ứng (Đăng ký/Đăng nhập/Quên mật khẩu).<br>3. Nhập thông tin yêu cầu.<br>4. Hệ thống xác thực thông tin.<br>5. Chuyển hướng người dùng đến giao diện phù hợp dựa trên vai trò.<br>6. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Không có. |

### 8.1.2. Đăng ký khách hàng mới
**Bảng 8.2: Đặc tả Use-case Đăng ký khách hàng mới**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC56 |
| Tên Use-case | Đăng ký khách hàng mới |
| Tác nhân | Khách hàng |
| Mô tả | Khách hàng tạo tài khoản mới để sử dụng các dịch vụ tìm kiếm và đặt tour trên hệ thống. |
| Tiền điều kiện | - Khách hàng chưa đăng nhập và chưa có tài khoản trên hệ thống. |
| Hậu điều kiện | - Một tài khoản khách hàng mới được tạo và lưu vào CSDL. |
| Luồng sự kiện chính | 1. Khách hàng chọn "Đăng ký".<br>2. Nhập các thông tin: Email, Username, Mật khẩu, Nhập lại mật khẩu, SĐT, Địa chỉ.<br>3. Nhấn nút "Đăng ký".<br>4. Hệ thống kiểm tra thông tin hợp lệ, tạo và gửi mã OTP về Email.<br>5. Khách hàng kiểm tra Email, nhập mã OTP và nhấn "Xác thực".<br>6. Hệ thống mã hoá mật khẩu, lưu thông tin tài khoản vào CSDL.<br>7. Hiển thị thông báo "Đăng ký thành công" và chuyển hướng đến trang đăng nhập.<br>8. Kết thúc use case. |
| Luồng sự kiện phụ | 5a. Nhập sai OTP: Cho phép nhập lại tối đa 5 lần.<br>5b. Gửi lại OTP: Khách hàng yêu cầu gửi lại, hệ thống tạo OTP mới và gửi lại email. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 4a. Email tồn tại: Hệ thống báo lỗi email đã được sử dụng và yêu cầu nhập email khác. |

### 8.1.3. Đăng nhập
**Bảng 8.3: Đặc tả Use-case Đăng nhập**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC57 |
| Tên Use-case | Đăng nhập |
| Tác nhân | Tất cả người dùng |
| Mô tả | Cho phép người dùng truy cập vào hệ thống bằng tài khoản đã được xác thực. |
| Tiền điều kiện | - Người dùng đã có tài khoản và đã xác nhận email. |
| Hậu điều kiện | - Phiên đăng nhập (Session) được tạo, người dùng được cấp quyền truy cập theo vai trò. |
| Luồng sự kiện chính | 1. Chọn "Đăng nhập".<br>2. Nhập Email/Username và Mật khẩu.<br>3. Nhấn "Đăng nhập".<br>4. Hệ thống đối chiếu thông tin với CSDL.<br>5. Xác thực thành công, hệ thống tạo phiên (Session/Token).<br>6. Chuyển hướng người dùng đến Dashboard (nhân viên) hoặc Trang chủ (khách hàng).<br>7. Kết thúc use case. |
| Luồng sự kiện phụ | 2a. Quên mật khẩu: Khách hàng nhấn "Quên mật khẩu", hệ thống chuyển sang UC59. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 4a. Sai thông tin: Sai tên đăng nhập hoặc mật khẩu, hệ thống báo lỗi và yêu cầu nhập lại. |

### 8.1.4. Đăng xuất
**Bảng 8.4: Đặc tả Use-case Đăng xuất**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC58 |
| Tên Use-case | Đăng xuất |
| Tác nhân | Tất cả người dùng |
| Mô tả | Người dùng chấm dứt phiên làm việc hiện tại và thoát khỏi hệ thống. |
| Tiền điều kiện | - Người dùng đang trong trạng thái đăng nhập. |
| Hậu điều kiện | - Phiên làm việc bị hủy, yêu cầu đăng nhập lại cho lần truy cập tiếp theo. |
| Luồng sự kiện chính | 1. Người dùng vào Menu tài khoản và chọn "Đăng xuất".<br>2. Hệ thống hủy phiên (Session), xóa Token/Cookie trên trình duyệt.<br>3. Hệ thống ghi log thời gian đăng xuất.<br>4. Chuyển hướng người dùng về trang đăng nhập hoặc trang chủ khách khách.<br>5. Kết thúc use case. |
| Luồng sự kiện phụ | 1a. Đăng xuất mọi thiết bị: Người dùng chọn tùy chọn này trong cài đặt, hệ thống hủy toàn bộ phiên đăng nhập của tài khoản trên tất cả thiết bị. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Không có. |

### 8.1.5. Quên mật khẩu
**Bảng 8.5: Đặc tả Use-case Quên mật khẩu**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC59 |
| Tên Use-case | Quên mật khẩu |
| Tác nhân | Người dùng |
| Mô tả | Hỗ trợ người dùng khôi phục lại mật khẩu truy cập khi bị quên thông qua xác thực Email. |
| Tiền điều kiện | - Người dùng không thể đăng nhập do quên mật khẩu. |
| Hậu điều kiện | - Mật khẩu mới được thiết lập và lưu vào CSDL. |
| Luồng sự kiện chính | 1. Người dùng chọn "Quên mật khẩu" tại màn hình đăng nhập.<br>2. Nhập địa chỉ Email đã đăng ký và gửi yêu cầu.<br>3. Hệ thống kiểm tra Email hợp lệ, sinh mã OTP và gửi đến Email đó.<br>4. Người dùng nhập mã OTP và Mật khẩu mới, sau đó nhấn "Xác nhận".<br>5. Hệ thống xác thực OTP hợp lệ.<br>6. Mã hóa mật khẩu mới và cập nhật vào CSDL.<br>7. Hiển thị thông báo thành công và chuyển về trang đăng nhập.<br>8. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 3a. Email không tồn tại: Báo lỗi không tìm thấy tài khoản.<br>5a. OTP không hợp lệ: OTP sai quá 5 lần hoặc hết hạn, hệ thống hủy quy trình khôi phục. |

### 8.1.6. Đổi mật khẩu
**Bảng 8.6: Đặc tả Use-case Đổi mật khẩu**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC60 |
| Tên Use-case | Đổi mật khẩu |
| Tác nhân | Người dùng đã đăng nhập |
| Mô tả | Người dùng chủ động thay đổi mật khẩu tài khoản để đảm bảo an toàn bảo mật. |
| Tiền điều kiện | - Người dùng đang đăng nhập vào hệ thống. |
| Hậu điều kiện | - Mật khẩu được cập nhật thành công. |
| Luồng sự kiện chính | 1. Người dùng vào mục "Cài đặt tài khoản" và chọn "Đổi mật khẩu".<br>2. Nhập Mật khẩu hiện tại, Mật khẩu mới và Nhập lại mật khẩu mới.<br>3. Hệ thống kiểm tra mật khẩu hiện tại.<br>4. Hệ thống gửi Email chứa mã OTP xác nhận thao tác.<br>5. Người dùng nhập mã OTP.<br>6. Hệ thống xác thực, cập nhật mật khẩu mới vào CSDL.<br>7. Hiển thị thông báo thành công.<br>8. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 3a. Sai mật khẩu cũ: Báo lỗi và yêu cầu nhập lại.<br>6a. Sai OTP quá số lần quy định: Hủy thao tác đổi mật khẩu. |

## 8.2. Quản lý tài khoản người dùng (Admin)

### 8.2.1. Quản lý tài khoản người dùng
**Bảng 8.7: Đặc tả Use-case Quản lý tài khoản người dùng (Overview)**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC61 |
| Tên Use-case | Quản lý tài khoản người dùng |
| Tác nhân | Quản trị viên (Admin) |
| Mô tả | Giao diện trung tâm cho phép Admin theo dõi và quản lý danh sách toàn bộ người dùng trong hệ thống (nhân viên, khách hàng). |
| Tiền điều kiện | - Quản trị viên đã đăng nhập và có quyền "Quản trị hệ thống". |
| Hậu điều kiện | - Hiển thị danh sách tài khoản chính xác theo dữ liệu. |
| Luồng sự kiện chính | 1. Quản trị viên truy cập module "Quản lý tài khoản người dùng".<br>2. Hệ thống hiển thị danh sách dạng bảng (Mã NV/KH, Họ tên, Email, Vai trò, Trạng thái).<br>3. Quản trị viên có thể chọn các thao tác: Tìm kiếm (UC66), Thêm mới (UC62), Cập nhật năng lực (UC63), Khóa/Mở/Xóa (UC64, UC65), Phân quyền (UC67).<br>4. Hệ thống thực thi các usecase tương ứng.<br>5. Sau khi thao tác hoàn tất, load lại danh sách mới nhất.<br>6. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Không có. |

### 8.2.2. Tạo tài khoản nhân viên
**Bảng 8.8: Đặc tả Use-case Tạo tài khoản nhân viên**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC62 |
| Tên Use-case | Tạo tài khoản nhân viên |
| Tác nhân | Quản trị viên |
| Mô tả | Quản trị viên khởi tạo tài khoản truy cập hệ thống nội bộ cho nhân viên mới. |
| Tiền điều kiện | - Đang ở giao diện Quản lý tài khoản người dùng. |
| Hậu điều kiện | - Tài khoản nhân viên mới được tạo và email thông báo được gửi đi. |
| Luồng sự kiện chính | 1. Quản trị viên nhấn nút "Thêm mới".<br>2. Hệ thống hiển thị form nhập liệu.<br>3. Quản trị viên điền các thông tin: Họ tên, Email công ty, Username, SĐT, Vai trò khởi tạo.<br>4. Nhấn "Lưu lại".<br>5. Hệ thống kiểm tra dữ liệu hợp lệ, tự động sinh mật khẩu ngẫu nhiên.<br>6. Lưu bản ghi vào CSDL.<br>7. Gửi mật khẩu qua email nội bộ cho nhân viên.<br>8. Hiển thị thông báo thành công và load lại danh sách.<br>9. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 5a. Trùng lặp dữ liệu: Email hoặc Username đã tồn tại, hệ thống báo lỗi và yêu cầu đổi thông tin khác. |

### 8.2.3. Cập nhật năng lực nhân viên
**Bảng 8.9: Đặc tả Use-case Cập nhật năng lực nhân viên**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC63 |
| Tên Use-case | Cập nhật năng lực nhân viên |
| Tác nhân | Quản trị viên |
| Mô tả | Quản trị viên cập nhật thông tin về ngoại ngữ, chứng chỉ chuyên môn, thế mạnh của nhân viên nhằm phục vụ công tác điều phối tour. |
| Tiền điều kiện | - Đang ở giao diện quản lý chi tiết của một nhân viên. |
| Hậu điều kiện | - Thông tin năng lực của nhân viên được cập nhật vào CSDL. |
| Luồng sự kiện chính | 1. Quản trị viên chọn một nhân viên và chuyển sang tab "Quản lý năng lực".<br>2. Hệ thống hiển thị danh sách các năng lực/chứng chỉ hiện tại.<br>3. Quản trị viên nhấn "Thêm/Sửa năng lực".<br>4. Nhập loại ngôn ngữ, cấp độ chứng chỉ hoặc mô tả thế mạnh.<br>5. Nhấn "Lưu thay đổi".<br>6. Hệ thống ghi nhận vào CSDL và thông báo thành công.<br>7. Kết thúc use case. |
| Luồng sự kiện phụ | 3a. Xóa chứng chỉ: Quản trị viên chọn một chứng chỉ cũ và nhấn xóa. Hệ thống cập nhật loại bỏ. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Không có. |

### 8.2.4. Xóa/Khóa tài khoản
**Bảng 8.10: Đặc tả Use-case Xóa/Khóa tài khoản**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC64 |
| Tên Use-case | Xóa/Khóa tài khoản |
| Tác nhân | Quản trị viên |
| Mô tả | Quản trị viên vô hiệu hóa (Khóa) hoặc loại bỏ hoàn toàn (Xóa) tài khoản khỏi hệ thống khi nhân viên nghỉ việc hoặc vi phạm. |
| Tiền điều kiện | - Quản trị viên đang xem danh sách tài khoản. |
| Hậu điều kiện | - Tài khoản bị thay đổi trạng thái thành "Khóa" hoặc bị xóa vĩnh viễn khỏi CSDL. |
| Luồng sự kiện chính | 1. Quản trị viên chọn một tài khoản cụ thể.<br>2. Nhấn chọn nút "Khóa" hoặc "Xóa".<br>3. Hệ thống hiển thị hộp thoại xác nhận cảnh báo.<br>4. Quản trị viên nhấn "Xác nhận".<br>5. Hệ thống kiểm tra các ràng buộc dữ liệu.<br>6. Thực hiện đổi trạng thái (Locked) hoặc xóa cứng bản ghi trong CSDL.<br>7. Thông báo thành công.<br>8. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 5a. Lỗi ràng buộc dữ liệu khi xóa: Nếu tài khoản nhân viên/khách hàng đang liên kết với các giao dịch, đơn đặt tour hoặc tour đang chạy, hệ thống chặn hành động Xóa, hiển thị cảnh báo và gợi ý chuyển sang hành động "Khóa". |

### 8.2.5. Mở khoá tài khoản
**Bảng 8.11: Đặc tả Use-case Mở khóa tài khoản**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC65 |
| Tên Use-case | Mở khóa tài khoản |
| Tác nhân | Quản trị viên |
| Mô tả | Khôi phục lại quyền truy cập cho một tài khoản đang bị khóa. |
| Tiền điều kiện | - Có ít nhất một tài khoản ở trạng thái "Locked". |
| Hậu điều kiện | - Trạng thái tài khoản chuyển thành "Active". |
| Luồng sự kiện chính | 1. Quản trị viên lọc danh sách các tài khoản bị khóa.<br>2. Chọn tài khoản cần xử lý và nhấn "Mở khóa".<br>3. Hệ thống yêu cầu xác nhận.<br>4. Quản trị viên xác nhận thao tác.<br>5. Hệ thống thay đổi trạng thái tài khoản thành "Active" trong CSDL.<br>6. Hiển thị thông báo thành công.<br>7. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Không có. |

### 8.2.6. Tìm kiếm tài khoản
**Bảng 8.12: Đặc tả Use-case Tìm kiếm tài khoản**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC66 |
| Tên Use-case | Tìm kiếm tài khoản |
| Tác nhân | Quản trị viên |
| Mô tả | Hỗ trợ admin tra cứu nhanh chóng một hoặc nhiều tài khoản theo tiêu chí cụ thể. |
| Tiền điều kiện | - Quản trị viên đang ở giao diện danh sách tài khoản. |
| Hậu điều kiện | - Hiển thị danh sách kết quả phù hợp. |
| Luồng sự kiện chính | 1. Quản trị viên nhập thông tin vào thanh tìm kiếm hoặc sử dụng bộ lọc (Mã, Họ tên, Email, SĐT, Trạng thái).<br>2. Hệ thống truy vấn CSDL dựa trên tiêu chí.<br>3. Hệ thống trả về và hiển thị danh sách tài khoản phù hợp lên màn hình.<br>4. Kết thúc use case. |
| Luồng sự kiện phụ | 3a. Không tìm thấy: Hiển thị thông báo "Không có tài khoản nào phù hợp" và gợi ý làm mới bộ lọc. |
| Luồng sự kiện lỗi hoặc ngoại lệ | Không có. |

## 8.3. Phân quyền và Giám sát

### 8.3.1. Phân quyền truy cập
**Bảng 8.13: Đặc tả Use-case Phân quyền truy cập**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC67 |
| Tên Use-case | Phân quyền truy cập |
| Tác nhân | Quản trị viên |
| Mô tả | Gán các vai trò (Role) và quyền hạn (Permission) cụ thể cho tài khoản nhân viên, kiểm soát quyền truy cập của họ đối với từng phân hệ trên ERP. |
| Tiền điều kiện | - Quản trị viên có đủ thẩm quyền phân quyền. |
| Hậu điều kiện | - Ma trận phân quyền của nhân viên được cập nhật, áp dụng ngay ở lần đăng nhập tiếp theo. |
| Luồng sự kiện chính | 1. Quản trị viên chọn một tài khoản nhân viên và nhấn nút "Phân quyền".<br>2. Hệ thống hiển thị danh sách các vai trò (Role) và chi tiết các quyền hạn chức năng (Read, Write, Delete).<br>3. Quản trị viên xem xét và tích chọn/bỏ chọn các quyền hạn hoặc gán vai trò mới.<br>4. Nhấn "Lưu thiết lập".<br>5. Hệ thống cập nhật bảng phân quyền trong CSDL.<br>6. Hiển thị thông báo cập nhật thành công.<br>7. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 1a. Thiếu thẩm quyền: Nếu admin hiện tại không được cấp phép thực hiện phân quyền, hệ thống chặn thao tác và báo lỗi từ chối truy cập. |

### 8.3.2. Xem nhật ký hệ thống
**Bảng 8.14: Đặc tả Use-case Xem nhật ký hệ thống**

| Mục | Nội dung |
|---|---|
| Mã Use-case | UC68 |
| Tên Use-case | Xem nhật ký hệ thống |
| Tác nhân | Quản trị viên |
| Mô tả | Tra cứu lịch sử hoạt động của người dùng (Audit Trail) và các lỗi hệ thống để giám sát bảo mật, phục vụ truy vết khi có sự cố. |
| Tiền điều kiện | - Quản trị viên có quyền xem log hệ thống. |
| Hậu điều kiện | - Danh sách bản ghi log được hiển thị chính xác. |
| Luồng sự kiện chính | 1. Quản trị viên truy cập module "Nhật ký hệ thống".<br>2. Cấu hình các bộ lọc: Khoảng thời gian, Người dùng, Loại hành động (CRUD, Login), Mức độ (Info, Warning, Error).<br>3. Nhấn "Tìm kiếm".<br>4. Hệ thống truy xuất dữ liệu từ bảng Log.<br>5. Hiển thị danh sách kết quả (Thời gian, User, Action, IP, Trạng thái).<br>6. Quản trị viên có thể nhấn xem chi tiết payload của từng log.<br>7. Kết thúc use case. |
| Luồng sự kiện phụ | Không có. |
| Luồng sự kiện lỗi hoặc ngoại lệ | 1a. Từ chối truy cập: Nếu quản trị viên không đủ thẩm quyền, hệ thống báo lỗi không có quyền truy cập chức năng này. |