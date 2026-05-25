import api from './api';

export const hdvService = {
  // 1. Auth & hồ sơ cá nhân
  dangNhap: async (tenDangNhap: string, matKhau: string) => {
    const res = await api.post('/auth/dang-nhap', { tenDangNhap, matKhau });
    return res.data;
  },

  doiMatKhau: async (data: { matKhauCu: string; matKhauMoi: string; xacNhanMatKhau: string }) => {
    const res = await api.post('/auth/doi-mat-khau', data);
    return res.data;
  },

  kiemTraMatKhau: async (matKhauCu: string) => {
    const res = await api.post('/auth/kiem-tra-mat-khau', { matKhauCu });
    return res.data;
  },

  quenMatKhau: async (email: string) => {
    const res = await api.post('/auth/quen-mat-khau', { email });
    return res.data;
  },

  datLaiMatKhau: async (data: { resetToken: string; matKhauMoi: string; xacNhanMatKhau: string }) => {
    const res = await api.post('/auth/dat-lai-mat-khau', data);
    return res.data;
  },

  layHoSo: async () => {
    const res = await api.get('/huong-dan-vien/ho-so');
    return res.data;
  },

  layNangLuc: async () => {
    const res = await api.get('/huong-dan-vien/nang-luc');
    return res.data;
  },

  // 2. Tour
  layDanhSachTour: async () => {
    const res = await api.get('/huong-dan-vien/tour-cua-toi');
    return res.data;
  },

  dongYPhanCong: async (maPhanCong: string) => {
    const res = await api.post(`/huong-dan-vien/phan-cong/${maPhanCong}/dong-y`);
    return res.data;
  },

  tuChoiPhanCong: async (maPhanCong: string) => {
    const res = await api.post(`/huong-dan-vien/phan-cong/${maPhanCong}/tu-choi`);
    return res.data;
  },

  layYeuCauGiaiTrinh: async () => {
    const res = await api.get('/huong-dan-vien/yeu-cau-giai-trinh');
    return res.data;
  },

  capNhatGiaiTrinh: async (maYeuCau: string, noiDung: string) => {
    const res = await api.put(`/huong-dan-vien/yeu-cau-giai-trinh/${maYeuCau}`, { noiDung });
    return res.data;
  },

  layQuyetToanCanBoSung: async () => {
    const res = await api.get('/huong-dan-vien/quyet-toan/can-bo-sung');
    return res.data;
  },

  boSungQuyetToan: async (maQuyetToan: string, data: { ghiChu: string; hoaDonAnh?: string }) => {
    const res = await api.put(`/huong-dan-vien/quyet-toan/${maQuyetToan}/bo-sung`, data);
    return res.data;
  },

  layChiTietTour: async (_maTour: string) => {
    // Hiện chưa có endpoint chi tiết tour riêng cho HDV, tạm dùng danh sách tour.
    const res = await api.get('/huong-dan-vien/tour-cua-toi');
    return res.data;
  },

  // Lấy chi tiết tour thực tế, có maTourMau để dùng với lịch trình.
  layChiTietTourThucTe: async (maTourThucTe: string) => {
    const res = await api.get(`/dieu-hanh/tour-thuc-te/${maTourThucTe}`);
    return res.data;
  },

  // 3. Điểm danh
  layDanhSachDoan: async (maTour: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTour}/doan`);
    return res.data;
  },

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

  // 4. Sự cố
  laySuCo: async (maTour: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTour}/su-co`);
    return res.data;
  },

  layTatCaSuCo: async () => {
    const res = await api.get('/huong-dan-vien/su-co');
    return res.data;
  },

  taoSuCo: async (maTour: string, data: any) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/su-co`, data);
    return res.data;
  },

  // 5. Chi phí
  layChiPhi: async (maTour: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTour}/chi-phi`);
    return res.data;
  },

  layTatCaChiPhi: async () => {
    const res = await api.get('/huong-dan-vien/chi-phi');
    return res.data;
  },

  taoChiPhi: async (maTour: string, data: any) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/chi-phi`, data);
    return res.data;
  },

  // 6. Hành động xanh
  luuHanhDongXanh: async (maTour: string, data: any) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/hanh-dong-xanh`, data);
    return res.data;
  },

  // 7. Danh mục hành động xanh
  layDanhSachHanhDongXanh: async (maTourThucTe?: string) => {
    const res = await api.get('/huong-dan-vien/hanh-dong-xanh', {
      params: maTourThucTe ? { maTourThucTe } : undefined
    });
    return res.data;
  },

  // 8. Lịch trình tour thực tế
  layLichTrinhTourThucTe: async (maTourThucTe: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTourThucTe}/lich-trinh`);
    return res.data;
  }
};
