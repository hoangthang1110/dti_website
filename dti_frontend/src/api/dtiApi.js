// dti_frontend/src/api/dtiApi.js
import axios from '../axiosConfig'; // Đảm bảo bạn đã import axiosConfig đúng cách


export const loginUser = async (username, password) => {
    const response = await axios.post('/api-token-auth/', { username, password }); // <-- Dòng này là nơi định nghĩa endpoint
    // Hoặc có thể là: const response = await axios.post('/api/token/', { username, password });
    return response.data;
};
// Hàm lấy tất cả chỉ số DTI
export const getDTIIndices = async () => {
    const response = await axios.get('/api/dti-indices/');
    // Thay đổi duy nhất ở đây: Trả về response.data.results thay vì response.data
    return response.data.results;
};
// Hàm tạo chỉ số DTI mới
export const createDTIIndex = async (indexData) => {
    const response = await axios.post('/api/dti-indices/', indexData);
    return response.data;
};

// Hàm cập nhật chỉ số DTI
export const updateDTIIndex = async (id, indexData) => {
    const response = await axios.put(`/api/dti-indices/${id}/`, indexData);
    return response.data;
};

// Hàm xóa chỉ số DTI
export const deleteDTIIndex = async (id) => {
    await axios.delete(`/api/dti-indices/${id}/`);
};

// Hàm lấy giá trị DTI theo chỉ số và khoảng thời gian
export const getDTIValuesByIndex = async (indexId, startDate, endDate) => {
    const params = { index_id: indexId };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await axios.get('/api/dti-values/by_index/', { params });
    return response.data;
};

// Hàm tạo giá trị DTI mới
export const createDTIValue = async (valueData) => {
    const response = await axios.post('/api/dti-values/', valueData);
    return response.data;
};

// Hàm lấy tất cả người dùng (chỉ Admin)
export const getUsers = async () => {
    const response = await axios.get('/api/users/');
    return response.data;
};

// Hàm tạo người dùng mới (chỉ Admin)
export const createUser = async (userData) => {
    const response = await axios.post('/api/users/', userData);
    return response.data;
};

// Hàm cập nhật người dùng (chỉ Admin)
export const updateUser = async (id, userData) => {
    const response = await axios.put(`/api/users/${id}/`, userData);
    return response.data;
};

// Hàm xóa người dùng (chỉ Admin)
export const deleteUser = async (id) => {
    await axios.delete(`/api/users/${id}/`);
};