import api from '../api';
import { unwrapApiData, type PageQueryParams } from '../../utils/apiHelpers';
import type {
  ApiResponsePageNhatKyBaoMatResponse,
  PageNhatKyBaoMatResponse,
  NhatKyBaoMatResponse,
  PageableObject,
  SortObject,
} from '../../pages/system/logs/mockData';

export type ApiResponsePageNhatKyHeThongResponse = ApiResponsePageNhatKyBaoMatResponse;
export type PageNhatKyHeThongResponse = PageNhatKyBaoMatResponse;
export type NhatKyHeThongResponse = NhatKyBaoMatResponse;

export type {
  PageableObject,
  SortObject,
};

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
