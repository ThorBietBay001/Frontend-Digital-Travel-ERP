export interface PassengerData {
  name: string;
  phone: string;
  idCard: string;
  email: string;
  dateOfBirth: string;
}

interface PassengerFormProps {
  passengers: PassengerData[];
  thayDoiThongTinHanhKhach: (index: number, field: string, value: string) => void;
  bookingType: 'individual' | 'group';
  setBookingType: (type: 'individual' | 'group') => void;
  numPeople: number;
  thayDoiSoLuongKhach: (num: number) => void;
  availableSeats: number;
  bookingNote: string;
  setBookingNote: (note: string) => void;
}

export default function BieuMauHanhKhach({
  passengers,
  thayDoiThongTinHanhKhach,
  bookingType,
  setBookingType,
  numPeople,
  thayDoiSoLuongKhach,
  availableSeats,
  bookingNote,
  setBookingNote
}: PassengerFormProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border-t-4 border-t-blue-600 shadow-sm animate-fadeIn space-y-8">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">Loại hình đặt Tour</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn số lượng thành viên tham gia chuyến đi để hệ thống chuẩn bị dịch vụ tốt nhất.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex-1 flex items-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-all">
            <input
              type="radio"
              name="bookingType"
              checked={bookingType === 'individual'}
              onChange={() => {
                setBookingType('individual');
                thayDoiSoLuongKhach(1);
              }}
              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500/20 mr-3"
            />
            <div>
              <span className="block font-bold text-slate-800 text-sm">Đi du lịch một mình</span>
              <span className="block text-xs text-slate-500">Đặt chỗ nhanh cho 1 người</span>
            </div>
          </label>

          <label className="flex-1 flex items-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-all">
            <input
              type="radio"
              name="bookingType"
              checked={bookingType === 'group'}
              onChange={() => {
                setBookingType('group');
                thayDoiSoLuongKhach(2);
              }}
              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500/20 mr-3"
            />
            <div className="flex-1">
              <span className="block font-bold text-slate-800 text-sm">Đi theo đoàn / nhóm</span>
              <span className="block text-xs text-slate-500">Đặt chỗ cho nhiều người tham gia</span>
            </div>
          </label>
        </div>

        {bookingType === 'group' && (
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="block text-sm font-bold text-slate-800">Số lượng hành khách</span>
              <span className="block text-[10px] text-slate-500 font-medium">Còn trống {availableSeats} chỗ khởi hành</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => thayDoiSoLuongKhach(Math.max(2, numPeople - 1))}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-100 active:scale-95 transition-all"
              >
                -
              </button>
              <span className="font-extrabold text-sm text-slate-800 w-4 text-center">{numPeople}</span>
              <button
                type="button"
                onClick={() => thayDoiSoLuongKhach(Math.min(availableSeats, numPeople + 1))}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-100 active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      <div className="space-y-8">
        {passengers.map((passenger, index) => (
          <div key={index} className="space-y-6">
            {index > 0 && <hr className="border-slate-100" />}

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-extrabold ${index === 0 ? 'bg-blue-600' : 'bg-slate-500'
                  }`}>
                  {index + 1}
                </span>
                <span>Thông tin hành khách {index + 1}</span>
              </h3>
              {index === 0 && (
                <span className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.8 rounded-lg font-black uppercase tracking-wider border border-blue-100">
                  Người đại diện liên hệ
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                  Họ và tên hành khách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={passenger.name}
                  onChange={(e) => thayDoiThongTinHanhKhach(index, 'name', e.target.value)}
                  className="w-full bg-slate-50/70 border-b-2 border-slate-200 focus:border-blue-600 px-4 py-2.5 outline-none text-sm text-slate-800 transition-all font-semibold rounded-t-xl rounded-b-none focus:bg-slate-100/60"
                  placeholder="Ví dụ: NGUYEN VAN AN"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                  Số điện thoại di động <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={passenger.phone}
                  onChange={(e) => thayDoiThongTinHanhKhach(index, 'phone', e.target.value)}
                  className="w-full bg-slate-50/70 border-b-2 border-slate-200 focus:border-blue-600 px-4 py-2.5 outline-none text-sm text-slate-800 transition-all font-semibold rounded-t-xl rounded-b-none focus:bg-slate-100/60"
                  placeholder="Ví dụ: 0912345678"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                  Địa chỉ Email liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={passenger.email}
                  onChange={(e) => thayDoiThongTinHanhKhach(index, 'email', e.target.value)}
                  className="w-full bg-slate-50/70 border-b-2 border-slate-200 focus:border-blue-600 px-4 py-2.5 outline-none text-sm text-slate-800 transition-all font-semibold rounded-t-xl rounded-b-none focus:bg-slate-100/60"
                  placeholder="Ví dụ: hotro@digitaltravel.vn"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                  Số CCCD <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={passenger.idCard}
                  onChange={(e) => thayDoiThongTinHanhKhach(index, 'idCard', e.target.value)}
                  className="w-full bg-slate-50/70 border-b-2 border-slate-200 focus:border-blue-600 px-4 py-2.5 outline-none text-sm text-slate-800 transition-all font-semibold rounded-t-xl rounded-b-none focus:bg-slate-100/60"
                  placeholder="Nhập 12 số CCCD"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                  Ngày tháng năm sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={passenger.dateOfBirth}
                  onChange={(e) => thayDoiThongTinHanhKhach(index, 'dateOfBirth', e.target.value)}
                  className="w-full bg-slate-50/70 border-b-2 border-slate-200 focus:border-blue-600 px-4 py-2.5 outline-none text-sm text-slate-800 transition-all font-semibold rounded-t-xl rounded-b-none focus:bg-slate-100/60"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-slate-100" />

      <div>
        <label htmlFor="booking-note" className="block text-[12px] font-black text-slate-500 mb-1 uppercase tracking-widest">
          Ghi chú đặt tour
        </label>
        <textarea
          id="booking-note"
          value={bookingNote}
          onChange={(event) => setBookingNote(event.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full resize-none bg-slate-50/70 border-b-2 border-slate-200 focus:border-blue-600 px-4 py-2.5 outline-none text-sm text-slate-800 transition-all font-semibold rounded-t-xl rounded-b-none focus:bg-slate-100/60"
          placeholder="Ví dụ: Vui lòng bố trí chỗ ngồi gần nhau, hỗ trợ giờ tập trung..."
        />
        <p className="mt-1 text-right text-[10px] font-medium text-slate-400">
          {bookingNote.length}/2000 ký tự
        </p>
      </div>
    </div>
  );
}
