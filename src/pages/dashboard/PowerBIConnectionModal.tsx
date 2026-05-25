import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Eye, EyeOff, Download, Database, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { powerBiService } from '../../services/power-bi';
import type { 
  PowerBiKhoDuLieuResponse, 
  PowerBiKetNoiResponse,
  XuatDuLieuRequest
} from '../../services/power-bi';

interface PowerBIConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PowerBIConnectionModal: React.FC<PowerBIConnectionModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'download'>('connect');
  
  // Data stores
  const [khoDuLieuList, setKhoDuLieuList] = useState<PowerBiKhoDuLieuResponse[]>([]);
  const [selectedKho, setSelectedKho] = useState<string>('');
  
  // Connect Tab State
  const [connectionInfo, setConnectionInfo] = useState<PowerBiKetNoiResponse | null>(null);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [errorConnection, setErrorConnection] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Download Tab State
  const [downloadReq, setDownloadReq] = useState<XuatDuLieuRequest>({
    maKho: '',
    dinhDang: 'EXCEL'
  });
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [errorDownload, setErrorDownload] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchKhoDuLieu();
    }
  }, [isOpen]);

  const fetchKhoDuLieu = async () => {
    try {
      const res = await powerBiService.danhSachKhoDuLieu();
      if (res.data && res.data.length > 0) {
        setKhoDuLieuList(res.data);
        setSelectedKho(res.data[0].maKho);
        setDownloadReq(prev => ({ ...prev, maKho: res.data[0].maKho }));
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách kho dữ liệu", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'connect' && selectedKho) {
      fetchConnectionInfo(selectedKho);
    }
  }, [activeTab, selectedKho]);

  const fetchConnectionInfo = async (maKho: string) => {
    setLoadingConnection(true);
    setErrorConnection('');
    try {
      const res = await powerBiService.layThongTinKetNoi(maKho);
      if (res.success && res.data) {
        setConnectionInfo(res.data);
      } else {
        setErrorConnection(res.message || 'Không thể lấy thông tin kết nối. Vui lòng thử lại.');
      }
    } catch (err) {
      setErrorConnection(err instanceof Error ? err.message : 'Không thể lấy thông tin kết nối. Vui lòng thử lại.');
    } finally {
      setLoadingConnection(false);
    }
  };

  const handleCopy = () => {
    if (!connectionInfo) return;
    const text = `Host: ${connectionInfo.host}\nPort: ${connectionInfo.port}\nService Name: ${connectionInfo.serviceName}\nUsername: ${connectionInfo.username}\nPassword: ${connectionInfo.password || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setLoadingDownload(true);
    setErrorDownload('');
    try {
      const req: any = { ...downloadReq, maKho: selectedKho };
      if (!req.tuNgay) delete req.tuNgay;
      if (!req.denNgay) delete req.denNgay;
      
      const response = await powerBiService.xuatDuLieu(req);
      
      // Handle file download
      const contentDisposition = response.headers['content-disposition'];
      let filename = `PowerBI_Data_${Date.now()}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      const blob = new Blob([response.data], { 
        type: req.dinhDang === 'EXCEL' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setErrorDownload('Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoadingDownload(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="text-blue-600" size={24} />
            Dữ liệu Phân tích (Power BI)
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button
              className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'connect' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('connect')}
            >
              Kết nối trực tiếp
            </button>
            <button
              className={`pb-3 px-2 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'download' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('download')}
            >
              Tải file dữ liệu
            </button>
          </div>

          {/* Common Filter: Kho dữ liệu */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn nguồn dữ liệu (Kho)</label>
            <select 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              value={selectedKho}
              onChange={(e) => setSelectedKho(e.target.value)}
            >
              {khoDuLieuList.map(kho => (
                <option key={kho.maKho} value={kho.maKho}>{kho.tenKho}</option>
              ))}
            </select>
            {khoDuLieuList.find(k => k.maKho === selectedKho)?.moTa && (
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <span className="font-medium text-gray-600">Mô tả:</span> {khoDuLieuList.find(k => k.maKho === selectedKho)?.moTa}
              </p>
            )}
          </div>

          {/* Tab Content: Connect */}
          {activeTab === 'connect' && (
            <div className="animate-fadeIn">
              <div className="bg-blue-50/50 p-4 rounded-xl mb-6 text-sm text-blue-800 border border-blue-100">
                <p className="font-semibold mb-1">Hướng dẫn sử dụng:</p>
                <p>Mở Power BI Desktop &gt; Get Data &gt; Oracle database &gt; Dán các thông tin kết nối dưới đây.</p>
              </div>

              {loadingConnection ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <RefreshCw className="animate-spin mb-4" size={32} />
                  <p>Đang lấy thông tin kết nối...</p>
                </div>
              ) : errorConnection ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
                  {errorConnection}
                </div>
              ) : connectionInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Host</label>
                      <input type="text" readOnly value={connectionInfo.host} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm font-mono focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Port</label>
                      <input type="text" readOnly value={connectionInfo.port} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm font-mono focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Service Name</label>
                    <input type="text" readOnly value={connectionInfo.serviceName} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm font-mono focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Username (Read-only)</label>
                    <input type="text" readOnly value={connectionInfo.username} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm font-mono focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        readOnly 
                        value={connectionInfo.password || ''} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm font-mono focus:outline-none pr-10" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  {connectionInfo.hetHan && (
                    <p className="text-xs text-orange-600 font-medium">Lưu ý: Thông tin đăng nhập này sẽ hết hạn vào lúc {new Date(connectionInfo.hetHan).toLocaleString('vi-VN')}</p>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <Button variant="secondary" onClick={handleCopy} className="flex items-center gap-2">
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      {copied ? 'Đã sao chép' : 'Sao chép thông tin'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Tab Content: Download */}
          {activeTab === 'download' && (
            <div className="animate-fadeIn space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                  <input 
                    type="date" 
                    value={downloadReq.tuNgay || ''}
                    onChange={(e) => setDownloadReq({...downloadReq, tuNgay: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                  <input 
                    type="date" 
                    value={downloadReq.denNgay || ''}
                    onChange={(e) => setDownloadReq({...downloadReq, denNgay: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Định dạng file</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="format" 
                      value="EXCEL"
                      checked={downloadReq.dinhDang === 'EXCEL'}
                      onChange={() => setDownloadReq({...downloadReq, dinhDang: 'EXCEL'})}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-gray-700 text-sm">Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="format" 
                      value="CSV"
                      checked={downloadReq.dinhDang === 'CSV'}
                      onChange={() => setDownloadReq({...downloadReq, dinhDang: 'CSV'})}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-gray-700 text-sm">CSV (.csv)</span>
                  </label>
                </div>
              </div>

              {errorDownload && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
                  {errorDownload}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button 
                  variant="primary" 
                  onClick={handleDownload} 
                  disabled={loadingDownload || !selectedKho}
                  className="flex items-center gap-2 px-6"
                >
                  {loadingDownload ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                  {loadingDownload ? 'Đang tạo file...' : 'Xuất dữ liệu'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerBIConnectionModal;
