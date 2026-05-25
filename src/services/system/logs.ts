import api from '../api';
import { unwrapApiData, type PageQueryParams } from '../../utils/apiHelpers';

export interface SortObject {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
}

export interface PageableObject {
  offset?: number;
  pageNumber?: number;
  pageSize?: number;
  paged?: boolean;
  sort?: SortObject;
  unpaged?: boolean;
}

export interface NhatKyHeThongResponse {
  maNhatKyHeThong?: string;
  maTaiKhoan?: string;
  tenDangNhap?: string;
  hanhDong?: string;
  doiTuong?: string;
  maDoiTuong?: string;
  thoiGian?: string;
}

export interface PageNhatKyHeThongResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: NhatKyHeThongResponse[];
  number?: number;
  numberOfElements?: number;
  pageable?: PageableObject;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface ApiResponsePageNhatKyHeThongResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageNhatKyHeThongResponse;
  error?: string;
}

export interface NhatKyHeThongQueryParams extends PageQueryParams {
  maTaiKhoan?: string;
  hanhDong?: string;
  doiTuong?: string;
  maDoiTuong?: string;
  tuThoiGian?: string;
  denThoiGian?: string;
}

export const logsService = {
  nhatKyHeThong: async (params?: NhatKyHeThongQueryParams): Promise<PageNhatKyHeThongResponse | undefined> => {
    const response = await api.get<ApiResponsePageNhatKyHeThongResponse>('/api/quan-tri/nhat-ky-he-thong', {
      params: { page: 0, size: 500, sort: 'taiKhoan,desc', ...params },
    });
    return unwrapApiData(response);
  },
};
