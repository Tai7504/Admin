import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { getImageUrl } from '../utils/urlHelpers';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ title: '', target_url: '', display_order: 0, status: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Custom delete modal state
  const [deletingBanner, setDeletingBanner] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners/admin/all');
      if (res.data.success) setBanners(res.data.data);
    } catch (error) {
      toast.error('Lỗi tải danh sách banner!');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = (droppedFile = null) => {
    setEditing(null);
    setForm({ title: '', target_url: '', display_order: banners.length + 1, status: true });
    if (droppedFile instanceof File) {
      setImageFile(droppedFile);
      setImagePreview(URL.createObjectURL(droppedFile));
    } else {
      setImageFile(null);
      setImagePreview('');
    }
    setShowForm(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      openAddForm(file);
    } else {
      toast.error('Vui lòng kéo thả file ảnh (JPG, PNG, WEBP)!');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const openEditForm = (banner) => {
    setEditing(banner);
    setForm({
      title: banner.title || '',
      target_url: banner.target_url || '',
      display_order: banner.display_order || 0,
      status: banner.status !== false
    });
    setImageFile(null);
    setImagePreview(banner.image_url ? getImageUrl(banner.image_url) : '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setImageFile(null);
    setImagePreview('');
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
    if (!editing && !imageFile) {
      toast.error('Vui lòng chọn ảnh banner!');
      return;
    }
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('target_url', form.target_url);
      formData.append('display_order', form.display_order);
      formData.append('status', form.status);
      if (imageFile) formData.append('image', imageFile);

      if (editing) {
        const res = await api.put(`/banners/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) toast.success('Cập nhật banner thành công!');
      } else {
        const res = await api.post('/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) toast.success('Thêm banner thành công!');
      }
      closeForm();
      fetchBanners();
    } catch (error) {
      toast.error('Lưu banner thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner) => {
    setDeletingBanner(banner);
  };

  const confirmDelete = async () => {
    if (!deletingBanner) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/banners/${deletingBanner.id}`);
      if (res.data.success) {
        toast.success('Đã xóa banner thành công!');
        fetchBanners();
        setDeletingBanner(null);
      }
    } catch (error) {
      toast.error('Xóa banner thất bại!');
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (banner) => {
    try {
      const formData = new FormData();
      formData.append('status', !banner.status);
      const res = await api.put(`/banners/${banner.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(banner.status ? 'Đã ẩn banner' : 'Đã hiện banner');
        fetchBanners();
      }
    } catch (error) {
      toast.error('Cập nhật thất bại!');
    }
  };

  // Stats
  const totalBanners = banners.length;
  const activeBanners = banners.filter(b => b.status).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-on-surface-variant text-body-lg">Đang tải danh sách banner...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-[28px] font-bold text-on-surface leading-9">Danh sách Banner</h3>
          <p className="text-[16px] text-on-surface-variant mt-1">Ảnh banner hiển thị dạng carousel trên trang chủ Landing Page.</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-2 px-6 py-3 rounded-xl shadow-sm transition-all transform active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Thêm Banner</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">view_carousel</span>
          </div>
          <div>
            <p className="text-[12px] text-on-surface-variant uppercase tracking-wide font-semibold">Tổng số Banner</p>
            <p className="text-[20px] font-bold">{totalBanners}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success-green/10 text-success-green flex items-center justify-center">
            <span className="material-symbols-outlined">visibility</span>
          </div>
          <div>
            <p className="text-[12px] text-on-surface-variant uppercase tracking-wide font-semibold">Đang hiển thị</p>
            <p className="text-[20px] font-bold">{activeBanners}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-warning-amber/10 text-warning-amber flex items-center justify-center">
            <span className="material-symbols-outlined">visibility_off</span>
          </div>
          <div>
            <p className="text-[12px] text-on-surface-variant uppercase tracking-wide font-semibold">Đang ẩn</p>
            <p className="text-[20px] font-bold">{totalBanners - activeBanners}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-error-red/10 text-error-red flex items-center justify-center">
            <span className="material-symbols-outlined">update</span>
          </div>
          <div>
            <p className="text-[12px] text-on-surface-variant uppercase tracking-wide font-semibold">Cần cập nhật</p>
            <p className="text-[20px] font-bold">{totalBanners - activeBanners > 0 ? totalBanners - activeBanners : 0}</p>
          </div>
        </div>
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`group bg-surface-container-lowest rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${!banner.status ? 'opacity-60 border-outline' : 'border-outline-variant'}`}
          >
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden bg-surface-container-high">
              <img
                src={getImageUrl(banner.image_url)}
                alt={banner.title || 'Banner'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 bg-black/70 text-white text-[12px] font-bold px-3 py-1 rounded-lg backdrop-blur-md">
                #{banner.display_order}
              </span>
              {!banner.status && (
                <span className="absolute top-4 right-4 bg-error-red text-white text-[12px] font-bold px-3 py-1 rounded-lg">
                  Đang ẩn
                </span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => openEditForm(banner)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-lg font-bold"
                >
                  Xem trước
                </button>
              </div>
            </div>

            {/* Info & Actions */}
            <div className="p-5 flex items-center justify-between">
              <div>
                <h4 className="text-[16px] font-bold text-on-surface truncate max-w-[180px]">
                  {banner.title || '(Không tiêu đề)'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${banner.status ? 'bg-success-green' : 'bg-outline'}`}></span>
                  <span className="text-[10px] text-on-surface-variant">
                    {banner.status ? 'Đang hiển thị' : 'Đang ẩn'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditForm(banner)}
                  className="w-9 h-9 rounded-lg bg-success-green/10 text-success-green hover:bg-success-green hover:text-white transition-colors flex items-center justify-center"
                  title="Chỉnh sửa"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(banner)}
                  className="w-9 h-9 rounded-lg bg-error-red/10 text-error-red hover:bg-error-red hover:text-white transition-colors flex items-center justify-center"
                  title="Xóa"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Upload Card - Drag & Drop */}
        <div
          onClick={() => openAddForm()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`group border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center p-8 cursor-pointer min-h-[300px] ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-outline-variant bg-surface-container-low hover:border-primary hover:bg-primary/5'
          }`}
        >
          <div className={`w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform ${
            isDragging ? 'scale-125' : 'group-hover:scale-110'
          }`}>
            <span className="material-symbols-outlined text-[32px]">{isDragging ? 'downloading' : 'upload_file'}</span>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-bold text-on-surface">
              {isDragging ? 'Thả ảnh vào đây!' : 'Kéo thả ảnh hoặc nhấn để tải lên'}
            </p>
            <p className="text-[12px] text-on-surface-variant mt-2">Kích thước khuyên dùng: 1920x600px</p>
            <p className="text-[10px] text-outline mt-1">Hỗ trợ JPG, PNG, WEBP tối đa 5MB</p>
          </div>
          <span className="mt-6 text-primary font-bold text-[12px] underline">Chọn từ thiết bị</span>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h3 className="text-[20px] font-bold text-on-surface">
                {editing ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}
              </h3>
              <button onClick={closeForm} className="w-9 h-9 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant uppercase mb-2">Ảnh Banner *</label>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 text-center hover:bg-surface-container-low transition-colors relative overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Xem trước" className="w-full h-40 object-cover rounded-lg mb-3" />
                  ) : (
                    <div className="py-6">
                      <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2 block">upload_file</span>
                      <p className="text-[14px] text-on-surface-variant">Chọn ảnh banner (khuyến nghị 1920x600)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-[14px] text-on-surface-variant file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant uppercase mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none bg-surface-container-low"
                  placeholder="VD: Khai giảng khóa mới tháng 6"
                />
              </div>

              {/* Display Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-on-surface-variant uppercase mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none bg-surface-container-low"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-on-surface-variant uppercase mb-1">Trạng thái</label>
                  <select
                    value={form.status ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, status: e.target.value === 'true' })}
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none bg-surface-container-low"
                  >
                    <option value="true">Hiển thị</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50 font-bold"
                >
                  {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deletingBanner}
        onClose={() => setDeletingBanner(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Xác nhận xóa banner?"
        message={`Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa banner "${deletingBanner?.title || 'Không tiêu đề'}"?`}
      />
    </div>
  );
}
