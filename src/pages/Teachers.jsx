import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { getImageUrl } from '../utils/urlHelpers';
import { toast } from 'react-toastify';
import { Edit2, Trash2, Plus, X, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({ id: null, name: '', description: '', status: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Custom delete modal state
  const [deletingTeacherId, setDeletingTeacherId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teachers/admin/all');
      if (res.data.success) setTeachers(res.data.data);
    } catch (error) {
      toast.error('Lỗi tải danh sách giáo viên!');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (teacher = null) => {
    if (teacher) {
      setFormData({ id: teacher.id, name: teacher.name, description: teacher.description || '', status: teacher.status });
      setImagePreview(teacher.image ? getImageUrl(teacher.image) : '');
    } else {
      setFormData({ id: null, name: '', description: '', status: true });
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
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('status', formData.status);
      if (imageFile) data.append('image', imageFile);

      let res;
      if (formData.id) {
        res = await api.put(`/teachers/${formData.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/teachers', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      if (res.data.success) {
        toast.success(formData.id ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        setIsModalOpen(false);
        fetchTeachers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingTeacherId(id);
  };

  const confirmDelete = async () => {
    if (!deletingTeacherId) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/teachers/${deletingTeacherId}`);
      if (res.data.success) {
        toast.success('Đã xóa giáo viên thành công!');
        fetchTeachers();
        setDeletingTeacherId(null);
      }
    } catch (error) {
      toast.error('Xóa giáo viên thất bại!');
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= teachers.length) return;

    // Hoán đổi vị trí trong mảng cục bộ
    const updatedTeachers = [...teachers];
    const temp = updatedTeachers[index];
    updatedTeachers[index] = updatedTeachers[newIndex];
    updatedTeachers[newIndex] = temp;

    // Cập nhật state cục bộ để UI thay đổi mượt mà ngay lập tức
    setTeachers(updatedTeachers);

    // Tính toán sort_order liên tục
    const sortData = updatedTeachers.map((teacher, idx) => ({
      id: teacher.id,
      sort_order: idx
    }));

    try {
      await api.put('/teachers/sort-order', { sortData });
      toast.success('Cập nhật thứ tự thành công!');
    } catch (error) {
      toast.error('Lỗi cập nhật thứ tự trên server!');
      fetchTeachers(); // rollback nếu lỗi
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Giáo viên</h2>
          <p className="text-sm text-gray-500 mt-1">Thông tin giáo viên hiển thị ở mục "Về chúng tôi" trên Landing Page.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={18} /><span>Thêm giáo viên</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Ảnh</th>
              <th className="px-6 py-4">Họ tên</th>
              <th className="px-6 py-4">Mô tả</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-center">Thứ tự</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : teachers.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Chưa có giáo viên nào.</td></tr>
            ) : (
              teachers.map((t, index) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {t.image ? (
                      <img src={getImageUrl(t.image)} alt={t.name} className="w-14 h-14 object-cover rounded-full border-2 border-gray-200" />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-full border border-gray-200 text-gray-400"><ImageIcon size={20} /></div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{t.description || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {t.status ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                        title="Di chuyển lên"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === teachers.length - 1}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                        title="Di chuyển xuống"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => handleOpenModal(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">{formData.id ? 'Cập nhật giáo viên' : 'Thêm giáo viên mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên giáo viên *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Chức vụ</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" placeholder="VD: Giáo viên hạng B2, 10 năm kinh nghiệm"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-full border" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center border rounded-full text-gray-400"><ImageIcon /></div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="teacher-status" checked={formData.status} onChange={(e) => setFormData({...formData, status: e.target.checked})} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="teacher-status" className="ml-2 block text-sm text-gray-900">Hiển thị trên Landing Page</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : 'Lưu giáo viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deletingTeacherId}
        onClose={() => setDeletingTeacherId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Xác nhận xóa giáo viên?"
        message="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa giáo viên này?"
      />
    </div>
  );
}
