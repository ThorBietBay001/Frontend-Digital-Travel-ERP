import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { FileText, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import type { RefundRequest } from './mockData';
import { ordersService } from '../../../services/orders';
import { useNotification } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/dateHelpers';

export interface RefundProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  refund: RefundRequest | null;
  onProcessRefund?: (id: string, action: 'complete' | 'reject', data?: RefundData) => Promise<void>;
  readonly?: boolean;
}

export interface RefundData {
  method: 'gateway' | 'manual';
  bankAccount?: string;
  bankName?: string;
  transactionCode?: string;
}

const RefundProcessingModal: React.FC<RefundProcessingModalProps> = ({
  isOpen,
  onClose,
  refund,
  onProcessRefund,
  readonly = false,
}) => {
  const { confirm } = useNotification();
  const [method, setMethod] = useState<'gateway' | 'manual'>('gateway');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [bankAccountError, setBankAccountError] = useState('');
  const [transactionError, setTransactionError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    if (refund?.refundMethod) {
      setMethod(refund.refundMethod);
    }
    if (isOpen) {
      setBankAccount(refund?.bankAccount || '');
      setBankName(refund?.bankName || '');
      setTransactionCode(refund?.transactionCode || '');
      setBankAccountError('');
      setTransactionError('');
      setErrorMessage('');
      setProcessing(false);
      setOrderInfo(null);
      
      if (refund?.orderCode) {
        ordersService.chiTietDatTour(refund.orderCode)
          .then(res => setOrderInfo(res))
          .catch(err => console.error('Failed to fetch order', err));
      }
    }
  }, [refund, isOpen]);

  if (!refund) return null;

  const handleReject = async () => {
    if (!(await confirm('Bạn có chắc chắn muốn từ chối yêu cầu hoàn tiền này?'))) {
      return;
    }
    setErrorMessage('');
    setProcessing(true);

    try {
      const order = await ordersService.chiTietDatTour(refund.orderCode);
      if (order.trangThai !== 'CHO_HUY') {
        setErrorMessage(`Chỉ có thể từ chối hoàn tiền cho đơn hàng ở trạng thái Chờ Hủy. Trạng thái hiện tại: ${order.trangThai}`);
        setProcessing(false);
        return;
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Không thể kiểm tra trạng thái đơn hàng.');
      setProcessing(false);
      return;
    }

    try {
      await onProcessRefund?.(refund.id, 'reject');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể xử lý hoàn tiền. Vui lòng kiểm tra lại trạng thái đơn hàng.');
      setProcessing(false);
    }
  };

  const handleConfirmRefund = async () => {
    setErrorMessage('');
    setProcessing(true);

    try {
      const order = await ordersService.chiTietDatTour(refund.orderCode);
      if (order.trangThai !== 'CHO_HUY') {
        setErrorMessage(`Chỉ có thể hoàn tiền cho đơn hàng ở trạng thái Chờ Hủy. Trạng thái hiện tại: ${order.trangThai}`);
        setProcessing(false);
        return;
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Không thể kiểm tra trạng thái đơn hàng.');
      setProcessing(false);
      return;
    }

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
      if (hasError) {
        setProcessing(false);
        return;
      }

      try {
        await onProcessRefund?.(refund.id, 'complete', {
          method: 'manual',
          bankAccount: bankAccount.trim(),
          bankName: bankName.trim(),
          transactionCode: transactionCode.trim(),
        });
        onClose();
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || err.message || 'Không thể xử lý hoàn tiền. Vui lòng kiểm tra lại trạng thái đơn hàng.');
        setProcessing(false);
      }
      return;
    }

    try {
      await onProcessRefund?.(refund.id, 'complete', { method: 'gateway' });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể xử lý hoàn tiền. Vui lòng kiểm tra lại trạng thái đơn hàng.');
      setProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={readonly ? 'Chi tiết hoàn tiền' : 'Xử lý hoàn tiền'}
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
              disabled={processing}
            >
              {processing ? 'Đang kiểm tra...' : 'Xác nhận Hoàn Tiền'}
            </Button>
          </div>
        )
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6 flex-1">
            <h3 className="text-sm font-semibold text-[#00668A] mb-4 uppercase tracking-wider">Thông tin tour</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Đơn hàng</div>
                <div className="text-sm font-semibold text-[#00668A]">{refund.orderCode}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Mã tour thực tế</div>
                <div className="text-sm font-medium text-[#121C2C]">{orderInfo?.maTourThucTe || 'Đang tải...'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Tên tour</div>
                <div className="text-sm font-medium text-[#121C2C] line-clamp-2">{orderInfo?.tieuDeTour || 'Đang tải...'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Ngày khởi hành</div>
                <div className="text-sm font-medium text-[#121C2C]">{formatDate(orderInfo?.ngayKhoiHanh)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6 flex-1">
            <h3 className="text-sm font-semibold text-[#00668A] mb-4 uppercase tracking-wider">Thông tin khách hàng</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Mã khách hàng</div>
                <div className="text-sm font-medium text-[#121C2C]">{orderInfo?.maKhachHang || 'Đang tải...'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Họ và tên</div>
                <div className="text-sm font-medium text-[#121C2C]">{orderInfo?.tenKhachHang || refund.customerName}</div>
              </div>
              {orderInfo?.soDienThoai && (
                <div>
                  <div className="text-xs text-gray-500">Số điện thoại</div>
                  <div className="text-sm font-medium text-[#121C2C]">{orderInfo.soDienThoai}</div>
                </div>
              )}
            </div>
          </div>


        </div>

        <div className="flex flex-col gap-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 text-sm text-red-700 flex gap-2">
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <h3 className="text-sm font-semibold text-[#00668A] mb-4 uppercase tracking-wider">Thông tin hủy tour</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Mã giao dịch hoàn</div>
                <div className="text-sm font-medium text-[#121C2C]">{refund.code}</div>
              </div>

              {refund.attachments?.length ? (
                <div>
                  <div className="text-xs text-gray-500">Chứng từ đính kèm</div>
                  <div className="mt-2 space-y-2">
                    {refund.attachments.map((file) => (
                      <div key={file} className="flex items-center gap-2 text-sm text-[#00668A]">
                        <FileText size={16} />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6 flex flex-col gap-6 flex-1">
            <div>
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
              <div className="space-y-4">
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
              </div>
            )}

            <div className="mt-auto bg-amber-50 border border-amber-200 rounded-[12px] p-4 flex flex-row items-center justify-between">
              <div className="text-sm text-amber-700 uppercase tracking-wider font-bold">Tổng tiền cần hoàn</div>
              <div className="text-xl font-bold text-amber-700">{refund.amount.toLocaleString('vi-VN')} VND</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RefundProcessingModal;
