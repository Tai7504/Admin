import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { getImageUrl } from '../utils/urlHelpers';
import { toast } from 'react-toastify';
import { Save, Plus, Pencil, Trash2, X, Check, Upload, Image as ImageIcon, Lock } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings() {
  const [settings, setSettings] = useState({
    company_name: '',
    hotline: '',
    email: '',
    address: '',
    facebook: '',
    facebook_messenger_link: '',
    zalo_link: '',
    logo_url: '',
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    contact_youtube: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState('');

  // License Types state
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [ltLoading, setLtLoading] = useState(true);
  const [showLtForm, setShowLtForm] = useState(false);
  const [editingLt, setEditingLt] = useState(null);
  const [ltForm, setLtForm] = useState({ code: '', name: '', description: '' });
  const [ltSaving, setLtSaving] = useState(false);

  // Custom delete modal state for License Type
  const [deletingLt, setDeletingLt] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ========== Change Password state ==========
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchLicenseTypes();
  }, []);

  // ========== System Settings ==========
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system-settings');
      if (res.data.success) {
        const settingsData = res.data.data;
        setSettings(prev => ({ ...prev, ...settingsData }));
        if (settingsData.logo_url) setLogoPreview(getImageUrl(settingsData.logo_url));
        if (settingsData.hero_image) setHeroImagePreview(getImageUrl(settingsData.hero_image));
      }
    } catch (error) {
      toast.error('Lỗi tải cấu hình hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, WEBP...)!');
        e.target.value = null;
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleHeroImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, WEBP...)!');
        e.target.value = null;
        return;
      }
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let updatedSettings = { ...settings };

      // Upload logo nếu có chọn file mới
      if (logoFile) {
        const formData = new FormData();
        formData.append('image', logoFile);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (uploadRes.data.success) {
          updatedSettings.logo_url = uploadRes.data.data.url;
          setSettings(prev => ({ ...prev, logo_url: uploadRes.data.data.url }));
          setLogoFile(null);
        }
      }

      // Upload hero image nếu có chọn file mới
      if (heroImageFile) {
        const formData = new FormData();
        formData.append('image', heroImageFile);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (uploadRes.data.success) {
          updatedSettings.hero_image = uploadRes.data.data.url;
          setSettings(prev => ({ ...prev, hero_image: uploadRes.data.data.url }));
          setHeroImageFile(null);
        }
      }

      const updates = Object.keys(updatedSettings).map(key => ({
        setting_key: key,
        setting_value: updatedSettings[key]
      }));
      const res = await api.put('/system-settings/bulk', { settings: updates });
      if (res.data.success) {
        toast.success('Lưu cấu hình thành công!');
      }
    } catch (error) {
      toast.error('Lưu cấu hình thất bại!');
    } finally {
      setSaving(false);
    }
  };

  // ========== License Types ==========
  const fetchLicenseTypes = async () => {
    try {
      setLtLoading(true);
      const res = await api.get('/license-types');
      if (res.data.success) {
        setLicenseTypes(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi tải danh sách hạng bằng!');
    } finally {
      setLtLoading(false);
    }
  };

  const openAddLtForm = () => {
    setEditingLt(null);
    setLtForm({ code: '', name: '', description: '' });
    setShowLtForm(true);
  };

  const openEditLtForm = (lt) => {
    setEditingLt(lt);
    setLtForm({ code: lt.code || '', name: lt.name || '', description: lt.description || '' });
    setShowLtForm(true);
  };

  const closeLtForm = () => {
    setShowLtForm(false);
    setEditingLt(null);
    setLtForm({ code: '', name: '', description: '' });
  };

  const handleLtSubmit = async () => {
    if (!ltForm.code.trim() || !ltForm.name.trim()) {
      toast.error('Vui lòng nhập Mã hạng và Tên hạng bằng!');
      return;
    }
    try {
      setLtSaving(true);
      if (editingLt) {
        const res = await api.put(`/license-types/${editingLt.id}`, ltForm);
        if (res.data.success) {
          toast.success('Cập nhật hạng bằng thành công!');
        }
      } else {
        const res = await api.post('/license-types', ltForm);
        if (res.data.success) {
          toast.success('Thêm hạng bằng thành công!');
        }
      }
      closeLtForm();
      fetchLicenseTypes();
    } catch (error) {
      toast.error('Lưu hạng bằng thất bại!');
    } finally {
      setLtSaving(false);
    }
  };

  const handleDeleteLt = async (lt) => {
    setDeletingLt(lt);
  };

  const confirmDeleteLt = async () => {
    if (!deletingLt) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/license-types/${deletingLt.id}`);
      if (res.data.success) {
        toast.success('Đã xóa hạng bằng thành công!');
        fetchLicenseTypes();
        setDeletingLt(null);
      }
    } catch (error) {
      toast.error('Xóa hạng bằng thất bại!');
    } finally {
      setDeleting(false);
    }
  };

  // ========== Change Password ==========
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ các trường!');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận không khớp!');
      return;
    }

    try {
      setPwdSaving(true);
      const res = await api.put('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      if (res.data.success) {
        toast.success('Đổi mật khẩu thành công!');
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Đang tải cấu hình...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ========== Cấu hình hệ thống ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-800">Cấu hình Hệ thống</h2>
          <p className="text-sm text-gray-500 mt-1">Thông tin này sẽ được hiển thị trên giao diện Landing Page cho khách hàng.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
            <div className="shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-20 w-auto object-contain border rounded-lg p-2 bg-gray-50" />
              ) : (
                <div className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded-lg border text-gray-400"><Upload size={24} /></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Logo trung tâm</h3>
              <p className="text-xs text-gray-500 mb-2">Khuyến nghị: PNG hoặc SVG nền trong suốt.</p>
              <input type="file" accept="image/*" onChange={handleLogoChange} className="block text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>

          <div className="space-y-4 pt-4 pb-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Thông tin chung & Liên hệ</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📍 Địa chỉ văn phòng</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập địa chỉ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📞 Số điện thoại Hotline</label>
                <input
                  type="text"
                  value={settings.hotline}
                  onChange={(e) => handleChange('hotline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0901234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📧 Email liên hệ</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💬 Link Zalo</label>
                <input
                  type="url"
                  value={settings.zalo_link}
                  onChange={(e) => handleChange('zalo_link', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://zalo.me/0901234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📘 Link Facebook Fanpage</label>
                <input
                  type="url"
                  value={settings.facebook}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://facebook.com/trang-cua-ban"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💬 Link Facebook Messenger</label>
                <input
                  type="url"
                  value={settings.facebook_messenger_link}
                  onChange={(e) => handleChange('facebook_messenger_link', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://m.me/trang-cua-ban"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🎬 Link YouTube</label>
                <input
                  type="url"
                  value={settings.contact_youtube}
                  onChange={(e) => handleChange('contact_youtube', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://youtube.com/@kenh-cua-ban"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========== Quản lý Hạng bằng ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 border-b border-gray-200 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản lý Hạng bằng</h2>
            <p className="text-sm text-gray-500 mt-1">Danh sách các hạng bằng lái xe được sử dụng trong khóa học.</p>
          </div>
          <button
            onClick={openAddLtForm}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={16} />
            <span>Thêm hạng bằng</span>
          </button>
        </div>

        {/* Form thêm/sửa inline */}
        {showLtForm && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3">
              {editingLt ? `Sửa hạng bằng: ${editingLt.code}` : 'Thêm hạng bằng mới'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã hạng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={ltForm.code}
                  onChange={(e) => setLtForm(p => ({ ...p, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="VD: B1, B2, C..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên hạng bằng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={ltForm.name}
                  onChange={(e) => setLtForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="VD: Hạng B1, Hạng B2..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input
                  type="text"
                  value={ltForm.description}
                  onChange={(e) => setLtForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Mô tả ngắn..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <button
                onClick={handleLtSubmit}
                disabled={ltSaving}
                className="flex items-center space-x-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                <Check size={16} />
                <span>{ltSaving ? 'Đang lưu...' : (editingLt ? 'Cập nhật' : 'Thêm mới')}</span>
              </button>
              <button
                onClick={closeLtForm}
                className="flex items-center space-x-1.5 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                <X size={16} />
                <span>Hủy</span>
              </button>
            </div>
          </div>
        )}

        {/* Bảng danh sách */}
        {ltLoading ? (
          <div className="text-gray-500 text-sm py-4">Đang tải...</div>
        ) : licenseTypes.length === 0 ? (
          <div className="text-gray-400 text-center py-8">Chưa có hạng bằng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 font-semibold text-gray-600 w-20">Mã</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Tên hạng bằng</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Mô tả</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {licenseTypes.map(lt => (
                  <tr key={lt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{lt.code}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{lt.name}</td>
                    <td className="py-3 px-4 text-gray-500">{lt.description || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditLtForm(lt)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteLt(lt)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========== Đổi mật khẩu ========== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Lock className="text-gray-500" size={20} />
            Đổi Mật Khẩu
          </h2>
          <p className="text-sm text-gray-500 mt-1">Thay đổi mật khẩu đăng nhập cho tài khoản Admin của bạn.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập mật khẩu cũ..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={pwdForm.confirmPassword}
              onChange={(e) => setPwdForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={pwdSaving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{pwdSaving ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</span>
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal 
        isOpen={!!deletingLt}
        onClose={() => setDeletingLt(null)}
        onConfirm={confirmDeleteLt}
        loading={deleting}
        title="Xác nhận xóa hạng bằng?"
        message={`Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa hạng bằng "${deletingLt?.code} - ${deletingLt?.name}"?`}
      />
    </div>
  );
}
