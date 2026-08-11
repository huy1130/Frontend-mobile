import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Lock, ArrowRight, ShieldCheck, LogOut, Award, CalendarDays, History, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function AccountScreen() {
  const { isLoggedIn, user, isLoading, login, logout, refreshLoyalty } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isRegisterMode, setIsRegisterMode] = useState(params?.mode === 'register');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [account, setAccount] = useState(''); // Not used in API directly right now
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại và mật khẩu');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authService.login(phone, password);
      if (response && response.token) {
        await login(phone, response.token, response.fullName, response.role);
        // Direct to home immediately
        router.replace('/');
      } else {
        Alert.alert('Lỗi', 'Không nhận được token từ máy chủ.');
      }
    } catch (error: any) {
      console.log('Login Error:', error.response?.data || error.message);
      Alert.alert('Đăng nhập thất bại', error.response?.data?.message || JSON.stringify(error.response?.data) || 'Sai thông tin đăng nhập');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!phone || !name || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authService.register(phone, name, password);
      // Đăng ký xong, đăng nhập luôn bằng chính sđt và pass đó
      const loginRes = await authService.login(phone, password);
      if (loginRes && loginRes.token) {
        await login(phone, loginRes.token, loginRes.fullName, loginRes.role);
        Alert.alert('Thành công', 'Đăng ký và đăng nhập thành công!', [
          { text: 'OK', onPress: () => router.replace('/') }
        ]);
      } else {
        Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', [
          { text: 'OK', onPress: () => setIsRegisterMode(false) }
        ]);
      }
    } catch (error: any) {
      console.log('Register Error:', error.response?.data || error.message);
      Alert.alert('Đăng ký thất bại', error.response?.data?.message || JSON.stringify(error.response?.data) || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (role: string) => {
    if (role === 'admin') {
      setPhone('admin@hybridwash.vn');
      setPassword('Admin@123');
    } else {
      setPhone('0987654321');
      setPassword('Customer@123');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {isLoggedIn && user ? (
              /* ================= CUSTOMER PROFILE VIEW ================= */
              <View style={styles.cardWrapper}>
                <View style={styles.headerBox}>
                  <Image source={require('../../assets/images/logo-wash.png')} style={styles.logoImage} />
                  <Text style={styles.headerTitle}>Hồ Sơ Khách Hàng</Text>
                  <Text style={styles.headerSubtitle}>Quản lý thông tin và ưu đãi thành viên</Text>
                </View>

                <View style={styles.mainCard}>
                  {/* User Header Badge */}
                  <View style={styles.userBadgeRow}>
                    <View style={styles.avatarBox}>
                      <User color="#f97316" size={28} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <View style={styles.phoneRow}>
                        <Phone color="#64748b" size={13} />
                        <Text style={styles.userPhone}>{user.phone}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Loyalty Tier & Points */}
                  <View style={styles.loyaltyBox}>
                    <View style={styles.loyaltyLeft}>
                      <View style={styles.loyaltyIconBox}>
                        <Award color="#d97706" size={20} />
                      </View>
                      <View>
                        <Text style={styles.loyaltyLabel}>Hạng thành viên</Text>
                        <Text style={styles.tierText}>{user.tier}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.loyaltyLabel}>Điểm tích lũy</Text>
                      <Text style={styles.pointsText}>{user.points} điểm</Text>
                    </View>
                  </View>

                  {/* Quick Action Navigation Buttons */}
                  <View style={styles.actionNavBox}>
                    <TouchableOpacity
                      onPress={() => router.push('/booking')}
                      style={styles.btnBooking}
                    >
                      <View style={styles.btnNavLeft}>
                        <CalendarDays color="white" size={18} />
                        <Text style={styles.btnBookingText}>Đặt Lịch Ngay</Text>
                      </View>
                      <ArrowRight color="white" size={16} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => router.push('/history')}
                      style={styles.btnHistory}
                    >
                      <View style={styles.btnNavLeft}>
                        <History color="#334155" size={18} />
                        <Text style={styles.btnHistoryText}>Xem Lịch Sử Đặt Lịch</Text>
                      </View>
                      <ArrowRight color="#334155" size={16} />
                    </TouchableOpacity>
                  </View>

                  {/* Logout Button */}
                  <TouchableOpacity onPress={logout} style={styles.btnLogout}>
                    <LogOut color="#e11d48" size={18} />
                    <Text style={styles.btnLogoutText}>Đăng Xuất Tài Khoản</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ================= AUTH FORM VIEW ================= */
              <View style={styles.cardWrapper}>
                {/* Logo & Header */}
                <View style={styles.headerBox}>
                  <Image source={require('../../assets/images/logo-wash.png')} style={styles.logoImage} />
                  <Text style={styles.headerTitle}>
                    {isRegisterMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Khách Hàng'}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {isRegisterMode
                      ? 'Tạo tài khoản để đặt lịch và tích điểm thành viên'
                      : 'Nhập thông tin để quản lý lịch rửa xe & tích điểm'}
                  </Text>
                </View>

                {/* Mode Switcher Tabs */}
                <View style={styles.switchTabs}>
                  <TouchableOpacity
                    onPress={() => setIsRegisterMode(false)}
                    style={[styles.switchTab, !isRegisterMode && styles.switchTabActive]}
                  >
                    <Text style={[styles.switchTabText, !isRegisterMode && styles.switchTabTextActive]}>
                      Đăng Nhập
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsRegisterMode(true)}
                    style={[styles.switchTab, isRegisterMode && styles.switchTabActive]}
                  >
                    <Text style={[styles.switchTabText, isRegisterMode && styles.switchTabTextActive]}>
                      Đăng Ký
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Form Card */}
                <View style={styles.mainCard}>
                  {isRegisterMode ? (
                    <>

                      <View style={styles.fieldBox}>
                        <Text style={styles.fieldLabel}>Họ và tên</Text>
                        <View style={styles.inputWrapper}>
                          <User color="#f97316" size={18} style={styles.inputIcon} />
                          <TextInput
                            placeholder="Nhập họ và tên của bạn"
                            placeholderTextColor="#94a3b8"
                            value={name}
                            onChangeText={setName}
                            style={styles.textInput}
                          />
                        </View>
                      </View>
                      <View style={styles.fieldBox}>
                        <Text style={styles.fieldLabel}>Số điện thoại</Text>
                        <View style={styles.inputWrapper}>
                          <Phone color="#f97316" size={18} style={styles.inputIcon} />
                          <TextInput
                            placeholder="Nhập số điện thoại"
                            placeholderTextColor="#94a3b8"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            style={styles.textInput}
                          />
                        </View>
                      </View>
                      <View style={styles.fieldBox}>
                        <Text style={styles.fieldLabel}>Mật khẩu</Text>
                        <View style={styles.inputWrapper}>
                          <Lock color="#f97316" size={18} style={styles.inputIcon} />
                          <TextInput
                            placeholder="Nhập mật khẩu"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            style={styles.textInput}
                          />
                        </View>
                      </View>

                      <TouchableOpacity onPress={handleRegister} style={styles.btnSubmit} disabled={isSubmitting}>
                        <LinearGradient
                          colors={['#f97316', '#ea580c']}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={styles.gradientSubmit}
                        >
                          {isSubmitting ? (
                            <ActivityIndicator color="white" />
                          ) : (
                            <>
                              <Text style={styles.btnSubmitText}>Đăng Ký Ngay</Text>
                              <ArrowRight color="white" size={18} />
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <View style={styles.securityBadge}>
                        <ShieldCheck color="#10b981" size={15} />
                        <Text style={styles.securityText}>Thông tin của bạn được bảo mật an toàn tuyệt đối</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.fieldBox}>
                        <Text style={styles.fieldLabel}>Số Điện Thoại / Tài Khoản</Text>
                        <View style={[styles.inputWrapper, { height: 56 }]}>
                          <User color="#f97316" size={20} style={styles.inputIcon} />
                          <TextInput
                            placeholder="Nhập số điện thoại của bạn"
                            placeholderTextColor="#94a3b8"
                            value={phone}
                            onChangeText={setPhone}
                            style={styles.textInput}
                            autoCapitalize="none"
                          />
                        </View>
                      </View>
                      <View style={styles.fieldBox}>
                        <Text style={styles.fieldLabel}>Mật Khẩu</Text>
                        <View style={[styles.inputWrapper, { height: 56 }]}>
                          <Lock color="#f97316" size={20} style={styles.inputIcon} />
                          <TextInput
                            placeholder="Nhập mật khẩu"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            style={styles.textInput}
                          />
                        </View>
                      </View>

                      <TouchableOpacity onPress={handleLogin} style={styles.btnSubmit} disabled={isSubmitting}>
                        <LinearGradient
                          colors={['#f97316', '#ea580c']}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                          style={[styles.gradientSubmit, { height: 56 }]}
                        >
                          {isSubmitting ? (
                            <ActivityIndicator color="white" />
                          ) : (
                            <Text style={styles.btnSubmitText}>Đăng Nhập Ngay</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <View style={styles.demoBox}>
                        <Text style={styles.demoText}>Dùng thử nhanh không cần tạo tài khoản:</Text>
                        <View style={styles.demoRow}>
                          <TouchableOpacity onPress={() => fillDemoAccount('Khách Hàng Mới')} style={styles.demoBtnCustomer}>
                            <Text style={styles.demoBtnCustomerText}>Tài khoản Demo KH</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => fillDemoAccount('admin')} style={styles.demoBtnAdmin}>
                            <Text style={styles.demoBtnAdminText}>Tài khoản Admin</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 },
  cardWrapper: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  
  headerBox: { alignItems: 'center', marginBottom: 20 },
  logoImage: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4, textAlign: 'center' },
  headerSubtitle: { color: '#64748b', fontSize: 12, textAlign: 'center', fontWeight: '500' },
  
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5,
  },
  
  // Profile styles
  userBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 20, marginBottom: 20 },
  avatarBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff7ed', borderWidth: 2, borderColor: '#f97316', alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userPhone: { color: '#475569', fontSize: 12, fontWeight: '500' },
  loyaltyBox: { backgroundColor: 'rgba(255, 237, 213, 0.6)', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  loyaltyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  loyaltyIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(245, 158, 11, 0.2)', borderWidth: 1, borderColor: '#fcd34d', alignItems: 'center', justifyContent: 'center' },
  loyaltyLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  tierText: { color: '#b45309', fontWeight: '800', fontSize: 14 },
  pointsText: { color: '#ea580c', fontWeight: '800', fontSize: 16 },
  actionNavBox: { marginBottom: 12 },
  btnBooking: { backgroundColor: '#f97316', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  btnNavLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnBookingText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  btnHistory: { backgroundColor: '#f1f5f9', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  btnHistoryText: { color: '#1e293b', fontWeight: 'bold', fontSize: 12 },
  btnLogout: { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3', borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  btnLogoutText: { color: '#e11d48', fontWeight: 'bold', fontSize: 12 },

  // Auth form styles
  switchTabs: { backgroundColor: 'rgba(226, 232, 240, 0.8)', padding: 4, borderRadius: 16, flexDirection: 'row', marginBottom: 16 },
  switchTab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  switchTabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 },
  switchTabText: { fontWeight: 'bold', fontSize: 12, color: '#475569' },
  switchTabTextActive: { color: '#ea580c' },
  
  fieldBox: { marginBottom: 16 },
  fieldLabel: { color: '#334155', fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0', height: 50 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: '#0f172a', fontWeight: '500', fontSize: 14, height: '100%' },
  
  btnSubmit: { width: '100%', alignSelf: 'center', borderRadius: 9999, overflow: 'hidden', marginTop: 8, marginBottom: 16, shadowColor: '#ea580c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  gradientSubmit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, gap: 8 },
  btnSubmitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  
  securityBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 8 },
  securityText: { color: '#94a3b8', fontWeight: '500', fontSize: 11 },
  
  demoBox: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 16 },
  demoText: { color: '#94a3b8', fontSize: 11, textAlign: 'center', marginBottom: 8 },
  demoRow: { flexDirection: 'row', gap: 8 },
  demoBtnCustomer: { flex: 1, paddingVertical: 10, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 12, alignItems: 'center' },
  demoBtnCustomerText: { color: '#ea580c', fontWeight: 'bold', fontSize: 12 },
  demoBtnAdmin: { flex: 1, paddingVertical: 10, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, alignItems: 'center' },
  demoBtnAdminText: { color: '#334155', fontWeight: 'bold', fontSize: 12 },
});
