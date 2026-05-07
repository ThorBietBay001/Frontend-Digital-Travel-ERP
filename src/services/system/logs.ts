import api from '../../services/api';
import type {
    ApiResponsePageNhatKyBaoMatResponse,
    PageNhatKyBaoMatResponse,
    NhatKyBaoMatResponse,
    PageableObject,
    SortObject
} from '../../pages/system/logs/mockData';

export type {
    ApiResponsePageNhatKyBaoMatResponse,
    PageNhatKyBaoMatResponse,
    NhatKyBaoMatResponse,
    PageableObject,
    SortObject
};

export const logsService = {
    nhatKyBaoMat: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageNhatKyBaoMatResponse>('/api/quan-tri/nhat-ky-bao-mat', { params });
        return response.data.data;
    }
};
