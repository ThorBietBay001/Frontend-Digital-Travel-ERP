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
    // UC48 - Quyết toán tour: Chốt hồ sơ quyết toán
    chotQuyetToan: async (maQuyetToan: string) => {
        const response = await api.put<ApiResponseQuyetToanResponse>(`/api/ke-toan/quyet-toan/${maQuyetToan}/chot`);
        return response.data.data;
    },
    // UC48 - Quyết toán tour: Yêu cầu bổ sung chứng từ
    yeuCauBoSungQuyetToan: async (maQuyetToan: string, noiDung: string) => {
        const response = await api.post<ApiResponseQuyetToanResponse>(
            `/api/ke-toan/quyet-toan/${maQuyetToan}/yeu-cau-bo-sung`,
            { noiDung }
        );
        return response.data.data;
    },
    // UC50 - Xử lý hoàn tiền: Xác nhận đã hoàn tiền
    xacNhanHoanTien: async (maGiaoDich: string) => {
        const response = await api.put<ApiResponseThanhToanResponse>(`/api/ke-toan/giao-dich-hoan/${maGiaoDich}/xac-nhan`, {});
        return response.data.data;
    },
    // UC50 - Xử lý hoàn tiền: Từ chối hoàn tiền
    tuChoiHoanTien: async (maGiaoDich: string) => {
        const response = await api.put<ApiResponseThanhToanResponse>(`/api/ke-toan/giao-dich-hoan/${maGiaoDich}/tu-choi`, {});
        return response.data.data;
    },
    // UC47 - Phê duyệt chi phí thực tế: Từ chối khoản chi
    tuChoiChiPhi: async (maChiPhi: string) => {
        const response = await api.put<ApiResponseChiPhiThucTeResponse>(`/api/ke-toan/chi-phi/${maChiPhi}/tu-choi`);
        return response.data.data;
    },
    // UC47 - Phê duyệt chi phí thực tế: Duyệt khoản chi
    duyetChiPhi: async (maChiPhi: string) => {
        const response = await api.put<ApiResponseChiPhiThucTeResponse>(`/api/ke-toan/chi-phi/${maChiPhi}/duyet`);
        return response.data.data;
    },
    // UC48 - Quyết toán tour: Tạo hồ sơ quyết toán
    taoQuyetToan: async (maTour: string, data: QuyetToanRequest) => {
        const response = await api.post<ApiResponseQuyetToanResponse>(`/api/ke-toan/quyet-toan/${maTour}`, data);
        return response.data.data;
    },
    // UC48 - Quyết toán tour: Lọc danh sách quyết toán
    danhSach_6: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageQuyetToanResponse>('/api/ke-toan/quyet-toan', { params });
        return response.data.data;
    },
    // UC49 - Tra cứu tour cần quyết toán: Lấy tour cần xử lý
    tourCanQuyetToan: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageQuyetToanResponse>('/api/ke-toan/tour-can-quyet-toan', { params });
        return response.data.data;
    },
    // UC48 - Quyết toán tour: Xem chi tiết quyết toán
    chiTiet_4: async (maQuyetToan: string) => {
        const response = await api.get<ApiResponseQuyetToanResponse>(`/api/ke-toan/quyet-toan/${maQuyetToan}`);
        return response.data.data;
    },
    // UC50 - Xử lý hoàn tiền: Lấy danh sách chờ hoàn
    danhSachChoHoanTien: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageThanhToanResponse>('/api/ke-toan/giao-dich-hoan', { params });
        return response.data.data;
    },
    // UC47 - Phê duyệt chi phí thực tế: Lọc chi phí
    danhSachChiPhi: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageChiPhiThucTeResponse>('/api/ke-toan/chi-phi', { params });
        return response.data.data;
    },
    // UC46 - Xem cảnh báo chi phí: Lọc cảnh báo chi phí
    danhSachCanhBao: async (params?: Record<string, any>) => {
        const response = await api.get('/api/ke-toan/canh-bao-chi-phi', { params });
        return response.data.data;
    },
    // UC45 - Tính lợi nhuận gộp: Tính tổng hợp tài chính
    tinhToan: async (maTour: string) => {
        const response = await api.get<ApiResponseQuyetToanResponse>(`/api/ke-toan/tinh-toan/${maTour}`);
        return response.data.data;
    }
};
