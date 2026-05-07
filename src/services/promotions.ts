import api from '../services/api';
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
        const response = await api.put<ApiResponseVoucherResponse>(`/api/kinh-doanh/voucher/${maVoucher}/vo-hieu`, {});
        return response.data.data;
    },
    danhSach_4: async (params?: Record<string, any>) => {
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
    }
};
