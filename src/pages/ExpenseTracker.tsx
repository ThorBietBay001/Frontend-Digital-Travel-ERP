import React, { useState } from 'react';
import { CheckCircle, Plus, Camera, Trash2 } from 'lucide-react';
import type { Expense } from '../types';

interface ExpenseTrackerProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export default function ExpenseTracker({ expenses, setExpenses }: ExpenseTrackerProps) {
  // Expense State
  const [expenseForm, setExpenseForm] = useState({
    category: 'Ăn uống',
    amount: '',
    notes: '',
    date: '19/05/2026'
  });

  const [expenseToast, setExpenseToast] = useState<string | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);

  // Helper: Format price currency
  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Expense Submit
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(expenseForm.amount.replace(/[^0-9]/g, ''));
    if (isNaN(amountVal)) return;

    const newExpense: Expense = {
      id: `EXP00${expenses.length + 1}`,
      category: expenseForm.category,
      amount: amountVal,
      status: 'CHO_DUYET',
      notes: expenseForm.notes,
      date: expenseForm.date
    };

    setExpenses(prev => [newExpense, ...prev]);
    // System automatically generates metadata: Guide ID, Tour ID, Timestamp, Location, and Photo
    setExpenseToast(`Đã lưu chi phí! HDV: PQ-HDV-2601, Tour: PQ001-L1. Ảnh đính kèm hợp lệ.`);
    setExpenseModalOpen(false);

    // Reset form
    setExpenseForm({
      category: 'Ăn uống',
      amount: '',
      notes: '',
      date: '19/05/2026'
    });

    setTimeout(() => {
      setExpenseToast(null);
    }, 4000);
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Expense feedback toast */}
      {expenseToast && (
        <div className="p-3 bg-blue-400 text-white text-[11px] font-bold rounded-2xl shadow-lg border border-blue-500 flex items-center space-x-2 animate-bounce">
          <CheckCircle size={16} />
          <p>{expenseToast}</p>
        </div>
      )}

      {/* Advance Budget Status Card (Pastel Modern - Tightened) */}
      <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200 shadow-sm space-y-2 relative overflow-hidden">
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">Hạn mức tạm ứng thực địa</span>
          <span className="text-[11px] bg-white text-sky-600 px-1.5 py-0.5 rounded font-bold uppercase border border-dashed border-sky-300">PQ001-L1</span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black tracking-tight text-slate-800 leading-none">{formatCurrency(15000000)}</h2>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-blue-500 h-1.5 rounded-full"
              style={{ width: `${(expenses.reduce((sum, e) => sum + e.amount, 0) / 15000000) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/40 pt-2 mt-0.5">
          <div>
            <span className="text-[12px] text-slate-400 block mb-0.5 font-medium leading-none">Đã quyết toán</span>
            <strong className="text-sm font-black text-slate-700 block mt-0.5">{formatCurrency(expenses.filter(e => e.status === 'DA_DUYET').reduce((sum, e) => sum + e.amount, 0))}</strong>
          </div>
          <div>
            <span className="text-[12px] text-slate-400 block mb-0.5 font-medium leading-none">Chờ duyệt</span>
            <strong className="text-sm font-black text-amber-500 block mt-0.5">{formatCurrency(expenses.filter(e => e.status === 'CHO_DUYET').reduce((sum, e) => sum + e.amount, 0))}</strong>
          </div>
        </div>
      </div>

      {/* Add expense Full-Width actions */}
      <button
        onClick={() => setExpenseModalOpen(true)}
        className="w-full py-2.75 bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] rounded-2xl shadow-md shadow-sky-100 transition active:scale-95 flex items-center justify-center space-x-1.5"
      >
        <Plus size={16} strokeWidth={3} />
        <span className="tracking-wide uppercase">Thêm yêu cầu quyết toán</span>
      </button>

      {/* Expense history logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lịch sử chi tiêu đoàn</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono font-bold">{expenses.length} hóa đơn</span>
        </div>

        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="relative bg-white rounded-2xl border border-slate-100/80 hover:shadow-md transition shadow-sm overflow-hidden">
              {/* Clickable card row wrapper */}
              <div
                onClick={() => setExpandedExpense(expandedExpense === e.id ? null : e.id)}
                className="p-3 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold px-1 py-px rounded bg-sky-50 border border-sky-100 text-sky-500 font-mono">{e.id}</span>
                    <span className="text-[11px] font-bold text-slate-700">{e.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{e.notes}</p>
                  <span className="text-[10px] text-slate-400 block font-medium">{e.date}</span>
                </div>

                <div className="text-right space-y-1.5 shrink-0 ml-2">
                  <span className="text-xs font-black text-slate-700 block">{formatCurrency(e.amount)}</span>
                  <div className="flex items-center justify-end space-x-1.5">
                    {e.status === 'DA_DUYET' ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">Đã duyệt</span>
                    ) : e.status === 'CHO_DUYET' ? (
                      <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 font-bold px-2 py-0.5 rounded-full">Chờ duyệt</span>
                    ) : (
                      <span className="text-[11px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">Từ chối</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded receipt detail */}
              {expandedExpense === e.id && (
                <div className="px-3 pb-3 border-t border-slate-100 animate-slide-up relative z-0">
                  {/* Receipt image placeholder */}
                  <div className="mt-2 bg-slate-50 rounded-xl h-32 flex items-center justify-center border border-slate-100">
                    <div className="text-center space-y-1">
                      <Camera size={24} className="text-slate-300 mx-auto" />
                      <p className="text-[10px] text-slate-400 font-medium">Ảnh hóa đơn</p>
                    </div>
                  </div>
                  {/* Separator + metadata */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/80 text-[10px] text-slate-600 font-bold">
                    <span>HDV001</span>
                    <span className="text-slate-200 font-normal">|</span>
                    <span>PQ001</span>
                    <span className="text-slate-200 font-normal">|</span>
                    <span>{e.date}</span>
                  </div>

                  {/* Delete action button inside details (Ultra-Premium, Modern & Fluid Hover) */}
                  {e.status === 'CHO_DUYET' && (
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
      </div>

      {/* --- GLOBAL POPUP: DAILY EXPENSE ADDITION MODAL FORM (UC44 POPUP) --- */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal max-w-sm w-full p-4 rounded-3xl animate-slide-up max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100">
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
                  required
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
                  required
                />
              </div>

              {/* Receipt Photo Area */}
              <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-sky-300 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-sky-50/50 transition">
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center">
                  <Camera size={20} className="text-sky-400" />
                </div>
                <span className="text-[11px] text-sky-500 font-bold italic">Nhấp vào đây để chụp ảnh thực tế</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-amber-900 font-black rounded-xl shadow-md transition active:scale-95 text-xs uppercase tracking-wide"
                >
                  Lưu chi phí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
