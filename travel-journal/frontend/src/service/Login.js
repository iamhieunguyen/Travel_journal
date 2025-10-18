
import api from "./api"; // import file api.js mà bạn đã tạo

const loginService = {
  /**
   * Gọi API đăng nhập người dùng
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} Thông tin user + token
   */
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data; // { user: {...}, token: "..." }
    } catch (error) {
      console.error("Login API error:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default loginService;
