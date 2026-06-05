import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { getImageUrl } from '../utils/urlHelpers';
import { toast } from 'react-toastify';
import { Save, Upload } from 'lucide-react';

export default function AboutUs() {
  const [settings, setSettings] = useState({
    about_image: '',
    about_text_1: '',
    about_text_2: '',
    about_features: '[]',
    about_intro_texts: '[]'
  });
  const [features, setFeatures] = useState([]);
  const [introTexts, setIntroTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [aboutImagePreview, setAboutImagePreview] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system-settings');
      if (res.data.success) {
        const settingsData = res.data.data;
        setSettings(prev => ({ ...prev, ...settingsData }));
        if (settingsData.about_image) setAboutImagePreview(getImageUrl(settingsData.about_image));
        
        // Parse dynamic features or migrate old ones
        if (settingsData.about_features) {
          try {
            setFeatures(JSON.parse(settingsData.about_features));
          } catch (e) {
            setFeatures([]);
          }
        } else if (settingsData.about_feature_1_title) {
          setFeatures([
            { title: settingsData.about_feature_1_title || '', desc: settingsData.about_feature_1_desc || '' },
            { title: settingsData.about_feature_2_title || '', desc: settingsData.about_feature_2_desc || '' }
          ].filter(f => f.title));
        }

        // Parse dynamic intro texts or migrate old ones
        if (settingsData.about_intro_texts) {
          try {
            setIntroTexts(JSON.parse(settingsData.about_intro_texts));
          } catch (e) {
            setIntroTexts([]);
          }
        } else {
          // Migration from old fields
          const oldTexts = [];
          if (settingsData.about_text_1) oldTexts.push(settingsData.about_text_1);
          if (settingsData.about_text_2) oldTexts.push(settingsData.about_text_2);
          setIntroTexts(oldTexts.length > 0 ? oldTexts : ['']);
        }
      }
    } catch (error) {
      toast.error('Lỗi tải thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...features];
    newFeatures[index][field] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, { title: '', desc: '' }]);
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleIntroTextChange = (index, value) => {
    const newTexts = [...introTexts];
    newTexts[index] = value;
    setIntroTexts(newTexts);
  };

  const addIntroText = () => {
    setIntroTexts([...introTexts, '']);
  };

  const removeIntroText = (index) => {
    setIntroTexts(introTexts.filter((_, i) => i !== index));
  };

  const moveIntroText = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= introTexts.length) return;
    const newTexts = [...introTexts];
    const temp = newTexts[index];
    newTexts[index] = newTexts[newIndex];
    newTexts[newIndex] = temp;
    setIntroTexts(newTexts);
  };

  const handleAboutImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, WEBP...)!');
        e.target.value = null;
        return;
      }
      setAboutImageFile(file);
      setAboutImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let updatedSettings = { ...settings };

      if (aboutImageFile) {
        const formData = new FormData();
        formData.append('image', aboutImageFile);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (uploadRes.data.success) {
          updatedSettings.about_image = uploadRes.data.data.url;
          setSettings(prev => ({ ...prev, about_image: uploadRes.data.data.url }));
          setAboutImageFile(null);
        }
      }

      // Cập nhật features và intro texts
      updatedSettings.about_features = JSON.stringify(features);
      const filteredIntroTexts = introTexts.filter(t => t.trim());
      updatedSettings.about_intro_texts = JSON.stringify(filteredIntroTexts);

      // Tương thích ngược: Đồng bộ 2 phần tử đầu tiên vào about_text_1 và about_text_2
      updatedSettings.about_text_1 = filteredIntroTexts[0] || '';
      updatedSettings.about_text_2 = filteredIntroTexts[1] || '';

      // Chỉ filter các key thuộc về trang About Us để update
      const aboutKeys = ['about_image', 'about_text_1', 'about_text_2', 'about_features', 'about_intro_texts'];
      const updates = aboutKeys.map(key => ({
        setting_key: key,
        setting_value: updatedSettings[key] || ''
      }));

      const res = await api.put('/system-settings/bulk', { settings: updates });
      if (res.data.success) {
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error) {
      toast.error('Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Đang tải thông tin...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-800">Quản lý "Về chúng tôi"</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý hình ảnh và nội dung giới thiệu hiển thị trên Landing Page.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:space-x-8 space-y-6 md:space-y-0">
              <div className="shrink-0 w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh giới thiệu</label>
                {aboutImagePreview ? (
                  <img src={aboutImagePreview} alt="About Us" className="w-full h-48 object-cover border rounded-lg bg-gray-50 mb-3 shadow-sm" />
                ) : (
                  <div className="w-full h-48 bg-gray-50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 mb-3">
                    <Upload size={32} className="mb-2" />
                    <span className="text-sm">Chưa có ảnh</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleAboutImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">Các đoạn giới thiệu chung</label>
                  <button 
                    type="button" 
                    onClick={addIntroText}
                    className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                  >
                    + Thêm đoạn giới thiệu
                  </button>
                </div>
                
                <div className="space-y-3">
                  {introTexts.map((text, index) => (
                    <div key={index} className="flex gap-2 items-start relative group">
                      <div className="flex-1">
                        <textarea 
                          value={text} 
                          onChange={(e) => handleIntroTextChange(index, e.target.value)} 
                          rows={index === 0 ? 3 : 2} 
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-xs" 
                          placeholder={`Đoạn giới thiệu thứ ${index + 1}...`} 
                        />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {introTexts.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeIntroText(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa đoạn này"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </button>
                        )}
                        {index > 0 && (
                          <button 
                            type="button"
                            onClick={() => moveIntroText(index, -1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-xs font-bold"
                            title="Di chuyển lên"
                          >
                            ▲
                          </button>
                        )}
                        {index < introTexts.length - 1 && (
                          <button 
                            type="button"
                            onClick={() => moveIntroText(index, 1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-xs font-bold"
                            title="Di chuyển xuống"
                          >
                            ▼
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {introTexts.length === 0 && (
                    <div className="text-center py-6 border border-dashed rounded-xl text-gray-400 text-xs">
                      Chưa có đoạn giới thiệu nào. Hãy bấm nút Thêm đoạn giới thiệu ở trên.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Các điểm nổi bật (Hiển thị icon checkmark)</h3>
                <button 
                  type="button" 
                  onClick={addFeature}
                  className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"
                >
                  + Thêm điểm nổi bật
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="space-y-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100 relative group">
                    <button 
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa điểm này"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                    
                    <h4 className="text-sm font-bold text-blue-800 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">{index + 1}</span> 
                      Điểm nổi bật {index + 1}
                    </h4>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-medium">Tiêu đề</label>
                      <input type="text" value={feature.title} onChange={(e) => handleFeatureChange(index, 'title', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="VD: Đào tạo chuyên nghiệp" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 font-medium">Mô tả chi tiết</label>
                      <textarea value={feature.desc} onChange={(e) => handleFeatureChange(index, 'desc', e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="VD: Giáo trình cập nhật liên tục..." />
                    </div>
                  </div>
                ))}
                
                {features.length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                    Chưa có điểm nổi bật nào. Bấm nút Thêm ở trên.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md font-medium"
            >
              <Save size={20} />
              <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
