import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Tạm thời ẩn cảnh báo findDOMNode của ReactQuill để tránh làm phiền Console
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('findDOMNode is deprecated')) {
    return;
  }
  originalError.call(console, ...args);
};

createRoot(document.getElementById('root')).render(
  <App />
)
