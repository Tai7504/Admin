import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { getImageUrl } from '../utils/urlHelpers';
import { toast } from 'react-toastify';

export default function WcuImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ title: '', display_order: 0, status: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wcu-images/admin/all');
      if (res.data.success) setImages(res.data.data);
    } catch (error) {
      toast.error('Lỗi tải danh sách ảnh!');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditing(null);
    setForm({ title: '', display_order: images.length + 1, status: true });
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditing(item);
    setForm({ title: item.title || '', display_order: item.display_order, status: item.status });
    setImageFile(null);
    setImagePreview(item.image_url ? getImageUrl(item.image_url) : '');
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !imageFile) {
      toast.error('Vui lòng chọn ảnh!');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('display_order', form.display_order);
      formData.append('status', form.status);
      if (imageFile) formData.append('image', imageFile);

      if (editing) {
        await api.put(`/wcu-images/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Cập nhật thành công!');
      } else {
        await api.post('/wcu-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Thêm ảnh thành công!');
      }
      setShowForm(false);
      fetchImages();
    } catch (error) {
      toast.error('Lỗi lưu ảnh!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    try {
      await api.delete(`/wcu-images/${id}`);
      toast.success('Đã xóa!');
      fetchImages();
    } catch (error) {
      toast.error('Lỗi xóa ảnh!');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>🖼️ Ảnh Carousel - Vì Sao Chọn Chúng Tôi</h1>
        <button onClick={openAddForm}
          style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
          + Thêm ảnh
        </button>
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing ? 'Sửa ảnh' : 'Thêm ảnh mới'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Tiêu đề (tùy chọn)</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }}
                  placeholder="Nhập tiêu đề ảnh..." />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Ảnh *</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" style={{ marginTop: 12, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Thứ tự</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Trạng thái</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value === 'true' })}
                    style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' }}>
                    <option value="true">Hiển thị</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: 12, background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: 12, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                  {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách ảnh */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>Đang tải...</p>
      ) : images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <p style={{ fontSize: 48 }}>🖼️</p>
          <p style={{ marginTop: 8 }}>Chưa có ảnh nào. Bấm "Thêm ảnh" để bắt đầu!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {images.map((item) => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
              <div style={{ position: 'relative', paddingTop: '62.5%', background: '#f1f5f9' }}>
                {item.image_url && (
                  <img src={getImageUrl(item.image_url)} alt={item.title || 'WCU'}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <span style={{
                  position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: item.status ? '#dcfce7' : '#fee2e2', color: item.status ? '#166534' : '#991b1b'
                }}>
                  {item.status ? 'Hiện' : 'Ẩn'}
                </span>
              </div>
              <div style={{ padding: 14 }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.title || 'Không tiêu đề'}</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>Thứ tự: {item.display_order}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => openEditForm(item)}
                    style={{ flex: 1, padding: '8px 0', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                    ✏️ Sửa
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    style={{ flex: 1, padding: '8px 0', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
