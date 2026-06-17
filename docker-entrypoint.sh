#!/bin/sh

# Thay thế placeholder trong các file JS đã build bằng giá trị thực từ biến môi trường
# Nếu VITE_API_BASE_URL không được set, giữ nguyên placeholder
if [ -n "$VITE_API_BASE_URL" ]; then
  find /usr/share/nginx/html/assets -name '*.js' -exec \
    sed -i "s|__VITE_API_BASE_URL__|${VITE_API_BASE_URL}|g" {} +
  echo "Injected VITE_API_BASE_URL=${VITE_API_BASE_URL}"
fi

# Chạy Nginx
exec nginx -g 'daemon off;'
