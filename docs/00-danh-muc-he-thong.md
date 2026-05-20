# Danh mục Hệ thống, Actor và Use-case

Tài liệu này tổng hợp toàn bộ danh sách các tác nhân (Actor) và các ca sử dụng (Use-case) của hệ thống Digital Travel ERP, đóng vai trò như một bản đồ tra cứu chung cho các phân hệ nghiệp vụ.

## 1. Danh sách Tác nhân (Actor)

Hệ thống được thiết kế với 10 Actor chính tham gia vào các quá trình vận hành:

| STT | Tên Actor | Mô tả |
|---|---|---|
| 1 | Khách hàng | Người sử dụng cuối của hệ thống, thực hiện tra cứu, đặt tour, thanh toán, quản lý Hộ chiếu số và tương tác với dịch vụ sau bán hàng. |
| 2 | Nhân viên | Tác nhân tổng quát đại diện cho tất cả nhân viên công ty, có chức năng đăng nhập và sử dụng hệ thống nội bộ. |
| 3 | Nhân viên sản phẩm | Nhân viên bộ phận sản phẩm, chịu trách nhiệm xây dựng tour mẫu, lịch trình, quản lý danh mục dịch vụ và định mức giá sàn. |
| 4 | Nhân viên kinh doanh | Nhân viên bộ phận kinh doanh, quản lý đơn hàng, tư vấn khách hàng, quản lý voucher và chương trình khuyến mãi. |
| 5 | Nhân viên điều hành | Nhân viên bộ phận điều hành, quản lý quỹ chỗ, phân bổ HDV, xử lý sự cố và giám sát vận hành tour. |
| 6 | Hướng dẫn viên (HDV) | Nhân viên hiện trường, sử dụng ứng dụng di động để điểm danh, xác nhận hành động xanh, báo cáo sự cố và nhập chi phí. |
| 7 | Nhân viên kế toán | Nhân viên bộ phận tài chính, thực hiện đối soát thanh toán, quyết toán tour và trích xuất báo cáo tài chính. |
| 8 | Quản trị viên | Nhân viên kỹ thuật, quản lý tài khoản, phân quyền, cấu hình tham số hệ thống và giám sát bảo mật. |
| 9 | Cổng thanh toán (External System) | Hệ thống bên thứ ba xử lý các giao dịch thanh toán điện tử từ khách hàng. |
| 10 | Hệ thống Power BI (External System) | Hệ thống bên thứ ba tiếp nhận dữ liệu từ ERP để trực quan hóa và phân tích báo cáo. |

## 2. Danh sách 68 Use-case toàn hệ thống

Các Use-case được chia thành 8 tài liệu đặc tả (md) khác nhau. Dưới đây là danh sách tổng hợp:

### Phân hệ 1: Quản lý sản phẩm & Tour ([Xem chi tiết](01-quan-ly-san-pham-tour.md))
| Mã UC | Tên Use-case | Tác nhân chính |
|---|---|---|
| UC01 | Quản lý tour mẫu | Nhân viên sản phẩm |
| UC02 | Thêm mới tour mẫu | Nhân viên sản phẩm |
| UC03 | Sao chép tour mẫu | Nhân viên sản phẩm |
| UC04 | Sửa thông tin tour mẫu | Nhân viên sản phẩm |
| UC05 | Xóa tour mẫu | Nhân viên sản phẩm |
| UC06 | Tra cứu tour mẫu | Nhân viên sản phẩm |
| UC07 | Quản lý lịch trình tour | Nhân viên sản phẩm |
| UC08 | Thêm lịch trình tour | Nhân viên sản phẩm |
| UC09 | Sửa lịch trình tour | Nhân viên sản phẩm |
| UC10 | Quản lý tour thực tế | Nhân viên sản phẩm |
| UC11 | Khởi tạo tour thực tế từ tour mẫu | Nhân viên sản phẩm |
| UC12 | Xóa tour thực tế | Nhân viên sản phẩm |
| UC13 | Sửa tour thực tế | Nhân viên sản phẩm, NV kinh doanh |
| UC14 | Tra cứu tour thực tế | Nhân viên |
| UC15 | Quản lý dịch vụ bổ sung | Nhân viên sản phẩm, NV kế toán |
| UC16 | Thêm dịch vụ | Nhân viên sản phẩm |
| UC17 | Sửa thông tin dịch vụ | Nhân viên sản phẩm |
| UC18 | Xóa dịch vụ | Nhân viên sản phẩm |
| UC19 | Tra cứu dịch vụ | Nhân viên sản phẩm, NV kinh doanh |
| UC20 | Cấu hình hành động xanh cho tour | Nhân viên sản phẩm |

### Phân hệ 2: Quản lý Hộ chiếu số ([Xem chi tiết](02-quan-ly-ho-chieu-so.md))
| Mã UC | Tên Use-case | Tác nhân chính |
|---|---|---|
| UC21 | Xem thông tin hồ sơ số | Khách hàng |
| UC22 | Xem chi tiết lịch sử hành trình | Khách hàng |
| UC23 | Cập nhật hồ sơ số | Khách hàng |
| UC24 | Tra cứu khách hàng | Nhân viên |

### Phân hệ 3: Đặt tour & Thanh toán ([Xem chi tiết](03-dat-tour-va-thanh-toan.md))
| Mã UC | Tên Use-case | Tác nhân chính |
|---|---|---|
| UC25 | Tra cứu tour | Khách hàng |
| UC26 | Xem chi tiết tour | Khách hàng |
| UC27 | Đặt tour | Khách hàng |
| UC28 | Áp dụng voucher | Khách hàng |
| UC29 | Thanh toán đơn hàng | Khách hàng, Cổng thanh toán |
| UC30 | Quy đổi voucher | Khách hàng |
| UC31 | Xem danh sách voucher | Khách hàng |
| UC32 | Hủy tour | Khách hàng |
| UC33 | Hoàn tiền | Khách hàng |

### Phân hệ 4: Quản lý Điều phối & CSKH ([Xem chi tiết](04-quan-ly-dieu-phoi.md))
| Mã UC | Tên Use-case | Tác nhân chính |
|---|---|---|
| UC34 | Tra cứu đơn hàng | Nhân viên |
| UC35 | Đánh giá | Khách hàng |
| UC36 | Khiếu nại | Khách hàng |
| UC37 | Điều phối HDV | Nhân viên điều hành |
| UC38 | Tra cứu HDV | Nhân viên điều hành |
| UC39 | Giải quyết khiếu nại | Nhân viên điều hành |

### Phân hệ 5: Quản lý Vận hành Mobile ([Xem chi tiết](05-quan-ly-van-hanh-mobile.md))
| Mã UC | Tên Use-case | Tác nhân chính |
|---|---|---|
| UC40 | Xem lịch trình và thông tin đoàn | HDV |
| UC41 | Điểm danh khách hàng | HDV |
| UC42 | Xác nhận hành động xanh | HDV |
| UC43 | Báo cáo sự cố | HDV |
| UC44 | Cập nhật chi phí thực tế | HDV |

### Phân hệ 6: Quản lý Tài chính - Kế toán ([Xem chi tiết](06-quan-ly-tai-chinh.md))
| Mã UC | Tên Use-case | Tác nhân chính |
|---|---|---|
| UC45 | Tính lợi nhuận gộp | Nhân viên kế toán |
| UC46 | Xem cảnh báo chi phí | Nhân viên kế toán |
| UC47 | Phê duyệt chi phí thực tế | Nhân viên kế toán |
| UC48 | Quyết toán tour | Nhân viên kế toán |
| UC49 | Tra cứu tour cần quyết toán | Nhân viên kế toán |
| UC50 | Xử lý hoàn tiền | Nhân viên kế toán |

### Phân hệ 7: Quản lý Voucher & Khuyến mãi ([Xem chi tiết](07-quan-ly-voucher-khuyen-mai.md))
| Mã UC | Tên Use-case | Tác nhân chính |
|---|---|---|
| UC51 | Trích xuất báo cáo Power BI | Nhân viên |
| UC52 | Quản lý voucher | Nhân viên kinh doanh |
| UC53 | Tạo voucher | Nhân viên kinh doanh |
| UC54 | Phân phối và thu hồi voucher | Nhân viên kinh doanh |

### Phân hệ 8: Quản trị hệ thống ([Xem chi tiết](08-quan-tri-he-thong.md))
| Mã UC | Tên Use-case | Tác nhân chính |
|---|---|---|
| UC55 | Quản lý truy cập tài khoản | Người dùng |
| UC56 | Đăng ký | Khách hàng |
| UC57 | Đăng nhập | Người dùng |
| UC58 | Đăng xuất | Người dùng |
| UC59 | Quên mật khẩu | Người dùng |
| UC60 | Đổi mật khẩu | Người dùng |
| UC61 | Quản lý tài khoản người dùng | Quản trị viên |
| UC62 | Tạo tài khoản nhân viên | Quản trị viên |
| UC63 | Cập nhật năng lực nhân viên | Quản trị viên |
| UC64 | Xóa/Khóa tài khoản | Quản trị viên |
| UC65 | Mở khoá tài khoản | Quản trị viên |
| UC66 | Tìm kiếm tài khoản | Quản trị viên |
| UC67 | Phân quyền truy cập | Quản trị viên |
| UC68 | Xem nhật ký hệ thống | Quản trị viên |
