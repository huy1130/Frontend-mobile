import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Check, Star, Sparkles, Clock, Calendar } from 'lucide-react-native';
import { mockComboPackages } from '../../mock/homeData';
import { LinearGradient } from 'expo-linear-gradient';

export default function ComboPackages() {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Tiết Kiệm Lên Đến 30%</Text>
        </View>
        
        <Text style={styles.title}>GÓI COMBO CHĂM SÓC</Text>
        <Text style={styles.subtitle}>ĐƯỢC YÊU THÍCH NHẤT</Text>
        <Text style={styles.description}>
          Giải pháp chăm sóc toàn diện với chi phí tối ưu nhất cho xe của bạn.
        </Text>
      </View>

      {/* Horizontal Cards Scroll */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockComboPackages.map((combo) => (
          <View 
            key={combo.id}
            style={[
              styles.card,
              combo.isBestSeller ? styles.cardBestSeller : styles.cardStandard
            ]}
          >
            {/* Top Badge & Save Badge */}
            <View>
              <View style={styles.cardHeader}>
                {combo.isBestSeller ? (
                  <View style={styles.badgeHot}>
                    <Sparkles color="white" size={12} />
                    <Text style={styles.badgeHotText}>Hot nhất</Text>
                  </View>
                ) : (
                  <View style={styles.badgeStandard}>
                    <Text style={styles.badgeStandardText}>Tiêu chuẩn</Text>
                  </View>
                )}

                {combo.saveBadge ? (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>{combo.saveBadge}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.cardTitle}>{combo.name}</Text>
              <Text style={styles.cardTagline}>{combo.tagline}</Text>

              <View style={styles.durationBox}>
                <Clock color="#f97316" size={14} />
                <Text style={styles.durationText}>Thời gian: {combo.durationMinutes} phút</Text>
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                {combo.servicesIncluded.map((feat, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Check color="#f97316" size={10} />
                    </View>
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Price & Action */}
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Giá ưu đãi gói</Text>
              <View style={styles.priceBox}>
                <Text style={styles.discountPrice}>{combo.discountedPrice.toLocaleString('vi-VN')}đ</Text>
                {combo.originalPrice && (
                  <Text style={styles.originalPrice}>{combo.originalPrice.toLocaleString('vi-VN')}đ</Text>
                )}
              </View>

              <TouchableOpacity style={styles.ctaButton}>
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Calendar color="white" size={14} />
                  <Text style={styles.ctaText}>Đăng ký ngay</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#ea580c',
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ea580c',
    marginBottom: 8,
  },
  description: {
    color: '#64748b',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: 290,
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    justifyContent: 'space-between',
    marginRight: 16, // replacement for gap if needed, but gap is supported in RN ScrollView contentContainerStyle
  },
  cardStandard: {
    borderColor: '#e2e8f0',
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  cardBestSeller: {
    borderColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeHot: {
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeHotText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  badgeStandard: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeStandardText: {
    color: '#475569',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  saveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  saveBadgeText: {
    color: '#92400e',
    fontWeight: '900',
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardTagline: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 12,
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  durationText: {
    color: '#475569',
    fontSize: 12,
  },
  featuresList: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  featureIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: '#334155',
    fontWeight: '500',
    fontSize: 12,
    flex: 1,
  },
  priceSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  discountPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ea580c',
  },
  originalPrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  ctaGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
});
