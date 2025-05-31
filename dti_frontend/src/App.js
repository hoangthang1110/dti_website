// dti_frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DTIIndexManagementPage from './pages/DTIIndexManagementPage';
import DTIValueEntryPage from './pages/DTIValueEntryPage';
import UserManagementPage from './pages/UserManagementPage';
import Layout from './components/Layout'; // Chúng ta sẽ tạo component này sau
import './App.css'; // Tùy chỉnh CSS sau này

const queryClient = new QueryClient(); // Khởi tạo QueryClient

// Component Guard để bảo vệ Route
const PrivateRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Đang tải...</div>; // Hoặc một spinner loading
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user?.role)) {
        return <div>Bạn không có quyền truy cập trang này.</div>; // Hoặc Navigate về trang lỗi
    }

    return children;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </Router>
        </QueryClientProvider>
    );
}

// Tách Routes ra một component riêng để có thể dùng useAuth bên trong
function AppRoutes() {
    const { isAuthenticated } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Các Route được bảo vệ */}
            <Route element={<Layout />}> {/* Layout sẽ chứa Header, Sidebar và nội dung chính */}
                <Route
                    path="/dashboard"
                    element={<PrivateRoute roles={['ADMIN', 'DATA_ENTRY', 'VIEWER']}><DashboardPage /></PrivateRoute>}
                />
                <Route
                    path="/indices"
                    element={<PrivateRoute roles={['ADMIN']}><DTIIndexManagementPage /></PrivateRoute>}
                />
                <Route
                    path="/data-entry"
                    element={<PrivateRoute roles={['ADMIN', 'DATA_ENTRY']}><DTIValueEntryPage /></PrivateRoute>}
                />
                <Route
                    path="/users"
                    element={<PrivateRoute roles={['ADMIN']}><UserManagementPage /></PrivateRoute>}
                />
            </Route>
            {/* Thêm Route cho trang 404 Not Found nếu muốn */}
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}

export default App;