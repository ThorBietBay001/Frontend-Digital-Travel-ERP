import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { Voucher, CustomerTarget } from './mockData';
import { mockCustomerTargets } from './mockData';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';


interface DistributeVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher | null;
}

const DistributeVoucherModal: React.FC<DistributeVoucherModalProps> = ({ isOpen, onClose, voucher }) => {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [distributionQuantity, setDistributionQuantity] = useState<number | ''>('');

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
              setSelectedCustomers(mockCustomerTargets.map(c => c.id));
            } else {
              setSelectedCustomers([]);
            }
          }}
          checked={selectedCustomers.length === mockCustomerTargets.length && mockCustomerTargets.length > 0}
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
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn thu hồi voucher này khỏi ${voucher.distributed} khách hàng?`)) {
                    // Xử lý thu hồi
                    onClose();
                  }
                }}
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
              onClick={() => {
                // Xử lý phân phối
                if (selectedCustomers.length > 0 && distributionQuantity) {
                   onClose();
                }
              }}
              disabled={selectedCustomers.length === 0 || !distributionQuantity || Number(distributionQuantity) > availableQuantity}
            >
              Thực hiện phân phối
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

        {/* Bảng Khách hàng */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm text-[#00668A]">Danh sách khách hàng mục tiêu</h3>
            <span className="text-sm text-gray-500">Đã chọn: {selectedCustomers.length}</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
             <Table
                columns={columns}
                dataSource={mockCustomerTargets}
                rowKey="id"
              />
          </div>
        </div>

        {/* Số lượng phân phối */}
        <div className="w-1/2">
           <label className="block text-[#00668A] text-sm font-semibold mb-2">Số lượng cho mỗi khách hàng</label>
            <input
              type="number"
              value={distributionQuantity}
              onChange={(e) => setDistributionQuantity(Number(e.target.value))}
              max={availableQuantity}
              className="w-full px-4 py-2 border border-[#C5EAFF] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent"
              placeholder="Nhập số lượng"
            />
        </div>
      </div>
    </Modal>
  );
};

export default DistributeVoucherModal;