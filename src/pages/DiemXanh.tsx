import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Camera, Check, Leaf, RotateCcw, ThumbsUp } from 'lucide-react';
import type { Passenger } from '../types';
import { hdvService } from '../services/hdvService';

interface GreenAction {
  id: string;
  name: string;
  points: number;
  icon: string;
}

interface GreenPointsProps {
  maTour?: string;
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
}

export default function DiemXanh({ maTour, passengers, setPassengers }: GreenPointsProps) {
  const [greenActionsList, setGreenActionsList] = useState<GreenAction[]>([]);
  const [selectedGreenGuests, setSelectedGreenGuests] = useState<string[]>([]);
  const [selectedGreenActions, setSelectedGreenActions] = useState<string[]>([]);
  const [greenPhotoFile, setGreenPhotoFile] = useState<string | null>(null);
  const [isCapturingGreenPhoto, setIsCapturingGreenPhoto] = useState(false);
  const [greenConfirmToast, setGreenConfirmToast] = useState<{ show: boolean; text: string; type?: 'success' | 'error' } | null>(null);
  const greenPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const activePassengers = useMemo(
    () => passengers.filter(p => p.status === 'DA_DIEM_DANH'),
    [passengers]
  );

  useEffect(() => {
    hdvService.layDanhSachHanhDongXanh(maTour)
      .then((res) => {
        const data = res?.data ?? res ?? [];
        const list = Array.isArray(data) ? data : [];
        const mapped: GreenAction[] = list.map((a: any) => ({
          id: a.maHanhDongXanh,
          name: a.tenHanhDong,
          points: Number(a.diemCong) || 0,
          icon: '+'
        }));
        setGreenActionsList(mapped);
      })
      .catch(() => {
        setGreenActionsList([]);
      });
  }, [maTour]);

  const toggleSelectGreenGuest = (code: string) => {
    setSelectedGreenGuests(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSelectAllGreenGuests = () => {
    if (selectedGreenGuests.length === activePassengers.length) {
      setSelectedGreenGuests([]);
    } else {
      setSelectedGreenGuests(activePassengers.map(p => p.code));
    }
  };

  const toggleSelectGreenAction = (actionId: string) => {
    setSelectedGreenActions(prev =>
      prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]
    );
  };

  useEffect(() => {
    const activePassengerCodes = new Set(activePassengers.map(p => p.code));
    setSelectedGreenGuests(prev => prev.filter(code => activePassengerCodes.has(code)));
  }, [activePassengers]);

  const handleCaptureGreenPhoto = () => {
    greenPhotoInputRef.current?.click();
  };

  const handleGreenPhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setIsCapturingGreenPhoto(false);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setGreenPhotoFile(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.onerror = () => {
      setGreenConfirmToast({
        show: true,
        text: 'Không thể đọc ảnh minh chứng. Vui lòng chụp lại.'
      });
      setTimeout(() => setGreenConfirmToast(null), 4000);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const submitGreenAction = async () => {
    if (selectedGreenGuests.length === 0 || selectedGreenActions.length === 0 || !maTour) return;

    const selectedPassengers = activePassengers.filter(p => selectedGreenGuests.includes(p.code));
    const selectablePassengers = selectedPassengers
      .map(p => ({
        passenger: p,
        maKhachHang: p.maKhachHang || (!p.maNguoiDongHanh ? p.code : undefined)
      }))
      .filter((item): item is { passenger: Passenger; maKhachHang: string } => Boolean(item.maKhachHang));
    const actions = greenActionsList.filter(action => selectedGreenActions.includes(action.id));

    if (selectablePassengers.length === 0) {
      setGreenConfirmToast({
        show: true,
        text: 'Chỉ khách hàng có hộ chiếu số mới có thể cộng điểm xanh.'
      });
      return;
    }

    const submissions = selectablePassengers.flatMap(({ passenger, maKhachHang }) =>
      actions.map(action => ({ passenger, maKhachHang, action }))
    );
    const results = await Promise.allSettled(submissions.map(({ maKhachHang, action }) =>
      hdvService.luuHanhDongXanh(maTour, {
        maKhachHang,
        maHanhDongXanh: action.id,
        minhChung: greenPhotoFile || undefined
      })
    ));
    const succeeded = submissions.filter((_, index) => results[index].status === 'fulfilled');
    const failedCount = submissions.length - succeeded.length;

    if (succeeded.length > 0) {
      const pointsByCustomer = succeeded.reduce<Record<string, number>>((totals, item) => {
        totals[item.maKhachHang] = (totals[item.maKhachHang] || 0) + item.action.points;
        return totals;
      }, {});
      setPassengers(prev => prev.map(p => {
        const points = p.maKhachHang ? pointsByCustomer[p.maKhachHang] : undefined;
        return points ? { ...p, greenPoints: p.greenPoints + points } : p;
      }));
    }

    const totalPoints = succeeded.reduce((sum, item) => sum + item.action.points, 0);
    const suffix = failedCount > 0
      ? ` ${failedCount} lượt bị bỏ qua vì đã ghi nhận trước đó hoặc không thể lưu.`
      : '';
    setGreenConfirmToast({
      show: true,
      type: succeeded.length > 0 ? 'success' : 'error',
      text: succeeded.length > 0
        ? `Đã ghi nhận ${succeeded.length} hành động, cộng +${totalPoints} điểm xanh.${suffix}`
        : 'Hành động xanh đã được ghi nhận trước đó.'
    });

    setSelectedGreenGuests([]);
    setSelectedGreenActions([]);
    setGreenPhotoFile(null);
    setTimeout(() => setGreenConfirmToast(null), 4000);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="px-1 py-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center">
              <Leaf size={14} className="mr-1.5 text-emerald-500" />
              Ghi nhận hành động xanh
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Cộng điểm tích lũy vào Hộ chiếu số của hành khách</p>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold border border-dashed border-emerald-300">{maTour || 'N/A'}</span>
        </div>
      </div>

      {greenConfirmToast && (
        <div className={`p-3 border text-xs font-semibold rounded-2xl shadow-sm flex items-center space-x-2 animate-slide-up ${
          greenConfirmToast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {greenConfirmToast.type === 'error'
            ? <AlertCircle size={16} className="text-rose-500" />
            : <ThumbsUp size={16} className="text-emerald-500" />}
          <p className="leading-snug">{greenConfirmToast.text}</p>
        </div>
      )}

      <div className="glass-card p-4 rounded-3xl space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Chọn hành khách
          </h4>
          <button
            onClick={handleSelectAllGreenGuests}
            className="text-xs text-sky-500 font-semibold hover:underline"
          >
            {selectedGreenGuests.length === activePassengers.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {activePassengers.map((p, index) => {
            const isChosen = selectedGreenGuests.includes(p.code);
            return (
              <div
                key={p.listKey || `${p.code}:${index}`}
                onClick={() => toggleSelectGreenGuest(p.code)}
                className={`p-2 rounded-xl border text-left cursor-pointer transition-all duration-200 flex items-center justify-between ${isChosen ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-sm ring-1 ring-sky-100' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className={`text-[11px] truncate ${isChosen ? 'font-bold' : 'font-semibold'}`}>{p.name}</span>
                {isChosen && <Check size={14} className="shrink-0 ml-1 text-sky-500" />}
              </div>
            );
          })}
        </div>
        {activePassengers.length === 0 && (
          <p className="text-[11px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            Chưa có hành khách đang tham gia để ghi nhận điểm xanh.
          </p>
        )}
      </div>

      <div className="glass-card p-4 rounded-3xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Chọn hành động bảo vệ môi trường
        </h4>

        <div className="space-y-2">
          {greenActionsList.map(a => (
            <div
              key={a.id}
              onClick={() => toggleSelectGreenAction(a.id)}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${selectedGreenActions.includes(a.id) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">{a.icon}</span>
                <span>{a.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 font-black px-1.5 py-0.5 rounded font-mono text-[11px]">+{a.points}đ</span>
                {selectedGreenActions.includes(a.id) && <Check size={14} className="shrink-0 text-emerald-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 rounded-3xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Chụp ảnh minh chứng thực địa
        </h4>
        <input
          ref={greenPhotoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleGreenPhotoSelected}
          className="hidden"
        />

        {greenPhotoFile ? (
          <div className="relative rounded-2xl overflow-hidden h-28 bg-slate-900 border border-slate-200">
            <img
              src={greenPhotoFile}
              alt="Minh chứng hành động xanh"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setGreenPhotoFile(null);
                handleCaptureGreenPhoto();
              }}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
              title="Chụp lại ảnh minh chứng"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleCaptureGreenPhoto}
            disabled={isCapturingGreenPhoto}
            className="w-full h-24 border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-sky-400 transition-colors bg-slate-50/50"
          >
            {isCapturingGreenPhoto ? (
              <>
                <div className="w-6 h-6 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px] font-bold text-sky-500 mt-2">Đang kích hoạt camera di động...</span>
              </>
            ) : (
              <>
                <Camera size={26} />
                <span className="text-[11px] font-bold mt-1.5">Nhấp vào đây để chụp ảnh thực tế</span>
              </>
            )}
          </button>
        )}
      </div>

      <button
        onClick={submitGreenAction}
        disabled={selectedGreenGuests.length === 0 || selectedGreenActions.length === 0}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-100 transition disabled:opacity-50 disabled:shadow-none active:scale-95"
      >
        Ghi nhận & Tích điểm Hộ chiếu
      </button>
    </div>
  );
}
