import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, User, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Common Components
import Logo from '../../components/common/Logo';

// Home Components
import HowItWorks from '../../components/home/HowItWorks';
import ComboPackages from '../../components/home/ComboPackages';
import PublicPromotions from '../../components/home/PublicPromotions';
import IndividualServices from '../../components/home/IndividualServices';
import Branches from '../../components/home/Branches';
import Tiers from '../../components/home/Tiers';
import CallToAction from '../../components/home/CallToAction';

export default function HomeScreen() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top Header Bar with Orange Gradient */}
      <LinearGradient
        colors={['#ffffff', '#f97316', '#ea580c']}
        locations={[0, 0.35, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Logo size="md" />
            {isLoggedIn && user ? (
              <TouchableOpacity
                onPress={() => router.push('/account')}
                style={styles.userButton}
              >
                <View style={styles.userIconBox}>
                  <User color="#ea580c" size={14} />
                </View>
                <Text style={styles.userName}>{user?.name?.split(' ').pop() || ''}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/account')}
                style={styles.loginButton}
              >
                <Calendar color="#ea580c" size={16} />
                <Text style={styles.loginText}>Đăng ký ngay</Text>
                <ChevronRight color="#ea580c" size={14} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/images/hero_banner_bg.png')}
            style={styles.heroBgImage}
            resizeMode="cover"
          />
          {/* Gradient/Dark Overlay */}
          <View style={styles.heroOverlay} />

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              HYBRID WASH - HỆ THỐNG RỬA XE{'\n'}
              & CHĂM SÓC XE{'\n'}
              HÀNG ĐẦU VIỆT NAM
            </Text>
            <Text style={styles.heroSubtitle}>
              Quy trình rửa xe & chăm sóc xe ô tô đúng cách hàng đầu tại TPHCM
            </Text>

            {/* Quick Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>15,400+</Text>
                <Text style={styles.statLabel}>Khách Hàng</Text>
              </View>
              <View style={[styles.statItem, styles.statBorder]}>
                <Text style={styles.statValue}>8+</Text>
                <Text style={styles.statLabel}>Chi Nhánh</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>48,900+</Text>
                <Text style={styles.statLabel}>Lượt Đặt Lịch</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                onPress={() => router.push('/booking')}
                style={styles.bookButton}
              >
                <Text style={styles.bookText}>Đặt Lịch Ngay</Text>
                <Calendar color="white" size={16} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/account')}
                style={styles.outlineButton}
              >
                <Text style={styles.outlineText}>Tài Khoản KH</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Content Sections */}
        <View style={styles.mainContent}>
          <HowItWorks />
          <ComboPackages />
          <PublicPromotions />
          <IndividualServices />
          <Branches />
          <Tiers />
          <CallToAction />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  headerGradient: {
    width: '100%',
    zIndex: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(249,115,22,0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  userButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ffedd5', // orange-100
  },
  loginText: {
    color: '#ea580c',
    fontWeight: '800',
    fontSize: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroSection: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 400,
    justifyContent: 'center',
  },
  heroBgImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  heroContent: {
    position: 'relative',
    zIndex: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: 24,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 24,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  outlineButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  mainContent: {
    backgroundColor: '#f8fafc',
  },
});
