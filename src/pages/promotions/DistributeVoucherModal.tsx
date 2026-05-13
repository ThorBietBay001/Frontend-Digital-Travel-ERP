import React, { useEffect, useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { Voucher, CustomerTarget } from './mockData';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { customersService } from '../../services/customers';
import { promotionsService } from '../../services/promotions';


interface DistributeVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher | null;
  onSuccess?: () => void;
}

const DistributeVoucherModal: React.FC<DistributeVoucherModalProps> = ({ isOpen, onClose, voucher, onSuccess }) => {
  const [customers, setCustomers] = useState<CustomerTarget[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCustomers([]);
    setError(null);
    setLoading(true);
    customersService.timKiemKhachHang()
      .then((res) => {
        setCustomers((res?.content || []).map((customer) => ({
          id: customer.maKhachHang || '',
          name: customer.hoTen || '',
          email: customer.email || '',
          tier: customer.hangThanhVien || '',
          phone: customer.soDienThoai || '',
        })).filter((customer) => customer.id));
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Lỗi tải danh sách khách hàng';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!voucher) return null;

  const availableQuantity = voucher.quantity - voucher.distributed;

  const columns: Column<CustomerTarget>[] = [
    {
      key: 'checkbox',
      title: (
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCustomers(customers.map(c => c.id));
            } else {
              setSelectedCustomers([]);
            }
          }}
          checked={selectedCustomers.length === customers.length && customers.length > 0}
        />
      ),
      render: (record) => (
        <input
          type="checkbox"
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
    { key: 'phone', title: 'SĐT', dataIndex: 'phone' },
  ];

  const handleDistribute = async () => {
    if (!voucher || selectedCustomers.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await Promise.all(
        selectedCustomers.map((maKhachHang) =>
          promotionsService.phatHanh(voucher.id, { maKhachHang })
        )
      );
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi phân phối voucher';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Phân phối Voucher - ${voucher.code}`}
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          <div>
            {voucher.distributed > 0 && (
              <Button
                variant="danger"
                className="bg-[#BA1A1A] text-white hover:bg-red-700"
                onClick={onClose}
              >
                Thu hồi
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Hủy</Button>
            <Button
              variant="primary"
              icon={<Send size={18} />}
              onClick={handleDistribute}
              disabled={selectedCustomers.length === 0 || submitting || selectedCustomers.length > availableQuantity}
            >
              {submitting ? 'Đang phân phối...' : 'Thực hiện phân phối'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-6">
        {/* Thông tin Voucher */}
        <div className="bg-[#F4F9FF] p-4 rounded-lg border border-[#E1F1FF] flex grid grid-cols-4 gap-4">
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
            <p className="font-semibold text-sm">{voucher.distributed}/{voucher.quantity}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Hạn sử dụng</p>
            <p className="font-semibold text-sm">{voucher.expiryDate}</p>
          </div>
        </div>

        {/* Cảnh báo số lượng */}
        <div className="flex items-center gap-2 text-sm text-[#00668A] bg-[#E1F1FF] p-3 rounded-lg">
          <AlertCircle size={16} />
          <span>Còn lại <strong>{availableQuantity}</strong> voucher để phân phối</span>
        </div>

        {error && <div className="text-sm text-[#BA1A1A] bg-red-50 border border-red-100 p-3 rounded-lg">{error}</div>}

        {/* Bảng Khách hàng */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm text-[#00668A]">Danh sách khách hàng mục tiêu</h3>
            <span className="text-sm text-gray-500">Đã chọn: {selectedCustomers.length}</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-gray-500">Đang tải khách hàng...</div>
            ) : (
              <Table
                columns={columns}
                dataSource={customers}
                rowKey="id"
                emptyText="Không có khách hàng phù hợp"
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DistributeVoucherModal;
