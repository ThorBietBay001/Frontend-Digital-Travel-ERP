import React, { useEffect, useState } from 'react';
import { Camera, Check, Leaf, RotateCcw, ThumbsUp } from 'lucide-react';
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
  const [selectedGreenAction, setSelectedGreenAction] = useState('');
  const [greenPhotoFile, setGreenPhotoFile] = useState<string | null>(null);
  const [isCapturingGreenPhoto, setIsCapturingGreenPhoto] = useState(false);
  const [greenConfirmToast, setGreenConfirmToast] = useState<{ show: boolean; text: string } | null>(null);

  useEffect(() => {
    hdvService.layDanhSachHanhDongXanh()
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
  }, []);

  const toggleSelectGreenGuest = (code: string) => {
    setSelectedGreenGuests(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSelectAllGreenGuests = () => {
    if (selectedGreenGuests.length === passengers.length) {
      setSelectedGreenGuests([]);
    } else {
      setSelectedGreenGuests(passengers.map(p => p.code));
    }
  };

  const handleCaptureGreenPhoto = () => {
    setIsCapturingGreenPhoto(true);
    setTimeout(() => {
      setGreenPhotoFile('GREEN_PROOF_LOCAL_UI');
      setIsCapturingGreenPhoto(false);
    }, 1500);
  };

  const submitGreenAction = async () => {
    if (selectedGreenGuests.length === 0 || !selectedGreenAction || !maTour) return;

    const action = greenActionsList.find(a => a.id === selectedGreenAction);
    if (!action) return;

    try {
      const selectedPassengers = passengers.filter(p => selectedGreenGuests.includes(p.code));
      const khachHangIds = selectedPassengers
        .map(p => p.maKhachHang || (!p.maNguoiDongHanh ? p.code : undefined))
        .filter((id): id is string => Boolean(id));

      if (khachHangIds.length === 0) {
        setGreenConfirmToast({
          show: true,
          text: 'Chỉ khách hàng có hộ chiếu số mới có thể cộng điểm xanh.'
        });
        return;
      }

      await Promise.all(khachHangIds.map(maKhachHang => hdvService.luuHanhDongXanh(maTour, {
        maKhachHang,
        maHanhDongXanh: action.id,
        minhChung: greenPhotoFile || undefined
      })));

      setPassengers(prev => prev.map(p => {
        if (selectedGreenGuests.includes(p.code)) {
          return { ...p, greenPoints: p.greenPoints + action.points };
        }
        return p;
      }));

      const guestNames = selectedPassengers.map(p => p.name).join(', ');
      setGreenConfirmToast({
        show: true,
        text: `Đã cộng +${action.points} điểm xanh vào Hộ chiếu số cho: ${guestNames}!`
      });

      setSelectedGreenGuests([]);
      setSelectedGreenAction('');
      setGreenPhotoFile(null);

      setTimeout(() => setGreenConfirmToast(null), 4000);
    } catch (error) {
      console.error(error);
      setGreenConfirmToast({
        show: true,
        text: 'Lỗi: Không thể lưu hành động xanh!'
      });
      setTimeout(() => setGreenConfirmToast(null), 4000);
    }
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
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl shadow-sm flex items-center space-x-2 animate-slide-up">
          <ThumbsUp size={16} className="text-emerald-500" />
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
            {selectedGreenGuests.length === passengers.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {passengers.map(p => {
            const isChosen = selectedGreenGuests.includes(p.code);
            return (
              <div
                key={p.code}
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
      </div>

      <div className="glass-card p-4 rounded-3xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Chọn hành động bảo vệ môi trường
        </h4>

        <div className="space-y-2">
          {greenActionsList.map(a => (
            <div
              key={a.id}
              onClick={() => setSelectedGreenAction(a.id)}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${selectedGreenAction === a.id ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">{a.icon}</span>
                <span>{a.name}</span>
              </div>
              <span className="bg-emerald-100 text-emerald-700 font-black px-1.5 py-0.5 rounded font-mono text-[11px]">+{a.points}đ</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 rounded-3xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Chụp ảnh minh chứng thực địa
        </h4>

        {greenPhotoFile ? (
          <div className="relative rounded-2xl overflow-hidden h-28 bg-slate-900 border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=320"
              alt="Minh chứng hành động xanh"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setGreenPhotoFile(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
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
        disabled={selectedGreenGuests.length === 0 || !selectedGreenAction}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-100 transition disabled:opacity-50 disabled:shadow-none active:scale-95"
      >
        Ghi nhận & Tích điểm Hộ chiếu
      </button>
    </div>
  );
}
