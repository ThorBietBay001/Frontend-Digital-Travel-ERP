import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, ChevronLeft, ChevronRight, Plus, Camera, Trash2 } from 'lucide-react';
import type { Expense, Tour } from '../types';

import { hdvService } from '../services/hdvService';

const PAGE_SIZE = 6;
const REPORT_WINDOW_DAYS = 3;

const getPaginationItems = (totalPages: number, currentPage: number) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = Array.from(new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]))
    .filter(page => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return pages.reduce<(number | 'ellipsis')[]>((items, page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push('ellipsis');
    items.push(page);
    return items;
  }, []);
};

interface ExpenseTrackerProps {
  maTour?: string;
  currentTour?: Tour | null;
  pastTours?: Tour[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const isTourInReportWindow = (tour: Tour) => {
  if (!tour.endDate) return false;
  const endDate = new Date(tour.endDate);
  if (Number.isNaN(endDate.getTime())) return false;
  const deadline = new Date(endDate);
  deadline.setDate(deadline.getDate() + REPORT_WINDOW_DAYS);
  deadline.setHours(23, 59, 59, 999);
  return new Date() <= deadline;
};

const formatExpenseDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${time} - ${day}`;
};

export default function QuanLyChiPhi({ maTour, currentTour, pastTours = [], expenses, setExpenses }: ExpenseTrackerProps) {
  // Expense State
  const [expenseForm, setExpenseForm] = useState({
    category: 'Ăn uống',
    amount: '',
    notes: '',
    date: '19/05/2026'
  });

  const [expenseToast, setExpenseToast] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);
  const [expensePage, setExpensePage] = useState(1);
  const reportableTours = useMemo(() => {
    const tours = [
      ...(currentTour ? [currentTour] : []),
      ...pastTours.filter(isTourInReportWindow)
    ];
    return tours.filter((tour, index, list) => list.findIndex(item => item.code === tour.code) === index);
  }, [currentTour, pastTours]);
  const [selectedTourCode, setSelectedTourCode] = useState(maTour || reportableTours[0]?.code || '');
  const canCreateCurrentTourExpense = Boolean(selectedTourCode);
  const visibleExpenses = expenses;
  const totalExpensePages = Math.max(1, Math.ceil(visibleExpenses.length / PAGE_SIZE));
  const expensePageItems = getPaginationItems(totalExpensePages, expensePage);
  const paginatedExpenses = useMemo(
    () => visibleExpenses.slice((expensePage - 1) * PAGE_SIZE, expensePage * PAGE_SIZE),
    [expensePage, visibleExpenses]
  );

  useEffect(() => {
    setExpensePage(prev => Math.min(prev, totalExpensePages));
  }, [totalExpensePages]);

  useEffect(() => {
    if (maTour) {
      setSelectedTourCode(maTour);
      return;
    }
    if (reportableTours.length > 0 && !reportableTours.some(tour => tour.code === selectedTourCode)) {
      setSelectedTourCode(reportableTours[0].code);
    }
  }, [maTour, reportableTours]);

  // Simulated capture function
  const handleCaptureReceipt = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setReceiptPhoto('MOCK_RECEIPT_URL');
      setIsCapturing(false);
    }, 1200);
  };

  // Helper: Format price currency
  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Expense Submit
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedTourCode) {
      setFormError("Không tìm thấy thông tin Tour!");
      return;
    }

    if (!expenseForm.amount.trim() || !expenseForm.notes.trim()) {
      setFormError("Vui lòng điền đầy đủ số tiền và ghi chú chi phí!");
      return;
    }

    const amountVal = parseFloat(expenseForm.amount.replace(/[^0-9]/g, ''));
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormError("Số tiền không hợp lệ. Vui lòng nhập bằng số!");
      return;
    }

    if (!receiptPhoto) {
      setFormError("Bạn bắt buộc phải chụp ảnh minh chứng hóa đơn thực tế!");
      return;
    }

    try {
      const data = {
        danhMuc: expenseForm.category,
        thanhTien: amountVal,
        hoaDonAnh: receiptPhoto,
        ghiChu: expenseForm.notes
      };

      const res = await hdvService.taoChiPhi(selectedTourCode, data);

      if (res.data) {
        const eRes = res.data;
        const newExpense: Expense = {
          id: eRes.maChiPhi,
          tourCode: eRes.maTour || selectedTourCode,
          category: eRes.danhMuc || expenseForm.category,
          amount: eRes.thanhTien || amountVal,
          status: eRes.trangThaiDuyet || 'CHO_DUYET',
          notes: eRes.ghiChu || expenseForm.notes,
          date: eRes.ngayKhai || expenseForm.date,
          photoUrl: eRes.hoaDonAnh || receiptPhoto
        };

        setExpenses(prev => [newExpense, ...prev]);
        setExpenseToast(`Đã lưu chi phí thành công!`);
        setExpenseModalOpen(false);

        // Reset form
        setExpenseForm({
          category: 'Ăn uống',
          amount: '',
          notes: '',
          date: new Date().toLocaleDateString('vi-VN')
        });
        setReceiptPhoto(null);

        setTimeout(() => {
          setExpenseToast(null);
        }, 4000);
      }
    } catch (error) {
      console.error(error);
      setFormError("Không thể lưu chi phí. Vui lòng thử lại!");
    }
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Expense feedback toast */}
      {expenseToast && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-2xl shadow-sm border border-emerald-200 flex items-center space-x-2 animate-slide-up">
          <CheckCircle size={16} className="text-emerald-500" />
          <p>{expenseToast}</p>
        </div>
      )}

      {/* Advance Budget Status Card (Pastel Modern - Tightened) */}
      <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200 shadow-sm space-y-2 relative overflow-hidden">
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">Hạn mức tạm ứng thực địa</span>
          <select
            value={selectedTourCode}
            onChange={(event) => setSelectedTourCode(event.target.value)}
            className="max-w-[150px] text-[10px] bg-white text-sky-600 px-1.5 py-0.5 rounded font-bold uppercase border border-dashed border-sky-300 outline-none"
            aria-label="Chọn tour khai chi phí"
          >
            {reportableTours.length === 0 && <option value="">N/A</option>}
            {reportableTours.map(tour => (
              <option key={tour.code} value={tour.code}>{tour.code}</option>
            ))}
          </select>
        </div>

        <p className="text-[10px] text-slate-400 font-semibold">
          Báo cáo chi phí cho tour đã dẫn trong vòng 3 ngày.
        </p>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 leading-none">{formatCurrency(15000000)}</h2>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-blue-500 h-1.5 rounded-full"
              style={{ width: `${Math.min((visibleExpenses.reduce((sum, e) => sum + e.amount, 0) / 15000000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/40 pt-2 mt-0.5">
          <div>
            <span className="text-[12px] text-slate-400 block mb-0.5 font-medium leading-none">Đã quyết toán</span>
            <strong className="text-sm font-black text-slate-700 block mt-0.5">{formatCurrency(visibleExpenses.filter(e => e.status === 'DA_DUYET').reduce((sum, e) => sum + e.amount, 0))}</strong>
          </div>
          <div>
            <span className="text-[12px] text-slate-400 block mb-0.5 font-medium leading-none">Chờ duyệt</span>
            <strong className="text-sm font-black text-amber-500 block mt-0.5">{formatCurrency(visibleExpenses.filter(e => e.status === 'CHO_DUYET').reduce((sum, e) => sum + e.amount, 0))}</strong>
          </div>
        </div>
      </div>

      {/* Add expense Full-Width actions */}
      {canCreateCurrentTourExpense && (
        <button
          onClick={() => setExpenseModalOpen(true)}
          className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] rounded-2xl shadow-md shadow-sky-100 transition active:scale-95 flex items-center justify-center space-x-1.5"
        >
          <Plus size={16} strokeWidth={3} />
          <span className="tracking-wide uppercase">Thêm yêu cầu quyết toán</span>
        </button>
      )}

      {/* Expense history logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lịch sử chi tiêu đoàn</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono font-bold">{visibleExpenses.length} hóa đơn</span>
        </div>

        <div className="space-y-2">
          {visibleExpenses.length === 0 && (
            <div className="p-3 rounded-2xl bg-white border border-slate-100 text-[11px] text-slate-400 font-semibold">
              Chưa có chi phí nào trong lịch sử tour đã dẫn.
            </div>
          )}
          {paginatedExpenses.map((e) => (
            <div key={e.id} className="relative bg-white rounded-2xl border border-slate-100/80 hover:shadow-md transition shadow-sm overflow-hidden">
              {/* Clickable card row wrapper */}
              <div
                onClick={() => setExpandedExpense(expandedExpense === e.id ? null : e.id)}
                className="p-3 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold px-1 py-px rounded bg-sky-50 border border-sky-100 text-sky-500 font-mono">{e.id}</span>
                    <span className="text-[10px] font-bold px-1 py-px rounded bg-slate-50 border border-slate-100 text-slate-500 font-mono">{e.tourCode || 'N/A'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{e.notes}</p>
                  <span className="text-[10px] text-slate-400 block font-medium">{formatExpenseDateTime(e.date)}</span>
                </div>

                <div className="text-right space-y-1.5 shrink-0 ml-2">
                  <span className="text-xs font-black text-slate-700 block">{formatCurrency(e.amount)}</span>
                  <div className="flex items-center justify-end space-x-1.5">
                    {e.status === 'DA_DUYET' ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">Đã duyệt</span>
                    ) : e.status === 'CHO_DUYET' ? (
                      <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 font-bold px-2 py-0.5 rounded-full">Chờ duyệt</span>
                    ) : (
                      <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 font-bold px-2 py-0.5 rounded-full">Từ chối</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded receipt detail */}
              {expandedExpense === e.id && (
                <div className="px-3 pb-3 border-t border-slate-100 animate-slide-up relative z-0">
                  {/* Receipt image */}
                  <div className="mt-2 rounded-xl h-36 overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={e.photoUrl === 'MOCK_RECEIPT_URL' ? "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=320" : "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=320"}
                      alt="Receipt Proof"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Separator + metadata */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/80 text-[10px] text-slate-600 font-bold">
                    <span>HDV</span>
                    <span className="text-slate-200 font-normal">|</span>
                    <span>{e.tourCode || selectedTourCode || 'N/A'}</span>
                    <span className="text-slate-200 font-normal">|</span>
                    <span>{formatExpenseDateTime(e.date)}</span>
                  </div>

                  {/* Delete action button inside details (Ultra-Premium, Modern & Fluid Hover) */}
                  {canCreateCurrentTourExpense && e.tourCode === selectedTourCode && e.status === 'CHO_DUYET' && (
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleDeleteExpense(e.id);
                      }}
                      className="w-full mt-2 py-1.5 bg-rose-50/40 hover:bg-rose-500 text-rose-600 hover:text-white font-black text-[10px] uppercase tracking-wider rounded-xl border border-rose-100 hover:border-transparent transition-all duration-300 active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                      title="Hủy yêu cầu chi phí này"
                    >
                      <Trash2 size={11} />
                      <span>Hủy yêu cầu chi phí</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {visibleExpenses.length > PAGE_SIZE && (
          <nav aria-label="Phân trang chi phí" className="mx-auto mt-1 flex w-fit items-center gap-2">
            <button
              type="button"
              onClick={() => setExpensePage(prev => Math.max(1, prev - 1))}
              disabled={expensePage === 1}
              aria-label="Trang trước"
              className="size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            {expensePageItems.map((page, index) => page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="size-8 rounded-lg border border-slate-100 bg-white text-[11px] font-semibold text-slate-400 flex items-center justify-center">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => setExpensePage(page)}
                aria-label={`Trang ${page}`}
                aria-current={expensePage === page ? 'page' : undefined}
                className={`size-8 rounded-lg border bg-white text-[11px] font-semibold transition ${expensePage === page
                    ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500'
                    : 'border-slate-100 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setExpensePage(prev => Math.min(totalExpensePages, prev + 1))}
              disabled={expensePage === totalExpensePages}
              aria-label="Trang sau"
              className="size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </nav>
        )}
      </div>

      {/* --- GLOBAL POPUP: DAILY EXPENSE ADDITION MODAL FORM (UC44 POPUP) --- */}
      {expenseModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal w-full max-w-[390px] p-5 rounded-3xl max-h-[82dvh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Nhập chi phí thực tế</h3>
              <button
                onClick={() => setExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Đóng
              </button>
            </div>

            {/* Manual addition forms */}
            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 font-semibold rounded-xl text-[11px] animate-slide-up">
                  {formError}
                </div>
              )}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Hạng mục chi</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-amber-400 font-bold text-slate-700"
                >
                  <option>Ăn uống</option>
                  <option>Vé tham quan</option>
                  <option>Xăng xe</option>
                  <option>Lưu trú phát sinh</option>
                  <option>Mua sắm chung</option>
                  <option>Khác</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Số tiền (VND)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1.200.000"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-400 bg-white font-black text-slate-800 text-xs select-text"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Ghi chú</label>
                <textarea
                  rows={2}
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Mô tả chi tiết..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-amber-400 bg-white text-slate-600 select-text"
                />
              </div>

              {/* Receipt Photo Area */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">Ảnh hóa đơn thực tế *</label>
                {receiptPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden h-28 bg-slate-900 border border-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=320"
                      alt="Receipt Proof"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setReceiptPhoto(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition text-[10px] font-bold"
                    >
                      Chụp lại
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCaptureReceipt}
                    disabled={isCapturing}
                    className="w-full h-30 border-2 border-dashed border-sky-300 hover:border-sky-400 rounded-2xl flex flex-col items-center justify-center text-sky-500 hover:text-sky-600 transition-colors bg-sky-50/20 active:scale-[0.98]"
                  >
                    {isCapturing ? (
                      <>
                        <div className="w-6 h-6 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[11px] font-bold text-sky-500 mt-2">Đang kích hoạt Camera...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={24} className="text-sky-400" />
                        <span className="text-[11px] font-bold mt-1.5 italic">Nhấp để chụp ảnh hóa đơn (Bắt buộc)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-900 font-black rounded-xl shadow-md transition active:scale-95 text-xs uppercase tracking-wide"
                >
                  Lưu chi phí
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
