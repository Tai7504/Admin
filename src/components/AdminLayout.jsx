import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface-canvas text-on-surface">
      <Sidebar />
      <Header />
      <main className="ml-64 mt-16 p-stack-lg min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
}
