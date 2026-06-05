import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { getImageUrl } from '../utils/urlHelpers';
import { toast } from 'react-toastify';
import { Edit2, Trash2, Plus, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import SunEditorReact from 'suneditor-react';
const SunEditor = SunEditorReact.default || SunEditorReact;

// Cấu hình Toolbar cho SunEditor
const editorOptions = {
  height: 400,
  buttonList: [
    ['undo', 'redo'],
    ['font', 'fontSize', 'formatBlock'],
    ['paragraphStyle', 'blockquote'],
    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
    ['fontColor', 'hiliteColor', 'textStyle'],
    ['removeFormat'],
    ['outdent', 'indent'],
    ['align', 'horizontalRule', 'list', 'lineHeight'],
    ['table', 'link', 'image'],
    ['fullScreen', 'showBlocks', 'codeView']
  ],
  imageFileInput: false
};

export default function Courses() {
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 8;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [licenseTypes, setLicenseTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    content: '',
    price: '',
    discount_percentage: '0',
    license_type_id: '',
    status: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Custom delete modal state
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchLicenseTypes();
  }, []);

  const fetchCourses = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await api.get(`/courses/admin/all?page=${page}&limit=${limit}`);
      if (res.data.success) {
        setCourses(res.data.data);
        setPagination(res.data.pagination || null);
      }
    } catch (error) {
      toast.error('Lỗi tải danh sách khóa học!');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCourses(page);
  };

  const fetchLicenseTypes = async () => {
    try {
      const res = await api.get('/license-types');
      if (res.data.success) {
        setLicenseTypes(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi tải hạng bằng:', error);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setFormData({
        id: course.id,
        name: course.name,
        description: course.description || '',
        content: course.content || '',
        price: course.price || '',
        discount_percentage: course.discount_percentage || '0',
        license_type_id: course.license_type_id || '',
        status: course.status !== undefined ? course.status : true,
      });
      setImagePreview(course.image ? getImageUrl(course.image) : '');
    } else {
      setFormData({
        id: null,
        name: '',
        description: '',
        content: '',
        price: '',
        discount_percentage: '0',
        license_type_id: '',
        status: true,
      });
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, WEBP...)!');
        e.target.value = null;
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          form.append(key, formData[key]);
        }
      });
      if (imageFile) {
        form.append('image', imageFile);
      }

      if (formData.id) {
        await api.put(`/courses/${formData.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Cập nhật thành công!');
      } else {
        await api.post('/courses', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Thêm khóa học thành công!');
      }
      
      setIsModalOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingCourseId(id);
  };

  const confirmDelete = async () => {
    if (!deletingCourseId) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/courses/${deletingCourseId}`);
      if (res.data.success) {
        toast.success('Đã xóa khóa học thành công!');
        fetchCourses();
        setDeletingCourseId(null);
      }
    } catch (error) {
      toast.error('Xóa khóa học thất bại!');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Khóa học</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Thêm khóa học</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Hình ảnh</th>
              <th className="px-6 py-4">Tên khóa học</th>
              <th className="px-6 py-4">Hạng bằng</th>
              <th className="px-6 py-4">Học phí</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Chưa có khóa học nào.</td></tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {course.image ? (
                      <img src={getImageUrl(course.image)} alt={course.name} className="w-16 h-12 object-cover rounded-md border" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200 text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                      {course.license_type?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-orange-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}
                    </div>
                    {course.discount_percentage > 0 && (
                      <div className="text-xs text-green-600">Giảm {course.discount_percentage}%</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${course.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {course.status ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => handleOpenModal(course)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {(pagination.currentPage - 1) * pagination.limit + 1}–{Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} / {pagination.totalRecords} khóa học
          </p>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {(() => {
              const total = pagination.totalPages;
              const cur = currentPage;
              const pages = [];
              if (total <= 7) {
                for (let i = 1; i <= total; i++) pages.push(i);
              } else {
                pages.push(1);
                if (cur > 3) pages.push('...');
                for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
                if (cur < total - 2) pages.push('...');
                pages.push(total);
              }
              return pages.map((page, idx) =>
                page === '...' ? (
                  <span key={`dot-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === cur ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              );
            })()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">{formData.id ? 'Cập nhật khóa học' : 'Thêm khóa học mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hạng bằng</label>
                    <select value={formData.license_type_id} onChange={(e) => setFormData({...formData, license_type_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500">
                      <option value="">Chọn hạng bằng...</option>
                      {licenseTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Học phí (VNĐ)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">% Giảm giá (0-100)</label>
                    <input type="number" min="0" max="100" value={formData.discount_percentage} onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                  <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" placeholder="Mô tả ngắn hiển thị ngoài trang chủ..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết khóa học</label>
                  <div className="mb-12">
                    <SunEditor 
                      defaultValue={formData.content}
                      onChange={(content) => setFormData({...formData, content: content})}
                      setOptions={editorOptions}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh đại diện</label>
                  <div className="flex items-center space-x-4">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-24 h-16 object-cover rounded border" />
                    ) : (
                      <div className="w-24 h-16 bg-gray-100 flex items-center justify-center border rounded text-gray-400"><ImageIcon /></div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <input type="checkbox" id="status" checked={formData.status} onChange={(e) => setFormData({...formData, status: e.target.checked})} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="status" className="ml-2 block text-sm text-gray-900">Hiển thị khóa học này (Active)</label>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Hủy</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                  {submitting ? 'Đang lưu...' : 'Lưu khóa học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deletingCourseId}
        onClose={() => setDeletingCourseId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Xác nhận xóa khóa học?"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa khóa học này?"
      />
    </div>
  );
}
