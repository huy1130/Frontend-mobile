import React, { createContext, useContext, useState } from 'react';

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
  login: (role?: string) => void;
  logout: () => void;
}

const defaultUserMap: Record<string, UserProfile> = {
  admin: {
    name: 'Admin User',
    phone: '0901234567',
    role: 'admin',
    tier: 'Quản Trị Viên',
    points: 9999,
  },
  manager: {
    name: 'Trần Quản Lý',
    phone: '0912345678',
    role: 'manager',
    tier: 'Quản Lý Chi Nhánh',
    points: 5000,
  },
  staff: {
    name: 'Lê Nhân Viên',
    phone: '0923456789',
    role: 'staff',
    tier: 'Nhân Viên Kỹ Thuật',
    points: 1500,
  },
  customer: {
    name: 'Nguyễn Văn Khách',
    phone: '0987654321',
    role: 'customer',
    tier: 'Thành viên Vàng (Gold)',
    points: 1250,
  },
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = (role: string = 'customer') => {
    const matchedUser = defaultUserMap[role] || defaultUserMap.customer;
    setUser(matchedUser);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
