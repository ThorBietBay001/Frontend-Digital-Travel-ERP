import { Shield, Award, Star, Compass, Leaf, ArrowLeft } from 'lucide-react';

interface ProfileProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function Profile({ onBack, onLogout }: ProfileProps) {
  return (
    <div className="space-y-4 animate-fade-in pb-6">
      
      {/* Sticky Header with horizontal line and back button */}
      <div className="sticky -top-4 bg-slate-50/95 backdrop-blur-md z-20 pb-3 pt-4 border-b border-slate-200/60 -mx-4 px-4 flex items-center space-x-2.5">
        <button 
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-200/60 text-slate-600 transition"
          title="Quay lại"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h3 className="font-black text-slate-800 text-base leading-none">Hồ sơ Hướng dẫn viên</h3>
          <p className="text-[10px] text-slate-400 mt-1">Chi tiết nhân sự & chứng chỉ thực địa</p>
        </div>
      </div>

      {/* Profile Card Header (Flat Premium Design) */}
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        {/* Large Avatar initials with active status indicator */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-400 to-sky-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-sky-100 ring-4 ring-white relative animate-pulse-subtle">
          AN
          <span className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-emerald-500 border-3 border-white rounded-full"></span>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-1.5">
          <h4 className="font-black text-slate-800 text-lg leading-none">Trần Văn An</h4>
          <span className="text-[10px] bg-sky-50 text-sky-600 font-bold px-2.5 py-0.5 rounded-full border border-sky-100 uppercase tracking-wider">Pro Guide</span>
          <p className="text-[11px] text-slate-500 pt-0.5">Mã số HDV: <strong className="text-sky-500 font-mono">PQ-HDV-2601</strong></p>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="glass-card p-3 rounded-2xl border border-slate-100 shadow-sm bg-white">
          <div className="flex justify-center text-amber-500 mb-1"><Star size={16} className="fill-amber-400" /></div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Đánh giá</span>
          <span className="text-xs font-black text-slate-800">4.95 / 5.0</span>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-slate-100 shadow-sm bg-white">
          <div className="flex justify-center text-sky-400 mb-1"><Compass size={16} /></div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Số chuyến</span>
          <span className="text-xs font-black text-slate-800">42 tour dẫn</span>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-slate-100 shadow-sm bg-white">
          <div className="flex justify-center text-emerald-500 mb-1"><Leaf size={16} /></div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Điểm Eco</span>
          <span className="text-xs font-black text-slate-800">1.200đ</span>
        </div>
      </div>

      {/* Main Profile Info Cards */}
      <div className="space-y-3.5">
        
        {/* Personal Details: Completely Left-Aligned with Normal Colors & Muted Values */}
        <div className="glass-card p-4 rounded-3xl border border-slate-100 space-y-3 shadow-sm bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Shield size={13} className="mr-1.5 text-sky-400" />
            Thông tin cá nhân
          </h4>
          <div className="text-xs space-y-2.5">
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Ngày sinh:</span>
              <span className="text-slate-500 font-medium ml-1.5">15/09/1994 (32 tuổi)</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Điện thoại:</span>
              <span className="text-slate-500 font-medium ml-1.5">0988.222.888</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Email:</span>
              <span className="text-slate-500 font-medium ml-1.5 font-mono">an.tran@digitaltravel.vn</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Địa chỉ:</span>
              <span className="text-slate-500 font-medium ml-1.5">128 Nguyễn Huệ, Quận 1, TP. HCM</span>
            </div>
            <div className="text-left">
              <span className="text-slate-700 font-bold">Phòng ban:</span>
              <span className="bg-sky-50 text-sky-700 font-bold px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider ml-1.5">Phòng Vận hành Thực địa</span>
            </div>
          </div>
        </div>

        {/* Competencies & Certifications: Completely Left-Aligned with Muted Bulleted Lists */}
        <div className="glass-card p-4 rounded-3xl border border-slate-100 space-y-3 shadow-sm bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Award size={13} className="mr-1.5 text-emerald-500" />
            Năng lực & Chứng chỉ
          </h4>
          <div className="text-xs space-y-2.5">
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Loại thẻ HDV:</span>
              <span className="text-slate-500 font-medium ml-1.5">Thẻ HDV Quốc tế</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Số thẻ:</span>
              <span className="text-slate-500 font-medium ml-1.5 font-mono">GP-2024-8899</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Hạn thẻ:</span>
              <span className="text-slate-500 font-medium ml-1.5">31/12/2028</span>
            </div>
            <div className="flex flex-col border-b border-slate-50 pb-1.5 space-y-1 text-left">
              <span className="text-slate-700 font-bold">Ngoại ngữ:</span>
              <div className="flex flex-col pl-4 space-y-0.5 text-slate-500 font-medium text-[11px]">
                <span>• Tiếng Việt (Mẹ đẻ)</span>
                <span>• Tiếng Anh (IELTS 7.5)</span>
                <span>• Tiếng Trung (HSK 5)</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1 text-left">
              <span className="text-slate-700 font-bold">Chứng chỉ khác:</span>
              <div className="flex flex-col pl-4 space-y-0.5 text-slate-500 font-medium text-[11px]">
                <span>• Sơ cứu y tế Hội Chữ Thập Đỏ (2025)</span>
                <span>• Quản lý An toàn thực địa (Safety Leader)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specialization Details: Unified Grid Format with Others */}
        <div className="glass-card p-4 rounded-3xl border border-slate-100 space-y-3 shadow-sm bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Compass size={13} className="mr-1.5 text-amber-500" />
            Khu vực & Chuyên môn chính
          </h4>
          <div className="text-xs space-y-2.5">
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Địa bàn quản lý chính:</span>
              <span className="text-slate-500 font-medium ml-1.5">Phú Quốc (Kiên Giang), Vịnh Nha Trang (Khánh Hòa), Đà Nẵng - Hội An.</span>
            </div>
            <div className="flex flex-col space-y-1 text-left">
              <span className="text-slate-700 font-bold">Chuyên môn cốt lõi:</span>
              <div className="flex flex-col pl-4 space-y-0.5 text-slate-500 font-medium text-[11px]">
                <span>• Tổ chức tour trekking mạo hiểm</span>
                <span>• Khám phá sinh thái biển đảo & lặn ngắm san hô cao cấp</span>
                <span>• Thiết kế trải nghiệm ẩm thực địa phương cho khách VIP quốc tế</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button (Positioned close to the card layout above) */}
        <div className="pt-1 flex justify-center">
          <button 
            onClick={onLogout}
            className="w-full max-w-[240px] py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-full transition active:scale-95 border border-rose-200/60 text-center shadow-sm"
          >
            Đăng xuất tài khoản
          </button>
        </div>

      </div>

    </div>
  );
}
