import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Lấy địa chỉ IP nội bộ của máy chủ (có thể thay đổi tuỳ vào cấu hình)
// Android emulator dùng 10.0.2.2 thay cho localhost
const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL;
};

const axiosClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Thêm JWT Token vào header cho mỗi request nếu có
axiosClient.interceptors.request.use(
  async (config) => {
    console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Lỗi khi lấy token từ AsyncStorage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response (tuỳ chọn: có thể handle lỗi 401 tự động logout ở đây)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
