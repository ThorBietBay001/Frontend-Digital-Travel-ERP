import api from './api';

export const hdvService = {
  // 1. Auth & HoSoCaNhan
  dangNhap: async (tenDangNhap: string, matKhau: string) => {
    const res = await api.post('/auth/dang-nhap', { tenDangNhap, matKhau });
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

  // 2. Tours
  layDanhSachTour: async () => {
    const res = await api.get('/huong-dan-vien/tour-cua-toi');
    return res.data;
  },

  layChiTietTour: async (_maTour: string) => {
    // Falls back to tour list since there is no dedicated HDV tour detail endpoint
    const res = await api.get(`/huong-dan-vien/tour-cua-toi`);
    return res.data;
  },

  // Lấy chi tiết tour thực tế (có chứa maTourMau để dùng với lịch trình)
  layChiTietTourThucTe: async (maTourThucTe: string) => {
    const res = await api.get(`/dieu-hanh/tour-thuc-te/${maTourThucTe}`);
    return res.data;
  },

  // 3. DiemDanh
  layDanhSachDoan: async (maTour: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTour}/doan`);
    return res.data;
  },

  diemDanhKhach: async (maTour: string, data: { maKhachHang: string; diaDiem: string; trangThai: string }) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/diem-danh`, data);
    return res.data;
  },

  // 4. Incidents
  laySuCo: async (maTour: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTour}/su-co`);
    return res.data;
  },

  taoSuCo: async (maTour: string, data: any) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/su-co`, data);
    return res.data;
  },

  // 5. Expenses
  layChiPhi: async (maTour: string) => {
    const res = await api.get(`/huong-dan-vien/tour/${maTour}/chi-phi`);
    return res.data;
  },

  taoChiPhi: async (maTour: string, data: any) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/chi-phi`, data);
    return res.data;
  },

  // 6. Green Actions
  luuHanhDongXanh: async (maTour: string, data: any) => {
    const res = await api.post(`/huong-dan-vien/tour/${maTour}/hanh-dong-xanh`, data);
    return res.data;
  },

  // 7. Danh sách hành động xanh (danh mục)
  layDanhSachHanhDongXanh: async () => {
    const res = await api.get('/huong-dan-vien/hanh-dong-xanh');
    return res.data;
  },

  // 8. Lịch trình tour (dùng maTourThucTe, qua endpoint public không cần quyền đặc biệt)
  layLichTrinhTourThucTe: async (maTourThucTe: string) => {
    const res = await api.get(`/public/tour/${maTourThucTe}`);
    return res.data;
  }
};
