import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, PhoneCall, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function CallToAction() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Big Banner CTA */}
      <View style={styles.bannerContainer}>
        <LinearGradient
          colors={['#fff7ed', '#ffedd5', '#ffedd5']}
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          style={styles.gradient}
        >
          <View style={styles.badge}>
            <Sparkles color="#d97706" size={14} />
            <Text style={styles.badgeText}>Ưu Đãi Đặc Biệt Hôm Nay</Text>
          </View>

          <Text style={styles.titleLine1}>SẴN SÀNG TRẢI NGHIỆM</Text>
          <Text style={styles.titleLine2}>DỊCH VỤ RỬA XE ĐẲNG CẤP?</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={() => router.push('/account')}
              style={styles.primaryButton}
            >
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                style={styles.primaryGradient}
              >
                <Calendar color="white" size={18} />
                <Text style={styles.primaryText}>Đăng ký Ngay Trong 30s</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <PhoneCall color="#f97316" size={16} />
              <Text style={styles.secondaryText}>Hotline Tư Vấn: 1900 6868</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  bannerContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fed7aa',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  badgeText: {
    color: '#ea580c',
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  titleLine1: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
  },
  titleLine2: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ea580c',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryText: {
    color: '#1e293b',
    fontWeight: '900',
    fontSize: 12,
  },
});
