import api from './api';

export interface PowerBiKhoDuLieuResponse {
  maKho: string;
  tenKho: string;
  moTa: string;
}

export interface PowerBiKetNoiResponse {
  host: string;
  port: number;
  serviceName: string;
  username: string;
  password?: string;
  jdbcUrl: string;
  hetHan?: string;
  huongDan: string;
}

export interface XuatDuLieuRequest {
  maKho: string;
  tuNgay?: string;
  denNgay?: string;
  dinhDang: 'EXCEL' | 'CSV';
}

export const powerBiService = {
  danhSachKhoDuLieu: async () => {
    const response = await api.get('/api/ke-toan/power-bi/kho-du-lieu');
    return response.data;
  },

  layThongTinKetNoi: async (maKho: string) => {
    const response = await api.get(`/api/ke-toan/power-bi/ket-noi?maKho=${maKho}`);
    return response.data;
  },

  xuatDuLieu: async (request: XuatDuLieuRequest) => {
    const response = await api.post('/api/ke-toan/power-bi/xuat-du-lieu', request, {
      responseType: 'blob'
    });
    return response;
  }
};
