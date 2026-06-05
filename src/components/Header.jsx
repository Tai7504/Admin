import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  
  // Basic title mapping
  const titles = {
    '/': 'Bảng Điều Khiển',
    '/banners': 'Quản lý Banner',
    '/leads': 'Quản lý Khách hàng',
    '/courses': 'Quản lý Khóa học',
    '/news': 'Quản lý Tin tức',
    '/teachers': 'Giảng viên',
    '/settings': 'Cấu hình hệ thống'
  };
  const pageTitle = titles[location.pathname] || 'Tiến Bùi Admin';

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-surface shadow-sm border-b border-outline-variant z-40 flex justify-between items-center px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-headline-md font-headline-md font-bold text-primary">{pageTitle}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="bg-secondary-container text-on-secondary-container text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
            {user?.role || 'SuperAdmin'}
          </span>
          <span className="text-label-md font-label-md text-on-surface-variant">
            {user?.username || 'admin'}
          </span>
        </div>
        <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          <button 
            onClick={logout}
            className="w-10 h-10 rounded-full hover:bg-error-container/20 transition-colors flex items-center justify-center text-error-red"
            title="Đăng xuất"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
