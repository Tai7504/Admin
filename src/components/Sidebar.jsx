import { NavLink } from 'react-router-dom';

const menuItems = [
  { group: 'Menu', items: [
    { name: 'Bảng điều khiển', icon: 'dashboard', path: '/' },
    { name: 'Khách hàng', icon: 'group', path: '/leads' },
    { name: 'Khóa học', icon: 'school', path: '/courses' },
    { name: 'Tin tức', icon: 'newspaper', path: '/news' },
    { name: 'Giảng viên', icon: 'person_celebrate', path: '/teachers' },
  ]},
  { group: 'Trang', items: [
    { name: 'Quản lý Banner', icon: 'image', path: '/banners' },
    { name: 'Giới thiệu', icon: 'info', path: '/about-us' },
    { name: 'Vì sao chọn C.Tôi', icon: 'verified', path: '/why-choose-us' },
    { name: 'Cấu hình', icon: 'settings', path: '/settings' },
  ]}
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-sidebar-bg flex flex-col py-6 border-r border-outline-variant shadow-none">
      <div className="px-6 mb-8">
        <h1 className="text-headline-md font-headline-md font-bold text-white">Tiến Bùi <span className="text-white/60 font-normal">Admin</span></h1>
      </div>

      <nav className="flex-1 overflow-y-auto sidebar-scroll">
        {menuItems.map((group, gIndex) => (
          <div key={group.group}>
            <div className={`px-4 mb-2 ${gIndex > 0 ? 'mt-6' : ''}`}>
              <p className="text-white/40 font-label-md text-label-md uppercase tracking-wider px-2 py-1">{group.group}</p>
            </div>
            
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold rounded-xl mx-2 my-1 flex items-center px-4 py-3 transition-colors font-label-md text-label-md scale-95 duration-100 ease-in-out"
                    : "text-white/70 hover:text-white hover:bg-white/10 flex items-center px-4 py-3 mx-2 my-1 transition-colors rounded-xl font-label-md text-label-md"
                }
              >
                {({ isActive }) => (
                  <>
                    <span 
                      className={`material-symbols-outlined mr-3 ${isActive ? 'fill-icon' : ''}`} 
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto px-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <p className="text-white text-body-md font-bold leading-tight">Tiến Bùi</p>
            <p className="text-white/50 text-label-md">Admin</p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-white/40 text-caption gap-2">
          <span className="material-symbols-outlined text-[14px]">copyright</span>
          <span>Bản quyền 2026 Tiến Bùi</span>
        </div>
      </div>
    </aside>
  );
}
