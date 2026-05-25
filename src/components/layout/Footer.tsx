import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import digitalTravelLogo from '../../assets/digital-travel-logo.svg';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 text-white mb-4">
              <img src={digitalTravelLogo} alt="Digital Travel" className="w-10 h-10" />
              <span className="font-bold text-xl">Digital Travel</span>
            </div>
            <p className="text-sm mb-4">
              Hệ thống quản lý du lịch thông minh, mang đến trải nghiệm du lịch xanh và bền vững cho người Việt.
            </p>
            <div className="flex space-x-4">
              {/* Removed icons */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-500 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/#tours" className="hover:text-blue-500 transition-colors">
                  Tour du lịch
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-500 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/passport" className="hover:text-blue-500 transition-colors">
                  Hộ chiếu số
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/#tours" className="hover:text-blue-500 transition-colors">
                  Tour trong nước
                </Link>
              </li>
              <li>
                <Link to="/#tours" className="hover:text-blue-500 transition-colors">
                  Tour quốc tế
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-500 transition-colors">
                  Du lịch xanh
                </Link>
              </li>
              <li>
                <Link to="/passport" className="hover:text-blue-500 transition-colors">
                  Tích điểm thưởng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>support@digitaltravel.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2026 Digital Travel ERP. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
