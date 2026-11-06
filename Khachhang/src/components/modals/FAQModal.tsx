import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FAQModalProps {
  onClose: () => void;
}

export default function FAQModal({ onClose }: FAQModalProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'why'>('faq');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const faqs = [
    {
      q: 'Làm thế nào để đặt tour?',
      a: 'Bạn chỉ cần tìm kiếm tour yêu thích, điền thông tin hành khách và thanh toán. Vé điện tử sẽ được gửi ngay qua email và SMS.'
    },
    {
      q: 'Tôi có thể hủy tour không?',
      a: 'Có, bạn được miễn phí hủy tour trong vòng 24h đầu tiên sau khi đặt. Sau đó sẽ áp dụng phí hủy theo chính sách của từng tour.'
    },
    {
      q: 'Điểm xanh là gì và cách nhận điểm?',
      a: 'Điểm xanh là phần thưởng khi bạn thực hiện các hành động bảo vệ môi trường trong chuyến đi. Tích lũy điểm để đổi voucher giảm giá.'
    },
    {
      q: 'Có thể thanh toán bằng cách nào?',
      a: 'Chúng tôi chấp nhận thẻ tín dụng/ghi nợ, ví điện tử (MoMo, ZaloPay), và chuyển khoản ngân hàng.'
    },
    {
      q: 'Tour có hướng dẫn viên tiếng Anh không?',
      a: 'Có, chúng tôi cung cấp HDV tiếng Anh cho một số tour. Vui lòng liên hệ trước khi đặt để được tư vấn chi tiết.'
    },
    {
      q: 'Hộ chiếu số là gì?',
      a: 'Hộ chiếu số là nơi quản lý thông tin cá nhân, lịch sử đặt tour, voucher, điểm thưởng và hạng thành viên của bạn.'
    },
    {
      q: 'Làm sao để nâng hạng thành viên?',
      a: 'Bạn sẽ tự động được nâng hạng khi tích lũy đủ điểm từ các chuyến đi. Bronze → Silver → Gold → Platinum.'
    },
    {
      q: 'Tour có bảo hiểm không?',
      a: 'Có, tất cả tour đều bao gồm bảo hiểm du lịch cơ bản. Bạn có thể mua thêm gói bảo hiểm cao cấp khi đặt tour.'
    }
  ];

  const whyChooseUs = [
    { icon: '💰', title: 'Giá Tốt Nhất', desc: 'Đảm bảo giá cạnh tranh nhất thị trường với nhiều ưu đãi hấp dẫn' },
    { icon: '🌱', title: 'Du Lịch Xanh', desc: 'Cam kết bảo vệ môi trường, du lịch bền vững vì một tương lai xanh' },
    { icon: '📱', title: 'Hộ Chiếu Số', desc: 'Quản lý thông minh, tiện lợi với công nghệ hiện đại' },
    { icon: '🎁', title: 'Ưu Đãi Đặc Biệt', desc: 'Tích điểm thưởng, đổi voucher và nhiều chương trình khuyến mãi' },
    { icon: '🛡️', title: 'An Toàn Tuyệt Đối', desc: 'Bảo hiểm toàn diện, đội ngũ hỗ trợ chuyên nghiệp 24/7' },
    { icon: '⚡', title: 'Đặt Tour Nhanh Chóng', desc: 'Xác nhận tức thì, thanh toán dễ dàng chỉ với vài thao tác' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Trợ Giúp & Thông Tin</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'faq'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Câu Hỏi Thường Gặp
            </button>
            <button
              onClick={() => setActiveTab('why')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'why'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tại Sao Chọn Digital Travel?
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {activeTab === 'faq' ? (
            <>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-start">
                      <span className="text-blue-600 mr-2">Q:</span>
                      {faq.q}
                    </h3>
                    <p className="text-gray-700 ml-6">
                      <span className="text-green-600 font-bold mr-2">A:</span>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="mt-6 bg-blue-50 rounded-xl p-5 text-center">
                <p className="text-gray-700 mb-2">
                  Không tìm thấy câu trả lời bạn cần?
                </p>
                <p className="text-blue-600 font-semibold">
                  Liên hệ: 1900-xxxx | support@digitaltravel.vn
                </p>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whyChooseUs.map((feature, idx) => (
                <div key={idx} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-blue-100">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
