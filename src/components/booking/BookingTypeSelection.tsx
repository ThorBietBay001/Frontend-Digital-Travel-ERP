
interface BookingTypeSelectionProps {
  bookingType: 'individual' | 'group';
  setBookingType: (type: 'individual' | 'group') => void;
  numPeople: number;
  thayDoiSoLuongKhach: (num: number) => void;
  availableSeats: number;
}

export default function BookingTypeSelection({
  bookingType,
  setBookingType,
  numPeople,
  thayDoiSoLuongKhach,
  availableSeats
}: BookingTypeSelectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border-t-4 border-t-blue-600 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          Loại hình đặt Tour
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Chọn số lượng thành viên tham gia chuyến đi để hệ thống chuẩn bị dịch vụ tốt nhất.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        {[
          { id: 'individual', title: 'Đi du lịch một mình', desc: 'Đặt chỗ nhanh cho 1 người', size: 1 },
          { id: 'group', title: 'Đi theo đoàn / nhóm', desc: 'Đặt chỗ cho nhiều người tham gia', size: 2 }
        ].map((opt) => (
          <label 
            key={opt.id} 
            className="flex items-start space-x-3 p-3.5 rounded-xl hover:bg-slate-50/50 cursor-pointer group transition-colors"
          >
            <input
              type="radio"
              name="bookingType"
              checked={bookingType === opt.id}
              onChange={() => {
                setBookingType(opt.id as 'individual' | 'group');
                thayDoiSoLuongKhach(opt.size);
              }}
              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500/20 mt-0.5 cursor-pointer"
            />
            <div>
              <span className="block font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                {opt.title}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5 font-medium">
                {opt.desc}
              </span>
            </div>
          </label>
        ))}
      </div>

      {bookingType === 'group' && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold animate-fadeIn">
          <div>
            <span className="block text-slate-700 font-bold">Số lượng hành khách</span>
            <span className="block text-[10px] text-slate-450 mt-0.5 font-medium">Còn trống {availableSeats} chỗ khởi hành</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => thayDoiSoLuongKhach(Math.max(2, numPeople - 1))}
              className="w-8 h-8 rounded-full border border-slate-200 text-slate-650 hover:bg-slate-100 active:scale-90 flex items-center justify-center font-extrabold transition-all"
            >
              -
            </button>
            <span className="font-extrabold text-sm text-slate-800 w-6 text-center">{numPeople}</span>
            <button
              type="button"
              onClick={() => thayDoiSoLuongKhach(Math.min(availableSeats, numPeople + 1))}
              className="w-8 h-8 rounded-full border border-slate-200 text-slate-650 hover:bg-slate-100 active:scale-90 flex items-center justify-center font-extrabold transition-all"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
