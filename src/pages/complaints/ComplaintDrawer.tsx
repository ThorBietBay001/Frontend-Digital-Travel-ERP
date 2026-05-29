import React, { useState, useEffect } from 'react';
import { X, MessageSquare, AlertCircle, XCircle, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { Complaint } from './mockData';
import { ordersService } from '../../services/orders';
import { formatDate, formatDateTime } from '../../utils/dateHelpers';

interface ComplaintDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  mode: 'edit' | 'view';
  onUpdate?: (updatedComplaint: Complaint) => void;
}

const ComplaintDrawer: React.FC<ComplaintDrawerProps> = ({ isOpen, onClose, complaint, mode, onUpdate }) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [finalNote, setFinalNote] = useState('');
  
  const [tourName, setTourName] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [realCustomerName, setRealCustomerName] = useState<string>('');

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'pending_info': return 'Chờ bổ sung';
      case 'pending_guide': return 'Chờ giải trình';
      case 'pending_review': return 'Chờ duyệt';
      case 'resolved': return 'Đã giải quyết';
      case 'rejected': return 'Từ chối';
      case 'cancelled': return 'Đã hủy';
      default: return 'Chờ xử lý';
    }
  };

  const formatComplaintContent = (content: string) => {
    return content
      .replace(/lúc (\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?/g, 'lúc $1 $2')
      .replace(/(\[(?:Yêu cầu HDV giải trình|HDV giải trình|Yêu cầu KH bổ sung) lúc [^\]]+\]:)\s*/g, '$1 \n')
      .replace(/(\[Bổ sung ngày [^\]]+\]:)\s*/g, '$1\n');
  };
  
  useEffect(() => {
    setActiveAction(null);
    setNoteContent('');
    setFinalNote('');
    setTourName('');
    setDepartureDate('');
    
    if (isOpen && complaint?.maDatTour) {
      ordersService.chiTietDatTour(complaint.maDatTour).then(res => {
        setTourName(res.tieuDeTour || '');
        setDepartureDate(res.ngayKhoiHanh ? formatDate(res.ngayKhoiHanh) : '');
        setRealCustomerName(res.tenKhachHang || '');
      }).catch(e => console.error(e));
    }
  }, [isOpen, complaint]);

  if (!isOpen || !complaint) return null;

  const isView = mode === 'view';
  const actionContentLabels: Record<string, string> = {
    'Yêu cầu KH bổ sung': 'Nội dung yêu cầu KH bổ sung',
    'Yêu cầu HDV giải trình': 'Nội dung yêu cầu HDV giải trình',
    'Đề xuất bồi thường': 'Nội dung đề xuất bồi thường',
    'Từ chối khiếu nại': 'Nội dung từ chối khiếu nại',
  };

  const handleActionComplete = () => {
    if (activeAction && noteContent.trim() && onUpdate) {
      let newStatus = complaint.status;
      let actionTitle = activeAction;

      if (activeAction === 'Yêu cầu KH bổ sung') {
        newStatus = 'pending_info';
        actionTitle = 'Yêu cầu khách hàng bổ sung thông tin';
      } else if (activeAction === 'Yêu cầu HDV giải trình') {
        newStatus = 'pending_guide';
        actionTitle = 'Yêu cầu HDV giải trình';
      } else if (activeAction === 'Đề xuất bồi thường') {
        actionTitle = 'Đề xuất bồi thường';
      } else if (activeAction === 'Từ chối khiếu nại') {
        newStatus = 'rejected';
        actionTitle = 'Từ chối khiếu nại';
      }

      const updatedComplaint: Complaint = {
        ...complaint,
        status: newStatus,
        timeline: [
          ...complaint.timeline,
          { 
            action: `${actionTitle}: ${noteContent}`, 
            timestamp: formatDateTime(new Date()) 
          }
        ]
      };

      onUpdate(updatedComplaint);
      setActiveAction(null);
      setNoteContent('');
    } else {
      alert("Vui lòng nhập nội dung chi tiết.");
    }
  };

  const handleFinalize = (status: 'resolved' | 'rejected') => {
    if (onUpdate && finalNote.trim()) {
      const updatedComplaint: Complaint = {
        ...complaint,
        status: status,
        resolution: finalNote,
        timeline: [
          ...complaint.timeline,
          { 
            action: `Hoàn tất xử lý: ${status === 'resolved' ? 'Đã giải quyết' : 'Từ chối'}`, 
            timestamp: formatDateTime(new Date()) 
          }
        ]
      };
      onUpdate(updatedComplaint);
      onClose();
    } else {
      alert("Vui lòng nhập ghi chú xử lý (bắt buộc) trước khi hoàn tất.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-[900px] max-h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col transform transition-transform duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#E1F1FF]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#121C2C]">Chi tiết khiếu nại</h2>
            <span className="px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700">Trạng thái: {getStatusDisplay(complaint.status)}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Cột trái (60%) */}
          <div className="w-full md:w-[60%] flex flex-col h-full overflow-y-auto p-6 border-r border-[#E1F1FF]">
            
            {/* Thông tin Tour */}
            <div className="mb-6 bg-white border border-[#E1F1FF] rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-[#121C2C] mb-3 text-sm flex items-center gap-2">
                Thông tin Tour
              </h3>
              <div className="grid grid-cols-1 gap-2.5 text-sm text-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mã đơn hàng:</span>
                  <span className="font-medium">{complaint.maDatTour || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tên Tour:</span>
                  <span className="font-medium text-right max-w-[200px] truncate" title={tourName}>{tourName || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ngày khởi hành:</span>
                  <span className="font-medium">{departureDate || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tên khách hàng:</span>
                  <span className="font-medium text-right">{realCustomerName || complaint.customerName || '—'}</span>
                </div>
              </div>
            </div>

            {/* Nội dung phản ánh */}
            <div className="mb-6">
              <h3 className="font-bold text-[#121C2C] mb-3 text-sm">Nội dung phản ánh</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                {formatComplaintContent(complaint.description)}
              </div>
            </div>

            {/* Ảnh đính kèm */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mb-6">
                 <h3 className="font-bold text-[#121C2C] mb-3 text-sm">Ảnh đính kèm</h3>
                 <div className="grid grid-cols-3 gap-3">
                   {complaint.attachments.map((img, idx) => (
                     <div key={idx} className="aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-300 cursor-pointer hover:opacity-90">
                       <img src={img} alt="attachment" className="w-full h-full object-cover" />
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* Lịch sử điều tra (Timeline) */}
            {complaint.timeline && complaint.timeline.length > 0 && (
              <div>
                <h3 className="font-bold text-[#121C2C] mb-4 text-sm">Lịch sử điều tra</h3>
                <div className="relative border-l border-gray-200 ml-3 space-y-6">
                  {complaint.timeline.map((item, index) => {
                    const isLast = index === complaint.timeline.length - 1;
                    return (
                      <div key={index} className="relative pl-6">
                        <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${isLast ? 'bg-[#00668A]' : 'bg-gray-300'}`}></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">{item.action}</span>
                          <span className="text-xs text-gray-500 mt-0.5">{item.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Cột phải (40%) */}
          <div className="w-full md:w-[40%] bg-[#F9F9FF] h-full overflow-y-auto p-6 flex flex-col">
            
            <h3 className="font-bold text-[#121C2C] mb-4 text-sm">Hướng Xử Lý</h3>
            
            <div className="flex flex-col gap-3 mb-6">
              <button 
                onClick={() => setActiveAction('Yêu cầu KH bổ sung')}
                disabled={isView}
                className="w-full text-left p-3 rounded-lg border border-[#93C5FD] bg-[#EFF6FF] text-[#1E3A8A] flex items-center gap-3 hover:bg-[#DBEAFE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                <MessageSquare size={18} /> Yêu cầu KH bổ sung
              </button>
              
              <button 
                onClick={() => setActiveAction('Yêu cầu HDV giải trình')}
                disabled={isView}
                className="w-full text-left p-3 rounded-lg border border-[#FDBA74] bg-[#FFF7ED] text-[#9A3412] flex items-center gap-3 hover:bg-[#FFEDD5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                <AlertCircle size={18} /> Yêu cầu HDV giải trình
              </button>

              <button 
                onClick={() => setActiveAction('Từ chối khiếu nại')}
                disabled={isView}
                className="w-full text-left p-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B] flex items-center gap-3 hover:bg-[#FEE2E2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                <XCircle size={18} /> Từ chối khiếu nại
              </button>
            </div>

            {/* Vùng nhập liệu khi chọn action */}
            {activeAction && !isView && (
              <div className="mb-6 p-4 bg-white border border-[#E1F1FF] rounded-lg shadow-sm">
                <p className="text-sm font-semibold text-gray-800 mb-2">{actionContentLabels[activeAction]}</p>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00668A] resize-none mb-3"
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Ghi chú chi tiết..."
                />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setActiveAction(null)}>Hủy</Button>
                  <Button variant="primary" size="sm" onClick={handleActionComplete}>Cập nhật</Button>
                </div>
              </div>
            )}

            {/* Phần chốt: Ghi chú và Hoàn tất */}
            <div className="mt-auto border-t border-[#E1F1FF] pt-4">
               <h3 className="font-bold text-[#121C2C] mb-2 text-sm">Ghi chú xử lý (Kết luận)</h3>
               {isView ? (
                 <div className="p-3 bg-gray-100 rounded-md text-sm text-gray-700 min-h-[80px]">
                   {complaint.resolution || 'Không có ghi chú.'}
                 </div>
               ) : (
                 <>
                   <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#00668A] resize-none mb-4"
                    rows={4}
                    value={finalNote}
                    onChange={(e) => setFinalNote(e.target.value)}
                    placeholder="Tóm tắt kết quả xử lý trước khi hoàn tất..."
                   />
                   <div className="flex flex-col gap-2">
                    <Button 
                      variant="primary" 
                      className="w-full justify-center"
                      onClick={() => handleFinalize('resolved')}
                      icon={<Check size={18} />}
                    >
                      Hoàn tất xử lý
                    </Button>
                    <Button 
                      variant="danger" 
                      className="w-full justify-center"
                      onClick={() => handleFinalize('rejected')}
                    >
                      Từ chối khiếu nại
                    </Button>
                   </div>
                 </>
               )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ComplaintDrawer;
