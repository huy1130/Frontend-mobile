import React from 'react';
import { Tabs } from 'expo-router';
import { Home, CalendarDays, History, User, Car, Gift } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { isLoggedIn } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0b0f17', borderTopColor: '#1f2937' },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#6b7280',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Đặt lịch',
          href: isLoggedIn ? '/booking' : null,
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'Lịch sử',
          href: isLoggedIn ? '/history' : null,
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="my-vehicles"
        options={{
          title: 'Xe của tôi',
          href: isLoggedIn ? '/my-vehicles' : null,
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Đổi thưởng',
          href: isLoggedIn ? '/rewards' : null,
          tabBarIcon: ({ color, size }) => <Gift color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="account"
        options={{
          title: isLoggedIn ? 'Tài khoản' : 'Đăng nhập',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
