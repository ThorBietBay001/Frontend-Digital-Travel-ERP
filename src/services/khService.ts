import api from './api';

export const khService = {
  // 1. Auth
  dangNhap: async (tenDangNhap: string, matKhau: string) => {
    const res = await api.post('/auth/dang-nhap', { tenDangNhap, matKhau });
    return res.data;
  },
  
  register: async (data: any) => {
    const res = await api.post('/auth/dang-ky', data);
    return res.data;
  },

  doiMatKhau: async (data: any) => {
    const res = await api.post('/auth/doi-mat-khau', data);
    return res.data;
  },

  quenMatKhau: async (email: string) => {
    const res = await api.post('/auth/quen-mat-khau', { email });
    return res.data;
  },

  datLaiMatKhau: async (data: any) => {
    const res = await api.post('/auth/dat-lai-mat-khau', data);
    return res.data;
  },

  kiemTraMatKhau: async (matKhauCu: string) => {
    const res = await api.post('/auth/kiem-tra-mat-khau', { matKhauCu });
    return res.data;
  },

  // 2. Tours
  layDanhSachTour: async (params?: any) => {
    const res = await api.get('/public/tour', { params });
    return res.data;
  },

  layChiTietTour: async (id: string) => {
    const res = await api.get(`/public/tour/${id}`);
    return res.data;
  },

  // 3. Bookings
  datTour: async (data: any) => {
    const res = await api.post('/khach-hang/dat-tour', data);
    return res.data;
  },

  getMyBookings: async (params?: any) => {
    const res = await api.get('/khach-hang/dat-tour', { params });
    return res.data;
  },

  layChiTietDatTour: async (maDatTour: string) => {
    const res = await api.get(`/khach-hang/dat-tour/${maDatTour}`);
    return res.data;
  },

  huyDatTour: async (maDatTour: string) => {
    const res = await api.delete(`/khach-hang/dat-tour/${maDatTour}`);
    return res.data;
  },

  yeuCauHuyTour: async (maDatTour: string, request: any) => {
    const res = await api.post(`/khach-hang/dat-tour/${maDatTour}/huy`, request);
    return res.data;
  },

  getPastTours: async (params?: any) => {
    const res = await api.get('/khach-hang/lich-su-tour', { params });
    return res.data;
  },

  // 4. Digital Passport / HoSoCaNhan
  layHoChieuSo: async () => {
    const res = await api.get('/khach-hang/ho-so');
    return res.data;
  },

  capNhatHoSo: async (data: any) => {
    const res = await api.put('/khach-hang/ho-so', data);
    return res.data;
  },

  // 5. Vouchers
  getVouchers: async (params?: any) => {
    const res = await api.get('/khach-hang/vi-voucher', { params });
    return res.data;
  },

  getRedeemableVouchers: async (params?: any) => {
    const res = await api.get('/khach-hang/voucher-co-the-doi', { params });
    return res.data;
  },

  apVoucher: async (maDatTour: string, maVoucher: string) => {
    const res = await api.post('/khach-hang/ap-voucher', { maDatTour, maVoucher });
    return res.data;
  },

  // 6. Green Actions & Extra Services
  getGreenActions: async (maTourThucTe?: string) => {
    const res = await api.get(`/public/tour/${maTourThucTe}/hanh-dong-xanh`);
    return res.data;
  },

  layDichVuThem: async (maTourThucTe?: string) => {
    const res = await api.get('/khach-hang/dich-vu-them', {
      params: maTourThucTe ? { maTourThucTe } : undefined
    });
    return res.data;
  },

  // 7. Support & Complaints
  layYeuCauHoTro: async (params?: any) => {
    const res = await api.get('/khach-hang/yeu-cau-ho-tro', { params });
    return res.data;
  },

  layYeuCauCanBoSung: async () => {
    const res = await api.get('/khach-hang/yeu-cau-ho-tro/can-bo-sung');
    return res.data;
  },

  taoYeuCauHoTro: async (data: any) => {
    const res = await api.post('/khach-hang/yeu-cau-ho-tro', data);
    return res.data;
  },

  boSungYeuCauHoTro: async (maYeuCau: string, noiDung: string) => {
    const res = await api.put(`/khach-hang/yeu-cau-ho-tro/${maYeuCau}/bo-sung`, { noiDung });
    return res.data;
  },

  // 8. Reviews
  layDanhGiaTour: async (maTour: string) => {
    const res = await api.get(`/public/tour/${maTour}/danh-gia`);
    return res.data;
  },

  taoDanhGia: async (data: any) => {
    const res = await api.post('/khach-hang/danh-gia', data);
    return res.data;
  },

  // 9. Redeem Points
  doiVoucher: async (maVoucher: string) => {
    const res = await api.post('/khach-hang/doi-diem', { maVoucher });
    return res.data;
  },

  khoiTaoThanhToan: async (data: any) => {
    const res = await api.post('/thanh-toan/khoi-tao', data);
    return res.data;
  },

  ketQuaThanhToan: async (maDatTour: string) => {
    const res = await api.get(`/thanh-toan/${maDatTour}/ket-qua`);
    return res.data;
  },

  capNhatHetHanThanhToanQr: async (maDatTour: string) => {
    const res = await api.post(`/thanh-toan/${maDatTour}/het-han-qr`);
    return res.data;
  },

  xacNhanDaChuyenKhoan: async (maDatTour: string) => {
    const res = await api.post(`/thanh-toan/${maDatTour}/xac-nhan-chuyen-khoan`);
    return res.data;
  }
};
