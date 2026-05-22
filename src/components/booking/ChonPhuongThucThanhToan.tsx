interface PaymentMethodSelectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export default function ChonPhuongThucThanhToan({ paymentMethod, setPaymentMethod }: PaymentMethodSelectionProps) {
  const methods = [
    {
      id: 'credit_card',
      title: 'Thẻ tín dụng / Thẻ ghi nợ',
      description: 'Hỗ trợ Visa, MasterCard, JCB, American Express'
    },
    {
      id: 'ewallet',
      title: 'Ví điện tử',
      description: 'Thanh toán tức thì qua MoMo, ZaloPay, ShopeePay'
    },
    {
      id: 'bank_transfer',
      title: 'Chuyển khoản ngân hàng',
      description: 'Quét mã VietQR chuyển khoản nhanh 24/7'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border-t-4 border-t-purple-600 shadow-sm space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          Phương thức thanh toán
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Chọn phương thức giao dịch thuận tiện và an toàn nhất của bạn.
        </p>
      </div>

      <div className="space-y-2 pt-2">
        {methods.map((method) => {
          const isSelected = paymentMethod === method.id;
          return (
            <label
              key={method.id}
              className="flex items-start space-x-3.5 p-3.5 rounded-xl hover:bg-slate-50/50 cursor-pointer group transition-colors"
            >
              <input
                type="radio"
                name="payment"
                checked={isSelected}
                onChange={() => setPaymentMethod(method.id)}
                className="w-4 h-4 text-blue-600 border-slate-350 focus:ring-blue-500/20 mt-1 cursor-pointer"
              />
              <div className="flex-1">
                <span className="block font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                  {method.title}
                </span>
                <span className="block text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                  {method.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
