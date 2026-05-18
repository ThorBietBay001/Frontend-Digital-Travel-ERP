import api from '../../services/api';
import type {
    GanVaiTroRequest,
    ApiResponseNhanVienResponse,
    ApiResponseVoid,
    DangKyNhanVienRequest,
    ApiResponsePageNhanVienResponse,
    NhanVienResponse,
    PageNhanVienResponse,
    PageableObject,
    SortObject
} from '../../pages/system/accounts/mockData';

export type {
    GanVaiTroRequest,
    ApiResponseNhanVienResponse,
    ApiResponseVoid,
    DangKyNhanVienRequest,
    ApiResponsePageNhanVienResponse,
    NhanVienResponse,
    PageNhanVienResponse,
    PageableObject,
    SortObject
};

export const accountsService = {
    ganVaiTro: async (maNhanVien: string, data: GanVaiTroRequest) => {
        const response = await api.put<ApiResponseNhanVienResponse>(`/api/quan-tri/nhan-vien/${maNhanVien}/vai-tro`, data);
        return response.data.data;
    },
    moKhoaTaiKhoan: async (maNhanVien: string) => {
        const response = await api.put<ApiResponseVoid>(`/api/quan-tri/nhan-vien/${maNhanVien}/mo-khoa`, {});
        return response.data.data;
    },
    khoaTaiKhoan: async (maNhanVien: string) => {
        const response = await api.put<ApiResponseVoid>(`/api/quan-tri/nhan-vien/${maNhanVien}/khoa`, {});
        return response.data.data;
    },
    dangKyNhanVien: async (data: DangKyNhanVienRequest) => {
        const response = await api.post<ApiResponseVoid>('/api/quan-tri/dang-ky-nhan-vien', data);
        return response.data.data;
    },
    danhSachNhanVien: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageNhanVienResponse>('/api/quan-tri/nhan-vien', { params });
        return response.data.data;
    },
    chiTietNhanVien: async (maNhanVien: string) => {
        const response = await api.get<ApiResponseNhanVienResponse>(`/api/quan-tri/nhan-vien/${maNhanVien}`);
        return response.data.data;
    }
};
