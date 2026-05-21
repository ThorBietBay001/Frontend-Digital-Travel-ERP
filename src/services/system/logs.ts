import api from '../api';
import { unwrapApiData, type PageQueryParams } from '../../utils/apiHelpers';
import type {
  ApiResponsePageNhatKyBaoMatResponse,
  PageNhatKyBaoMatResponse,
  NhatKyBaoMatResponse,
  PageableObject,
  SortObject,
} from '../../pages/system/logs/mockData';

export type {
  ApiResponsePageNhatKyBaoMatResponse,
  PageNhatKyBaoMatResponse,
  NhatKyBaoMatResponse,
  PageableObject,
  SortObject,
};

export interface NhatKyBaoMatQueryParams extends PageQueryParams {
  maTaiKhoan?: string;
  hanhDong?: string;
  ketQua?: string;
  tuThoiDiem?: string;
  denThoiDiem?: string;
}

export const logsService = {
  nhatKyBaoMat: async (params?: NhatKyBaoMatQueryParams): Promise<PageNhatKyBaoMatResponse | undefined> => {
    const response = await api.get<ApiResponsePageNhatKyBaoMatResponse>('/api/quan-tri/nhat-ky-he-thong', {
      params: { page: 0, size: 200, ...params },
    });
    return unwrapApiData(response);
  },
};
