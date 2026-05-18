import React, { useState } from 'react';
import { Leaf, ThumbsUp, Check, RotateCcw, Camera } from 'lucide-react';
import type { Passenger } from '../types';
import { greenActionsList } from '../mockData';

interface GreenPointsProps {
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
}

export default function GreenPoints({ passengers, setPassengers }: GreenPointsProps) {
  // Green Action State
  const [selectedGreenGuests, setSelectedGreenGuests] = useState<string[]>([]);
  const [selectedGreenAction, setSelectedGreenAction] = useState<string>('');
  const [greenPhotoFile, setGreenPhotoFile] = useState<string | null>(null);
  const [isCapturingGreenPhoto, setIsCapturingGreenPhoto] = useState(false);
  const [greenConfirmToast, setGreenConfirmToast] = useState<{ show: boolean; text: string } | null>(null);

  // Multi-select passengers for green actions
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

  // Simulate green action camera capture
  const handleCaptureGreenPhoto = () => {
    setIsCapturingGreenPhoto(true);
    setTimeout(() => {
      setGreenPhotoFile('GREEN_PROOF_MOCK_DATA_URL');
      setIsCapturingGreenPhoto(false);
    }, 1500);
  };

  // Submit green points
  const submitGreenAction = () => {
    if (selectedGreenGuests.length === 0 || !selectedGreenAction) return;

    const action = greenActionsList.find(a => a.id === selectedGreenAction);
    if (!action) return;

    const awardedPoints = action.points;

    setPassengers(prev => prev.map(p => {
      if (selectedGreenGuests.includes(p.code)) {
        return { ...p, greenPoints: p.greenPoints + awardedPoints };
      }
      return p;
    }));

    const guestNames = passengers
      .filter(p => selectedGreenGuests.includes(p.code))
      .map(p => p.name)
      .join(', ');

    setGreenConfirmToast({
      show: true,
      text: `Đã cộng +${awardedPoints} điểm xanh vào Hộ chiếu số cho: ${guestNames}!`
    });

    setSelectedGreenGuests([]);
    setSelectedGreenAction('');
    setGreenPhotoFile(null);

    setTimeout(() => {
      setGreenConfirmToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Page header (Clean borderless, text only) */}
      <div className="px-1 py-1">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
            <Leaf size={14} className="text-emerald-500" />
            <span>GHI NHẬN HÀNH ĐỘNG XANH</span>
          </h3>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold border border-dashed border-emerald-300">PQ001</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">Cộng điểm tích lũy vào Hộ chiếu số của hành khách</p>
      </div>

      {/* Confirmed green toast */}
      {greenConfirmToast && (
        <div className="p-3 bg-emerald-505 bg-emerald-500 border border-emerald-600 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center space-x-2 animate-bounce">
          <ThumbsUp size={16} />
          <p className="leading-snug">{greenConfirmToast.text}</p>
        </div>
      )}

      {/* Step 1: Select Guests */}
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

        {/* Multiple Guests selector tags */}
        <div className="grid grid-cols-2 gap-2">
          {passengers.map(p => {
            const isChosen = selectedGreenGuests.includes(p.code);
            return (
              <div
                key={p.code}
                onClick={() => toggleSelectGreenGuest(p.code)}
                className={`p-2 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${isChosen ? 'bg-sky-400 border-sky-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span className="text-[11px] font-bold truncate">{p.name}</span>
                {isChosen && <Check size={11} className="shrink-0 ml-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Select Action */}
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

      {/* Step 3: Capture Proof Photo */}
      <div className="glass-card p-4 rounded-3xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Chụp ảnh minh chứng thực địa
        </h4>

        {greenPhotoFile ? (
          <div className="relative rounded-2xl overflow-hidden h-28 bg-slate-900 border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=320"
              alt="Green Proof"
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
                <span className="text-[11px] font-bold text-sky-500 mt-2">Đang kích hoạt Camera di động...</span>
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

      {/* Submit Button */}
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
