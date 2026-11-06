export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusMapping {
  label: string;
  variant: BadgeVariant;
}

export const mapAccountStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'HOAT_DONG': return { label: 'Đang hoạt động', variant: 'success' };
    case 'KHOA': return { label: 'Bị khóa', variant: 'error' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapTourInstanceStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'CHO_KICH_HOAT': return { label: 'Chờ kích hoạt', variant: 'warning' };
    case 'MO_BAN': return { label: 'Mở bán', variant: 'success' };
    case 'DANG_DIEN_RA': return { label: 'Đang diễn ra', variant: 'info' };
    case 'KET_THUC': return { label: 'Kết thúc', variant: 'neutral' };
    case 'HUY': return { label: 'Hủy', variant: 'error' };
    case 'DA_QUYET_TOAN': return { label: 'Đã quyết toán', variant: 'success' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapTourTemplateStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'HOAT_DONG': return { label: 'Đang hoạt động', variant: 'success' };
    case 'KHOA': return { label: 'Bị khóa', variant: 'error' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapOrderStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'CHO_XAC_NHAN': return { label: 'Chờ xác nhận', variant: 'warning' };
    case 'DA_XAC_NHAN': return { label: 'Đã xác nhận', variant: 'info' };
    case 'CHO_HUY': return { label: 'Chờ hủy', variant: 'warning' };
    case 'DA_HUY': return { label: 'Đã hủy', variant: 'error' };
    case 'TU_CHOI_HOAN_TIEN': return { label: 'Từ chối hoàn tiền', variant: 'error' };
    case 'HET_HAN_GIU_CHO': return { label: 'Hết hạn giữ chỗ', variant: 'neutral' };
    case 'THANH_TOAN_THAT_BAI': return { label: 'Thanh toán thất bại', variant: 'error' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapTransactionStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'CHO_THANH_TOAN': return { label: 'Chờ thanh toán', variant: 'warning' };
    case 'THANH_CONG': return { label: 'Thành công', variant: 'success' };
    case 'THAT_BAI': return { label: 'Thất bại', variant: 'error' };
    case 'DA_HOAN_TIEN': return { label: 'Đã hoàn tiền', variant: 'success' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapSupportRequestStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'CHUA_XU_LY': return { label: 'Chưa xử lý', variant: 'warning' };
    case 'CHO_BO_SUNG': return { label: 'Chờ bổ sung', variant: 'neutral' };
    case 'CHO_GIAI_TRINH': return { label: 'Chờ giải trình', variant: 'neutral' };
    case 'CHO_DUYET': return { label: 'Chờ duyệt', variant: 'warning' };
    case 'DA_XU_LY': return { label: 'Đã xử lý', variant: 'success' };
    case 'TU_CHOI': return { label: 'Từ chối', variant: 'error' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapAttendanceStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'DA_DIEM_DANH': return { label: 'Đã điểm danh', variant: 'success' };
    case 'CHUA_DIEM_DANH': return { label: 'Chưa điểm danh', variant: 'warning' };
    case 'VANG': return { label: 'Vắng', variant: 'error' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapCostStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'CHO_DUYET': return { label: 'Chờ duyệt', variant: 'warning' };
    case 'DA_DUYET': return { label: 'Đã duyệt', variant: 'success' };
    case 'TU_CHOI': return { label: 'Từ chối', variant: 'error' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapSettlementStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'CHUA_QUYET_TOAN': return { label: 'Chưa quyết toán', variant: 'warning' };
    case 'DA_QUYET_TOAN': return { label: 'Đã quyết toán', variant: 'success' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapEmployeeStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'HOAT_DONG': return { label: 'Sẵn sàng', variant: 'success' };
    case 'BAN': return { label: 'Đang đi tour', variant: 'warning' };
    case 'NGHI': return { label: 'Đang nghỉ', variant: 'neutral' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapCustomerRank = (rank?: string): StatusMapping => {
  switch (rank) {
    case 'THANH_VIEN': return { label: 'Thành viên', variant: 'neutral' };
    case 'DONG': return { label: 'Đồng', variant: 'neutral' };
    case 'BAC': return { label: 'Bạc', variant: 'info' };
    case 'VANG': return { label: 'Vàng', variant: 'warning' };
    case 'KIM_CUONG': return { label: 'Kim cương', variant: 'success' };
    default: return { label: rank || 'Không xác định', variant: 'neutral' };
  }
};

export const mapVoucherStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'SAN_SANG': return { label: 'Sẵn sàng', variant: 'success' };
    case 'HET_HAN': return { label: 'Hết hạn', variant: 'neutral' };
    case 'VO_HIEU_HOA': return { label: 'Vô hiệu hóa', variant: 'error' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapCustomerVoucherStatus = (status?: string): StatusMapping => {
  switch (status) {
    case 'CO_HIEU_LUC': return { label: 'Có hiệu lực', variant: 'success' };
    case 'DA_SU_DUNG': return { label: 'Đã sử dụng', variant: 'neutral' };
    case 'DA_THU_HOI': return { label: 'Đã thu hồi', variant: 'error' };
    case 'HET_HAN': return { label: 'Hết hạn', variant: 'neutral' };
    default: return { label: status || 'Không xác định', variant: 'neutral' };
  }
};

export const mapIncidentSeverity = (severity?: string): StatusMapping => {
  switch (severity) {
    case 'THAP': return { label: 'Thấp', variant: 'info' };
    case 'TRUNG_BINH': return { label: 'Trung bình', variant: 'warning' };
    case 'CAO': return { label: 'Cao', variant: 'error' };
    default: return { label: severity || 'Không xác định', variant: 'neutral' };
  }
};
