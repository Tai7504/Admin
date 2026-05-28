import { createContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        if (res.data.data.refreshToken) {
          localStorage.setItem('refreshToken', res.data.data.refreshToken);
        }
        setUser(res.data.data.user);
        toast.success("Đăng nhập thành công!");
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi đăng nhập!");
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(err) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    toast.info("Đã đăng xuất");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
