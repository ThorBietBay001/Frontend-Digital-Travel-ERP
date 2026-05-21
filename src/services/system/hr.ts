import api from '../api';
import { unwrapApiData } from '../../utils/apiHelpers';
import type {
  ApiResponseNangLucResponse,
  NangLucRequest,
  NangLucResponse,
} from '../../pages/system/hr/mockData';

export type {
  ApiResponseNangLucResponse,
  NangLucRequest,
  NangLucResponse,
};

export const hrService = {
  layNangLuc: async (maNhanVien: string): Promise<NangLucResponse | undefined> => {
    const response = await api.get<ApiResponseNangLucResponse>(
      `/api/dieu-hanh/nhan-vien/${maNhanVien}/nang-luc`
    );
    return unwrapApiData(response);
  },

  capNhatNangLuc: async (maNhanVien: string, data: NangLucRequest): Promise<NangLucResponse | undefined> => {
    const response = await api.put<ApiResponseNangLucResponse>(
      `/api/dieu-hanh/nhan-vien/${maNhanVien}/nang-luc`,
      data
    );
    return unwrapApiData(response);
  },

  nangLucNhanVien: (maNhanVien: string) => hrService.layNangLuc(maNhanVien),
};
