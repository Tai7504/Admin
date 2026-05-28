export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">👋</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng bạn!</h1>
        <p className="text-gray-500">
          Hệ thống quản trị nội dung (CMS).<br/>
          Vui lòng chọn các chức năng ở menu bên trái để bắt đầu quản lý.
        </p>
      </div>
    </div>
  );
}
