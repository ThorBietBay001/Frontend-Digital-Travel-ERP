import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, DollarSign, MapPin, Users, History } from 'lucide-react';
import type { Order } from './mockData';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const renderPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge label="Đã thanh toán" variant="success" />;
      case 'unpaid': return <Badge label="Chưa thanh toán" variant="warning" />;
      case 'partial': return <Badge label="Thanh toán 1 phần" variant="info" />;
      case 'refunded': return <Badge label="Đã hoàn tiền" variant="neutral" />;
      default: return null;
    }
  };

  const CustomHeader = (
    <div className="flex flex-col gap-1 pr-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-[#121C2C]">Chi tiết Đơn hàng</h2>
        {renderPaymentBadge(order.paymentStatus)}
      </div>
      <p className="text-sm font-medium text-gray-500">Mã đơn: {order.orderCode}</p>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<>{CustomHeader}</>}
      size="xl"
      footer={<Button variant="secondary" onClick={onClose}>Đóng</Button>}
    >
      <div className="flex flex-col gap-6 text-sm text-gray-700 font-sans">
        
        {/* Top Row: Customer & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Thông tin Khách hàng */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
              <User size={18} className="text-[#00668A]" />
              Thông tin Khách hàng
            </h3>
            <div className="bg-[#F9F9FF] p-4 rounded-xl border border-[#E1F1FF] flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-[#E1F1FF] pb-2">
                <span className="text-gray-500">Họ tên</span>
                <span className="font-semibold text-gray-800">{order.customerName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E1F1FF] pb-2">
                <span className="text-gray-500">Số điện thoại</span>
                <span className="font-medium text-gray-800">{order.customerPhone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-800">{order.email || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin Thanh toán */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
              <DollarSign size={18} className="text-[#00668A]" />
              Thanh toán
            </h3>
            <div className="bg-white p-4 rounded-xl border border-[#E1F1FF] flex flex-col gap-2.5 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#E1F1FF] pb-2">
                <span className="text-gray-500">Tổng tiền</span>
                <span className="font-bold text-[#121C2C] text-base">{order.totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E1F1FF] pb-2">
                <span className="text-gray-500">Đã thanh toán</span>
                <span className="font-bold text-[#16A34A]">
                  {order.paymentStatus === 'paid' ? order.totalAmount.toLocaleString('vi-VN') + ' đ' : '0 đ'}
                </span>
              </div>
              
              {order.paymentStatus === 'refunded' ? (
                <div className="flex justify-between items-center text-[#BA1A1A]">
                  <span className="font-medium">Đã hoàn tiền</span>
                  <span className="font-bold">{order.totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Còn lại</span>
                  <span className="font-bold text-[#BA1A1A]">
                    {order.paymentStatus === 'paid' ? '0 đ' : order.totalAmount.toLocaleString('vi-VN') + ' đ'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Thông tin Tour */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
            <MapPin size={18} className="text-[#00668A]" />
            Tour Thực Tế
          </h3>
          <div className="bg-[#F4F9FF] p-4 rounded-xl border border-[#89D4FF] flex justify-between items-center flex-wrap gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Tên tour</span>
              <span className="font-bold text-[#00668A] text-base">{order.tourName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Ngày khởi hành</span>
              <span className="font-semibold text-gray-800">{order.departureDate}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Số lượng khách</span>
              <span className="font-semibold text-gray-800">{order.passengerCount} người</span>
            </div>
          </div>
        </div>

        {/* Section 4: Danh sách Hành khách */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
            <Users size={18} className="text-[#00668A]" />
            Danh sách Hành khách
          </h3>
          <div className="border border-[#E1F1FF] rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9F9FF] text-gray-600 font-medium border-b border-[#E1F1FF]">
                <tr>
                  <th className="px-4 py-3">STT</th>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Độ tuổi</th>
                  <th className="px-4 py-3">Giới tính</th>
                </tr>
              </thead>
              <tbody>
                {order.passengers && order.passengers.length > 0 ? (
                  order.passengers.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors border-b border-[#E1F1FF] last:border-b-0">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.ageGroup}</td>
                      <td className="px-4 py-3 text-gray-600">{p.gender}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500 italic">
                      Chưa có thông tin hành khách.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Lịch sử Đơn hàng */}
        <div className="flex flex-col gap-3 mt-2">
          <h3 className="font-semibold text-[#121C2C] flex items-center gap-2">
            <History size={18} className="text-[#00668A]" />
            Lịch sử Đơn hàng
          </h3>
          <div className="relative pl-4 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E1F1FF] mt-2">
            
            {/* Step 1: Đặt hàng */}
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-3.5 h-3.5 mt-1 rounded-full bg-[#00668A] ring-4 ring-white -ml-[21px]"></div>
              <div>
                <p className="font-bold text-gray-800">Tạo đơn hàng</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.bookingDate}</p>
              </div>
            </div>

            {/* Step 2: Xác nhận */}
            <div className="relative z-10 flex items-start gap-4">
              <div className={`w-3.5 h-3.5 mt-1 rounded-full ring-4 ring-white -ml-[21px] ${order.status !== 'pending' ? 'bg-[#00668A]' : 'bg-gray-200'}`}></div>
              <div>
                <p className={order.status !== 'pending' ? 'font-bold text-gray-800' : 'font-medium text-gray-400'}>
                  Xác nhận đơn hàng
                </p>
                {order.status !== 'pending' && <p className="text-xs text-gray-500 mt-0.5">Đã xác nhận</p>}
              </div>
            </div>

            {/* Step 3: Hoàn thành / Hủy */}
            <div className="relative z-10 flex items-start gap-4">
              <div className={`w-3.5 h-3.5 mt-1 rounded-full ring-4 ring-white -ml-[21px] 
                ${order.status === 'completed' ? 'bg-[#16A34A]' : 
                  order.status === 'cancelled' ? 'bg-[#BA1A1A]' : 'bg-gray-200'}`}
              ></div>
              <div>
                <p className={
                  order.status === 'completed' ? 'font-bold text-[#16A34A]' : 
                  order.status === 'cancelled' ? 'font-bold text-[#BA1A1A]' : 'font-medium text-gray-400'
                }>
                  {order.status === 'cancelled' ? 'Đã hủy đơn' : order.status === 'completed' ? 'Hoàn thành' : 'Hoàn thành / Hủy'}
                </p>
                {(order.status === 'cancelled' || order.status === 'completed') && (
                  <p className="text-xs text-gray-500 mt-0.5">Cập nhật cuối</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </Modal>
  );
};

export default OrderDetailModal;
