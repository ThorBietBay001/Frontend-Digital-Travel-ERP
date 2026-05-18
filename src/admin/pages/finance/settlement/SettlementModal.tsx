import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table } from '../../../components/ui/Table';
import { AlertTriangle, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import type { Column } from '../../../components/ui/Table';
import type { SettlementTour } from './mockData';

export interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: SettlementTour | null;
  onSettle?: (id: string, status: 'completed' | 'pending_info' | 'over_budget', note?: string) => void;
}

const SettlementModal: React.FC<SettlementModalProps> = ({ isOpen, onClose, tour, onSettle }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [localRevenue, setLocalRevenue] = useState(0);
  const [localAllotment, setLocalAllotment] = useState(0);
  const [localActual, setLocalActual] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);

  useEffect(() => {
    if (tour && isOpen) {
      setLocalRevenue(tour.totalRevenue);
      setLocalAllotment(tour.totalAllotmentCost);
      setLocalActual(tour.totalActualCost);
      setGrossProfit(tour.totalRevenue - tour.totalAllotmentCost - tour.totalActualCost);
      setNote('');
      setNoteError('');
      setConfirmOpen(false);
    }
  }, [tour, isOpen]);

  if (!tour) return null;

  const totalActualOverBudget = localActual > localAllotment;
  const isLoss = grossProfit < 0;

  const costColumns: Column<SettlementTour['actualCostItems'][number]>[] = [
    {
      key: 'category',
      title: 'Hạng mục chi',
      dataIndex: 'category',
    },
    {
      key: 'amount',
      title: 'Số tiền',
      align: 'right',
      render: (record) => <span className="font-semibold text-gray-800">{record.amount.toLocaleString('vi-VN')}</span>,
    },
    {
      key: 'status',
      title: 'Trạng thái duyệt',
      render: (record) => (
        record.status === 'approved'
          ? <Badge label="Đã duyệt" variant="success" />
          : <Badge label="Chờ duyệt" variant="warning" />
      ),
    },
    {
      key: 'warning',
      title: 'Cảnh báo',
      render: (record) => (
        record.warning ? <span className="text-xs text-red-600 font-medium">{record.warning}</span> : '-'
      ),
    },
  ];

  const handleRecalculate = () => {
    setGrossProfit(localRevenue - localAllotment - localActual);
  };

  const handleRequireInfo = () => {
    if (!note.trim()) {
      setNoteError('Vui lòng nhập nội dung yêu cầu');
      return;
    }
    onSettle?.(tour.id, 'pending_info', note.trim());
    onClose();
  };

  const handleOverBudgetApproval = () => {
    if (!window.confirm('Trình duyệt vượt chi cho cấp quản lý?')) {
      return;
    }
    onSettle?.(tour.id, 'over_budget', note.trim() || undefined);
    onClose();
  };

  const handleConfirmSettle = () => {
    onSettle?.(tour.id, 'completed', note.trim() || undefined);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Quyết toán tour"
        size="3xl"
        footer={(
          <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-amber-700">
              {totalActualOverBudget && 'Cảnh báo: Tổng chi phí thực tế vượt ngân sách cam kết.'}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" icon={<FileText size={16} />} onClick={handleRequireInfo}>
                Yêu cầu bổ sung
              </Button>
              {totalActualOverBudget && (
                <Button
                  variant="secondary"
                  className="border-amber-400 text-amber-700 hover:bg-amber-50"
                  icon={<AlertTriangle size={16} />}
                  onClick={handleOverBudgetApproval}
                >
                  Trình duyệt vượt chi
                </Button>
              )}
              <Button
                variant="primary"
                className="bg-[#00668A] hover:bg-[#005173]"
                onClick={() => setConfirmOpen(true)}
                icon={<CheckCircle size={16} />}
              >
                Hoàn tất quyết toán
              </Button>
            </div>
          </div>
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
              <h3 className="text-[20px] font-semibold text-gray-900 mb-3">Thông tin chung</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">Thời gian</span>
                  <span className="font-medium text-gray-800">{tour.startDate} - {tour.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số khách</span>
                  <span className="font-medium text-gray-800">{tour.passengerCount} khách</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">HDV</span>
                  <span className="font-medium text-gray-800">{tour.guideName} ({tour.guideCode})</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[20px] font-semibold text-gray-900">Tổng hợp tài chính</h3>
                <Button variant="ghost" size="sm" icon={<RefreshCw size={16} />} onClick={handleRecalculate}>
                  Tính toán lại
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng doanh thu</span>
                  <span className="font-semibold text-emerald-700">{localRevenue.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng chi phí cam kết</span>
                  <span className="font-semibold text-gray-800">{localAllotment.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng chi phí thực tế</span>
                  <span className="font-semibold text-gray-800">{localActual.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="border-t border-dashed border-[#E1F1FF] pt-3 flex justify-between">
                  <span className="text-gray-500">Lợi nhuận gộp</span>
                  <span className={`font-semibold ${isLoss ? 'text-red-600' : 'text-emerald-700'}`}>
                    {grossProfit.toLocaleString('vi-VN')} VND
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
              <label className="text-sm font-semibold text-gray-700">Ghi chú</label>
              <textarea
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  if (noteError) setNoteError('');
                }}
                placeholder="Nhập ghi chú..."
                className={`mt-2 w-full min-h-[110px] rounded-[12px] border px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 ${
                  noteError
                    ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
                    : 'border-[#C5EAFF] focus:border-[#89D4FF] focus:ring-[#89D4FF]/20'
                }`}
              />
              {noteError && <p className="mt-2 text-xs text-red-600">{noteError}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="text-[20px] font-semibold text-gray-900">Danh sách chi phí thực tế</h3>
            </div>
            <Table
              columns={costColumns}
              dataSource={tour.actualCostItems}
              rowKey={(record) => record.category}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Xác nhận quyết toán?"
        size="sm"
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Quay lại</Button>
            <Button variant="primary" onClick={handleConfirmSettle}>Xác nhận</Button>
          </div>
        )}
      >
        <p className="text-sm text-gray-600">
          Xác nhận quyết toán? Hành động này sẽ chốt số liệu tài chính cho Tour này. Bạn không thể sửa đổi sau khi hoàn tất.
        </p>
      </Modal>
    </>
  );
};

export default SettlementModal;
