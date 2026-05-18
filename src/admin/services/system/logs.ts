import api from '../../services/api';
export interface SortObject {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}

export interface PageableObject {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort?: SortObject;
}

export interface NhatKyBaoMatResponse {
    id: number;
    hanhDong: string;
    moTa: string;
    thoiGian: string;
    nguoiThucHien: string;
}

export interface PageNhatKyBaoMatResponse {
    content: NhatKyBaoMatResponse[];
    pageable: PageableObject;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort?: SortObject;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface ApiResponsePageNhatKyBaoMatResponse {
    data: PageNhatKyBaoMatResponse;
}

export const logsService = {
    nhatKyBaoMat: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageNhatKyBaoMatResponse>('/api/quan-tri/nhat-ky-bao-mat', { params });
        return response.data.data;
    }
};
