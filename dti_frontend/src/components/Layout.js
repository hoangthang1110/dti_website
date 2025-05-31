// dti_frontend/src/components/Layout.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Layout.css'; // Tùy chỉnh CSS cho layout

const Layout = () => {
    const { user, logout, isAdmin, isDataEntryOrAdmin, isViewerOrHigher } = useAuth();

    return (
        <div className="layout-container">
            <header className="app-header">
                <div className="header-left">
                    <h1>DTI Management</h1>
                </div>
                <div className="header-right">
                    <span>Xin chào, {user?.full_name || user?.username}! ({user?.role})</span>
                    <button onClick={logout} className="logout-btn">Đăng xuất</button>
                </div>
            </header>
            <div className="main-content">
                <nav className="sidebar">
                    <ul>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        {isAdmin && (
                            <>
                                <li><Link to="/indices">Quản lý Chỉ số</Link></li>
                                <li><Link to="/users">Quản lý Người dùng</Link></li>
                            </>
                        )}
                        {isDataEntryOrAdmin && (
                            <li><Link to="/data-entry">Nhập liệu DTI</Link></li>
                        )}
                    </ul>
                </nav>
                <main className="content-area">
                    <Outlet /> {/* Nơi các component Route con được render */}
                </main>
            </div>
        </div>
    );
};

export default Layout;