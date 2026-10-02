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
    // UC67 - Phân quyền truy cập: Gán vai trò
    ganVaiTro: async (maNhanVien: string, data: GanVaiTroRequest) => {
        const response = await api.put<ApiResponseNhanVienResponse>(`/api/quan-tri/nhan-vien/${maNhanVien}/vai-tro`, data);
        return response.data.data;
    },
    // UC65 - Mở khóa tài khoản: Mở khóa nhân viên
    moKhoaTaiKhoan: async (maNhanVien: string) => {
        const response = await api.put<ApiResponseVoid>(`/api/quan-tri/nhan-vien/${maNhanVien}/mo-khoa`, {});
        return response.data.data;
    },
    // UC64 - Xóa/Khóa tài khoản: Khóa nhân viên
    khoaTaiKhoan: async (maNhanVien: string) => {
        const response = await api.put<ApiResponseVoid>(`/api/quan-tri/nhan-vien/${maNhanVien}/khoa`, {});
        return response.data.data;
    },
    // UC62 - Tạo tài khoản nhân viên: Tạo tài khoản nội bộ
    dangKyNhanVien: async (data: DangKyNhanVienRequest) => {
        const response = await api.post<ApiResponseVoid>('/api/quan-tri/dang-ky-nhan-vien', data);
        return response.data.data;
    },
    // UC66 - Tìm kiếm tài khoản: Lọc nhân viên
    danhSachNhanVien: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageNhanVienResponse>('/api/quan-tri/nhan-vien', { params });
        return response.data.data;
    },
    // UC66 - Tìm kiếm tài khoản: Xem chi tiết nhân viên
    chiTietNhanVien: async (maNhanVien: string) => {
        const response = await api.get<ApiResponseNhanVienResponse>(`/api/quan-tri/nhan-vien/${maNhanVien}`);
        return response.data.data;
    }
};
