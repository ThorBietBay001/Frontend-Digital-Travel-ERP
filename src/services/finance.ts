import api from '../services/api';
import type {
    ApiResponseQuyetToanResponse,
    ApiResponseThanhToanResponse,
    ApiResponseChiPhiThucTeResponse,
    QuyetToanRequest,
    ApiResponsePageQuyetToanResponse,
    ApiResponsePageThanhToanResponse,
    ApiResponsePageChiPhiThucTeResponse,
    QuyetToanResponse,
    ThanhToanResponse,
    ChiPhiThucTeResponse,
    PageQuyetToanResponse,
    PageThanhToanResponse,
    PageChiPhiThucTeResponse,
    PageableObject,
    SortObject
} from '../pages/finance/mockData';

export type {
    ApiResponseQuyetToanResponse,
    ApiResponseThanhToanResponse,
    ApiResponseChiPhiThucTeResponse,
    QuyetToanRequest,
    ApiResponsePageQuyetToanResponse,
    ApiResponsePageThanhToanResponse,
    ApiResponsePageChiPhiThucTeResponse,
    QuyetToanResponse,
    ThanhToanResponse,
    ChiPhiThucTeResponse,
    PageQuyetToanResponse,
    PageThanhToanResponse,
    PageChiPhiThucTeResponse,
    PageableObject,
    SortObject
};

export const financeService = {
    chotQuyetToan: async (maQuyetToan: string) => {
        const response = await api.put<ApiResponseQuyetToanResponse>(`/api/ke-toan/quyet-toan/${maQuyetToan}/chot`, {});
        return response.data.data;
    },
    xacNhanHoanTien: async (maGiaoDich: string) => {
        const response = await api.put<ApiResponseThanhToanResponse>(`/api/ke-toan/giao-dich-hoan/${maGiaoDich}/xac-nhan`, {});
        return response.data.data;
    },
    tuChoiChiPhi: async (maChiPhi: string) => {
        const response = await api.put<ApiResponseChiPhiThucTeResponse>(`/api/ke-toan/chi-phi/${maChiPhi}/tu-choi`, {});
        return response.data.data;
    },
    duyetChiPhi: async (maChiPhi: string) => {
        const response = await api.put<ApiResponseChiPhiThucTeResponse>(`/api/ke-toan/chi-phi/${maChiPhi}/duyet`, {});
        return response.data.data;
    },
    taoQuyetToan: async (maTour: string, data: QuyetToanRequest) => {
        const response = await api.post<ApiResponseQuyetToanResponse>(`/api/ke-toan/quyet-toan/${maTour}`, data);
        return response.data.data;
    },
    danhSach_6: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageQuyetToanResponse>('/api/ke-toan/quyet-toan', { params });
        return response.data.data;
    },
    chiTiet_4: async (maQuyetToan: string) => {
        const response = await api.get<ApiResponseQuyetToanResponse>(`/api/ke-toan/quyet-toan/${maQuyetToan}`);
        return response.data.data;
    },
    danhSachChoHoanTien: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageThanhToanResponse>('/api/ke-toan/giao-dich-hoan', { params });
        return response.data.data;
    },
    danhSachChiPhi: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageChiPhiThucTeResponse>('/api/ke-toan/chi-phi', { params });
        return response.data.data;
    }
};
