import React from 'react';
import { Trash2 } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Xác nhận xóa?", 
  message = "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bản ghi này?",
  confirmText = "Xóa",
  cancelText = "Hủy",
  loading = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl transform transition-all scale-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 py-2.5 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 text-gray-700 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang xóa...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
