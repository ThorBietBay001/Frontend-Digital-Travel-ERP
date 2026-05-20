import { useState, useRef, useEffect } from 'react';
import { 
  X, Mail, User, Phone, MapPin, Lock, 
  ChevronLeft, CheckCircle2, ShieldAlert, Sparkles, KeyRound 
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Registration and Login Form inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for OTP Verification (UC56)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [otpError, setOtpError] = useState('');
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);
  
  // Global form errors / loading state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown Timer Tick
  useEffect(() => {
    let timer: any;
    if (isVerifyingOtp && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifyingOtp, otpCountdown]);

  // Handle email/username inputs validation
  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  // Form submission (Login or Register Init)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      setIsLoading(true);
      // Simulate slight API delay for luxury feel
      setTimeout(() => {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Match default mock user or custom registered users
        const isMockUser = (email === 'nguyenvanan@example.com' || email === 'nguyenvanan') && password === '123';
        const matchedUser = registeredUsers.find(
          (u: any) => (u.email === email || u.username === email) && u.password === password
        );

        if (isMockUser || matchedUser) {
          let profileToSave;
          if (isMockUser) {
            profileToSave = {
              id: 'user-001',
              fullName: 'Nguyễn Văn An',
              email: 'nguyenvanan@example.com',
              phone: '0912345678',
              dateOfBirth: '1990-05-15',
              gender: 'Nam',
              idCard: '001090012345',
              passport: 'C1234567',
              address: '123 Đường Lê Lợi, Quận 1, TP. HCM',
              membershipTier: 'Gold',
              greenPoints: 1250,
              healthInfo: 'Khỏe mạnh',
              allergies: 'Không có'
            };
          } else {
            profileToSave = {
              id: `user-${Date.now()}`,
              fullName: matchedUser.username,
              email: matchedUser.email,
              phone: matchedUser.phone,
              dateOfBirth: '1995-08-20',
              gender: 'Nam',
              idCard: '001095012345',
              passport: 'B9876543',
              address: matchedUser.address,
              membershipTier: 'Bronze', // New user starts at Bronze tier
              greenPoints: 0,
              healthInfo: 'Khỏe mạnh',
              allergies: 'Không có'
            };
          }
          
          localStorage.setItem('userProfile', JSON.stringify(profileToSave));
          setIsLoading(false);
          onLoginSuccess();
        } else {
          setIsLoading(false);
          setError('Tên đăng nhập/Email hoặc mật khẩu không chính xác!');
        }
      }, 800);
    } 
    
    else if (mode === 'register') {
      // 1. Client-side validations
      if (!validateEmail(email)) {
        setError('Định dạng email không hợp lệ!');
        return;
      }
      if (username.length < 3) {
        setError('Tên đăng nhập phải chứa tối thiểu 3 ký tự!');
        return;
      }
      if (phone.length < 10 || !/^\d+$/.test(phone)) {
        setError('Số điện thoại phải chứa ít nhất 10 số!');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu phải chứa tối thiểu 6 ký tự!');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp!');
        return;
      }
      if (!address.trim()) {
        setError('Địa chỉ không được để trống!');
        return;
      }

      // 2. Exception Check (4a - Email already exists)
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const emailExists = (email === 'nguyenvanan@example.com') || registeredUsers.some((u: any) => u.email === email);
      
      if (emailExists) {
        setError('Email này đã được sử dụng. Vui lòng sử dụng email khác.');
        return;
      }

      // 3. Initiate OTP Step (Luồng chính bước 4)
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsVerifyingOtp(true);
        setOtpCountdown(60);
        setOtpAttempts(0);
        setOtpError('');
        setOtpValue(['', '', '', '', '', '']);
        // Focus first box
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }, 1000);
    }
  };

  // OTP Individual Inputs Logic
  const handleOtpChange = (val: string, idx: number) => {
    const newOtp = [...otpValue];
    newOtp[idx] = val.slice(-1);
    setOtpValue(newOtp);
    
    // Auto-focus next input
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !otpValue[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    
    const otpCode = otpValue.join('');
    
    if (otpAttempts >= 5) {
      setOtpError("Bạn đã nhập sai OTP quá 5 lần. Vui lòng nhấn 'Gửi lại OTP' để nhận mã mới.");
      return;
    }

    if (otpCode === '123456') {
      setIsLoading(true);
      setTimeout(() => {
        // Save user into persistent mock database
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const newUser = {
          username,
          email,
          phone,
          address,
          password
        };
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        setIsLoading(false);
        setIsSuccessScreen(true);
        setIsVerifyingOtp(false);
      }, 1200);
    } else {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      if (newAttempts >= 5) {
        setOtpError("Bạn đã nhập sai OTP quá 5 lần. Vui lòng nhấn 'Gửi lại OTP' để nhận mã mới.");
      } else {
        setOtpError(`Mã OTP không chính xác. Bạn còn ${5 - newAttempts} lần nhập lại.`);
      }
      setOtpValue(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  // Resend OTP handler
  const handleResendOtp = () => {
    setOtpCountdown(60);
    setOtpAttempts(0);
    setOtpValue(['', '', '', '', '', '']);
    setOtpError('');
    alert('Hệ thống đã tạo và gửi lại mã OTP mới: 123456. Vui lòng sử dụng để xác thực.');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  // Close modal and reset fields
  const handleModalClose = () => {
    onClose();
  };

  // Back to registration from OTP screen
  const handleBackToRegister = () => {
    setIsVerifyingOtp(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-[2.2rem] max-w-lg w-full p-8 relative shadow-2xl border border-slate-100/80 transition-all duration-300">
        
        {/* Close Button */}
        {!isSuccessScreen && (
          <button 
            onClick={handleModalClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-50 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 1. SUCCESS SCREEN (Transition) */}
        {isSuccessScreen ? (
          <div className="text-center py-6 space-y-6 animate-scale-up">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto border-2 border-green-200 shadow-md">
              <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-950">Đăng ký thành công!</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                Tài khoản khách hàng của bạn đã được xác thực qua OTP và ghi nhận thành công vào cơ sở dữ liệu ERP.
              </p>
            </div>
            <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-100 text-left text-xs font-semibold text-slate-650 max-w-sm mx-auto space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Tên đăng nhập:</span>
                <span className="text-slate-900 font-extrabold">{username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email khách hàng:</span>
                <span className="text-slate-900 font-extrabold">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số điện thoại:</span>
                <span className="text-slate-900 font-extrabold">{phone}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsSuccessScreen(false);
                setMode('login');
                // Prefill login input
                setEmail(email);
                setPassword('');
              }}
              className="w-full py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) 
        
        // 2. OTP VERIFICATION SCREEN (UC56 Luồng 5)
        : isVerifyingOtp ? (
          <div className="space-y-6 animate-fade-in">
            <button 
              onClick={handleBackToRegister}
              className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại nhập thông tin</span>
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-950 flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-blue-600" />
                <span>Xác thực tài khoản</span>
              </h2>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Hệ thống đã gửi một mã OTP gồm 6 chữ số đến email <strong className="text-slate-800">{email}</strong>. Vui lòng nhập mã để hoàn thành.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6 OTP Inputs */}
              <div className="flex justify-between gap-2.5 py-2">
                {otpValue.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    disabled={otpAttempts >= 5}
                    className="w-12 h-14 text-center border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-lg font-black text-slate-900 outline-none transition-all bg-slate-50 focus:bg-white"
                    required
                  />
                ))}
              </div>

              {otpError && (
                <div className="bg-red-50 text-red-650 p-3.5 rounded-xl text-xs font-semibold border border-red-150 flex items-start space-x-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="text-center text-xs font-bold text-slate-500">
                {otpCountdown > 0 ? (
                  <p>Gửi lại mã OTP sau <span className="text-blue-600 font-extrabold">{otpCountdown} giây</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-blue-600 hover:text-blue-700 underline font-black"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpAttempts >= 5}
                className={`w-full py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-wider shadow-md ${
                  isLoading || otpAttempts >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Đang xác thực...' : 'Xác thực đăng ký'}
              </button>
            </form>
          </div>
        )
        
        // 3. MAIN LOGIN / REGISTER FORM
        : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span>
                  {mode === 'login' && 'Đăng nhập Cổng ERP'}
                  {mode === 'register' && 'Đăng ký tài khoản'}
                  {mode === 'forgot' && 'Quên mật khẩu'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                {mode === 'login' && 'Chào mừng bạn quay lại. Vui lòng nhập thông tin đăng nhập.'}
                {mode === 'register' && 'Đăng ký khách hàng mới để nhận Hộ chiếu số & Đặt tour.'}
                {mode === 'forgot' && 'Khôi phục mật khẩu tài khoản của bạn qua OTP.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-650 p-3.5 rounded-xl text-xs font-semibold border border-red-150 flex items-start space-x-2 animate-shake">
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form fields based on mode */}
              {mode === 'register' ? (
                /* Registration Mode: Grid of 6 Fields (UC56) */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Tên đăng nhập */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Tên đăng nhập
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white transition-all"
                          placeholder="nguyenvanan"
                          required
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white transition-all"
                          placeholder="an.nguyen@example.com"
                          required
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Mật khẩu */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Nhập lại mật khẩu */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Nhập lại mật khẩu
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white transition-all"
                          placeholder="0912345678"
                          required
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Địa chỉ */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Địa chỉ cư trú
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white transition-all"
                          placeholder="Quận 1, TP. HCM"
                          required
                        />
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Login Mode / Forgot Password Mode */
                <div className="space-y-4">
                  {mode === 'login' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                          Tên đăng nhập hoặc Email
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white transition-all"
                            placeholder="nguyenvanan hoặc nguyenvanan@example.com"
                            required
                          />
                          <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                          Mật khẩu
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white transition-all"
                            placeholder="••••••••"
                            required
                          />
                          <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </>
                  )}

                  {mode === 'forgot' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Số điện thoại đã đăng ký
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white transition-all"
                          placeholder="0912345678"
                          required
                        />
                        <Phone className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg ${
                  isLoading ? 'opacity-55 cursor-wait' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <>
                    {mode === 'login' && 'Đăng nhập'}
                    {mode === 'register' && 'Tiến hành Đăng ký'}
                    {mode === 'forgot' && 'Gửi mã xác thực'}
                  </>
                )}
              </button>
            </form>

            {/* Mode Switcher footer */}
            <div className="mt-6 text-center text-xs font-bold text-slate-500 border-t border-slate-100 pt-5 flex justify-center items-center gap-4">
              {mode === 'login' && (
                <>
                  <button 
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-blue-650 hover:text-blue-800 transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                  <span className="text-slate-200 font-normal">|</span>
                  <button 
                    onClick={() => { setMode('register'); setError(''); }}
                    className="text-blue-650 hover:text-blue-800 transition-colors"
                  >
                    Đăng ký tài khoản mới
                  </button>
                </>
              )}
              {mode === 'register' && (
                <>
                  <span className="text-slate-400 font-semibold">Đã có tài khoản?</span>
                  <button 
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-blue-650 hover:text-blue-800 transition-colors"
                  >
                    Đăng nhập ngay
                  </button>
                </>
              )}
              {mode === 'forgot' && (
                <button 
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-blue-650 hover:text-blue-800 transition-colors flex items-center space-x-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Quay lại đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
