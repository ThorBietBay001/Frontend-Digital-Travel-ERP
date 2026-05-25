import api from './api';

export interface NhatKySuCoResponse {
  maNhatKySuCo?: string;
  maTour?: string;
  moTa?: string;
  giaiPhap?: string;
  mucDo?: string;
  loaiSuCo?: string;
  maHdvBaoCao?: string;
  maKhachHang?: string;
  maNguoiDongHanh?: string;
  hoTenKhachHang?: string;
  ghiChuYTe?: string;
  diUng?: string;
  thoiGianBaoCao?: string;
}

export const incidentService = {
  lichSuSuCoCuaHdv: async (mucDo?: string): Promise<NhatKySuCoResponse[]> => {
    const params = new URLSearchParams();
    if (mucDo) params.append('mucDo', mucDo);
    const response = await api.get(`/api/huong-dan-vien/su-co${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data?.data || [];
  },
};
