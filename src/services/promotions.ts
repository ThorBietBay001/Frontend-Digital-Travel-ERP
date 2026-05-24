import api from './api';
import { type PageQueryParams } from '../utils/apiHelpers';
import type {
    ApiResponseVoucherResponse,
    VoucherRequest,
    ApiResponsePageVoucherResponse,
    PhatHanhVoucherRequest,
    ApiResponseKhuyenMaiKhResponse,
    VoucherResponse,
    PageVoucherResponse,
    KhuyenMaiKhResponse,
    PageableObject,
    SortObject
} from '../pages/promotions/mockData';

export type {
    VoucherResponse,
    VoucherRequest,
    PageVoucherResponse,
    KhuyenMaiKhResponse,
    PhatHanhVoucherRequest,
    ApiResponseVoucherResponse,
    ApiResponsePageVoucherResponse,
    ApiResponseKhuyenMaiKhResponse,
    PageableObject,
    SortObject,
};


export const promotionsService = {
    chiTiet_2: async (maVoucher: string) => {
        const response = await api.get<ApiResponseVoucherResponse>(`/api/kinh-doanh/voucher/${maVoucher}`);
        return response.data.data;
    },
    capNhatVoucher: async (maVoucher: string, data: VoucherRequest) => {
        const response = await api.put<ApiResponseVoucherResponse>(`/api/kinh-doanh/voucher/${maVoucher}`, data);
        return response.data.data;
    },
    voHieuVoucher: async (maVoucher: string) => {
        const response = await api.put<ApiResponseVoucherResponse>(`/api/kinh-doanh/voucher/${maVoucher}/vo-hieu-hoa`, {});
        return response.data.data;
    },
    danhSach_4: async (params?: PageQueryParams) => {
        const response = await api.get<ApiResponsePageVoucherResponse>('/api/kinh-doanh/voucher', { params });
        return response.data.data;
    },
    taoVoucher: async (data: VoucherRequest) => {
        const response = await api.post<ApiResponseVoucherResponse>('/api/kinh-doanh/voucher', data);
        return response.data.data;
    },
    phatHanh: async (maVoucher: string, data: PhatHanhVoucherRequest) => {
        const response = await api.post<ApiResponseKhuyenMaiKhResponse>(`/api/kinh-doanh/voucher/${maVoucher}/phat-hanh`, data);
        return response.data.data;
    },
    danhSachKhachHangDaPhanBo: async (maVoucher: string) => {
        try {
            const response = await api.get<{ data?: KhuyenMaiKhResponse[] }>(`/api/kinh-doanh/voucher/${maVoucher}/khach-hang-da-phan-bo`);
            return response.data.data || [];
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            if (message.includes('Không tìm thấy đường dẫn') || message.includes('Khong tim thay duong dan')) {
                return [];
            }
            throw error;
        }
    },
    thuHoi: async (maVoucher: string, maKhachHang: string) => {
        const response = await api.put<ApiResponseKhuyenMaiKhResponse>(`/api/kinh-doanh/voucher/${maVoucher}/khach-hang/${maKhachHang}/thu-hoi`, {});
        return response.data.data;
    }
};
