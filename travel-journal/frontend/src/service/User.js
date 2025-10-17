import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Một class hoặc object để nhóm tất cả các hàm gọi API liên quan đến User.
 */
const userService = {
  /**
   * Lấy danh sách tất cả người dùng
   * Tương ứng với: GET /users
   * @returns {Promise<Array>} Danh sách người dùng
   */
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng bằng ID
   * Tương ứng với: GET /users/<user_id>
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Object>} Thông tin chi tiết của người dùng
   */
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Tạo một người dùng mới
   * Tương ứng với: POST /users
   * @param {Object} userData - Dữ liệu người dùng mới { username, email }
   * @returns {Promise<Object>} Người dùng vừa được tạo
   */
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   * Tương ứng với: PUT /users/<user_id>
   * @param {string} userId - ID của người dùng cần cập nhật
   * @param {Object} updateData - Dữ liệu cần cập nhật { username, email, profile_picture }
   * @returns {Promise<Object>} Thông tin người dùng sau khi cập nhật
   */
  updateUser: async (userId, updateData) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Xóa một người dùng
   * Tương ứng với: DELETE /users/<user_id>
   * @param {string} userId - ID của người dùng cần xóa
   * @returns {Promise<Object>} Thông báo thành công
   */
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin của người dùng đang đăng nhập
   * Tương ứng với: GET /users/me
   * @param {string} token - JWT token hoặc user_id (như trong ví dụ của bạn)
   * @returns {Promise<Object>} Thông tin profile của người dùng
   */
  getMyProfile: async (token) => {
    try {
      const response = await apiClient.get('/users/me', {
        headers: {
          // Gửi token qua Authorization header
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current user profile:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default userService;