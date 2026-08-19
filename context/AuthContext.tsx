import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loyaltyService } from '../services/loyaltyService';

interface UserProfile {
  name: string;
  phone: string;
  role: string;
  tier: string;
  points: number;
  avatarUrl?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (phone: string, token: string, fullName: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshLoyalty: (points?: number, tier?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshLoyalty: async (points?: number, tier?: string) => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo app: Kiểm tra token có sẵn không
  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const phone = await AsyncStorage.getItem('userPhone');
      const role = await AsyncStorage.getItem('userRole');
      const fullName = await AsyncStorage.getItem('userFullName');
      const tier = await AsyncStorage.getItem('userTier') || 'Thành viên Mới';
      const points = await AsyncStorage.getItem('userPoints') || '0';

      if (token && role) {
        setUser({
          phone: phone || '',
          name: fullName || 'Người dùng',
          role: role,
          tier: tier,
          points: parseInt(points),
        });
        setIsLoggedIn(true);
        // Sau khi phục hồi state, lấy lại loyalty mới nhất từ server
        if (role.toLowerCase() === 'customer') {
           fetchLoyaltyInfo();
        }
      }
    } catch (e) {
      console.error('Lỗi khi khôi phục session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoyaltyInfo = async () => {
    try {
      const res = await loyaltyService.getMySummary();
      if (res) {
        setUser(prev => prev ? {
          ...prev,
          tier: res.currentTier,
          points: res.currentPoints,
        } : null);
        
        await AsyncStorage.setItem('userTier', res.currentTier);
        await AsyncStorage.setItem('userPoints', res.currentPoints.toString());
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin loyalty:', error);
    }
  };

  const login = useCallback(async (phone: string, token: string, fullName: string, role: string) => {
    // Lưu thông tin vào AsyncStorage
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userPhone', phone);
    await AsyncStorage.setItem('userRole', role);
    await AsyncStorage.setItem('userFullName', fullName);
    
    // Cập nhật state (Tạm thời tier và points là rỗng)
    setUser({
      phone,
      name: fullName,
      role,
      tier: 'Đang tải...',
      points: 0,
    });
    setIsLoggedIn(true);

    // Lấy thông tin loyalty thực tế nếu là customer
    if (role.toLowerCase() === 'customer') {
      await fetchLoyaltyInfo();
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoggedIn(false);
      setUser(null);
      await Promise.all([
        AsyncStorage.removeItem('userToken'),
        AsyncStorage.removeItem('userPhone'),
        AsyncStorage.removeItem('userRole'),
        AsyncStorage.removeItem('userFullName'),
        AsyncStorage.removeItem('userTier'),
        AsyncStorage.removeItem('userPoints')
      ]);
    } catch (e) {
      console.error('Lỗi khi xoá dữ liệu:', e);
    }
  }, []);

  const refreshLoyalty = useCallback(async (points?: number, tier?: string) => {
    if (isLoggedIn && user?.role.toLowerCase() === 'customer') {
      if (points !== undefined && tier !== undefined) {
        setUser(prev => prev ? { ...prev, points, tier } : null);
        await AsyncStorage.setItem('userTier', tier);
        await AsyncStorage.setItem('userPoints', points.toString());
      } else {
        await fetchLoyaltyInfo();
      }
    }
  }, [isLoggedIn, user?.role]);

  const contextValue = useMemo(() => ({
    isLoggedIn,
    user,
    isLoading,
    login,
    logout,
    refreshLoyalty,
  }), [isLoggedIn, user, isLoading, login, logout, refreshLoyalty]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
