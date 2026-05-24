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


interface DistributeVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher | null;
  mode?: 'distribute' | 'revoke';
  onSuccess?: () => void;
}

const DistributeVoucherModal: React.FC<DistributeVoucherModalProps> = ({ isOpen, onClose, voucher, mode = 'distribute', onSuccess }) => {
  const [customers, setCustomers] = useState<CustomerTarget[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distributedCount, setDistributedCount] = useState(0);
  const [revokingCustomerId, setRevokingCustomerId] = useState<string | null>(null);

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
        const distributedIds = new Set(distributedCustomers.map((item) => item.maKhachHang).filter(Boolean));
        setCustomers((res?.content || []).map((customer) => ({
          id: customer.maKhachHang || '',
          name: customer.hoTen || '',
          email: customer.email || '',
          tier: customer.hangThanhVien || '',
          phone: customer.soDienThoai || '',
          hasVoucher: distributedIds.has(customer.maKhachHang || ''),
        })).filter((customer) => customer.id));
      })
      .catch((err: unknown) => {
        const message = formatApiError(err, 'Lỗi tải danh sách khách hàng');
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [isOpen, voucher]);

  if (!voucher) return null;

  const availableQuantity = Math.max(voucher.quantity - distributedCount, 0);
  const distributableCustomers = customers.filter((customer) => !customer.hasVoucher);
  const visibleCustomers = mode === 'revoke' ? customers.filter((customer) => customer.hasVoucher) : customers;
  const isRevokeMode = mode === 'revoke';

  const checkboxCustomers = isRevokeMode ? visibleCustomers : distributableCustomers;

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
          disabled={!isRevokeMode && record.hasVoucher}
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
    { key: 'tier', title: 'Hạng thẻ', dataIndex: 'tier' },
    ...(!isRevokeMode ? [
      { key: 'phone', title: 'SĐT', dataIndex: 'phone' } as Column<CustomerTarget>,
      {
        key: 'voucherStatus',
        title: 'Voucher',
        render: (record) => record.hasVoucher
          ? <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-2 py-1">Đã phân bổ</span>
          : <span className="text-xs text-gray-500">Chưa phân bổ</span>,
      } as Column<CustomerTarget>,
      {
        key: 'action',
        title: 'Thao tác',
        render: (record) => record.hasVoucher ? (
          <Button
            size="sm"
            variant="danger"
            disabled={revokingCustomerId === record.id}
            onClick={() => handleRevoke(record.id)}
          >
            {revokingCustomerId === record.id ? 'Đang thu hồi...' : 'Thu hồi'}
          </Button>
        ) : null,
      } as Column<CustomerTarget>,
    ] : []),
  ];

  const refreshDistributedCount = async (fallbackCount: number) => {
    try {
      const latestVoucher = await promotionsService.chiTiet_2(voucher.id);
      return latestVoucher?.soLuotDaPhanBo ?? latestVoucher?.soLuotDaDung ?? fallbackCount;
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
          ? { ...customer, hasVoucher: true }
          : customer
        ));
        setSelectedCustomers((prev) => prev.filter((id) => !successfulIds.includes(id)));
        onSuccess?.();
      }

      if (failedResults.length === 0) {
        alert(`Phân phối voucher thành công cho ${successCount} khách hàng`);
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

  const handleRevoke = async (maKhachHang: string) => {
    if (!voucher) return;
    setRevokingCustomerId(maKhachHang);
    setError(null);
    try {
      await promotionsService.thuHoi(voucher.id, maKhachHang);
      const nextDistributedCount = await refreshDistributedCount(Math.max(distributedCount - 1, 0));
      setDistributedCount(nextDistributedCount);
      setCustomers((prev) => prev.map((customer) => customer.id === maKhachHang
        ? { ...customer, hasVoucher: false }
        : customer
      ));
      alert('Thu hồi voucher thành công');
      onSuccess?.();
    } catch (err: unknown) {
      const message = mapDistributeError(formatApiError(err, 'Lỗi thu hồi voucher'));
      setError(message);
      alert(`Lỗi: ${message}`);
    } finally {
      setRevokingCustomerId(null);
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
          ? { ...customer, hasVoucher: false }
          : customer
        ));
        setSelectedCustomers((prev) => prev.filter((id) => !revokedIds.includes(id)));
        onSuccess?.();
      }

      if (failedResults.length === 0) {
        alert(`Hủy voucher thành công cho ${successCount} khách hàng`);
        return;
      }

      const firstError = failedResults[0];
      const firstMessage = firstError.status === 'rejected'
        ? mapDistributeError(formatApiError(firstError.reason, 'Lỗi hủy voucher'))
        : 'Lỗi hủy voucher';
      const failureMessage = successCount > 0
        ? `Đã hủy voucher thành công ${successCount}/${results.length} khách hàng. ${failedResults.length} khách hàng thất bại: ${firstMessage}`
        : firstMessage;
      setError(failureMessage);
      alert(`Lỗi: ${failureMessage}`);
    } catch (err: unknown) {
      const message = mapDistributeError(formatApiError(err, 'Lỗi hủy voucher'));
      setError(message);
      alert(`Lỗi: ${message}`);
    } finally {
      setRevokingCustomerId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isRevokeMode ? 'Thu hồi Voucher' : 'Phân phối Voucher'} - ${voucher.code}`}
      size="lg"
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
                {revokingCustomerId === 'bulk' ? 'Đang hủy...' : 'Hủy voucher'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-6">
        {/* Thông tin Voucher */}
        <div className="bg-[#F4F9FF] p-4 rounded-lg border border-[#E1F1FF] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Tên chương trình</p>
            <p className="font-semibold text-sm">{voucher.name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Loại giảm giá</p>
            <p className="font-semibold text-sm">
              {voucher.discountType === 'percent' ? `Giảm ${voucher.discountValue}%` : `Giảm ${voucher.discountValue.toLocaleString()}đ`}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Đã phát/Tổng</p>
            <p className="font-semibold text-sm">{distributedCount}/{voucher.quantity}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Ngày bắt đầu</p>
            <p className="font-semibold text-sm">{voucher.startDate || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Hạn sử dụng</p>
            <p className="font-semibold text-sm">{voucher.expiryDate || '-'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#00668A] bg-[#E1F1FF] p-3 rounded-lg">
          <AlertCircle size={16} />
          <span>
            {isRevokeMode
              ? <>Đang có <strong>{distributedCount}</strong> khách hàng được phân bổ voucher</>
              : <>Còn lại <strong>{availableQuantity}</strong> voucher để phân phối</>}
          </span>
        </div>

        {error && <div className="text-sm text-[#BA1A1A] bg-red-50 border border-red-100 p-3 rounded-lg">{error}</div>}

        {/* Bảng Khách hàng */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm text-[#00668A]">
              {isRevokeMode ? 'Khách hàng đã được phân bổ voucher' : 'Danh sách khách hàng mục tiêu'}
            </h3>
            {!isRevokeMode && <span className="text-sm text-gray-500">Đã chọn: {selectedCustomers.length}</span>}
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-gray-500">Đang tải khách hàng...</div>
            ) : (
              <Table
                columns={columns}
                dataSource={visibleCustomers}
                rowKey="id"
                emptyText={isRevokeMode ? 'Chưa có khách hàng nào được phân bổ voucher' : 'Không có khách hàng phù hợp'}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DistributeVoucherModal;
