// dti_frontend/src/axiosConfig.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // URL gốc của Django backend của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để đính kèm Authorization Token vào mỗi yêu cầu
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        if (token) {
            config.headers.Authorization = `Token ${token}`; // Đính kèm token vào header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor để xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Nếu lỗi là 401 (Unauthorized), chuyển hướng người dùng về trang đăng nhập
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized request. Redirecting to login...');
            localStorage.removeItem('token'); // Xóa token cũ
            // Sử dụng window.location.href để đảm bảo tải lại trang và xóa state cũ
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;