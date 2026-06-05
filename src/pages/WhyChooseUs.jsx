import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { getImageUrl } from '../utils/urlHelpers';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

export default function WhyChooseUs() {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [descriptions, setDescriptions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [stats, setStats] = useState([]);
  const [features, setFeatures] = useState([]);
  const [openStats, setOpenStats] = useState({});
  const [openFeatures, setOpenFeatures] = useState({});

  // Carousel images state
  const [carouselImages, setCarouselImages] = useState([]);
  const [showImgForm, setShowImgForm] = useState(false);
  const [editingImg, setEditingImg] = useState(null);
  const [savingImg, setSavingImg] = useState(false);
  const [imgForm, setImgForm] = useState({ title: '', display_order: 0, status: true });
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState('');
  
  // Custom delete modal state
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toggleStat = (index) => {
    setOpenStats(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleFeature = (index) => {
    setOpenFeatures(prev => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    fetchSettings();
    fetchCarouselImages();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/system-settings');
      if (response.data.success) {
        const settings = response.data.data;

        setTitle(settings.wcu_title || '');
        
        if (settings.wcu_descriptions) {
          try {
            setDescriptions(JSON.parse(settings.wcu_descriptions));
          } catch {
            setDescriptions([]);
          }
        } else {
          // Fallback from old wcu_description
          setDescriptions(settings.wcu_description ? [settings.wcu_description] : ['']);
        }
        
        if (settings.wcu_image) {
          setImagePreview(getImageUrl(settings.wcu_image));
        }

      if (settings.wcu_stats) {
        try {
          setStats(JSON.parse(settings.wcu_stats));
        } catch {
          setStats([]);
        }
      }

      if (settings.wcu_features) {
        try {
          setFeatures(JSON.parse(settings.wcu_features));
        } catch {
          setFeatures([]);
        }
      }
      }
    } catch (error) {
      console.error('Error fetching Why Choose Us settings:', error);
      toast.error('Lỗi khi tải thông tin!');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addStat = () => {
    setStats([...stats, { value: '', label: '' }]);
  };

  const updateStat = (index, field, value) => {
    const newStats = [...stats];
    newStats[index][field] = value;
    setStats(newStats);
  };

  const removeStat = (index) => {
    const newStats = stats.filter((_, i) => i !== index);
    setStats(newStats);
  };

  const addFeature = () => {
    setFeatures([...features, { icon: 'check_circle', title: '', desc: '' }]);
  };

  const updateFeature = (index, field, value) => {
    const newFeatures = [...features];
    newFeatures[index][field] = value;
    setFeatures(newFeatures);
  };

  const removeFeature = (index) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  const handleDescChange = (index, value) => {
    const newDescs = [...descriptions];
    newDescs[index] = value;
    setDescriptions(newDescs);
  };

  const addDesc = () => {
    setDescriptions([...descriptions, '']);
  };

  const removeDesc = (index) => {
    setDescriptions(descriptions.filter((_, i) => i !== index));
  };

  const moveDesc = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= descriptions.length) return;
    const newDescs = [...descriptions];
    const temp = newDescs[index];
    newDescs[index] = newDescs[newIndex];
    newDescs[newIndex] = temp;
    setDescriptions(newDescs);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let imageUrl = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await axiosInstance.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (uploadRes.data.success) {
          imageUrl = uploadRes.data.data.url;
        }
      }

      const filteredDescs = descriptions.filter(d => d.trim());
      const settingsToUpdate = [
        { setting_key: 'wcu_title', setting_value: title },
        { setting_key: 'wcu_description', setting_value: filteredDescs[0] || '' },
        { setting_key: 'wcu_descriptions', setting_value: JSON.stringify(filteredDescs) },
        { setting_key: 'wcu_stats', setting_value: JSON.stringify(stats) },
        { setting_key: 'wcu_features', setting_value: JSON.stringify(features) }
      ];

      if (imageUrl) {
        settingsToUpdate.push({ setting_key: 'wcu_image', setting_value: imageUrl });
      }

      await axiosInstance.put('/system-settings/bulk', { settings: settingsToUpdate });
      toast.success('Đã lưu thông tin "Vì sao chọn chúng tôi"');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Lỗi khi lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  // === Carousel Images CRUD ===
  const fetchCarouselImages = async () => {
    try {
      const res = await axiosInstance.get('/wcu-images/admin/all');
      if (res.data.success) setCarouselImages(res.data.data);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const openAddImg = () => {
    setEditingImg(null);
    setImgForm({ title: '', display_order: carouselImages.length + 1, status: true });
    setImgFile(null);
    setImgPreview('');
    setShowImgForm(true);
  };

  const openEditImg = (item) => {
    setEditingImg(item);
    setImgForm({ title: item.title || '', display_order: item.display_order, status: item.status });
    setImgFile(null);
    setImgPreview(item.image_url ? getImageUrl(item.image_url) : '');
    setShowImgForm(true);
  };

  const handleImgSubmit = async (e) => {
    e.preventDefault();
    if (!editingImg && !imgFile) { toast.error('Vui lòng chọn ảnh!'); return; }
    setSavingImg(true);
    try {
      const formData = new FormData();
      formData.append('title', imgForm.title);
      formData.append('display_order', imgForm.display_order);
      formData.append('status', imgForm.status);
      if (imgFile) formData.append('image', imgFile);
      if (editingImg) {
        await axiosInstance.put(`/wcu-images/${editingImg.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Cập nhật ảnh thành công!');
      } else {
        await axiosInstance.post('/wcu-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Thêm ảnh thành công!');
      }
      setShowImgForm(false);
      fetchCarouselImages();
    } catch (error) {
      toast.error('Lỗi lưu ảnh!');
    } finally {
      setSavingImg(false);
    }
  };

  const handleDeleteImg = async (id) => {
    setDeletingId(id);
  };

  const confirmDeleteImg = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/wcu-images/${deletingId}`);
      toast.success('Đã xóa ảnh thành công!');
      fetchCarouselImages();
      setDeletingId(null);
    } catch (error) {
      toast.error('Lỗi khi xóa ảnh!');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý "Vì Sao Chọn Chúng Tôi"</h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={20} />
          <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề chính</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500"
            placeholder="Vì Sao Hơn 5,000+ Học Viên Chọn Chúng Tôi?"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">Các đoạn mô tả ngắn</label>
            <button 
              type="button" 
              onClick={addDesc}
              className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 font-medium transition-colors"
            >
              + Thêm đoạn mô tả
            </button>
          </div>
          
          <div className="space-y-3">
            {descriptions.map((descText, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <textarea 
                    value={descText} 
                    onChange={(e) => handleDescChange(index, e.target.value)} 
                    rows={2} 
                    className="w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-xs outline-none" 
                    placeholder={`Đoạn mô tả thứ ${index + 1}...`} 
                  />
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {descriptions.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeDesc(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa đoạn này"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  )}
                  {index > 0 && (
                    <button 
                      type="button"
                      onClick={() => moveDesc(index, -1)}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-xs font-bold"
                      title="Di chuyển lên"
                    >
                      ▲
                    </button>
                  )}
                  {index < descriptions.length - 1 && (
                    <button 
                      type="button"
                      onClick={() => moveDesc(index, 1)}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-xs font-bold"
                      title="Di chuyển xuống"
                    >
                      ▼
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {descriptions.length === 0 && (
              <div className="text-center py-6 border border-dashed rounded-xl text-gray-400 text-xs">
                Chưa có đoạn mô tả nào. Hãy bấm nút Thêm đoạn mô tả ở trên.
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Các khối Thống kê (Stats)</h3>
          <button onClick={addStat} className="flex items-center space-x-1 text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
            <Plus size={16} /> <span>Thêm thống kê</span>
          </button>
        </div>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="border rounded-lg bg-gray-50 overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleStat(index)}
              >
                <div className="flex items-center space-x-2 font-medium text-gray-700">
                  {openStats[index] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span>{stat.label || `Thống kê ${index + 1}`} - {stat.value || ''}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeStat(index); }} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded" 
                  title="Xóa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              {openStats[index] && (
                <div className="p-4 border-t border-gray-200 space-y-4 bg-white">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Con số (vd: 5,000+)</label>
                    <input type="text" value={stat.value} onChange={(e) => updateStat(index, 'value', e.target.value)} className="w-full px-3 py-2 border rounded focus:ring-blue-500 text-sm" placeholder="VD: 5,000+" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nhãn (vd: HỌC VIÊN)</label>
                    <input type="text" value={stat.label} onChange={(e) => updateStat(index, 'label', e.target.value)} className="w-full px-3 py-2 border rounded focus:ring-blue-500 text-sm" placeholder="VD: HỌC VIÊN" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Các tính năng (Thẻ ngang)</h3>
          <button onClick={addFeature} className="flex items-center space-x-1 text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
            <Plus size={16} /> <span>Thêm thẻ</span>
          </button>
        </div>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="border rounded-lg bg-gray-50 overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleFeature(index)}
              >
                <div className="flex items-center space-x-2 font-medium text-gray-700">
                  {openFeatures[index] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span>{feature.title || `Thẻ tính năng ${index + 1}`}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFeature(index); }} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded" 
                  title="Xóa"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {openFeatures[index] && (
                <div className="p-4 border-t border-gray-200 space-y-4 bg-white">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon (Google Material Icon Name)</label>
                    <input type="text" value={feature.icon} onChange={(e) => updateFeature(index, 'icon', e.target.value.toLowerCase().replaceAll(' ', '_'))} className="w-full px-3 py-2 border rounded focus:ring-blue-500 text-sm" placeholder="VD: directions_car" />
                    <p className="text-xs text-gray-400 mt-1">Tìm icon tại: <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-blue-500 underline">Google Fonts Icons</a></p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tiêu đề (vd: Dàn Xe Đời Mới)</label>
                    <input type="text" value={feature.title} onChange={(e) => updateFeature(index, 'title', e.target.value)} className="w-full px-3 py-2 border rounded focus:ring-blue-500 text-sm" placeholder="VD: Dàn Xe Đời Mới" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mô tả chi tiết</label>
                    <textarea rows="2" value={feature.desc} onChange={(e) => updateFeature(index, 'desc', e.target.value)} className="w-full px-3 py-2 border rounded focus:ring-blue-500 text-sm" placeholder="VD: 100% xe 2023-2024..."></textarea>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Images Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">🖼️ Ảnh Carousel (Trình chiếu bên phải)</h3>
          <button onClick={openAddImg} className="flex items-center space-x-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
            <Plus size={16} /> <span>Thêm ảnh</span>
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Các ảnh này sẽ tự động trình chiếu ở phần "Vì sao chọn chúng tôi" trên trang chủ.{" "}
          <span className="text-blue-600 font-semibold">(Kích thước khuyến nghị: 1280x800px hoặc tỷ lệ 16:10)</span>
        </p>

        {carouselImages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🖼️</p>
            <p>Chưa có ảnh carousel nào. Bấm "Thêm ảnh" để bắt đầu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {carouselImages.map((item) => (
              <div key={item.id} className="border rounded-xl overflow-hidden bg-gray-50">
                <div className="relative" style={{ paddingTop: '62.5%' }}>
                  {item.image_url && (
                    <img src={getImageUrl(item.image_url)} alt={item.title || 'WCU'}
                      className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.status ? 'Hiện' : 'Ẩn'}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{item.title || 'Không tiêu đề'}</p>
                  <p className="text-xs text-gray-400">Thứ tự: {item.display_order}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => openEditImg(item)} className="flex-1 text-xs py-1.5 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100">✏️ Sửa</button>
                    <button onClick={() => handleDeleteImg(item.id)} className="flex-1 text-xs py-1.5 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100">🗑️ Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal thêm/sửa ảnh carousel */}
      {showImgForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold">{editingImg ? 'Sửa ảnh' : 'Thêm ảnh mới'}</h3>
              <button onClick={() => setShowImgForm(false)} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleImgSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề (tùy chọn)</label>
                <input type="text" value={imgForm.title} onChange={(e) => setImgForm({ ...imgForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" placeholder="Nhập tiêu đề ảnh..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh {editingImg ? '' : '*'}</label>
                <label className="flex flex-col items-center justify-center w-full h-42 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors overflow-hidden">
                  {imgPreview ? (
                    <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 text-center px-4">
                      <ImageIcon size={32} className="mb-2" />
                      <span className="text-sm font-medium">Bấm để chọn ảnh</span>
                      <span className="text-[11px] text-blue-600 font-semibold mt-1">Khuyên dùng: 1280x800px (16:10)</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Hỗ trợ JPG, PNG, WEBP</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      if (!f.type.startsWith('image/')) {
                        toast.error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, WEBP...)!');
                        e.target.value = null;
                        return;
                      }
                      setImgFile(f); 
                      setImgPreview(URL.createObjectURL(f)); 
                    }
                  }} />
                </label>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                  <input type="number" value={imgForm.display_order} onChange={(e) => setImgForm({ ...imgForm, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={imgForm.status} onChange={(e) => setImgForm({ ...imgForm, status: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border rounded-lg">
                    <option value="true">Hiển thị</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowImgForm(false)} className="flex-1 py-2.5 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={savingImg} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {savingImg ? 'Đang lưu...' : (editingImg ? 'Cập nhật' : 'Thêm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDeleteImg}
        loading={deleting}
        title="Xác nhận xóa ảnh?"
        message="Hành động này không thể hoàn tác. Bạn có chắc muốn xóa ảnh này khỏi carousel?"
      />
    </div>
  );
}
