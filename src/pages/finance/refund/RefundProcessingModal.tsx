import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { FileText, Ban, CheckCircle, Upload } from 'lucide-react';
import type { RefundRequest } from './mockData';

export interface RefundProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  refund: RefundRequest | null;
  onProcessRefund?: (id: string, action: 'complete' | 'reject', data?: RefundData) => void;
  readonly?: boolean;
}

export interface RefundData {
  method: 'gateway' | 'manual';
  bankAccount?: string;
  transactionCode?: string;
}

const RefundProcessingModal: React.FC<RefundProcessingModalProps> = ({
  isOpen,
  onClose,
  refund,
  onProcessRefund,
  readonly = false,
}) => {
  const [method, setMethod] = useState<'gateway' | 'manual'>('gateway');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [bankAccountError, setBankAccountError] = useState('');
  const [transactionError, setTransactionError] = useState('');

  useEffect(() => {
    if (refund?.refundMethod) {
      setMethod(refund.refundMethod);
    }
    if (isOpen) {
      setBankAccount(refund?.bankAccount || '');
      setBankName('');
      setTransactionCode(refund?.transactionCode || '');
      setBankAccountError('');
      setTransactionError('');
    }
  }, [refund, isOpen]);

  if (!refund) return null;

  const handleReject = () => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu hoàn tiền này?')) {
      return;
    }
    onProcessRefund?.(refund.id, 'reject');
    onClose();
  };

  const handleConfirmRefund = () => {
    if (method === 'manual') {
      let hasError = false;
      if (!bankAccount.trim()) {
        setBankAccountError('Vui lòng nhập số tài khoản');
        hasError = true;
      }
      if (!transactionCode.trim()) {
        setTransactionError('Vui lòng nhập mã giao dịch');
        hasError = true;
      }
      if (hasError) return;

      onProcessRefund?.(refund.id, 'complete', {
        method: 'manual',
        bankAccount: bankAccount.trim(),
        transactionCode: transactionCode.trim(),
      });
      onClose();
      return;
    }

    onProcessRefund?.(refund.id, 'complete', { method: 'gateway' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xử lý hoàn tiền"
      size="2xl"
      footer={(
        readonly ? (
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>Đóng</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="danger" icon={<Ban size={16} />} onClick={handleReject}>Từ chối Yêu cầu</Button>
            <Button
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700"
              icon={<CheckCircle size={16} />}
              onClick={handleConfirmRefund}
            >
              Xác nhận Hoàn Tiền
            </Button>
          </div>
        )
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <div className="text-sm text-gray-500">Khách hàng</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{refund.customerName}</div>
            <div className="text-sm text-gray-500">{refund.customerPhone}</div>
          </div>
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <div className="text-sm text-gray-500">Đơn hàng</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{refund.orderCode}</div>
            <Badge label={refund.code} variant="info" className="mt-2" />
          </div>
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <div className="text-sm text-gray-500">Lý do hủy</div>
            <div className="text-sm text-gray-800 mt-2">{refund.reason}</div>
            {refund.attachments?.length ? (
              <div className="mt-3 space-y-2">
                {refund.attachments.map((file) => (
                  <div key={file} className="flex items-center gap-2 text-sm text-[#00668A]">
                    <FileText size={16} />
                    <span>{file}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-6">
            <div className="text-sm text-amber-700">Tổng tiền cần hoàn</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{refund.amount.toLocaleString('vi-VN')} VND</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <div className="text-sm font-semibold text-gray-700">Phương thức hoàn tiền</div>
            <div className="mt-3 space-y-3 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="refund-method"
                  checked={method === 'gateway'}
                  onChange={() => setMethod('gateway')}
                  disabled={readonly}
                  className="w-4 h-4 text-[#00668A] border-[#C5EAFF]"
                />
                Qua Cổng Thanh Toán
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="refund-method"
                  checked={method === 'manual'}
                  onChange={() => setMethod('manual')}
                  disabled={readonly}
                  className="w-4 h-4 text-[#00668A] border-[#C5EAFF]"
                />
                Hoàn Thủ Công
              </label>
            </div>
          </div>

          {method === 'manual' && (
            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Số tài khoản</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(event) => {
                    setBankAccount(event.target.value);
                    if (bankAccountError) setBankAccountError('');
                  }}
                  placeholder="Nhập số tài khoản"
                  disabled={readonly}
                  className={`mt-2 w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 ${
                    bankAccountError
                      ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
                      : 'border-[#C5EAFF] focus:border-[#89D4FF] focus:ring-[#89D4FF]/20'
                  }`}
                />
                {bankAccountError && <p className="mt-1 text-xs text-red-600">{bankAccountError}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Ngân hàng</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  placeholder="Tên ngân hàng"
                  disabled={readonly}
                  className="mt-2 w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Mã giao dịch</label>
                <input
                  type="text"
                  value={transactionCode}
                  onChange={(event) => {
                    setTransactionCode(event.target.value);
                    if (transactionError) setTransactionError('');
                  }}
                  placeholder="Nhập mã giao dịch"
                  disabled={readonly}
                  className={`mt-2 w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 ${
                    transactionError
                      ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
                      : 'border-[#C5EAFF] focus:border-[#89D4FF] focus:ring-[#89D4FF]/20'
                  }`}
                />
                {transactionError && <p className="mt-1 text-xs text-red-600">{transactionError}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Upload chứng từ</label>
                <button
                  type="button"
                  disabled={readonly}
                  onClick={() => alert('Chức năng đang phát triển')}
                  className="mt-2 w-full px-4 py-2.5 border border-dashed border-[#C5EAFF] rounded-lg text-sm text-gray-600 flex items-center justify-center gap-2 hover:border-[#89D4FF] hover:text-[#00668A]"
                >
                  <Upload size={16} />
                  Nhấn để tải lên file PDF/JPG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RefundProcessingModal;
