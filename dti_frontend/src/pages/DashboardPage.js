// dti_frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDTIIndices, getDTIValuesByIndex } from '../api/dtiApi';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Đăng ký các thành phần Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const DashboardPage = () => {
    // Lấy danh sách các chỉ số DTI
    const { data: indices, isLoading: indicesLoading, error: indicesError } = useQuery({
        queryKey: ['dtiIndices'],
        queryFn: getDTIIndices,
        // Optional: thêm refetchOnWindowFocus: false nếu bạn không muốn nó tự động refetch khi tab được focus
        refetchOnWindowFocus: false,
    });

    // State để quản lý chỉ số được chọn, ngày bắt đầu và ngày kết thúc cho bộ lọc
    const [selectedMetricId, setSelectedMetricId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Sử dụng useEffect để đặt chỉ số mặc định khi danh sách chỉ số được tải lần đầu
    useEffect(() => {
        // Đảm bảo indices tồn tại và là một mảng trước khi truy cập
        if (indices && Array.isArray(indices) && indices.length > 0 && !selectedMetricId) {
            setSelectedMetricId(String(indices[0].id)); // Chọn chỉ số đầu tiên làm mặc định
        }
    }, [indices, selectedMetricId]); // Dependency array bao gồm indices để chạy lại khi indices thay đổi

    // Lấy dữ liệu giá trị cho chỉ số đã chọn và khoảng thời gian
    const { data: metricData, isLoading: metricDataLoading, error: metricDataError } = useQuery({
        queryKey: ['dtiValues', selectedMetricId, startDate, endDate],
        queryFn: () => getDTIValuesByIndex(selectedMetricId, startDate, endDate),
        // Chỉ kích hoạt query khi selectedMetricId có giá trị
        enabled: !!selectedMetricId,
        refetchOnWindowFocus: false,
    });

    // Chuẩn bị dữ liệu cho biểu đồ Line chart
    // Đảm bảo metricData là một mảng trước khi map, và sắp xếp theo ngày
    const sortedMetricData = metricData && Array.isArray(metricData)
        ? [...metricData].sort((a, b) => new Date(a.period_date) - new Date(b.period_date))
        : [];

    const chartData = {
        labels: sortedMetricData.map(item => item.period_date) || [], // Lấy ngày kỳ báo cáo làm nhãn X
        datasets: [
            {
                label: selectedMetricId ? indices?.find(idx => String(idx.id) === selectedMetricId)?.name : 'Giá trị',
                data: sortedMetricData.map(item => item.value) || [], // Lấy giá trị làm dữ liệu Y
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false, // Không tô màu dưới đường
                tension: 0.1, // Độ cong của đường
            },
        ],
    };

    // Tùy chọn cấu hình cho biểu đồ
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top', // Vị trí chú giải
            },
            title: {
                display: true,
                text: 'Xu hướng chỉ số DTI theo thời gian', // Tiêu đề biểu đồ
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Kỳ báo cáo', // Nhãn trục X
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Giá trị', // Nhãn trục Y
                },
            },
        },
    };

    // Hiển thị trạng thái tải dữ liệu
    if (indicesLoading) return <div>Đang tải Dashboard...</div>;
    // Hiển thị lỗi nếu có
    if (indicesError) return <div>Lỗi khi tải danh sách chỉ số: {indicesError.message}</div>;

    return (
        <div>
            <h2>Dashboard Chuyển đổi số</h2>

            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                <h3>Bộ lọc Dashboard</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div>
                        <label>Chọn chỉ số:</label>
                        <select
                            value={selectedMetricId}
                            onChange={(e) => setSelectedMetricId(e.target.value)}
                            style={{ padding: '8px', width: '200px' }}
                        >
                            {/* Thêm tùy chọn mặc định rỗng */}
                            <option value="">-- Chọn chỉ số --</option>
                            {/* Kiểm tra indices là mảng trước khi map để tránh lỗi */}
                            {indices && Array.isArray(indices) && indices.map(idx => (
                                <option key={idx.id} value={idx.id}>{idx.name} ({idx.unit})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Từ ngày:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ padding: '8px' }}
                        />
                    </div>
                    <div>
                        <label>Đến ngày:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ padding: '8px' }}
                        />
                    </div>
                    {/* Nút "Xem" không cần thiết vì useQuery tự động refetch khi selectedMetricId, startDate, endDate thay đổi */}
                    {/* <button onClick={() => { /* Dữ liệu tự động refetch khi state thay đổi * / }} style={{ padding: '8px 15px' }}>Xem</button> */}
                </div>
            </div>

            {/* Hiển thị trạng thái tải dữ liệu biểu đồ */}
            {metricDataLoading && <div>Đang tải dữ liệu biểu đồ...</div>}
            {/* Hiển thị lỗi nếu có */}
            {metricDataError && <div>Lỗi tải dữ liệu biểu đồ: {metricDataError.message}</div>}
            {/* Kiểm tra nếu có dữ liệu để vẽ biểu đồ */}
            {sortedMetricData && sortedMetricData.length > 0 ? (
                <div style={{ width: '80%', margin: '0 auto', marginTop: '30px' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            ) : (
                <p>Không có dữ liệu để hiển thị biểu đồ cho chỉ số và khoảng thời gian đã chọn.</p>
            )}

            {/* TODO: Có thể thêm các KPI box, bảng tổng hợp dưới biểu đồ */}
        </div>
    );
};

export default DashboardPage;