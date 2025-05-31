// dti_frontend/src/pages/DTIIndexManagementPage.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDTIIndices, createDTIIndex, updateDTIIndex, deleteDTIIndex } from '../api/dtiApi';

const DTIIndexManagementPage = () => {
    const queryClient = useQueryClient();
    const { data: indices, isLoading, error } = useQuery({
        queryKey: ['dtiIndices'],
        queryFn: getDTIIndices,
        refetchOnWindowFocus: false, // Tùy chọn: ngăn refetch khi tab được focus
    });

    const [formState, setFormState] = useState({
        id: null,
        name: '',
        code: '',
        description: '',
        unit: '',
        data_type: 'DECIMAL', // Mặc định
        target_value: '',
        is_active: true,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    const createMutation = useMutation({
        mutationFn: createDTIIndex,
        onSuccess: () => {
            queryClient.invalidateQueries(['dtiIndices']);
            resetForm();
            setMessage('Tạo chỉ số thành công!');
        },
        onError: (err) => {
            setMessage('Lỗi khi tạo chỉ số: ' + (err.response?.data?.detail || err.message));
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateDTIIndex(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['dtiIndices']);
            resetForm();
            setMessage('Cập nhật chỉ số thành công!');
        },
        onError: (err) => {
            setMessage('Lỗi khi cập nhật chỉ số: ' + (err.response?.data?.detail || err.message));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDTIIndex,
        onSuccess: () => {
            queryClient.invalidateQueries(['dtiIndices']);
            setMessage('Xóa chỉ số thành công!');
        },
        onError: (err) => {
            setMessage('Lỗi khi xóa chỉ số: ' + (err.response?.data?.detail || err.message));
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
        const dataToSubmit = {
            ...formState,
            target_value: formState.target_value === '' ? null : parseFloat(formState.target_value),
        };

        if (isEditing) {
            updateMutation.mutate({ id: formState.id, data: dataToSubmit });
        } else {
            createMutation.mutate(dataToSubmit);
        }
    };

    const handleEdit = (index) => {
        setFormState({
            id: index.id,
            name: index.name,
            code: index.code,
            description: index.description || '',
            unit: index.unit,
            data_type: index.data_type,
            target_value: index.target_value !== null ? String(index.target_value) : '',
            is_active: index.is_active,
        });
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chỉ số này?')) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setFormState({
            id: null,
            name: '',
            code: '',
            description: '',
            unit: '',
            data_type: 'DECIMAL',
            target_value: '',
            is_active: true,
        });
        setIsEditing(false);
    };

    // Hiển thị trạng thái tải hoặc lỗi trước khi render giao diện chính
    if (isLoading) return <div>Đang tải chỉ số...</div>;
    if (error) return <div>Lỗi: {error.message}</div>;

    // Chuyển đổi indices thành một mảng rỗng nếu nó không phải là mảng hoặc null/undefined
    // Điều này đảm bảo rằng .map() luôn có thể được gọi mà không gây lỗi.
    const safeIndices = indices && Array.isArray(indices) ? indices : [];


    return (
        <div>
            <h2>Quản lý Chỉ số Chuyển đổi số (DTI)</h2>
            {message && <p style={{ color: message.startsWith('Lỗi') ? 'red' : 'green' }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h3>{isEditing ? 'Cập nhật Chỉ số' : 'Thêm Chỉ số Mới'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label>Tên chỉ số:</label>
                        <input type="text" name="name" value={formState.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Mã chỉ số:</label>
                        <input type="text" name="code" value={formState.code} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Đơn vị tính:</label>
                        <input type="text" name="unit" value={formState.unit} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Loại dữ liệu:</label>
                        <select name="data_type" value={formState.data_type} onChange={handleChange}>
                            <option value="INTEGER">Số nguyên</option>
                            <option value="DECIMAL">Số thập phân</option>
                            <option value="PERCENT">Phần trăm</option>
                        </select>
                    </div>
                    <div>
                        <label>Ngưỡng mục tiêu:</label>
                        <input type="number" name="target_value" value={formState.target_value} onChange={handleChange} step="0.01" />
                    </div>
                    <div>
                        <label>Mô tả:</label>
                        <textarea name="description" value={formState.description} onChange={handleChange}></textarea>
                    </div>
                    <div style={{gridColumn: 'span 2'}}>
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

            <h3>Danh sách Chỉ số</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tên chỉ số</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Mã</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Đơn vị</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Loại dữ liệu</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Mục tiêu</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Hoạt động</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Dòng lỗi của bạn có thể xuất hiện ở đây.
                        Sử dụng safeIndices thay vì indices trực tiếp. */}
                    {safeIndices.map((index) => (
                        <tr key={index.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index.code}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index.unit}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index.data_type}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index.target_value || 'N/A'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index.is_active ? 'Có' : 'Không'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button onClick={() => handleEdit(index)} style={{ marginRight: '10px' }}>Sửa</button>
                                <button onClick={() => handleDelete(index.id)} style={{ backgroundColor: '#dc3545', color: 'white' }}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DTIIndexManagementPage;