import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout';
import Leads from './pages/Leads';
import Settings from './pages/Settings';
import Courses from './pages/Courses';
import News from './pages/News';
import Teachers from './pages/Teachers';
import WhyChooseUs from './pages/WhyChooseUs';
import AboutUs from './pages/AboutUs';
import Banners from './pages/Banners';
import Vouchers from './pages/Vouchers';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Đang tải cấu hình...</div>;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="courses" element={<Courses />} />
            <Route path="vouchers" element={<Vouchers />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/why-choose-us" element={<WhyChooseUs />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/news" element={<News />} />
            <Route path="banners" element={<Banners />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;

