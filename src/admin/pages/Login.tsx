import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
    //   const response = await api.post('/api/auth/dang-nhap', { tenDangNhap, matKhau });
    //   if (response.data && response.data.data && response.data.data.token) {
    //     const token = response.data.data.accessToken;
    //     // The context will decode the user info from the token. We can pass a dummy here,
    //     // or just let context do its thing by adding a generic setToken if we wanted.
    //     // For now, based on instructions, we will decode it here or rely on the decode in context.
    //     import('jwt-decode').then(({ jwtDecode }) => {
    //       try {
    //          const decoded: any = jwtDecode(token);
    //          const user = {
    //             hoTen: decoded.hoTen || decoded.name || 'Admin',
    //             maVaiTro: decoded.maVaiTro || decoded.role || 'ADMIN',
    //             tenHienThi: decoded.tenHienThi || decoded.sub || tenDangNhap,
    //          };
    //          login(token, user);
    //          navigate('/');
    //       } catch(e) {
    //          setError("Token không hợp lệ");
    //       }
    //     });
    //   } else {
    //     setError('Đăng nhập thất bại. Không nhận được token.');
    //   }
        const response = await api.post('/api/auth/dang-nhap', { tenDangNhap, matKhau });
            if (response.data?.data?.accessToken) {
            const { accessToken, hoTen, maVaiTro, tenHienThi } = response.data.data;
            login(accessToken, { hoTen, maVaiTro, tenHienThi });
            navigate('/');
            } else {
            setError('Đăng nhập thất bại. Không nhận được token.');
            }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80')] bg-cover bg-center">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00668A] mb-2">Đăng Nhập</h1>
          <p className="text-gray-600">Quản trị Hệ thống Du Lịch</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={tenDangNhap}
              onChange={(e) => setTenDangNhap(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00668A] focus:border-[#00668A] transition-colors"
              required
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00668A] focus:border-[#00668A] transition-colors"
              required
              placeholder="Nhập mật khẩu"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
