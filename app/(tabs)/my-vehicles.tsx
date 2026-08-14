import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Car, ChevronLeft, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { customerService, CustomerVehicleDTO } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';

export default function MyVehiclesScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [vehicles, setVehicles] = useState<CustomerVehicleDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      loadVehicles();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await customerService.getMyVehicles();
      setVehicles(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    Alert.alert('Thông báo', 'Chức năng thêm xe mới đang được phát triển.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.push('/account')} style={styles.backBtn}>
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản Lý Xe</Text>
        <TouchableOpacity onPress={handleAddVehicle} style={styles.addBtn}>
          <Plus color="#f97316" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
        ) : !isLoggedIn ? (
          <View style={styles.emptyState}>
            <Car color="#cbd5e1" size={48} />
            <Text style={styles.emptyText}>Vui lòng đăng nhập để xem danh sách xe.</Text>
          </View>
        ) : vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Car color="#cbd5e1" size={48} />
            <Text style={styles.emptyText}>Bạn chưa có xe nào trong hệ thống.</Text>
            <TouchableOpacity style={styles.btnAddFirst} onPress={handleAddVehicle}>
              <Text style={styles.btnAddFirstText}>Thêm xe ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((v) => (
            <View key={v.vehicleId} style={styles.vehicleCard}>
              <View style={styles.vehicleIconBox}>
                <Car color="#f97316" size={24} />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.licensePlate}>Biển số: {v.licensePlate}</Text>
                <Text style={styles.vehicleType}>Loại xe: {v.vehicleType || 'Chưa cập nhật'}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  addBtn: { padding: 4 },
  headerTitle: { fontWeight: '800', fontSize: 18, color: '#0f172a' },
  scrollContent: { padding: 16, flexGrow: 1 },

  vehicleCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  vehicleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vehicleInfo: { flex: 1 },
  licensePlate: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  vehicleType: { fontSize: 13, color: '#64748b' },

  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 16, lineHeight: 22 },
  btnAddFirst: {
    marginTop: 24,
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnAddFirstText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
