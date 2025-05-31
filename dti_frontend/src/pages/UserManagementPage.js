// dti_frontend/src/pages/UserManagementPage.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../api/dtiApi';

const UserManagementPage = () => {
    const queryClient = useQueryClient();
    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        refetchOnWindowFocus: false, // Tùy chọn: ngăn refetch khi tab được focus
    });

    const [formState, setFormState] = useState({
        id: null,
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'VIEWER', // Mặc định
        is_active: true,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            resetForm();
            setMessage('Tạo người dùng thành công!');
        },
        onError: (err) => {
            setMessage('Lỗi khi tạo người dùng: ' + (err.response?.data?.username || err.message));
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            resetForm();
            setMessage('Cập nhật người dùng thành công!');
        },
        onError: (err) => {
            setMessage('Lỗi khi cập nhật người dùng: ' + (err.response?.data?.detail || err.message));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setMessage('Xóa người dùng thành công!');
        },
        onError: (err) => {
            setMessage('Lỗi khi xóa người dùng: ' + (err.response?.data?.detail || err.message));
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState({
            ...formState,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        const dataToSubmit = { ...formState };
        if (isEditing && !dataToSubmit.password) {
            delete dataToSubmit.password; // Không gửi mật khẩu nếu không thay đổi khi chỉnh sửa
        }

        if (isEditing) {
            updateMutation.mutate({ id: formState.id, data: dataToSubmit });
        } else {
            createMutation.mutate(dataToSubmit);
        }
    };

    const handleEdit = (user) => {
        setFormState({
            id: user.id,
            username: user.username,
            email: user.email,
            password: '', // Không hiển thị mật khẩu cũ, yêu cầu nhập lại nếu muốn đổi
            full_name: user.full_name || '',
            role: user.role,
            is_active: user.is_active,
        });
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setFormState({
            id: null,
            username: '',
            email: '',
            password: '',
            full_name: '',
            role: 'VIEWER',
            is_active: true,
        });
        setIsEditing(false);
    };

    // Hiển thị trạng thái tải hoặc lỗi trước khi render giao diện chính
    if (isLoading) return <div>Đang tải người dùng...</div>;
    if (error) return <div>Lỗi: {error.message}</div>;

    // Chuyển đổi users thành một mảng rỗng nếu nó không phải là mảng hoặc null/undefined
    // Điều này đảm bảo rằng .map() luôn có thể được gọi mà không gây lỗi.
    const safeUsers = users && Array.isArray(users) ? users : [];

    return (
        <div>
            <h2>Quản lý Người dùng</h2>
            {message && <p style={{ color: message.startsWith('Lỗi') ? 'red' : 'green' }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h3>{isEditing ? 'Cập nhật Người dùng' : 'Thêm Người dùng Mới'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label>Tên đăng nhập:</label>
                        <input type="text" name="username" value={formState.username} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input type="email" name="email" value={formState.email} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Mật khẩu {isEditing && "(để trống nếu không đổi)"}:</label>
                        <input type="password" name="password" value={formState.password} onChange={handleChange} autoComplete="new-password" />
                    </div>
                    <div>
                        <label>Tên đầy đủ:</label>
                        <input type="text" name="full_name" value={formState.full_name} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Vai trò:</label>
                        <select name="role" value={formState.role} onChange={handleChange}>
                            <option value="ADMIN">Admin</option>
                            <option value="DATA_ENTRY">Data Entry</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label>
                            <input type="checkbox" name="is_active" checked={formState.is_active} onChange={handleChange} />
                            Hoạt động
                        </label>
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit">{isEditing ? 'Cập nhật' : 'Thêm'}</button>
                    {isEditing && <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>Hủy</button>}
                </div>
            </form>

            <h3>Danh sách Người dùng</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tên đăng nhập</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tên đầy đủ</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Vai trò</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Hoạt động</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Dòng lỗi của bạn có thể xuất hiện ở đây.
                        Sử dụng safeUsers thay vì users trực tiếp. */}
                    {safeUsers.map((user) => (
                        <tr key={user.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.full_name || 'N/A'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.is_active ? 'Có' : 'Không'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button onClick={() => handleEdit(user)} style={{ marginRight: '10px' }}>Sửa</button>
                                <button onClick={() => handleDelete(user.id)} style={{ backgroundColor: '#dc3545', color: 'white' }}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementPage;