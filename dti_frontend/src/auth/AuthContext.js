// dti_frontend/src/auth/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Custom Hook để sử dụng Auth Context
export const useAuth = () => {
    return useContext(AuthContext);
};

// 3. Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Lưu thông tin người dùng (username, role, token)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra token trong localStorage khi ứng dụng tải
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser({ ...parsedUser, token });
                // Cấu hình axios để luôn gửi token
                axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            } catch (e) {
                console.error("Failed to parse user data from localStorage", e);
                logout(); // Xóa dữ liệu lỗi
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post(process.env.REACT_APP_API_LOGIN, { username, password });
            const { token, user_id, username: newUsername, email, role, full_name } = response.data;

            const userData = { id: user_id, username: newUsername, email, role, full_name };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser({ ...userData, token });
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            return true; // Đăng nhập thành công
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            throw error; // Ném lỗi để component xử lý
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user && user.role === 'ADMIN',
        isDataEntryOrAdmin: user && (user.role === 'ADMIN' || user.role === 'DATA_ENTRY'),
        isViewerOrHigher: user && (user.role === 'ADMIN' || user.role === 'DATA_ENTRY' || user.role === 'VIEWER')
    };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};