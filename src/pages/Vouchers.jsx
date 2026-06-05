import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Tag, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form fields
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [status, setStatus] = useState(true);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  // Delete modal state
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vouchers/admin/all');
      if (res.data.success) {
        setVouchers(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách voucher!');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách khóa học!');
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setIsEdit(false);
    setEditingId(null);
    setCode('');
    setDiscount('');
    setDescription('');
    setTerms('');
    setStatus(true);
    setSelectedCourseIds([]);
    setShowFormModal(true);
  };

  const openEditModal = (voucher) => {
    setIsEdit(true);
    setEditingId(voucher.id);
    setCode(voucher.code);
    setDiscount(voucher.discount);
    setDescription(voucher.description || '');
    setTerms(voucher.terms || '');
    setStatus(voucher.status);
    setSelectedCourseIds(voucher.course_ids || []);
    setShowFormModal(true);
  };

  const handleCheckboxChange = (courseId) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      return toast.warning('Vui lòng nhập mã voucher!');
    }
    const discountVal = parseInt(discount);
    if (isNaN(discountVal) || discountVal < 0 || discountVal > 100) {
      return toast.warning('Phần trăm giảm giá phải từ 0% đến 100%!');
    }

    const payload = {
      code: code.trim().toUpperCase(),
      discount: discountVal,
      description: description.trim(),
      terms: terms.trim(),
      status,
      course_ids: selectedCourseIds
    };

    try {
      if (isEdit) {
        const res = await api.put(`/vouchers/${editingId}`, payload);
        if (res.data.success) {
          toast.success('Cập nhật voucher thành công!');
          setShowFormModal(false);
          fetchVouchers();
        }
      } else {
        const res = await api.post('/vouchers', payload);
        if (res.data.success) {
          toast.success('Thêm voucher mới thành công!');
          setShowFormModal(false);
          fetchVouchers();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/vouchers/${deletingId}`);
      if (res.data.success) {
        toast.success('Xóa voucher thành công!');
        fetchVouchers();
        setDeletingId(null);
      }
    } catch (error) {
      toast.error('Xóa voucher thất bại!');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Mã Giảm Giá (Voucher)</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý mã ưu đãi, phần trăm giảm giá và các khóa học được áp dụng mã.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={16} />
          Thêm Voucher mới
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Mã Voucher</th>
              <th className="px-6 py-4">Mức giảm giá</th>
              <th className="px-6 py-4">Áp dụng cho khóa học</th>
              <th className="px-6 py-4">Mô tả & Điều kiện</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Đang tải danh sách voucher...
                </td>
              </tr>
            ) : vouchers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy voucher nào. Hãy thêm voucher mới!
                </td>
              </tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-blue-500" />
                      <span className="font-mono font-bold text-gray-900 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded">
                        {v.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-extrabold text-red-600">
                      -{v.discount}%
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-[250px]">
                    {v.course_names.length === 0 ? (
                      <span className="inline-block bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-xs font-semibold">
                        Tất cả các khóa học
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {v.course_names.map((name, idx) => (
                          <span 
                            key={idx} 
                            className="inline-block bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-xs truncate max-w-[200px]"
                            title={name}
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-[300px]">
                    <div className="text-gray-900 font-medium truncate" title={v.description}>{v.description || 'Không có mô tả'}</div>
                    {v.terms && (
                      <div className="text-xs text-gray-500 mt-1 truncate" title={v.terms}>
                        Đ.kiện: {v.terms}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      v.status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${v.status ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                      {v.status ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => openEditModal(v)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Dialog Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full transform transition-all duration-300 animate-slideUp max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold">{isEdit ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}</h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="text-white hover:bg-blue-800 transition-colors p-1.5 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Voucher Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã Voucher *</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: GIAM50, KM2026"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase font-mono font-bold"
                    required
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giảm giá (%) *</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    placeholder="Từ 0 đến 100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả ngắn</label>
                <input 
                  type="text" 
                  placeholder="Mô tả công dụng của voucher này..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Điều kiện áp dụng</label>
                <textarea 
                  rows="2"
                  placeholder="Điều kiện áp dụng (Ví dụ: Chỉ áp dụng khi đóng cọc sớm trước ngày...)"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Course Selector - Checkboxes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Danh sách các khóa học được áp dụng mã</label>
                <div className="bg-blue-50 text-blue-800 rounded-lg p-3 text-xs mb-2 flex items-start gap-2 border border-blue-200">
                  <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Nếu <strong>không chọn</strong> khóa học nào bên dưới, hệ thống sẽ mặc định voucher này <strong>áp dụng cho toàn bộ các khóa học</strong>.
                  </span>
                </div>
                
                <div className="border border-gray-200 rounded-lg max-h-[160px] overflow-y-auto p-3.5 space-y-2 bg-gray-50">
                  {courses.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-4">Đang tải danh sách khóa học...</div>
                  ) : (
                    courses.map(course => (
                      <label key={course.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                        <input 
                          type="checkbox"
                          checked={selectedCourseIds.includes(course.id)}
                          onChange={() => handleCheckboxChange(course.id)}
                          className="w-4.5 h-4.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 font-medium">{course.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="voucher-status"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  className="w-4.5 h-4.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="voucher-status" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Kích hoạt hoạt động (Cho phép sử dụng voucher)
                </label>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Xác nhận xóa Voucher?"
        message="Mã voucher bị xóa sẽ không thể sử dụng để đăng ký khóa học nữa. Bạn có chắc chắn muốn xóa?"
      />
    </div>
  );
}
