import api from '../services/api';
import type {
    PhanCongHdvRequest,
    ApiResponsePhanCongResponse,
    ApiResponseListNhanVienResponse,
    ApiResponseVoid,
    PhanCongResponse,
    NhanVienResponse
} from '../pages/dispatch/mockData';

export type {
    PhanCongHdvRequest,
    ApiResponsePhanCongResponse,
    ApiResponseListNhanVienResponse,
    ApiResponseVoid,
    PhanCongResponse,
    NhanVienResponse
};


export const dispatchService = {
    phanCong: async (data: PhanCongHdvRequest) => {
        const response = await api.post<ApiResponsePhanCongResponse>('/api/dieu-hanh/phan-cong', data);
        return response.data.data;
    },
    hdvKhaDung: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponseListNhanVienResponse>('/api/dieu-hanh/hdv-kha-dung', { params });
        return response.data.data;
    },
    huyPhanCong: async (maPhanCong: string) => {
        const response = await api.delete<ApiResponseVoid>(`/api/dieu-hanh/phan-cong/${maPhanCong}`);
        return response.data.data;
    }
};
