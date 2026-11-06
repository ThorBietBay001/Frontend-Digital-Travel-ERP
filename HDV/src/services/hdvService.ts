import api from './api';

export const hdvService = {
  // UC57 - Đăng nhập: Xác thực HDV
  dangNhap: async (tenDangNhap: string, matKhau: string) => {
    const res = await api.post('/auth/dang-nhap', { tenDangNhap, matKhau });
    return res.data;
  },

  // UC60 - Đổi mật khẩu: Cập nhật mật khẩu HDV
  doiMatKhau: async (data: { matKhauCu: string; matKhauMoi: string; xacNhanMatKhau: string }) => {
    const res = await api.post('/auth/doi-mat-khau', data);
    return res.data;
  },

  // UC60 - Đổi mật khẩu: Kiểm tra mật khẩu hiện tại
  kiemTraMatKhau: async (matKhauCu: string) => {
    const res = await api.post('/auth/kiem-tra-mat-khau', { matKhauCu });
    return res.data;
  },

  // UC59 - Quên mật khẩu: Gửi yêu cầu đặt lại
  quenMatKhau: async (email: string) => {
    const res = await api.post('/auth/quen-mat-khau', { email });
    return res.data;
  },

  // UC59 - Quên mật khẩu: Lưu mật khẩu mới
  datLaiMatKhau: async (data: { resetToken: string; matKhauMoi: string; xacNhanMatKhau: string }) => {
    const res = await api.post('/auth/dat-lai-mat-khau', data);
    return res.data;
  },

  // UC63 - Cập nhật năng lực nhân viên: Lấy hồ sơ HDV
  layHoSo: async () => {
    const res = await api.get('/huong-dan-vien/ho-so');
    return res.data;
  },

  // UC63 - Cập nhật năng lực nhân viên: Lấy năng lực HDV
  layNangLuc: async () => {
    const res = await api.get('/huong-dan-vien/nang-luc');
    return res.data;
  },

  // UC40 - Xem lịch trình và thông tin đoàn: Lấy tour được phân công
  layDanhSachTour: async () => {
    const res = await api.get('/huong-dan-vien/tour-cua-toi');
    return res.data;
  },

  // UC37 - Điều phối HDV: Đồng ý phân công
  dongYPhanCong: async (maPhanCong: string) => {
    const res = await api.post(`/huong-dan-vien/phan-cong/${maPhanCong}/dong-y`);
    return res.data;
  },

  // UC37 - Điều phối HDV: Từ chối phân công
  tuChoiPhanCong: async (maPhanCong: string) => {
    const res = await api.post(`/huong-dan-vien/phan-cong/${maPhanCong}/tu-choi`);
    return res.data;
  },

  // UC39 - Giải quyết khiếu nại: Lấy yêu cầu giải trình
  layYeuCauGiaiTrinh: async () => {
    const res = await api.get('/huong-dan-vien/yeu-cau-giai-trinh');
    return res.data;
  },

  // UC39 - Giải quyết khiếu nại: Gửi giải trình
  capNhatGiaiTrinh: async (maYeuCau: string, noiDung: string) => {
    const res = await api.put(`/huong-dan-vien/yeu-cau-giai-trinh/${maYeuCau}`, { noiDung });
    return res.data;
  },

  // UC48 - Quyết toán tour: Lấy yêu cầu bổ sung
  layQuyetToanCanBoSung: async () => {
    const res = await api.get('/huong-dan-vien/quyet-toan/can-bo-sung');
    return res.data;
  },

  // UC48 - Quyết toán tour: Bổ sung chứng từ
  boSungQuyetToan: async (maQuyetToan: string, data: { ghiChu: string; hoaDonAnh?: string }) => {
    const res = await api.put(`/huong-dan-vien/quyet-toan/${maQuyetToan}/bo-sung`, data);
    return res.data;
  },

  // UC40 - Xem lịch trình và thông tin đoàn: Lấy chi tiết tour đang vận hành
  layChiTietTour: async () => {
    // Hiện chưa có endpoint chi tiết tour riêng cho HDV, tạm dùng danh sách tour.
    const res = await api.get('/huong-dan-vien/tour-cua-toi');
    return res.data;
  },

  // UC40 - Xem lịch trình và thông tin đoàn: Lấy chi tiết tour thực tế
  layChiTietTourThucTe: async (maTourThucTe: string) => {
    const res = await api.get(`/dieu-hanh/tour-thuc-te/${maTourThucTe}`);
    return res.data;
  },

  // UC40 - Xem lịch trình và thông tin đoàn: Lấy danh sách đoàn
  layDanhSachDoan: async (maTour: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTour}/doan`);
    return res.data;
  },

  // UC41 - Điểm danh khách hàng: Ghi nhận điểm danh
  diemDanhKhach: async (
    maTour: string,
    data: { maKhachHang?: string; maNguoiDongHanh?: string; diaDiem: string; trangThai: string; ghiChu?: string }
  ) => {
    const payload = {
      ...(data.maNguoiDongHanh || data.maKhachHang?.startsWith('NDH')
        ? { maNguoiDongHanh: data.maNguoiDongHanh || data.maKhachHang }
        : { maKhachHang: data.maKhachHang }),
      diaDiem: data.diaDiem,
      trangThai: data.trangThai
    };
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/diem-danh`, payload);
    return res.data;
  },

  // UC43 - Báo cáo sự cố: Lấy sự cố theo tour
  laySuCo: async (maTour: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTour}/su-co`);
    return res.data;
  },

  // UC43 - Báo cáo sự cố: Lấy lịch sử sự cố
  layTatCaSuCo: async () => {
    const res = await api.get('/huong-dan-vien/su-co');
    return res.data;
  },

  // UC43 - Báo cáo sự cố: Tạo sự cố
  taoSuCo: async (maTour: string, data: any) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/su-co`, data);
    return res.data;
  },

  // UC44 - Cập nhật chi phí thực tế: Lấy chi phí theo tour
  layChiPhi: async (maTour: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTour}/chi-phi`);
    return res.data;
  },

  // UC44 - Cập nhật chi phí thực tế: Lấy lịch sử chi phí
  layTatCaChiPhi: async () => {
    const res = await api.get('/huong-dan-vien/chi-phi');
    return res.data;
  },

  // UC44 - Cập nhật chi phí thực tế: Tạo chi phí
  taoChiPhi: async (maTour: string, data: any) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/chi-phi`, data);
    return res.data;
  },

  // TODO - Upload ảnh hóa đơn hoặc minh chứng
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/public/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // UC42 - Xác nhận hành động xanh: Ghi nhận hành động
  luuHanhDongXanh: async (maTour: string, data: any) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/hanh-dong-xanh`, data);
    return res.data;
  },

  // UC42 - Xác nhận hành động xanh: Lấy hành động khả dụng
  layDanhSachHanhDongXanh: async (maTourThucTe?: string) => {
    const res = await api.get('/huong-dan-vien/hanh-dong-xanh', {
      params: maTourThucTe ? { maTourThucTe } : undefined
    });
    return res.data;
  },

  // UC40 - Xem lịch trình và thông tin đoàn: Lấy lịch trình tour
  layLichTrinhTourThucTe: async (maTourThucTe: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTourThucTe}/lich-trinh`);
    return res.data;
  }
};
