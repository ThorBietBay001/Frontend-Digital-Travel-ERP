import { useState } from 'react';
import { Compass, AlertTriangle, User, Lock } from 'lucide-react';

interface LoginProps {
  loginCode: string;
  setLoginCode: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginError: string | null;
  setLoginError: (val: string | null) => void;
  setIsLoggedIn: (val: boolean) => void;
}

export default function Login({
  loginCode,
  setLoginCode,
  loginPassword,
  setLoginPassword,
  loginError,
  setLoginError,
  setIsLoggedIn
}: LoginProps) {
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT' | 'OTP_FORGOT'>('LOGIN');

  // Forgot Password Form States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  // Notification States
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const displayError = errorMsg || loginError;

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative overflow-hidden bg-gradient-to-tr from-sky-100/50 via-white to-sky-50 animate-fade-in min-h-screen">
      {/* Background elements */}
      <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-sky-300/10 blur-2xl animate-float"></div>
      <div className="absolute -left-20 bottom-10 w-60 h-60 rounded-full bg-indigo-300/10 blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Group Logo + Form to be close to each other */}
      <div className="flex flex-col space-y-6 z-10 my-auto -translate-y-6 w-full max-w-sm mx-auto">
        {/* Logo and Intro */}
        <div className="text-center space-y-3 animate-slide-up">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-sky-400 to-sky-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-sky-200 animate-pulse-subtle">
            <Compass size={32} className="stroke-[1.8px]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-wider text-center">DIGITAL TRAVEL ERP</h1>
            <p className="text-xs text-sky-500 font-bold uppercase tracking-widest mt-0.5">Tour Guide Operations</p>
          </div>
        </div>

        {/* Dynamic Auth Views based on mode */}
        {mode === 'LOGIN' && (
          <div className="glass-panel p-5 rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-100/50 space-y-4 animate-slide-up">
            <div className="text-center">
              <h3 className="font-black text-slate-800 text-sm text-center">Đăng nhập hệ thống</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 text-center">Vui lòng sử dụng tài khoản hướng dẫn viên được cấp.</p>
            </div>

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-semibold rounded-xl text-center">
                {successMsg}
              </div>
            )}

            {displayError && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-[10.5px] font-semibold rounded-xl flex items-center space-x-1.5 animate-shake">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (loginCode.trim().toUpperCase() === 'PQ001') {
                  setIsLoggedIn(true);
                  setLoginError(null);
                  setErrorMsg(null);
                } else {
                  setLoginError('Mã HDV không đúng hoặc chưa được phân công nhiệm vụ!');
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Mã hướng dẫn viên</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><User size={15} /></span>
                  <input
                    type="text"
                    placeholder="Ví dụ: PQ001"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition bg-white/70 select-text"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Mật khẩu nghiệp vụ</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><Lock size={15} /></span>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition bg-white/70 select-text"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-sky-400 border-slate-300" />
                  <span>Ghi nhớ thiết bị</span>
                </label>
                <span
                  onClick={() => { setMode('FORGOT'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="hover:text-sky-500 cursor-pointer font-bold"
                >
                  Quên mật khẩu?
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-200 transition active:scale-98"
              >
                Đăng Nhập Ngay
              </button>
            </form>
          </div>
        )}

        {mode === 'FORGOT' && (
          <div className="glass-panel p-5 rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-100/50 space-y-4 animate-slide-up">
            <div className="text-center">
              <h3 className="font-black text-slate-800 text-sm text-center">Khôi phục mật khẩu</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 text-center">Nhập địa chỉ email liên kết với tài khoản hướng dẫn viên để nhận mã OTP.</p>
            </div>

            {displayError && (
              <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-semibold rounded-xl flex items-center space-x-1.5 animate-shake">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (forgotEmail.toLowerCase() === 'notfound@gmail.com') {
                  setErrorMsg('Email không tồn tại! Không tìm thấy tài khoản HDV.');
                  return;
                }
                setErrorMsg(null);
                setSuccessMsg('Mã OTP xác thực khôi phục mật khẩu đã được gửi!');
                setMode('OTP_FORGOT');
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Địa chỉ email đăng ký</label>
                <input
                  type="email"
                  placeholder="example@digitaltravel.vn"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70 select-text"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-200 transition active:scale-98"
              >
                Gửi Yêu Cầu OTP
              </button>
            </form>

            <div className="text-center">
              <span
                onClick={() => { setMode('LOGIN'); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-[10px] text-sky-500 font-bold hover:underline cursor-pointer"
              >
                Quay lại đăng nhập
              </span>
            </div>
          </div>
        )}

        {mode === 'OTP_FORGOT' && (
          <div className="glass-panel p-5 rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-100/50 space-y-4 animate-slide-up">
            <div className="text-center">
              <h3 className="font-black text-slate-800 text-sm text-center">Đặt Lại Mật Khẩu</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 text-center">Vui lòng nhập mã OTP đã nhận và mật khẩu mới mong muốn.</p>
            </div>

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-semibold rounded-xl text-center">
                {successMsg}
              </div>
            )}

            {displayError && (
              <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-semibold rounded-xl flex items-center space-x-1.5 animate-shake">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (forgotOtp !== '123456') {
                  setErrorMsg('Mã OTP sai hoặc đã hết hạn! Vui lòng thử lại.');
                  return;
                }
                if (forgotNewPassword !== forgotConfirmPassword) {
                  setErrorMsg('Mật khẩu mới không trùng khớp!');
                  return;
                }
                setErrorMsg(null);
                setSuccessMsg('Mật khẩu mới đã được cập nhật thành công! Vui lòng đăng nhập.');
                setForgotEmail('');
                setForgotOtp('');
                setForgotNewPassword('');
                setForgotConfirmPassword('');
                setMode('LOGIN');
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Nhập mã OTP</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 123456"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  className="w-full text-center text-xs py-2 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70 font-mono tracking-widest select-text"
                  maxLength={6}
                  required
                />
                <p className="text-[8px] text-slate-400 text-center mt-0.5">OTP mặc định: <code className="bg-slate-100 px-1 rounded font-bold text-slate-700">123456</code></p>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Mật khẩu mới..."
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  placeholder="Xác nhận..."
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-98"
              >
                Cập Nhật Mật Khẩu
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Support / Credentials Helper + Clean Simplified Footer */}
      <div className="z-10 text-center space-y-4 w-full animate-slide-up mt-auto" style={{ animationDelay: '200ms' }}>
        {mode === 'LOGIN' && (
          <div className="bg-sky-50/50 p-2.5 rounded-2xl border border-sky-100/50 inline-block max-w-[280px] mx-auto">
            <p className="text-[10px] text-sky-700 leading-snug text-center">
              🔑 <strong>Tài khoản Demo</strong>:<br/>
              Mã HDV: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-sky-800">PQ001</code> | Mật khẩu bất kỳ
            </p>
          </div>
        )}
        
        {/* Simplified Corporate Footer */}
        <footer className="pt-3 border-t border-slate-100/80 text-center space-y-1 w-full max-w-[280px] mx-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hệ thống ERP Digital Travel</p>
          <div className="flex items-center justify-center space-x-2 text-[9px] text-slate-400">
            <span>Phiên bản PWA 2.4.0</span>
            <span>•</span>
            <span className="flex items-center">
              <span className="w-1.2 h-1.2 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              Kết nối an toàn
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
