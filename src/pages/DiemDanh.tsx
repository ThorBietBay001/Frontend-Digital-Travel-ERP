import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, AlertTriangle, RotateCcw, ChevronDown } from 'lucide-react';
import type { Passenger, Tour } from '../types';
import { hdvService } from '../services/hdvService';

interface AttendanceProps {
  currentTour: Tour | null;
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
}

export default function DiemDanh({ currentTour, passengers, setPassengers }: AttendanceProps) {
  // --- SEARCH AND FILTER FOR ATTENDANCE ---
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'CHUA_DIEM_DANH' | 'DA_DIEM_DANH' | 'VANG'>('ALL');

  // --- MODALS STATE ---
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);

  // DiemDanh Warnings
  const [healthAcknowledgeModal, setHealthAcknowledgeModal] = useState<{ show: boolean; passenger: Passenger | null; targetStatus: 'DA_DIEM_DANH' | 'VANG' }>({
    show: false,
    passenger: null,
    targetStatus: 'DA_DIEM_DANH'
  });

  // Absent Reason Modal
  const [absentReasonModal, setAbsentReasonModal] = useState<{ show: boolean; passenger: Passenger | null }>({
    show: false,
    passenger: null
  });
  const [absentReasonText, setAbsentReasonText] = useState('Trễ giờ tập trung (Không thể liên lạc)');
  const [customAbsentReason, setCustomAbsentReason] = useState('');

  // Computed stats
  const attendanceStats = useMemo(() => {
    const total = passengers.length;
    const checked = passengers.filter(p => p.status === 'DA_DIEM_DANH').length;
    const absent = passengers.filter(p => p.status === 'VANG').length;
    const pending = total - checked - absent;
    return { total, checked, absent, pending };
  }, [passengers]);

  const filteredPassengers = useMemo(() => {
    const list = passengers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(attendanceSearch.toLowerCase()) || p.phone.includes(attendanceSearch);
      const matchesFilter = attendanceFilter === 'ALL' || p.status === attendanceFilter;
      return matchesSearch && matchesFilter;
    });

    // Prioritize: CHUA_DIEM_DANH (1) -> DA_DIEM_DANH (2) -> VANG (3)
    const order = { 'CHUA_DIEM_DANH': 1, 'DA_DIEM_DANH': 2, 'VANG': 3 };
    return [...list].sort((a, b) => order[a.status] - order[b.status]);
  }, [passengers, attendanceSearch, attendanceFilter]);

  const xacNhanCanhBaoSucKhoe = async () => {
    if (healthAcknowledgeModal.passenger && currentTour) {
      const targetP = healthAcknowledgeModal.passenger;
      const targetStatus = healthAcknowledgeModal.targetStatus;

      try {
        await hdvService.diemDanhKhach(currentTour.code, {
          maKhachHang: targetP.code,
          diaDiem: 'Tập trung',
          trangThai: targetStatus,
          ghiChu: targetStatus === 'VANG' ? absentReasonText : ''
        });

        setPassengers(prev => prev.map(p => {
          if (p.code === targetP.code) {
            return { ...p, status: targetStatus, absentReason: targetStatus === 'VANG' ? absentReasonText : undefined };
          }
          return p;
        }));
      } catch (e) {
        console.error('Lỗi khi điểm danh', e);
        alert('Có lỗi xảy ra khi điểm danh trên hệ thống!');
      }
    }
    setHealthAcknowledgeModal({ show: false, passenger: null, targetStatus: 'DA_DIEM_DANH' });
  };

  // Change attendance status
  const thayDoiTrangThaiDiemDanh = async (code: string, newStatus: 'DA_DIEM_DANH' | 'VANG' | 'CHUA_DIEM_DANH') => {
    const guest = passengers.find(p => p.code === code);
    if (!guest || !currentTour) return;

    if (newStatus === 'DA_DIEM_DANH') {
      if (guest.healthNotes) {
        setHealthAcknowledgeModal({
          show: true,
          passenger: guest,
          targetStatus: 'DA_DIEM_DANH'
        });
      } else {
        try {
          await hdvService.diemDanhKhach(currentTour.code, {
            maKhachHang: code,
            diaDiem: 'Tập trung',
            trangThai: 'DA_DIEM_DANH'
          });
          setPassengers(prev => prev.map(p => {
            if (p.code === code) return { ...p, status: 'DA_DIEM_DANH', absentReason: undefined };
            return p;
          }));
        } catch (e) {
          console.error(e);
          alert('Lỗi cập nhật điểm danh');
        }
      }
    } else if (newStatus === 'VANG') {
      setAbsentReasonModal({
        show: true,
        passenger: guest
      });
    } else {
      try {
        await hdvService.diemDanhKhach(currentTour.code, {
          maKhachHang: code,
          diaDiem: 'Tập trung',
          trangThai: 'CHUA_DIEM_DANH'
        });
        setPassengers(prev => prev.map(p => {
          if (p.code === code) return { ...p, status: 'CHUA_DIEM_DANH', absentReason: undefined };
          return p;
        }));
      } catch (e) {
        console.error(e);
        alert('Lỗi cập nhật điểm danh');
      }
    }
  };

  // Save absent reason
  const guiLyDoVangMat = async () => {
    if (absentReasonText === 'Lý do khác' && !customAbsentReason.trim()) {
      return; // Enforce strict validation
    }
    if (absentReasonModal.passenger && currentTour) {
      const code = absentReasonModal.passenger.code;
      const finalReason = absentReasonText === 'Lý do khác' ? customAbsentReason.trim() : absentReasonText;
      
      try {
        await hdvService.diemDanhKhach(currentTour.code, {
          maKhachHang: code,
          diaDiem: 'Tập trung',
          trangThai: 'VANG',
          ghiChu: finalReason
        });
        setPassengers(prev => prev.map(p => {
          if (p.code === code) return { ...p, status: 'VANG', absentReason: finalReason };
          return p;
        }));
      } catch (e) {
        console.error(e);
        alert('Lỗi cập nhật vắng mặt');
      }
    }
    setAbsentReasonModal({ show: false, passenger: null });
    setAbsentReasonText('Trễ giờ tập trung (Không thể liên lạc)');
    setCustomAbsentReason('');
  };

  // Helper: Get passenger member rank labels
  const layHuyHieuHangThanhVien = (rank: Passenger['rank']) => {
    switch (rank) {
      case 'KIM_CUONG':
        return <span className="text-[9px] font-bold text-slate-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded leading-none">💎Kim Cương</span>;
      case 'VANG':
        return <span className="text-[9px] font-bold text-amber-600 bg-amber-50/50 border border-amber-200/50 px-1.5 py-0.5 rounded leading-none">⭐ Vàng</span>;
      case 'BAC':
        return <span className="text-[9px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded leading-none">Bạc</span>;
      case 'DONG':
        return <span className="text-[9px] font-semibold text-amber-700 bg-amber-50/30 border border-amber-200/30 px-1.5 py-0.5 rounded leading-none">Đồng</span>;
      default:
        return <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded leading-none">Thành viên</span>;
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Search and Filters inline */}
      <div className="flex space-x-2 items-center">
        {/* Search bar */}
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search size={14} /></span>
          <input
            type="text"
            placeholder="Tìm hành khách..."
            value={attendanceSearch}
            onChange={(e) => setAttendanceSearch(e.target.value)}
            className="w-full h-9 text-xs pl-8.5 pr-3 rounded-2xl border border-slate-200 outline-none bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100/50 transition-all select-text shadow-sm"
          />
        </div>

        {/* Dropdown status Filter */}
        <div className="w-[125px] relative shrink-0">
          <select
            value={attendanceFilter}
            onChange={(e: any) => setAttendanceFilter(e.target.value)}
            className="w-full h-9 text-[11px] pl-3 pr-7 rounded-2xl border border-slate-200 bg-white font-bold text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100/50 appearance-none transition-all shadow-sm cursor-pointer"
          >
            <option value="ALL">Tất cả ({attendanceStats.total})</option>
            <option value="CHUA_DIEM_DANH">Chưa điểm danh ({attendanceStats.pending})</option>
            <option value="DA_DIEM_DANH">Có mặt ({attendanceStats.checked})</option>
            <option value="VANG">Vắng ({attendanceStats.absent})</option>
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <ChevronDown size={12} />
          </span>
        </div>
      </div>

      {/* Redesign: Quiet white cards, condition-based action buttons, flat red medical text */}
      <div className="space-y-2">
        {filteredPassengers.map((p, index) => {
          const isUnmarked = p.status === 'CHUA_DIEM_DANH';
          const isChecked = p.status === 'DA_DIEM_DANH';
          const isAbsent = p.status === 'VANG';

          return (
            <div
              key={p.listKey || `${p.code}:${index}`}
              className="bg-white p-3.5 rounded-2xl flex flex-col justify-between border border-slate-100 shadow-sm transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                {/* Clicking name opens deep details bottom sheet */}
                <div
                  onClick={() => setSelectedPassenger(p)}
                  className="cursor-pointer space-y-0.5"
                >
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-black text-slate-800 text-sm hover:text-sky-500 transition">{p.name}</h4>
                    {layHuyHieuHangThanhVien(p.rank)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">SĐT: {p.phone}</p>
                </div>

                {/* Conditional Actions vs Revert Button */}
                {attendanceFilter === 'ALL' ? (
                  <div className="flex items-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isUnmarked ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                        isChecked ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                      {isUnmarked ? 'Chưa điểm danh' : isChecked ? 'Có mặt' : 'Vắng mặt'}
                    </span>
                  </div>
                ) : isUnmarked ? (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => thayDoiTrangThaiDiemDanh(p.code, 'DA_DIEM_DANH')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition active:scale-95 flex items-center shadow-sm"
                    >
                      Có mặt
                    </button>
                    <button
                      onClick={() => thayDoiTrangThaiDiemDanh(p.code, 'VANG')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition active:scale-95 shadow-sm"
                    >
                      Vắng
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isChecked ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                      {isChecked ? 'Có mặt' : 'Vắng mặt'}
                    </span>
                    <button
                      onClick={() => thayDoiTrangThaiDiemDanh(p.code, 'CHUA_DIEM_DANH')}
                      className="p-1 text-slate-400 hover:text-sky-500 rounded hover:bg-slate-100 transition"
                      title="Thu hồi / Đánh lại"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Absent explanation label */}
              {isAbsent && p.absentReason && (
                <div className="mt-2 text-slate-800 text-[11px] font-bold leading-relaxed">
                  Lý do vắng: <span className="font-medium text-slate-600">{p.absentReason}</span>
                </div>
              )}

              {/* Priority: Medical health warning text rendered as plain RED text */}
              {p.healthNotes && (
                <div className="mt-2 text-rose-500 text-[11px] leading-relaxed">
                  <span className="font-extrabold">Lưu ý:</span>{' '}
                  <span className="font-semibold">{p.healthNotes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- GLOBAL POPUP: PASSENGER DETAILED CARD (UC40 BOTTOM SHEET) --- */}
      {selectedPassenger && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal w-full max-w-[390px] p-5 rounded-3xl max-h-[82dvh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Hồ sơ khách hàng</h3>
              <button
                onClick={() => setSelectedPassenger(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center font-black text-sm">
                {selectedPassenger.name.split(' ').slice(-1)[0]}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-bold text-slate-800 text-sm">{selectedPassenger.name}</h4>
                  {layHuyHieuHangThanhVien(selectedPassenger.rank)}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Mã hành khách: {selectedPassenger.code}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">📞 Thông tin liên hệ</span>
                <p className="font-semibold text-slate-700 mt-0.5">SĐT: {selectedPassenger.phone}</p>
              </div>

              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-800 block uppercase">🍀 Hộ chiếu số xanh</span>
                <p className="text-emerald-950 font-bold mt-0.5">Tích lũy: {selectedPassenger.greenPoints}đ (Điểm hành động xanh)</p>
              </div>

              {selectedPassenger.healthNotes ? (
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                  <span className="text-[11px] font-bold text-amber-800 block uppercase">🏥 Hồ sơ y tế & Lưu ý thực địa</span>
                  <p className="text-amber-900 mt-0.5 font-medium leading-relaxed">{selectedPassenger.healthNotes}</p>
                </div>
              ) : (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/50 text-slate-400 italic text-[11px]">
                  Không có lưu ý đặc biệt về sức khỏe.
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPassenger(null)}
              className="w-full py-2 bg-sky-400 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Đồng ý
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* --- GLOBAL POPUP: ATTENDANCE HEALTH WARNING ACKNOWLEDGEMENT (UC41 POPUP) --- */}
      {healthAcknowledgeModal.show && healthAcknowledgeModal.passenger && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal max-w-sm w-full p-4 rounded-3xl animate-slide-up max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Cảnh Báo Sức Khỏe Nghiêm Trọng</h3>
              <button
                onClick={() => setHealthAcknowledgeModal({ show: false, passenger: null, targetStatus: 'DA_DIEM_DANH' })}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={22} className="animate-pulse-subtle" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">{healthAcknowledgeModal.passenger.name}</h4>
                <p className="text-[11px] text-slate-500">Hành khách này có lưu ý y tế đặc biệt cần chú ý.</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold leading-relaxed">
              {healthAcknowledgeModal.passenger.healthNotes}
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-400 leading-normal">
              Hướng dẫn viên cam kết đã kiểm tra tình trạng sức khỏe thực tế, trao đổi trực tiếp và bố trí phương án chăm sóc phù hợp trước khi xác nhận.
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setHealthAcknowledgeModal({ show: false, passenger: null, targetStatus: 'DA_DIEM_DANH' })}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Bỏ qua
              </button>
              <button
                onClick={xacNhanCanhBaoSucKhoe}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Tôi đã xác nhận
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- GLOBAL POPUP: ATTENDANCE ABSENT EXPLANATION (UC41 POPUP) --- */}
      {absentReasonModal.show && absentReasonModal.passenger && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal w-full max-w-[390px] p-5 rounded-3xl max-h-[82dvh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Ghi Nhận Vắng Mặt</h3>
              <button
                onClick={() => setAbsentReasonModal({ show: false, passenger: null })}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Đóng
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700">Khách hàng: {absentReasonModal.passenger.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Vui lòng cung cấp lý do vắng mặt để cập nhật lên ERP điều hành chính.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">Lý do vắng mặt</label>
                <select
                  value={absentReasonText}
                  onChange={(e) => {
                    setAbsentReasonText(e.target.value);
                    if (e.target.value !== 'Lý do khác') {
                      setCustomAbsentReason('');
                    }
                  }}
                  className="w-full text-xs p-2.5 rounded-xl glass-input"
                >
                  <option>Trễ giờ tập trung (Không thể liên lạc)</option>
                  <option>Hủy tour phút chót (Đã báo trước)</option>
                  <option>Đang tự di chuyển tới điểm hẹn sau</option>
                  <option>Sức khỏe đột xuất không thể tham gia</option>
                  <option>Lý do khác</option>
                </select>
              </div>

              {absentReasonText === 'Lý do khác' && (
                <div className="space-y-1.5 animate-slide-up">
                  <label className="text-[11px] font-bold text-slate-500 block">Chi tiết lý do khác</label>
                  <input
                    type="text"
                    placeholder="Nhập lý do vắng mặt..."
                    value={customAbsentReason}
                    onChange={(e) => setCustomAbsentReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none bg-white focus:border-sky-400 transition select-text"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setAbsentReasonModal({ show: false, passenger: null })}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Quay lại
              </button>
              <button
                onClick={guiLyDoVangMat}
                disabled={absentReasonText === 'Lý do khác' && !customAbsentReason.trim()}
                className={`flex-1 py-2 text-white text-xs font-bold rounded-xl shadow-md transition ${absentReasonText === 'Lý do khác' && !customAbsentReason.trim()
                    ? 'bg-rose-300 cursor-not-allowed opacity-60 shadow-none'
                    : 'bg-rose-500 hover:bg-rose-600 active:scale-95'
                  }`}
              >
                Xác nhận vắng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
