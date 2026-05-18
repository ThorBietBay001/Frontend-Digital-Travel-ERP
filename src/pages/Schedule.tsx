import { useState } from 'react';
import { itinerary } from '../mockData';

export default function Schedule() {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);

  return (
    <div className="space-y-3.5 animate-slide-up">
      {/* Select Itinerary Day Pills (Ultra-Premium Segmented Control) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-500 px-1 uppercase tracking-wider block">Lịch trình</span>
        <div className="bg-sky-50/60 backdrop-blur-md p-1.5 rounded-2xl border border-sky-100/50 flex space-x-1">
          {itinerary.map(day => (
            <button
              key={day.day}
              onClick={() => setSelectedDayNum(day.day)}
              className={`flex-1 py-1.5 text-[11px] rounded-xl font-bold transition-all active:scale-95 duration-300 ${selectedDayNum === day.day
                ? 'bg-gradient-to-r from-sky-400 to-sky-400 text-white shadow-lg shadow-sky-200/60 scale-105'
                : 'bg-transparent text-slate-500 hover:text-sky-500 hover:bg-white/50'
                }`}
            >
              Ngày {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Day Detail Card */}
      {itinerary.filter(day => day.day === selectedDayNum).map((day) => (
        <div key={day.day} className="space-y-5 animate-slide-up pb-4">

          {/* Floating Cards Schedule */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[12px] font-black uppercase tracking-wider text-slate-700">
                Lịch trình hoạt động
              </h4>
              <span className="text-[10px] bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded-full border border-sky-100 shadow-sm">{day.schedule.length} hoạt động</span>
            </div>

            <div className="space-y-3">
              {day.schedule.map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-sky-50 to-white p-3.5 rounded-2xl border border-sky-100/80 shadow-sm hover:shadow-md transition relative overflow-hidden">
                  <div className="flex space-x-3 items-start relative z-10">
                    <div className="bg-white border border-sky-200 text-sky-600 rounded-xl px-2 py-1.5 text-[11px] font-black shrink-0 font-mono text-center min-w-[50px] shadow-sm">
                      {item.time}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <h5 className="text-[12px] font-medium text-slate-600 mb-1 leading-tight">{item.activity}</h5>
                      {item.notes && (
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Culinary Experience */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100/60">
            <h4 className="text-[12px] font-black uppercase tracking-wider text-slate-700 block">🍽️ Thực đơn nổi bật</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gradient-to-br from-sky-50 to-white p-3.5 rounded-2xl border border-sky-100/80 shadow-sm relative overflow-hidden">
                <span className="text-4xl absolute -right-3 -bottom-3 opacity-20 grayscale">🦐</span>
                <strong className="text-sky-600 block mb-1.5 text-[11px] uppercase tracking-wide">Bữa trưa</strong>
                <p className="text-slate-600 text-[11px] font-medium leading-relaxed relative z-10">{day.menu.lunch}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-white p-3.5 rounded-2xl border border-orange-100/80 shadow-sm relative overflow-hidden">
                <span className="text-4xl absolute -right-3 -bottom-3 opacity-20 grayscale">🔥</span>
                <strong className="text-orange-500 block mb-1.5 text-[11px] uppercase tracking-wide">Bữa tối</strong>
                <p className="text-slate-600 text-[11px] font-medium leading-relaxed relative z-10">{day.menu.dinner}</p>
              </div>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
