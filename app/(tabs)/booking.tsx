import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, CheckCircle2, Car } from 'lucide-react-native';

export default function BookingScreen() {
  const [selectedService, setSelectedService] = useState('s1');
  const [selectedBranch, setSelectedBranch] = useState('b1');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00');
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const services = [
    { id: 's1', name: 'Rửa Xe Bọt Tuyết & Hút Bụi', price: '150.000đ', duration: '35 phút' },
    { id: 's2', name: 'Combo Vệ Sinh Nội Thất Chuyên Sâu', price: '450.000đ', duration: '75 phút' },
    { id: 's3', name: 'Phủ Ceramic Sơn & Tẩy Ố Kính', price: '850.000đ', duration: '120 phút' },
    { id: 's4', name: 'Vệ Sinh Khoang Máy Hơi Nước Nóng', price: '300.000đ', duration: '45 phút' },
  ];

  const branches = [
    { id: 'b1', name: 'Chi nhánh Quận 1 - 123 Nguyễn Trãi' },
    { id: 'b2', name: 'Chi nhánh Quận 7 - 456 Nguyễn Thị Thập' },
    { id: 'b3', name: 'Chi nhánh Thủ Đức - 789 Võ Văn Ngân' },
  ];

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30'];

  const handleBooking = () => {
    const ref = 'BK-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setBookedSuccess(true);
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
                Mã lịch hẹn của bạn là <Text style={styles.refCode}>{bookingRef}</Text>. Nhân viên sẽ liên hệ xác nhận trong ít phút.
              </Text>

              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Chi nhánh:</Text>
                  <Text style={styles.detailValue}>{branches.find(b => b.id === selectedBranch)?.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Khung giờ:</Text>
                  <Text style={styles.detailValue}>{selectedTimeSlot} Hôm nay</Text>
                </View>
                <View style={[styles.detailRow, { borderBottomWidth: 0, paddingTop: 8 }]}>
                  <Text style={styles.detailLabel}>Dịch vụ:</Text>
                  <Text style={styles.serviceValue}>{services.find(s => s.id === selectedService)?.name}</Text>
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
              {/* Step 1: Select Service */}
              <View style={styles.stepCard}>
                <Text style={styles.stepTitle}>1. Chọn Dịch Vụ Chăm Sóc</Text>
                {services.map((svc) => (
                  <TouchableOpacity
                    key={svc.id}
                    onPress={() => setSelectedService(svc.id)}
                    style={[
                      styles.serviceItem,
                      selectedService === svc.id ? styles.itemSelected : styles.itemDefault
                    ]}
                  >
                    <View style={styles.serviceItemLeft}>
                      <Car color={selectedService === svc.id ? '#f97316' : '#64748b'} size={20} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.serviceName}>{svc.name}</Text>
                        <Text style={styles.serviceDuration}>Thời gian: {svc.duration}</Text>
                      </View>
                    </View>
                    <Text style={styles.servicePrice}>{svc.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Step 2: Select Branch */}
              <View style={styles.stepCard}>
                <Text style={styles.stepTitle}>2. Chọn Chi Nhánh</Text>
                {branches.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setSelectedBranch(b.id)}
                    style={[
                      styles.branchItem,
                      selectedBranch === b.id ? styles.itemSelected : styles.itemDefault
                    ]}
                  >
                    <Text style={styles.branchName}>{b.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Step 3: Time Slot */}
              <View style={[styles.stepCard, { marginBottom: 24 }]}>
                <Text style={styles.stepTitle}>3. Chọn Khung Giờ</Text>
                <View style={styles.timeGrid}>
                  {timeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => setSelectedTimeSlot(slot)}
                      style={[
                        styles.timeSlot,
                        selectedTimeSlot === slot ? styles.timeSelected : styles.timeDefault
                      ]}
                    >
                      <Text style={[
                        styles.timeText,
                        selectedTimeSlot === slot ? { color: '#fff' } : { color: '#334155' }
                      ]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity onPress={handleBooking} style={styles.confirmBtn}>
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.gradientConfirm}
                >
                  <Calendar color="white" size={20} />
                  <Text style={styles.confirmText}>Xác Nhận Đặt Lịch Ngay</Text>
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
  branchName: { fontWeight: 'bold', fontSize: 12, color: '#0f172a' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  timeSelected: { backgroundColor: '#f97316', borderColor: '#f97316' },
  timeDefault: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  timeText: { fontWeight: '800', fontSize: 12 },

  confirmBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  gradientConfirm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, gap: 8 },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
