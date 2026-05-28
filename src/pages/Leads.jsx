import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { Search, Edit2, Trash2, Eye, Phone, Mail, MapPin, Clock, Copy, CheckCircle2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Custom delete modal state
  const [deletingLeadId, setDeletingLeadId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Status mapping
  const STATUS_LABELS = {
    0: { text: 'Mới', color: 'bg-blue-100 text-blue-800' },
    1: { text: 'Đang tư vấn', color: 'bg-yellow-100 text-yellow-800' },
    2: { text: 'Đã chốt', color: 'bg-green-100 text-green-800' },
    3: { text: 'Spam/Hủy', color: 'bg-red-100 text-red-800' }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads${statusFilter ? `?status=${statusFilter}` : ''}`);
      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đăng ký!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/leads/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success('Cập nhật trạng thái thành công!');
        fetchLeads();
      }
    } catch (error) {
      toast.error('Cập nhật thất bại!');
    }
  };

  const handleDelete = async (id) => {
    setDeletingLeadId(id);
  };

  const confirmDelete = async () => {
    if (!deletingLeadId) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/leads/${deletingLeadId}`);
      if (res.data.success) {
        toast.success('Xóa đăng ký thành công!');
        fetchLeads();
        setDeletingLeadId(null);
      }
    } catch (error) {
      toast.error('Xóa thất bại!');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Đăng ký Tư vấn (Leads)</h2>
        
        <div className="flex gap-2">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="0">Mới</option>
            <option value="1">Đang tư vấn</option>
            <option value="2">Đã chốt</option>
            <option value="3">Spam/Hủy</option>
          </select>
          <button 
            onClick={fetchLeads}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Học viên</th>
              <th className="px-6 py-4">Liên hệ</th>
              <th className="px-6 py-4">Khóa học quan tâm</th>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Không có dữ liệu đăng ký nào.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{lead.full_name}</div>
                    {lead.customer_notes && (
                      <div className="text-xs text-gray-500 truncate max-w-[200px]" title={lead.customer_notes}>
                        Ghi chú: {lead.customer_notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center text-gray-700">
                      <Phone size={14} className="mr-2" />
                      <a href={`tel:${lead.phone}`} className="hover:text-blue-600">{lead.phone}</a>
                    </div>
                    {lead.email && (
                      <div className="flex items-center text-gray-500 text-xs">
                        <Mail size={14} className="mr-2" />
                        {lead.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600">
                    {lead.course_interested?.name || 'Chưa chọn'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(lead.created_time)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${STATUS_LABELS[lead.status].color}`}
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead.id, parseInt(e.target.value))}
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val} className="bg-white text-gray-900">
                          {label.text}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Chi tiết Lead - Professional Design */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 animate-slideUp max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{selectedLead.full_name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold text-white ${
                    selectedLead.status === 0 ? 'bg-blue-500' :
                    selectedLead.status === 1 ? 'bg-yellow-500' :
                    selectedLead.status === 2 ? 'bg-green-500' :
                    'bg-red-500'
                  }`}>
                    {STATUS_LABELS[selectedLead.status].text}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-blue-800 hover:scale-110 transition-all p-2 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              
              {/* Section: Thông tin cơ bản */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded"></div>
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Điện thoại */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone size={18} className="text-blue-600" />
                      <label className="text-sm font-semibold text-gray-600">Điện thoại</label>
                    </div>
                    <div className="flex items-center justify-between">
                      <a href={`tel:${selectedLead.phone}`} className="text-lg font-bold text-blue-600 hover:text-blue-700">
                        {selectedLead.phone}
                      </a>
                      <button
                        onClick={() => handleCopy(selectedLead.phone, 'phone')}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy"
                      >
                        {copiedField === 'phone' ? 
                          <CheckCircle2 size={18} className="text-green-600" /> :
                          <Copy size={18} className="text-gray-400 hover:text-gray-600" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail size={18} className="text-blue-600" />
                      <label className="text-sm font-semibold text-gray-600">Email</label>
                    </div>
                    <div className="flex items-center justify-between">
                      <a href={`mailto:${selectedLead.email || ''}`} className="text-lg font-bold text-blue-600 hover:text-blue-700 truncate">
                        {selectedLead.email || 'Chưa cung cấp'}
                      </a>
                      {selectedLead.email && (
                        <button
                          onClick={() => handleCopy(selectedLead.email, 'email')}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                          title="Copy"
                        >
                          {copiedField === 'email' ? 
                            <CheckCircle2 size={18} className="text-green-600" /> :
                            <Copy size={18} className="text-gray-400 hover:text-gray-600" />
                          }
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={18} className="text-blue-600" />
                      <label className="text-sm font-semibold text-gray-600">Địa chỉ</label>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {selectedLead.address || 'Chưa cung cấp'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section: Khóa học */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-600 rounded"></div>
                  Khóa học quan tâm
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <p className="text-xl font-bold text-green-900">
                    {selectedLead.course_interested?.name || 'Chưa chọn khóa học'}
                  </p>
                  {selectedLead.course_interested?.description && (
                    <p className="text-sm text-green-700 mt-2">
                      {selectedLead.course_interested.description.substring(0, 100)}...
                    </p>
                  )}
                </div>
              </div>

              {/* Section: Ghi chú */}
              {(selectedLead.customer_notes || selectedLead.telesale_notes) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-orange-600 rounded"></div>
                    Ghi chú
                  </h3>
                  <div className="space-y-4">
                    {selectedLead.customer_notes && (
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                        <p className="text-xs font-semibold text-orange-600 mb-2">👤 Ghi chú của khách hàng</p>
                        <p className="text-gray-900 text-sm leading-relaxed">
                          {selectedLead.customer_notes}
                        </p>
                      </div>
                    )}
                    {selectedLead.telesale_notes && (
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <p className="text-xs font-semibold text-purple-600 mb-2">📞 Ghi chú của Telesale</p>
                        <p className="text-gray-900 text-sm leading-relaxed">
                          {selectedLead.telesale_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Thông tin khác */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gray-600 rounded"></div>
                  Thông tin khác
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-gray-600" />
                      <label className="text-sm font-semibold text-gray-600">Ngày đăng ký</label>
                    </div>
                    <p className="text-gray-900 font-medium text-sm">
                      {formatDate(selectedLead.created_time)}
                    </p>
                  </div>
                  {selectedLead.Modify_time && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-gray-600" />
                        <label className="text-sm font-semibold text-gray-600">Cập nhật lần cuối</label>
                      </div>
                      <p className="text-gray-900 font-medium text-sm">
                        {formatDate(selectedLead.Modify_time)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deletingLeadId}
        onClose={() => setDeletingLeadId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Xác nhận xóa lượt đăng ký?"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa lượt đăng ký này?"
      />
    </div>
  );
}
