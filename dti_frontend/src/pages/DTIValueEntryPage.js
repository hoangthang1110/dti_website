// dti_frontend/src/pages/DTIValueEntryPage.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDTIIndices, createDTIValue } from '../api/dtiApi';

const DTIValueEntryPage = () => {
    const queryClient = useQueryClient();
    const { data: indices, isLoading: indicesLoading, error: indicesError } = useQuery({
        queryKey: ['dtiIndices'],
        queryFn: getDTIIndices,
        refetchOnWindowFocus: false, // Tùy chọn: ngăn refetch khi tab được focus
    });

    const [formState, setFormState] = useState({
        index: '', // ID của chỉ số
        value: '',
        period_date: new Date().toISOString().split('T')[0], // Ngày hiện tại
    });
    const [message, setMessage] = useState('');

    const createValueMutation = useMutation({
        mutationFn: createDTIValue,
        onSuccess: () => {
            resetForm();
            setMessage('Nhập liệu thành công!');
            // Sau khi nhập liệu thành công, chúng ta có thể invalidate queries liên quan đến dashboard
            // để dashboard tự động cập nhật dữ liệu mới nếu người dùng quay lại đó.
            queryClient.invalidateQueries(['dtiValues']);
        },
        onError: (err) => {
            const errorMsg = err.response?.data?.detail || err.message;
            setMessage('Lỗi khi nhập liệu: ' + errorMsg);
            if (err.response?.data?.unique_together) {
                setMessage('Lỗi: Giá trị cho chỉ số này vào ngày này đã tồn tại. Vui lòng cập nhật thay vì thêm mới.');
            }
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');

        if (!formState.index) {
            setMessage('Vui lòng chọn một chỉ số.');
            return;
        }

        const dataToSubmit = {
            index: parseInt(formState.index),
            value: parseFloat(formState.value),
            period_date: formState.period_date,
        };

        createValueMutation.mutate(dataToSubmit);
    };

    const resetForm = () => {
        setFormState({
            index: '',
            value: '',
            period_date: new Date().toISOString().split('T')[0],
        });
    };

    // Hiển thị trạng thái tải hoặc lỗi trước khi render giao diện chính
    if (indicesLoading) return <div>Đang tải danh sách chỉ số...</div>;
    if (indicesError) return <div>Lỗi khi tải chỉ số: {indicesError.message}</div>;

    // Chuyển đổi indices thành một mảng rỗng nếu nó không phải là mảng hoặc null/undefined
    const safeIndices = indices && Array.isArray(indices) ? indices : [];

    return (
        <div>
            <h2>Nhập liệu Chỉ số DTI</h2>
            {message && <p style={{ color: message.startsWith('Lỗi') ? 'red' : 'green' }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h3>Thêm Giá trị Chỉ số</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                    <div>
                        <label>Chọn Chỉ số:</label>
                        <select name="index" value={formState.index} onChange={handleChange} required>
                            <option value="">-- Chọn chỉ số --</option>
                            {/* Dòng lỗi của bạn có thể xuất hiện ở đây.
                                Sử dụng safeIndices thay vì indices trực tiếp. */}
                            {safeIndices.map((idx) => (
                                <option key={idx.id} value={idx.id}>{idx.name} ({idx.unit})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Giá trị:</label>
                        <input type="number" name="value" value={formState.value} onChange={handleChange} required step="0.01" />
                    </div>
                    <div>
                        <label>Ngày kỳ báo cáo:</label>
                        <input type="date" name="period_date" value={formState.period_date} onChange={handleChange} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit">Lưu giá trị</button>
                    <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>Đặt lại</button>
                </div>
            </form>

            {/* TODO: Có thể thêm phần hiển thị lịch sử nhập liệu gần đây tại đây */}
        </div>
    );
};

export default DTIValueEntryPage;