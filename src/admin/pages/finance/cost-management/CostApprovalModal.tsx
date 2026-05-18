import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { MapPin, Calendar, Phone, AlertTriangle, RefreshCw, Ban, CheckCircle } from 'lucide-react';
import type { CostItem } from './mockData';

export interface CostApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  cost: CostItem | null;
  onUpdateStatus?: (id: string, newStatus: 'approved' | 'rejected' | 'pending_info', note?: string) => void;
}

const CostApprovalModal: React.FC<CostApprovalModalProps> = ({ isOpen, onClose, cost, onUpdateStatus }) => {
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote('');
      setNoteError('');
    }
  }, [isOpen, cost?.id]);

  if (!cost) return null;

  const warningBadge = cost.status === 'warning'
    ? { label: cost.warningMessage || 'Cảnh báo vượt định mức', variant: 'warning' as const }
    : cost.status === 'error'
      ? { label: cost.warningMessage || 'Thiếu chứng từ', variant: 'error' as const }
      : null;

  const handleRequireMore = () => {
    if (!note.trim()) {
      setNoteError('Vui lòng nhập nội dung yêu cầu bổ sung');
      return;
    }
    onUpdateStatus?.(cost.id, 'pending_info', note.trim());
    onClose();
  };

  const handleReject = () => {
    if (!note.trim()) {
      setNoteError('Vui lòng nhập lý do từ chối');
      return;
    }
    onUpdateStatus?.(cost.id, 'rejected', note.trim());
    onClose();
  };

  const handleApprove = () => {
    onUpdateStatus?.(cost.id, 'approved');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phê duyệt chi phí"
      size="2xl"
      footer={(
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="secondary"
            className="border-amber-400 text-amber-700 hover:bg-amber-50"
            icon={<RefreshCw size={16} />}
            onClick={handleRequireMore}
          >
            Yêu cầu bổ sung
          </Button>
          <Button
            variant="ghost"
            className="border border-red-500 text-red-600 hover:bg-red-50"
            icon={<Ban size={16} />}
            onClick={handleReject}
          >
            Từ chối
          </Button>
          <Button
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700"
            icon={<CheckCircle size={16} />}
            onClick={handleApprove}
          >
            Phê duyệt
          </Button>
        </div>
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-semibold text-gray-900">Hóa đơn chi phí</h3>
              <Badge label="Ảnh hóa đơn" variant="info" />
            </div>
            <div className="w-full aspect-[4/3] rounded-[12px] overflow-hidden border border-[#E1F1FF] bg-[#F4F9FF]">
              <img
                src={cost.receiptImage}
                alt="Ảnh hóa đơn"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>Chụp lúc 08:45 - 02/10/2025</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <h3 className="text-[20px] font-semibold text-gray-900 mb-3">Thông tin tour & HDV</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Mã tour</span>
                <span className="font-semibold text-gray-800">{cost.tourCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tên tour</span>
                <span className="font-medium text-gray-800">{cost.tourName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Hướng dẫn viên</span>
                <span className="font-medium text-gray-800">{cost.guideName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">SĐT</span>
                <span className="font-medium text-gray-800 flex items-center gap-1">
                  <Phone size={14} className="text-gray-400" />
                  {cost.guidePhone}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <h3 className="text-[20px] font-semibold text-gray-900 mb-3">Chi tiết hạng mục</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Hạng mục</span>
                <span className="font-medium text-gray-800">{cost.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Số tiền</span>
                <span className="font-semibold text-[#00668A]">{cost.amount.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>

          {warningBadge && (
            <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4 text-sm text-amber-800 flex gap-2">
              <AlertTriangle size={18} className="mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Cảnh báo chi phí</div>
                <p>{warningBadge.label}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <label className="text-sm font-semibold text-gray-700">Ghi chú duyệt</label>
            <textarea
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                if (noteError) setNoteError('');
              }}
              placeholder="Nhập ghi chú duyệt..."
              className={`mt-2 w-full min-h-[110px] rounded-[12px] border px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 ${
                noteError
                  ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
                  : 'border-[#C5EAFF] focus:border-[#89D4FF] focus:ring-[#89D4FF]/20'
              }`}
            />
            {noteError && <p className="mt-2 text-xs text-red-600">{noteError}</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CostApprovalModal;
