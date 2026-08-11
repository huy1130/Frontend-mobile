import axiosClient from './axiosClient';

interface LoginResponse {
  token: string;
  fullName: string;
  role: string;
}

export const authService = {
  login: async (phone: string, password?: string): Promise<LoginResponse> => {
    // Gọi API Đăng nhập
    const response = await axiosClient.post<any, LoginResponse>('/auth/login', {
      PhoneNumber: phone, // Sửa lại đúng tên biến DTO của Backend
      Password: password || '123456',
    });
    return response;
  },

  register: async (phone: string, fullName: string, password?: string) => {
    // Gọi API Đăng ký khách hàng
    const response = await axiosClient.post('/auth/register', {
      PhoneNumber: phone, // Sửa lại đúng tên biến DTO
      FullName: fullName,
      Password: password || '123456',
    });
    return response;
  },
};
