import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Crown, Check } from 'lucide-react-native';
import { mockTiers } from '../../mock/homeData';

export default function Tiers() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Tích Điểm Tự Động</Text>
        </View>

        <Text style={styles.title}>HẠNG THẺ THÀNH VIÊN</Text>
        <Text style={styles.description}>
          Chi tiêu nhận điểm thưởng tích lũy nâng hạng thẻ và hưởng quyền lợi đặc biệt.
        </Text>
      </View>

      {/* Tiers List */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockTiers.map((tier) => (
          <View key={tier.id} style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <Crown color="#d97706" size={20} />
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsBadgeText}>
                    Từ {tier.minPoints.toLocaleString('vi-VN')} điểm
                  </Text>
                </View>
              </View>

              <Text style={styles.tierName}>{tier.name}</Text>
              <Text style={styles.tierBonus}>
                {tier.discountPercent > 0 ? `Giảm ngay ${tier.discountPercent}%` : `Hệ số ${tier.pointMultiplier}`}
              </Text>

              <View style={styles.benefitsList}>
                {tier.benefits.map((benefit, idx) => (
                  <View key={idx} style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <Check color="#f97316" size={10} />
                    </View>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
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
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
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
  description: {
    color: '#64748b',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    width: 270,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'space-between',
    marginRight: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  pointsBadgeText: {
    color: '#92400e',
    fontWeight: '900',
    fontSize: 12,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  tierBonus: {
    color: '#ea580c',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 12,
  },
  benefitsList: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    color: '#475569',
    fontWeight: '500',
    fontSize: 12,
    flex: 1,
  },
});
