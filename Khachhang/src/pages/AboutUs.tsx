export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
              Về Chúng Tôi
            </h1>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Digital Travel ERP là hệ thống quản lý du lịch toàn diện, được xây dựng với sứ mệnh
              mang đến trải nghiệm du lịch thông minh, bền vững cho người Việt Nam.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Chúng tôi kết hợp công nghệ hiện đại với trách nhiệm môi trường, tạo ra một nền tảng
              du lịch không chỉ tiện lợi mà còn góp phần bảo vệ thiên nhiên cho thế hệ tương lai.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-extrabold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-700 font-medium">Khách hàng</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-4xl font-extrabold text-green-600 mb-2">500+</div>
                <div className="text-gray-700 font-medium">Tour du lịch</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-4xl font-extrabold text-purple-600 mb-2">4.8★</div>
                <div className="text-gray-700 font-medium">Đánh giá</div>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-xl">
                <div className="text-4xl font-extrabold text-yellow-600 mb-2">98%</div>
                <div className="text-gray-700 font-medium">Hài lòng</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1603477849227-705c424d1d80?w=400"
              alt="Du lịch biển"
              className="rounded-2xl shadow-lg h-64 w-full object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=400"
              alt="Thiên nhiên"
              className="rounded-2xl shadow-lg h-64 w-full object-cover mt-8"
            />
            <img
              src="https://images.unsplash.com/photo-1541417904950-b855846fe074?w=400"
              alt="Bãi biển"
              className="rounded-2xl shadow-lg h-64 w-full object-cover -mt-8"
            />
            <img
              src="https://images.unsplash.com/photo-1586500036065-bdaeac7a4feb?w=400"
              alt="Cây dừa"
              className="rounded-2xl shadow-lg h-64 w-full object-cover"
            />
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Sứ Mệnh</h3>
            <p className="text-gray-600 leading-relaxed">
              Mang đến cho mọi người Việt Nam những trải nghiệm du lịch đẳng cấp quốc tế với giá cả hợp lý,
              đồng thời bảo vệ môi trường và phát triển bền vững.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">👁️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Tầm Nhìn</h3>
            <p className="text-gray-600 leading-relaxed">
              Trở thành nền tảng du lịch số 1 Việt Nam về du lịch xanh và bền vững,
              tiên phong ứng dụng công nghệ AI và blockchain trong ngành du lịch.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">💎</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Giá Trị Cốt Lõi</h3>
            <p className="text-gray-600 leading-relaxed">
              Tận tâm phục vụ khách hàng, minh bạch trong mọi giao dịch,
              và cam kết bảo vệ môi trường trong mọi hoạt động du lịch.
            </p>
          </div>
        </div>

        {/* Team */}
        <div className="mt-20">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
            Đội Ngũ Của Chúng Tôi
          </h2>
          <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Đội ngũ chuyên nghiệp với nhiều năm kinh nghiệm trong ngành du lịch và công nghệ
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'Nguyễn Văn A', role: 'CEO & Founder', avatar: '👨‍💼' },
              { name: 'Trần Thị B', role: 'CTO', avatar: '👩‍💻' },
              { name: 'Lê Văn C', role: 'Head of Operations', avatar: '👨‍💼' },
              { name: 'Phạm Thị D', role: 'Head of Marketing', avatar: '👩‍💼' }
            ].map((member, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {member.avatar}
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-1">{member.name}</h4>
                <p className="text-gray-600 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
