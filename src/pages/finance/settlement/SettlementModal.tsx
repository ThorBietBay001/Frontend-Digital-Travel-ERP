import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { AlertTriangle, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import type { SettlementTour } from './mockData';
import { tourInstanceService } from '../../../services/tour-instance';
import { financeService } from '../../../services/finance';
import { formatDate } from '../../../utils/dateHelpers';



export interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: SettlementTour | null;
  onSettle?: (id: string, status: 'completed' | 'pending_info' | 'over_budget', note?: string) => void;
  readonly?: boolean;
}

const SettlementModal: React.FC<SettlementModalProps> = ({ isOpen, onClose, tour, onSettle, readonly = false }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [localRevenue, setLocalRevenue] = useState(0);
  const [localAllotment, setLocalAllotment] = useState(0);
  const [localActual, setLocalActual] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);
  const [extraDetails, setExtraDetails] = useState({
    guideName: 'Đang tải...',
    guideCode: '...',
    startDate: '...',
    endDate: '...',
    passengerCount: 0 as number | string
  });

  useEffect(() => {
    if (tour && isOpen) {
      setLocalRevenue(tour.totalRevenue);
      setLocalAllotment(tour.totalAllotmentCost);
      setLocalActual(tour.totalActualCost);
      setGrossProfit(tour.totalRevenue - tour.totalActualCost);
      setNote('');
      setNoteError('');
      setConfirmOpen(false);

      setExtraDetails({
        guideName: 'Đang tải...',
        guideCode: '...',
        startDate: '...',
        endDate: '...',
        passengerCount: 'Đang tải...'
      });

      tourInstanceService.chiTiet(tour.code).then(res => {
        if (res) {
          setExtraDetails(prev => ({
            ...prev,
            startDate: formatDate(res.ngayKhoiHanh),
            endDate: formatDate(res.ngayKetThuc),
            passengerCount: res.soKhachToiDa || 0
          }));
        }
      }).catch(() => {});

      financeService.danhSachChiPhi({ maTour: tour.code, size: 100 }).then(res => {
        const cost = res?.content?.find(c => c.maTour === tour.code);
        if (cost) {
          setExtraDetails(prev => ({
            ...prev,
            guideName: cost.tenNhanVien || 'Không xác định',
            guideCode: cost.maNhanVien || 'N/A'
          }));
        } else {
          setExtraDetails(prev => ({
            ...prev,
            guideName: 'Không xác định',
            guideCode: 'N/A'
          }));
        }
      }).catch(() => {});
    }
  }, [tour, isOpen]);

  if (!tour) return null;

  const totalActualOverBudget = localActual > localAllotment;
  const isLoss = grossProfit < 0;

  const handleRecalculate = () => {
    setGrossProfit(localRevenue - localActual);
  };

  const handleRequireInfo = () => {
    if (!note.trim()) {
      setNoteError('Vui lòng nhập nội dung yêu cầu');
      return;
    }
    onSettle?.(tour.id, 'pending_info', note.trim());
    onClose();
  };



  const handleConfirmSettle = () => {
    onSettle?.(tour.id, 'completed', note.trim() || undefined);
    setConfirmOpen(false);
    onClose();
  };

  const renderFooter = () => {
    if (readonly) {
      return (
        <div className="w-full flex justify-end">
          <Button variant="secondary" onClick={onClose}>Đóng</Button>
        </div>
      );
    }

    return (
      <div className="w-full flex justify-end">
        <div className="flex gap-3">
          <Button variant="secondary" icon={<FileText size={16} />} onClick={handleRequireInfo}>
            Yêu cầu bổ sung
          </Button>
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
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={readonly ? 'Chi tiết quyết toán' : 'Quyết toán tour'}
        size="lg"
        footer={renderFooter()}
      >
        <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
              <h3 className="text-[20px] font-semibold text-gray-900 mb-3">Thông tin chung</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">Thời gian</span>
                  <span className="font-medium text-gray-800">{extraDetails.startDate} đến {extraDetails.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số khách</span>
                  <span className="font-medium text-gray-800">{extraDetails.passengerCount} khách</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">HDV</span>
                  <span className="font-medium text-gray-800">{extraDetails.guideName} ({extraDetails.guideCode})</span>
                </div>
                {tour.approverName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Người duyệt</span>
                    <span className="font-medium text-gray-800">{tour.approverName}</span>
                  </div>
                )}
                {readonly && (
                  <div className="flex justify-between pt-2 border-t border-[#E1F1FF]">
                    <span className="text-gray-500">Trạng thái</span>
                    <Badge label="Đã quyết toán" variant="success" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[20px] font-semibold text-gray-900">Tổng hợp tài chính</h3>
                {!readonly && (
                  <Button variant="ghost" size="sm" icon={<RefreshCw size={16} />} onClick={handleRecalculate}>
                    Tính toán lại
                  </Button>
                )}
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
              {totalActualOverBudget && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span>Cảnh báo: Tổng chi phí thực tế vượt ngân sách cam kết.</span>
                </div>
              )}
            </div>

            {!readonly && (
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
            )}

            {readonly && tour.settlementNote && (
              <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
                <label className="text-sm font-semibold text-gray-700">Ghi chú quyết toán</label>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{tour.settlementNote}</p>
                {tour.receiptImage && (
                  <a
                    href={tour.receiptImage}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-[#00668A] hover:underline"
                  >
                    Xem HoaDonAnh
                  </a>
                )}
              </div>
            )}

            {!readonly && (tour.settlementNote || tour.receiptImage) && (
              <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
                {tour.settlementNote && (
                  <>
                    <label className="text-sm font-semibold text-gray-700">Trao đổi bổ sung</label>
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{tour.settlementNote}</p>
                  </>
                )}
                {tour.receiptImage && (
                  <a
                    href={tour.receiptImage}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-[#00668A] hover:underline"
                  >
                    Xem HoaDonAnh
                  </a>
                )}
              </div>
            )}
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
