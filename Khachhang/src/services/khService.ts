import api from './api';

export const khService = {
  // UC57 - Đăng nhập: Xác thực khách hàng
  dangNhap: async (tenDangNhap: string, matKhau: string) => {
    const res = await api.post('/auth/dang-nhap', { tenDangNhap, matKhau });
    return res.data;
  },
  
  // UC56 - Đăng ký: Tạo tài khoản khách hàng
  register: async (data: any) => {
    const res = await api.post('/auth/dang-ky', data);
    return res.data;
  },

  // UC60 - Đổi mật khẩu: Cập nhật mật khẩu
  doiMatKhau: async (data: any) => {
    const res = await api.post('/auth/doi-mat-khau', data);
    return res.data;
  },

  // UC59 - Quên mật khẩu: Gửi yêu cầu đặt lại
  quenMatKhau: async (email: string) => {
    const res = await api.post('/auth/quen-mat-khau', { email });
    return res.data;
  },

  // UC59 - Quên mật khẩu: Lưu mật khẩu mới
  datLaiMatKhau: async (data: any) => {
    const res = await api.post('/auth/dat-lai-mat-khau', data);
    return res.data;
  },

  // UC60 - Đổi mật khẩu: Kiểm tra mật khẩu hiện tại
  kiemTraMatKhau: async (matKhauCu: string) => {
    const res = await api.post('/auth/kiem-tra-mat-khau', { matKhauCu });
    return res.data;
  },

  // UC25 - Tra cứu tour: Lọc danh sách tour
  layDanhSachTour: async (params?: any) => {
    const res = await api.get('/public/tour', { params });
    return res.data;
  },

  // UC26 - Xem chi tiết tour: Lấy chi tiết tour
  layChiTietTour: async (id: string) => {
    const res = await api.get(`/public/tour/${id}`);
    return res.data;
  },

  // UC27 - Đặt tour: Tạo đơn đặt tour
  datTour: async (data: any) => {
    const res = await api.post('/khach-hang/dat-tour', data);
    return res.data;
  },

  // UC22 - Xem chi tiết lịch sử hành trình: Lấy đơn của tôi
  getMyBookings: async (params?: any) => {
    const res = await api.get('/khach-hang/dat-tour', { params });
    return res.data;
  },

  // UC22 - Xem chi tiết lịch sử hành trình: Xem chi tiết đơn
  layChiTietDatTour: async (maDatTour: string) => {
    const res = await api.get(`/khach-hang/dat-tour/${maDatTour}`);
    return res.data;
  },

  // UC32 - Hủy tour: Hủy đơn đặt tour
  huyDatTour: async (maDatTour: string) => {
    const res = await api.delete(`/khach-hang/dat-tour/${maDatTour}`);
    return res.data;
  },

  // UC32 - Hủy tour: Gửi yêu cầu hủy tour
  yeuCauHuyTour: async (maDatTour: string, request: any) => {
    const res = await api.post(`/khach-hang/dat-tour/${maDatTour}/huy`, request);
    return res.data;
  },

  // UC22 - Xem chi tiết lịch sử hành trình: Lấy lịch sử tour
  getPastTours: async (params?: any) => {
    const res = await api.get('/khach-hang/lich-su-tour', { params });
    return res.data;
  },

  // UC21 - Xem thông tin hồ sơ số: Lấy hồ sơ số
  layHoChieuSo: async () => {
    const res = await api.get('/khach-hang/ho-so');
    return res.data;
  },

  // UC23 - Cập nhật hồ sơ số: Lưu hồ sơ số
  capNhatHoSo: async (data: any) => {
    const res = await api.put('/khach-hang/ho-so', data);
    return res.data;
  },

  // UC31 - Xem danh sách voucher: Lấy ví voucher
  getVouchers: async (params?: any) => {
    const res = await api.get('/khach-hang/vi-voucher', { params });
    return res.data;
  },

  // UC30 - Quy đổi voucher: Lấy voucher có thể đổi
  getRedeemableVouchers: async (params?: any) => {
    const res = await api.get('/khach-hang/voucher-co-the-doi', { params });
    return res.data;
  },

  // UC28 - Áp dụng Voucher: Áp mã giảm giá
  apVoucher: async (maDatTour: string, maVoucher: string) => {
    const res = await api.post('/khach-hang/ap-voucher', { maDatTour, maVoucher });
    return res.data;
  },

  // UC27 - Đặt tour: Lấy hành động xanh
  getGreenActions: async (maTourThucTe?: string) => {
    const res = await api.get(`/public/tour/${maTourThucTe}/hanh-dong-xanh`);
    return res.data;
  },

  // UC27 - Đặt tour: Lấy dịch vụ thêm
  layDichVuThem: async (maTourThucTe?: string) => {
    const res = await api.get('/khach-hang/dich-vu-them', {
      params: maTourThucTe ? { maTourThucTe } : undefined
    });
    return res.data;
  },

  // UC36 - Khiếu nại: Lấy yêu cầu hỗ trợ
  layYeuCauHoTro: async (params?: any) => {
    const res = await api.get('/khach-hang/yeu-cau-ho-tro', { params });
    return res.data;
  },

  // UC39 - Giải quyết khiếu nại: Lấy yêu cầu cần bổ sung
  layYeuCauCanBoSung: async () => {
    const res = await api.get('/khach-hang/yeu-cau-ho-tro/can-bo-sung');
    return res.data;
  },

  // UC36 - Khiếu nại: Tạo yêu cầu hỗ trợ
  taoYeuCauHoTro: async (data: any) => {
    const res = await api.post('/khach-hang/yeu-cau-ho-tro', data);
    return res.data;
  },

  // UC39 - Giải quyết khiếu nại: Bổ sung yêu cầu
  boSungYeuCauHoTro: async (maYeuCau: string, noiDung: string) => {
    const res = await api.put(`/khach-hang/yeu-cau-ho-tro/${maYeuCau}/bo-sung`, { noiDung });
    return res.data;
  },

  // UC35 - Đánh giá: Lấy đánh giá tour
  layDanhGiaTour: async (maTour: string, params?: any) => {
    const res = await api.get(`/public/tour/${maTour}/danh-gia`, { params });
    return res.data;
  },

  // UC35 - Đánh giá: Gửi đánh giá
  taoDanhGia: async (data: any) => {
    const res = await api.post('/khach-hang/danh-gia', data);
    return res.data;
  },

  // UC30 - Quy đổi voucher: Đổi điểm lấy voucher
  doiVoucher: async (maVoucher: string) => {
    const res = await api.post('/khach-hang/doi-diem', { maVoucher });
    return res.data;
  },

  // UC29 - Thanh toán đơn hàng: Khởi tạo thanh toán
  khoiTaoThanhToan: async (data: any) => {
    const res = await api.post('/thanh-toan/khoi-tao', data);
    return res.data;
  },

  // UC29 - Thanh toán đơn hàng: Tra cứu kết quả
  ketQuaThanhToan: async (maDatTour: string) => {
    const res = await api.get(`/thanh-toan/${maDatTour}/ket-qua`);
    return res.data;
  },

  // UC29 - Thanh toán đơn hàng: Báo QR hết hạn
  capNhatHetHanThanhToanQr: async (maDatTour: string) => {
    const res = await api.post(`/thanh-toan/${maDatTour}/het-han-qr`);
    return res.data;
  },

  // UC29 - Thanh toán đơn hàng: Xác nhận đã chuyển khoản
  xacNhanDaChuyenKhoan: async (maDatTour: string) => {
    const res = await api.post(`/thanh-toan/${maDatTour}/xac-nhan-chuyen-khoan`);
    return res.data;
  }
};
