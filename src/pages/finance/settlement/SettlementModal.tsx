import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { AlertTriangle, RefreshCw, FileText, CheckCircle, Eye, DollarSign } from 'lucide-react';
import type { SettlementTour } from './mockData';
import { tourInstanceService } from '../../../services/tour-instance';
import { financeService } from '../../../services/finance';
import type { ChiPhiThucTeResponse } from '../../../services/finance';
import { formatDate, formatDateTime } from '../../../utils/dateHelpers';
import { useNotification } from '../../../context/NotificationContext';

interface ExpenseItem {
  maChiPhi: string;
  maTour?: string;
  maNhanVien?: string;
  tenNhanVien?: string;
  danhMuc?: string;
  thanhTien: number;
  hoaDonAnh?: string;
  trangThaiDuyet: string;
  ngayKhai?: string;
}

interface WarningItem {
  maCanhBao: string;
  maChiPhi: string;
  loaiCanhBao: string;
  mucDo: string;
  noiDung: string;
}

interface WarningResponse {
  maCanhBao?: string;
  maChiPhi?: string;
  loaiCanhBao?: string;
  mucDo?: string;
  noiDung?: string;
}

export interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: SettlementTour | null;
  onSettle?: (id: string, status: 'completed' | 'pending_info' | 'over_budget', note?: string) => void;
  readonly?: boolean;
}

const trangThaiLabels: Record<string, string> = {
  CHO_DUYET: 'Chờ duyệt',
  DA_DUYET: 'Đã duyệt',
  TU_CHOI: 'Từ chối',
  YEU_CAU_BO_SUNG: 'Yêu cầu bổ sung',
};

const trangThaiVariants: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
  CHO_DUYET: 'warning',
  DA_DUYET: 'success',
  TU_CHOI: 'error',
  YEU_CAU_BO_SUNG: 'info',
};

const mapExpense = (expense: ChiPhiThucTeResponse, index: number): ExpenseItem => ({
  maChiPhi: expense.maChiPhi || `${expense.maTour || 'CP'}-${index}`,
  maTour: expense.maTour,
  maNhanVien: expense.maNhanVien,
  tenNhanVien: expense.tenNhanVien || 'Không xác định',
  danhMuc: expense.danhMuc || 'Chưa phân loại',
  thanhTien: expense.thanhTien || 0,
  hoaDonAnh: expense.hoaDonAnh,
  trangThaiDuyet: expense.trangThaiDuyet || 'CHO_DUYET',
  ngayKhai: expense.ngayKhai,
});

const mapWarning = (warning: WarningResponse, index: number): WarningItem => ({
  maCanhBao: warning.maCanhBao || `${warning.maChiPhi || 'CB'}-${index}`,
  maChiPhi: warning.maChiPhi || '',
  loaiCanhBao: warning.loaiCanhBao || 'BAT_THUONG',
  mucDo: warning.mucDo || 'THAP',
  noiDung: warning.noiDung || 'Cần kiểm tra khoản chi phí này.',
});

const SettlementModal: React.FC<SettlementModalProps> = ({ isOpen, onClose, tour, onSettle, readonly = false }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [localRevenue, setLocalRevenue] = useState(0);
  const [committedCost, setCommittedCost] = useState<number>(0);
  const [hdvActualCost, setHdvActualCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null);
  const [expenseDetailOpen, setExpenseDetailOpen] = useState(false);
  const [extraDetails, setExtraDetails] = useState({
    guideName: 'Đang tải...',
    guideCode: '...',
    startDate: '...',
    endDate: '...',
    passengerCount: 0 as number | string
  });

  const { notify } = useNotification();

  const fetchData = async (maTour: string) => {
    setLoading(true);
    try {
      const [expenseRes, warningRes] = await Promise.all([
        financeService.danhSachChiPhi({ maTour, size: 100 }),
        financeService.danhSachCanhBao({ maTour, size: 100 }).catch(() => ({ content: [] }))
      ]);
      const expenseList = (expenseRes?.content || []).map(mapExpense);
      setExpenses(expenseList);

      const warningsList = ((warningRes?.content || []) as WarningResponse[]).map(mapWarning);
      setWarnings(warningsList);

      const sumHdv = expenseList
        .filter((e) => e.trangThaiDuyet === 'DA_DUYET')
        .reduce((s, e) => s + e.thanhTien, 0);
      setHdvActualCost(sumHdv);

      if (expenseList.length > 0) {
        const first = expenseList[0];
        setExtraDetails(prev => ({
          ...prev,
          guideName: first.tenNhanVien || 'Không xác định',
          guideCode: first.maNhanVien || 'N/A'
        }));
      } else {
        setExtraDetails(prev => ({
          ...prev,
          guideName: 'Không xác định',
          guideCode: 'N/A'
        }));
      }
    } catch (e) {
      console.error('Lỗi tải dữ liệu chi phí:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tour || !isOpen) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;

      setLocalRevenue(tour.totalRevenue);
      setCommittedCost(tour.giaCamKet || 0);
      setHdvActualCost(tour.totalActualCost);
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

      fetchData(tour.code);
    });

    return () => {
      cancelled = true;
    };
  }, [tour, isOpen]);

  if (!tour) return null;

  const pendingExpenseCost = expenses
    .filter((expense) => expense.trangThaiDuyet !== 'DA_DUYET')
    .reduce((sum, expense) => sum + expense.thanhTien, 0);
  const totalActualCost = hdvActualCost;
  const actualGrossProfit = localRevenue - totalActualCost;
  const expectedGrossProfit = localRevenue - committedCost;
  const hdvExceeds15Pct = committedCost > 0 && hdvActualCost > committedCost * 1.15;

  const handleCalculate = async () => {
    if (!committedCost || committedCost <= 0) {
      setNoteError('Vui lòng nhập Chi phí cam kết trước khi tính toán.');
      return;
    }
    setNoteError('');
    setLoading(true);
    try {
      const result = await financeService.tinhToan(tour.code);
      if (result) {
        setLocalRevenue(result.tongDoanhThu || 0);
        setHdvActualCost(result.tongChiPhi || 0);
      }
      await fetchData(tour.code);
    } catch (e) {
      console.error('Lỗi tính toán:', e);
      alert('Không thể tính toán. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequireInfo = () => {
    if (!note.trim()) {
      setNoteError('Vui lòng nhập nội dung yêu cầu');
      return;
    }
    onSettle?.(tour.id, 'pending_info', note.trim());
    onClose();
  };

  const handleConfirmSettle = async () => {
    try {
      const draft = await financeService.taoQuyetToan(tour.code, {
        giaCamKet: committedCost,
        ghiChu: note.trim() || undefined
      });
      const quyetToanId = draft?.maQuyetToan || tour.id;
      const res = await financeService.chotQuyetToan(quyetToanId);
      notify(`Quyết toán thành công! Mã: ${res?.maQuyetToan || quyetToanId}, Lợi nhuận: ${res?.loiNhuan?.toLocaleString() || '0'} VND`, { type: 'success' });
      onSettle?.(tour.id, 'completed', note.trim() || undefined);
    } catch (e) {
      alert('Lỗi lưu quyết toán. ' + (e instanceof Error ? e.message : ''));
    }
    setConfirmOpen(false);
    onClose();
  };

  const handleExpenseClick = (expense: ExpenseItem) => {
    setSelectedExpense(expense);
    setExpenseDetailOpen(true);
  };

  const getExpenseWarnings = (maChiPhi: string): WarningItem[] => {
    return warnings.filter(w => w.maChiPhi === maChiPhi);
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
      <div className="w-full flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={note}
            onChange={(e) => { setNote(e.target.value); if (noteError) setNoteError(''); }}
            placeholder="Nhập lý do yêu cầu bổ sung (nếu cần)..."
            className={`w-full rounded-[12px] border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
              noteError
                ? 'border-red-300 focus:border-red-300 focus:ring-red-200'
                : 'border-[#C5EAFF] focus:border-[#89D4FF] focus:ring-[#89D4FF]/20'
            }`}
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<FileText size={16} />}
          onClick={handleRequireInfo}
          disabled={!note.trim()}
        >
          Yêu cầu bổ sung
        </Button>
        <Button
          variant="primary"
          size="md"
          className="bg-[#00668A] hover:bg-[#005173]"
          onClick={() => setConfirmOpen(true)}
          icon={<CheckCircle size={16} />}
        >
          Hoàn tất quyết toán
        </Button>
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={readonly ? 'Chi tiết quyết toán' : 'Quyết toán tour'}
        size="3xl"
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
                <Button
                  variant="primary"
                  size="sm"
                  icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
                  onClick={handleCalculate}
                  disabled={loading || !committedCost || committedCost <= 0}
                >
                  {loading ? 'Đang tính...' : 'Tính toán'}
                </Button>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Doanh thu thực tế</span>
                <span className="font-semibold text-emerald-700">{localRevenue.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Chi phí cam kết (hợp đồng đối tác)</span>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-[#00668A]" />
                  {readonly ? (
                    <span className="font-semibold text-gray-800">{committedCost.toLocaleString('vi-VN')} VND</span>
                  ) : (
                    <input
                      type="text"
                      value={committedCost > 0 ? committedCost.toLocaleString('vi-VN') : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setCommittedCost(raw ? parseInt(raw, 10) : 0);
                        if (noteError) setNoteError('');
                      }}
                      placeholder="Nhập số tiền..."
                      className="w-[200px] text-right rounded-[12px] border border-[#C5EAFF] px-4 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20"
                    />
                  )}
                  <span className="text-gray-500">VND</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Chi phí đã duyệt</span>
                <span className="font-semibold text-gray-800">
                  {hdvActualCost.toLocaleString('vi-VN')} VND
                </span>
              </div>
              {pendingExpenseCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Chi phí chưa tính vào quyết toán</span>
                  <span className="font-semibold text-amber-700">
                    {pendingExpenseCost.toLocaleString('vi-VN')} VND
                  </span>
                </div>
              )}
              <div className="border-t border-dashed border-[#E1F1FF] pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng chi phí thực tế</span>
                  <span className="font-semibold text-gray-800">
                    {totalActualCost.toLocaleString('vi-VN')} VND
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lợi nhuận gộp dự kiến</span>
                  <span className={`font-semibold ${expectedGrossProfit < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {expectedGrossProfit.toLocaleString('vi-VN')} VND
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Lợi nhuận gộp thực tế</span>
                  <span className={`font-semibold ${actualGrossProfit < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {actualGrossProfit.toLocaleString('vi-VN')} VND
                  </span>
                </div>
              </div>
              {!readonly && !committedCost && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                  <RefreshCw size={16} />
                  <span>Vui lòng nhập "Chi phí cam kết" và nhấn "Tính toán".</span>
                </div>
              )}
              {noteError && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-600">
                  {noteError}
                </div>
              )}
              {hdvExceeds15Pct && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  <span className="font-semibold">
                    Cảnh báo: Tổng chi phí đã duyệt ({hdvActualCost.toLocaleString('vi-VN')} VND) vượt quá 15% chi phí cam kết ({committedCost.toLocaleString('vi-VN')} VND).
                  </span>
                </div>
              )}
              {!hdvExceeds15Pct && committedCost > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>Tổng chi phí đã duyệt không vượt quá 15% chi phí cam kết.</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-semibold text-gray-900">
                Danh sách chi tiết chi phí thực tế
                <span className="text-sm font-normal text-gray-400 ml-2">({expenses.length} khoản)</span>
              </h3>
              {warnings.length > 0 && (
                <Badge label={`${warnings.length} vi phạm`} variant="error" />
              )}
            </div>
            {loading && expenses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Đang tải dữ liệu...</p>
            ) : expenses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Chưa có khoản chi phí nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E1F1FF]">
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Hạng mục chi</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Số tiền</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">HDV nhập</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Thời gian</th>
                      <th className="text-center py-3 px-2 text-gray-500 font-medium">Trạng thái</th>
                      <th className="text-center py-3 px-2 text-gray-500 font-medium">Cảnh báo</th>
                      <th className="text-center py-3 px-2 text-gray-500 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => {
                      const expWarnings = getExpenseWarnings(exp.maChiPhi);
                      return (
                        <tr
                          key={exp.maChiPhi}
                          className={`border-b border-[#F0F5FA] hover:bg-[#F4F9FF] cursor-pointer transition-colors ${
                            expWarnings.length > 0 ? 'bg-red-50/30' : ''
                          }`}
                          onClick={() => handleExpenseClick(exp)}
                        >
                          <td className="py-3 px-2 font-medium text-gray-800">{exp.danhMuc}</td>
                          <td className="py-3 px-2 text-right font-semibold text-gray-800">
                            {exp.thanhTien.toLocaleString('vi-VN')} VND
                          </td>
                          <td className="py-3 px-2 text-gray-600">{exp.tenNhanVien}</td>
                          <td className="py-3 px-2 text-gray-600">{formatDateTime(exp.ngayKhai)}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge
                              label={trangThaiLabels[exp.trangThaiDuyet] || exp.trangThaiDuyet}
                              variant={trangThaiVariants[exp.trangThaiDuyet] || 'neutral'}
                              size="sm"
                            />
                          </td>
                          <td className="py-3 px-2 text-center">
                            {expWarnings.length > 0 ? (
                              <div className="flex flex-col items-center gap-0.5">
                                {expWarnings.map((w) => (
                                  <span
                                    key={w.maCanhBao}
                                    className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                      w.mucDo === 'NGHIEM_TRONG'
                                        ? 'bg-red-50 text-red-700'
                                        : w.mucDo === 'CAO'
                                        ? 'bg-orange-50 text-orange-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}
                                  >
                                    <AlertTriangle size={10} />
                                    {w.loaiCanhBao === 'VUOT_DINH_MUC' ? 'Vượt định mức' : 'Bất thường'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Eye size={14} className="text-[#00668A] inline-block" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

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
                  Xem hóa đơn
                </a>
              )}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={expenseDetailOpen}
        onClose={() => setExpenseDetailOpen(false)}
        title="Chi tiết khoản chi"
        size="md"
        footer={(
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setExpenseDetailOpen(false)}>Đóng</Button>
          </div>
        )}
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Hạng mục chi</span>
                <p className="font-semibold text-gray-800 mt-1">{selectedExpense.danhMuc}</p>
              </div>
              <div>
                <span className="text-gray-500 block">Số tiền</span>
                <p className="font-semibold text-gray-800 mt-1">{selectedExpense.thanhTien.toLocaleString('vi-VN')} VND</p>
              </div>
              <div>
                <span className="text-gray-500 block">HDV nhập</span>
                <p className="font-semibold text-gray-800 mt-1">{selectedExpense.tenNhanVien}</p>
              </div>
              <div>
                <span className="text-gray-500 block">Thời gian nhập</span>
                <p className="font-semibold text-gray-800 mt-1">{formatDateTime(selectedExpense.ngayKhai)}</p>
              </div>
              <div>
                <span className="text-gray-500 block">Trạng thái</span>
                <p className="mt-1">
                  <Badge
                    label={trangThaiLabels[selectedExpense.trangThaiDuyet] || selectedExpense.trangThaiDuyet}
                    variant={trangThaiVariants[selectedExpense.trangThaiDuyet] || 'neutral'}
                    size="sm"
                  />
                </p>
              </div>
              <div>
                <span className="text-gray-500 block">Cảnh báo</span>
                <div className="mt-1">
                  {getExpenseWarnings(selectedExpense.maChiPhi).length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {getExpenseWarnings(selectedExpense.maChiPhi).map(w => (
                        <span key={w.maCanhBao} className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle size={12} /> {w.noiDung}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">Không có</span>
                  )}
                </div>
              </div>
            </div>

            {selectedExpense.hoaDonAnh ? (
              <div>
                <span className="text-sm text-gray-500 block mb-2">Ảnh hóa đơn</span>
                <div className="rounded-[12px] overflow-hidden border border-[#E1F1FF]">
                  <img
                    src={selectedExpense.hoaDonAnh}
                    alt="Hóa đơn"
                    className="w-full max-h-[300px] object-contain bg-gray-50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <a
                  href={selectedExpense.hoaDonAnh}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-[#00668A] hover:underline"
                >
                  Xem ảnh đầy đủ
                </a>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-700 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>Chưa có ảnh hóa đơn cho khoản chi này.</span>
              </div>
            )}
          </div>
        )}
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
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Xác nhận quyết toán? Hành động này sẽ chốt số liệu tài chính cho Tour này.
            Bạn không thể sửa đổi sau khi hoàn tất.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between">
              <span>Doanh thu:</span>
              <span className="font-semibold">{localRevenue.toLocaleString('vi-VN')} VND</span>
            </div>
            <div className="flex justify-between">
              <span>Chi phí cam kết:</span>
              <span className="font-semibold">{committedCost.toLocaleString('vi-VN')} VND</span>
            </div>
            <div className="flex justify-between">
              <span>Chi phí thực tế đã duyệt:</span>
              <span className="font-semibold">{totalActualCost.toLocaleString('vi-VN')} VND</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1">
              <span>Lợi nhuận gộp dự kiến:</span>
              <span className={`font-semibold ${expectedGrossProfit < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {expectedGrossProfit.toLocaleString('vi-VN')} VND
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Lợi nhuận gộp thực tế:</span>
              <span className={`font-semibold ${actualGrossProfit < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {actualGrossProfit.toLocaleString('vi-VN')} VND
              </span>
            </div>
          </div>
          {note && (
            <div className="bg-blue-50 rounded-lg p-3">
              <span className="text-gray-500 text-xs">Ghi chú:</span>
              <p className="text-gray-700 whitespace-pre-wrap mt-1">{note}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default SettlementModal;
