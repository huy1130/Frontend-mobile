import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, CheckCircle2, Car, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { serviceService, ServiceDto } from '../../services/serviceService';
import { customerService, CustomerVehicleDTO } from '../../services/customerService';
import { bookingService } from '../../services/bookingService';

export default function BookingScreen() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<ServiceDto[]>([]);
  const [vehicles, setVehicles] = useState<CustomerVehicleDTO[]>([]);
  
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number>(1);
  
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    { id: 1, time: '08:00 - 09:00' },
    { id: 2, time: '09:00 - 10:00' },
    { id: 3, time: '10:00 - 11:00' },
    { id: 4, time: '11:00 - 12:00' },
    { id: 5, time: '13:00 - 14:00' },
    { id: 6, time: '14:00 - 15:00' },
    { id: 7, time: '15:00 - 16:00' },
    { id: 8, time: '16:00 - 17:00' },
  ];

  useEffect(() => {
    serviceService.getActiveServices().then(setServices).catch(console.error);
    if (isLoggedIn) {
      customerService.getMyVehicles().then(res => {
        setVehicles(res.data);
        if (res.data.length > 0) setSelectedVehicle(res.data[0].vehicleId);
      }).catch(console.error);
    }
  }, [isLoggedIn]);

  const handleBooking = async () => {
    if (!isLoggedIn) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để đặt lịch.', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => router.push('/account') }
      ]);
      return;
    }
    if (!selectedVehicle) {
      Alert.alert('Lỗi', 'Vui lòng chọn xe.');
      return;
    }
    if (!selectedService) {
      Alert.alert('Lỗi', 'Vui lòng chọn dịch vụ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingId = await bookingService.createBooking({
        vehicleId: selectedVehicle,
        serviceId: selectedService,
        slotId: selectedTimeSlot,
      });
      setBookingRef(bookingId);
      setBookedSuccess(true);
    } catch (error: any) {
      Alert.alert('Lỗi đặt lịch', error.response?.data?.Message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerLogo}>LOGO</Text>
          <Text style={styles.headerTitle}>Đăng Ký Đặt Lịch</Text>
        </View>

        <View style={styles.content}>
          {bookedSuccess ? (
            <View style={styles.successCard}>
              <View style={styles.successIconBox}>
                <CheckCircle2 color="#059669" size={36} />
              </View>

              <Text style={styles.successTitle}>Đặt Lịch Thành Công!</Text>
              <Text style={styles.successSubtitle}>
                Mã lịch hẹn của bạn là <Text style={styles.refCode}>#{bookingRef}</Text>. Bạn có thể theo dõi tiến độ trong phần Lịch Sử.
              </Text>

              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Xe của bạn:</Text>
                  <Text style={styles.detailValue}>{vehicles.find(v => v.vehicleId === selectedVehicle)?.licensePlate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Khung giờ:</Text>
                  <Text style={styles.detailValue}>{timeSlots.find(t => t.id === selectedTimeSlot)?.time} Hôm nay</Text>
                </View>
                <View style={[styles.detailRow, { borderBottomWidth: 0, paddingTop: 8 }]}>
                  <Text style={styles.detailLabel}>Dịch vụ:</Text>
                  <Text style={styles.serviceValue}>{services.find(s => s.serviceId === selectedService)?.serviceName}</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setBookedSuccess(false)} style={styles.newBookingBtn}>
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.btnText}>Đặt Thêm Lịch Mới</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Step 1: Select Vehicle */}
              <View style={styles.stepCard}>
                <Text style={styles.stepTitle}>1. Chọn Xe Của Bạn</Text>
                {!isLoggedIn ? (
                  <TouchableOpacity style={styles.loginPrompt} onPress={() => router.push('/account')}>
                    <User color="#ea580c" size={24} />
                    <Text style={styles.loginPromptText}>Đăng nhập để lấy danh sách xe của bạn</Text>
                  </TouchableOpacity>
                ) : vehicles.length === 0 ? (
                  <Text style={{ color: '#64748b' }}>Bạn chưa có xe nào. Vui lòng thêm xe ở trang Tài khoản.</Text>
                ) : (
                  vehicles.map((v) => (
                    <TouchableOpacity
                      key={v.vehicleId}
                      onPress={() => setSelectedVehicle(v.vehicleId)}
                      style={[
                        styles.branchItem,
                        selectedVehicle === v.vehicleId ? styles.itemSelected : styles.itemDefault
                      ]}
                    >
                      <Text style={styles.branchName}>{v.licensePlate} ({v.vehicleType || 'Khác'})</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Step 2: Select Service */}
              <View style={styles.stepCard}>
                <Text style={styles.stepTitle}>2. Chọn Dịch Vụ</Text>
                {services.map((svc) => (
                  <TouchableOpacity
                    key={svc.serviceId}
                    onPress={() => setSelectedService(svc.serviceId)}
                    style={[
                      styles.serviceItem,
                      selectedService === svc.serviceId ? styles.itemSelected : styles.itemDefault
                    ]}
                  >
                    <View style={styles.serviceItemLeft}>
                      <Car color={selectedService === svc.serviceId ? '#f97316' : '#64748b'} size={20} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.serviceName}>{svc.serviceName}</Text>
                        <Text style={styles.serviceDuration} numberOfLines={1}>{svc.description || 'Chăm sóc chuyên sâu'}</Text>
                      </View>
                    </View>
                    <Text style={styles.servicePrice}>{svc.price.toLocaleString('vi-VN')}đ</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Step 3: Time Slot */}
              <View style={[styles.stepCard, { marginBottom: 24 }]}>
                <Text style={styles.stepTitle}>3. Chọn Khung Giờ</Text>
                <View style={styles.timeGrid}>
                  {timeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => setSelectedTimeSlot(slot.id)}
                      style={[
                        styles.timeSlot,
                        selectedTimeSlot === slot.id ? styles.timeSelected : styles.timeDefault
                      ]}
                    >
                      <Text style={[
                        styles.timeText,
                        selectedTimeSlot === slot.id ? { color: '#fff' } : { color: '#334155' }
                      ]}>
                        {slot.time.split(' - ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity 
                onPress={handleBooking} 
                style={[styles.confirmBtn, (!selectedVehicle || !selectedService || isSubmitting) && { opacity: 0.7 }]}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.gradientConfirm}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Calendar color="white" size={20} />
                      <Text style={styles.confirmText}>Xác Nhận Đặt Lịch Ngay</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  headerBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLogo: { fontWeight: 'bold', fontSize: 16 },
  headerTitle: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
  content: { padding: 20 },
  
  successCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5,
  },
  successIconBox: {
    width: 64, height: 64,
    backgroundColor: '#ecfdf5',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 16,
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4, textAlign: 'center' },
  successSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  refCode: { color: '#ea580c', fontWeight: '800' },
  detailsBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  detailLabel: { color: '#64748b', fontSize: 12 },
  detailValue: { color: '#0f172a', fontSize: 12, fontWeight: 'bold' },
  serviceValue: { color: '#ea580c', fontSize: 14, fontWeight: '800' },
  newBookingBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  stepCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  stepTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  serviceItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemSelected: { backgroundColor: '#fff7ed', borderColor: '#f97316' },
  itemDefault: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  serviceItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  serviceName: { fontWeight: 'bold', fontSize: 14, color: '#0f172a', marginBottom: 2 },
  serviceDuration: { color: '#64748b', fontSize: 12 },
  servicePrice: { color: '#ea580c', fontWeight: '800', fontSize: 16 },

  branchItem: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  branchName: { fontWeight: 'bold', fontSize: 14, color: '#0f172a' },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  loginPromptText: {
    color: '#ea580c',
    fontWeight: 'bold',
    flex: 1
  },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  timeSelected: { backgroundColor: '#f97316', borderColor: '#f97316' },
  timeDefault: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  timeText: { fontWeight: '800', fontSize: 12 },

  confirmBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  gradientConfirm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, gap: 8 },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
