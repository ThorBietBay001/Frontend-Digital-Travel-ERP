import React, { useEffect, useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { Voucher, CustomerTarget } from './mockData';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { customersService } from '../../services/customers';
import { promotionsService } from '../../services/promotions';
import { formatApiError } from '../../utils/apiHelpers';
import { Select } from '../../components/ui/Select';


interface DistributeVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher | null;
  mode?: 'distribute' | 'revoke';
  onSuccess?: (newDistributedCount: number) => void;
}

const DistributeVoucherModal: React.FC<DistributeVoucherModalProps> = ({ isOpen, onClose, voucher, mode = 'distribute', onSuccess }) => {
  const [customers, setCustomers] = useState<CustomerTarget[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distributedCount, setDistributedCount] = useState(0);
  const [revokingCustomerId, setRevokingCustomerId] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string>('all');

  const mapDistributeError = (message: string) => {
    if (message.includes('Khach hang nay da co voucher nay roi') || message.includes('Khách hàng này đã có voucher này rồi')) {
      return 'Khách hàng này đã có voucher này rồi';
    }
    if (message.includes('Voucher da bi vo hieu hoa') || message.includes('Voucher đã bị vô hiệu hóa')) {
      return 'Voucher đã bị vô hiệu hóa';
    }
    if (message.includes('Voucher chua den ngay hieu luc hoac da het han')) {
      return 'Voucher chưa đến ngày hiệu lực hoặc đã hết hạn';
    }
    if (message.includes('Voucher chua den ngay hieu luc') || message.includes('Voucher chưa đến ngày hiệu lực')) {
      return 'Voucher chưa đến ngày hiệu lực';
    }
    if (message.includes('Voucher da het han') || message.includes('Voucher đã hết hạn')) {
      return 'Voucher đã hết hạn';
    }
    if (message.includes('Voucher da het luot phat hanh') || message.includes('Voucher đã hết lượt phát hành')) {
      return 'Voucher đã hết lượt phát hành';
    }
    return message;
  };

  useEffect(() => {
    if (!isOpen || !voucher) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCustomers([]);
    setError(null);
    setDistributedCount(voucher.distributed);
    setLoading(true);
    Promise.all([
      customersService.timKiemKhachHang({ size: 1000 }),
      promotionsService.danhSachKhachHangDaPhanBo(voucher.id),
    ])
      .then(([res, distributedCustomers]) => {
        if (mode === 'revoke') {
          setCustomers(distributedCustomers.map((customer) => ({
            id: customer.maKhachHang || '',
            name: customer.hoTenKhachHang || '',
            email: customer.emailKhachHang || '',
            tier: customer.hangThanhVien || 'THANH_VIEN',
            phone: customer.soDienThoaiKhachHang || '',
            hasVoucher: true,
            voucherStatus: customer.trangThai || 'CO_HIEU_LUC',
          })).filter((customer) => customer.id));
          return;
        }

        const distributedStatusByCustomer = new Map(
          distributedCustomers
            .filter((item) => item.maKhachHang)
            .map((item) => [item.maKhachHang as string, item.trangThai || 'CO_HIEU_LUC'])
        );
        setCustomers((res?.content || []).map((customer) => ({
          id: customer.maKhachHang || '',
          name: customer.hoTen || '',
          email: customer.email || '',
          tier: customer.hangThanhVien || '',
          phone: customer.soDienThoai || '',
          hasVoucher: distributedStatusByCustomer.has(customer.maKhachHang || ''),
          voucherStatus: distributedStatusByCustomer.get(customer.maKhachHang || ''),
        })).filter((customer) => customer.id));
      })
      .catch((err: unknown) => {
        const message = formatApiError(err, 'Lỗi tải danh sách khách hàng');
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [isOpen, mode, voucher]);

  if (!voucher) return null;

  const availableQuantity = Math.max(voucher.quantity - distributedCount, 0);
  
  const filteredCustomers = customers.filter(c => filterTier === 'all' || c.tier === filterTier);
  const distributableCustomers = filteredCustomers.filter((customer) => !customer.hasVoucher);
  const distributedCustomers = filteredCustomers.filter((customer) => customer.hasVoucher);
  const visibleCustomers = mode === 'revoke' ? distributedCustomers : filteredCustomers;
  const isRevokeMode = mode === 'revoke';
  const revocableCustomers = visibleCustomers.filter((customer) => customer.voucherStatus === 'CO_HIEU_LUC');
  const activeVoucherCount = distributedCustomers.filter((customer) => customer.voucherStatus === 'CO_HIEU_LUC').length;
  const usedVoucherCount = distributedCustomers.filter((customer) => customer.voucherStatus === 'DA_SU_DUNG').length;

  const checkboxCustomers = isRevokeMode ? revocableCustomers : distributableCustomers;

  const renderVoucherStatus = (status?: string) => {
    if (status === 'DA_SU_DUNG') {
      return (
        <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
          Đã sử dụng
        </span>
      );
    }
    if (status === 'CO_HIEU_LUC') {
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Có hiệu lực
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
        Chưa nhận
      </span>
    );
  };

  const columns: Column<CustomerTarget>[] = [
    {
      key: 'checkbox',
      title: (
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCustomers(checkboxCustomers.map(c => c.id));
            } else {
              setSelectedCustomers([]);
            }
          }}
          checked={selectedCustomers.length === checkboxCustomers.length && checkboxCustomers.length > 0}
        />
      ),
      render: (record) => (
        <input
          type="checkbox"
          disabled={isRevokeMode ? record.voucherStatus !== 'CO_HIEU_LUC' : record.hasVoucher}
          checked={selectedCustomers.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCustomers([...selectedCustomers, record.id]);
            } else {
              setSelectedCustomers(selectedCustomers.filter(id => id !== record.id));
            }
          }}
        />
      ),
      width: '50px'
    },
    { key: 'name', title: 'Họ tên', dataIndex: 'name' },
    { key: 'email', title: 'Email', dataIndex: 'email' },
    { 
      key: 'tier', 
      title: 'Hạng thẻ', 
      render: (record) => {
        const tierColors: Record<string, string> = {
          'DONG': 'bg-[#f4e6de] text-[#8b5a2b] border-[#d2b48c]',
          'BAC': 'bg-gray-100 text-gray-600 border-gray-300',
          'VANG': 'bg-yellow-50 text-yellow-700 border-yellow-300',
          'KIM_CUONG': 'bg-blue-50 text-blue-700 border-blue-300',
          'THANH_VIEN': 'bg-gray-50 text-gray-500 border-gray-200'
        };
        const tierLabels: Record<string, string> = {
          'DONG': 'Đồng', 'BAC': 'Bạc', 'VANG': 'Vàng', 'KIM_CUONG': 'Kim cương', 'THANH_VIEN': 'Thành viên'
        };
        const colorClass = tierColors[record.tier] || tierColors['THANH_VIEN'];
        const label = tierLabels[record.tier] || record.tier;
        return <span className={`inline-flex items-center rounded-full font-semibold px-2.5 py-1 text-xs border ${colorClass}`}>{label}</span>;
      }
    },
    {
      key: 'voucherStatus',
      title: 'Trạng thái voucher',
      render: (record) => renderVoucherStatus(record.voucherStatus),
    }
  ];

  const refreshDistributedCount = async (fallbackCount: number) => {
    try {
      const latestVoucher = await promotionsService.chiTiet_2(voucher.id);
      return latestVoucher?.soLuotDaPhanBo ?? fallbackCount;
    } catch {
      return fallbackCount;
    }
  };

  const handleDistribute = async () => {
    if (!voucher || selectedCustomers.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        selectedCustomers.map((maKhachHang) =>
          promotionsService.phatHanh(voucher.id, { maKhachHang })
        )
      );
      const failedResults = results.filter((result) => result.status === 'rejected');
      const successCount = results.length - failedResults.length;
      const successfulIds = selectedCustomers.filter((_, index) => results[index].status === 'fulfilled');

      if (successCount > 0) {
        const nextDistributedCount = await refreshDistributedCount(distributedCount + successCount);

        setDistributedCount(nextDistributedCount);
        setCustomers((prev) => prev.map((customer) => successfulIds.includes(customer.id)
          ? { ...customer, hasVoucher: true, voucherStatus: 'CO_HIEU_LUC' }
          : customer
        ));
        setSelectedCustomers((prev) => prev.filter((id) => !successfulIds.includes(id)));
        onSuccess?.(nextDistributedCount);
      }

      if (failedResults.length === 0) {
        alert(`Phân phối voucher thành công cho ${successCount} khách hàng`);
        onClose();
        return;
      }

      const firstError = failedResults[0];
      const firstMessage = firstError.status === 'rejected'
        ? mapDistributeError(formatApiError(firstError.reason, 'Lỗi phân phối voucher'))
        : 'Lỗi phân phối voucher';
      const failureMessage = successCount > 0
        ? `Đã phân phối thành công ${successCount}/${results.length} khách hàng. ${failedResults.length} khách hàng thất bại: ${firstMessage}`
        : firstMessage;

      setError(failureMessage);
      alert(`Lỗi: ${failureMessage}`);

    } catch (err: unknown) {
      const mappedMessage = mapDistributeError(formatApiError(err, 'Lỗi phân phối voucher'));
      setError(mappedMessage);
      alert(`Lỗi: ${mappedMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeSelected = async () => {
    if (!voucher || selectedCustomers.length === 0) return;
    setRevokingCustomerId('bulk');
    setError(null);
    try {
      const results = await Promise.allSettled(
        selectedCustomers.map((maKhachHang) => promotionsService.thuHoi(voucher.id, maKhachHang))
      );
      const failedResults = results.filter((result) => result.status === 'rejected');
      const successCount = results.length - failedResults.length;
      const revokedIds = selectedCustomers.filter((_, index) => results[index].status === 'fulfilled');

      if (successCount > 0) {
        const nextDistributedCount = await refreshDistributedCount(Math.max(distributedCount - successCount, 0));
        setDistributedCount(nextDistributedCount);
        setCustomers((prev) => prev.map((customer) => revokedIds.includes(customer.id)
          ? { ...customer, hasVoucher: false, voucherStatus: undefined }
          : customer
        ));
        setSelectedCustomers((prev) => prev.filter((id) => !revokedIds.includes(id)));
        onSuccess?.(nextDistributedCount);
      }

      if (failedResults.length === 0) {
        alert(`Thu hồi voucher thành công cho ${successCount} khách hàng`);
        onClose();
        return;
      }

      const firstError = failedResults[0];
      const firstMessage = firstError.status === 'rejected'
        ? mapDistributeError(formatApiError(firstError.reason, 'Lỗi thu hồi voucher'))
        : 'Lỗi thu hồi voucher';
      const failureMessage = successCount > 0
        ? `Đã thu hồi voucher thành công ${successCount}/${results.length} khách hàng. ${failedResults.length} khách hàng thất bại: ${firstMessage}`
        : firstMessage;
      setError(failureMessage);
      alert(`Lỗi: ${failureMessage}`);
    } catch (err: unknown) {
      const message = mapDistributeError(formatApiError(err, 'Lỗi thu hồi voucher'));
      setError(message);
      alert(`Lỗi: ${message}`);
    } finally {
      setRevokingCustomerId(null);
    }
  };

  const dieuKien = voucher.name || '';
  const splitIndex = dieuKien.toLowerCase().indexOf('đơn tối thiểu');
  const programName = splitIndex !== -1 ? dieuKien.substring(0, splitIndex).replace(/[.\s]+$/, '') : dieuKien;
  const minOrder = splitIndex !== -1 ? dieuKien.substring(splitIndex) : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isRevokeMode ? 'Thu hồi Voucher' : 'Phân phối Voucher'} - ${voucher.code}`}
      size="xl"
      footer={
        <div className="flex justify-between w-full">
          <div></div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Hủy</Button>
            {!isRevokeMode && (
              <Button
                variant="primary"
                icon={<Send size={18} />}
                onClick={handleDistribute}
                disabled={selectedCustomers.length === 0 || submitting || selectedCustomers.length > availableQuantity}
              >
                {submitting ? 'Đang phân phối...' : 'Thực hiện phân phối'}
              </Button>
            )}
            {isRevokeMode && (
              <Button
                variant="danger"
                onClick={handleRevokeSelected}
                disabled={selectedCustomers.length === 0 || revokingCustomerId === 'bulk'}
              >
                {revokingCustomerId === 'bulk' ? 'Đang thu hồi...' : 'Thu hồi'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-6">
        {/* Thông tin Voucher */}
        <div className="bg-[#F4F9FF] p-5 rounded-xl border border-[#E1F1FF] flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <p className="text-gray-500 text-xs mb-1">Tên chương trình</p>
                <p className="font-medium text-sm">{programName}</p>
                {minOrder && <p className="text-xs text-gray-500 mt-1">{minOrder}</p>}
             </div>
             <div>
                <p className="text-gray-500 text-xs mb-1">Loại giảm giá</p>
                <p className="font-medium text-sm">
                  {voucher.discountType === 'percent' ? `Phần trăm` : `Số tiền`}
                </p>
             </div>
             <div>
                <p className="text-gray-500 text-xs mb-1">Giá trị giảm</p>
                <p className="font-medium text-sm">
                  {voucher.discountType === 'percent' ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString()} VNĐ`}
                </p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <p className="text-gray-500 text-xs mb-1">Đã phát / Tổng số</p>
                <p className="font-medium text-sm">
                   {distributedCount} / {voucher.quantity}
                </p>
             </div>
             <div>
                <p className="text-gray-500 text-xs mb-1">Ngày bắt đầu</p>
                <p className="font-medium text-sm">{voucher.startDate || '-'}</p>
             </div>
             <div>
                <p className="text-gray-500 text-xs mb-1">Hạn sử dụng</p>
                <p className="font-medium text-sm">{voucher.expiryDate || '-'}</p>
             </div>
          </div>
        </div>

        {!isRevokeMode && (
          <div className="flex items-center gap-2 text-sm text-[#00668A] bg-[#E1F1FF] p-3 rounded-lg">
            <AlertCircle size={16} />
            <span>
              Còn lại <strong>{availableQuantity}</strong> voucher để phân phối
            </span>
          </div>
        )}

        {isRevokeMode && (
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
              Có hiệu lực: <strong>{activeVoucherCount}</strong>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600">
              Đã sử dụng: <strong>{usedVoucherCount}</strong>
            </div>
          </div>
        )}

        {error && <div className="text-sm text-[#BA1A1A] bg-red-50 border border-red-100 p-3 rounded-lg">{error}</div>}

        {/* Bảng Khách hàng */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm text-[#00668A]">
              {isRevokeMode ? 'Khách hàng đã được phân bổ voucher' : 'Danh sách khách hàng mục tiêu'}
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-[200px]">
                <Select 
                  options={[
                    { value: 'all', label: 'Tất cả hạng thẻ' },
                    { value: 'THANH_VIEN', label: 'Thành viên' },
                    { value: 'DONG', label: 'Đồng' },
                    { value: 'BAC', label: 'Bạc' },
                    { value: 'VANG', label: 'Vàng' },
                    { value: 'KIM_CUONG', label: 'Kim cương' }
                  ]} 
                  value={filterTier} 
                  onChange={setFilterTier} 
                />
              </div>
              {!isRevokeMode && <span className="text-sm text-gray-500 whitespace-nowrap">Đã chọn: {selectedCustomers.length}</span>}
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-gray-500">Đang tải khách hàng...</div>
            ) : (
              <Table
                columns={columns}
                dataSource={visibleCustomers}
                rowKey="id"
                emptyText={isRevokeMode ? 'Chưa có khách hàng nào được phân bổ hoặc sử dụng voucher' : 'Không có khách hàng phù hợp'}
                onRowClick={(record) => {
                  const isDisabled = isRevokeMode ? record.voucherStatus !== 'CO_HIEU_LUC' : record.hasVoucher;
                  if (isDisabled) return;
                  if (selectedCustomers.includes(record.id)) {
                    setSelectedCustomers(selectedCustomers.filter(id => id !== record.id));
                  } else {
                    setSelectedCustomers([...selectedCustomers, record.id]);
                  }
                }}
                rowClassName={(record) => {
                  const isDisabled = isRevokeMode ? record.voucherStatus !== 'CO_HIEU_LUC' : record.hasVoucher;
                  return isDisabled ? 'opacity-60 cursor-not-allowed' : '';
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DistributeVoucherModal;
