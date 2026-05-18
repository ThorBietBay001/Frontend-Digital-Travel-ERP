import api from '../../services/api';
import type {
    ApiResponseNangLucResponse,
    NangLucRequest,
    NangLucResponse
} from '../../pages/system/hr/mockData';

export type {
    ApiResponseNangLucResponse,
    NangLucRequest,
    NangLucResponse
};

export const hrService = {
    nangLucNhanVien: async (maNhanVien: string) => {
        const response = await api.get<ApiResponseNangLucResponse>(`/api/dieu-hanh/nhan-vien/${maNhanVien}/nang-luc`);
        return response.data.data;
    },
    capNhatNangLuc: async (maNhanVien: string, data: NangLucRequest) => {
        const response = await api.put<ApiResponseNangLucResponse>(`/api/dieu-hanh/nhan-vien/${maNhanVien}/nang-luc`, data);
        return response.data.data;
    }
};
